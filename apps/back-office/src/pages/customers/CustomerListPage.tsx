import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { customerApi } from '../../api/customerApi'
import type { CustomerJoinedFilter, CustomerListItem, CustomerSortField } from '../../api/types'
import { ListToolbar } from '../../components/ListToolbar'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState } from '../../components/QueryStates'
import { formatDateTime } from '../../lib/format'
import { useListState } from '../../lib/useListState'
import { paths } from '../../routes/paths'

const JOINED_OPTIONS: { label: string; value: CustomerJoinedFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '이번 주 가입', value: 'thisWeek' },
]

export function CustomerListPage() {
  const navigate = useNavigate()
  const list = useListState<CustomerSortField, CustomerJoinedFilter>({
    sortField: 'createdAt',
    sortOrder: 'desc',
    filter: 'all',
  })
  const params = {
    page: list.page,
    pageSize: list.pageSize,
    sortField: list.sortField,
    sortOrder: list.sortOrder,
    q: list.q || undefined,
    joined: list.filter,
  }
  const query = useQuery({
    queryKey: ['customers', 'list', params],
    queryFn: () => customerApi.list(params),
    placeholderData: keepPreviousData,
  })

  const columns: TableColumnsType<CustomerListItem> = [
    {
      title: '이름',
      dataIndex: 'name',
      ...list.sortProps('name'),
      render: (name: string, row) => <Link to={paths.customerDetail(row.id)}>{name}</Link>,
    },
    {
      title: '휴대폰 번호',
      dataIndex: 'phoneNumberMasked',
      render: (v: string | null) =>
        v ? <span style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</span> : <Typography.Text type="secondary">미입력</Typography.Text>,
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      ...list.sortProps('createdAt'),
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '개인정보 동의일',
      dataIndex: 'privacyAgreedOn',
      ...list.sortProps('privacyAgreedOn'),
      render: (v: string | null) => formatDateTime(v),
    },
    {
      key: 'actions',
      width: 80,
      align: 'right',
      render: (_, row) => (
        <Button size="small" onClick={() => navigate(paths.customerDetail(row.id))}>
          상세
        </Button>
      ),
    },
  ]

  const filtered = Boolean(list.q) || list.filter !== 'all'

  return (
    <>
      <PageHeader
        title="고객"
        description="고객 웹에서 카카오로 가입한 고객입니다. 백오피스에서는 조회만 할 수 있습니다."
      />
      <Card>
        <ListToolbar
          q={list.q}
          onSearch={list.setQ}
          placeholder="이름 또는 휴대폰 번호 뒷자리"
          filter={list.filter}
          filterOptions={JOINED_OPTIONS}
          onFilterChange={list.setFilter}
          summary={filtered ? `검색 결과 ${query.data?.total ?? 0}명` : `총 고객 ${query.data?.total ?? 0}명`}
        />
        {query.isError && (
          <Alert
            type="error"
            showIcon
            title="고객 목록을 불러오지 못했습니다."
            description={query.error.message}
            action={<Button onClick={() => query.refetch()}>다시 시도</Button>}
            style={{ marginBottom: 12 }}
          />
        )}
        <Table<CustomerListItem>
          rowKey="id"
          columns={columns}
          dataSource={query.data?.items}
          loading={query.isFetching}
          onChange={list.onTableChange}
          scroll={{ x: 680 }}
          pagination={{
            current: list.page,
            pageSize: list.pageSize,
            total: query.data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
          }}
          locale={{
            emptyText: query.isPending ? ' ' : (
              <EmptyState
                description={
                  filtered
                    ? '검색 결과가 없습니다. 이름이나 휴대폰 번호 뒷자리를 다시 확인하세요.'
                    : '아직 가입한 고객이 없습니다.'
                }
              />
            ),
          }}
        />
      </Card>
    </>
  )
}
