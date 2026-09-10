const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=300, s-maxage=1800',
}

const json = (payload, status = 200) => new Response(JSON.stringify(payload), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
})

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character])

const page = (title, content, status = 200) => new Response(`<!doctype html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | 모두의 시즌마실</title><style>body{max-width:760px;margin:40px auto;padding:0 20px;color:#203329;background:#f5f2e9;font:16px/1.8 system-ui,sans-serif}h1,h2{line-height:1.3}a{color:#b84f38}</style></head>
<body>${content}</body></html>`, {
  status,
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
})

const privacyPage = (supportEmail) => page('개인정보처리방침', `
<h1>모두의 시즌마실 개인정보처리방침</h1><p>시행일: 2026년 9월 3일</p>
<p>모두의 시즌마실은 회원가입 없이 사용할 수 있으며 운영자가 이름·전화번호·이메일·정확한 위치정보를 직접 수집하거나 서버에 저장하지 않습니다.</p>
<h2>기기에 저장되는 정보</h2><p>사용자가 저장한 즐겨찾기 항목은 기기의 저장공간에만 보관됩니다. 앱 데이터를 삭제하면 함께 삭제됩니다.</p>
<h2>현재 위치 사용</h2><p>앱 실행 시 사용자가 위치 권한을 허용하면 서울의 구 또는 경기도의 시·군을 자동 설정하기 위해 전경에서 기기의 대략적인 위치를 한 번 확인합니다. 좌표와 확인된 행정구역은 운영자 서버로 전송하거나 저장하지 않으며 검색 필터를 설정한 뒤 메모리에서만 사용합니다. Android 기기의 시스템 주소 변환 서비스가 행정구역 확인 과정에 사용될 수 있습니다. 위치 권한을 거부해도 모든 지역을 직접 선택할 수 있습니다.</p>
<h2>외부 데이터</h2><p>행사·시설 정보는 한국관광공사 TourAPI, 서울 열린데이터광장, 생활안전지도, 공유누리 등 공공 API에서 제공받습니다. 상세정보 링크를 열면 해당 기관의 개인정보처리방침이 적용됩니다.</p>
<h2>광고 및 제3자 서비스</h2><p>앱은 서비스 운영을 위해 Google AdMob(Google Mobile Ads SDK)을 사용합니다. Google은 광고 제공, 측정, 맞춤설정(동의한 경우), 부정 사용 방지를 위해 IP 주소, 광고 식별자 등 기기 식별자, 앱 상호작용 정보와 진단 정보를 자동으로 처리할 수 있습니다. 처리되는 항목과 기간은 기기 설정, 이용 지역, 동의 상태 및 Google 정책에 따라 달라질 수 있습니다.</p>
<p>관련 내용은 <a href="https://policies.google.com/privacy">Google 개인정보처리방침</a>과 <a href="https://developers.google.com/admob/android/privacy/play-data-disclosure">Google Mobile Ads SDK 데이터 공개 안내</a>에서 확인할 수 있습니다. 동의가 필요한 지역에서는 앱에 표시되는 동의 화면과 광고 개인정보 설정을 통해 선택을 변경할 수 있습니다.</p>
<h2>권한</h2><p>앱은 카메라·연락처·마이크·파일 권한을 요구하지 않습니다. 현재 위치 자동 설정에는 사용자가 허용한 경우에만 전경 위치 권한을 사용합니다. 광고 SDK는 Android 광고 ID를 사용할 수 있으며, 사용자는 Android 설정에서 광고 ID를 재설정하거나 삭제할 수 있습니다.</p>
<h2>문의</h2><p>개인정보 관련 문의: <a href="mailto:${supportEmail}">${supportEmail}</a></p>`)

