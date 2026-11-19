import { request } from './http'
import type { LoginResult, Me } from './types'

export const authApi = {
  login: (body: { email: string; password: string }) =>
    request<LoginResult>({ method: 'POST', url: '/auth/login', body, auth: false }),
  logout: () => request<void>({ method: 'POST', url: '/auth/logout' }),
  me: () => request<Me>({ method: 'GET', url: '/auth/me' }),
}

/** 내 정보 (bo-my-info) */
export const accountApi = {
  updateName: (name: string) => request<Me>({ method: 'PATCH', url: '/me', body: { name } }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<void>({ method: 'POST', url: '/me/password', body }),
}
