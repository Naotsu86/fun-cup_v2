<template>
  <div class="card pixel-card menu-window admin-rpg-catalog">
    <h2>🏷️ Titel & Spezialattacken</h2>

    <div class="menu-body">
      <div class="catalog-tabs">
        <button class="btn" :class="{ primary: tab === 'titles' }" @click="tab = 'titles'">
          Titel
        </button>
        <button class="btn" :class="{ primary: tab === 'specials' }" @click="tab = 'specials'">
          Spezialattacken
        </button>
        <button class="btn" @click="load" :disabled="loading">
          Aktualisieren
        </button>
      </div>

      <p v-if="message" class="hint">{{ message }}</p>
      <p v-if="error" class="error-small">{{ error }}</p>

      <template v-if="tab === 'titles'">
        <button class="btn primary full" @click="addTitle">
          Neuen Titel anlegen
        </button>

        <div class="catalog-list">
          <div v-for="row in titles" :key="row.id" class="catalog-row">
            <div class="catalog-grid title-grid">
              <div class="field">
                <label>ID</label>
                <input v-model="row.id" :disabled="row._saved">
              </div>

              <div class="field">
                <label>Name</label>
                <input v-model="row.name">
              </div>

              <div class="field wide">
                <label>Beschreibung</label>
                <input v-model="row.description">
              </div>

              <div class="field">
                <label>Level</label>
                <input type="number" min="1" v-model.number="row.min_level">
              </div>

              <div class="field">
                <label>Teamgeist</label>
                <input type="number" min="0" v-model.number="row.req_teamgeist">
              </div>

              <div class="field">
                <label>Speed</label>
                <input type="number" min="0" v-model.number="row.req_geschwindigkeit">
              </div>

              <div class="field">
                <label>Kraft</label>
                <input type="number" min="0" v-model.number="row.req_kraft">
              </div>

              <div class="field">
                <label>Technik</label>
                <input type="number" min="0" v-model.number="row.req_technik">
              </div>

              <div class="field">
                <label>Ehrgeiz</label>
                <input type="number" min="0" v-model.number="row.req_ehrgeiz">
              </div>

              <div class="field">
                <label>Sortierung</label>
                <input type="number" v-model.number="row.sort_order">
              </div>

              <label class="check-field">
                <input type="checkbox" v-model="row.active">
                Aktiv
              </label>
            </div>

            <div class="catalog-actions">
              <button class="btn primary" @click="saveTitleRow(row)">Speichern</button>
              <button class="btn danger" @click="deleteTitleRow(row)" :disabled="row.id === 'none'">Löschen</button>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <button class="btn primary full" @click="addSpecial">
          Neue Spezialattacke anlegen
        </button>

        <div class="catalog-list">
          <div v-for="row in specials" :key="row.id" class="catalog-row">
            <div class="catalog-grid special-grid">
              <div class="field">
                <label>ID</label>
                <input v-model="row.id" :disabled="row._saved">
              </div>

              <div class="field">
                <label>Name</label>
                <input v-model="row.name">
              </div>

              <div class="field wide">
                <label>Beschreibung</label>
                <input v-model="row.description">
              </div>

              <div class="field">
                <label>Level</label>
                <input type="number" min="1" v-model.number="row.min_level">
              </div>

              <div class="field">
                <label>Sortierung</label>
                <input type="number" v-model.number="row.sort_order">
              </div>

              <label class="check-field">
                <input type="checkbox" v-model="row.active">
                Aktiv
              </label>
            </div>

            <div class="catalog-actions">
              <button class="btn primary" @click="saveSpecialRow(row)">Speichern</button>
              <button class="btn danger" @click="deleteSpecialRow(row)" :disabled="row.id === 'none'">Löschen</button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  deleteSpecial,
  deleteTitle,
  loadRpgCatalogs,
  saveSpecial,
  saveTitle
} from '../../services/rpgCatalogService'

const tab = ref('titles')
const titles = ref([])
const specials = ref([])
const loading = ref(false)
const message = ref('')
const error = ref('')

