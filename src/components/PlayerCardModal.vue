<template>
  <div class="player-card-backdrop" @click.self="$emit('close')">
    <article class="player-card-modal pixel-card">
      <button class="player-card-close" type="button" @click="$emit('close')">×</button>

      <h2><span class="headline-icon">🐧</span> Spielerkarte</h2>

      <div class="player-card-main">
        <div class="player-card-avatar-box">
          <AvatarPreview :avatar="player" />
        </div>

        <div class="player-card-info">
          <div class="title-label">Titel</div>
          <div class="player-card-title">{{ player.selected_title_name || 'Kein Titel' }}</div>

          <div class="title-label">Name</div>
          <div class="player-card-name">{{ player.name || player.real_name || '-' }}</div>

          <div class="special-box">
            <div class="title-label">Spezialattacke</div>
            <strong>{{ player.selected_special_attack_name || 'Keine' }}</strong>
            <small v-if="player.selected_special_attack_description">
              {{ player.selected_special_attack_description }}
            </small>
          </div>

          <div class="level-box">
            <div class="level-head">
              <strong>Level {{ player.calculated_level || 1 }}</strong>
              <span>{{ player.xp_total || 0 }} XP</span>
            </div>
            <div class="xp-bar">
              <div class="xp-fill" :style="{ width: xpPercent + '%' }"></div>
            </div>
            <small>{{ xpText }}</small>
          </div>
        </div>
      </div>

      <div class="stat-list">
        <StatRow icon="❤️" label="Teamgeist" :value="player.stat_teamgeist || 0" />
        <StatRow icon="⚡" label="Geschwindigkeit" :value="player.stat_geschwindigkeit || 0" />
        <StatRow icon="💪" label="Kraft" :value="player.stat_kraft || 0" />
        <StatRow icon="🎯" label="Technik" :value="player.stat_technik || 0" />
        <StatRow icon="🔥" label="Ehrgeiz" :value="player.stat_ehrgeiz || 0" />
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'
import AvatarPreview from './avatar/AvatarPreview.vue'

const props = defineProps({
  player: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const currentLevelXp = computed(() => Number(props.player.current_level_xp || 0))
const nextLevelXp = computed(() => Number(props.player.next_level_xp || currentLevelXp.value + 1))
const xpTotal = computed(() => Number(props.player.xp_total || 0))

const xpPercent = computed(() => {
  const range = Math.max(nextLevelXp.value - currentLevelXp.value, 1)
  return Math.max(0, Math.min(100, Math.round(((xpTotal.value - currentLevelXp.value) / range) * 100)))
})

const xpText = computed(() => {
  if (!props.player.next_level_xp) return `${xpTotal.value} XP`
  return `${xpTotal.value} / ${nextLevelXp.value} XP`
})

const StatRow = defineComponent({
  name: 'StatRow',
  props: {
    icon: String,
    label: String,
    value: Number
  },
  setup(rowProps) {
    const width = computed(() => Math.max(0, Math.min(100, Number(rowProps.value || 0))))

    return () => h('div', { class: 'stat-row' }, [
      h('div', { class: 'stat-name' }, `${rowProps.icon} ${rowProps.label}`),
      h('div', { class: 'stat-bar' }, [
        h('div', {
          class: 'stat-fill',
          style: { width: `${width.value}%` }
        })
      ]),
      h('div', { class: 'stat-value' }, String(rowProps.value || 0))
    ])
  }
})
</script>

<style scoped>
.player-card-backdrop{
  position:fixed;
  inset:0;
  z-index:1000;
  display:grid;
  place-items:center;
  padding:16px;
  background:rgba(15,23,42,.58);
}

.player-card-modal{
  position:relative;
  width:min(720px, 96vw);
  max-height:92vh;
  overflow:auto;
  border:5px solid #2b2115;
  background:#fff4d2;
  padding:16px;
  box-shadow:8px 8px 0 rgba(0,0,0,.28);
}

.player-card-close{
  position:absolute;
  top:8px;
  right:10px;
  width:36px;
  height:36px;
  border:3px solid #2b2115;
  background:#fee2e2;
  font-size:24px;
  font-weight:950;
  cursor:pointer;
}

.player-card-main{
  display:grid;
  grid-template-columns:260px 1fr;
  gap:16px;
  align-items:start;
}

.player-card-avatar-box{
  border:4px solid #2b2115;
  background:#fffdf6;
  padding:8px;
}

.title-label{
  font-size:12px;
  color:#5f6f86;
  font-weight:800;
  margin-top:8px;
}

.player-card-title{
  font-family:var(--font-pixel, 'Silkscreen', monospace);
  font-size:20px;
  color:#7c2d12;
  font-weight:900;
  margin-bottom:8px;
}

.player-card-name{
  font-size:28px;
  font-weight:950;
  margin-bottom:14px;
}

.special-box,
.level-box{
  border:3px solid #b89354;
  background:#fffdf6;
  padding:10px;
  margin-top:10px;
}

.special-box small{
  display:block;
  margin-top:5px;
  color:#5f6f86;
}

.level-head{
  display:flex;
  justify-content:space-between;
  gap:8px;
  align-items:center;
  margin-bottom:6px;
}

.xp-bar,
.stat-bar{
  height:18px;
  border:3px solid #2b2115;
  background:#fffdf6;
  overflow:hidden;
}

.xp-fill,
.stat-fill{
  height:100%;
  background:linear-gradient(90deg, #84cc16, #22c55e);
}

.stat-list{
  margin-top:16px;
  display:grid;
  gap:8px;
}

.stat-row{
  display:grid;
  grid-template-columns:170px 1fr 42px;
  gap:8px;
  align-items:center;
}

.stat-name{
  font-weight:900;
}

.stat-value{
  text-align:right;
  font-weight:950;
}

@media(max-width:760px){
  .player-card-main{
    grid-template-columns:1fr;
  }

  .player-card-avatar-box{
    max-width:260px;
    margin:auto;
  }

  .stat-row{
    grid-template-columns:1fr;
    gap:4px;
  }

  .stat-value{
    text-align:left;
  }
}
</style>
