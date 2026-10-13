/* e2e.js — 핸드오프 8번 완료 기준 5·6·8번 검사 (Playwright, 사전 설치 Chromium). 실행: node tests/e2e.js [URL] [스크린샷 폴더] */
const fs = require('fs');
const path = require('path');
function loadPlaywright() {
  const cands = ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright', '/opt/node-tools/node_modules/playwright',
    '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'];
  for (const c of cands) { try { return require(c); } catch (e) { /* 다음 */ } }
  throw new Error('playwright 모듈을 못 찾음');
}
const URL_ = process.argv[2] || 'http://localhost:8765/index.html';
const OUT = process.argv[3] || '/tmp/napoleon-shots';
fs.mkdirSync(OUT, { recursive: true });
const CORRECT = ['estates', 'tennis', 'bastille', 'rights', 'war', 'terror', 'coup'];
let fails = 0;
function ok(cond, msg) { console.log((cond ? '[PASS] ' : '[FAIL] ') + msg); if (!cond) fails++; }

async function orderOf(page) { return page.$$eval('#orderList .order-card', els => els.map(e => e.dataset.id)); }
/* 버튼(▲▼)만으로 목표 순서를 만든다 */
async function arrange(page, target) {
  for (let i = 0; i < target.length; i++) {
    let cur = await orderOf(page);
    let from = cur.indexOf(target[i]);
    while (from > i) {
      await page.click(`#orderList [data-id="${target[i]}"] .move-up`);
      from--;
    }
  }
}
function swapAdj(arr, k) { const a = arr.slice(); [a[k], a[k + 1]] = [a[k + 1], a[k]]; return a; }

