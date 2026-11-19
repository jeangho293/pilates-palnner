import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Card, Descriptions, Flex, Tabs, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { customerApi } from '../../api/customerApi'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/QueryStates'
import { usePageCrumb } from '../../layout/crumb'
import { formatDate, formatDateTime } from '../../lib/format'
import { paths } from '../../routes/paths'

/** 고객 상세 (조회 전용, bo-customer-detail) */
export function CustomerDetailPage() {
  const { customerId } = useParams()
  const id = Number(customerId)
  const query = useQuery({ queryKey: ['customers', 'detail', id], queryFn: () => customerApi.get(id) })
  usePageCrumb(query.data?.name)

  const [showFull, setShowFull] = useState(false)
  // 휴대폰 번호 전체는 "전체 보기"를 누를 때만 따로 요청한다 (관리자 전용 API)
  const reveal = useMutation({ mutationFn: () => customerApi.revealPhone(id) })

  if (query.isPending) {
    return (
      <Card>
        <LoadingState rows={5} />
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
  const c = query.data

  const togglePhone = () => {
    if (showFull) return setShowFull(false)
    if (reveal.data) return setShowFull(true)
    reveal.mutate(undefined, { onSuccess: () => setShowFull(true) })
  }

  const phone = c.phoneNumberMasked ? (
    <Flex align="center" gap={8} wrap>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{showFull && reveal.data ? reveal.data.phoneNumber : c.phoneNumberMasked}</span>
      <Button
        size="small"
        type="link"
        icon={showFull ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        loading={reveal.isPending}
        onClick={togglePhone}
        style={{ padding: 0 }}
      >
        {showFull ? '가리기' : '전체 보기'}
      </Button>
    </Flex>
  ) : (
    <Typography.Text type="secondary">미입력</Typography.Text>
  )

  return (
    <>
      <PageHeader
        back={{ to: paths.customerList, label: '고객 목록' }}
        title={
          <Flex align="center" gap={8}>
            {c.name}
            {c.kakaoLinked && (
              <Tag variant="filled" color="gold">
                카카오 연결
              </Tag>
            )}
          </Flex>
        }
        description="조회 전용 — 고객 정보는 고객 웹에서 본인이 수정합니다."
      />
      <Card>
        <Tabs
          items={[
            {
              key: 'info',
              label: '기본 정보',
              children: (
                <>
                  <Descriptions
                    bordered
                    size="middle"
                    column={{ xs: 1, sm: 1, md: 2 }}
                    items={[
                      { key: 'name', label: '이름', children: c.name },
                      { key: 'phone', label: '휴대폰 번호', children: phone },
                      { key: 'created', label: '가입일', children: formatDateTime(c.createdAt) },
                      { key: 'privacy', label: '개인정보 동의일', children: formatDateTime(c.privacyAgreedOn) },
                      { key: 'kakao', label: '카카오 계정', children: c.kakaoLinked ? '연결됨' : '연결 안 됨' },
                      { key: 'updated', label: '수정일', children: formatDate(c.updatedAt) },
                    ]}
                  />
                  <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                    휴대폰 번호 전체 보기는 관리자만 할 수 있습니다.
                  </Typography.Text>
                </>
              ),
            },
            {
              key: 'consult',
              label: '상담 신청',
              children: <EmptyState description="상담 신청 내역은 백오피스 MVP2(상담 CRM)에서 표시됩니다." />,
            },
            {
              key: 'membership',
              label: '회원권',
              children: <EmptyState description="회원권 내역은 백오피스 MVP2(회원·회원권)에서 표시됩니다." />,
            },
          ]}
        />
      </Card>
    </>
  )
}
