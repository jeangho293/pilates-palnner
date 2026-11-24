import { EditOutlined, KeyOutlined, LogoutOutlined, UndoOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Card, Descriptions, Flex, Form, Input, Modal, Tag, Tooltip, Typography } from 'antd'
import { useState, type ReactElement } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { staffApi } from '../../api/staffApi'
import type { StaffDetail } from '../../api/types'
import { useMe } from '../../auth/AuthContext'
import { InstructorAvatar } from '../../components/InstructorAvatar'
import { PageHeader } from '../../components/PageHeader'
import { PasswordField } from '../../components/PasswordField'
import { passwordRules } from '../../lib/validation'
import { ErrorState, LoadingState } from '../../components/QueryStates'
import { formatDate, formatDateTime, ROLE_LABEL } from '../../lib/format'
import { usePageCrumb } from '../../layout/crumb'
import { paths } from '../../routes/paths'
import { tokens } from '../../theme/tokens'
import { StaffStatusTag } from './StaffStatusTag'

/**
 * core-api에 아직 없는 직원 변경 API(이름 수정·비밀번호 재설정·퇴사·복귀).
 * 상세 조회는 실제 DB를 읽으므로 mock으로 바꾸면 화면에 반영되지 않는다 — API가 생기면 false로 바꾼다.
 */
const STAFF_ACTIONS_PENDING = true
const PENDING_TIP = '준비 중인 기능입니다'

