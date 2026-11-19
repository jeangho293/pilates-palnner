import { Button, Input, Space } from 'antd'
import { generatePassword } from '../lib/password'

interface Props {
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  id?: string
}

/** 초기·재설정 비밀번호 입력 + 자동 생성 (Form.Item 안에서 쓰는 제어 컴포넌트) */
export function PasswordField({ value, onChange, placeholder = '8자 이상', id }: Props) {
  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
      />
      <Button onClick={() => onChange?.(generatePassword())}>자동 생성</Button>
    </Space.Compact>
  )
}
