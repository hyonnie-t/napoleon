/* app.js — 나폴레옹의 쿠데타 평가 (화면·상태·복사). 학생 화면 문구의 콘텐츠는 data.js, 설정은 config.js
   화면 흐름: 시작 → 복습(순서 맞추기) → 연표 확인 → 자료 1 → 자료 2 → 판단 → 근거 → 추가 정보·재판단 → 마무리(복사) */

const UI = {
  stepNames: ['복습', '자료 1·2', '평가', '마무리'],
  start: '시작하기', next: '다음', prev: '이전',
  flowTitle: '활동 순서',
  reviewTitle: '프랑스 혁명 사건 순서 맞추기',
  reviewDesc: '사건 카드를 시간 순서대로 놓아 보세요. 카드의 손잡이를 끌거나 위아래 버튼을 눌러 옮길 수 있어요. 카드마다 무슨 일이었는지 볼 수 있어요.',
  whatHappened: '무슨 일이었지?',
  checkOrder: '순서 확인하기', toTimeline: '연표로',
  inPlace: '맞는 자리', notInPlace: '다른 자리',
  placeCount: function (n) { return n + '개가 제자리에 있어요.'; },
  moveUp: function (name) { return name + ' 위로 옮기기'; },
  moveDown: function (name) { return name + ' 아래로 옮기기'; },
  dragHandle: '끌어서 옮기기',
  timelineTitle: '프랑스 혁명과 쿠데타 연표',
  timelineLead: '순서를 모두 맞혔어요. 연표와 교과서 설명을 읽어 보세요.',
  toSources: '자료 읽으러 가기',
  sourceTitle: function (no, title) { return '자료 ' + no + '. ' + title; },
  glossToggle: '용어 풀이',
  hintToggle: '힌트 보기',
  required: '필수', optional: '선택',
  toNextSource: '다음 자료로', toJudge: '평가하러 가기', toEvidence: '근거 고르러 가기', toExtra: '정보 더 보기', toSummary: '마무리로',
  judgeTitle: '쿠데타 평가하기',
  myAnswers: '내가 쓴 것 보기 (자료 1·2)',
  evidenceTitle: '근거를 고르고, 맞서는 말 살펴보기',
  myJudge: '내 판단',
  rereadSources: '자료 다시 보기',
  extraTitle: COMMENTARY.title,
  summaryTitle: '내 글 확인하고 복사하기',
  summaryLead: '쓴 내용을 확인하고, 아래 버튼으로 글을 복사해 패들렛에 올려요.',
  editStep: '이 화면으로',
  copy: '내 글 복사하기', copied: '복사했어요',
  padletOpen: '패들렛 열기', padletNoUrl: '복사했어요. 포털의 "내 패들렛 열기"로 가서 붙여넣어 주세요.', padletCopied: '복사했어요. 패들렛에 붙여넣어 주세요', copyFail: '복사하지 못했어요. 글을 직접 선택해서 복사해 주세요',
  needAll: '모든 필수 칸을 채우면 복사할 수 있어요',
  restart: '처음부터 다시하기',
  restartTitle: '처음부터 다시 할까요?', restartBody: '쓴 내용이 모두 지워져요.', cancel: '취소', erase: '지우기',
  stepTag: { review: '복습 1/2', timeline: '복습 2/2', s1: '자료 1/2', s2: '자료 2/2', judge: '평가 1/3', evidence: '평가 2/3', extra: '평가 3/3', summary: '마무리' },
  readTitle: '읽어 보기', taskTitle: '내 생각 쓰기',
  needChoice: '선택지를 골라 주세요',
  needReason: '이유를 한 문장 적어 주세요',
  needQuote: '글에서 찾은 말을 적어 주세요',
  needDiff: '다르게 말하는 부분을 적어 주세요',
  needChip: '자료를 1개 이상 골라 주세요',
  needCounter: '가장 안 맞는 말을 하나 골라 주세요',
  needCounterWhy: '그 말에 어떻게 답할지 한 문장 적어 주세요',
  counterLabel: '맞서는 말', counterAnsLabel: '그 말에 대한 내 답',
  needRe: '하나를 골라 주세요',
  summaryReview: '복습', summaryA: '자료 1', summaryD: '자료 2', summaryJudge: '평가', summaryEv: '근거', summaryRe: '정보 뒤',
  viewLabel: '쿠데타를 보는 눈', quoteLabel: '그렇게 읽은 말', diffLabel: '두 자료의 다른 점', whyLabel: '이유',
  judgeLabel: '판단', pickedLabel: '고른 자료',
  idTitle: '누구의 기록인지 알려 줘요', sidLabel: '학번 (5자리)', nameLabel: '이름',
  needSid: '학번 5자리를 숫자로 적어 주세요', needName: '이름을 적어 주세요',
  submit: '기록하기', submitAgain: '다시 기록하기', submitting: '기록하는 중', submitted: '기록했어요',
  submitFail: '기록하지 못했어요. 다시 시도해 주세요', submitPreview: '미리보기에서는 저장하지 않아요'
};

const STEPS = ['intro', 'review', 'timeline', 's1', 's2', 'judge', 'evidence', 'extra', 'summary'];
const params = new URLSearchParams(location.search);
const PREVIEW = params.get('preview') === '1';

let state = freshState();