export function StaffDetailPage() {
  const { staffId } = useParams()
  const id = Number(staffId)
  const me = useMe()
  const navigate = useNavigate()
  const { modal, message } = App.useApp()
  const queryClient = useQueryClient()
  const [nameOpen, setNameOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)

  const query = useQuery({ queryKey: ['staff', 'detail', id], queryFn: () => staffApi.get(id) })
  usePageCrumb(query.data?.name)

  const refresh = (updated?: Partial<StaffDetail>) => {
    if (updated) {
      // 처리 결과를 바로 화면 상태에 반영
      queryClient.setQueryData<StaffDetail>(['staff', 'detail', id], (prev) => (prev ? { ...prev, ...updated } : prev))
    }
    void queryClient.invalidateQueries({ queryKey: ['staff'] })
    void queryClient.invalidateQueries({ queryKey: ['instructors'] })
    void queryClient.invalidateQueries({ queryKey: ['home'] })
  }

  const changeStatus = useMutation({
    mutationFn: (action: 'exit' | 'reinstate') => (action === 'exit' ? staffApi.exit(id) : staffApi.reinstate(id)),
    onSuccess: (staff) => {
      const exited = staff.status === 'exited'
      message.success(exited ? '퇴사 처리했습니다.' : '복귀 처리했습니다.')
      refresh({
        ...staff,
        // 퇴사 처리하면 연결된 강사 프로필이 비공개로 바뀐다
        instructor:
          query.data?.instructor && exited ? { ...query.data.instructor, isPublic: false } : query.data?.instructor,
      })
    },
  })

  if (query.isPending) {
    return (
      <Card>
        <LoadingState rows={6} />
      </Card>
    )
  }
  if (query.isError) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    )
  }

  const staff = query.data
  const isSelf = staff.id === me.id
  const exited = staff.status === 'exited'

  const confirmExit = () => {
    modal.confirm({
      title: `${staff.name} 님을 퇴사 처리할까요?`,
      content: (
        <ul style={{ paddingInlineStart: 18, margin: 0 }}>
          <li>더 이상 로그인할 수 없습니다.</li>
          <li>지금 로그인된 기기에서도 바로 로그아웃됩니다.</li>
          {staff.instructor && <li>연결된 강사 프로필이 고객 웹에서 비공개로 바뀝니다.</li>}
        </ul>
      ),
      okText: '퇴사 처리',
      okButtonProps: { danger: true },
      cancelText: '취소',
      onOk: () => changeStatus.mutateAsync('exit'),
    })
  }

  const confirmReinstate = () => {
    modal.confirm({
      title: `${staff.name} 님을 복귀 처리할까요?`,
      content: staff.instructor
        ? '활성 상태로 돌아가 다시 로그인할 수 있습니다. 강사 프로필 공개는 강사 프로필 화면에서 따로 켜야 합니다.'
        : '활성 상태로 돌아가 다시 로그인할 수 있습니다.',
      okText: '복귀 처리',
      cancelText: '취소',
      onOk: () => changeStatus.mutateAsync('reinstate'),
    })
  }

  return (
    <>
      <PageHeader
        back={{ to: paths.staffList, label: '직원 목록' }}
        title={
          <Flex align="center" gap={8} wrap>
            {staff.name}
            <Tag color={staff.role === 'admin' ? 'gold' : 'default'} variant="filled">
              {ROLE_LABEL[staff.role]}
            </Tag>
            <StaffStatusTag status={staff.status} />
            {isSelf && <Tag variant="filled">나</Tag>}
          </Flex>
        }
        extra={
          <>
            <PendingTooltip>
              <Button icon={<EditOutlined />} disabled={STAFF_ACTIONS_PENDING} onClick={() => setNameOpen(true)}>
                이름 수정
              </Button>
            </PendingTooltip>
            <PendingTooltip>
              <Button icon={<KeyOutlined />} disabled={STAFF_ACTIONS_PENDING} onClick={() => setPwOpen(true)}>
                비밀번호 재설정
              </Button>
            </PendingTooltip>
            {/* 관리자 자기 자신은 퇴사 처리할 수 없다 */}
            {!isSelf && (
              <PendingTooltip>
                {exited ? (
                  <Button icon={<UndoOutlined />} disabled={STAFF_ACTIONS_PENDING} onClick={confirmReinstate}>
                    복귀 처리
                  </Button>
                ) : (
                  <Button danger icon={<LogoutOutlined />} disabled={STAFF_ACTIONS_PENDING} onClick={confirmExit}>
                    퇴사 처리
                  </Button>
                )}
              </PendingTooltip>
            )}
          </>
        }
      />

      <Flex vertical gap={16}>
        {staff.status === 'ready' && (
          <Alert type="info" showIcon title="아직 로그인한 적 없는 준비 상태입니다. 처음 로그인하면 활성 상태가 됩니다." />
        )}
        {exited && (
          <Alert
            type="warning"
            showIcon
            title="퇴사 처리된 직원입니다."
            description="로그인할 수 없습니다. 다시 일하게 되면 복귀 처리하세요."
          />
        )}
        <Card title="계정 정보">
          <Descriptions
            bordered
            size="middle"
            column={{ xs: 1, sm: 1, md: 2 }}
            items={[
              { key: 'email', label: '이메일', children: staff.email },
              { key: 'name', label: '이름', children: staff.name },
              { key: 'role', label: '역할', children: ROLE_LABEL[staff.role] },
              {
                key: 'status',
                label: '상태',
                children: <StaffStatusTag status={staff.status} />,
              },
              { key: 'last', label: '마지막 로그인', children: formatDateTime(staff.lastLoginOn) },
              { key: 'created', label: '생성일', children: formatDate(staff.createdAt) },
            ]}
          />
        </Card>

        {/* 강사 역할인데 연결된 강사 프로필이 없으면 = core-api 강사 프로필 작업 전 */}
        {staff.role === 'instructor' && !staff.instructor && (
          <Card>
            <Flex align="center" gap={16} wrap>
              <InstructorAvatar name={staff.name} profileImageUrl={null} size={56} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <Flex align="center" gap={8}>
                  <Typography.Text strong>연결된 강사 프로필</Typography.Text>
                  <Tag variant="filled">준비 중</Tag>
                </Flex>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  강사 프로필 기능을 준비하고 있습니다. 준비가 끝나면 이곳에서 연결된 강사 프로필을 확인할 수 있습니다.
                </Typography.Text>
              </div>
            </Flex>
          </Card>
        )}
        {staff.instructor && (
          <Card>
            <Flex align="center" gap={16} wrap>
              <InstructorAvatar name={staff.instructor.displayName} profileImageUrl={staff.instructor.profileImageUrl} size={56} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <Typography.Text strong>연결된 강사 프로필</Typography.Text>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    표시 이름 {staff.instructor.displayName} ·{' '}
                    <span style={{ color: staff.instructor.isPublic ? tokens.semantic.success : undefined }}>
                      {staff.instructor.isPublic ? '고객 웹 공개 중' : '비공개'}
                    </span>
                  </Typography.Text>
                </div>
              </div>
              <Button onClick={() => navigate(paths.instructorEdit(staff.instructor!.id))}>강사 프로필 수정</Button>
            </Flex>
          </Card>
        )}
      </Flex>

      <EditNameModal
        open={nameOpen}
        staff={staff}
        onClose={() => setNameOpen(false)}
        onDone={(name) => {
          setNameOpen(false)
          refresh({ name })
        }}
      />
      <ResetPasswordModal
        open={pwOpen}
        staff={staff}
        onClose={() => setPwOpen(false)}
        onDone={() => {
          setPwOpen(false)
          refresh()
        }}
      />
    </>
  )
}

