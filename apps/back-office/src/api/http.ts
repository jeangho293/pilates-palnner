import { ApiError, toApiError } from './errors'
import { mockRequest } from '../mocks/server'

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export interface RequestConfig {
  method: HttpMethod
  url: string
  params?: object
  body?: unknown
  /** false면 로그인 토큰을 붙이지 않고, 401·403 공통 처리도 하지 않는다 (예: 로그인) */
  auth?: boolean
}

/**
 * core-api 주소. 지금은 mock을 쓰므로 호출되지 않는다.
 * VITE_USE_MOCK=false 로 바꾸면 이 주소로 실제 요청을 보낸다.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
export const USE_MOCK: boolean = import.meta.env.VITE_USE_MOCK !== 'false'

// ── 토큰 보관 ──────────────────────────────────────────────
const TOKEN_KEY = 'bo.token'

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* 저장 실패 시 이번 탭에서만 유지되지 않음 — 무시 */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* noop */
    }
  },
}

// ── 공통 인증 오류 이벤트 (AuthProvider·레이아웃이 구독) ─────────
type AuthEvent = 'unauthorized' | 'forbidden'
type Listener = (error: ApiError) => void
const listeners: Record<AuthEvent, Set<Listener>> = {
  unauthorized: new Set(),
  forbidden: new Set(),
}

export function onAuthEvent(event: AuthEvent, listener: Listener): () => void {
  listeners[event].add(listener)
  return () => {
    listeners[event].delete(listener)
  }
}

function emit(event: AuthEvent, error: ApiError) {
  listeners[event].forEach((l) => l(error))
}

// ── 요청 ─────────────────────────────────────────────────
async function realFetch<T>(config: RequestConfig, token: string | null): Promise<T> {
  const url = new URL(config.url, API_BASE_URL)
  if (config.params) {
    for (const [k, v] of Object.entries(config.params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    }
  }
  const res = await fetch(url, {
    method: config.method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: config.body === undefined ? undefined : JSON.stringify(config.body),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      code?: ApiError['code']
      message?: string
      details?: Record<string, unknown>
    }
    throw new ApiError(
      res.status,
      data.code ?? 'UNKNOWN',
      data.message ?? '요청을 처리하지 못했습니다.',
      data.details,
    )
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function request<T>(config: RequestConfig): Promise<T> {
  const useAuth = config.auth !== false
  const token = useAuth ? tokenStore.get() : null
  try {
    return USE_MOCK
      ? await mockRequest<T>({ ...config, token })
      : await realFetch<T>(config, token)
  } catch (e) {
    const error = toApiError(e)
    if (useAuth) {
      if (error.status === 401) emit('unauthorized', error)
      else if (error.status === 403 && error.code === 'FORBIDDEN') emit('forbidden', error)
    }
    throw error
  }
}
