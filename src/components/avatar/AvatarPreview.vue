<template>
  <div class="avatar-preview" :style="previewStyle">
    <img class="avatar-layer avatar-base" :src="baseAvatar" alt="Avatar" />

    <img
      v-if="headSrc"
      class="avatar-layer"
      :src="headSrc"
      alt=""
    />

    <img
      v-if="shortsSrc"
      class="avatar-layer"
      :src="shortsSrc"
      alt=""
    />

    <img
      v-if="accessorySrc"
      class="avatar-layer"
      :src="accessorySrc"
      alt=""
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { avatarOptions } from '../../services/avatarOptions'

const props = defineProps({
  avatar: {
    type: Object,
    required: true
  },
  size: {
    type: Number,
    default: 180
  }
})

const base = import.meta.env.BASE_URL

const baseAvatar = `${base}avatar/base/penguin_default.png`

const previewStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  '--penguin-body-filter': bodyFilter(props.avatar.body_color),
  '--penguin-belly-filter': bellyFilter(props.avatar.belly_color)
}))

const headSrc = computed(() => layerSrc('headItem', 'head', props.avatar.head_item))
const shortsSrc = computed(() => layerSrc('shortsItem', 'shorts', props.avatar.shorts_item))
const accessorySrc = computed(() => layerSrc('accessoryItem', 'accessory', props.avatar.accessory_item))

function layerSrc(optionGroup, folder, id) {
  const option = avatarOptions[optionGroup]?.find(item => item.id === id)
  if (!option || option.id === 'none') return ''
  return `${base}avatar/${folder}/${option.file}`
}

/*
  Erstmal bewusst einfache CSS-Filter.
  Später ersetzen wir die Farbebenen durch echte PNG-Layer,
  sobald die finalen Sprite-Dateien da sind.
*/
function bodyFilter(color) {
  const filters = {
    black: 'none',
    blue: 'hue-rotate(180deg) saturate(1.25)',
    purple: 'hue-rotate(235deg) saturate(1.15)',
    gray: 'grayscale(0.75) brightness(1.2)'
  }

  return filters[color] || 'none'
}

function bellyFilter(color) {
  return color || 'white'
}
</script>
