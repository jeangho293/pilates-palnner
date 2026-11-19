import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, App, Card, Tag } from 'antd'
import { instructorApi } from '../../api/instructorApi'
import { InstructorProfileForm } from '../../components/instructor/InstructorProfileForm'
import { PageHeader } from '../../components/PageHeader'
import { ErrorState, LoadingState } from '../../components/QueryStates'
import { formatDate } from '../../lib/format'
import { paths } from '../../routes/paths'

const QUERY_KEY = ['instructors', 'mine']

/** 내 강사 프로필 (강사 본인, bo-my-instructor-profile) — 공개 여부 입력 없음 */
export function MyInstructorProfilePage() {
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: instructorApi.getMine })

  const save = useMutation({
    mutationFn: instructorApi.updateMine,
    onSuccess: (inst) => {
      message.success('내 강사 프로필을 저장했습니다. 고객 웹 강사 소개에 반영됩니다.')
      queryClient.setQueryData(QUERY_KEY, inst)
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
        title="내 강사 프로필"
        description={`고객 웹 강사 소개에 보이는 내 프로필입니다. 마지막 수정 ${formatDate(inst.updatedAt)}`}
        extra={<Tag color={inst.isPublic ? 'success' : 'default'}>{inst.isPublic ? '고객 웹 공개 중' : '비공개'}</Tag>}
      />
      <InstructorProfileForm
        key={inst.id}
        cancelTo={paths.home}
        currentIsPublic={inst.isPublic}
        submitting={save.isPending}
        notice={
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
            title={inst.isPublic ? '지금 고객 웹에 공개 중입니다.' : '지금은 비공개 상태입니다.'}
            description="공개 여부는 관리자가 정합니다. 공개를 바꾸고 싶다면 관리자에게 요청하세요."
          />
        }
        initialValues={{
          displayName: inst.displayName,
          profileImageUrl: inst.profileImageUrl,
          specialties: inst.specialties,
          career: inst.career,
          introduction: inst.introduction,
        }}
        onSubmit={(v) => save.mutateAsync(v)}
      />
    </>
  )
}