const sourcesPage = () => page('데이터 출처', `
<h1>공공데이터 출처</h1>
<p>모두의 시즌마실은 정부기관 또는 공공기관을 대표하거나 정부기관과 제휴한 앱이 아닙니다. 아래 기관이 공개한 정보를 모아 보기 쉽게 제공합니다.</p>
<ul>
<li><a href="https://www.data.go.kr/data/15101578/openapi.do" target="_blank" rel="noopener noreferrer">한국관광공사 TourAPI 공식 원문 (공공데이터포털)</a></li>
<li><a href="https://culture.seoul.go.kr/culture/culture/cultureEvent/list.do?menuNo=200122" target="_blank" rel="noopener noreferrer">서울문화포털 문화행사 공식 원문</a></li>
<li><a href="https://www.safemap.go.kr/" target="_blank" rel="noopener noreferrer">행정안전부 생활안전지도 공식 원문</a></li>
<li><a href="https://www.eshare.go.kr/" target="_blank" rel="noopener noreferrer">공유누리 공식 원문</a></li>
</ul>
<p>공공데이터는 갱신 시점과 기관 사정에 따라 실제 운영 정보와 다를 수 있습니다. 방문 전 상세 페이지 또는 운영기관에 최종 확인하세요.</p>`)

const seasonForMonth = (month) => [3, 4, 5].includes(month) ? '봄'
  : [6, 7, 8].includes(month) ? '여름' : [9, 10, 11].includes(month) ? '가을' : '겨울'

const dateLabel = (value = '') => value.length === 8
  ? `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}` : value || '일정 확인 필요'

const district = (address = '') => address.split(/\s+/)[1] || '지역 확인 중'
const metroRegion = (value = '') => value.includes('서울') ? '서울' : value.includes('경기') ? '경기' : ''

const normalizeTour = (item, region) => ({
  id: `tour-${item.contentid}`, season: seasonForMonth(Number(item.eventstartdate?.slice(4, 6) || 1)),
  region, district: district(item.addr1), title: item.title, category: '축제·행사', price: null,
  priceLabel: '요금 정보 확인', period: `${dateLabel(item.eventstartdate)} ~ ${dateLabel(item.eventenddate)}`,
  status: '공식 데이터', tags: ['한국관광공사', region], address: item.addr1 || '',
  image: (item.firstimage || '').replace(/^http:/, 'https:'),
  detailUrl: `https://korean.visitkorea.or.kr/search/search_list.do?keyword=${encodeURIComponent(item.title)}`,
  source: '한국관광공사 TourAPI', sourceUrl: 'https://www.data.go.kr/data/15101578/openapi.do',
  startDate: item.eventstartdate || '', endDate: item.eventenddate || item.eventstartdate || '',
})

const parseSeoulDate = (value = '') => {
  const matches = [...value.matchAll(/(\d{4})[-.]?(\d{1,2})[-.]?(\d{1,2})/g)]
  const compact = (match) => match ? `${match[1]}${match[2].padStart(2, '0')}${match[3].padStart(2, '0')}` : ''
  return matches.length ? { month: Number(matches[0][2]), start: compact(matches[0]), end: compact(matches.at(-1)) } : { month: 1, start: '', end: '' }
}

const fee = (value = '') => {
  if (/무료|없음/.test(value)) return { price: 0, priceLabel: '무료' }
  const amounts = [...value.matchAll(/([\d,]+)\s*원/g)].map((match) => Number(match[1].replaceAll(',', '')))
  return { price: amounts.length ? Math.min(...amounts) : null, priceLabel: value || '요금 정보 확인' }
}

const normalizeSeoul = (item, index) => {
  const date = parseSeoulDate(item.DATE)
  return {
    id: `seoul-${item.RGSTDATE || index}-${item.TITLE}`, season: seasonForMonth(date.month), region: '서울',
    district: item.GUNAME || district(item.PLACE), title: item.TITLE, category: item.CODENAME || '문화행사',
    ...fee(item.USE_FEE), period: item.DATE || '일정 확인 필요', status: '서울시 공식',
    tags: ['서울시', item.USE_TRGT || '시민 누구나'].filter(Boolean), address: item.PLACE || '',
    image: (item.MAIN_IMG || '').replace(/^http:/, 'https:'), detailUrl: (item.ORG_LINK || '').replace(/^http:/, 'https:'),
    source: '서울문화포털', sourceUrl: 'https://culture.seoul.go.kr/culture/culture/cultureEvent/list.do?menuNo=200122',
    startDate: date.start, endDate: date.end,
  }
}

