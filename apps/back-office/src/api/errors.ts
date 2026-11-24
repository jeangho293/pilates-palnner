/** API 오류 코드. core-api 오류 응답의 `code`와 맞춘다. */
export const API_ERROR_CODES = [
  'UNAUTHORIZED',
  'SESSION_EXPIRED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_FAILED',
  'INVALID_CREDENTIALS',
  'ACCOUNT_EXITED',
  'EMAIL_TAKEN',
  'INVALID_CURRENT_PASSWORD',
  'CANNOT_EXIT_SELF',
  'INSTRUCTOR_STAFF_EXITED',
  'NETWORK_ERROR',
  'UNKNOWN',
] as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[number]

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly details?: Record<string, unknown>

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError
}

export function toApiError(e: unknown): ApiError {
  if (isApiError(e)) return e
  if (e instanceof TypeError) {
    return new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인한 뒤 다시 시도하세요.')
  }
  return new ApiError(500, 'UNKNOWN', '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도하세요.')
}