(async () => {
  const { chromium } = loadPlaywright();
  const exe = process.env.PWTEST_CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  for (const width of [360, 768]) {
    console.log('\n===== 폭 ' + width + ' =====');
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(URL_);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // 시작 → 복습
    // 학번·이름: 비우면 막힘 → 입력 후 시작
    await page.click('text=시작하기');
    ok(await page.isVisible('#sidErr'), '시작: 학번 비어 있으면 막힘');
    await page.fill('#sid', '20a1');
    ok(await page.inputValue('#sid') === '201', '학번에는 숫자만 들어감');
    await page.fill('#sid', '20512');
    await page.click('text=시작하기');
    ok(await page.isVisible('#nameErr'), '시작: 이름 비어 있으면 막힘');
    await page.fill('#sname', '테스트');
    await page.click('text=시작하기');
    ok(await page.$('#orderList') !== null, '복습 화면 진입');
    const start = await orderOf(page);
    ok(start.join() !== CORRECT.join(), '섞인 순서에서 시작: ' + start.join());
    const bodyText = await page.innerText('#orderList');
    ok(!/1789|1792|1799/.test(bodyText), '복습 카드에 날짜 문자열 없음');

    // (b) 이웃한 두 카드만 바꾼 오답 6가지
    const clues = await page.evaluate(() => PAIR_CLUES);
    for (let k = 0; k < 6; k++) {
      await arrange(page, swapAdj(CORRECT, k));
      await page.click('#checkBtn');
      const fb = await page.innerText('#reviewFeedback');
      ok(fb.includes(clues[k]), `오답 k=${k}: PAIR_CLUES[${k}] 표시`);
      ok(fb.includes('5개가 제자리에 있어요'), `오답 k=${k}: 5개가 제자리에 있어요 (이웃 교환이므로 5)`);
      const clueCount = clues.filter(c => fb.includes(c)).length;
      ok(clueCount === 1, `오답 k=${k}: 단서 하나만`);
      const wrongN = await page.$$eval('#orderList [data-state="wrong"]', e => e.length);
      ok(wrongN === 2, `오답 k=${k}: 다른 자리 카드 2장`);
    }
    // 뒤집힌 쌍이 둘 이상 → 가장 작은 k
    {
      const t = swapAdj(swapAdj(CORRECT, 4), 1); // k=1과 k=4가 뒤집힘
      await arrange(page, t);
      await page.click('#checkBtn');
      const fb = await page.innerText('#reviewFeedback');
      ok(fb.includes(clues[1]) && !fb.includes(clues[4]), '쌍 둘 이상: 가장 작은 k(1)의 단서');
    }
    // 정답 순서·정답 카드 노출 없음: 피드백에 사건 이름 나열이 없어야 함
    const fbText = await page.innerText('#reviewFeedback');
    ok(!/삼부회 소집.*테니스코트/s.test(fbText), '피드백에 정답 순서 없음');
    // 이동하면 낡은 표시가 지워짐
    await page.click('#orderList .order-card:first-child .move-down');
    ok((await page.$$eval('#orderList [data-state]', e => e.length)) === 0, '카드를 옮기면 결과 표시 지워짐');
    await page.screenshot({ path: path.join(OUT, `review_wrong_${width}.png`), fullPage: true });
    await arrange(page, swapAdj(CORRECT, 4)); await page.click('#checkBtn');
    await page.screenshot({ path: path.join(OUT, `review_wrong_${width}.png`), fullPage: true });

    // 드래그로 정답 만들기 (SortableJS) — 한 카드를 끌어서 옮긴 뒤 버튼으로 마무리
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => window.scrollTo(0, document.querySelector('#orderList').getBoundingClientRect().top + window.scrollY - 230));
    const before = await orderOf(page);
    const src = page.locator('#orderList .order-card').nth(0).locator('.drag-handle');
    const dst = page.locator('#orderList .order-card').nth(2);
    const sb = await src.boundingBox(), db = await dst.boundingBox();
    await page.mouse.move(sb.x + 10, sb.y + 10);
    await page.mouse.down();
    for (let i = 1; i <= 30; i++) { await page.mouse.move(sb.x + 10, sb.y + 10 + (db.y + db.height / 2 - sb.y) * i / 30); await page.waitForTimeout(20); }
    await page.mouse.up();
    await page.waitForTimeout(300);
    const after = await orderOf(page);
    ok(after.join() !== before.join(), '드래그로 순서가 바뀜: ' + before.join() + ' → ' + after.join());
    ok(JSON.parse(await page.evaluate(() => localStorage.getItem(CONFIG.STORE_KEY))).order.join() === after.join(), '드래그 결과가 저장됨');

    await arrange(page, CORRECT);
    await page.click('#checkBtn');
    ok(await page.$('.timeline') !== null, '정답 → 연표 화면');
    const tl = await page.innerText('.timeline');
    ok(tl.includes('1789.6') && tl.includes('1799.11') && tl.includes('1792.4'), '연표 날짜 칩 표시');
    ok(!tl.includes('인권 선언 발표\n1789') , '인권 선언·공포 정치 날짜 없음(칩 없음)');
    const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem(CONFIG.STORE_KEY)).attempts);
    console.log('  시도 횟수(기록): ' + attempts);
    await page.click('text=자료 읽으러 가기');

    // 자료 1 — (c) 필수 칸 비었을 때 막힘
    ok((await page.innerText('h2')).startsWith('자료 1.'), '자료 1 화면');
    await page.click('text=다음 자료로');
    ok(await page.isVisible('#errView'), '자료 1: 고르기 비어 있으면 막힘');
    await page.check('input[name="viewA"][value="좋게 본다"]');
    await page.click('text=다음 자료로');
    ok(await page.isVisible('#errQuote'), '자료 1: 말 찾기 비어 있으면 막힘');
    ok(await page.$('input[name="viewA"]:checked') !== null, '자료 1: 기본 선택값 없었음(직접 고른 뒤 선택됨)');
    await page.fill('textarea[aria-label^="그렇게 읽은 말"]', '합법적인 권리로 높은 권력에 부름받은 시민');
    await page.click('text=다음 자료로');

    // 자료 2
    ok((await page.innerText('h2')).startsWith('자료 2.'), '자료 2 화면');
    ok((await page.innerText('#screen .eyebrow')).includes('자료 2/2'), '진행 표시 자료 2/2');
    await page.click('text=평가하러 가기');
    ok(await page.isVisible('#errViewD'), '자료 2: 고르기 막힘');
    await page.check('input[name="viewD"][value="나쁘게 본다"]');
    await page.click('text=평가하러 가기');
    ok(await page.isVisible('#errDiff'), '자료 2: 비교 칸 막힘');
    await page.screenshot({ path: path.join(OUT, `source2_${width}.png`), fullPage: true });
    await page.fill('textarea[aria-label^="자료 1과 자료 2가"]', '자료 1은 합법적인 권리라고 했고 자료 2는 헌법을 노골적으로 어겼다고 했다.');
    await page.click('text=평가하러 가기');

    // 판단
    ok(await page.$('#errJudge') !== null && (await page.innerText('h2')).includes('쿠데타 평가하기'), '판단 화면');
    ok(await page.$('.info-card') === null, '추가 정보 카드는 판단·근거 저장 전 DOM에 없음(판단 화면)');
    await page.click('text=근거 고르러 가기');
    ok(await page.isVisible('#errJudge'), '판단: 선택 막힘');
    await page.check('input[name="judge"][value="C"]');
    await page.click('text=근거 고르러 가기');
    ok(await page.isVisible('#errReason'), '판단: 이유 막힘');
    await page.fill('textarea[aria-label^="그렇게 고른 이유"]', '두 자료가 서로 반대로 말해서 정하기 어렵다.');
    await page.click('text=근거 고르러 가기');

    // 근거 — (d) 3번째 칩 토스트
    ok(await page.$('.info-card') === null, '추가 정보 카드는 근거 저장 전 DOM에 없음(근거 화면)');
    await page.click('text=정보 더 보기');
    ok(await page.isVisible('#errChip'), '근거: 칩 비어 있으면 막힘');
    const boxes = page.locator('input[name="chip"]');
    await boxes.nth(0).check({ force: true }); await boxes.nth(1).check({ force: true });
    await boxes.nth(2).check({ force: true }).catch(() => {});
    await page.waitForTimeout(150);
    ok((await page.innerText('#toast')).includes('2개까지만 고를 수 있어요'), '칩 3번째 선택 시 토스트');
    ok(await page.locator('input[name="chip"]:checked').count() === 2, '칩은 2개까지만 선택');
    await boxes.nth(1).uncheck({ force: true });
    await boxes.nth(3).check({ force: true });
    await page.click('text=정보 더 보기');
    ok(await page.isVisible('#errWhy'), '근거: 이유 막힘');
    await page.fill('textarea[aria-label^="고른 자료의 어떤 점"]', '쓴 사람과 쓴 때가 달라서 입장이 갈렸다.');
    await page.screenshot({ path: path.join(OUT, `evidence_${width}.png`), fullPage: true });
    await page.click('text=정보 더 보기');

    // 추가 정보
    ok(await page.$$eval('.info-card', e => e.length) === 2, '추가 정보 카드 2장');
    await page.click('button:has-text("마무리로")');
    ok(await page.isVisible('#errRe'), '추가 정보: 재판단 막힘');
    await page.check('input[name="re"][value="tweak"]');

    // (e) 새로고침 복원 — 추가 정보 화면에서
    await page.reload();
    ok(await page.$$eval('.info-card', e => e.length) === 2 && await page.isChecked('input[name="re"][value="tweak"]'), '새로고침 후 화면·입력 복원');
    await page.click('button:has-text("마무리로")');

    // 마무리
    ok((await page.innerText('h2')).includes('내 글 확인하고 복사하기'), '마무리 화면');
    await page.screenshot({ path: path.join(OUT, `summary_${width}.png`), fullPage: true });
    ok(await page.isEnabled('#copyBtn'), '복사 버튼 활성');
    // (f) 이 화면으로 → 고치고 → 마무리로
    await page.click('[data-go-step="judge"]');
    ok((await page.innerText('h2')).includes('쿠데타 평가하기'), '이 화면으로: 판단 화면');
    await page.fill('textarea[aria-label^="그렇게 고른 이유"]', '고친 이유 한 문장.');
    await page.click('button:has-text("마무리로")');
    ok((await page.innerText('h2')).includes('내 글 확인하고 복사하기') && (await page.innerText('.recap >> nth=3')).includes('고친 이유 한 문장.'), '고친 뒤 다시 마무리로 돌아옴');

    // (g) 복사 문자열
    const copied = await page.evaluate(() => buildCopyText());
    const expected = [
      '[복습] 순서 맞추기 ' + (await page.evaluate(() => state.attempts)) + '번 만에 완성',
      '[자료 1] 쿠데타를 보는 눈: 좋게 본다 / 그렇게 읽은 말: 합법적인 권리로 높은 권력에 부름받은 시민',
      '[자료 2] 쿠데타를 보는 눈: 나쁘게 본다 / 두 자료의 다른 점: 자료 1은 합법적인 권리라고 했고 자료 2는 헌법을 노골적으로 어겼다고 했다.',
      '[평가] 판단: 지금 자료로는 한쪽으로 정하기 어렵다 / 이유: 고친 이유 한 문장.',
      '[근거] 자료 1 · 글쓴이가 본 일, 자료 2 · 단검 이야기 / 쓴 사람과 쓴 때가 달라서 입장이 갈렸다.',
      '[정보 뒤] 조금 고쳤다'
    ].join('\n');
    ok(copied === expected, '복사 문자열이 5-5 형식과 일치');
    if (copied !== expected) { console.log(copied); console.log('---'); console.log(expected); }

    // 제출: 백엔드 응답을 가짜로 대신하고 body를 확인한다
    let posted = null;
    await page.route('**/script.google.com/**', route => { posted = JSON.parse(route.request().postData()); route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'ok' }) }); });
    await page.click('#subBtn');
    await page.waitForTimeout(400);
    ok(posted && posted.studentId === '20512' && posted.studentName === '테스트' && posted.gameName === '나폴레옹_쿠데타평가', '기록하기: 학번·이름·gameName 전송');
    ok(posted && posted.reflection === copied, '기록하기: reflection이 복사 문자열과 같음');
    ok(posted && ['focusLeaveCount', 'focusLeaveSec', 'pasteChars'].every(k => k in posted), '기록하기: FocusGuard payload 포함');
    ok((await page.innerText('#subBtn')) === '다시 기록하기', '기록 성공 뒤 버튼 문구');

    // 처음부터 다시하기(모달)
    await page.click('text=처음부터 다시하기');
    ok(await page.isVisible('.modal'), '앱 내 모달 확인');
    await page.click('.modal >> text=지우기');
    ok((await page.innerText('h1')).includes('나폴레옹의 쿠데타') && await page.evaluate(() => state.reviewDone === false && state.judge === '' && state.sid === '20512'), '처음부터 다시하기: 초기화(학번·이름은 유지)');

    ok(errs.length === 0, '콘솔 에러 0건 ' + (errs.length ? JSON.stringify(errs) : ''));
    await ctx.close();
  }
  // ?sid=&name= 자동채움, ?preview=1
  {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 900 } });
    const page = await ctx.newPage();
    let posts = 0;
    await page.route('**/script.google.com/**', route => { posts++; route.fulfill({ status: 200, contentType: 'application/json', body: '{"result":"ok"}' }); });
    await page.goto(URL_ + '?sid=30512&name=%EC%88%98%EC%A7%84');
    ok(await page.inputValue('#sid') === '30512' && await page.inputValue('#sname') === '수진', '?sid=&name= 자동채움');
    await page.goto(URL_ + '?preview=1');
    ok(await page.isVisible('#previewBanner') && await page.inputValue('#sid') === '20599', '?preview=1: 배너 + 학번·이름 자동채움');
    await page.click('text=시작하기');
    ok(await page.$('#orderList') !== null, '?preview=1: 입력 없이 시작');
    ok(await page.evaluate(() => localStorage.getItem(CONFIG.STORE_KEY)) === null, '?preview=1: 저장하지 않음');
    await page.evaluate(() => { state.reviewDone = true; state.a = { view: 'x', quote: 'x' }; state.d = { view: 'x', diff: 'x', why: '' }; state.judge = 'A'; state.judgeReason = 'x'; state.chips = ['A1']; state.chipWhy = 'x'; state.re = 'keep'; go('summary'); });
    await page.click('#subBtn');
    await page.waitForTimeout(300);
    ok(posts === 0 && (await page.innerText('#toast')).includes('미리보기에서는 저장하지 않아요'), '?preview=1: 서버로 보내지 않음');
    await ctx.close();
  }
  // 복사 뒤 패들렛 버튼
  {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    const setup = () => page.evaluate(() => { state.reviewDone = true; state.a = { view: '좋게 본다', quote: 'q' }; state.d = { view: '나쁘게 본다', diff: 'd', why: '' }; state.judge = 'A'; state.judgeReason = 'r'; state.chips = ['A1']; state.chipWhy = 'w'; state.re = 'keep'; go('summary'); });
    await page.goto(URL_ + '?preview=1&padlet=https%3A%2F%2Fpadlet.com%2Ftest%2Fabc');
    await page.click('text=시작하기'); await setup();
    ok(await page.$('#padBtn') === null, '복사 전에는 패들렛 버튼 없음');
    await page.click('#copyBtn');
    await page.waitForSelector('#padBtn');
    ok(await page.isVisible('#padBtn'), '복사 성공 뒤 패들렛 열기 버튼 노출');
    ok((await page.evaluate(() => navigator.clipboard.readText())).startsWith('[복습]'), '클립보드에 내 글이 들어감');
    await page.evaluate(() => { window.__opened = null; window.open = (u, t, f) => { window.__opened = [u, t, f]; }; });
    await page.click('#padBtn');
    const op = await page.evaluate(() => window.__opened);
    ok(op && op[0] === 'https://padlet.com/test/abc' && op[1] === '_blank' && /noopener/.test(op[2]), '패들렛 열기: padlet.com 주소를 새 창으로');
    await page.goto(URL_ + '?preview=1&padlet=https%3A%2F%2Fevil.example%2Fx');
    await page.click('text=시작하기'); await setup();
    await page.click('#copyBtn');
    await page.waitForSelector('#padAfter:not([hidden])');
    ok(await page.$('#padBtn') === null && (await page.innerText('#padAfter')).includes('포털의 "내 패들렛 열기"'), 'padlet.com이 아닌 주소는 버튼 대신 포털 안내');
    await ctx.close();
  }
  // 낱말 풀이 밑줄
  {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(URL_ + '?preview=1');
    await page.click('text=시작하기');
    await page.evaluate(() => { state.reviewDone = true; state.a = { view: 'x', quote: 'x' }; go('s2'); });
    ok(await page.$$eval('#screen button.term', e => e.length) > 0, '낱말 풀이 밑줄이 그어짐(자료 2 화면)');
    await page.click('#screen button.term:visible >> nth=0');
    ok(await page.isVisible('#glSheet'), '밑줄을 누르면 뜻 시트가 열림');
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? `\n실패 ${fails}건` : '\n전부 통과');
  process.exit(fails ? 1 : 0);
})();
