import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Card, Typography } from 'antd'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { instructorApi } from '../../api/instructorApi'
import type { InstructorProfileInput } from '../../api/types'
import { InstructorProfileForm } from '../../components/instructor/InstructorProfileForm'
import { PageHeader } from '../../components/PageHeader'
import { ErrorState, LoadingState } from '../../components/QueryStates'
import { usePageCrumb } from '../../layout/crumb'
import { formatDate } from '../../lib/format'
import { paths } from '../../routes/paths'

/** 강사 프로필 수정 (관리자, bo-instructor-edit) */
export function InstructorEditPage() {
  const { instructorId } = useParams()
  const id = Number(instructorId)
  const navigate = useNavigate()
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['instructors', 'detail', id], queryFn: () => instructorApi.get(id) })
  usePageCrumb(query.data?.displayName)

  const save = useMutation({
    mutationFn: (v: InstructorProfileInput) => instructorApi.update(id, v),
    onSuccess: () => {
      message.success('강사 프로필을 저장했습니다.')
      void queryClient.invalidateQueries({ queryKey: ['instructors'] })
      void queryClient.invalidateQueries({ queryKey: ['staff'] })
      void queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })

  if (query.isPending) {
    return (
      <Card>
        <LoadingState rows={8} />
      </Card>
    )
  }
  if (query.isError) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    )
  }
  const inst = query.data

  return (
    <>
      <PageHeader
        back={{ to: paths.instructorList, label: '강사 프로필' }}
        title="강사 프로필 수정"
        description={
          <>
            연결된 직원{' '}
            <Link to={paths.staffDetail(inst.staff.id)}>
              {inst.staff.name} ({inst.staff.email})
            </Link>
            {inst.staff.status === 'exited' && <Typography.Text type="danger"> · 퇴사 직원</Typography.Text>} · 등록일{' '}
            {formatDate(inst.createdAt)}
          </>
        }
      />
      <InstructorProfileForm
        key={inst.id}
        showVisibility
        cancelTo={paths.instructorList}
        submitting={save.isPending}
        initialValues={{
          displayName: inst.displayName,
          profileImageUrl: inst.profileImageUrl,
          specialties: inst.specialties,
          career: inst.career,
          introduction: inst.introduction,
          isPublic: inst.isPublic,
        }}
        onSubmit={(v) => save.mutateAsync(v)}
        onSaved={() => navigate(paths.instructorList)}
      />
    </>
  )
}
