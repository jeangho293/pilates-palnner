import { Tag } from 'antd'
import type { StaffStatus } from '../../api/types'
import { STAFF_STATUS_COLOR, STAFF_STATUS_LABEL } from '../../lib/format'

/** 직원 상태 Tag (준비 / 활성 / 퇴사) */
export function StaffStatusTag({ status }: { status: StaffStatus }) {
  return (
    <Tag color={STAFF_STATUS_COLOR[status]} style={{ marginInlineEnd: 0 }}>
      {STAFF_STATUS_LABEL[status]}
    </Tag>
  )
}
