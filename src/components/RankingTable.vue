<template>
  <div class="ranking-list">
    <article v-for="(r, i) in rows" :key="r.id" class="ranking-row ranking-row-compact ranking-row-with-avatar">
      <AvatarPreview :avatar="r" compact class="ranking-avatar" />

      <div class="ranking-content">
        <div class="ranking-name-main">{{ r.name }}</div>
        <div class="ranking-points-main">{{ r.points }} Punkte</div>
        <div class="ranking-meta">{{ r.games }} Spiele · {{ r.wins }} Siege · Ø {{ r.avg }}</div>
      </div>

      <div class="dynamic-rank-badge" :aria-label="`${startAt + i}. Platz`">
        <img :src="rankBadgeIcon" alt="" />
        <span>{{ startAt + i }}</span>
      </div>
    </article>
  </div>
</template>

<script setup>
import AvatarPreview from './avatar/AvatarPreview.vue'

defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  startAt: {
    type: Number,
    default: 1
  }
})

const rankBadgeIcon = `${import.meta.env.BASE_URL}icons/rank-badge-empty.svg`
</script>

<style scoped>
.ranking-row-with-avatar{
  grid-template-columns: 56px 1fr auto;
}
.ranking-avatar{
  width: 56px;
  height: 56px;
}
</style>
