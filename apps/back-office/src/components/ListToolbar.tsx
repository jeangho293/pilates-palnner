import { SearchOutlined } from '@ant-design/icons'
import { Flex, Input, Segmented, Typography } from 'antd'
import { useState, type ReactNode } from 'react'
import { useDebouncedCallback } from '../lib/useDebouncedCallback'

interface Props<K extends string> {
  q: string
  onSearch: (q: string) => void
  placeholder: string
  filter: K
  filterOptions: { label: string; value: K }[]
  onFilterChange: (v: K) => void
  summary?: ReactNode
}

/** 목록 상단: 검색 + 세그먼트 필터 + 요약 */
export function ListToolbar<K extends string>({
  q,
  onSearch,
  placeholder,
  filter,
  filterOptions,
  onFilterChange,
  summary,
}: Props<K>) {
  const [text, setText] = useState(q)
  const debounced = useDebouncedCallback(onSearch, 300)
  return (
    <Flex align="center" gap={8} wrap style={{ marginBottom: 12 }}>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          debounced(e.target.value)
        }}
        onPressEnter={() => onSearch(text)}
        style={{ maxWidth: 280, flex: '1 1 200px' }}
        aria-label={placeholder}
      />
      <Segmented<K> options={filterOptions} value={filter} onChange={onFilterChange} />
      {summary && (
        <Typography.Text type="secondary" style={{ marginLeft: 'auto', fontSize: 13 }}>
          {summary}
        </Typography.Text>
      )}
    </Flex>
  )
}
