import { request } from './http'
import type { Instructor, InstructorListParams, InstructorProfileInput, InstructorSortField, Page } from './types'

/** GET /admins/instructors/search 쿼리 (core-api AdminInstructorQueryDto) */
interface InstructorSearchQuery {
  page: number
  limit: number
  sort?: 'name' | 'isPublic' | 'createdAt'
  order?: 'ASC' | 'DESC'
  keyword?: string
  isPublic?: boolean
}

/** core-api 강사 응답 (InstructorResponseDto) */
interface InstructorResponse extends Omit<Instructor, 'displayName' | 'profileImageUrl' | 'createdAt' | 'updatedAt'> {
  name: string
  profileImageUrl: string
  createdAt?: string
  updatedAt?: string
}

/** 화면 정렬 키 → core-api 정렬 컬럼 */
const SORT_FIELD: Record<InstructorSortField, InstructorSearchQuery['sort']> = {
  displayName: 'name',
  isPublic: 'isPublic',
  createdAt: 'createdAt',
}

function toInstructor({ name, profileImageUrl, ...rest }: InstructorResponse): Instructor {
  return {
    ...rest,
    displayName: name,
    // 사진이 없으면 core-api는 빈 문자열을 준다 → 기본 아바타를 쓰도록 null
    profileImageUrl: profileImageUrl || null,
    createdAt: rest.createdAt ?? '',
    updatedAt: rest.updatedAt ?? '',
  }
}

export const instructorApi = {
  /** 강사 프로필 목록·검색·공개 필터 — core-api 연동 완료 (항상 실제 API 호출) */
  list: async (params: InstructorListParams): Promise<Page<Instructor>> => {
    const query: InstructorSearchQuery = {
      page: params.page,
      limit: params.pageSize,
      sort: params.sortField ? SORT_FIELD[params.sortField] : undefined,
      order: params.sortOrder?.toUpperCase() as InstructorSearchQuery['order'],
      keyword: params.q,
      isPublic: params.visibility === 'public' ? true : params.visibility === 'private' ? false : undefined,
    }
    const { data } = await request<{ data: { instructors: InstructorResponse[]; total: number } }>({
      method: 'GET',
      url: '/admins/instructors/search',
      params: query,
      mock: false,
    })
    return {
      items: data.instructors.map(toInstructor),
      total: data.total,
      page: params.page,
      pageSize: params.pageSize,
    }
  },
  get: (id: number) => request<Instructor>({ method: 'GET', url: `/instructors/${id}` }),
  update: (id: number, body: InstructorProfileInput) =>
    request<Instructor>({ method: 'PUT', url: `/instructors/${id}`, body }),
  setVisibility: (id: number, isPublic: boolean) =>
    request<Instructor>({ method: 'PUT', url: `/instructors/${id}/visibility`, body: { isPublic } }),
  /** 강사 본인 (bo-my-instructor-profile) */
  getMine: () => request<Instructor>({ method: 'GET', url: '/me/instructor-profile' }),
  updateMine: (body: Omit<InstructorProfileInput, 'isPublic'>) =>
    request<Instructor>({ method: 'PUT', url: '/me/instructor-profile', body }),
}
