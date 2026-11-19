import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { paths } from '../routes/paths'

/** 접근 권한 없음 (bo-forbidden). 라우트 가드와 API 403 응답이 같은 화면을 쓴다. */
export function ForbiddenView({ onLeave }: { onLeave?: () => void }) {
  const { me } = useAuth()
  const navigate = useNavigate()
  const go = (to: string) => {
    onLeave?.()
    navigate(to)
  }
  return (
    <Result
      status="403"
      title="접근 권한이 없습니다"
      subTitle={
        me?.role === 'instructor'
          ? '강사 계정은 이 화면을 사용할 수 없습니다. 내 강사 프로필과 내 정보 메뉴를 이용하세요.'
          : '이 화면을 사용할 권한이 없습니다. 필요하면 관리자에게 문의하세요.'
      }
      extra={[
        <Button key="home" type={me?.role === 'instructor' ? 'default' : 'primary'} onClick={() => go(paths.home)}>
          홈으로
        </Button>,
        me?.role === 'instructor' && (
          <Button key="mine" type="primary" onClick={() => go(paths.myInstructorProfile)}>
            내 강사 프로필로
          </Button>
        ),
      ]}
    />
  )
}
