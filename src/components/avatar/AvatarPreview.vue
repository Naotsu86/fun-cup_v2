<template>
  <div class="avatar-preview-wrap">
    <div class="avatar-stage">
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { avatarOptions } from '../../services/avatarOptions'

const props = defineProps({
  avatar: {
    type: Object,
    required: true
  }
})

const base = import.meta.env.BASE_URL
const baseAvatar = `${base}avatar/base/penguin_default.png`

const headSrc = computed(() => layerSrc('headItem', 'head', props.avatar.head_item))
const shortsSrc = computed(() => layerSrc('shortsItem', 'shorts', props.avatar.shorts_item))
const accessorySrc = computed(() => layerSrc('accessoryItem', 'accessory', props.avatar.accessory_item))

function layerSrc(optionGroup, folder, id) {
  const option = avatarOptions[optionGroup]?.find(item => item.id === id)

  if (!option || option.id === 'none') return ''

  return `${base}avatar/${folder}/${option.file}`
}
</script>

<style scoped>
.avatar-preview-wrap{
  width:100%;
  display:grid;
  place-items:center;
}

.avatar-stage{
  position:relative;
  width:min(240px, 72vw);
  height:min(240px, 72vw);
  max-width:240px;
  max-height:240px;
  overflow:hidden;
  image-rendering:pixelated;
}

.avatar-layer{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:contain;
  image-rendering:pixelated;
  user-select:none;
  pointer-events:none;
}

.avatar-base{
  z-index:1;
}

.avatar-layer:not(.avatar-base){
  z-index:2;
}
</style>
