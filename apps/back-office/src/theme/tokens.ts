/**
 * 디자인 시스템 토큰 (issue-board 디자인 시스템, approved).
 * 색·글꼴·간격·모서리 값은 이 파일에서만 정의한다. 다른 곳은 반드시 여기서 가져다 쓴다.
 */
export const tokens = {
  brand: {
    main: '#8B6F56',
    mainHover: '#7A624C',
    mainSoft: '#F3EDE6',
    sub: '#6F8193',
    subSoft: '#EBEFF2',
  },
  neutral: {
    bg: '#F7F3EE',
    surface: '#FFFDF9',
    surface2: '#EFE8DD',
    border: '#E6DDD1',
    text: '#3B3229',
    muted: '#7A6E62',
  },
  semantic: {
    success: '#5E8C61',
    warning: '#C08A3E',
    danger: '#B5523F',
    info: '#5F7488',
  },
  font: {
    heading:
      "Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif",
    body: "Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif",
  },
  typeScale: {
    display: { size: 32, weight: 700, lineHeight: 1.25 },
    h1: { size: 24, weight: 700, lineHeight: 1.33 },
    h2: { size: 20, weight: 600, lineHeight: 1.4 },
    h3: { size: 16, weight: 600, lineHeight: 1.5 },
    body: { size: 14, weight: 400, lineHeight: 1.57 },
    caption: { size: 12, weight: 400, lineHeight: 1.5 },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
  radius: { sm: 4, md: 8, lg: 12, full: 999 },
  layout: {
    siderWidth: 220,
    siderCollapsedWidth: 64,
    headerHeight: 56,
  },
} as const

export type Tokens = typeof tokens
