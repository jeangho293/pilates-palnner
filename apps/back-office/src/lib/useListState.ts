import type { TableProps } from 'antd'
import type { SorterResult } from 'antd/es/table/interface'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SortOrder } from '../api/types'

interface Defaults<F extends string, K extends string> {
  sortField: F
  sortOrder: SortOrder
  filter: K
  pageSize?: number
}

/**
 * 목록 화면의 검색·필터·정렬·페이지 상태를 URL 쿼리에 보관한다.
 * (상세에 갔다가 돌아와도 같은 조건이 유지되고, 서버 요청 파라미터로 그대로 쓴다)
 */
export function useListState<F extends string, K extends string>(defaults: Defaults<F, K>) {
  const [sp, setSp] = useSearchParams()

  const state = useMemo(
    () => ({
      page: Math.max(1, Number(sp.get('page')) || 1),
      pageSize: Number(sp.get('size')) || defaults.pageSize || 10,
      sortField: (sp.get('sort') as F | null) ?? defaults.sortField,
      sortOrder: ((sp.get('order') as SortOrder | null) ?? defaults.sortOrder) as SortOrder,
      q: sp.get('q') ?? '',
      filter: (sp.get('filter') as K | null) ?? defaults.filter,
    }),
    [sp, defaults.pageSize, defaults.sortField, defaults.sortOrder, defaults.filter],
  )

  const update = useCallback(
    (patch: Record<string, string | number | null>) => {
      setSp(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === '') next.delete(k)
            else next.set(k, String(v))
          }
          return next
        },
        { replace: true },
      )
    },
    [setSp],
  )

  /** 정렬을 바꾸고 첫 페이지로 (예: 추가 직후 최신순으로 보여 주기) */
  const setSort = useCallback(
    (field: F, order: SortOrder) => update({ sort: field, order, page: null }),
    [update],
  )

  const setQ = useCallback((q: string) => update({ q: q.trim() || null, page: null }), [update])
  const setFilter = useCallback((f: K) => update({ filter: f === defaults.filter ? null : f, page: null }), [update, defaults.filter])

  /** antd Table onChange → 서버 정렬·페이지네이션 파라미터 */
  const onTableChange = useCallback(
    <T,>(
      pagination: Parameters<NonNullable<TableProps<T>['onChange']>>[0],
      _filters: unknown,
      sorter: SorterResult<T> | SorterResult<T>[],
    ) => {
      const s = Array.isArray(sorter) ? sorter[0] : sorter
      const field = (s?.columnKey ?? s?.field) as F | undefined
      let sortField = state.sortField
      let sortOrder = state.sortOrder
      if (field) {
        sortField = field
        // 머리글을 누를 때마다 오름 ↔ 내림만 오가고 '정렬 해제'는 두지 않는다
        sortOrder = s.order === 'descend' ? 'desc' : s.order === 'ascend' ? 'asc' : state.sortOrder === 'asc' ? 'desc' : 'asc'
      }
      const sortChanged = sortField !== state.sortField || sortOrder !== state.sortOrder
      update({
        sort: sortField,
        order: sortOrder,
        page: sortChanged ? null : (pagination.current ?? 1),
        size: pagination.pageSize ?? null,
      })
    },
    [state.sortField, state.sortOrder, update],
  )

  /** 컬럼 sorter 공통 속성 (현재 정렬 상태를 controlled로 표시) */
  const sortProps = useCallback(
    (key: F) => ({
      key,
      sorter: true,
      sortDirections: ['ascend', 'descend', 'ascend'] as ('ascend' | 'descend')[],
      sortOrder:
        state.sortField === key ? (state.sortOrder === 'asc' ? ('ascend' as const) : ('descend' as const)) : null,
    }),
    [state.sortField, state.sortOrder],
  )

  return { ...state, setQ, setFilter, setSort, onTableChange, sortProps }
}
