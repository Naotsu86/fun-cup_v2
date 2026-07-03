<template>
  <div class="rpg-profile-screen">
    <aside class="rpg-left pixel-panel">
      <div class="rpg-avatar-frame">
        <AvatarPreview :avatar="draft" />
      </div>

      <div class="rpg-field">
        <label>NAME</label>
        <input :value="playerName" disabled>
      </div>

      <div class="rpg-field">
        <label>TITLE</label>
        <select v-model="draft.selected_title_id">
          <option :value="null">Kein Titel</option>
          <option
            v-for="title in titles"
            :key="title.id"
            :value="title.id"
            :disabled="!title.unlocked"
          >
            {{ title.name }}{{ title.unlocked ? '' : ' 🔒' }}
          </option>
        </select>
      </div>

      <div class="rpg-field">
        <label>SPECIAL</label>
        <select v-model="draft.selected_special_attack_id">
          <option :value="null">Keine Spezialattacke</option>
          <option v-for="attack in attacks" :key="attack.id" :value="attack.id">
            {{ attack.name }}
          </option>
        </select>
      </div>

      <div class="rpg-level-box">
        <div class="level-head">
          <span>LEVEL {{ profileLevel }}</span>
          <strong>{{ xpTotal }} XP</strong>
        </div>

        <div class="xp-bar">
          <div class="xp-fill" :style="{ width: xpPercent + '%' }"></div>
        </div>

        <div class="xp-text">{{ xpTotal }} / {{ nextLevelXp }} XP</div>
        <div class="xp-next">Noch {{ xpMissing }} XP bis Level {{ profileLevel + 1 }}</div>
      </div>
    </aside>

    <section class="rpg-right">
      <div class="rpg-picker-panel pixel-panel">
        <AvatarPickerRow
          title="BODY"
          :label="label('bodyColor', draft.body_color)"
          :swatch="swatch('bodyColor', draft.body_color)"
          @previous="change('bodyColor', 'body_color', -1)"
          @next="change('bodyColor', 'body_color', 1)"
        />

        <AvatarPickerRow
          title="HEAD"
          :label="label('headItem', draft.head_item)"
          @previous="change('headItem', 'head_item', -1)"
          @next="change('headItem', 'head_item', 1)"
        />

        <AvatarPickerRow
          title="TOP"
          :label="label('topItem', draft.top_item)"
          @previous="change('topItem', 'top_item', -1)"
          @next="change('topItem', 'top_item', 1)"
        />

        <AvatarPickerRow
          title="BOTTOM"
          :label="label('bottomItem', draft.bottom_item)"
          @previous="change('bottomItem', 'bottom_item', -1)"
          @next="change('bottomItem', 'bottom_item', 1)"
        />
      </div>

      <div class="rpg-stats-panel pixel-panel">
        <div class="stats-header">
          <h3>STATS</h3>
          <div class="free-points">
            <span>FREE POINTS</span>
            <strong>{{ availableAfterDraft }}</strong>
          </div>
        </div>

        <StatRow icon="❤️" label="TEAMGEIST" :value="statValue('teamgeist')" :pending="statDraft.teamgeist" :can-add="availableAfterDraft > 0" @add="addPoint('teamgeist')" />
        <StatRow icon="⚡" label="SPEED" :value="statValue('geschwindigkeit')" :pending="statDraft.geschwindigkeit" :can-add="availableAfterDraft > 0" @add="addPoint('geschwindigkeit')" />
        <StatRow icon="💪" label="KRAFT" :value="statValue('kraft')" :pending="statDraft.kraft" :can-add="availableAfterDraft > 0" @add="addPoint('kraft')" />
        <StatRow icon="🎯" label="TECHNIK" :value="statValue('technik')" :pending="statDraft.technik" :can-add="availableAfterDraft > 0" @add="addPoint('technik')" />
        <StatRow icon="🔥" label="EHRGEIZ" :value="statValue('ehrgeiz')" :pending="statDraft.ehrgeiz" :can-add="availableAfterDraft > 0" @add="addPoint('ehrgeiz')" />
      </div>

      <button v-if="hasChanges" class="btn primary full rpg-save-button" @click="save" :disabled="saving || availableAfterDraft < 0">
        {{ saving ? 'SPEICHERN...' : 'PROFIL SPEICHERN' }}
      </button>

      <p v-if="message" class="avatar-message">{{ message }}</p>
      <p v-if="error" class="avatar-error">{{ error }}</p>
    </section>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref, watch } from 'vue'
