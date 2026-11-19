import { QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp, ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { registerFeedback } from './lib/feedback'
import { queryClient } from './lib/queryClient'
import { router } from './routes/router'
import { antdTheme } from './theme/antdTheme'

dayjs.locale('ko')

/** react-query 공통 오류 처리 등 컴포넌트 밖에서 테마가 적용된 message/modal을 쓰게 등록 */
function FeedbackBridge() {
  const { message, modal } = AntApp.useApp()
  useEffect(() => registerFeedback(message, modal), [message, modal])
  return null
}

export default function App() {
  return (
    <ConfigProvider theme={antdTheme} locale={koKR}>
      <AntApp>
        <FeedbackBridge />
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  )
}
