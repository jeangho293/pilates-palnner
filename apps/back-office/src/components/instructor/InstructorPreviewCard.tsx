import { Card, Empty, Flex, Tag, Typography } from 'antd'
import { tokens } from '../../theme/tokens'

interface Props {
  displayName?: string
  profileImageUrl?: string | null
  specialties?: string[]
  career?: string
  introduction?: string
  isPublic?: boolean
}

/** 고객 웹 강사 소개 카드 미리보기 — 폼 입력이 실시간으로 반영된다 */
export function InstructorPreviewCard({ displayName, profileImageUrl, specialties = [], career, introduction, isPublic }: Props) {
  return (
    <Card
      title="고객 웹 미리보기"
      size="small"
      extra={
        isPublic === undefined ? null : (
          <Tag color={isPublic ? 'success' : 'default'} style={{ marginInlineEnd: 0 }}>
            {isPublic ? '공개 중' : '비공개'}
          </Tag>
        )
      }
    >
      <div
        style={{
          height: 200,
          borderRadius: tokens.radius.md,
          background: tokens.neutral.surface2,
          overflow: 'hidden',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="강사 사진 미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="사진 없음" />
        )}
      </div>
      <Typography.Text strong style={{ fontSize: tokens.typeScale.h3.size }}>
        {displayName?.trim() || '표시 이름'}
      </Typography.Text>
      <Flex gap={4} wrap style={{ marginTop: 6 }}>
        {specialties.length ? (
          specialties.map((s) => (
            <Tag key={s} variant="filled" style={{ background: tokens.brand.mainSoft }}>
              {s}
            </Tag>
          ))
        ) : (
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            전문 분야
          </Typography.Text>
        )}
      </Flex>
      <Typography.Paragraph
        type={introduction?.trim() ? undefined : 'secondary'}
        className="bo-pre-line"
        style={{ marginTop: 12, marginBottom: 8 }}
      >
        {introduction?.trim() || '소개글이 여기에 표시됩니다.'}
      </Typography.Paragraph>
      {career?.trim() && (
        <>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            경력
          </Typography.Text>
          <Typography.Paragraph className="bo-pre-line" style={{ fontSize: 13, marginBottom: 0 }}>
            {career}
          </Typography.Paragraph>
        </>
      )}
      {isPublic === false && (
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
          비공개 상태라 고객 웹에는 아직 보이지 않습니다.
        </Typography.Text>
      )}
    </Card>
  )
}
