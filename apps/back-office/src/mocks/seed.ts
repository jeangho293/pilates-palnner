import { hashPassword } from './config'
import type { CustomerRecord, DbShape, InstructorRecord, StaffRecord } from './db'
import type { Role } from '../api/types'
import { DEMO_ACCOUNTS } from '../lib/demoAccounts'

const DAY = 86_400_000
const HOUR = 3_600_000

/** 결정적 의사난수 (시드마다 같은 데이터) */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

export function startOfThisWeek(now = new Date()): Date {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  const diff = (d.getDay() + 6) % 7 // 월요일 시작
  d.setDate(d.getDate() - diff)
  return d
}

interface StaffSeed {
  name: string
  email: string
  role: Role
  password?: string
  /** 퇴사 직원만 표시. 나머지는 로그인 기록이 없으면 준비, 있으면 활성 */
  exited?: boolean
  createdDaysAgo: number
  /** null이면 아직 로그인한 적 없음 → 준비 상태 */
  lastLoginHoursAgo: number | null
  profile?: Omit<InstructorRecord, 'id' | 'staffId' | 'createdAt' | 'updatedAt'>
}

const STAFF: StaffSeed[] = [
  { name: '김원장', email: DEMO_ACCOUNTS.admin.email, role: 'admin', password: DEMO_ACCOUNTS.admin.password, createdDaysAgo: 120, lastLoginHoursAgo: 2 },
  { name: '박실장', email: 'manager@pilates.dev', role: 'admin', createdDaysAgo: 90, lastLoginHoursAgo: 30 },
  {
    name: '이수진', email: DEMO_ACCOUNTS.instructor.email, role: 'instructor', password: DEMO_ACCOUNTS.instructor.password, createdDaysAgo: 48, lastLoginHoursAgo: 17,
    profile: {
      displayName: '이수진', profileImageUrl: null, isPublic: true,
      specialties: ['재활', '체형 교정'],
      career: '- 국제 재활 필라테스 자격 (2019)\n- ○○ 필라테스 수석 강사 4년',
      introduction: '몸의 균형을 되찾는 수업을 합니다. 통증이 있는 분도 편하게 시작하세요.',
    },
  },
  {
    name: '정유나', email: 'yuna@pilates.dev', role: 'instructor', createdDaysAgo: 40, lastLoginHoursAgo: 60,
    profile: {
      displayName: '정유나', profileImageUrl: null, isPublic: true,
      specialties: ['매트', '호흡'],
      career: '- 매트 필라테스 지도자 과정 수료\n- 요가·필라테스 강사 6년',
      introduction: '호흡에 집중하는 매트 수업으로 하루의 긴장을 풀어 드립니다.',
    },
  },
  {
    name: '한서윤', email: 'seoyun@pilates.dev', role: 'instructor', createdDaysAgo: 35, lastLoginHoursAgo: 8,
    profile: {
      displayName: '서윤 강사', profileImageUrl: null, isPublic: true,
      specialties: ['기구', '산전·산후'],
      career: '- 리포머·캐딜락 기구 과정 수료\n- 산전·산후 필라테스 전문 과정',
      introduction: '산전·산후 회복과 기구 수업을 맡고 있어요.',
    },
  },
  {
    name: '오지민', email: 'jimin@pilates.dev', role: 'instructor', createdDaysAgo: 28, lastLoginHoursAgo: 100,
    profile: {
      displayName: '오지민', profileImageUrl: null, isPublic: false,
      specialties: ['다이어트', '근력'],
      career: '- 생활체육지도사 2급\n- 퍼스널 트레이닝 3년',
      introduction: '근력과 체력을 함께 키우는 리듬감 있는 수업입니다.',
    },
  },
  {
    name: '강도윤', email: 'doyun@pilates.dev', role: 'instructor', createdDaysAgo: 21, lastLoginHoursAgo: 5,
    profile: {
      displayName: '강도윤', profileImageUrl: null, isPublic: true,
      specialties: ['남성 필라테스', '척추 건강'],
      career: '- 물리치료학 전공\n- 재활 센터 근무 2년',
      introduction: '허리·목 통증이 있는 직장인을 위한 수업을 합니다.',
    },
  },
  {
    name: '윤가람', email: 'garam@pilates.dev', role: 'instructor', createdDaysAgo: 14, lastLoginHoursAgo: 48,
    profile: {
      displayName: '윤가람', profileImageUrl: null, isPublic: false,
      specialties: ['스트레칭'],
      career: '- 필라테스 지도자 과정 수료 (2025)',
      introduction: '',
    },
  },
  {
    // 준비 상태 데모 계정 — 첫 로그인하면 활성으로 바뀐다
    name: '박하늘', email: DEMO_ACCOUNTS.ready.email, role: 'instructor', password: DEMO_ACCOUNTS.ready.password, createdDaysAgo: 5, lastLoginHoursAgo: null,
    profile: { displayName: '박하늘', profileImageUrl: null, isPublic: false, specialties: [], career: '', introduction: '' },
  },
  {
    name: '최민지', email: DEMO_ACCOUNTS.exited.email, role: 'instructor', password: DEMO_ACCOUNTS.exited.password, exited: true, createdDaysAgo: 100, lastLoginHoursAgo: 24 * 50,
    profile: {
      displayName: '최민지', profileImageUrl: null, isPublic: false,
      specialties: ['기구'],
      career: '- 기구 필라테스 강사 3년',
      introduction: '기구 수업 전문 강사입니다.',
    },
  },
]

