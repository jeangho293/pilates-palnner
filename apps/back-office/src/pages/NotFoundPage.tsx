import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { paths } from '../routes/paths'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Result
      status="404"
      title="페이지를 찾을 수 없습니다"
      subTitle="주소가 바뀌었거나 없는 화면입니다."
      extra={
        <Button type="primary" onClick={() => navigate(paths.home)}>
          홈으로
        </Button>
      }
    />
  )
}
