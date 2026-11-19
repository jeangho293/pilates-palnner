import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'

/** 라우터 최상위 — 모든 화면이 로그인 상태(AuthProvider)를 공유한다 */
export function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
