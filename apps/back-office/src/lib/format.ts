import dayjs from 'dayjs'

export const formatDate = (v: string | null | undefined) => (v ? dayjs(v).format('YYYY-MM-DD') : '-')
export const formatDateTime = (v: string | null | undefined) =>
  v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'

export const ROLE_LABEL = { admin: '관리자', instructor: '강사' } as const

export const STAFF_STATUS_LABEL = { ready: '준비', active: '활성', exited: '퇴사' } as const
/** 상태 Tag 색 (antd preset) */
export const STAFF_STATUS_COLOR = { ready: 'processing', active: 'success', exited: 'default' } as const