/* ───────── 저장소 (막혀도 앱은 동작. 미리보기에서는 저장하지 않는다) ───────── */
function storeGet() { if (PREVIEW) return null; try { const r = localStorage.getItem(CONFIG.STORE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function storeSet() { if (PREVIEW) return; try { localStorage.setItem(CONFIG.STORE_KEY, JSON.stringify(state)); } catch (e) { /* 무시 */ } }
function storeDel() { try { localStorage.removeItem(CONFIG.STORE_KEY); } catch (e) { /* 무시 */ } }

function shuffledOrder() {
  const ids = CORRECT_ORDER.slice();
  do {
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = ids[i]; ids[i] = ids[j]; ids[j] = t; }
  } while (ids.every(function (id, i) { return id === CORRECT_ORDER[i]; }));
  return ids;
}
function freshState(sid, name) {
  return { sid: sid || '', name: name || '', submitted: false, step: 'intro', order: shuffledOrder(), attempts: 0, reviewDone: false, fromSummary: false,
    a: { view: '', quote: '' }, d: { view: '', diff: '', why: '' },
    judge: '', judgeReason: '', chips: [], chipWhy: '', counter: '', counterWhy: '', re: '', reReason: '' };
}

/* ───────── DOM 도우미 ───────── */
function h(tag, props, kids) {
  const el = document.createElement(tag);
  Object.keys(props || {}).forEach(function (k) {
    const v = props[k];
    if (v === null || v === undefined || v === false) return;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  });
  [].concat(kids || []).forEach(function (c) {
    if (c === null || c === undefined || c === false) return;
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return el;
}
function svg(path, size, width) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 16 16'); s.setAttribute('width', size || 16); s.setAttribute('height', size || 16);
  s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', width || '2');
  s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', path); s.appendChild(p);
  return s;
}
const ICON = {
  check: 'M3 8.5l3.2 3.2L13 4.8', chev: 'M6 3.5l4.5 4.5L6 12.5', info: 'M8 7v4.5M8 4.6v.1',
  up: 'M3.5 10l4.5-4.5 4.5 4.5', down: 'M3.5 6l4.5 4.5L12.5 6', x: 'M4 4l8 8M12 4l-8 8',
  grip: 'M6 3.5h.01M10 3.5h.01M6 8h.01M10 8h.01M6 12.5h.01M10 12.5h.01'
};

let toastTimer = 0;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
}

function oneLine(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
function eventById(id) { return EVENTS.filter(function (e) { return e.id === id; })[0]; }
function sourceByNo(no) { return SOURCES.filter(function (s) { return s.no === no; })[0]; }
function optionText(list, id) { const o = list.filter(function (x) { return x.id === id; })[0]; return o ? o.text : ''; }
function judgeText() { return optionText(JUDGE.options, state.judge); }
function reText() { return optionText(COMMENTARY.reOptions, state.re); }
function chipLabel(pid) {
  for (let i = 0; i < SOURCES.length; i++) {
    const p = SOURCES[i].passages.filter(function (x) { return x.id === pid; })[0];
    if (p) return '자료 ' + SOURCES[i].no + ' · ' + p.label;
  }
  return '';
}
function allPassages() {
  const out = [];
  SOURCES.forEach(function (s) { s.passages.forEach(function (p) { out.push({ src: s, p: p }); }); });
  return out;
}
function isCorrectOrder(order) { return order.every(function (id, i) { return id === CORRECT_ORDER[i]; }); }

/* ───────── 단계별 완료 여부 ───────── */
function s1Ok() { return !!state.a.view && !!state.a.quote.trim(); }
function s2Ok() { return !!state.d.view && !!state.d.diff.trim(); }
function judgeOk() { return !!state.judge && !!state.judgeReason.trim(); }
function evOk() { return state.chips.length >= 1 && !!state.chipWhy.trim() && !!state.counter && state.chips.indexOf(state.counter) < 0 && !!state.counterWhy.trim(); }
function reOk() { return !!state.re; }
function stepDone(step) {
  switch (step) {
    case 'review': return state.reviewDone;
    case 's1': return s1Ok();
    case 's2': return s2Ok();
    case 'judge': return judgeOk();
    case 'evidence': return evOk();
    case 'extra': return reOk();
    default: return true;
  }
}
/* 앞 단계를 마치지 않았으면 그 단계로 돌려보낸다(추가 정보는 판단·근거를 저장한 뒤에만 열린다) */
function gate(step) {
  if (step !== 'intro' && !/^\d{5}$/.test(state.sid)) return 'intro';
  const idx = STEPS.indexOf(step);
  for (let i = 1; i < idx; i++) if (!stepDone(STEPS[i])) return STEPS[i];
  return step;
}
function allDone() { return state.reviewDone && s1Ok() && s2Ok() && judgeOk() && evOk() && reOk(); }

/* ───────── 공통 컴포넌트 ───────── */
function errorEl(id) { return h('p', { class: 'field-error', id: id, role: 'alert', hidden: true }); }
function showError(el, msg, focusEl) {
  el.textContent = msg; el.hidden = false;
  if (focusEl) { focusEl.setAttribute('aria-invalid', 'true'); focusEl.focus(); }
}
function clearError(el, field) { el.hidden = true; if (field) field.removeAttribute('aria-invalid'); }

let uid = 0;
/* 선택지 하나: 입력창이 칸 전체를 덮어서 어디를 눌러도 선택된다 */
function choiceEl(kind, name, value, label, checked, onChange) {
  const id = 'c' + (++uid);
  const input = h('input', { type: kind, name: name, value: value, id: id, 'aria-labelledby': id + 't', checked: checked });
  input.addEventListener('change', function () { onChange(input); });
  const body = h('span', { class: 'body' }, h('span', { class: 'name', id: id + 't', text: label }));
  return h('div', { class: 'choice' + (kind === 'checkbox' ? ' is-check' : '') }, [input, h('span', { class: 'mark' }, svg(ICON.check)), body]);
}
function hintBox(text) {
  return h('details', {}, [
    h('summary', {}, [svg(ICON.chev), UI.hintToggle]),
    h('div', { class: 'details-body' }, h('p', { text: text }))
  ]);
}
function textareaField(value, onInput, labelText, rows) {
  const ta = h('textarea', { class: 'textarea', rows: rows || 3, 'aria-label': labelText, placeholder: '' });
  ta.value = value || '';
  ta.addEventListener('input', function () { onInput(ta.value); });
  return ta;
}
/* 화면 위쪽: 지금 어느 단계인지 알려 주는 작은 글자 + 제목 */
function titleBlock(step, title) {
  return [h('p', { class: 'eyebrow', text: UI.stepTag[step] }), h('h2', { text: title })];
}
function labelWithTag(text, required) {
  return h('span', {}, [text + ' ', h('span', { class: required ? 'req' : 'muted', text: '(' + (required ? UI.required : UI.optional) + ')' })]);
}
/* 라디오 묶음: 기본 선택값 없음 */
function radioGroup(legend, name, items, current, onPick) {
  const fs = h('fieldset', { class: 'choices' }, [h('legend', {}, legend)]);
  items.forEach(function (it) {
    fs.appendChild(choiceEl('radio', name, it.value, it.label, current === it.value, function (input) { onPick(input.value); }));
  });
  return fs;
}

/* ───────── 상단 단계 막대 ───────── */
function barIndex(step) {
  if (step === 'intro') return -1;
  if (step === 'review' || step === 'timeline') return 0;
  if (step === 's1' || step === 's2') return 1;
  if (step === 'summary') return 3;
  return 2;
}
function renderBar() {
  const idx = barIndex(state.step);
  const bar = document.getElementById('stepBar');
  bar.textContent = '';
  UI.stepNames.forEach(function (n, i) {
    bar.appendChild(h('li', { text: n, 'data-state': i < idx ? 'done' : '', 'aria-current': i === idx ? 'step' : null }));
  });
  document.getElementById('progressFill').style.width = Math.round(STEPS.indexOf(state.step) / (STEPS.length - 1) * 100) + '%';
}

/* ───────── 이동 ───────── */
function go(step, keepScroll) {
  state.step = gate(step); storeSet();
  render();
  if (!keepScroll) window.scrollTo(0, 0);
  const head = document.querySelector('#screen h1, #screen h2');
  if (head) { head.setAttribute('tabindex', '-1'); head.focus({ preventScroll: true }); }
}
function neighbor(delta) { return STEPS[STEPS.indexOf(state.step) + delta]; }
/* 마무리에서 고치러 온 경우, 다음 버튼은 마무리로 돌아간다 */
function afterStep() { go(state.fromSummary ? 'summary' : neighbor(1)); }
function nextLabel(normal) { return state.fromSummary ? UI.toSummary : normal; }

function navRow(opts) {
  const kids = [];
  if (opts.prev) kids.push(h('button', { type: 'button', class: 'btn', onclick: opts.prev }, UI.prev));
  kids.push(h('button', { type: 'button', class: 'btn btn-primary', onclick: opts.next }, [opts.nextLabel, svg(ICON.chev)]));
  return h('div', { class: 'nav-row' }, kids);
}
function prevHandler() { return function () { go(neighbor(-1)); }; }

/* ───────── 화면: 시작 ───────── */
function renderIntro(root) {
  const sidInput = h('input', { class: 'input', id: 'sid', inputmode: 'numeric', maxlength: 5, autocomplete: 'off', 'aria-describedby': 'sidErr' });
  sidInput.value = state.sid;
  const nameInput = h('input', { class: 'input', id: 'sname', autocomplete: 'off', 'aria-describedby': 'nameErr' });
  nameInput.value = state.name;
  const sidErr = errorEl('sidErr'), nameErr = errorEl('nameErr');
  sidInput.addEventListener('input', function () { state.sid = sidInput.value.replace(/\D/g, '').slice(0, 5); sidInput.value = state.sid; clearError(sidErr, sidInput); storeSet(); });
  nameInput.addEventListener('input', function () { state.name = nameInput.value; clearError(nameErr, nameInput); storeSet(); });
  root.appendChild(h('section', { class: 'card' }, [
    h('h1', { text: INTRO.title }),
    h('p', { class: 'lead', text: INTRO.notice }),
    h('h2', { text: UI.flowTitle }),
    h('ol', { class: 'step-list' }, INTRO.steps.map(function (s) { return h('li', { text: s }); }))
  ]));
  root.appendChild(h('section', { class: 'card' }, [
    h('h2', { text: UI.idTitle }),
    h('div', { class: 'id-grid' }, [
      h('div', { class: 'field' }, [h('label', { class: 'field-label', for: 'sid', text: UI.sidLabel }), sidInput, sidErr]),
      h('div', { class: 'field' }, [h('label', { class: 'field-label', for: 'sname', text: UI.nameLabel }), nameInput, nameErr])
    ])
  ]));
  root.appendChild(h('button', { type: 'button', class: 'btn btn-primary', onclick: function () {
    if (!/^\d{5}$/.test(state.sid)) { showError(sidErr, UI.needSid, sidInput); return; }
    if (!state.name.trim()) { showError(nameErr, UI.needName, nameInput); return; }
    state.fromSummary = false; startGuard(); go('review');
  } }, [UI.start, svg(ICON.chev)]));
}

/* ───────── 화면: 복습 (순서 맞추기) ───────── */
function renderReview(root) {
  const card = h('section', { class: 'card' });
  titleBlock('review', UI.reviewTitle).forEach(function (n) { card.appendChild(n); });
  card.appendChild(h('p', { class: 'lead', text: UI.reviewDesc }));
  const feedback = h('div', { id: 'reviewFeedback', 'aria-live': 'polite' });
  card.appendChild(feedback);
  const list = h('ol', { class: 'order-list', id: 'orderList' });
  state.order.forEach(function (id) { list.appendChild(orderCard(id)); });
  card.appendChild(list);
  const check = h('button', { type: 'button', class: 'btn btn-primary btn-wide', id: 'checkBtn', onclick: checkOrder }, [state.reviewDone ? UI.toTimeline : UI.checkOrder, svg(ICON.chev)]);
  card.appendChild(check);
  root.appendChild(card);
  refreshOrderUi();
  if (window.Sortable) {
    Sortable.create(list, { handle: '.drag-handle', animation: 150, ghostClass: 'is-ghost', chosenClass: 'is-drag', forceFallback: true, fallbackTolerance: 3, onEnd: syncOrder });
  }
}

function orderCard(id) {
  const ev = eventById(id);
  const up = h('button', { type: 'button', class: 'icon-btn move-up', 'aria-label': UI.moveUp(ev.name), onclick: function () { moveCard(id, -1); } }, svg(ICON.up));
  const down = h('button', { type: 'button', class: 'icon-btn move-down', 'aria-label': UI.moveDown(ev.name), onclick: function () { moveCard(id, 1); } }, svg(ICON.down));
  return h('li', { class: 'order-card', 'data-id': id }, [
    h('div', { class: 'order-head' }, [
      h('span', { class: 'drag-handle', title: UI.dragHandle }, svg(ICON.grip, 20, 3)),
      h('span', { class: 'order-no', 'aria-hidden': 'true' }),
      h('span', { class: 'order-name', text: ev.name }),
      h('div', { class: 'order-btns' }, [up, down])
    ]),
    h('span', { class: 'state-chip', hidden: true }),
    h('details', {}, [
      h('summary', {}, [svg(ICON.chev), UI.whatHappened]),
      h('div', { class: 'details-body' }, h('p', { text: ev.desc }))
    ])
  ]);
}

/* 번호·위아래 버튼 상태를 DOM 순서에 맞춘다 */
function refreshOrderUi() {
  const cards = [].slice.call(document.querySelectorAll('#orderList .order-card'));
  cards.forEach(function (c, i) {
    c.querySelector('.order-no').textContent = String(i + 1);
    c.querySelector('.move-up').disabled = i === 0;
    c.querySelector('.move-down').disabled = i === cards.length - 1;
  });
}
function clearMarks() {
  [].forEach.call(document.querySelectorAll('#orderList .order-card'), function (c) {
    c.removeAttribute('data-state');
    const chip = c.querySelector('.state-chip'); chip.hidden = true; chip.textContent = '';
  });
  const fb = document.getElementById('reviewFeedback'); if (fb) fb.textContent = '';
}
/* 순서가 바뀔 때마다: DOM 순서 → 상태 저장, 낡은 결과 표시 지우기 */
function syncOrder() {
  state.order = [].map.call(document.querySelectorAll('#orderList .order-card'), function (c) { return c.getAttribute('data-id'); });
  if (!isCorrectOrder(state.order)) {
    state.reviewDone = false;
    const btn = document.getElementById('checkBtn');
    if (btn) { btn.firstChild.nodeValue = UI.checkOrder; }
  }
  clearMarks(); refreshOrderUi(); storeSet();
}
function moveCard(id, delta) {
  const list = document.getElementById('orderList');
  const li = list.querySelector('[data-id="' + id + '"]');
  const target = delta < 0 ? li.previousElementSibling : li.nextElementSibling;
  if (!target) return;
  if (delta < 0) list.insertBefore(li, target); else list.insertBefore(target, li);
  syncOrder();
  const want = li.querySelector(delta < 0 ? '.move-up' : '.move-down');
  (want.disabled ? li.querySelector(delta < 0 ? '.move-down' : '.move-up') : want).focus();
}

/* 정답 순서에서 이웃한 두 사건이 뒤집힌 쌍 중 가장 앞쪽 k의 단서 하나 */
function firstInvertedClue() {
  for (let k = 0; k < CORRECT_ORDER.length - 1; k++) {
    if (state.order.indexOf(CORRECT_ORDER[k]) > state.order.indexOf(CORRECT_ORDER[k + 1])) return PAIR_CLUES[k];
  }
  return PAIR_CLUES[0];
}
function checkOrder() {
  if (state.reviewDone) { go('timeline'); return; }
  state.attempts += 1;
  if (isCorrectOrder(state.order)) { state.reviewDone = true; go('timeline'); return; }
  let right = 0;
  [].forEach.call(document.querySelectorAll('#orderList .order-card'), function (c, i) {
    const ok = c.getAttribute('data-id') === CORRECT_ORDER[i];
    if (ok) right += 1;
    c.setAttribute('data-state', ok ? 'right' : 'wrong');
    const chip = c.querySelector('.state-chip');
    chip.textContent = '';
    chip.appendChild(svg(ok ? ICON.check : ICON.x));
    chip.appendChild(document.createTextNode(ok ? UI.inPlace : UI.notInPlace));
    chip.hidden = false;
  });
  const fb = document.getElementById('reviewFeedback');
  fb.textContent = '';
  fb.appendChild(h('div', { class: 'callout' }, [svg(ICON.info, 20),
    h('div', {}, [h('p', { text: UI.placeCount(right) }), h('p', { text: firstInvertedClue() })])]));
  storeSet();
}

/* ───────── 화면: 연표 확인 ───────── */
function renderTimeline(root) {
  const items = [];
  CORRECT_ORDER.forEach(function (id, i) {
    const ev = eventById(id);
    items.push(h('li', { class: 'tl-item' }, [
      h('div', { class: 'tl-rail' }, h('span', { class: 'tl-node', 'aria-hidden': 'true', text: String(i + 1) })),
      h('div', { class: 'tl-card' }, [
        h('div', { class: 'tl-head' }, [ev.date ? h('span', { class: 'date-chip', text: ev.date }) : null, h('h3', { text: ev.name })]),
        h('p', { text: ev.desc })
      ])
    ]));
    if (i < LINKS.length) {
      items.push(h('li', { class: 'tl-item is-link' }, [h('div', { class: 'tl-rail' }), h('p', { class: 'tl-link', text: LINKS[i] })]));
    }
  });
  root.appendChild(h('section', { class: 'card' }, titleBlock('timeline', UI.timelineTitle).concat([
    h('p', { class: 'lead', text: UI.timelineLead }),
    h('ol', { class: 'timeline' }, items),
    h('div', { class: 'callout' }, [svg(ICON.info, 20), h('p', { text: REVIEW_NOTE })]),
    navRow({ prev: function () { go('review'); }, next: afterStep, nextLabel: nextLabel(UI.toSources) })
  ])));
}

/* ───────── 화면: 자료 1·2 ───────── */
/* 용어 풀이는 그 말이 처음 나오는 발췌 카드 아래에 붙인다 */
function glossFor(src, idx) {
  return src.gloss.filter(function (g) {
    const term = g.split(':')[0];
    for (let i = 0; i < src.passages.length; i++) {
      if (src.passages[i].text.indexOf(term) >= 0) return i === idx;
    }
    return idx === 0;
  });
}
function passageCard(src, p, idx) {
  const glosses = glossFor(src, idx);
  return h('div', { class: 'passage' }, [
    h('p', { class: 'passage-label', text: p.label }),
    h('p', { class: 'passage-text', text: p.text }),
    glosses.length ? h('details', {}, [
      h('summary', {}, [svg(ICON.chev), UI.glossToggle]),
      h('div', { class: 'details-body' }, h('ul', { class: 'gloss-list' }, glosses.map(function (g) { return h('li', { text: g }); })))
    ]) : null
  ]);
}
function sourceHead(src) {
  return titleBlock('s' + src.no, UI.sourceTitle(src.no, src.title)).concat([
    h('p', { class: 'source-cite', text: src.cite }),
    h('p', { text: src.intro }),
    h('h3', { class: 'zone-title', text: UI.readTitle }),
    h('div', { class: 'passages' }, src.passages.map(function (p, i) { return passageCard(src, p, i); }))
  ]);
}
function viewItems(task) { return task.q1.choices.map(function (c) { return { value: c, label: c }; }); }

function renderSource1(root) {
  const src = sourceByNo(1), task = TASKS.A;
  const err1 = errorEl('errView'), err2 = errorEl('errQuote');
  const group = radioGroup(labelWithTag(task.q1.label, true), 'viewA', viewItems(task), state.a.view, function (v) { state.a.view = v; clearError(err1); storeSet(); });
  const ta = textareaField(state.a.quote, function (v) { state.a.quote = v; clearError(err2, ta); storeSet(); }, task.q2.label, 2);
  const card = h('section', { class: 'card' }, sourceHead(src).concat([
    h('div', { class: 'task' }, [
      h('h3', { class: 'zone-title', text: UI.taskTitle }),
      group, err1,
      h('div', { class: 'field' }, [h('label', { class: 'field-label' }, labelWithTag(task.q2.label, true)), ta, err2]),
      hintBox(task.hint)
    ]),
    navRow({
      prev: function () { saveNow(); go('timeline'); },
      nextLabel: nextLabel(UI.toNextSource),
      next: function () {
        if (!state.a.view) { showError(err1, UI.needChoice, group.querySelector('input')); return; }
        if (!state.a.quote.trim()) { showError(err2, UI.needQuote, ta); return; }
        afterStep();
      }
    })
  ]));
  root.appendChild(card);
}

function renderSource2(root) {
  const src = sourceByNo(2), task = TASKS.D, a2 = sourceByNo(1).passages[1];
  const err1 = errorEl('errViewD'), err2 = errorEl('errDiff');
  const group = radioGroup(labelWithTag(task.q1.label, true), 'viewD', viewItems(task), state.d.view, function (v) { state.d.view = v; clearError(err1); storeSet(); });
  const ta2 = textareaField(state.d.diff, function (v) { state.d.diff = v; clearError(err2, ta2); storeSet(); }, task.q2.label, 3);
  const ta3 = textareaField(state.d.why, function (v) { state.d.why = v; storeSet(); }, task.q3.label, 2);
  const card = h('section', { class: 'card' }, sourceHead(src).concat([
    h('details', {}, [
      h('summary', {}, [svg(ICON.chev), src.recallLabel]),
      h('div', { class: 'details-body' }, h('div', { class: 'recall' }, [
        h('p', { class: 'passage-label', text: '자료 1 · ' + a2.label }),
        h('p', { class: 'passage-text', text: a2.text })
      ]))
    ]),
    h('div', { class: 'task' }, [
      h('h3', { class: 'zone-title', text: UI.taskTitle }),
      group, err1,
      h('div', { class: 'field' }, [h('label', { class: 'field-label' }, labelWithTag(task.q2.label, true)), ta2, err2]),
      h('div', { class: 'field' }, [h('label', { class: 'field-label' }, labelWithTag(task.q3.label, false)), ta3]),
      hintBox(task.hint)
    ]),
    navRow({
      prev: function () { go('s1'); },
      nextLabel: nextLabel(UI.toJudge),
      next: function () {
        if (!state.d.view) { showError(err1, UI.needChoice, group.querySelector('input')); return; }
        if (!state.d.diff.trim()) { showError(err2, UI.needDiff, ta2); return; }
        afterStep();
      }
    })
  ]));
  root.appendChild(card);
}
function saveNow() { storeSet(); }

/* ───────── 화면: 판단 ───────── */
function myAnswersBox() {
  const a = state.a, d = state.d;
  const rowsA = [UI.viewLabel + ': ' + a.view, UI.quoteLabel + ': ' + a.quote];
  const rowsD = [UI.viewLabel + ': ' + d.view, UI.diffLabel + ': ' + d.diff].concat(d.why.trim() ? [UI.whyLabel + ': ' + d.why] : []);
  return h('details', {}, [
    h('summary', {}, [svg(ICON.chev), UI.myAnswers]),
    h('div', { class: 'details-body' }, [
      h('h3', { text: '자료 1' }), h('div', {}, rowsA.map(function (t) { return h('p', { class: 'a', text: t }); })),
      h('h3', { text: '자료 2' }), h('div', {}, rowsD.map(function (t) { return h('p', { class: 'a', text: t }); }))
    ])
  ]);
}
function renderJudge(root) {
  const err1 = errorEl('errJudge'), err2 = errorEl('errReason');
  const group = radioGroup(labelWithTag(JUDGE.q, true), 'judge', JUDGE.options.map(function (o) { return { value: o.id, label: o.text }; }), state.judge,
    function (v) { state.judge = v; clearError(err1); storeSet(); });
  const ta = textareaField(state.judgeReason, function (v) { state.judgeReason = v; clearError(err2, ta); storeSet(); }, JUDGE.reasonLabel, 3);
  root.appendChild(h('section', { class: 'card' }, titleBlock('judge', UI.judgeTitle).concat([
    myAnswersBox(),
    group, err1,
    h('div', { class: 'field' }, [h('label', { class: 'field-label' }, labelWithTag(JUDGE.reasonLabel, true)), ta, err2]),
    hintBox(JUDGE.hint),
    navRow({
      prev: prevHandler(),
      nextLabel: nextLabel(UI.toEvidence),
      next: function () {
        if (!state.judge) { showError(err1, UI.needChoice, group.querySelector('input')); return; }
        if (!state.judgeReason.trim()) { showError(err2, UI.needReason, ta); return; }
        afterStep();
      }
    })
  ])));
}

/* ───────── 화면: 근거 고르기 ───────── */
function judgeBox() {
  return h('div', { class: 'my-judge' }, [
    h('p', { class: 'tag', text: UI.myJudge }),
    h('p', { class: 'opt', text: judgeText() }),
    h('p', { text: oneLine(state.judgeReason) })
  ]);
}
function renderEvidence(root) {
  const errChip = errorEl('errChip'), errWhy = errorEl('errWhy');
  const fs = h('fieldset', { class: 'choices' }, [h('legend', {}, labelWithTag(EVIDENCE.pickLabel, true))]);
  allPassages().forEach(function (it) {
    fs.appendChild(choiceEl('checkbox', 'chip', it.p.id, '자료 ' + it.src.no + ' · ' + it.p.label, state.chips.indexOf(it.p.id) >= 0, function (input) {
      if (input.checked) {
        if (state.chips.length >= EVIDENCE.pickMax) { input.checked = false; toast(EVIDENCE.maxToast); return; }
        state.chips.push(input.value);
      } else {
        state.chips = state.chips.filter(function (x) { return x !== input.value; });
      }
      if (state.counter && state.chips.indexOf(state.counter) >= 0) state.counter = '';
      drawCounter();
      clearError(errChip); storeSet();
    }));
  });
  const ta = textareaField(state.chipWhy, function (v) { state.chipWhy = v; clearError(errWhy, ta); storeSet(); }, EVIDENCE.whyLabel, 3);
  /* 맞서는 말: 내 판단과 가장 안 맞는 말 하나를 위에서 고른 자료 밖에서 고르고, 그 말에 어떻게 답할지 쓴다 */
  const errCounter = errorEl('errCounter'), errCounterWhy = errorEl('errCounterWhy');
  const counterWrap = h('div', { id: 'counterWrap' });
  function drawCounter() {
    counterWrap.textContent = '';
    const items = allPassages().filter(function (it) { return state.chips.indexOf(it.p.id) < 0; })
      .map(function (it) { return { value: it.p.id, label: '자료 ' + it.src.no + ' · ' + it.p.label }; });
    counterWrap.appendChild(radioGroup(labelWithTag(EVIDENCE.counterPickLabel, true), 'counter', items, state.counter,
      function (v) { state.counter = v; clearError(errCounter); storeSet(); }));
  }
  drawCounter();
  const taCounter = textareaField(state.counterWhy, function (v) { state.counterWhy = v; clearError(errCounterWhy, taCounter); storeSet(); }, EVIDENCE.counterWhyLabel, 3);
  const reread = h('details', {}, [
    h('summary', {}, [svg(ICON.chev), UI.rereadSources]),
    h('div', { class: 'details-body' }, allPassages().map(function (it) {
      return h('div', { class: 'passage' }, [h('p', { class: 'passage-label', text: '자료 ' + it.src.no + ' · ' + it.p.label }), h('p', { class: 'passage-text', text: it.p.text })]);
    }))
  ]);
  root.appendChild(h('section', { class: 'card' }, titleBlock('evidence', UI.evidenceTitle).concat([
    judgeBox(),
    reread,
    fs, errChip,
    h('div', { class: 'field' }, [h('label', { class: 'field-label' }, labelWithTag(EVIDENCE.whyLabel, true)), ta, errWhy]),
    h('hr', { class: 'divider' }),
    counterWrap, errCounter,
    h('div', { class: 'field' }, [h('label', { class: 'field-label' }, labelWithTag(EVIDENCE.counterWhyLabel, true)), taCounter, errCounterWhy]),
    hintBox(EVIDENCE.hint),
    navRow({
      prev: prevHandler(),
      nextLabel: nextLabel(UI.toExtra),
      next: function () {
        if (state.chips.length < 1) { showError(errChip, UI.needChip, fs.querySelector('input')); return; }
        if (!state.chipWhy.trim()) { showError(errWhy, UI.needReason, ta); return; }
        if (!state.counter) { showError(errCounter, UI.needCounter, counterWrap.querySelector('input')); return; }
        if (!state.counterWhy.trim()) { showError(errCounterWhy, UI.needCounterWhy, taCounter); return; }
        afterStep();
      }
    })
  ])));
}

/* ───────── 화면: 추가 정보·재판단 (판단·근거를 저장한 뒤에만 열린다) ───────── */
function renderExtra(root) {
  const errRe = errorEl('errRe');
  const group = radioGroup(labelWithTag(COMMENTARY.reLabel, true), 're', COMMENTARY.reOptions.map(function (o) { return { value: o.id, label: o.text }; }), state.re,
    function (v) { state.re = v; clearError(errRe); storeSet(); });
  const ta = textareaField(state.reReason, function (v) { state.reReason = v; storeSet(); }, COMMENTARY.reReasonLabel, 2);
  root.appendChild(h('section', { class: 'card' }, titleBlock('extra', UI.extraTitle).concat([
    h('p', { class: 'lead', text: COMMENTARY.lead })
  ], COMMENTARY.cards.map(function (c) {
      return h('div', { class: 'info-card' }, [h('p', { class: 'info-head', text: c.head }), h('p', { text: c.text })]);
    }), [
    h('p', { class: 'cite-line', text: COMMENTARY.cite }),
    h('hr', { class: 'divider' }),
    group, errRe,
    h('details', {}, [
      h('summary', {}, [svg(ICON.chev), COMMENTARY.reReasonLabel]),
      h('div', { class: 'details-body' }, ta)
    ]),
    navRow({
      prev: prevHandler(),
      nextLabel: UI.toSummary,
      next: function () {
        if (!state.re) { showError(errRe, UI.needRe, group.querySelector('input')); return; }
        afterStep();
      }
    })
  ])));
}

/* ───────── 화면: 마무리 ───────── */
function buildCopyText() {
  const a = state.a, d = state.d;
  const lines = [];
  lines.push('[복습] 순서 맞추기 ' + state.attempts + '번 만에 완성');
  lines.push('[자료 1] ' + UI.viewLabel + ': ' + a.view + ' / ' + UI.quoteLabel + ': ' + oneLine(a.quote));
  lines.push('[자료 2] ' + UI.viewLabel + ': ' + d.view + ' / ' + UI.diffLabel + ': ' + oneLine(d.diff) + (oneLine(d.why) ? ' / ' + UI.whyLabel + ': ' + oneLine(d.why) : ''));
  lines.push('[평가] ' + UI.judgeLabel + ': ' + judgeText().replace(/\.$/, '') + ' / ' + UI.whyLabel + ': ' + oneLine(state.judgeReason));
  lines.push('[근거] ' + state.chips.map(chipLabel).join(', ') + ' / ' + oneLine(state.chipWhy));
  lines.push('[' + UI.counterLabel + '] ' + chipLabel(state.counter) + ' / ' + oneLine(state.counterWhy));
  lines.push('[정보 뒤] ' + reText() + (oneLine(state.reReason) ? ' / ' + oneLine(state.reReason) : ''));
  return lines.join('\n');
}
function copyText(text, okMsg, onOk) {
  const fallback = function () {
    const ta = h('textarea', { 'aria-hidden': 'true', style: 'position:fixed;left:-9999px;top:0' });
    ta.value = text; document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    toast(ok ? (okMsg || UI.copied) : UI.copyFail);
    if (ok && onOk) onOk();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { toast(okMsg || UI.copied); if (onOk) onOk(); }, fallback);
  } else fallback();
}

async function submitRecord(btn) {
  if (PREVIEW) { toast(UI.submitPreview); return; }
  const body = {
    studentId: state.sid, studentName: state.name, gameName: CONFIG.GAME_NAME,
    choiceSummary: judgeText().replace(/\.$/, '') + ' / ' + reText(),
    diffSummary: '',
    reflection: buildCopyText(),
    choicesJson: JSON.stringify({ review: { attempts: state.attempts, order: state.order }, a: state.a, d: state.d,
      judge: state.judge, judgeReason: state.judgeReason, chips: state.chips, chipWhy: state.chipWhy, counter: state.counter, counterWhy: state.counterWhy, re: state.re, reReason: state.reReason })
  };
  Object.assign(body, window.FocusGuard ? FocusGuard.payload() : {});
  btn.disabled = true; btn.textContent = UI.submitting;
  try {
    const res = await fetch(CONFIG.SHEET_WEBAPP_URL, { method: 'POST', body: JSON.stringify(body) });
    const out = await res.json().catch(function () { return null; });
    if (!out || out.result === 'error') throw new Error((out && out.message) || UI.submitFail);
    state.submitted = true; storeSet();
    toast(UI.submitted);
  } catch (e) {
    toast(e && e.message ? e.message : UI.submitFail);
  }
  btn.disabled = false;
  btn.textContent = state.submitted ? UI.submitAgain : UI.submit;
}

/* 패들렛 주소: CONFIG.PADLET_URL 또는 포털이 넘기는 ?padlet=주소(https, padlet.com만 허용) */
function padletUrl() {
  let url = CONFIG.PADLET_URL;
  const q = params.get('padlet');
  if (q) { try { const u = new URL(q); if (u.protocol === 'https:' && /(^|\.)padlet\.com$/.test(u.hostname)) url = u.href; } catch (e) { /* 무시 */ } }
  return url;
}

function recapBlock(title, step, rows) {
  return h('div', { class: 'recap' }, [
    h('div', { class: 'recap-head' }, [
      h('h3', { text: title }),
      h('button', { type: 'button', class: 'btn btn-sm', 'data-go-step': step, onclick: function () { state.fromSummary = true; go(step); } }, UI.editStep)
    ])
  ].concat(rows.map(function (r) {
    return h('p', {}, [h('span', { class: 'q', text: r[0] + ': ' }), h('span', { class: 'a', text: r[1] })]);
  })));
}
function renderSummary(root) {
  state.fromSummary = false; storeSet();
  const a = state.a, d = state.d;
  const ok = allDone();
  /* 복사에 성공한 뒤에야 패들렛 버튼이 나온다(복사 전엔 숨김). 주소가 없으면 포털에서 열도록 안내만 보인다 */
  const url = padletUrl();
  const padBox = h('div', { class: 'pad-after', id: 'padAfter', hidden: true });
  const showPad = function () {
    padBox.textContent = '';
    if (url) padBox.appendChild(h('button', { type: 'button', class: 'btn btn-primary btn-wide', id: 'padBtn', onclick: function () {
      window.open(url, '_blank', 'noopener,noreferrer');
    } }, [UI.padletOpen, svg('M6 3.5H3.5v9h9V10M9 3.5h3.5V7M12.5 3.5L7.5 8.5')]));
    else padBox.appendChild(h('p', { class: 'muted', text: UI.padletNoUrl }));
    padBox.hidden = false;
  };
  const copyBtn = h('button', { type: 'button', class: 'btn btn-primary btn-wide', id: 'copyBtn', disabled: !ok, onclick: function () { copyText(buildCopyText(), UI.padletCopied, showPad); } }, UI.copy);
  const submitBtn = h('button', { type: 'button', class: 'btn btn-wide', id: 'subBtn', disabled: !ok, onclick: function (e) { submitRecord(e.currentTarget); } }, state.submitted ? UI.submitAgain : UI.submit);
  root.appendChild(h('section', { class: 'card' }, titleBlock('summary', UI.summaryTitle).concat([
    h('p', { class: 'lead', text: UI.summaryLead }),
    recapBlock(UI.summaryReview, 'review', [[UI.summaryReview, state.attempts + '번 만에 완성']]),
    recapBlock(UI.summaryA, 's1', [[UI.viewLabel, a.view], [UI.quoteLabel, a.quote]]),
    recapBlock(UI.summaryD, 's2', [[UI.viewLabel, d.view], [UI.diffLabel, d.diff]].concat(d.why.trim() ? [[UI.whyLabel, d.why]] : [])),
    recapBlock(UI.summaryJudge, 'judge', [[UI.judgeLabel, judgeText()], [UI.whyLabel, state.judgeReason]]),
    recapBlock(UI.summaryEv, 'evidence', [[UI.pickedLabel, state.chips.map(chipLabel).join(', ')], [UI.whyLabel, state.chipWhy], [UI.counterLabel, state.counter ? chipLabel(state.counter) : ''], [UI.counterAnsLabel, state.counterWhy]]),
    recapBlock(UI.summaryRe, 'extra', [[UI.myJudge, reText()]].concat(state.reReason.trim() ? [[UI.whyLabel, state.reReason]] : [])),
    copyBtn,
    padBox,
    submitBtn,
    ok ? null : h('p', { class: 'muted', text: UI.needAll }),
    h('button', { type: 'button', class: 'btn btn-outline btn-wide', onclick: confirmRestart }, UI.restart)
  ])));
}

/* ───────── 모달: 처음부터 다시하기 ───────── */
function confirmRestart() {
  const root = document.getElementById('modalRoot');
  const opener = document.activeElement;
  const close = function () { root.textContent = ''; if (opener && opener.focus) opener.focus(); };
  const cancel = h('button', { type: 'button', class: 'btn', onclick: close }, UI.cancel);
  const erase = h('button', { type: 'button', class: 'btn btn-critical', onclick: function () {
    root.textContent = ''; storeDel();
    state = freshState(state.sid, state.name);
    storeSet(); go('intro');
  } }, UI.erase);
  const box = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'mdTitle' }, [
    h('h2', { id: 'mdTitle', text: UI.restartTitle }), h('p', { text: UI.restartBody }),
    h('div', { class: 'btn-row' }, [cancel, erase])
  ]);
  const back = h('div', { class: 'modal-back' }, box);
  back.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = [cancel, erase], i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); erase.focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); cancel.focus(); }
    }
  });
  root.appendChild(back); cancel.focus();
}

