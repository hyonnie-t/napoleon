# 나폴레옹의 쿠데타 평가 (2학년 세계사, 교과서 144~146쪽)

핸드오프 v1(2026-10-13) 기준 구현. plain HTML/CSS/JS, 빌드 없음. 로컬 확인: `python3 -m http.server 8765` 후 `http://localhost:8765/index.html`.

- 파일: `index.html` / `style.css` / `config.js`(제출 URL·GAME_NAME·저장 키) / `data.js`(학생 화면 문구 = 핸드오프 5번 그대로 + 맨 아래 `GLOSSARY`) / `app.js`(화면·상태·복사·제출) / `snippets/`(`focus_guard.js`·`glossary.js` — history26 레포 사본, 2026-10-13 시점) / `vendor/Sortable.min.js`(SortableJS 1.15.2, MIT) / `assets/fonts/`(Pretendard) / `tests/`
- 화면 흐름: 시작 → 복습(순서 맞추기: 드래그 + ▲▼) → 연표 확인 → 자료 1(윌리엄스) → 자료 2(1904년 역사책) → 판단 → 근거 고르기 → 추가 정보·재판단 → 마무리(내 글 복사)
- 추가 정보 카드는 판단·근거를 저장한 뒤에만 열린다(`gate()`가 앞 단계를 마치지 않으면 그 단계로 돌려보낸다).
- 2026-10-15 수정(2-2반 패들렛 글 21개 분석 결과 반영): ① 근거 화면에 필수 칸 추가 — 근거 칩에서 고르지 않은 자료 중 "내 판단과 가장 안 맞는 말" 하나(`state.counter`)와 그 말에 대한 내 답(`state.counterWhy`). 근거 칩과 겹치면 비워진다. 복사 문자열에 `[맞서는 말]` 줄, 기록하기 `choicesJson`에 `counter`·`counterWhy` 추가(새 action·시트 열 변경 없음). ② 판단 선택지 A에서 "그 상황에서는" 삭제("받아들일 수 있는 선택이었다."). ③ 판단 이유 칸에 "자료에 나온 말을 하나 넣어요" 안내, 힌트는 "이유가 자료 어디에 나오는지" 짚게 변경. ④ 자료 1·2 소개문을 같은 틀(출간 시기·장소)로 맞추고, 자료 2의 "직접 본 사람이 아니에요"를 삭제, 신뢰도 힌트에 "곁에 있었다/나중에 썼다고 저절로 더 믿을 만한 건 아니다"를 추가. 학생 화면 문구를 바꿨으므로 핸드오프 v1 5번 원문과 다르다.
- URL 파라미터: `?sid=학번&name=이름` 자동채움, `?preview=1` 미리보기(학번·이름 자동채움, 저장·제출 안 함).
- 패들렛: "내 글 복사하기"에 성공하면 그 아래에 "패들렛 열기" 버튼이 나온다(복사 전엔 숨김). 주소는 `CONFIG.PADLET_URL` 또는 포털이 넘기는 `?padlet=https://padlet.com/...`(padlet.com만 허용). 주소가 없으면 버튼 대신 "포털의 내 패들렛 열기로 가서 붙여넣어 주세요" 안내만 나온다. 새 창으로 열 때 `FocusGuard`는 padlet.com을 자동으로 이탈에서 뺀다.
- 내보내기: 마무리 화면의 "내 글 복사하기"(패들렛용)와 "기록하기"(history26_backend 기본 제출 경로, `gameName` 필수, 새 action 없음). 기록하기 body는 `studentId·studentName·gameName·choiceSummary·diffSummary·reflection·choicesJson`에 `FocusGuard.payload()`를 더한 것이다. `reflection`은 복사 문자열과 같다.
- 저장: 입력은 `localStorage`(`napoleon_state_v1`)에 임시 저장하므로 `DraftGuard`는 쓰지 않는다(웹앱 빌더 스킬: 앱이 이미 자기 localStorage에 저장하면 중복). 막혀도 앱은 동작한다.
- 임시값: `CONFIG.GAME_NAME = '나폴레옹_쿠데타평가'` — 포털 커리큘럼 id가 정해지면 정확히 일치하게 교체.
- 낱말 풀이: `data.js`의 `GLOSSARY` + `snippets/glossary.js`(밑줄, 누르면 뜻). `node <history26>/snippets/vocab_check.mjs .` 누락 0건. 앞 차시 앱의 풀이를 그대로 가져온 것과 새로 쓴 것(재정·확보·전제 정치·단검·암살·합법·노골적·지휘·오만·음모·독재자·생클루)이 섞여 있어 검수가 필요하다. `총재정부` 키는 `재정`이 그 글자 안에 걸려 밑줄이 잘못 그어지는 것을 막으려고 넣었다.

## 검증
- `node tests/e2e.js` — 360·768px 완주(순서 오답 6가지 단서, 쌍 둘 이상일 때 가장 앞 단서, 드래그, 필수 칸 막힘, 칩 3번째 토스트, 새로고침 복원, 마무리 ↔ 화면 이동, 복사 문자열 형식, 학번·이름 검증, `?sid=&name=`·`?preview=1`, 기록하기 body(백엔드는 가짜 응답)·미리보기에서 전송 안 함, 낱말 밑줄·뜻 시트, 콘솔 에러 0건). 스크린샷은 `/tmp/napoleon-shots`.
- `node tests/audit.js` — 라이트·다크 × 360·768 × 9화면: 글자 16px 미만, 조작 요소 44px 미만, 가로 스크롤 전수 검사.

## 브랜드 색(indigo, 앞 차시 프랑스 혁명 앱과 같은 토큰) 대비
| 테마 | 조합 | 대비 | 기준 |
|---|---|---|---|
| 라이트 | fg-brand / layer-default | 7.92 | 4.5 |
| 라이트 | fg-brand-contrast / brand-weak | 11.55 | 4.5 |
| 라이트 | 흰 글자 / bg-brand-solid | 7.92 | 4.5 |
| 라이트 | stroke-brand-solid / layer-default | 7.92 | 3 |
| 라이트 | 맞는 자리 글자 / positive-weak | 10.15 | 4.5 |
| 라이트 | 다른 자리 글자 / critical-weak | 10.77 | 4.5 |
| 다크 | fg-brand / layer-default | 7.66 | 4.5 |
| 다크 | fg-brand-contrast / brand-weak | 10.52 | 4.5 |
| 다크 | 흰 글자 / bg-brand-solid | 6.82 | 4.5 |
| 다크 | stroke-brand-solid / layer-default | 4.64 | 3 |
| 다크 | 맞는 자리 글자 / positive-weak | 11.86 | 4.5 |
| 다크 | 다른 자리 글자 / critical-weak | 10.27 | 4.5 |

## 사료 검증 상태 (학생 화면에는 표시하지 않음)
핸드오프 9번과 같다: 윌리엄스는 napoleon.org 영어 전사본, 드빌은 위키문헌 본문 기준이며 원서 스캔과는 대조하지 못했다. 조브 해설 두 대목의 번역은 영어 번역문에서 옮긴 것이다. 학교 배포 전 원서 대조 여부는 핸드오프 10번 3항.
