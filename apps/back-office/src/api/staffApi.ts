import { request } from './http'
import type { Page, Staff, StaffCreateInput, StaffDetail, StaffListParams } from './types'

export const staffApi = {
  list: (params: StaffListParams) => request<Page<Staff>>({ method: 'GET', url: '/staff', params }),
  get: (id: number) => request<StaffDetail>({ method: 'GET', url: `/staff/${id}` }),
  create: (body: StaffCreateInput) => request<Staff>({ method: 'POST', url: '/staff', body }),
  updateName: (id: number, name: string) =>
    request<Staff>({ method: 'PATCH', url: `/staff/${id}`, body: { name } }),
  resetPassword: (id: number, password: string) =>
    request<void>({ method: 'POST', url: `/staff/${id}/password`, body: { password } }),
  /** 퇴사 처리 (준비·활성 → 퇴사) */
  exit: (id: number) => request<Staff>({ method: 'POST', url: `/staff/${id}/exit` }),
  /** 복귀 처리 (퇴사 → 활성) */
  reinstate: (id: number) => request<Staff>({ method: 'POST', url: `/staff/${id}/reinstate` }),
}