const normalizeSafety = (item, type, index) => {
  const values = {
    heat: ['여름', item.cc_nm, item.rn_adres || item.adres, '무더위쉼터', item.cc_type],
    cold: ['겨울', item.reare_nm, item.rona_daddr, '한파쉼터', item.fclt_type],
    water: ['여름', item.plc_nm, item.adres, '물놀이 안전', item.management],
  }[type]
  const region = metroRegion(values[2] || '') || metroRegion(item.ctprvn_nm || '')
  return {
    id: `safemap-${type}-${item.buld_sn || item.objt_id || index}`, season: values[0], region,
    district: item.sgg_nm || district(values[2]), title: values[1] || values[3], category: values[3],
    price: 0, priceLabel: '무료', period: type === 'water' ? '운영·통제 정보 확인' : '운영시간 확인 필요',
    status: '공공 안전정보', tags: ['생활안전지도', values[4]].filter(Boolean), address: values[2] || '',
    image: '', detailUrl: 'https://www.safemap.go.kr/', source: '행정안전부 생활안전지도',
    sourceUrl: 'https://www.safemap.go.kr/', startDate: '', endDate: '',
  }
}

const findResourceRows = (value) => {
  if (Array.isArray(value)) {
    if (value.some((item) => item && typeof item === 'object' && ('rsrcNo' in item || 'rsrcNm' in item))) return value
    for (const item of value) {
      const found = findResourceRows(item)
      if (found.length) return found
    }
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      const found = findResourceRows(item)
      if (found.length) return found
    }
  }
  return []
}

const findMessage = (value) => {
  if (!value || typeof value !== 'object') return ''
  for (const key of ['resultMsg', 'message', 'msg']) if (typeof value[key] === 'string') return value[key]
  for (const child of Object.values(value)) {
    const found = findMessage(child)
    if (found) return found
  }
  return ''
}

const sharedCategory = (title = '') => /주차/.test(title) ? '주차장'
  : /체육|운동|수영|구장/.test(title) ? '체육시설'
    : /회의|강의|강당/.test(title) ? '공유공간' : '공공시설'

const normalizeEshare = (item, index) => {
  const address = [item.addr, item.daddr].filter(Boolean).join(' ')
  const region = metroRegion(address)
  return {
    id: `eshare-${item.rsrcNo || index}`, season: '사계절', region, district: district(address),
    title: item.rsrcNm || '공유자원', category: sharedCategory(item.rsrcNm), price: null,
    priceLabel: '이용료 확인', period: '예약 가능일 확인', status: '공유누리 공식',
    tags: ['공유누리', sharedCategory(item.rsrcNm)], address,
    image: (item.imgFileUrlAddr || '').replace(/^http:/, 'https:'),
    detailUrl: (item.instUrlAddr || 'https://www.eshare.go.kr/').replace(/^http:/, 'https:'),
    source: '공유누리', sourceUrl: 'https://www.eshare.go.kr/', startDate: '', endDate: '',
  }
}

const getTour = async (env, areaCode, region, today) => {
  const params = new URLSearchParams({ serviceKey: env.TOUR_API_SERVICE_KEY, MobileOS: 'ETC',
    MobileApp: 'SeasonPublicGuide', _type: 'json', areaCode, eventStartDate: today,
    eventEndDate: `${Number(today.slice(0, 4)) + 1}1231`, arrange: 'A', numOfRows: '100', pageNo: '1' })
  const response = await fetch(`https://apis.data.go.kr/B551011/KorService2/searchFestival2?${params}`)
  const data = await response.json()
  if (data.response?.header?.resultCode !== '0000') throw new Error(data.response?.header?.resultMsg || `TourAPI ${region} 오류`)
  return (data.response?.body?.items?.item || []).map((item) => normalizeTour(item, region))
}

