import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Drawer, Flex, Form, Input, Radio, Typography } from 'antd'
import { isApiError } from '../../api/errors'
import { staffApi } from '../../api/staffApi'
import type { Role, StaffCreateInput } from '../../api/types'
import { PasswordField } from '../../components/PasswordField'
import { passwordRules } from '../../lib/validation'

interface Props {
  open: boolean
  onClose: () => void
  /** 추가 성공 후 (목록이 새 직원을 바로 보여 주도록) */
  onCreated?: () => void
}

/** 직원 추가 Drawer (bo-staff-list) */
export function StaffCreateDrawer({ open, onClose, onCreated }: Props) {
  const [form] = Form.useForm<StaffCreateInput>()
  const role = Form.useWatch('role', form) as Role | undefined
  const { message } = App.useApp()
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: staffApi.create,
    meta: { handlesError: true },
    onSuccess: async (staff) => {
      message.success(
        staff.role === 'instructor'
          ? `${staff.name} 강사 계정을 준비 상태로 만들었습니다. 강사 프로필에서 소개를 작성한 뒤 공개하세요.`
          : `${staff.name} 직원 계정을 준비 상태로 만들었습니다.`,
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['staff'] }),
        queryClient.invalidateQueries({ queryKey: ['instructors'] }),
        queryClient.invalidateQueries({ queryKey: ['home'] }),
      ])
      onCreated?.()
      onClose()
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'EMAIL_TAKEN') {
        form.setFields([{ name: 'email', errors: ['이미 사용 중인 이메일입니다'] }])
        return
      }
      const field = isApiError(error) ? error.details?.field : undefined
      if (typeof field === 'string' && ['name', 'email', 'role', 'password'].includes(field)) {
        form.setFields([{ name: field as keyof StaffCreateInput, errors: [error.message] }])
        return
      }
      message.error(error.message)
    },
  })

  return (
    <Drawer
      title="직원 추가"
      open={open}
      onClose={onClose}
      size={480}
      destroyOnHidden
      afterOpenChange={(visible) => {
        if (!visible) {
          form.resetFields()
          create.reset()
        }
      }}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>취소</Button>
          <Button type="primary" loading={create.isPending} onClick={() => form.submit()}>
            추가
          </Button>
        </Flex>
      }
    >
      <Form<StaffCreateInput>
        form={form}
        layout="vertical"
        initialValues={{ role: 'instructor' }}
        onFinish={(values) => create.mutate({ ...values, email: values.email.trim().toLowerCase() })}
        disabled={create.isPending}
        requiredMark="optional"
      >
        <Form.Item label="이름" name="name" rules={[{ required: true, whitespace: true, message: '이름을 입력하세요' }]}>
          <Input placeholder="홍길동" maxLength={30} />
        </Form.Item>
        <Form.Item
          label="이메일 (로그인 아이디)"
          name="email"
          rules={[
            { required: true, message: '이메일을 입력하세요' },
            { type: 'email', message: '이메일 형식이 올바르지 않습니다' },
          ]}
        >
          <Input placeholder="name@pilates.dev" autoComplete="off" />
        </Form.Item>
        <Form.Item label="역할" name="role" rules={[{ required: true, message: '역할을 선택하세요' }]}>
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio.Button value="admin">관리자</Radio.Button>
            <Radio.Button value="instructor">강사</Radio.Button>
          </Radio.Group>
        </Form.Item>
        {role === 'instructor' && (
          <Alert
            type="info"
            showIcon
            title="비공개 강사 프로필이 함께 생성됩니다."
            description="계정은 준비 상태로 만들어지고, 처음 로그인하면 활성 상태가 됩니다. 프로필을 작성한 뒤 강사 프로필 화면에서 고객 웹 공개를 켜세요."
            style={{ marginTop: -8, marginBottom: 24 }}
          />
        )}
        {role === 'admin' && (
          <Alert
            type="warning"
            showIcon
            title="관리자는 직원 계정·강사 프로필·고객 정보를 모두 관리할 수 있습니다."
            description="계정은 준비 상태로 만들어지고, 처음 로그인하면 활성 상태가 됩니다."
            style={{ marginTop: -8, marginBottom: 24 }}
          />
        )}
        <Form.Item
          label="초기 비밀번호"
          name="password"
          rules={passwordRules}
          extra={
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              직원에게 직접 전달하세요. 직원은 로그인 후 내 정보에서 비밀번호를 바꿀 수 있습니다.
            </Typography.Text>
          }
        >
          <PasswordField />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
