import { request } from './http'
import type { Instructor, InstructorListParams, InstructorProfileInput, Page } from './types'

export const instructorApi = {
  list: (params: InstructorListParams) =>
    request<Page<Instructor>>({ method: 'GET', url: '/instructors', params }),
  get: (id: number) => request<Instructor>({ method: 'GET', url: `/instructors/${id}` }),
  update: (id: number, body: InstructorProfileInput) =>
    request<Instructor>({ method: 'PATCH', url: `/instructors/${id}`, body }),
  setVisibility: (id: number, isPublic: boolean) =>
    request<Instructor>({ method: 'PATCH', url: `/instructors/${id}/visibility`, body: { isPublic } }),
  /** 강사 본인 (bo-my-instructor-profile) */
  getMine: () => request<Instructor>({ method: 'GET', url: '/me/instructor-profile' }),
  updateMine: (body: Omit<InstructorProfileInput, 'isPublic'>) =>
    request<Instructor>({ method: 'PATCH', url: '/me/instructor-profile', body }),
}
