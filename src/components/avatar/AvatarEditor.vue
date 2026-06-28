<template>
  <div class="avatar-editor-clean">
    <div class="avatar-left">
      <div class="avatar-frame">
        <AvatarPreview :avatar="draft" />
      </div>

      <div class="avatar-info-box">
        <div class="field">
          <label>Vorname</label>
          <input :value="playerName" disabled>
        </div>

        <div class="field">
          <label>AKA-Name</label>
          <input :value="akaName || '-'" disabled>
        </div>

        <div class="field">
          <label>Bio</label>
          <textarea
            v-model="draft.bio"
            rows="4"
            placeholder="Kurzer Text zu deinem Pinguin"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="avatar-right">
      <AvatarPickerRow
        title="Körperfarbe"
        :label="label('bodyColor', draft.body_color)"
        @previous="change('bodyColor', 'body_color', -1)"
        @next="change('bodyColor', 'body_color', 1)"
      />

      <AvatarPickerRow
        title="Bauchfarbe"
        :label="label('bellyColor', draft.belly_color)"
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

      <AvatarPickerRow
        title="Accessoire"
        :label="label('accessoryItem', draft.accessory_item)"
        locked-note="Krone und Umhang werden später freigeschaltet."
        @previous="change('accessoryItem', 'accessory_item', -1)"
        @next="change('accessoryItem', 'accessory_item', 1)"
      />

      <button class="btn primary full" @click="save" :disabled="saving">
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
import { getNextOption, getOptionLabel } from '../../services/avatarOptions'

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
    accessory_item: profile.accessory_item || 'none',
    bio: profile.bio || ''
  }
}

function label(group, id) {
  return getOptionLabel(group, id)
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
  grid-template-columns:minmax(260px, 360px) 1fr;
  gap:16px;
  align-items:start;
}

.avatar-left,
.avatar-right{
  min-width:0;
}

.avatar-frame{
  border:4px solid #2b2115;
  background:
    linear-gradient(180deg, #8bd5ff 0%, #bfeaff 48%, #64b75d 49%, #2f8a3b 100%);
  padding:14px;
  display:grid;
  place-items:center;
  box-shadow:4px 4px 0 rgba(0,0,0,.22);
  overflow:hidden;
}

.avatar-info-box{
  margin-top:12px;
  border:3px solid #c5a66f;
  background:#fffdf6;
  padding:10px;
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

  .avatar-frame{
    padding:10px;
  }
}
</style>
