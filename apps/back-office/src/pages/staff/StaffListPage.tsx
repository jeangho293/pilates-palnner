import { PlusOutlined } from '@ant-design/icons'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Table, Tag } from 'antd'
import type { TableColumnsType } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { staffApi } from '../../api/staffApi'
import type { Staff, StaffSortField, StaffStatusFilter } from '../../api/types'
import { ListToolbar } from '../../components/ListToolbar'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState } from '../../components/QueryStates'
import { formatDate, formatDateTime, ROLE_LABEL } from '../../lib/format'
import { useListState } from '../../lib/useListState'
import { paths } from '../../routes/paths'
import { StaffCreateDrawer } from './StaffCreateDrawer'
import { StaffStatusTag } from './StaffStatusTag'

const STATUS_OPTIONS: { label: string; value: StaffStatusFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '준비', value: 'ready' },
  { label: '활성', value: 'active' },
  { label: '퇴사', value: 'exited' },
]

export function StaffListPage() {
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const list = useListState<StaffSortField, StaffStatusFilter>({
    sortField: 'lastLoginOn',
    sortOrder: 'desc',
    filter: 'all',
  })

  const params = {
    page: list.page,
    pageSize: list.pageSize,
    sortField: list.sortField,
    sortOrder: list.sortOrder,
    q: list.q || undefined,
    status: list.filter,
  }
  const query = useQuery({
    queryKey: ['staff', 'list', params],
    queryFn: () => staffApi.list(params),
    placeholderData: keepPreviousData,
  })

  const columns: TableColumnsType<Staff> = [
    {
      title: '이름',
      dataIndex: 'name',
      ...list.sortProps('name'),
      render: (name: string, row) => <Link to={paths.staffDetail(row.id)}>{name}</Link>,
    },
    { title: '이메일', dataIndex: 'email', ...list.sortProps('email'), ellipsis: true },
    {
      title: '역할',
      dataIndex: 'role',
      ...list.sortProps('role'),
      width: 100,
      render: (role: Staff['role']) => (
        <Tag color={role === 'admin' ? 'gold' : 'default'} variant="filled">
          {ROLE_LABEL[role]}
        </Tag>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      ...list.sortProps('status'),
      width: 100,
      render: (status: Staff['status']) => <StaffStatusTag status={status} />,
    },
    {
      title: '마지막 로그인',
      dataIndex: 'lastLoginOn',
      ...list.sortProps('lastLoginOn'),
      width: 170,
      render: (v: string | null) => formatDateTime(v),
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      ...list.sortProps('createdAt'),
      width: 120,
      render: (v: string) => formatDate(v),
    },
    {
      key: 'actions',
      width: 80,
      align: 'right',
      render: (_, row) => (
        <Button size="small" onClick={() => navigate(paths.staffDetail(row.id))}>
          상세
        </Button>
      ),
    },
  ]

  const filtered = Boolean(list.q) || list.filter !== 'all'

  return (
    <>
      <PageHeader
        title="직원 관리"
        description="백오피스에 로그인하는 직원 계정과 역할을 관리합니다."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            직원 추가
          </Button>
        }
      />
      <Card>
        <ListToolbar
          q={list.q}
          onSearch={list.setQ}
          placeholder="이름·이메일 검색"
          filter={list.filter}
          filterOptions={STATUS_OPTIONS}
          onFilterChange={list.setFilter}
          summary={`총 ${query.data?.total ?? 0}명 · 컬럼 머리글을 누르면 정렬됩니다`}
        />
        {query.isError && (
          <Alert
            type="error"
            showIcon
            title="직원 목록을 불러오지 못했습니다."
            description={query.error.message}
            action={<Button onClick={() => query.refetch()}>다시 시도</Button>}
            style={{ marginBottom: 12 }}
          />
        )}
        <Table<Staff>
          rowKey="id"
          columns={columns}
          dataSource={query.data?.items}
          loading={query.isFetching}
          onChange={list.onTableChange}
          scroll={{ x: 840 }}
          pagination={{
            current: list.page,
            pageSize: list.pageSize,
            total: query.data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            hideOnSinglePage: false,
          }}
          locale={{
            emptyText: query.isPending ? ' ' : (
              <EmptyState description={filtered ? '조건에 맞는 직원이 없습니다.' : '등록된 직원이 없습니다.'} />
            ),
          }}
        />
      </Card>
      <StaffCreateDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        // 새 직원은 아직 로그인 기록이 없으므로 생성일 최신순 첫 페이지로 바꿔 바로 보이게 한다
        onCreated={() => list.setSort('createdAt', 'desc')}
      />
    </>
  )
}
