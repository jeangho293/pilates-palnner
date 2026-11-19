import { App } from 'antd'
import { useEffect, useRef } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * 저장하지 않은 변경이 있을 때 화면을 떠나려 하면 확인 다이얼로그를 띄운다.
 * - 앱 안 이동(메뉴·링크·뒤로가기): react-router useBlocker
 * - 새로고침·탭 닫기: beforeunload
 * 저장 직후 이동처럼 확인 없이 떠나야 할 때는 반환된 allowLeave()를 먼저 부른다.
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  const { modal } = App.useApp()
  const bypass = useRef(false)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !bypass.current && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    modal.confirm({
      title: '수정을 취소할까요?',
      content: '저장하지 않은 내용은 사라집니다.',
      okText: '나가기',
      cancelText: '계속 수정',
      onOk: () => blocker.proceed(),
      onCancel: () => blocker.reset(),
    })
  }, [blocker, modal])

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  return {
    /** 다음 이동은 확인 없이 허용 (저장 직후 이동 등) */
    allowLeave() {
      bypass.current = true
    },
    /** allowLeave를 되돌린다 (저장 실패 등) */
    restore() {
      bypass.current = false
    },
  }
}
