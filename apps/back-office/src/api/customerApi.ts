import { request } from './http'
import type { CustomerDetail, CustomerListItem, CustomerListParams, Page } from './types'

export const customerApi = {
  list: (params: CustomerListParams) =>
    request<Page<CustomerListItem>>({ method: 'GET', url: '/customers', params }),
  get: (id: number) => request<CustomerDetail>({ method: 'GET', url: `/customers/${id}` }),
  /** 휴대폰 번호 전체 보기 (관리자 전용) */
  revealPhone: (id: number) =>
    request<{ phoneNumber: string | null }>({ method: 'GET', url: `/customers/${id}/phone` }),
}
