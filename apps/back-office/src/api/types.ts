/** core-api 계약(예정)에 맞춘 백오피스 도메인 타입. 실제 API 확정 시 이 파일만 맞추면 된다. */

export type Role = 'admin' | 'instructor'

export type SortOrder = 'asc' | 'desc'

export interface ListParams<F extends string = string> {
  page: number
  pageSize: number
  sortField?: F
  sortOrder?: SortOrder
  q?: string
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** 로그인한 직원 (GET /auth/me) */
export interface Me {
  id: number
  email: string
  name: string
  role: Role
  /** 강사 역할이면 연결된 강사 프로필 id */
  instructorId: number | null
}

export interface LoginResult {
  token: string
  me: Me
}

/** 직원 상태: 준비(생성 직후, 첫 로그인 전) → 활성 → 퇴사 */
export type StaffStatus = 'ready' | 'active' | 'exited'

export interface Staff {
  id: number
  email: string
  name: string
  role: Role
  status: StaffStatus
  lastLoginOn: string | null
  createdAt: string
  updatedAt: string
}

export interface StaffDetail extends Staff {
  instructor: Pick<Instructor, 'id' | 'displayName' | 'profileImageUrl' | 'isPublic'> | null
}

export type StaffSortField = 'name' | 'email' | 'role' | 'status' | 'lastLoginOn' | 'createdAt'
export type StaffStatusFilter = 'all' | StaffStatus

export interface StaffListParams extends ListParams<StaffSortField> {
  status?: StaffStatusFilter
}

export interface StaffCreateInput {
  name: string
  email: string
  role: Role
  password: string
}

export interface Instructor {
  id: number
  staffId: number
  displayName: string
  profileImageUrl: string | null
  career: string
  specialties: string[]
  introduction: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  staff: Pick<Staff, 'id' | 'name' | 'email' | 'status'>
}

export type InstructorSortField = 'displayName' | 'staffEmail' | 'isPublic' | 'createdAt'
export type InstructorVisibilityFilter = 'all' | 'public' | 'private'

export interface InstructorListParams extends ListParams<InstructorSortField> {
  visibility?: InstructorVisibilityFilter
}

/** 강사 프로필 수정 입력. 공개 여부는 관리자만 보낸다. */
export interface InstructorProfileInput {
  displayName: string
  profileImageUrl: string | null
  career: string
  specialties: string[]
  introduction: string
  isPublic?: boolean
}

export interface CustomerListItem {
  id: number
  name: string
  /** 서버가 가운데 자리를 가려서 내려준다 (010-****-5678) */
  phoneNumberMasked: string | null
  privacyAgreedOn: string | null
  createdAt: string
}

export interface CustomerDetail extends CustomerListItem {
  kakaoLinked: boolean
  updatedAt: string
}

export type CustomerSortField = 'name' | 'createdAt' | 'privacyAgreedOn'
export type CustomerJoinedFilter = 'all' | 'thisWeek'

export interface CustomerListParams extends ListParams<CustomerSortField> {
  joined?: CustomerJoinedFilter
}

export interface AdminHomeSummary {
  role: 'admin'
  /** 상태별 직원 수. admins·instructors는 활성 직원 중 역할별 수 */
  staff: { ready: number; active: number; exited: number; admins: number; instructors: number }
  instructors: { public: number; total: number; private: number; needsWriting: number }
  customers: { thisWeek: number; total: number }
}

export interface InstructorHomeSummary {
  role: 'instructor'
  profile: Pick<Instructor, 'id' | 'displayName' | 'profileImageUrl' | 'isPublic' | 'specialties' | 'updatedAt'>
}

export type HomeSummary = AdminHomeSummary | InstructorHomeSummary