const FAMILY = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍']
const GIVEN = ['하나', '민서', '지우', '서연', '예린', '수아', '하은', '지민', '채원', '유진', '다은', '소율', '나연', '가은', '현우', '도현', '서준', '시우', '은지', '혜린', '보람', '세아', '윤아', '지호', '태희']

export function buildSeed(now = new Date()): Omit<DbShape, 'version'> {
  const t = now.getTime()
  const iso = (ms: number) => new Date(ms).toISOString()

  const staff: StaffRecord[] = []
  const instructors: InstructorRecord[] = []
  STAFF.forEach((s, i) => {
    const id = i + 1
    const createdAt = iso(t - s.createdDaysAgo * DAY)
    staff.push({
      id,
      email: s.email,
      password: hashPassword(s.password ?? 'pilates1234!', s.email),
      name: s.name,
      role: s.role,
      status: s.exited ? 'exited' : s.lastLoginHoursAgo === null ? 'ready' : 'active',
      lastLoginOn: s.lastLoginHoursAgo === null ? null : iso(t - s.lastLoginHoursAgo * HOUR),
      createdAt,
      updatedAt: createdAt,
    })
    if (s.profile) {
      instructors.push({
        id: instructors.length + 1,
        staffId: id,
        ...s.profile,
        createdAt,
        updatedAt: iso(t - Math.max(0, s.createdDaysAgo - 2) * DAY),
      })
    }
  })

  const rand = rng(20261119)
  const weekStart = startOfThisWeek(now).getTime()
  const customers: CustomerRecord[] = []
  const COUNT = 36
  const THIS_WEEK = 6
  for (let i = 0; i < COUNT; i++) {
    const id = i + 1
    const name = i === 0 ? '김하나' : `${FAMILY[Math.floor(rand() * FAMILY.length)]}${GIVEN[Math.floor(rand() * GIVEN.length)]}`
    const mid = String(1000 + Math.floor(rand() * 9000))
    const last = String(1000 + Math.floor(rand() * 9000))
    const phone = i === 0 ? '010-1234-5678' : i % 13 === 7 ? null : `010-${mid}-${last}`
    // 앞의 THIS_WEEK명은 이번 주(월요일~지금) 가입, 나머지는 지난 120일에 고르게
    const createdMs =
      i < THIS_WEEK
        ? weekStart + ((t - weekStart) * (THIS_WEEK - i)) / (THIS_WEEK + 1)
        : weekStart - (1 + rand() * 120) * DAY
    const createdAt = iso(createdMs)
    customers.push({
      id,
      kakaoId: `kakao_${300000 + id * 7}`,
      name,
      phoneNumber: phone,
      privacyAgreedOn: phone ? createdAt : null,
      createdAt,
      updatedAt: createdAt,
    })
  }

  return { staff, instructors, customers, sessions: [] }
}
