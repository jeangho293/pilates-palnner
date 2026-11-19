import { UserOutlined } from '@ant-design/icons'
import { Avatar } from 'antd'
import { tokens } from '../theme/tokens'

/** 강사 사진 (없으면 이름 첫 글자 placeholder) */
export function InstructorAvatar({ name, profileImageUrl, size = 40 }: { name: string; profileImageUrl: string | null; size?: number }) {
  if (profileImageUrl) return <Avatar src={profileImageUrl} size={size} alt={`${name} 사진`} />
  return (
    <Avatar
      size={size}
      style={{ background: tokens.brand.mainSoft, color: tokens.brand.mainHover, flex: '0 0 auto' }}
      icon={name ? undefined : <UserOutlined />}
    >
      {name ? name.slice(0, 1) : null}
    </Avatar>
  )
}
