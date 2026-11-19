/** 데모 계정 — 로그인 화면 안내와 mock 시드가 같은 값을 쓴다 (기획 6. 포트폴리오 품질) */
export const DEMO_ACCOUNTS = {
  admin: { email: 'admin@pilates.dev', password: 'admin1234!' },
  instructor: { email: 'sujin@pilates.dev', password: 'sujin1234!' },
  /** 준비 상태 — 아직 로그인한 적 없음. 첫 로그인하면 활성으로 바뀐다 */
  ready: { email: 'haneul@pilates.dev', password: 'haneul1234!' },
  /** 퇴사 직원 — 로그인 거부 */
  exited: { email: 'minji@pilates.dev', password: 'minji1234!' },
} as const
