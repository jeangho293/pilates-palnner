import { ArrowRightOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Col, Flex, Row, Space, Tag, Typography } from 'antd'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { homeApi } from '../api/homeApi'
import type { AdminHomeSummary, InstructorHomeSummary } from '../api/types'
import { useMe } from '../auth/AuthContext'
import { InstructorAvatar } from '../components/InstructorAvatar'
import { ErrorState, LoadingState } from '../components/QueryStates'
import { formatDate } from '../lib/format'
import { paths } from '../routes/paths'
import { tokens } from '../theme/tokens'

export function HomePage() {
  const me = useMe()
  const summary = useQuery({ queryKey: ['home', 'summary', me.id], queryFn: homeApi.summary })

  return (
    <Flex vertical gap={16}>
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          안녕하세요, {me.name}
          {me.role === 'instructor' ? ' 강사님' : '님'}
        </Typography.Title>
        <Typography.Text type="secondary">오늘도 좋은 하루 보내세요.</Typography.Text>
      </div>

      {summary.isPending ? (
        <Card>
          <LoadingState rows={3} />
        </Card>
      ) : summary.isError ? (
        <Card>
          <ErrorState error={summary.error} onRetry={() => summary.refetch()} />
        </Card>
      ) : summary.data.role === 'admin' ? (
        <AdminCards data={summary.data} />
      ) : (
        <InstructorCard data={summary.data} />
      )}

      <Card title="곧 열리는 메뉴" size="small">
        <Flex vertical align="center" gap={8} style={{ padding: '20px 0', textAlign: 'center' }}>
          <ClockCircleOutlined style={{ fontSize: 24, color: tokens.neutral.muted }} />
          <Typography.Text type="secondary">
            {me.role === 'admin'
              ? '상담 CRM · 시간표 · 회원권은 MVP2, 예약·출석은 MVP3에서 이 자리에 요약이 표시됩니다.'
              : '시간표는 MVP2, 예약·출석은 MVP3에서 이 자리에 요약이 표시됩니다.'}
          </Typography.Text>
        </Flex>
      </Card>
    </Flex>
  )
}

function StatCard({
  label,
  value,
  hint,
  action,
  to,
}: {
  label: string
  value: ReactNode
  hint: string
  action: string
  to: string
}) {
  const navigate = useNavigate()
  return (
    <Card style={{ height: '100%' }}>
      <Typography.Text type="secondary">{label}</Typography.Text>
      <div style={{ fontSize: tokens.typeScale.display.size, fontWeight: 700, lineHeight: 1.25, margin: '4px 0' }}>
        {value}
      </div>
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        {hint}
      </Typography.Text>
      <div style={{ marginTop: 16 }}>
        <Button onClick={() => navigate(to)} icon={<ArrowRightOutlined />} iconPlacement="end">
          {action}
        </Button>
      </div>
    </Card>
  )
}

function AdminCards({ data }: { data: AdminHomeSummary }) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <StatCard
          label="활성 직원"
          value={`${data.staff.active}명`}
          hint={`관리자 ${data.staff.admins} · 강사 ${data.staff.instructors} · 준비 ${data.staff.ready} · 퇴사 ${data.staff.exited}`}
          action="직원 관리"
          to={paths.staffList}
        />
      </Col>
      <Col xs={24} md={8}>
        <StatCard
          label="공개 중인 강사 프로필"
          value={`${data.instructors.public} / ${data.instructors.total}`}
          hint={`비공개 ${data.instructors.private}명 · 작성 필요 ${data.instructors.needsWriting}명`}
          action="강사 프로필"
          to={paths.instructorList}
        />
      </Col>
      <Col xs={24} md={8}>
        <StatCard
          label="이번 주 가입 고객"
          value={`${data.customers.thisWeek}명`}
          hint={`전체 ${data.customers.total}명`}
          action="고객 찾기"
          to={paths.customerList}
        />
      </Col>
    </Row>
  )
}

function InstructorCard({ data }: { data: InstructorHomeSummary }) {
  const navigate = useNavigate()
  const p = data.profile
  return (
    <Card>
      <Flex align="center" gap={16} wrap>
        <InstructorAvatar name={p.displayName} profileImageUrl={p.profileImageUrl} size={72} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <Typography.Text strong style={{ fontSize: tokens.typeScale.h3.size }}>
            내 강사 프로필
          </Typography.Text>
          <div style={{ marginTop: 4 }}>
            <Space size={4} wrap>
              <Tag color={p.isPublic ? 'success' : 'default'}>{p.isPublic ? '고객 웹 공개 중' : '비공개'}</Tag>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                전문 분야 {p.specialties.length ? p.specialties.join(', ') : '미입력'} · 마지막 수정{' '}
                {formatDate(p.updatedAt)}
              </Typography.Text>
            </Space>
          </div>
        </div>
        <Button type="primary" onClick={() => navigate(paths.myInstructorProfile)}>
          내 강사 프로필 수정
        </Button>
      </Flex>
    </Card>
  )
}
