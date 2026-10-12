export async function fetchEvents() {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  const response = await fetch(`${baseUrl}/api/events`, { headers: { Accept: 'application/json' } })
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('공식 데이터 서버 주소가 올바르게 설정되지 않았습니다.')
  }
  const payload = await response.json()
  if (!response.ok || !payload.events?.length) {
    throw new Error(payload.errors?.join(', ') || '공식 데이터를 불러오지 못했습니다.')
  }
  return payload
}
