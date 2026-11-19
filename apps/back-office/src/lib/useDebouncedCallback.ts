import { useEffect, useRef } from 'react'

/** 입력 중 서버 검색을 과도하게 보내지 않도록 마지막 입력 후 delay ms 뒤에 실행 */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay = 300) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fnRef = useRef(fn)
  useEffect(() => {
    fnRef.current = fn
  }, [fn])
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])
  return (...args: A) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => fnRef.current(...args), delay)
  }
}
