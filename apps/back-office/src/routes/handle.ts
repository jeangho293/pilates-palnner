import type { Role } from '../api/types'

export interface Crumb {
  title: string
  path?: string
}

/** 라우트 메타 — 허용 역할과 브레드크럼 */
export interface RouteHandle {
  /** 이 경로(와 하위 경로)에 들어올 수 있는 역할. 없으면 로그인한 직원 모두 */
  roles?: Role[]
  crumbs?: Crumb[]
}

export const ALL_ROLES: Role[] = ['admin', 'instructor']
export const ADMIN_ONLY: Role[] = ['admin']
export const INSTRUCTOR_ONLY: Role[] = ['instructor']

/** 가장 안쪽 경로부터 거슬러 올라가며 허용 역할을 찾는다 */
export function resolveRoles(handles: (RouteHandle | undefined)[]): Role[] {
  for (let i = handles.length - 1; i >= 0; i--) {
    const roles = handles[i]?.roles
    if (roles) return roles
  }
  return ALL_ROLES
}
