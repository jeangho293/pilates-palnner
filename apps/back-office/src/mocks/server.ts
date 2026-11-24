/**
 * Mock core-api. `request()`가 보낸 (method, url, params, body, token)을 받아
 * 실제 서버처럼 인증·권한·검증을 하고 JSON 형태로 응답한다.
 * 권한 판정은 화면 가드와 별개로 여기서도 요청 단위로 한다 (기획 6. 권한 경계).
 */
import { ApiError } from '../api/errors'
import type {
  AdminHomeSummary,
  CustomerDetail,
  CustomerListItem,
  Instructor,
  InstructorHomeSummary,
  InstructorProfileInput,
  Me,
  Page,
  Role,
  SortOrder,
  Staff,
  StaffCreateInput,
} from '../api/types'
import { hashPassword, mockConfig } from './config'
import {
  commit,
  getDb,
  nextId,
  resetDb,
  type CustomerRecord,
  type InstructorRecord,
  type SessionRecord,
  type StaffRecord,
} from './db'
import { startOfThisWeek } from './seed'

export interface MockRequest {
  method: string
  url: string
  params?: object
  body?: unknown
  token: string | null
}

interface Ctx {
  params: Record<string, string>
  query: Record<string, string | undefined>
  body: Record<string, unknown>
  token: string | null
}

type Handler = (ctx: Ctx) => unknown

// ── 유틸 ────────────────────────────────────────────────
const nowIso = () => new Date().toISOString()
const delay = () =>
  new Promise((r) =>
    setTimeout(r, mockConfig.delayMinMs + Math.random() * (mockConfig.delayMaxMs - mockConfig.delayMinMs)),
  )
const clone = <T>(v: T): T => structuredClone(v)

function notFound(what = '대상'): never {
  throw new ApiError(404, 'NOT_FOUND', `${what}을(를) 찾을 수 없습니다.`)
}

function invalid(message: string, field?: string): never {
  throw new ApiError(400, 'VALIDATION_FAILED', message, field ? { field } : undefined)
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function digits(v: string | null): string {
  return (v ?? '').replace(/\D/g, '')
}

export function maskPhone(phone: string | null): string | null {
  if (!phone) return null
  const d = digits(phone)
  if (d.length < 8) return phone
  return `${d.slice(0, 3)}-****-${d.slice(-4)}`
}

function paginate<T>(rows: T[], query: Ctx['query']): Page<T> {
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10))
  return {
    items: rows.slice((page - 1) * pageSize, page * pageSize),
    total: rows.length,
    page,
    pageSize,
  }
}

function sortBy<T>(rows: T[], get: (r: T) => string | number | boolean | null, order: SortOrder) {
  const dir = order === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    const va = get(a)
    const vb = get(b)
    // 값 없음(null)은 방향과 관계없이 항상 뒤로
    if (va === null && vb === null) return 0
    if (va === null) return 1
    if (vb === null) return -1
    if (typeof va === 'string' && typeof vb === 'string') return dir * va.localeCompare(vb, 'ko')
    return dir * (Number(va) - Number(vb))
  })
}

const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v)

// ── 인증 ────────────────────────────────────────────────
function newToken() {
  return `mock.${crypto.randomUUID()}`
}

function authenticate(ctx: Ctx, roles?: Role[]): { staff: StaffRecord; session: SessionRecord } {
  const db = getDb()
  if (!ctx.token) throw new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다.')
  const session = db.sessions.find((s) => s.token === ctx.token)
  if (!session) throw new ApiError(401, 'UNAUTHORIZED', '로그인이 만료되었습니다. 다시 로그인하세요.')
  const idle = Date.now() - new Date(session.lastActivityAt).getTime()
  if (idle > mockConfig.sessionTimeoutMs) {
    db.sessions = db.sessions.filter((s) => s !== session)
    commit()
    throw new ApiError(401, 'SESSION_EXPIRED', '오래 사용하지 않아 로그인이 만료되었습니다.')
  }
  const staff = db.staff.find((s) => s.id === session.staffId)
  // 퇴사 처리된 직원의 기존 세션은 무효
  if (!staff || staff.status === 'exited') {
    db.sessions = db.sessions.filter((s) => s !== session)
    commit()
    throw new ApiError(401, 'UNAUTHORIZED', '로그인이 만료되었습니다. 다시 로그인하세요.')
  }
  session.lastActivityAt = nowIso()
  commit()
  if (roles && !roles.includes(staff.role)) {
    throw new ApiError(403, 'FORBIDDEN', '이 기능을 사용할 권한이 없습니다.')
  }
  return { staff, session }
}

