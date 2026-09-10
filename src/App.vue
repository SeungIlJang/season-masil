<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import EventCard from './components/EventCard.vue'
import { sampleEvents } from './data/sampleEvents'
import { canonicalDistrictFor, DISTRICTS_BY_REGION } from './data/regions'
import { fetchEvents } from './services/apiConfig'
import { initializeAds, showAdPrivacyOptions } from './services/adMob'
import { locateAdministrativeArea } from './services/currentLocation'
import { openEventDetail } from './services/externalLinks'

const seasons = ['전체', '봄', '여름', '가을', '겨울', '사계절']
const selectedSeason = ref('전체')
const selectedRegion = ref('전체')
const selectedDistrict = ref('전체')
const priceLimit = ref('전체')
const query = ref('')
const selectedActivityType = ref('전체')
const selectedCategory = ref('전체')
const sortMode = ref('date')
const favoriteOnly = ref(false)
const favorites = ref(new Set(JSON.parse(localStorage.getItem('season-masil-favorites') || '[]')))
const visibleCount = ref(24)
const events = ref([])
const loading = ref(true)
const loadError = ref('')
const adPrivacyOptionsRequired = ref(false)
const usingSamples = computed(() => !events.value.length)

onMounted(async () => {
  void initializeAds().then((required) => {
    adPrivacyOptionsRequired.value = required
  })
  void setFromCurrentLocation()

  try {
    const payload = await fetchEvents()
    events.value = payload.events
    loadError.value = payload.errors?.join(', ') || ''
  } catch (error) {
    loadError.value = error.message
  } finally {
    loading.value = false
  }
})

const categories = computed(() => [
  '전체',
  ...[...new Set((events.value.length ? events.value : sampleEvents).map((event) => event.category))]
    .sort((a, b) => a.localeCompare(b, 'ko')),
])

const districts = computed(() => DISTRICTS_BY_REGION[selectedRegion.value] || [])

const activityTypes = ['전체', '공연·관람', '체험·액티비티', '축제·행사', '쉼터·편의', '기타']

const activityTypeFor = (event) => {
  const value = [event.category, event.title, ...(event.tags || [])].filter(Boolean).join(' ')
  if (/축제|행사|페스티벌/.test(value)) return '축제·행사'
  if (/교육|체험|물놀이|체육|운동|수영|스케이트|썰매|레저|캠핑|놀이터/.test(value)) return '체험·액티비티'
  if (/전시|미술|공연|클래식|국악|콘서트|연극|무용|뮤지컬|오페라|영화|독주|독창|박물관|미술관/.test(value)) return '공연·관람'
  if (/쉼터|공공시설|공유공간|주차장/.test(value)) return '쉼터·편의'
  return '기타'
}

const filteredEvents = computed(() => (events.value.length ? events.value : sampleEvents).filter((event) => {
  const seasonMatch = selectedSeason.value === '전체' || event.season === selectedSeason.value
  const regionMatch = selectedRegion.value === '전체' || event.region === selectedRegion.value
  const districtMatch = selectedDistrict.value === '전체'
    || canonicalDistrictFor(event.region, event.district) === selectedDistrict.value
  const priceMatch = priceLimit.value === '전체'
    || (priceLimit.value === '무료' && event.price === 0)
    || (priceLimit.value === 'under5000' && event.price !== null && event.price < 5000)
    || (priceLimit.value === '5000to10000' && event.price !== null && event.price >= 5000 && event.price < 10000)
    || (priceLimit.value === '10000to20000' && event.price !== null && event.price >= 10000 && event.price < 20000)
    || (priceLimit.value === 'min20000' && event.price !== null && event.price >= 20000)
  const normalizedQuery = query.value.trim().toLowerCase()
  const activityTypeMatch = selectedActivityType.value === '전체' || activityTypeFor(event) === selectedActivityType.value
  const categoryMatch = selectedCategory.value === '전체' || event.category === selectedCategory.value
  const favoriteMatch = !favoriteOnly.value || favorites.value.has(event.id)
  const queryMatch = !normalizedQuery
    || [event.title, event.category, event.district, event.address, ...event.tags]
      .filter(Boolean).some((value) => value.toLowerCase().includes(normalizedQuery))

  return seasonMatch && regionMatch && districtMatch && priceMatch && activityTypeMatch && categoryMatch && favoriteMatch && queryMatch
}).sort((a, b) => {
  if (sortMode.value === 'name') return a.title.localeCompare(b.title, 'ko')
  if (sortMode.value === 'region') return `${a.region}${a.district}${a.title}`.localeCompare(`${b.region}${b.district}${b.title}`, 'ko')
  return (a.startDate || '99999999').localeCompare(b.startDate || '99999999')
}))

const displayedEvents = computed(() => filteredEvents.value.slice(0, visibleCount.value))

const toggleFavorite = (id) => {
  const next = new Set(favorites.value)
  next.has(id) ? next.delete(id) : next.add(id)
  favorites.value = next
  localStorage.setItem('season-masil-favorites', JSON.stringify([...next]))
}

const setFromCurrentLocation = async () => {
  try {
    const area = await locateAdministrativeArea({ requestPermission: true })
    if (!area) return
    selectedRegion.value = area.region
    selectedDistrict.value = area.district
  } catch {
    // 권한 거부나 위치 확인 실패 시 수동 지역 선택을 그대로 유지합니다.
  }
}

watch(selectedRegion, () => {
  if (!districts.value.includes(selectedDistrict.value)) selectedDistrict.value = '전체'
})

watch([selectedSeason, selectedRegion, selectedDistrict, priceLimit, selectedActivityType, selectedCategory, sortMode, favoriteOnly, query], () => {
  visibleCount.value = 24
})
</script>

