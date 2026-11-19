import { useMutation, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Col, Flex, Form, Input, Row, Typography } from 'antd'
import { accountApi } from '../../api/authApi'
import { isApiError } from '../../api/errors'
import { ME_QUERY_KEY, useMe } from '../../auth/AuthContext'
import { PageHeader } from '../../components/PageHeader'
import { ROLE_LABEL } from '../../lib/format'

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/** 내 정보 (관리자·강사 공통, bo-my-info) */
export function MyInfoPage() {
  const me = useMe()
  const { message, modal } = App.useApp()
  const queryClient = useQueryClient()
  const [nameForm] = Form.useForm<{ name: string }>()
  const [pwForm] = Form.useForm<PasswordForm>()
  const nameValue = Form.useWatch('name', nameForm)

  const updateName = useMutation({
    mutationFn: (name: string) => accountApi.updateName(name),
    onSuccess: (next) => {
      queryClient.setQueryData(ME_QUERY_KEY, next)
      void queryClient.invalidateQueries({ queryKey: ['staff'] })
      message.success('이름을 저장했습니다.')
    },
  })

  const changePassword = useMutation({
    mutationFn: accountApi.changePassword,
    meta: { handlesError: true },
    onSuccess: () => {
      pwForm.resetFields()
      modal.success({
        title: '비밀번호를 바꿨습니다',
        content: '다른 기기의 로그인은 만료됩니다. 다음 로그인부터 새 비밀번호를 쓰세요.',
        okText: '확인',
      })
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'INVALID_CURRENT_PASSWORD') {
        pwForm.setFields([{ name: 'currentPassword', errors: ['현재 비밀번호가 올바르지 않습니다'] }])
        return
      }
      if (isApiError(error) && error.details?.field === 'newPassword') {
        pwForm.setFields([{ name: 'newPassword', errors: [error.message] }])
        return
      }
      message.error(error.message)
    },
  })

  return (
    <>
      <PageHeader title="내 정보" description="내 이름과 비밀번호를 바꿀 수 있습니다." />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="기본 정보" style={{ height: '100%' }}>
            <Form
              form={nameForm}
              layout="vertical"
              initialValues={{ name: me.name }}
              onFinish={(v) => updateName.mutate(v.name.trim())}
              disabled={updateName.isPending}
            >
              <Form.Item label="이메일 (로그인 아이디)">
                <Input value={me.email} readOnly variant="filled" />
              </Form.Item>
              <Form.Item label="역할" extra="역할은 관리자가 정합니다.">
                <Input value={ROLE_LABEL[me.role]} readOnly variant="filled" />
              </Form.Item>
              <Form.Item
                label="이름"
                name="name"
                rules={[{ required: true, whitespace: true, message: '이름을 입력하세요' }]}
              >
                <Input maxLength={30} />
              </Form.Item>
              <Flex justify="flex-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateName.isPending}
                  disabled={(nameValue ?? me.name).trim() === me.name}
                >
                  저장
                </Button>
              </Flex>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="비밀번호 변경" style={{ height: '100%' }}>
            <Typography.Paragraph type="secondary" style={{ marginTop: -4 }}>
              관리자가 정해 준 초기 비밀번호도 여기서 바꿀 수 있습니다.
            </Typography.Paragraph>
            <Form<PasswordForm>
              form={pwForm}
              layout="vertical"
              onFinish={(v) =>
                changePassword.mutate({ currentPassword: v.currentPassword, newPassword: v.newPassword })
              }
              disabled={changePassword.isPending}
            >
              <Form.Item
                label="현재 비밀번호"
                name="currentPassword"
                rules={[{ required: true, message: '현재 비밀번호를 입력하세요' }]}
              >
                <Input.Password autoComplete="current-password" />
              </Form.Item>
              <Form.Item
                label="새 비밀번호"
                name="newPassword"
                rules={[
                  { required: true, message: '새 비밀번호를 입력하세요' },
                  { min: 8, message: '8자 이상으로 입력하세요' },
                  ({ getFieldValue }) => ({
                    validator(_, value: string) {
                      if (value && value === getFieldValue('currentPassword')) {
                        return Promise.reject(new Error('현재 비밀번호와 다른 비밀번호를 입력하세요'))
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <Input.Password autoComplete="new-password" placeholder="8자 이상" />
              </Form.Item>
              <Form.Item
                label="새 비밀번호 확인"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '새 비밀번호를 한 번 더 입력하세요' },
                  ({ getFieldValue }) => ({
                    validator(_, value: string) {
                      if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                      return Promise.reject(new Error('새 비밀번호가 서로 다릅니다'))
                    },
                  }),
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Flex justify="flex-end">
                <Button type="primary" htmlType="submit" loading={changePassword.isPending}>
                  비밀번호 변경
                </Button>
              </Flex>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  )
}
