import { Button, Card, Col, Flex, Form, Input, Row, Select, Switch, Typography } from 'antd'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { InstructorProfileInput } from '../../api/types'
import { useUnsavedChangesGuard } from '../../lib/useUnsavedChangesGuard'
import { InstructorPreviewCard } from './InstructorPreviewCard'
import { PhotoInput } from './PhotoInput'

interface Props {
  initialValues: InstructorProfileInput
  /** 관리자 수정 화면만 true — 내 강사 프로필 화면은 공개 여부 입력이 없다 */
  showVisibility?: boolean
  /** 공개 여부 입력이 없을 때 미리보기에 보여 줄 현재 공개 상태 */
  currentIsPublic?: boolean
  /** 취소 시 돌아갈 경로 */
  cancelTo: string
  submitting?: boolean
  /** 저장. 실패하면 throw — 폼은 수정 중 상태를 유지한다 */
  onSubmit: (values: InstructorProfileInput) => Promise<unknown>
  /** 저장 성공 후 (예: 목록으로 이동). 이때의 이동은 미저장 확인 없이 진행된다 */
  onSaved?: () => void
  /** 폼 위쪽 안내 영역 (예: 공개 여부는 관리자가 정합니다) */
  notice?: ReactNode
}

/**
 * 강사 프로필 폼 — 관리자 강사 프로필 수정(bo-instructor-edit)과
 * 강사 본인의 내 강사 프로필(bo-my-instructor-profile)이 함께 쓴다.
 */
export function InstructorProfileForm({
  initialValues,
  showVisibility = false,
  currentIsPublic,
  cancelTo,
  submitting,
  onSubmit,
  onSaved,
  notice,
}: Props) {
  const [form] = Form.useForm<InstructorProfileInput>()
  const navigate = useNavigate()
  const [dirty, setDirty] = useState(false)
  const guard = useUnsavedChangesGuard(dirty)

  // 미리보기 실시간 반영
  const values = Form.useWatch([], form) as Partial<InstructorProfileInput> | undefined
  const preview = { ...initialValues, ...values }

  const handleFinish = async (v: InstructorProfileInput) => {
    const payload: InstructorProfileInput = {
      displayName: v.displayName.trim(),
      profileImageUrl: v.profileImageUrl ?? null,
      specialties: v.specialties ?? [],
      career: v.career ?? '',
      introduction: v.introduction ?? '',
      ...(showVisibility ? { isPublic: Boolean(v.isPublic) } : {}),
    }
    try {
      await onSubmit(payload)
      setDirty(false)
      guard.allowLeave()
      onSaved?.()
    } catch (e) {
      const field = (e as { details?: { field?: string } }).details?.field
      if (field === 'displayName') form.setFields([{ name: 'displayName', errors: [(e as Error).message] }])
    } finally {
      guard.restore()
    }
  }

  return (
    <Row gutter={[16, 16]} align="top">
      <Col xs={24} lg={15} xl={16}>
        <Card>
          {notice}
          <Form<InstructorProfileInput>
            form={form}
            layout="horizontal"
            labelCol={{ xs: { span: 24 }, sm: { span: 5 } }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 19 } }}
            labelAlign="start"
            colon={false}
            initialValues={initialValues}
            onValuesChange={() => setDirty(true)}
            onFinish={handleFinish}
            disabled={submitting}
            scrollToFirstError
          >
            <Form.Item label="사진" name="profileImageUrl">
              <PhotoInput name={preview.displayName} />
            </Form.Item>
            <Form.Item
              label="표시 이름"
              name="displayName"
              required
              rules={[{ required: true, whitespace: true, message: '표시 이름을 입력하세요' }]}
              extra="고객 웹에 보이는 이름입니다."
            >
              <Input maxLength={30} showCount placeholder="예: 이수진" />
            </Form.Item>
            <Form.Item
              label="전문 분야"
              name="specialties"
              extra="입력 후 Enter 또는 쉼표(,)로 추가합니다. 최대 10개."
              rules={[{ type: 'array', max: 10, message: '전문 분야는 10개까지 입력할 수 있습니다' }]}
            >
              <Select
                mode="tags"
                open={false}
                suffix={null}
                tokenSeparators={[',']}
                placeholder="예: 재활, 체형 교정"
                maxTagTextLength={20}
              />
            </Form.Item>
            <Form.Item label="경력" name="career">
              <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} maxLength={1000} placeholder="- 자격·경력을 줄마다 적어 주세요" />
            </Form.Item>
            <Form.Item label="소개글" name="introduction">
              <Input.TextArea
                autoSize={{ minRows: 4, maxRows: 10 }}
                maxLength={1000}
                showCount
                placeholder="고객에게 보여 줄 소개를 적어 주세요"
              />
            </Form.Item>
            {showVisibility && (
              <Form.Item label="공개 여부" name="isPublic" valuePropName="checked">
                <Switch checkedChildren="공개" unCheckedChildren="비공개" />
              </Form.Item>
            )}
            {showVisibility && (
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: -16, marginBottom: 16, fontSize: 12 }}>
                켜면 고객 웹 강사 소개에 등록순으로 나타납니다.
              </Typography.Text>
            )}
            <Flex justify="flex-end" gap={8}>
              <Button onClick={() => navigate(cancelTo)} disabled={false}>
                취소
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                저장
              </Button>
            </Flex>
          </Form>
        </Card>
      </Col>
      <Col xs={24} lg={9} xl={8} style={{ position: 'sticky', top: 72 }}>
        <InstructorPreviewCard
          displayName={preview.displayName}
          profileImageUrl={preview.profileImageUrl}
          specialties={preview.specialties}
          career={preview.career}
          introduction={preview.introduction}
          isPublic={showVisibility ? Boolean(preview.isPublic) : currentIsPublic}
        />
      </Col>
    </Row>
  )
}
