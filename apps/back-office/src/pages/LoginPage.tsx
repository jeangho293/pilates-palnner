import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Divider, Flex, Form, Input, Space, Typography } from 'antd'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { isApiError, type ApiError } from '../api/errors'
import { useAuth } from '../auth/AuthContext'
import { FullPageSpin } from '../components/FullPageSpin'
import { DEMO_ACCOUNTS } from '../lib/demoAccounts'
import { paths } from '../routes/paths'
import { tokens } from '../theme/tokens'

interface LoginForm {
  email: string
  password: string
}

/** 로그인 API 오류 코드별 안내 문구 */
function describeLoginError(error: ApiError): { title: string; description?: string } {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      return {
        title: '이메일 또는 비밀번호가 올바르지 않습니다.',
        description: '비밀번호가 기억나지 않으면 관리자에게 재설정을 요청하세요.',
      }
    case 'ACCOUNT_EXITED':
      return {
        title: '퇴사 처리된 계정입니다.',
        description: '퇴사 처리된 계정으로는 로그인할 수 없습니다. 복귀가 필요하면 관리자에게 문의하세요.',
      }
    default:
      return { title: error.message }
  }
}

const REASON_MESSAGE: Record<string, string> = {
  expired: '30분 동안 사용하지 않아 로그인이 만료되었습니다. 다시 로그인하세요.',
  revoked: '로그인이 만료되었습니다. 다시 로그인하세요.',
}

export function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm<LoginForm>()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const reason = searchParams.get('reason')
  const from = (location.state as { from?: string } | null)?.from
  // 로그인 전에 들어가려던 내부 주소가 있으면 그리로, 없으면 홈으로
  const afterLogin = from && from !== paths.login ? from : paths.home

  if (status === 'loading') return <FullPageSpin />
  if (status === 'authenticated') return <Navigate to={afterLogin} replace />

  const onFinish = async (values: LoginForm) => {
    setSubmitting(true)
    setError(null)
    try {
      await login(values.email.trim(), values.password)
      navigate(afterLogin, { replace: true })
    } catch (e) {
      if (isApiError(e)) setError(e)
      form.setFieldValue('password', '')
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = (account: { email: string; password: string }) => {
    form.setFieldsValue(account)
    setError(null)
  }

  const errorView = error ? describeLoginError(error) : null

  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: '100vh', padding: 16, background: tokens.neutral.bg }}
    >
      <Card style={{ width: '100%', maxWidth: 420 }} styles={{ body: { padding: 28 } }}>
        <Flex vertical gap={20}>
          <Flex align="center" gap={8}>
            <span className="bo-logo-mark">P</span>
            <Typography.Text strong>필라테스 플래너 백오피스</Typography.Text>
          </Flex>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              직원 로그인
            </Typography.Title>
            <Typography.Text type="secondary">관리자·강사 계정으로 로그인하세요.</Typography.Text>
          </div>

          {reason && REASON_MESSAGE[reason] && !error && (
            <Alert type="warning" showIcon title={REASON_MESSAGE[reason]} />
          )}
          {errorView && (
            <Alert type="error" showIcon title={errorView.title} description={errorView.description} />
          )}

          <Form<LoginForm>
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
            validateTrigger={['onBlur', 'onSubmit']}
            disabled={submitting}
          >
            <Form.Item
              label="이메일"
              name="email"
              rules={[
                { required: true, message: '이메일을 입력하세요' },
                { type: 'email', message: '이메일 형식이 올바르지 않습니다' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="admin@pilates.dev"
                autoComplete="username"
                size="large"
                autoFocus
              />
            </Form.Item>
            <Form.Item
              label="비밀번호"
              name="password"
              rules={[{ required: true, message: '비밀번호를 입력하세요' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="비밀번호"
                autoComplete="current-password"
                size="large"
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
              로그인
            </Button>
          </Form>

          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            비밀번호를 잊었다면 관리자에게 재설정을 요청하세요.
          </Typography.Text>

          <Card size="small" style={{ background: tokens.neutral.bg }}>
            <Typography.Text strong style={{ fontSize: 13 }}>
              데모 계정
            </Typography.Text>
            <Divider style={{ margin: '8px 0' }} />
            <Space orientation="vertical" size={4} style={{ width: '100%', fontSize: 13 }}>
              <DemoRow label="관리자" account={DEMO_ACCOUNTS.admin} onFill={fillDemo} />
              <DemoRow label="강사" account={DEMO_ACCOUNTS.instructor} onFill={fillDemo} />
              <DemoRow label="준비 상태 강사" account={DEMO_ACCOUNTS.ready} onFill={fillDemo} />
              <DemoRow label="퇴사 직원" account={DEMO_ACCOUNTS.exited} onFill={fillDemo} />
            </Space>
          </Card>
        </Flex>
      </Card>
    </Flex>
  )
}

function DemoRow({
  label,
  account,
  onFill,
}: {
  label: string
  account: { email: string; password: string }
  onFill: (a: { email: string; password: string }) => void
}) {
  return (
    <Flex align="center" justify="space-between" gap={8} wrap>
      <Typography.Text style={{ fontSize: 13 }}>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          {label}
        </Typography.Text>{' '}
        {account.email} / {account.password}
      </Typography.Text>
      <Button size="small" type="link" onClick={() => onFill(account)} style={{ padding: 0 }}>
        입력
      </Button>
    </Flex>
  )
}
