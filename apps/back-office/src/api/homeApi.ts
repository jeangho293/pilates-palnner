import { request } from './http'
import type { HomeSummary } from './types'

export const homeApi = {
  summary: () => request<HomeSummary>({ method: 'GET', url: '/home/summary' }),
}
