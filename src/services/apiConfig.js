const FETCH_TIMEOUT_MS = 20000
const MINIMUM_LOADING_MS = 650

export async function fetchEvents() {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  const minimumDelay = new Promise((resolve) => window.setTimeout(resolve, MINIMUM_LOADING_MS))

  try {
    const [response] = await Promise.all([
      fetch(`${baseUrl}/api/events`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }),
      minimumDelay,
    ])
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error('공식 데이터 서버 주소가 올바르게 설정되지 않았습니다.')
    }
    const payload = await response.json()
    if (!response.ok || !payload.events?.length) {
      throw new Error(payload.errors?.join(', ') || '공식 데이터를 불러오지 못했습니다.')
    }
    return payload
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('공식 데이터 응답 시간이 초과되었습니다.')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
