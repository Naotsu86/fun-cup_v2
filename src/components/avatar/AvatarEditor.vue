<template>
  <div class="avatar-editor">
    <div class="avatar-editor-left">
      <div class="avatar-frame">
        <AvatarPreview :avatar="draft" :size="190" />
      </div>

      <div class="avatar-profile-fields">
        <div class="field">
          <label>Vorname</label>
          <input :value="name" disabled>
        </div>

        <div class="field">
          <label>AKA-Name</label>
          <input :value="akaName || '-'" disabled>
        </div>

        <div class="field">
          <label>Bio</label>
          <textarea v-model="draft.bio" rows="4" placeholder="Kurzer Text zu deinem Pinguin"></textarea>
        </div>
      </div>
    </div>

    <div class="avatar-editor-right">
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
        :locked-note="lockedAccessoryHint"
        @previous="change('accessoryItem', 'accessory_item', -1)"
        @next="change('accessoryItem', 'accessory_item', 1)"
      />

      <button class="btn primary full avatar-save-button" @click="save" :disabled="saving">
        {{ saving ? 'Speichern...' : 'Avatar speichern' }}
      </button>

      <p v-if="message" class="muted">{{ message }}</p>
      <p v-if="error" class="error-small">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import AvatarPreview from './AvatarPreview.vue'
import AvatarPickerRow from './AvatarPickerRow.vue'
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

const name = computed(() => props.profile.players?.name || props.profile.display_name || '')
const akaName = computed(() => props.profile.players?.aka_name || '')
const unlockedItems = computed(() => props.profile.unlocked_items || [])

const lockedAccessoryHint = computed(() => {
  const locked = avatarOptions.accessoryItem.filter(item => !item.unlocked)
  return locked.length ? 'Krone und Umhang sind später freischaltbar.' : ''
})

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