function instructorOf(staffId: number): InstructorRecord | undefined {
  return getDb().instructors.find((i) => i.staffId === staffId)
}

function toMe(s: StaffRecord): Me {
  return {
    id: s.id,
    email: s.email,
    name: s.name,
    role: s.role,
    instructorId: s.role === 'instructor' ? (instructorOf(s.id)?.id ?? null) : null,
  }
}

function toStaff(s: StaffRecord): Staff {
  // password(해시)는 응답에서 절대 내보내지 않는다
  const { password: _omit, ...rest } = s
  void _omit
  return clone(rest)
}

function toInstructor(i: InstructorRecord): Instructor {
  const s = getDb().staff.find((x) => x.id === i.staffId)
  return {
    ...clone(i),
    staff: s
      ? { id: s.id, name: s.name, email: s.email, status: s.status }
      : { id: i.staffId, name: '-', email: '-', status: 'exited' },
  }
}

function toCustomerItem(c: CustomerRecord): CustomerListItem {
  return {
    id: c.id,
    name: c.name,
    phoneNumberMasked: maskPhone(c.phoneNumber),
    privacyAgreedOn: c.privacyAgreedOn,
    createdAt: c.createdAt,
  }
}

function findStaff(id: string): StaffRecord {
  return getDb().staff.find((s) => s.id === Number(id)) ?? notFound('직원')
}

function findInstructor(id: string): InstructorRecord {
  return getDb().instructors.find((i) => i.id === Number(id)) ?? notFound('강사 프로필')
}

function validatePassword(pw: string, field = 'password') {
  if (pw.length < 8) invalid('비밀번호는 8자 이상이어야 합니다.', field)
}

function applyProfile(rec: InstructorRecord, body: Record<string, unknown>, allowVisibility: boolean) {
  const displayName = str(body.displayName)
  if (!displayName) invalid('표시 이름을 입력하세요.', 'displayName')
  const input = body as Partial<InstructorProfileInput>
  rec.displayName = displayName
  rec.profileImageUrl = typeof input.profileImageUrl === 'string' && input.profileImageUrl ? input.profileImageUrl : null
  rec.career = str(input.career)
  rec.introduction = str(input.introduction)
  rec.specialties = Array.isArray(input.specialties)
    ? [...new Set(input.specialties.map((x) => String(x).trim()).filter(Boolean))].slice(0, 10)
    : []
  if (allowVisibility && typeof input.isPublic === 'boolean') {
    setVisibility(rec, input.isPublic)
  }
  rec.updatedAt = nowIso()
}

function setVisibility(rec: InstructorRecord, isPublic: boolean) {
  const staff = getDb().staff.find((s) => s.id === rec.staffId)
  if (isPublic && (!staff || staff.status === 'exited')) {
    throw new ApiError(
      409,
      'INSTRUCTOR_STAFF_EXITED',
      '퇴사한 직원의 프로필은 공개할 수 없습니다. 직원을 먼저 복귀 처리하세요.',
    )
  }
  rec.isPublic = isPublic
}

/** 강사 프로필 작성 필요 여부 (소개글·전문 분야가 비어 있음) */
function needsWriting(i: InstructorRecord) {
  return !i.introduction || i.specialties.length === 0
}