import AvatarPreview from './AvatarPreview.vue'
import AvatarPickerRow from './AvatarPickerRow.vue'
import { avatarOptions, getNextOption, getOptionLabel } from '../../services/avatarOptions'
import { loadProfileChoices } from '../../services/playerProfileService'

const props = defineProps({
  profile: { type: Object, required: true },
  saving: { type: Boolean, default: false },
  message: { type: String, default: '' },
  error: { type: String, default: '' }
})

const emit = defineEmits(['save'])

const draft = reactive(makeDraft(props.profile))
const initialSnapshot = reactive(makeDraft(props.profile))
const statDraft = reactive(resetStatsDraft())
const titles = ref([])
const attacks = ref([])

watch(() => props.profile, async profile => {
  const fresh = makeDraft(profile)
  Object.assign(draft, fresh)
  Object.assign(initialSnapshot, fresh)
  Object.assign(statDraft, resetStatsDraft())
  await loadChoices()
})

onMounted(loadChoices)

const playerName = computed(() => props.profile.players?.name || props.profile.display_name || '')
const unlockedItems = computed(() => props.profile.unlocked_items || [])
const xpTotal = computed(() => Number(props.profile.xp_total || 0))
const profileLevel = computed(() => Number(props.profile.level || levelFromXp(xpTotal.value)))
const currentLevelXp = computed(() => xpForLevel(profileLevel.value))
const nextLevelXp = computed(() => xpForLevel(profileLevel.value + 1))
const xpMissing = computed(() => Math.max(nextLevelXp.value - xpTotal.value, 0))

const xpPercent = computed(() => {
  const range = Math.max(nextLevelXp.value - currentLevelXp.value, 1)
  return Math.max(0, Math.min(100, Math.round(((xpTotal.value - currentLevelXp.value) / range) * 100)))
})

const statPointsAvailable = computed(() =>
  Math.max(0, Number(props.profile.stat_points_total || 0) - Number(props.profile.stat_points_spent || 0))
)

const pointsToSpend = computed(() =>
  Number(statDraft.teamgeist || 0) +
  Number(statDraft.geschwindigkeit || 0) +
  Number(statDraft.kraft || 0) +
  Number(statDraft.technik || 0) +
  Number(statDraft.ehrgeiz || 0)
)

const availableAfterDraft = computed(() => statPointsAvailable.value - pointsToSpend.value)
const isProfileDirty = computed(() => Object.keys(initialSnapshot).some(key => draft[key] !== initialSnapshot[key]))
const hasChanges = computed(() => isProfileDirty.value || pointsToSpend.value > 0)

function firstId(group, fallback) {
  return avatarOptions[group]?.[0]?.id || fallback
}

function makeDraft(profile) {
  return {
    selected_title_id: profile.selected_title_id || null,
    selected_special_attack_id: profile.selected_special_attack_id || null,
    body_color: profile.body_color || profile.avatar_body || firstId('bodyColor', 'black'),
    head_item: profile.head_item || 'none',
    top_item: profile.top_item || 'none',
    bottom_item: profile.bottom_item || profile.shorts_item || 'none',
    shorts_item: profile.bottom_item || profile.shorts_item || 'none'
  }
}

function resetStatsDraft() {
  return { teamgeist: 0, geschwindigkeit: 0, kraft: 0, technik: 0, ehrgeiz: 0 }
}

function xpForLevel(targetLevel) {
  let needed = 0
  for (let current = 1; current < targetLevel; current += 1) needed += current * 15 + 10
  return needed
}

function levelFromXp(totalXp) {
  let lvl = 1
  while (totalXp >= xpForLevel(lvl + 1) && lvl < 99) lvl += 1
  return lvl
}

async function loadChoices() {
  try {
    const choices = await loadProfileChoices({ ...props.profile, level: profileLevel.value })
    titles.value = choices.titles
    attacks.value = choices.attacks
  } catch (error) {
    console.warn('Titel/Spezialattacken konnten nicht geladen werden.', error)
  }
}

function label(group, id) {
  return getOptionLabel(group, id)
}

function swatch(group, id) {
  return avatarOptions[group]?.find(option => option.id === id)?.swatch || ''
}

function change(group, field, direction) {
  draft[field] = getNextOption(group, draft[field], direction, unlockedItems.value)
}

