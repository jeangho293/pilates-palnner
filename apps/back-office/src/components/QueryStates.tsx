import { Button, Empty, Result, Skeleton } from 'antd'
import type { ReactNode } from 'react'
import { isApiError } from '../api/errors'

/** 화면 안 공통 로딩 상태 */
export function LoadingState({ rows = 4 }: { rows?: number }) {
  return <Skeleton active paragraph={{ rows }} />
}

/** 화면 안 공통 에러 상태 (다시 시도 버튼) */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const notFound = isApiError(error) && error.status === 404
  const message = error instanceof Error ? error.message : '데이터를 불러오지 못했습니다.'
  return (
    <Result
      status={notFound ? '404' : 'warning'}
      title={notFound ? '찾을 수 없습니다' : '데이터를 불러오지 못했습니다'}
      subTitle={message}
      extra={
        onRetry && !notFound ? (
          <Button onClick={onRetry} type="primary">
            다시 시도
          </Button>
        ) : undefined
      }
    />
  )
}

/** 표·목록의 공통 빈 상태 */
export function EmptyState({ description, extra }: { description: ReactNode; extra?: ReactNode }) {
  return (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description}>
      {extra}
    </Empty>
  )
}
