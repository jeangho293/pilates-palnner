import {
  CalendarOutlined,
  CheckSquareOutlined,
  HomeOutlined,
  IdcardOutlined,
  MessageOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Tag } from 'antd'
import type { MenuProps } from 'antd'
import type { ReactNode } from 'react'
import type { Role } from '../api/types'
import { paths } from '../routes/paths'

type MenuItem = Required<MenuProps>['items'][number]

interface NavLeaf {
  key: string
  label: string
  icon: ReactNode
  roles: Role[]
}

interface ComingSoon {
  key: string
  label: string
  icon: ReactNode
  roles: Role[]
  release: 'MVP2' | 'MVP3'
}

const NAV_GROUPS: { key: string; title?: string; items: NavLeaf[] }[] = [
  { key: 'g-home', items: [{ key: paths.home, label: '홈', icon: <HomeOutlined />, roles: ['admin', 'instructor'] }] },
  {
    key: 'g-center',
    title: '센터 관리',
    items: [
      { key: paths.staffList, label: '직원 관리', icon: <TeamOutlined />, roles: ['admin'] },
      { key: paths.instructorList, label: '강사 프로필', icon: <IdcardOutlined />, roles: ['admin'] },
      { key: paths.customerList, label: '고객', icon: <SolutionOutlined />, roles: ['admin'] },
    ],
  },
  {
    key: 'g-instructor',
    title: '강사',
    items: [
      { key: paths.myInstructorProfile, label: '내 강사 프로필', icon: <IdcardOutlined />, roles: ['instructor'] },
    ],
  },
]

/** 준비 중 메뉴 — 클릭하면 안내만 띄운다 */
export const COMING_SOON: ComingSoon[] = [
  { key: 'soon:crm', label: '상담 CRM', icon: <MessageOutlined />, roles: ['admin'], release: 'MVP2' },
  { key: 'soon:timetable', label: '시간표', icon: <CalendarOutlined />, roles: ['admin', 'instructor'], release: 'MVP2' },
  { key: 'soon:membership', label: '회원·회원권', icon: <WalletOutlined />, roles: ['admin'], release: 'MVP2' },
  { key: 'soon:attendance', label: '예약·출석', icon: <CheckSquareOutlined />, roles: ['admin', 'instructor'], release: 'MVP3' },
]

const ACCOUNT: NavLeaf[] = [{ key: paths.myInfo, label: '내 정보', icon: <UserOutlined />, roles: ['admin', 'instructor'] }]

export function buildMenuItems(role: Role, collapsed: boolean): MenuItem[] {
  const items: MenuItem[] = []
  const leaf = (n: NavLeaf): MenuItem => ({ key: n.key, label: n.label, icon: n.icon })
  const group = (key: string, title: string | undefined, children: MenuItem[]) => {
    if (children.length === 0) return
    if (!title) items.push(...children)
    else if (collapsed) items.push({ type: 'divider', key: `${key}-div` }, ...children)
    else items.push({ type: 'group', key, label: title, children })
  }

  for (const g of NAV_GROUPS) group(g.key, g.title, g.items.filter((n) => n.roles.includes(role)).map(leaf))

  group(
    'g-soon',
    '준비 중',
    COMING_SOON.filter((n) => n.roles.includes(role)).map((n) => ({
      key: n.key,
      icon: n.icon,
      className: 'bo-menu-soon',
      label: (
        <span className="bo-menu-soon-label">
          <span>{n.label}</span>
          <Tag variant="filled" style={{ marginInlineEnd: 0 }}>
            {n.release}
          </Tag>
        </span>
      ),
      title: `${n.label} (${n.release})`,
    })),
  )

  group('g-account', '계정', ACCOUNT.filter((n) => n.roles.includes(role)).map(leaf))
  return items
}

export function findComingSoon(key: string) {
  return COMING_SOON.find((n) => n.key === key)
}

/** 현재 경로에 맞는 메뉴 키 */
export function selectedMenuKey(pathname: string): string {
  const candidates = [
    paths.staffList,
    paths.instructorList,
    paths.customerList,
    paths.myInstructorProfile,
    paths.myInfo,
  ]
  return candidates.find((p) => pathname === p || pathname.startsWith(`${p}/`)) ?? paths.home
}
