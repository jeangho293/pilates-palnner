import type { App } from 'antd'

type AppApi = ReturnType<typeof App.useApp>
type MessageInstance = AppApi['message']
type ModalHookAPI = AppApi['modal']

/**
 * 컴포넌트 밖(react-query 공통 onError 등)에서도 테마가 적용된 message/modal을 쓰기 위한 다리.
 * <FeedbackBridge />가 App.useApp() 인스턴스를 등록한다.
 */
let messageApi: MessageInstance | null = null
let modalApi: ModalHookAPI | null = null

export function registerFeedback(m: MessageInstance, modal: ModalHookAPI) {
  messageApi = m
  modalApi = modal
}

export const feedback = {
  error(content: string) {
    messageApi?.error(content)
  },
  success(content: string) {
    messageApi?.success(content)
  },
  info(content: string) {
    messageApi?.info(content)
  },
  get modal() {
    return modalApi
  },
}
