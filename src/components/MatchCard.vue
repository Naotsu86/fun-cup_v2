<template>
  <article
    class="match pixel-panel"
    :class="{ finished, dirty: hasUnsavedChanges }"
  >
    <div class="match-head">
      <span class="pixel-badge match-badge">
        <img class="inline-pixel-icon" :src="versusIcon" alt="" />
        Spiel {{ number }} · {{ String(match.mode).replace('v', ' gegen ') }}
      </span>

      <div v-if="editable" class="match-actions">
        <template v-if="finished && !editing">
          <button
            class="btn primary small-btn"
            @click="startEditing"
          >
            Bearbeiten
          </button>
        </template>

        <template v-else>
          <button
            class="btn primary small-btn"
            :disabled="savingDisabled"
            @click="saveScore"
          >
            {{ finished ? 'Änderung speichern' : 'Speichern' }}
          </button>

          <button
            v-if="finished"
            class="btn small-btn"
            @click="cancelEditing"
          >
            Abbrechen
          </button>
        </template>

        <button
          class="btn danger small-btn"
          :disabled="deleting"
          @click="requestDelete"
        >
          {{ deleting ? 'Wird gelöscht...' : 'Löschen' }}
        </button>
      </div>
    </div>

    <div class="versus-layout">
      <div class="team team-a">
        <b>Team A</b>
        <div v-for="id in match.team_a" :key="id">
          {{ nameOf(id) }}
        </div>
      </div>

      <div class="versus-score">
        <template v-if="editable && (!finished || editing)">
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

          <small
            v-if="hasUnsavedChanges"
            class="score-hint unsaved"
          >
            noch nicht gespeichert
          </small>
        </template>

        <template v-else>
          <strong class="score-display">
            {{ displayScore(match.score_a) }}
            :
            {{ displayScore(match.score_b) }}
          </strong>

          <small
            v-if="finished"
            class="score-hint saved"
          >
            Ergebnis gespeichert
          </small>
        </template>
      </div>

      <div class="team team-b">
        <b>Team B</b>
        <div v-for="id in match.team_b" :key="id">
          {{ nameOf(id) }}
        </div>
      </div>
    </div>

    <div
      v-if="benchPlayers.length && !isTiebreak"
      class="bench-box"
    >
      <strong>PAUSE / FANBLOCK</strong>

      <span
        v-for="id in benchPlayers"
        :key="id"
      >
        {{ nameOf(id) }}
      </span>

      <small>
        Erhält nach Spielende die Punktzahl des Verliererteams
        und wird im nächsten Spiel bevorzugt aufgestellt.
      </small>
    </div>

    <div
      v-if="absentPlayers.length"
      class="absent-box"
    >
      <strong>NICHT AKTIV / ABWESEND</strong>

      <span
        v-for="id in absentPlayers"
        :key="id"
      >
        {{ nameOf(id) }}
      </span>

      <small>
        Erhält für dieses Spiel ebenfalls die Punktzahl
        des Verliererteams.
      </small>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  match: { type: Object, required: true },
  number: { type: Number, required: true },
  editable: { type: Boolean, default: false },
  nameOf: { type: Function, required: true }
})

const emit = defineEmits(['delete', 'score'])

const base = import.meta.env.BASE_URL
const versusIcon = `${base}icons/versus.png`

const deleting = ref(false)
const editing = ref(false)

const draftA = ref(toDraft(props.match.score_a))
const draftB = ref(toDraft(props.match.score_b))

const isTiebreak = computed(
  () => props.match?.mode === 'tiebreak-2v2'
)

const benchPlayers = computed(
  () => props.match.bench_players || []
)

const absentPlayers = computed(
  () => props.match.absent_players || []
)

const finished = computed(() =>
  props.match.score_a !== null &&
  props.match.score_b !== null &&
  props.match.score_a !== '' &&
  props.match.score_b !== ''
)

const hasUnsavedChanges = computed(() =>
  draftA.value !== toDraft(props.match.score_a) ||
  draftB.value !== toDraft(props.match.score_b)
)

const savingDisabled = computed(() =>
  !hasUnsavedChanges.value ||
  draftA.value === '' ||
  draftB.value === ''
)

watch(
  () => props.match.id,
  () => {
    deleting.value = false
    editing.value = false
    syncFromMatch()
  }
)

watch(
  () => [props.match.score_a, props.match.score_b],
  ([scoreA, scoreB]) => {
    const incomingA = toDraft(scoreA)
    const incomingB = toDraft(scoreB)

    if (
      !editing.value ||
      !hasUnsavedChanges.value ||
      (
        draftA.value === incomingA &&
        draftB.value === incomingB
      )
    ) {
      draftA.value = incomingA
      draftB.value = incomingB
    }
  }
)

function syncFromMatch() {
  draftA.value = toDraft(props.match.score_a)
  draftB.value = toDraft(props.match.score_b)
}

function toDraft(value) {
  return value === null || value === undefined
    ? ''
    : String(value)
}

function displayScore(value) {
  return value === null ||
    value === undefined ||
    value === ''
    ? '–'
    : value
}

function clean(side) {
  const target = side === 'a' ? draftA : draftB

  target.value = String(target.value || '')
    .replace(/\D/g, '')
    .slice(0, 2)
}

function startEditing() {
  syncFromMatch()
  editing.value = true
}

function cancelEditing() {
  syncFromMatch()
  editing.value = false
}

function saveScore() {
  if (savingDisabled.value) return

  emit('score', {
    id: props.match.id,
    score_a: Number(draftA.value),
    score_b: Number(draftB.value)
  })

  editing.value = false
}

function requestDelete() {
  if (deleting.value) return

  if (finished.value) {
    const confirmed = window.confirm(
      `ACHTUNG!\n\n` +
      `Spiel ${props.number} hat bereits ein gespeichertes Ergebnis ` +
      `(${props.match.score_a}:${props.match.score_b}).\n\n` +
      `Beim Löschen wird auch die bereits erfolgte Punktevergabe ` +
      `zurückgenommen.\n\n` +
      `Spiel wirklich löschen?`
    )

    if (!confirmed) {
      return
    }
  }

  deleting.value = true
  emit('delete', props.match.id)
}
</script>

<style scoped>
.bench-box,
.absent-box {
  margin-top: 10px;
  border: 3px solid #b89354;
  background: #fff4d2;
  padding: 9px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.bench-box strong,
.absent-box strong {
  font-family: var(--font-pixel, 'Silkscreen', monospace);
  letter-spacing: 1px;
  color: #7c2d12;
}

.bench-box span,
.absent-box span {
  border: 2px solid #b89354;
  background: #fffdf6;
  padding: 3px 7px;
  font-weight: 900;
}

.bench-box small,
.absent-box small {
  width: 100%;
  color: #5f6f86;
}
</style>