const getSeoul = async (env) => {
  const response = await fetch(`http://openapi.seoul.go.kr:8088/${env.SEOUL_OPEN_DATA_KEY}/json/culturalEventInfo/1/300/`)
  const data = await response.json()
  if (data.culturalEventInfo?.RESULT?.CODE !== 'INFO-000') throw new Error(data.culturalEventInfo?.RESULT?.MESSAGE || '서울 API 오류')
  return (data.culturalEventInfo.row || []).map(normalizeSeoul)
}

const getSafety = async (env) => (await Promise.all([['IF_0001', 'heat'], ['IF_0136', 'cold'], ['IF_0044', 'water']].map(async ([id, type]) => {
  const params = new URLSearchParams({ serviceKey: env.SAFEMAP_SERVICE_KEY, numOfRows: '1000', pageNo: '1', returnType: 'JSON' })
  const response = await fetch(`https://www.safemap.go.kr/openapi2/${id}?${params}`)
  const data = await response.json()
  if (data.header?.resultCode !== '00') throw new Error(data.header?.resultMsg || `생활안전지도 ${id} 오류`)
  return (data.body?.items?.item || []).map((item, index) => normalizeSafety(item, type, index)).filter((item) => item.region)
}))).flat()

const getEshare = async (env) => {
  if (!env.ESHARE_SERVICE_KEY) return []
  return (await Promise.all(['11', '41'].map(async (ctpvCd) => {
    const response = await fetch(`https://www.eshare.go.kr/eshare-openapi/rsrc/list/${encodeURIComponent(env.ESHARE_SERVICE_KEY)}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNo: 1, numOfRows: 100, ctpvCd }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(`공유누리 HTTP ${response.status}: ${findMessage(data) || '요청 실패'}`)
    return findResourceRows(data).map(normalizeEshare).filter((item) => item.region)
  }))).flat()
}

const getEvents = async (env) => {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }).replaceAll('-', '')
  const settled = await Promise.allSettled([getTour(env, '1', '서울', today), getTour(env, '31', '경기', today), getSeoul(env), getSafety(env), getEshare(env)])
  const errors = settled.filter((result) => result.status === 'rejected').map((result) => result.reason.message)
  const rows = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
    .filter((event) => event.title && (!event.endDate || event.endDate >= today))
  const events = [...new Map(rows.map((event) => [`${event.region}-${event.title}-${event.period}`, event])).values()]
    .sort((a, b) => (a.startDate || '99999999').localeCompare(b.startDate || '99999999')).slice(0, 500)
  return { events, errors, fetchedAt: new Date().toISOString() }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405)
    if (url.pathname === '/health') return json({ ok: true, service: 'season-masil-api', privacyConfigured: Boolean(env.SUPPORT_EMAIL) })
    if (url.pathname === '/privacy') {
      if (!env.SUPPORT_EMAIL) return page('설정 필요', '<h1>개인정보처리방침 준비 중</h1><p>지원 이메일 설정이 필요합니다.</p>', 503)
      return privacyPage(escapeHtml(env.SUPPORT_EMAIL))
    }
    if (url.pathname === '/data-sources') return sourcesPage()
    if (url.pathname !== '/api/events') return json({ error: 'Not found' }, 404)
    const cache = caches.default
    const cacheKey = new Request(url.origin + '/api/events?cache=source-links-v2', request)
    const cached = await cache.match(cacheKey)
    if (cached) return cached
    try {
      const payload = await getEvents(env)
      const response = json(payload, payload.events.length ? 200 : 502)
      ctx.waitUntil(cache.put(cacheKey, response.clone()))
      return response
    } catch (error) {
      return json({ events: [], errors: [error.message] }, 500)
    }
  },
}
