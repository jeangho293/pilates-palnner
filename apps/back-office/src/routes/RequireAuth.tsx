import { useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { takeLogoutReason, useAuth } from '../auth/AuthContext'
import { FullPageSpin } from '../components/FullPageSpin'
import { paths } from './paths'

/** 로그인하지 않은 상태로 내부 화면에 들어오면 로그인 화면으로 보낸다 (돌아올 주소 보존) */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <FullPageSpin />
  if (status === 'anonymous') {
    return <RedirectToLogin from={location.pathname + location.search} />
  }
  return children
}

function RedirectToLogin({ from }: { from: string }) {
  // 렌더마다 다시 읽지 않도록 첫 렌더에서 한 번만 꺼낸다
  const [reason] = useState(takeLogoutReason)
  if (reason === 'logout') return <Navigate to={paths.login} replace />
  const to = reason ? `${paths.login}?reason=${reason}` : paths.login
  return <Navigate to={to} replace state={{ from }} />
}
