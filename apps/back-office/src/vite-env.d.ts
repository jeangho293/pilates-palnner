/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** core-api 주소 (예: http://localhost:3000) */
  readonly VITE_API_BASE_URL?: string
  /** 'false'면 mock 대신 실제 core-api를 호출한다. 기본은 mock */
  readonly VITE_USE_MOCK?: string
  /** mock: 미사용 로그인 만료 시간(분). 기본 30 */
  readonly VITE_MOCK_SESSION_MINUTES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
