import { createContext, useContext, useEffect } from 'react'

/** 상세 화면이 브레드크럼 마지막 칸(예: 직원 이름)을 채우기 위한 컨텍스트 */
export const CrumbContext = createContext<(label: string | null) => void>(() => {})

export function usePageCrumb(label: string | null | undefined) {
  const set = useContext(CrumbContext)
  useEffect(() => {
    set(label ?? null)
    return () => set(null)
  }, [label, set])
}
