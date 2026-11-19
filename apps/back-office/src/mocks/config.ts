/** mock 동작 설정. 데모 편의상 환경변수로 조정할 수 있다 (기획 9. 가정: 만료 시간 조정 가능). */
function minutes(value: string | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export const mockConfig = {
  sessionTimeoutMs: minutes(import.meta.env.VITE_MOCK_SESSION_MINUTES, 30) * 60_000,
  delayMinMs: 200,
  delayMaxMs: 400,
}

/** 원문 비밀번호를 저장하지 않기 위한 mock 해시 (cyrb53). 실제 서버는 bcrypt/argon2를 쓴다. */
export function hashPassword(password: string, salt: string): string {
  const str = `${salt}:${password}`
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return `mock$${(4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)}`
}
