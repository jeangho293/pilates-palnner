/**
 * Mock 저장소 — 인메모리 + localStorage 영속화.
 * core-api가 준비되면 이 폴더(src/mocks)는 통째로 걷어낸다.
 */
import type { Role, StaffStatus } from '../api/types'
import { buildSeed } from './seed'

export interface StaffRecord {
  id: number
  email: string
  /** 해시만 저장한다 (원문 저장·응답 포함 금지) */
  password: string
  name: string
  role: Role
  status: StaffStatus
  lastLoginOn: string | null
  createdAt: string
  updatedAt: string
}

export interface InstructorRecord {
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
}

export interface CustomerRecord {
  id: number
  kakaoId: string
  name: string
  phoneNumber: string | null
  privacyAgreedOn: string | null
  createdAt: string
  updatedAt: string
}

export interface SessionRecord {
  token: string
  staffId: number
  createdAt: string
  lastActivityAt: string
}

export interface DbShape {
  version: number
  staff: StaffRecord[]
  instructors: InstructorRecord[]
  customers: CustomerRecord[]
  sessions: SessionRecord[]
}

/**
 * 스키마가 바뀌면 DB_VERSION을 올린다. 저장된 버전이 다르면 시드로 다시 만든다.
 * v2: 직원 상태(status: ready·active·exited)와 password(해시) 필드로 스키마 변경
 */
const STORAGE_KEY = 'bo.mock.db'
const DB_VERSION = 4

function load(): DbShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DbShape
      if (parsed.version === DB_VERSION) return parsed
    }
  } catch {
    /* 손상·접근 불가 → 시드로 */
  }
  return { version: DB_VERSION, ...buildSeed() }
}

let db: DbShape = load()

export function getDb(): DbShape {
  return db
}

/** 변경 사항을 localStorage에 저장한다 (새로고침해도 유지) */
export function commit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    /* 저장 실패 시 이번 탭 메모리에만 남는다 */
  }
}

export function resetDb() {
  db = { version: DB_VERSION, ...buildSeed() }
  commit()
}

export function nextId(rows: { id: number }[]): number {
  return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1
}

commit()
