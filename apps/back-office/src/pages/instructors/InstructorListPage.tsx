import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Card, Flex, Switch, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { instructorApi } from '../../api/instructorApi'
import type { Instructor, InstructorSortField, InstructorVisibilityFilter, Page } from '../../api/types'
import { InstructorAvatar } from '../../components/InstructorAvatar'
import { ListToolbar } from '../../components/ListToolbar'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState } from '../../components/QueryStates'
import { formatDate } from '../../lib/format'
import { useListState } from '../../lib/useListState'
import { paths } from '../../routes/paths'
import { tokens } from '../../theme/tokens'

const VISIBILITY_OPTIONS: { label: string; value: InstructorVisibilityFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '공개', value: 'public' },
  { label: '비공개', value: 'private' },
]

const needsWriting = (i: Instructor) => !i.introduction || i.specialties.length === 0

export function InstructorListPage() {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const queryClient = useQueryClient()
  const list = useListState<InstructorSortField, InstructorVisibilityFilter>({
    sortField: 'createdAt',
    sortOrder: 'asc',
    filter: 'all',
  })

  const params = {
    page: list.page,
    pageSize: list.pageSize,
    sortField: list.sortField,
    sortOrder: list.sortOrder,
    q: list.q || undefined,
    visibility: list.filter,
  }
  const queryKey = ['instructors', 'list', params]
  const query = useQuery({
    queryKey,
    queryFn: () => instructorApi.list(params),
    placeholderData: keepPreviousData,
  })

  // 공개 Switch: 즉시 저장 + 낙관적 반영, 실패 시 원래 상태로 되돌림
  const visibility = useMutation({
    mutationFn: ({ id, isPublic }: { id: number; isPublic: boolean; displayName: string }) =>
      instructorApi.setVisibility(id, isPublic),
    onMutate: async ({ id, isPublic }) => {
      await queryClient.cancelQueries({ queryKey })
      const prev = queryClient.getQueryData<Page<Instructor>>(queryKey)
      queryClient.setQueryData<Page<Instructor>>(queryKey, (old) =>
        old ? { ...old, items: old.items.map((i) => (i.id === id ? { ...i, isPublic } : i)) } : old,
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev)
    },
    onSuccess: (_, { isPublic, displayName }) => {
      message.success(
        isPublic ? `${displayName} 프로필을 고객 웹에 공개했습니다.` : `${displayName} 프로필을 고객 웹에서 숨겼습니다.`,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['instructors'] })
      void queryClient.invalidateQueries({ queryKey: ['staff'] })
      void queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })

  const showHowToAdd = () => {
    modal.confirm({
      title: '강사 추가',
      icon: <InfoCircleOutlined style={{ color: tokens.semantic.info }} />,
      content: '강사는 직원 관리에서 강사 역할로 직원을 추가하면 비공개 강사 프로필이 함께 만들어집니다.',
      okText: '직원 관리로',
      cancelText: '닫기',
      onOk: () => navigate(paths.staffList),
    })
  }

  const columns: TableColumnsType<Instructor> = [
    {
      title: '사진',
      dataIndex: 'profileImageUrl',
      width: 72,
      render: (_, row) => <InstructorAvatar name={row.displayName} profileImageUrl={row.profileImageUrl} size={36} />,
    },
    {
      title: '표시 이름',
      dataIndex: 'displayName',
      ...list.sortProps('displayName'),
      render: (name: string, row) => (
        <Flex align="center" gap={6} wrap>
          <Link to={paths.instructorEdit(row.id)}>{name}</Link>
          {needsWriting(row) && (
            <Tag color="warning" variant="filled">
              작성 필요
            </Tag>
          )}
        </Flex>
      ),
    },
    {
      title: '전문 분야',
      dataIndex: 'specialties',
      render: (s: string[]) =>
        s.length ? (
          <Flex gap={4} wrap>
            {s.map((x) => (
              <Tag key={x} variant="filled" style={{ marginInlineEnd: 0 }}>
                {x}
              </Tag>
            ))}
          </Flex>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        ),
    },
    {
      title: '연결된 직원',
      dataIndex: ['staff', 'email'],
      render: (_, row) => (
        <Flex vertical>
          <Link to={paths.staffDetail(row.staff.id)}>{row.staff.name}</Link>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {row.staff.email}
            {row.staff.status === 'exited' && ' · 퇴사 직원'}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: '공개 여부',
      dataIndex: 'isPublic',
      ...list.sortProps('isPublic'),
      width: 110,
      render: (isPublic: boolean, row) => (
        <Switch
          checked={isPublic}
          checkedChildren="공개"
          unCheckedChildren="비공개"
          loading={visibility.isPending && visibility.variables?.id === row.id}
          onChange={(checked) => visibility.mutate({ id: row.id, isPublic: checked, displayName: row.displayName })}
          aria-label={`${row.displayName} 고객 웹 공개`}
        />
      ),
    },
    {
      title: '등록일',
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
        <Button size="small" onClick={() => navigate(paths.instructorEdit(row.id))}>
          수정
        </Button>
      ),
    },
  ]

  const filtered = Boolean(list.q) || list.filter !== 'all'

  return (
    <>
      <PageHeader
        title="강사 프로필"
        description="고객 웹 강사 소개에 보이는 프로필입니다. 고객 웹에는 공개된 프로필만 등록순으로 노출됩니다."
        extra={
          <Button icon={<PlusOutlined />} onClick={showHowToAdd}>
            강사 추가
          </Button>
        }
      />
      <Card>
        <ListToolbar
          q={list.q}
          onSearch={list.setQ}
          placeholder="표시 이름·전문 분야 검색"
          filter={list.filter}
          filterOptions={VISIBILITY_OPTIONS}
          onFilterChange={list.setFilter}
          summary={`총 ${query.data?.total ?? 0}명 · 컬럼 머리글을 누르면 정렬됩니다`}
        />
        {query.isError && (
          <Alert
            type="error"
            showIcon
            title="강사 프로필 목록을 불러오지 못했습니다."
            description={query.error.message}
            action={<Button onClick={() => query.refetch()}>다시 시도</Button>}
            style={{ marginBottom: 12 }}
          />
        )}
        <Table<Instructor>
          rowKey="id"
          columns={columns}
          dataSource={query.data?.items}
          loading={query.isFetching && !visibility.isPending}
          onChange={list.onTableChange}
          scroll={{ x: 860 }}
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
                description={filtered ? '조건에 맞는 강사 프로필이 없습니다.' : '등록된 강사 프로필이 없습니다.'}
              />
            ),
          }}
        />
      </Card>
    </>
  )
}
