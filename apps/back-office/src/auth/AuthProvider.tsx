import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api/authApi'
import { onAuthEvent, tokenStore } from '../api/http'
import type { Me } from '../api/types'
import { AuthContext, ME_QUERY_KEY, setLogoutReason, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() => tokenStore.get())

  // 앱 시작 시 저장된 토큰으로 내 정보(me)를 불러와 로그인 상태·역할을 복원
  const meQuery = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: authApi.me,
    enabled: Boolean(token),
    staleTime: Infinity,
    retry: false,
  })

  const clearSession = useCallback(() => {
    tokenStore.clear()
    setToken(null)
    queryClient.clear()
  }, [queryClient])

  // 어느 화면에서든 401이 오면 로그인 상태를 지운다.
  // → RequireAuth가 만료 안내(?reason=)와 함께 로그인 화면으로 보낸다.
  useEffect(
    () =>
      onAuthEvent('unauthorized', (error) => {
        if (!tokenStore.get()) return
        setLogoutReason(error.code === 'SESSION_EXPIRED' ? 'expired' : 'revoked')
        clearSession()
      }),
    [clearSession],
  )

  const login = useCallback(
    async (email: string, password: string): Promise<Me> => {
      const { token: next, me } = await authApi.login({ email, password })
      tokenStore.set(next)
      queryClient.clear()
      queryClient.setQueryData(ME_QUERY_KEY, me)
      setToken(next)
      return me
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      /* 이미 만료된 세션이어도 로컬 상태는 지운다 */
    }
    setLogoutReason('logout')
    clearSession()
  }, [clearSession])

  const value = useMemo<AuthContextValue>(() => {
    let status: AuthContextValue['status'] = 'anonymous'
    if (token) {
      if (meQuery.data) status = 'authenticated'
      else if (meQuery.isPending && !meQuery.isError) status = 'loading'
    }
    return { status, me: token ? (meQuery.data ?? null) : null, login, logout }
  }, [token, meQuery.data, meQuery.isPending, meQuery.isError, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
