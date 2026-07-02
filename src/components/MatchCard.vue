<template>
  <article class="match pixel-panel" :class="{ finished, dirty: hasUnsavedChanges }">
    <div class="match-head">
      <span class="pixel-badge match-badge">
        <img class="inline-pixel-icon" :src="versusIcon" alt="" />
        Spiel {{ number }} · {{ String(match.mode).replace('v', ' gegen ') }}
      </span>

      <div v-if="editable" class="match-actions">
        <button
          class="btn primary small-btn"
          :disabled="savingDisabled"
          @click="saveScore"
        >
          Speichern
        </button>

        <button class="btn danger small-btn" @click="$emit('delete', match.id)">
          Löschen
        </button>
      </div>
    </div>

    <div class="versus-layout">
      <div class="team team-a">
        <b>Team A</b>
        <div v-for="id in match.team_a" :key="id">{{ nameOf(id) }}</div>
      </div>

      <div class="versus-score">
        <template v-if="editable">
          <div class="score-editor-simple">
            <input
              v-model="draftA"
              class="score-input-simple"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="2"
              placeholder="A"
              @input="clean('a')"
              @click="$event.target.select()"
            >

            <span class="score-separator">:</span>

            <input
              v-model="draftB"
              class="score-input-simple"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="2"
              placeholder="B"
              @input="clean('b')"
              @click="$event.target.select()"
            >
          </div>

          <small v-if="hasUnsavedChanges" class="score-hint unsaved">
            noch nicht gespeichert
          </small>
          <small v-else class="score-hint">
            Ergebnis
          </small>
        </template>

        <template v-else>
          <strong>{{ match.score_a ?? '–' }}:{{ match.score_b ?? '–' }}</strong>
          <small>{{ finished ? 'Beendet' : 'Geplant' }}</small>
        </template>
      </div>

      <div class="team team-b">
        <b>Team B</b>
        <div v-for="id in match.team_b" :key="id">{{ nameOf(id) }}</div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  match: Object,
  number: Number,
  editable: Boolean,
  nameOf: Function
})

const emit = defineEmits(['delete', 'score'])

const base = import.meta.env.BASE_URL
const versusIcon = `${base}icons/versus.png`

const draftA = ref(toDraft(props.match.score_a))
const draftB = ref(toDraft(props.match.score_b))

watch(
  () => [props.match.score_a, props.match.score_b],
  ([scoreA, scoreB]) => {
    draftA.value = toDraft(scoreA)
    draftB.value = toDraft(scoreB)
  }
)

const finished = computed(() =>
  props.match.score_a !== null &&
  props.match.score_a !== '' &&
  props.match.score_b !== null &&
  props.match.score_b !== ''
)

const normalizedA = computed(() => normalizeScore(draftA.value))
const normalizedB = computed(() => normalizeScore(draftB.value))

const hasUnsavedChanges = computed(() =>
  normalizedA.value !== normalizeScore(props.match.score_a) ||
  normalizedB.value !== normalizeScore(props.match.score_b)
)

const savingDisabled = computed(() =>
  !hasUnsavedChanges.value ||
  !isValidScore(draftA.value) ||
  !isValidScore(draftB.value)
)

function toDraft(value) {
  return value === null || value === undefined || value === '' ? '' : String(value)
}

function normalizeScore(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function isValidScore(value) {
  if (value === '') return true
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 && number <= 99
}

function clean(side) {
  if (side === 'a') {
    draftA.value = String(draftA.value || '').replace(/\D/g, '').slice(0, 2)
  } else {
    draftB.value = String(draftB.value || '').replace(/\D/g, '').slice(0, 2)
  }
}

function saveScore() {
  if (savingDisabled.value) return

  emit('score', {
    id: props.match.id,
    score_a: normalizedA.value,
    score_b: normalizedB.value
  })
}
</script>

<style scoped>
.match.dirty{
  box-shadow:4px 4px 0 rgba(199, 128, 24, .25);
}

.match-actions{
  display:flex;
  gap:8px;
  align-items:center;
}

.score-editor-simple{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
}

.score-separator{
  font-weight:950;
  font-size:24px;
  line-height:1;
}

.score-input-simple{
  width:64px;
  height:48px;
  padding:0;
  text-align:center;
  font-weight:950;
  font-size:22px;
  border:3px solid #b99b69;
  background:#fffdf6;
  -moz-appearance:textfield;
}

.score-input-simple::-webkit-outer-spin-button,
.score-input-simple::-webkit-inner-spin-button{
  -webkit-appearance:none;
  margin:0;
}

.score-hint{
  margin-top:4px;
}

.score-hint.unsaved{
  color:#b45309;
}

@media(max-width:760px){
  .match-head{
    display:block;
  }

  .match-actions{
    display:grid;
    grid-template-columns:1fr 1fr;
    margin-top:8px;
  }

  .score-input-simple{
    width:68px;
    height:50px;
  }
}
</style>
