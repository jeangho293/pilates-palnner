import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { App, Button, Flex, Typography, Upload } from 'antd'
import { InstructorAvatar } from '../InstructorAvatar'

const MAX_BYTES = 5 * 1024 * 1024
const MAX_EDGE = 480

/** 이미지를 최대 480px로 줄여 data URL로 만든다 (mock 저장소 용량 보호) */
function toResizedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('사진을 읽지 못했습니다.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('이미지 파일이 아닙니다.'))
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

interface Props {
  value?: string | null
  onChange?: (v: string | null) => void
  name?: string
}

/**
 * 강사 사진 업로드·삭제 (Form.Item 제어 컴포넌트).
 * 지금은 mock이라 로컬 파일을 data URL로 저장한다. 실제 API가 생기면 업로드 후 받은 URL을 넣으면 된다.
 */
export function PhotoInput({ value, onChange, name = '' }: Props) {
  const { message } = App.useApp()
  return (
    <Flex align="center" gap={12} wrap>
      <InstructorAvatar name={name} profileImageUrl={value ?? null} size={80} />
      <Flex vertical gap={4}>
        <Flex gap={8}>
          <Upload
            accept="image/png,image/jpeg,image/webp"
            showUploadList={false}
            beforeUpload={(file) => {
              if (!file.type.startsWith('image/')) {
                message.error('이미지 파일(JPG·PNG·WEBP)만 올릴 수 있습니다.')
                return Upload.LIST_IGNORE
              }
              if (file.size > MAX_BYTES) {
                message.error('5MB 이하의 사진을 올려 주세요.')
                return Upload.LIST_IGNORE
              }
              toResizedDataUrl(file)
                .then((url) => onChange?.(url))
                .catch((e: Error) => message.error(e.message))
              return false
            }}
          >
            <Button icon={<UploadOutlined />}>사진 올리기</Button>
          </Upload>
          <Button icon={<DeleteOutlined />} disabled={!value} onClick={() => onChange?.(null)}>
            삭제
          </Button>
        </Flex>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          JPG·PNG·WEBP, 5MB 이하. 정사각형 사진을 권장합니다.
        </Typography.Text>
      </Flex>
    </Flex>
  )
}
