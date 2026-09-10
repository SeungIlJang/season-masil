import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const seasonForMonth = (month) => {
  if ([3, 4, 5].includes(month)) return '봄'
  if ([6, 7, 8].includes(month)) return '여름'
  if ([9, 10, 11].includes(month)) return '가을'
  return '겨울'
}

const dateLabel = (value) => value && value.length === 8
  ? `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`
  : value || '일정 확인 필요'

const districtFromAddress = (address = '') => address.split(/\s+/)[1] || '지역 확인 중'

const normalizeTour = (item, region) => ({
  id: `tour-${item.contentid}`,
  season: seasonForMonth(Number(item.eventstartdate?.slice(4, 6) || 1)),
  region,
  district: districtFromAddress(item.addr1),
  title: item.title,
  category: '축제·행사',
  price: null,
  priceLabel: '요금 정보 확인',
  period: `${dateLabel(item.eventstartdate)} ~ ${dateLabel(item.eventenddate)}`,
  startDate: item.eventstartdate || '',
  endDate: item.eventenddate || item.eventstartdate || '',
  status: '공식 데이터',
  tags: ['한국관광공사', region],
  address: item.addr1 || '',
  image: (item.firstimage || '').replace(/^http:/, 'https:'),
  detailUrl: `https://korean.visitkorea.or.kr/detail/fes_detail.do?cotid=${item.contentid}`,
  source: 'TourAPI',
})

const parseSeoulDate = (value = '') => {
  const matches = [...value.matchAll(/(\d{4})[-.]?(\d{1,2})[-.]?(\d{1,2})/g)]
  const compact = (match) => match ? `${match[1]}${match[2].padStart(2, '0')}${match[3].padStart(2, '0')}` : ''
  return matches.length
    ? { month: Number(matches[0][2]), label: value, startDate: compact(matches[0]), endDate: compact(matches.at(-1)) }
    : { month: 1, label: value || '일정 확인 필요', startDate: '', endDate: '' }
}

const priceFromText = (value = '') => {
  if (/무료|없음/.test(value)) return { price: 0, priceLabel: '무료' }
  const numbers = [...value.matchAll(/([\d,]+)\s*원/g)].map((match) => Number(match[1].replaceAll(',', '')))
  return { price: numbers.length ? Math.min(...numbers) : null, priceLabel: value || '요금 정보 확인' }
}

const normalizeSeoul = (item, index) => {
  const date = parseSeoulDate(item.DATE)
  const fee = priceFromText(item.USE_FEE)
  return {
    id: `seoul-${item.RGSTDATE || index}-${item.TITLE}`,
    season: seasonForMonth(date.month),
    region: '서울',
    district: item.GUNAME || districtFromAddress(item.PLACE),
    title: item.TITLE,
    category: item.CODENAME || '문화행사',
    ...fee,
    period: date.label,
    startDate: date.startDate,
    endDate: date.endDate,
    status: '서울시 공식',
    tags: ['서울시', item.USE_TRGT || '시민 누구나'].filter(Boolean),
    address: item.PLACE || '',
    image: (item.MAIN_IMG || '').replace(/^http:/, 'https:'),
    detailUrl: (item.ORG_LINK || '').replace(/^http:/, 'https:'),
    source: '서울 열린데이터광장',
  }
}

const metroRegion = (value = '') => value.includes('서울') ? '서울' : value.includes('경기') ? '경기' : ''

const normalizeSafetyFacility = (item, type, index) => {
  const definitions = {
    heat: { season: '여름', title: item.cc_nm, address: item.rn_adres || item.adres, category: '무더위쉼터', tag: item.cc_type },
    cold: { season: '겨울', title: item.reare_nm, address: item.rona_daddr, category: '한파쉼터', tag: item.fclt_type },
    water: { season: '여름', title: item.plc_nm, address: item.adres, category: '물놀이 안전', tag: item.management },
  }
  const row = definitions[type]
  const region = metroRegion(row.address || '') || metroRegion(item.ctprvn_nm || '')
  return {
    id: `safemap-${type}-${item.buld_sn || item.objt_id || index}`,
    season: row.season,
    region,
    district: item.sgg_nm || districtFromAddress(row.address),
    title: row.title || row.category,
    category: row.category,
    price: 0,
    priceLabel: '무료',
    period: type === 'water' ? '운영·통제 정보 확인' : '운영시간 확인 필요',
    status: '공공 안전정보',
    tags: ['생활안전지도', row.tag].filter(Boolean),
    address: row.address || '',
    image: '',
    detailUrl: 'https://www.safemap.go.kr/',
    source: '생활안전지도',
    startDate: '', endDate: '',
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
    id: `eshare-${item.rsrcNo || index}`,
    season: '사계절',
    region,
    district: districtFromAddress(address),
    title: item.rsrcNm || '공유자원',
    category: sharedCategory(item.rsrcNm),
    price: null,
    priceLabel: '이용료 확인',
    period: '예약 가능일 확인',
    status: '공유누리 공식',
    tags: ['공유누리', sharedCategory(item.rsrcNm)],
    address,
    image: (item.imgFileUrlAddr || '').replace(/^http:/, 'https:'),
    detailUrl: (item.instUrlAddr || 'https://www.eshare.go.kr/').replace(/^http:/, 'https:'),
    source: '공유누리',
    startDate: '', endDate: '',
  }
}

