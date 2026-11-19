import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isApiError } from '../api/errors'
import { feedback } from './feedback'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** true면 화면이 직접 오류를 안내한다 (공통 토스트 생략) */
      handlesError?: boolean
    }
    queryMeta: {
      /** true면 조회 실패 시 공통 토스트도 띄운다 (기본은 화면 안 에러 표시만) */
      toastOnError?: boolean
    }
  }
}

/** 401·403은 http 계층에서 로그인 이동/403 화면으로 처리하므로 토스트를 띄우지 않는다 */
function shouldToast(error: unknown) {
  return !(isApiError(error) && (error.status === 401 || error.code === 'FORBIDDEN'))
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.toastOnError && shouldToast(error)) feedback.error(error.message)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (!mutation.meta?.handlesError && shouldToast(error)) feedback.error(error.message)
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) => {
        if (isApiError(error) && error.status >= 400 && error.status < 500) return false
        return count < 1
      },
    },
  },
})
