/* config.js — 설정값. 제출은 history26_backend 기본 제출 경로(gameName 필수)를 쓴다(새 action 없음).
   SHEET_WEBAPP_URL은 옮겨 적지 말고 grep/diff로 원본과 대조한다. Apps Script는 "배포 관리 > 수정 > 새 버전"으로만 재배포. */
const CONFIG = {
  SHEET_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbyXSjCfWY_HiZFqW_OBR-FQDoIfF1z_STqyKWUI31MacHeY3u7hbirFSFDvW-5yuUHaJQ/exec',
  GAME_NAME: '나폴레옹_쿠데타평가', // 임시값 — 포털 차시 id(커리큘럼 id)가 정해지면 정확히 일치하게 교체
  PADLET_URL: '', // 수업 패들렛 주소. 비워 두면 "포털의 내 패들렛 열기" 안내만 나온다. 포털이 ?padlet=주소 로 넘겨도 된다(padlet.com만 허용)
  STORE_KEY: 'napoleon_state_v1' // localStorage 키(앱 이름 접두어)
};