function PendingTooltip({ children }: { children: ReactElement }) {
  return STAFF_ACTIONS_PENDING ? <Tooltip title={PENDING_TIP}>{children}</Tooltip> : children
}

function EditNameModal({
  open,
  staff,
  onClose,
  onDone,
}: {
  open: boolean
  staff: StaffDetail
  onClose: () => void
  onDone: (name: string) => void
}) {
  const [form] = Form.useForm<{ name: string }>()
  const { message } = App.useApp()
  const mutation = useMutation({
    mutationFn: (name: string) => staffApi.updateName(staff.id, name),
    onSuccess: (s) => {
      message.success('이름을 바꿨습니다.')
      onDone(s.name)
    },
  })
  return (
    <Modal
      title="이름 수정"
      open={open}
      onCancel={onClose}
      okText="저장"
      cancelText="취소"
      confirmLoading={mutation.isPending}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ name: staff.name }}
        onFinish={(v) => mutation.mutate(v.name.trim())}
        preserve={false}
      >
        <Form.Item label="이름" name="name" rules={[{ required: true, whitespace: true, message: '이름을 입력하세요' }]}>
          <Input maxLength={30} autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  )
}

function ResetPasswordModal({
  open,
  staff,
  onClose,
  onDone,
}: {
  open: boolean
  staff: StaffDetail
  onClose: () => void
  onDone: () => void
}) {
  const [form] = Form.useForm<{ password: string }>()
  const { modal } = App.useApp()
  const mutation = useMutation({
    mutationFn: (password: string) => staffApi.resetPassword(staff.id, password),
    onSuccess: (_, password) => {
      onDone()
      modal.success({
        title: '비밀번호를 재설정했습니다',
        content: (
          <>
            <p style={{ marginBottom: 8 }}>
              {staff.name} 님에게 새 비밀번호를 직접 전달하세요. 로그인된 기기는 로그아웃됩니다.
            </p>
            <Typography.Text code copyable>
              {password}
            </Typography.Text>
          </>
        ),
        okText: '확인',
      })
    },
  })
  return (
    <Modal
      title="비밀번호 재설정"
      open={open}
      onCancel={onClose}
      okText="재설정"
      okButtonProps={{ danger: true }}
      cancelText="취소"
      confirmLoading={mutation.isPending}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Typography.Paragraph type="secondary">
        새 비밀번호를 정해 {staff.name} 님에게 전달하세요. 기존 비밀번호로는 더 이상 로그인할 수 없습니다. 직원은 로그인 후 내 정보에서 비밀번호를 바꿀 수 있습니다.
      </Typography.Paragraph>
      <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v.password)} preserve={false}>
        <Form.Item label="새 비밀번호" name="password" rules={passwordRules}>
          <PasswordField placeholder="새 비밀번호 8자 이상" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
