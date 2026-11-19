import { createContext, useContext } from 'react'
import type { Me } from '../api/types'

export const ME_QUERY_KEY = ['auth', 'me'] as const

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  status: AuthStatus
  me: Me | null
  login: (email: string, password: string) => Promise<Me>
  /** 로그아웃 API 호출 후 로그인 상태를 지운다 */
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있습니다.')
  return ctx
}

/** 로그인한 상태에서만 쓰는 화면용 — me가 반드시 있다 */
export function useMe(): Me {
  const { me } = useAuth()
  if (!me) throw new Error('로그인 정보가 없습니다.')
  return me
}

/**
 * 로그인 상태가 지워진 이유. RequireAuth가 로그인 화면으로 보낼 때 한 번 읽어 간다.
 * - expired: 30분 미사용 만료 / revoked: 다른 곳에서 세션이 끊김 / logout: 직접 로그아웃
 */
export type LogoutReason = 'expired' | 'revoked' | 'logout'
let pendingReason: LogoutReason | null = null

export function setLogoutReason(reason: LogoutReason) {
  pendingReason = reason
}

export function takeLogoutReason(): LogoutReason | null {
  const r = pendingReason
  pendingReason = null
  return r
}
