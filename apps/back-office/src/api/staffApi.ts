import { request } from './http'
import type { Page, Staff, StaffCreateInput, StaffDetail, StaffListParams, StaffStatus } from './types'

/** GET /admins/staffs/search 쿼리 (core-api AdminStaffQueryDto) */
interface StaffSearchQuery {
  page: number
  limit: number
  sort?: string
  order?: 'ASC' | 'DESC'
  keyword?: string
  statuses?: StaffStatus[]
}

/** GET /admins/staffs/search 응답 */
interface StaffSearchResponse {
  data: { staffs: Staff[]; total: number }
}

export const staffApi = {
  /** 직원 목록·검색·필터 — core-api 연동 완료 (항상 실제 API 호출) */
  list: async (params: StaffListParams): Promise<Page<Staff>> => {
    const query: StaffSearchQuery = {
      page: params.page,
      limit: params.pageSize,
      sort: params.sortField,
      order: params.sortOrder?.toUpperCase() as StaffSearchQuery['order'],
      keyword: params.q,
      statuses: params.status && params.status !== 'all' ? [params.status] : undefined,
    }
    const { data } = await request<StaffSearchResponse>({
      method: 'GET',
      url: '/admins/staffs/search',
      params: query,
      mock: false,
    })
    return { items: data.staffs, total: data.total, page: params.page, pageSize: params.pageSize }
  },
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
