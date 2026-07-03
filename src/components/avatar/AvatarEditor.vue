<template>
  <div class="avatar-editor-clean">
    <div class="avatar-left">
      <AvatarPreview :avatar="draft" />

      <div class="avatar-info-box">
        <div class="field">
          <label>Name</label>
          <input :value="playerName" disabled>
        </div>

        <div class="field">
          <label>Titel</label>
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

        <div class="field">
          <label>Spezialattacke</label>
          <select v-model="draft.selected_special_attack_id">
            <option :value="null">Keine Spezialattacke</option>
            <option v-for="attack in attacks" :key="attack.id" :value="attack.id">
              {{ attack.name }}
            </option>
          </select>
        </div>

        <div class="level-box">
          <strong>Level {{ profileLevel }}</strong>
          <span>{{ Number(profile.xp_total || 0) }} XP</span>
        </div>
      </div>
    </div>

    <div class="avatar-right">
      <AvatarPickerRow
        title="Bodyfarbe"
        :label="label('bodyColor', draft.body_color)"
        :swatch="swatch('bodyColor', draft.body_color)"
        @previous="change('bodyColor', 'body_color', -1)"
        @next="change('bodyColor', 'body_color', 1)"
      />

      <AvatarPickerRow
        title="Kopfbedeckung"
        :label="label('headItem', draft.head_item)"
        @previous="change('headItem', 'head_item', -1)"
        @next="change('headItem', 'head_item', 1)"
      />

      <AvatarPickerRow
        title="Oberteil"
        :label="label('topItem', draft.top_item)"
        @previous="change('topItem', 'top_item', -1)"
        @next="change('topItem', 'top_item', 1)"
      />

      <AvatarPickerRow
        title="Unterteil"
        :label="label('bottomItem', draft.bottom_item)"
        @previous="change('bottomItem', 'bottom_item', -1)"
        @next="change('bottomItem', 'bottom_item', 1)"
      />

      <button
        v-if="isDirty"
        class="btn primary full avatar-save-button"
        @click="save"
        :disabled="saving"
      >
        {{ saving ? 'Speichern...' : 'Profil speichern' }}
      </button>

      <div class="stats-panel">
        <h3>Eigenschaften</h3>

        <div class="points-info">
          Frei verteilbar:
          <strong>{{ availableAfterDraft }}</strong>
        </div>

        <StatLine
          icon="❤️"
          label="Teamgeist"
          :value="Number(profile.stat_teamgeist || 0)"
          v-model="statDraft.teamgeist"
          :max-add="availableAfterDraft + statDraft.teamgeist"
        />

        <StatLine
          icon="⚡"
          label="Geschwindigkeit"
          :value="Number(profile.stat_geschwindigkeit || 0)"
          v-model="statDraft.geschwindigkeit"
          :max-add="availableAfterDraft + statDraft.geschwindigkeit"
        />

        <StatLine
          icon="💪"
          label="Kraft"
          :value="Number(profile.stat_kraft || 0)"
          v-model="statDraft.kraft"
          :max-add="availableAfterDraft + statDraft.kraft"
        />

        <StatLine
          icon="🎯"
          label="Technik"
          :value="Number(profile.stat_technik || 0)"
          v-model="statDraft.technik"
          :max-add="availableAfterDraft + statDraft.technik"
        />

        <StatLine
          icon="🔥"
          label="Ehrgeiz"
          :value="Number(profile.stat_ehrgeiz || 0)"
          v-model="statDraft.ehrgeiz"
          :max-add="availableAfterDraft + statDraft.ehrgeiz"
        />

        <button
          v-if="pointsToSpend > 0"
          class="btn primary full"
          type="button"
          @click="allocateStats"
          :disabled="saving || availableAfterDraft < 0"
        >
          Punkte verteilen
        </button>
      </div>

      <p v-if="message" class="avatar-message">{{ message }}</p>
      <p v-if="error" class="avatar-error">{{ error }}</p>
    </div>
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

const emit = defineEmits(['save', 'allocate-stats'])

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
const profileLevel = computed(() => Number(props.profile.level || 1))

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

const availableAfterDraft = computed(() =>
  statPointsAvailable.value - pointsToSpend.value
)

const isDirty = computed(() => Object.keys(draft).some(key => draft[key] !== initialSnapshot[key]))

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
  return {
    teamgeist: 0,
    geschwindigkeit: 0,
    kraft: 0,
    technik: 0,
    ehrgeiz: 0
  }
}

async function loadChoices() {
  try {
    const choices = await loadProfileChoices(props.profile)
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

function save() {
  emit('save', { ...draft })
}

function allocateStats() {
  emit('allocate-stats', { ...statDraft })
}

const StatLine = defineComponent({
  name: 'StatLine',
  props: {
    icon: String,
    label: String,
    value: Number,
    modelValue: Number,
    maxAdd: Number
  },
  emits: ['update:modelValue'],
  setup(rowProps, { emit: rowEmit }) {
    function setValue(value) {
      const next = Math.max(0, Math.min(Number(rowProps.maxAdd || 0), Number(value || 0)))
      rowEmit('update:modelValue', next)
    }

    return () => h('div', { class: 'stat-line' }, [
      h('div', { class: 'stat-label' }, `${rowProps.icon} ${rowProps.label}`),
      h('div', { class: 'stat-current' }, String(rowProps.value || 0)),
      h('input', {
        class: 'stat-add-input',
        type: 'number',
        min: 0,
        max: rowProps.maxAdd,
        value: rowProps.modelValue,
        onInput: event => setValue(event.target.value)
      })
    ])
  }
})
</script>

<style scoped>
.avatar-editor-clean{display:grid;grid-template-columns:280px 1fr;gap:14px;align-items:start}
.avatar-left,.avatar-right{min-width:0}
.avatar-info-box{margin-top:10px;border:3px solid #c5a66f;background:#fffdf6;padding:9px}
.level-box{margin-top:8px;display:flex;justify-content:space-between;border:3px solid #c5a66f;background:#fff4d2;padding:8px}
.avatar-save-button{margin-top:10px}
.stats-panel{margin-top:12px;border:3px solid #c5a66f;background:#fffdf6;padding:10px}
.stats-panel h3{margin:0 0 8px}
.points-info{margin-bottom:8px;color:#5f6f86}
.stat-line{display:grid;grid-template-columns:1fr 50px 72px;gap:8px;align-items:center;margin:6px 0}
.stat-label{font-weight:800}
.stat-current{font-weight:950;text-align:right}
.stat-add-input{width:72px;border:3px solid #b99b69;background:#fffdf6;padding:6px;font-weight:900;text-align:center}
.avatar-message{color:#1b7f24;font-weight:800}
.avatar-error{background:#fee2e2;color:#991b1b;border:3px solid #7f1d1d;padding:10px;font-weight:800}
@media(max-width:760px){.avatar-editor-clean{grid-template-columns:1fr}.stat-line{grid-template-columns:1fr 42px 68px}}
</style>