function statValue(key) {
  const map = {
    teamgeist: 'stat_teamgeist',
    geschwindigkeit: 'stat_geschwindigkeit',
    kraft: 'stat_kraft',
    technik: 'stat_technik',
    ehrgeiz: 'stat_ehrgeiz'
  }
  return Number(props.profile[map[key]] || 0)
}

function addPoint(key) {
  if (availableAfterDraft.value <= 0) return
  statDraft[key] += 1
}

function save() {
  emit('save', { profileChoices: { ...draft }, statPoints: { ...statDraft } })
}

const StatRow = defineComponent({
  name: 'StatRow',
  props: {
    icon: String,
    label: String,
    value: Number,
    pending: Number,
    canAdd: Boolean
  },
  emits: ['add'],
  setup(rowProps, { emit: rowEmit }) {
    const total = computed(() => Number(rowProps.value || 0) + Number(rowProps.pending || 0))
    const width = computed(() => Math.max(0, Math.min(100, total.value)))

    return () => h('div', { class: 'rpg-stat-row' }, [
      h('div', { class: 'rpg-stat-head' }, [
        h('span', `${rowProps.icon} ${rowProps.label}`),
        h('strong', String(total.value))
      ]),
      h('div', { class: 'rpg-stat-bar' }, [
        h('div', { class: 'rpg-stat-fill', style: { width: `${width.value}%` } })
      ]),
      h('div', { class: 'rpg-stat-footer' }, [
        rowProps.pending ? h('span', { class: 'pending-points' }, `+${rowProps.pending}`) : h('span'),
        h('button', { class: 'stat-plus-btn', type: 'button', disabled: !rowProps.canAdd, onClick: () => rowEmit('add') }, '+')
      ])
    ])
  }
})
</script>

<style scoped>
.rpg-profile-screen{display:grid;grid-template-columns:280px 1fr;gap:14px;align-items:start}
.rpg-left,.rpg-picker-panel,.rpg-stats-panel{border:3px solid #c5a66f;background:#fffdf6;padding:10px}
.rpg-avatar-frame{display:grid;place-items:center;margin-bottom:10px}
.rpg-field{margin-top:8px}
.rpg-field label,.stats-header h3,.free-points span,.rpg-stat-head,.level-head span,.rpg-picker-panel :deep(.picker-title){
  font-family:var(--font-pixel, 'Silkscreen', monospace);letter-spacing:2px;text-transform:uppercase
}
.rpg-field label{display:block;color:#5f6f86;font-size:11px;margin-bottom:3px}
.rpg-field input,.rpg-field select{width:100%;border:3px solid #b99b69;background:#fffdf6;padding:9px;font-weight:800}
.rpg-level-box{margin-top:10px;border:3px solid #2b2115;background:#fff4d2;padding:9px}
.level-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px}
.xp-bar,.rpg-stat-bar{height:18px;border:3px solid #2b2115;background:#fffdf6;overflow:hidden}
.xp-fill{height:100%;background:linear-gradient(90deg,#84cc16,#22c55e)}
.xp-text{margin-top:5px;font-weight:900}
.xp-next{color:#5f6f86;font-size:12px}
.rpg-right{min-width:0}
.rpg-stats-panel{margin-top:12px}
.stats-header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}
.stats-header h3{margin:0}
.free-points{text-align:right;border:3px solid #2b2115;background:#fff4d2;padding:6px 10px}
.free-points span{display:block;font-size:10px;color:#5f6f86}
.free-points strong{font-size:22px}
.rpg-stat-row{border:3px solid #d2b887;background:#fffaf0;padding:8px;margin-top:8px}
.rpg-stat-head{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:12px;margin-bottom:6px}
.rpg-stat-fill{height:100%;background:linear-gradient(90deg,#fbbf24,#22c55e)}
.rpg-stat-footer{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-top:6px}
.pending-points{color:#15803d;font-weight:950}
.stat-plus-btn{width:46px;height:38px;border:3px solid #2b2115;background:#d9f99d;font-weight:950;font-size:22px;cursor:pointer;box-shadow:3px 3px 0 rgba(0,0,0,.2)}
.stat-plus-btn:disabled{opacity:.35;cursor:not-allowed;box-shadow:none}
.rpg-save-button{margin-top:12px}
.avatar-message{color:#1b7f24;font-weight:800}
.avatar-error{background:#fee2e2;color:#991b1b;border:3px solid #7f1d1d;padding:10px;font-weight:800}
@media(max-width:760px){.rpg-profile-screen{grid-template-columns:1fr}.stats-header{align-items:stretch;flex-direction:column}.free-points{text-align:left}}
</style>
