/** 비밀번호 공통 규칙 (8자 이상) */
export const passwordRules = [
  { required: true, message: '비밀번호를 입력하세요' },
  { min: 8, message: '8자 이상으로 입력하세요' },
]