/* ───────── 렌더 ───────── */
function render() {
  const root = document.getElementById('screen');
  root.textContent = '';
  renderBar();
  const st = state.step;
  if (st === 'intro') renderIntro(root);
  else if (st === 'review') renderReview(root);
  else if (st === 'timeline') renderTimeline(root);
  else if (st === 's1') renderSource1(root);
  else if (st === 's2') renderSource2(root);
  else if (st === 'judge') renderJudge(root);
  else if (st === 'evidence') renderEvidence(root);
  else if (st === 'extra') renderExtra(root);
  else renderSummary(root);
  if (window.Glossary) Glossary.refresh();
}

let startedGuard = false;
function startGuard() {
  if (startedGuard || !window.FocusGuard || !/^\d{5}$/.test(state.sid)) return;
  startedGuard = true;
  FocusGuard.start({ key: CONFIG.GAME_NAME + ':' + state.sid });
}

/* ───────── 부팅 (함수 선언이 모두 끝난 뒤 맨 마지막에 실행) ───────── */
function init() {
  const qSid = (params.get('sid') || '').replace(/\D/g, '').slice(0, 5);
  const qName = (params.get('name') || '').trim();
  const saved = storeGet();
  if (saved && STEPS.indexOf(saved.step) >= 0 && (!qSid || qSid === saved.sid)) {
    state = Object.assign(freshState(), saved);
    state.a = Object.assign({ view: '', quote: '' }, saved.a);
    state.d = Object.assign({ view: '', diff: '', why: '' }, saved.d);
    if (!Array.isArray(state.chips)) state.chips = [];
    const okOrder = Array.isArray(state.order) && state.order.length === CORRECT_ORDER.length && CORRECT_ORDER.every(function (id) { return state.order.indexOf(id) >= 0; });
    if (!okOrder) state.order = shuffledOrder();
    state.step = gate(state.step);
  }
  if (qSid && !state.sid) state.sid = qSid;
  if (qName && !state.name) state.name = qName;
  if (PREVIEW) {
    if (!state.sid) state.sid = '20599';
    if (!state.name) state.name = '미리보기 학생';
    document.getElementById('previewBanner').hidden = false;
  }
  state.step = gate(state.step);
  if (state.step !== 'intro') startGuard();
  Glossary.start({ terms: GLOSSARY, unique: true, skip: ['.topbar', '#stepBar', '.recap', '.modal', '.choices', '.my-judge', '.source-cite', '.cite-line', '.order-name'] });
  render();
}
init();
