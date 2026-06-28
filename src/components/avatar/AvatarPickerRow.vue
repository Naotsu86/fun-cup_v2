<template>
  <div class="avatar-picker-row">
    <div class="avatar-picker-title">{{ title }}</div>

    <div class="avatar-picker-controls">
      <button class="avatar-arrow" type="button" @click="$emit('previous')">◀</button>
      <div class="avatar-picker-value">{{ label }}</div>
      <button class="avatar-arrow" type="button" @click="$emit('next')">▶</button>
    </div>

    <p v-if="lockedNote" class="muted small avatar-locked-note">{{ lockedNote }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  label: String,
  lockedNote: {
    type: String,
    default: ''
  }
})

defineEmits(['previous', 'next'])
</script>
