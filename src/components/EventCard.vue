<script setup>
defineProps({
  event: { type: Object, required: true },
  favorite: { type: Boolean, default: false },
})

defineEmits(['toggle-favorite', 'open-detail'])
</script>

<template>
  <article class="event-card">
    <div v-if="event.image" class="card-image" :style="{ backgroundImage: `url(${event.image})` }" role="img" :aria-label="`${event.title} 이미지`"></div>
    <div class="card-topline">
      <span class="season-badge">{{ event.season }}</span>
      <div class="card-actions">
        <span class="status">{{ event.status }}</span>
        <button class="favorite-button" type="button" :aria-label="favorite ? '저장 해제' : '저장'" @click="$emit('toggle-favorite', event.id)">
          {{ favorite ? '♥' : '♡' }}
        </button>
      </div>
    </div>
    <p class="eyebrow">{{ event.region }} · {{ event.district }} · {{ event.category }}</p>
    <h3>{{ event.title }}</h3>
    <p class="period">{{ event.period }}</p>
    <div class="price-row">
      <strong>{{ event.priceLabel }}</strong>
      <a
        v-if="event.detailUrl"
        :href="event.detailUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="상세 정보 보기"
        @click.prevent="$emit('open-detail', event.detailUrl)"
      >자세히</a>
      <span v-else class="detail-unavailable">상세 준비 중</span>
    </div>
    <ul class="tags" aria-label="특징">
      <li v-for="tag in event.tags" :key="tag">{{ tag }}</li>
    </ul>
    <p v-if="event.address" class="address">{{ event.address }}</p>
    <p class="source">
      <span>정부·공공정보 출처 · </span>
      <a
        v-if="event.sourceUrl"
        :href="event.sourceUrl"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`${event.source} 공식 원문 출처 열기`"
        @click.prevent="$emit('open-detail', event.sourceUrl)"
      >{{ event.source }} 공식 원문 ↗</a>
      <span v-else>{{ event.source }}</span>
    </p>
  </article>
</template>
