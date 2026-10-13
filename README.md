# 나폴레옹의 쿠데타 평가 (2학년 세계사, 교과서 144~146쪽)

핸드오프 v1(2026-10-13) 기준 구현. plain HTML/CSS/JS, 빌드 없음. 로컬 확인: `python3 -m http.server 8765` 후 `http://localhost:8765/index.html`.

- 파일: `index.html` / `style.css` / `config.js`(저장 키) / `data.js`(학생 화면 문구, 핸드오프 5번 그대로) / `app.js`(화면·상태·복사) / `vendor/Sortable.min.js`(SortableJS 1.15.2, MIT) / `assets/fonts/`(Pretendard) / `tests/`
- 화면 흐름: 시작 → 복습(순서 맞추기: 드래그 + ▲▼) → 연표 확인 → 자료 1(윌리엄스) → 자료 2(1904년 역사책) → 판단 → 근거 고르기 → 추가 정보·재판단 → 마무리(내 글 복사)
- 추가 정보 카드는 판단·근거를 저장한 뒤에만 열린다(`gate()`가 앞 단계를 마치지 않으면 그 단계로 돌려보낸다).
- 저장: 입력은 `localStorage`(`napoleon_state_v1`)에 임시 저장. 막혀도 앱은 동작한다. `?preview=1`이면 저장하지 않고 배너만 보인다.
- 포털·백엔드 연동 없음(패들렛 복사만). 연동하려면 `config.js`에 `SHEET_WEBAPP_URL`·`GAME_NAME`을 추가하고 제출 코드를 새로 붙인다(Apps Script는 "새 버전"으로만 재배포).
- 이 앱은 `FocusGuard`·`Glossary`·`DraftGuard`를 쓰지 않는다. 제출이 없고(복사만), 용어 풀이는 사료 카드 아래 접힘으로 직접 넣었기 때문이다.

## 검증
- `node tests/e2e.js` — 360·768px 완주(순서 오답 6가지 단서, 쌍 둘 이상일 때 가장 앞 단서, 드래그, 필수 칸 막힘, 칩 3번째 토스트, 새로고침 복원, 마무리 ↔ 화면 이동, 복사 문자열 형식, 콘솔 에러 0건). 스크린샷은 `/tmp/napoleon-shots`.
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
