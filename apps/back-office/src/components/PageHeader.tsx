import { ArrowLeftOutlined } from '@ant-design/icons'
import { Flex, Typography } from 'antd'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  title: ReactNode
  description?: ReactNode
  back?: { to: string; label: string }
  extra?: ReactNode
}

/** 화면 제목 영역 — 제목·설명(왼쪽) + 주요 버튼(오른쪽) */
export function PageHeader({ title, description, back, extra }: Props) {
  return (
    <Flex align="flex-end" justify="space-between" gap={12} wrap style={{ marginBottom: 16 }}>
      <div style={{ minWidth: 0 }}>
        {back && (
          <Link to={back.to} style={{ display: 'inline-block', marginBottom: 4, fontSize: 13 }}>
            <ArrowLeftOutlined /> {back.label}
          </Link>
        )}
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {description && (
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            {description}
          </Typography.Text>
        )}
      </div>
      {extra && (
        <Flex gap={8} wrap>
          {extra}
        </Flex>
      )}
    </Flex>
  )
}
