<template>
  <div class="avatar-editor-clean">
    <div class="avatar-left">
      <AvatarPreview :avatar="draft" />

      <div class="avatar-info-box">
        <div class="field">
          <label>Vorname</label>
          <input :value="playerName" disabled>
        </div>

        <div class="field">
          <label>AKA-Name</label>
          <input :value="akaName || '-'" disabled>
        </div>
      </div>
    </div>

    <div class="avatar-right">
      <AvatarPickerRow
        title="Körperfarbe"
        :label="label('bodyColor', draft.body_color)"
        :swatch="swatch('bodyColor', draft.body_color)"
        @previous="change('bodyColor', 'body_color', -1)"
        @next="change('bodyColor', 'body_color', 1)"
      />

      <AvatarPickerRow
        title="Bauchfarbe"
        :label="label('bellyColor', draft.belly_color)"
        :swatch="swatch('bellyColor', draft.belly_color)"
        @previous="change('bellyColor', 'belly_color', -1)"
        @next="change('bellyColor', 'belly_color', 1)"
      />

      <AvatarPickerRow
        title="Kopfbedeckung"
        :label="label('headItem', draft.head_item)"
        @previous="change('headItem', 'head_item', -1)"
        @next="change('headItem', 'head_item', 1)"
      />

      <AvatarPickerRow
        title="Shorts / Rock"
        :label="label('shortsItem', draft.shorts_item)"
        @previous="change('shortsItem', 'shorts_item', -1)"
        @next="change('shortsItem', 'shorts_item', 1)"
      />

      <AvatarItemGrid
        v-model="draft.accessory_item"
        :unlocked-items="unlockedItems"
      />

      <button class="btn primary full avatar-save-button" @click="save" :disabled="saving">
        {{ saving ? 'Speichern...' : 'Avatar speichern' }}
      </button>

      <p v-if="message" class="avatar-message">{{ message }}</p>
      <p v-if="error" class="avatar-error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import AvatarPreview from './AvatarPreview.vue'
import AvatarPickerRow from './AvatarPickerRow.vue'
import AvatarItemGrid from './AvatarItemGrid.vue'
import { avatarOptions, getNextOption, getOptionLabel } from '../../services/avatarOptions'

const props = defineProps({
  profile: {
    type: Object,
    required: true
  },
  saving: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['save'])

const draft = reactive(makeDraft(props.profile))

watch(
  () => props.profile,
  profile => Object.assign(draft, makeDraft(profile))
)

const playerName = computed(() => props.profile.players?.name || props.profile.display_name || '')
const akaName = computed(() => props.profile.players?.aka_name || '')
const unlockedItems = computed(() => props.profile.unlocked_items || [])

function makeDraft(profile) {
  return {
    body_color: profile.body_color || profile.avatar_body || 'black',
    belly_color: profile.belly_color || profile.avatar_belly || 'white',
    head_item: profile.head_item || 'none',
    shorts_item: profile.shorts_item || 'none',
    accessory_item: profile.accessory_item || 'none'
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
</script>

<style scoped>
.avatar-editor-clean{
  display:grid;
  grid-template-columns:280px 1fr;
  gap:14px;
  align-items:start;
}

.avatar-left,
.avatar-right{
  min-width:0;
}

.avatar-info-box{
  margin-top:10px;
  border:3px solid #c5a66f;
  background:#fffdf6;
  padding:9px;
}

.avatar-save-button{
  margin-top:10px;
}

.avatar-message{
  color:#1b7f24;
  font-weight:800;
}

.avatar-error{
  background:#fee2e2;
  color:#991b1b;
  border:3px solid #7f1d1d;
  padding:10px;
  font-weight:800;
}

@media(max-width:760px){
  .avatar-editor-clean{
    grid-template-columns:1fr;
  }
}
</style>
