/* config.js — 설정값. 포털·백엔드 연동은 없다(핸드오프 10번 8항: 기본은 패들렛 복사만).
   연동하게 되면 SHEET_WEBAPP_URL·GAME_NAME을 여기에 추가한다(Apps Script는 "새 버전"으로만 재배포). */
const CONFIG = {
  STORE_KEY: 'napoleon_state_v1' // localStorage 키(앱 이름 접두어)
};