// ── 라우트 ───────────────────────────────────────────────
const routes: Record<string, Handler> = {
  // 인증
  'POST /auth/login': (ctx) => {
    const db = getDb()
    const email = str(ctx.body.email).toLowerCase()
    const password = typeof ctx.body.password === 'string' ? ctx.body.password : ''
    const staff = db.staff.find((s) => s.email === email)
    if (!staff || staff.password !== hashPassword(password, staff.email)) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.')
    }
    if (staff.status === 'exited') {
      throw new ApiError(403, 'ACCOUNT_EXITED', '퇴사 처리된 계정입니다. 관리자에게 문의하세요.')
    }

    // 준비 상태 직원은 첫 로그인에 성공하면 활성이 된다
    if (staff.status === 'ready') {
      staff.status = 'active'
      staff.updatedAt = nowIso()
    }
    staff.lastLoginOn = nowIso()
    const token = newToken()
    db.sessions.push({ token, staffId: staff.id, createdAt: nowIso(), lastActivityAt: nowIso() })
    commit()
    return { token, me: toMe(staff) }
  },
  'POST /auth/logout': (ctx) => {
    const db = getDb()
    db.sessions = db.sessions.filter((s) => s.token !== ctx.token)
    commit()
    return undefined
  },
  'GET /auth/me': (ctx) => toMe(authenticate(ctx).staff),

  // 내 정보
  'PUT /me': (ctx) => {
    const { staff } = authenticate(ctx)
    const name = str(ctx.body.name)
    if (!name) invalid('이름을 입력하세요.', 'name')
    staff.name = name
    staff.updatedAt = nowIso()
    commit()
    return toMe(staff)
  },
  'POST /me/password': (ctx) => {
    const { staff, session } = authenticate(ctx)
    const current = typeof ctx.body.currentPassword === 'string' ? ctx.body.currentPassword : ''
    const next = typeof ctx.body.newPassword === 'string' ? ctx.body.newPassword : ''
    if (staff.password !== hashPassword(current, staff.email)) {
      throw new ApiError(400, 'INVALID_CURRENT_PASSWORD', '현재 비밀번호가 올바르지 않습니다.', {
        field: 'currentPassword',
      })
    }
    validatePassword(next, 'newPassword')
    staff.password = hashPassword(next, staff.email)
    staff.updatedAt = nowIso()
    // 다른 기기(세션)의 로그인은 만료
    const db = getDb()
    db.sessions = db.sessions.filter((s) => s.staffId !== staff.id || s.token === session.token)
    commit()
    return undefined
  },

  // 홈
  'GET /home/summary': (ctx) => {
    const { staff } = authenticate(ctx)
    const db = getDb()
    if (staff.role === 'instructor') {
      const p = instructorOf(staff.id) ?? notFound('강사 프로필')
      const summary: InstructorHomeSummary = {
        role: 'instructor',
        profile: {
          id: p.id,
          displayName: p.displayName,
          profileImageUrl: p.profileImageUrl,
          isPublic: p.isPublic,
          specialties: [...p.specialties],
          updatedAt: p.updatedAt,
        },
      }
      return summary
    }
    const countBy = (status: StaffRecord['status']) => db.staff.filter((s) => s.status === status).length
    const active = db.staff.filter((s) => s.status === 'active')
    const weekStart = startOfThisWeek().getTime()
    const summary: AdminHomeSummary = {
      role: 'admin',
      staff: {
        ready: countBy('ready'),
        active: active.length,
        exited: countBy('exited'),
        admins: active.filter((s) => s.role === 'admin').length,
        instructors: active.filter((s) => s.role === 'instructor').length,
      },
      instructors: {
        public: db.instructors.filter((i) => i.isPublic).length,
        total: db.instructors.length,
        private: db.instructors.filter((i) => !i.isPublic).length,
        needsWriting: db.instructors.filter(needsWriting).length,
      },
      customers: {
        thisWeek: db.customers.filter((c) => new Date(c.createdAt).getTime() >= weekStart).length,
        total: db.customers.length,
      },
    }
    return summary
  },

  // 직원 (관리자)
  // GET /staff(목록)·GET /staff/:id(상세)는 core-api 연동 완료 — mock 없음 (api/staffApi.ts)
  'POST /staff': (ctx) => {
    authenticate(ctx, ['admin'])
    const db = getDb()
    const body = ctx.body as Partial<StaffCreateInput>
    const name = str(body.name)
    const email = str(body.email).toLowerCase()
    const password = typeof body.password === 'string' ? body.password : ''
    if (!name) invalid('이름을 입력하세요.', 'name')
    if (!isEmail(email)) invalid('이메일 형식이 올바르지 않습니다.', 'email')
    if (body.role !== 'admin' && body.role !== 'instructor') invalid('역할을 선택하세요.', 'role')
    validatePassword(password)
    if (db.staff.some((s) => s.email === email)) {
      throw new ApiError(409, 'EMAIL_TAKEN', '이미 사용 중인 이메일입니다.', { field: 'email' })
    }
    const ts = nowIso()
    const rec: StaffRecord = {
      id: nextId(db.staff),
      email,
      password: hashPassword(password, email),
      name,
      role: body.role,
      // 새 직원은 준비 상태로 시작, 첫 로그인에 활성이 된다
      status: 'ready',
      lastLoginOn: null,
      createdAt: ts,
      updatedAt: ts,
    }
    db.staff.push(rec)
    if (rec.role === 'instructor') {
      // 강사 역할로 만들면 비공개 강사 프로필이 함께 생긴다
      db.instructors.push({
        id: nextId(db.instructors),
        staffId: rec.id,
        displayName: name,
        profileImageUrl: null,
        career: '',
        specialties: [],
        introduction: '',
        isPublic: false,
        createdAt: ts,
        updatedAt: ts,
      })
    }
    commit()
    return toStaff(rec)
  },
  'PUT /staff/:id': (ctx) => {
    authenticate(ctx, ['admin'])
    const s = findStaff(ctx.params.id)
    const name = str(ctx.body.name)
    if (!name) invalid('이름을 입력하세요.', 'name')
    s.name = name
    s.updatedAt = nowIso()
    commit()
    return toStaff(s)
  },
  'POST /staff/:id/password': (ctx) => {
    authenticate(ctx, ['admin'])
    const s = findStaff(ctx.params.id)
    const password = typeof ctx.body.password === 'string' ? ctx.body.password : ''
    validatePassword(password)
    s.password = hashPassword(password, s.email)
    s.updatedAt = nowIso()
    const db = getDb()
    db.sessions = db.sessions.filter((x) => x.staffId !== s.id)
    commit()
    return undefined
  },
  'POST /staff/:id/exit': (ctx) => {
    const { staff: me } = authenticate(ctx, ['admin'])
    const s = findStaff(ctx.params.id)
    if (s.id === me.id) {
      throw new ApiError(400, 'CANNOT_EXIT_SELF', '자기 자신은 퇴사 처리할 수 없습니다.')
    }
    if (s.status === 'exited') invalid('이미 퇴사 처리된 직원입니다.')
    s.status = 'exited'
    s.updatedAt = nowIso()
    const i = instructorOf(s.id)
    if (i) {
      i.isPublic = false
      i.updatedAt = nowIso()
    }
    const db = getDb()
    db.sessions = db.sessions.filter((x) => x.staffId !== s.id)
    commit()
    return toStaff(s)
  },
  'POST /staff/:id/reinstate': (ctx) => {
    authenticate(ctx, ['admin'])
    const s = findStaff(ctx.params.id)
    if (s.status !== 'exited') invalid('퇴사 처리된 직원만 복귀 처리할 수 있습니다.')
    // 강사 프로필 공개는 따로 켜야 한다
    s.status = 'active'
    s.updatedAt = nowIso()
    commit()
    return toStaff(s)
  },

  // 강사 프로필 (관리자)
  'GET /instructors': (ctx) => {
    authenticate(ctx, ['admin'])
    const { q, visibility, sortField = 'createdAt', sortOrder = 'asc' } = ctx.query
    let rows = getDb().instructors.map(toInstructor)
    const keyword = (q ?? '').trim().toLowerCase()
    if (keyword) {
      rows = rows.filter(
        (i) =>
          i.displayName.toLowerCase().includes(keyword) ||
          i.specialties.some((sp) => sp.toLowerCase().includes(keyword)),
      )
    }
    if (visibility === 'public') rows = rows.filter((i) => i.isPublic)
    if (visibility === 'private') rows = rows.filter((i) => !i.isPublic)
    const getters: Record<string, (i: Instructor) => string | number | boolean | null> = {
      displayName: (i) => i.displayName,
      staffEmail: (i) => i.staff.email,
      isPublic: (i) => (i.isPublic ? 1 : 0),
      createdAt: (i) => i.createdAt,
    }
    rows = sortBy(rows, getters[sortField] ?? getters.createdAt, sortOrder as SortOrder)
    return paginate(rows, ctx.query)
  },
  'GET /instructors/:id': (ctx) => {
    authenticate(ctx, ['admin'])
    return toInstructor(findInstructor(ctx.params.id))
  },
  'PUT /instructors/:id': (ctx) => {
    authenticate(ctx, ['admin'])
    const rec = findInstructor(ctx.params.id)
    const draft = clone(rec)
    applyProfile(draft, ctx.body, true)
    Object.assign(rec, draft)
    commit()
    return toInstructor(rec)
  },
  'PUT /instructors/:id/visibility': (ctx) => {
    authenticate(ctx, ['admin'])
    const rec = findInstructor(ctx.params.id)
    if (typeof ctx.body.isPublic !== 'boolean') invalid('공개 여부가 올바르지 않습니다.', 'isPublic')
    setVisibility(rec, ctx.body.isPublic)
    rec.updatedAt = nowIso()
    commit()
    return toInstructor(rec)
  },

  // 내 강사 프로필 (강사)
  'GET /me/instructor-profile': (ctx) => {
    const { staff } = authenticate(ctx, ['instructor'])
    return toInstructor(instructorOf(staff.id) ?? notFound('강사 프로필'))
  },
  'PUT /me/instructor-profile': (ctx) => {
    const { staff } = authenticate(ctx, ['instructor'])
    const rec = instructorOf(staff.id) ?? notFound('강사 프로필')
    const draft = clone(rec)
    // 강사는 공개 여부를 바꿀 수 없다 — 보내도 무시
    applyProfile(draft, ctx.body, false)
    Object.assign(rec, draft)
    commit()
    return toInstructor(rec)
  },

  // 고객 (관리자, 조회 전용)
  'GET /customers': (ctx) => {
    authenticate(ctx, ['admin'])
    const { q, joined, sortField = 'createdAt', sortOrder = 'desc' } = ctx.query
    let rows = getDb().customers
    const keyword = (q ?? '').trim()
    if (keyword) {
      const qDigits = keyword.replace(/[\s-]/g, '')
      rows = /^\d+$/.test(qDigits)
        ? // 숫자만 입력하면 휴대폰 번호 뒷자리로 찾는다
          rows.filter((c) => digits(c.phoneNumber).endsWith(qDigits))
        : rows.filter((c) => c.name.includes(keyword))
    }
    if (joined === 'thisWeek') {
      const weekStart = startOfThisWeek().getTime()
      rows = rows.filter((c) => new Date(c.createdAt).getTime() >= weekStart)
    }
    const getters: Record<string, (c: CustomerRecord) => string | null> = {
      name: (c) => c.name,
      createdAt: (c) => c.createdAt,
      privacyAgreedOn: (c) => c.privacyAgreedOn,
    }
    rows = sortBy(rows, getters[sortField] ?? getters.createdAt, sortOrder as SortOrder)
    return paginate(rows.map(toCustomerItem), ctx.query)
  },
  'GET /customers/:id': (ctx) => {
    authenticate(ctx, ['admin'])
    const c = getDb().customers.find((x) => x.id === Number(ctx.params.id)) ?? notFound('고객')
    const detail: CustomerDetail = { ...toCustomerItem(c), kakaoLinked: Boolean(c.kakaoId), updatedAt: c.updatedAt }
    return detail
  },
  'GET /customers/:id/phone': (ctx) => {
    authenticate(ctx, ['admin'])
    const c = getDb().customers.find((x) => x.id === Number(ctx.params.id)) ?? notFound('고객')
    return { phoneNumber: c.phoneNumber }
  },
}