<template>
  <div class="page-shell">
    <header class="site-header">
      <a class="brand" href="#" aria-label="모두의 시즌마실 홈">
        <span class="brand-mark">모</span>
        <span>모두의 시즌마실</span>
      </a>
      <span class="beta">서울 · 경기 베타</span>
    </header>

    <main>
      <section class="hero">
        <p class="hero-kicker">MODU'S SEASON MASIL</p>
        <h1>
          <span class="hero-title-line">이번 계절,</span>
          <em>
            <span class="hero-title-line">우리 동네 공공</span>
            <span class="hero-title-line">즐길 거리</span>
          </em>
        </h1>
        <p class="hero-copy">흩어져 있던 공공 물놀이장, 축제, 생태체험, 스케이트장과 쉼터를 가격·기간과 함께 찾아보세요.</p>

        <label class="search-box">
          <span aria-hidden="true">⌕</span>
          <input v-model="query" type="search" placeholder="행사, 시설, 지역을 검색하세요" />
        </label>
      </section>

      <section class="filters" aria-label="검색 필터">
        <div class="season-tabs">
          <button
            v-for="season in seasons"
            :key="season"
            type="button"
            :class="{ active: selectedSeason === season }"
            @click="selectedSeason = season"
          >
            {{ season }}
          </button>
        </div>
        <div class="select-filters">
          <label>
            <span>지역</span>
            <select v-model="selectedRegion">
              <option>전체</option>
              <option>서울</option>
              <option>경기</option>
            </select>
          </label>
          <label>
            <span>시·군·구</span>
            <select v-model="selectedDistrict" :disabled="selectedRegion === '전체'">
              <option value="전체">{{ selectedRegion === '전체' ? '지역을 먼저 선택하세요' : '전체' }}</option>
              <option v-for="district in districts" :key="district">{{ district }}</option>
            </select>
          </label>
          <label>
            <span>가격</span>
            <select v-model="priceLimit">
              <option value="전체">전체</option>
              <option value="무료">무료</option>
              <option value="under5000">5천 원 미만</option>
              <option value="5000to10000">5천 원 이상 ~ 1만 원 미만</option>
              <option value="10000to20000">1만 원 이상 ~ 2만 원 미만</option>
              <option value="min20000">2만 원 이상</option>
            </select>
          </label>
          <label>
            <span>활동 유형</span>
            <select v-model="selectedActivityType">
              <option v-for="activityType in activityTypes" :key="activityType">{{ activityType }}</option>
            </select>
          </label>
          <label>
            <span>분류</span>
            <select v-model="selectedCategory">
              <option v-for="category in categories" :key="category">{{ category }}</option>
            </select>
          </label>
          <label>
            <span>정렬</span>
            <select v-model="sortMode">
              <option value="date">가까운 일정</option>
              <option value="region">지역순</option>
              <option value="name">이름순</option>
            </select>
          </label>
        </div>
      </section>

      <section id="results" class="results">
        <div class="section-heading">
          <div>
            <p class="eyebrow">CURATED FOR THE SEASON</p>
            <h2>지금 살펴볼 곳</h2>
          </div>
          <div class="result-actions">
            <button type="button" :class="{ active: favoriteOnly }" @click="favoriteOnly = !favoriteOnly">
              ♥ 저장 {{ favorites.size }}
            </button>
            <span>{{ loading ? '불러오는 중' : `${filteredEvents.length}개 결과` }}</span>
          </div>
        </div>

        <p v-if="loading" class="loading-state">서울·경기 공식 데이터를 불러오고 있습니다.</p>
        <div v-else-if="filteredEvents.length" class="event-grid">
          <EventCard
            v-for="event in displayedEvents"
            :key="event.id"
            :event="event"
            :favorite="favorites.has(event.id)"
            @toggle-favorite="toggleFavorite"
            @open-detail="openEventDetail"
          />
        </div>
        <p v-else class="empty-state">조건에 맞는 항목이 없습니다. 필터를 바꿔보세요.</p>
        <p v-if="usingSamples && !loading" class="data-notice">
          공식 데이터 연결에 실패해 예시 항목을 표시하고 있습니다.<span v-if="loadError"> ({{ loadError }})</span>
        </p>
        <p v-else-if="!loading" class="data-notice">
          TourAPI, 서울 열린데이터광장, 생활안전지도, 공유누리의 공식 정보를 표시합니다. 방문 전 제공기관 정보를 다시 확인하세요.
          <span v-if="loadError"> 일부 출처를 불러오지 못했습니다: {{ loadError }}</span>
        </p>
        <p v-if="!loading" class="data-notice">
          본 앱은 정부기관 또는 공공기관을 대표하지 않으며, 각 카드의 ‘공식 원문’ 링크에서 제공기관의 최신 정보를 확인할 수 있습니다.
        </p>
        <button
          v-if="!loading && displayedEvents.length < filteredEvents.length"
          class="load-more"
          type="button"
          @click="visibleCount += 24"
        >더 보기 ({{ filteredEvents.length - displayedEvents.length }}개 남음)</button>
      </section>
    </main>
    <footer class="site-footer">
      <span>모두의 시즌마실 · 공공데이터 기반 베타</span>
      <nav aria-label="서비스 안내">
        <a href="/data-sources.html">데이터 출처</a>
        <a href="/privacy.html">개인정보처리방침</a>
        <button v-if="adPrivacyOptionsRequired" type="button" @click="showAdPrivacyOptions">광고 개인정보 설정</button>
      </nav>
    </footer>
  </div>
</template>
