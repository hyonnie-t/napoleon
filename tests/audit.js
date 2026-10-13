/* audit.js — 핸드오프 8번 6·8번: 모든 화면에서 글자 ≥16px, 조작 요소 높이 ≥44px, 가로 스크롤 없음, 추가 정보 카드 DOM 점검.
   실행: node tests/audit.js [URL] */
const fs = require('fs');
function loadPlaywright() {
  for (const c of ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright', '/opt/node-tools/node_modules/playwright', '/usr/lib/node_modules/playwright']) { try { return require(c); } catch (e) { /* 다음 */ } }
  throw new Error('playwright 없음');
}
const URL_ = process.argv[2] || 'http://localhost:8765/index.html';
const FULL = { step: 'summary', order: ['estates','tennis','bastille','rights','war','terror','coup'], attempts: 2, reviewDone: true, fromSummary: false,
  a: { view: '좋게 본다', quote: '합법적인 권리' }, d: { view: '나쁘게 본다', diff: '합법 대 위헌', why: '' },
  judge: 'C', judgeReason: '정하기 어렵다', chips: ['A2', 'D1'], chipWhy: '쓴 때가 다르다', re: 'keep', reReason: '' };
(async () => {
  const { chromium } = loadPlaywright();
  const exe = process.env.PWTEST_CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  let bad = 0;
  for (const scheme of ['light', 'dark']) for (const width of [360, 768]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
    const page = await ctx.newPage();
    await page.goto(URL_);
    for (const step of ['intro', 'review', 'timeline', 's1', 's2', 'judge', 'evidence', 'extra', 'summary']) {
      await page.evaluate(([s, st]) => { localStorage.setItem(CONFIG.STORE_KEY, JSON.stringify(Object.assign({}, s, { step: st }))); }, [FULL, step]);
      await page.reload();
      // 접힌 details를 모두 열어 안의 글자도 검사
      await page.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
      const r = await page.evaluate(() => {
        const out = { small: [], tap: [], hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth };
        const walker = document.createTreeWalker(document.getElementById('screen'), NodeFilter.SHOW_TEXT);
        let n; while ((n = walker.nextNode())) {
          if (!n.textContent.trim()) continue;
          const el = n.parentElement; const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs < 16) out.small.push(el.tagName + ':' + n.textContent.trim().slice(0, 20) + ' ' + fs);
        }
        document.querySelectorAll('#screen button, #screen input, #screen summary, #screen .choice, #screen .icon-btn').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return;
          if (el.tagName === 'INPUT') return; // 입력창은 바깥 .choice 가 터치 영역
          if (r.height < 44 - 0.5) out.tap.push(el.tagName + ':' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 20) + ' ' + Math.round(r.height));
        });
        return out;
      });
      const bar = await page.evaluate(() => [...document.querySelectorAll('.topbar *')].filter(e => e.children.length === 0 && e.textContent.trim() && parseFloat(getComputedStyle(e).fontSize) < 16).map(e => e.textContent));
      const issues = r.small.length + r.tap.length + bar.length + (r.hscroll ? 1 : 0);
      if (issues) { bad++; console.log(`[FAIL] ${scheme} ${width} ${step}`, JSON.stringify({ small: r.small, tap: r.tap, bar, hscroll: r.hscroll })); }
    }
    await ctx.close();
  }
  console.log(bad ? `위반 화면 ${bad}곳` : '[PASS] 라이트·다크 × 360·768 × 9화면: 글자 16px 미만 0건, 조작 요소 44px 미만 0건, 가로 스크롤 없음');
  await browser.close(); process.exit(bad ? 1 : 0);
})();