const compiled = Object.entries(routes).map(([key, handler]) => {
  const [method, path] = key.split(' ')
  const names: string[] = []
  const pattern = new RegExp(
    `^${path.replace(/:(\w+)/g, (_, n: string) => {
      names.push(n)
      return '([^/]+)'
    })}$`,
  )
  return { method, pattern, names, handler }
})

export async function mockRequest<T>(req: MockRequest): Promise<T> {
  await delay()
  const path = req.url.split('?')[0]
  for (const r of compiled) {
    if (r.method !== req.method) continue
    const m = path.match(r.pattern)
    if (!m) continue
    const params = Object.fromEntries(r.names.map((n, i) => [n, decodeURIComponent(m[i + 1])]))
    const query = Object.fromEntries(
      Object.entries(req.params ?? {}).map(([k, v]) => [k, v === undefined || v === null ? undefined : String(v)]),
    )
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>
    return clone(r.handler({ params, query, body, token: req.token })) as T
  }
  throw new ApiError(404, 'NOT_FOUND', `요청한 API를 찾을 수 없습니다: ${req.method} ${path}`)
}

// 데모·디버깅용 도구 (개발 모드에서만 window.__boMock)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as { __boMock: unknown }).__boMock = {
    /** 지금 세션을 31분 전 활동으로 돌려 만료를 재현한다 */
    expireSession() {
      const db = getDb()
      const past = new Date(Date.now() - mockConfig.sessionTimeoutMs - 60_000).toISOString()
      db.sessions.forEach((s) => (s.lastActivityAt = past))
      commit()
      return '세션을 만료시켰습니다. 화면에서 아무 요청이나 보내면 로그인 화면으로 이동합니다.'
    },
    /** 시드 데이터로 초기화 (로그아웃됨) */
    reset() {
      resetDb()
      return '시드 데이터로 초기화했습니다. 새로고침하세요.'
    },
    db: getDb,
  }
}