onMounted(load)

async function load() {
  loading.value = true
  message.value = ''
  error.value = ''

  try {
    const data = await loadRpgCatalogs()
    titles.value = data.titles.map(row => ({ ...row, _saved: true }))
    specials.value = data.specials.map(row => ({ ...row, _saved: true }))
  } catch (e) {
    error.value = e.message || 'Daten konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

function addTitle() {
  titles.value.unshift({
    id: '',
    name: '',
    description: '',
    min_level: 1,
    req_teamgeist: 0,
    req_geschwindigkeit: 0,
    req_kraft: 0,
    req_technik: 0,
    req_ehrgeiz: 0,
    sort_order: 100,
    active: true,
    _saved: false
  })
}

function addSpecial() {
  specials.value.unshift({
    id: '',
    name: '',
    description: '',
    min_level: 1,
    sort_order: 100,
    active: true,
    _saved: false
  })
}

async function saveTitleRow(row) {
  message.value = ''
  error.value = ''

  try {
    normalizeId(row)
    await saveTitle(row)
    message.value = `Titel "${row.name}" gespeichert.`
    await load()
  } catch (e) {
    error.value = e.message || 'Titel konnte nicht gespeichert werden.'
  }
}

async function deleteTitleRow(row) {
  if (!confirm(`Titel "${row.name}" wirklich löschen?`)) return

  message.value = ''
  error.value = ''

  try {
    await deleteTitle(row.id)
    message.value = `Titel "${row.name}" gelöscht.`
    await load()
  } catch (e) {
    error.value = e.message || 'Titel konnte nicht gelöscht werden.'
  }
}

async function saveSpecialRow(row) {
  message.value = ''
  error.value = ''

  try {
    normalizeId(row)
    await saveSpecial(row)
    message.value = `Spezialattacke "${row.name}" gespeichert.`
    await load()
  } catch (e) {
    error.value = e.message || 'Spezialattacke konnte nicht gespeichert werden.'
  }
}

async function deleteSpecialRow(row) {
  if (!confirm(`Spezialattacke "${row.name}" wirklich löschen?`)) return

  message.value = ''
  error.value = ''

  try {
    await deleteSpecial(row.id)
    message.value = `Spezialattacke "${row.name}" gelöscht.`
    await load()
  } catch (e) {
    error.value = e.message || 'Spezialattacke konnte nicht gelöscht werden.'
  }
}

function normalizeId(row) {
  if (row.id) {
    row.id = slug(row.id)
    return
  }

  row.id = slug(row.name)
}

function slug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
</script>

<style scoped>
.catalog-tabs{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  margin-bottom:12px;
}

.catalog-list{
  display:grid;
  gap:12px;
  margin-top:12px;
}

.catalog-row{
  border:3px solid #c5a66f;
  background:#fffdf6;
  padding:10px;
}

.catalog-grid{
  display:grid;
  gap:8px;
  align-items:end;
}

.title-grid{
  grid-template-columns:1.1fr 1.4fr 2fr repeat(7, .75fr) .65fr;
}

.special-grid{
  grid-template-columns:1.1fr 1.4fr 2fr .75fr .75fr .65fr;
}

.field label{
  display:block;
  font-size:11px;
  color:#5f6f86;
  margin-bottom:3px;
}

.field input{
  width:100%;
  border:3px solid #b99b69;
  background:#fffdf6;
  padding:7px;
  font-weight:800;
}

.check-field{
  display:flex;
  gap:6px;
  align-items:center;
  font-weight:800;
  padding-bottom:8px;
}

.catalog-actions{
  display:flex;
  justify-content:flex-end;
  gap:8px;
  margin-top:10px;
}

@media(max-width:1100px){
  .title-grid,
  .special-grid{
    grid-template-columns:1fr 1fr;
  }

  .wide{
    grid-column:auto;
  }
}

@media(max-width:640px){
  .title-grid,
  .special-grid{
    grid-template-columns:1fr;
  }

  .catalog-actions{
    flex-direction:column;
  }
}
</style>
