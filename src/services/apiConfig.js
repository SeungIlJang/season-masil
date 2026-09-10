export async function fetchEvents() {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  const response = await fetch(`${baseUrl}/api/events`, { headers: { Accept: 'application/json' } })
  const payload = await response.json()
  if (!response.ok || !payload.events?.length) {
    throw new Error(payload.errors?.join(', ') || '공식 데이터를 불러오지 못했습니다.')
  }
  return payload
}