const fetchEshareFacilities = async (env) => {
  if (!env.VITE_ESHARE_SERVICE_KEY) return []
  const regions = ['11', '41']
  const results = await Promise.all(regions.map(async (ctpvCd) => {
    const response = await fetch(`https://www.eshare.go.kr/eshare-openapi/rsrc/list/${encodeURIComponent(env.VITE_ESHARE_SERVICE_KEY)}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNo: 1, numOfRows: 100, ctpvCd }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(`공유누리 HTTP ${response.status}: ${findMessage(data) || '요청 실패'}`)
    return findResourceRows(data).map(normalizeEshare).filter((item) => item.region)
  }))
  return results.flat()
}

const fetchSafeMapFacilities = async (env) => {
  const sources = [['IF_0001', 'heat'], ['IF_0136', 'cold'], ['IF_0044', 'water']]
  const results = await Promise.all(sources.map(async ([interfaceId, type]) => {
    const params = new URLSearchParams({
      serviceKey: env.VITE_SAFEMAP_SERVICE_KEY,
      numOfRows: '1000', pageNo: '1', returnType: 'JSON',
    })
    const response = await fetch(`https://www.safemap.go.kr/openapi2/${interfaceId}?${params}`)
    if (!response.ok) throw new Error(`생활안전지도 ${interfaceId} HTTP ${response.status}`)
    const data = await response.json()
    if (data.header?.resultCode !== '00') throw new Error(data.header?.resultMsg || `생활안전지도 ${interfaceId} 오류`)
    return (data.body?.items?.item || [])
      .map((item, index) => normalizeSafetyFacility(item, type, index))
      .filter((item) => item.region)
  }))
  return results.flat()
}

const sendJson = (response, status, payload) => {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

const eventsApi = (env) => ({ name: 'season-events-api', configureServer(server) {
  server.middlewares.use('/api/events', async (_request, response) => {
    const errors = []
    try {
      const now = new Date()
      const startDate = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }).replaceAll('-', '')
      const endDate = `${now.getFullYear() + 1}1231`
      const tourBase = 'https://apis.data.go.kr/B551011/KorService2/searchFestival2'
      const tourRequests = [['1', '서울'], ['31', '경기']].map(async ([areaCode, region]) => {
        const params = new URLSearchParams({
          serviceKey: env.VITE_TOUR_API_SERVICE_KEY,
          MobileOS: 'ETC', MobileApp: 'SeasonPublicGuide', _type: 'json',
          areaCode, eventStartDate: startDate, eventEndDate: endDate,
          arrange: 'A', numOfRows: '100', pageNo: '1',
        })
        const result = await fetch(`${tourBase}?${params}`)
        if (!result.ok) throw new Error(`TourAPI ${region} HTTP ${result.status}`)
        const data = await result.json()
        if (data.response?.header?.resultCode !== '0000') throw new Error(data.response?.header?.resultMsg || `TourAPI ${region} 오류`)
        const items = data.response?.body?.items?.item || []
        return items.map((item) => normalizeTour(item, region))
      })

      const seoulRequest = (async () => {
        const url = `http://openapi.seoul.go.kr:8088/${env.VITE_SEOUL_OPEN_DATA_KEY}/json/culturalEventInfo/1/300/`
        const result = await fetch(url)
        if (!result.ok) throw new Error(`서울 API HTTP ${result.status}`)
        const data = await result.json()
        const service = data.culturalEventInfo
        if (service?.RESULT?.CODE !== 'INFO-000') throw new Error(service?.RESULT?.MESSAGE || '서울 API 오류')
        return (service.row || []).map(normalizeSeoul)
      })()

      const safetyRequest = fetchSafeMapFacilities(env)
      const eshareRequest = fetchEshareFacilities(env)
      const settled = await Promise.allSettled([...tourRequests, seoulRequest, safetyRequest, eshareRequest])
      const events = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
      settled.forEach((result) => { if (result.status === 'rejected') errors.push(result.reason.message) })
      const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }).replaceAll('-', '')
      const currentAndFuture = events.filter((event) => event.title && (!event.endDate || event.endDate >= today))
      const unique = [...new Map(currentAndFuture.map((event) => [`${event.region}-${event.title}-${event.period}`, event])).values()]
        .sort((a, b) => (a.startDate || '99999999').localeCompare(b.startDate || '99999999'))
        .slice(0, 500)
      sendJson(response, unique.length ? 200 : 502, { events: unique, errors, fetchedAt: new Date().toISOString() })
    } catch (error) {
      sendJson(response, 500, { events: [], errors: [error.message] })
    }
  })
}})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return { plugins: [
    vue(),
    eventsApi(env),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.svg', 'privacy.html', 'data-sources.html'],
      manifest: {
        name: '모두의 시즌마실',
        short_name: '시즌마실',
        description: '서울·경기의 계절 행사와 공공시설을 한곳에서 찾습니다.',
        theme_color: '#203329',
        background_color: '#f5f2e9',
        display: 'standalone',
        start_url: '/',
        lang: 'ko',
        icons: [{ src: '/app-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [{
          urlPattern: /\/api\/events$/,
          handler: 'NetworkFirst',
          options: { cacheName: 'season-events', networkTimeoutSeconds: 12, expiration: { maxEntries: 2, maxAgeSeconds: 1800 } },
        }],
      },
    }),
  ] }
})
