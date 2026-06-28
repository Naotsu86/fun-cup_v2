<template>
  <div class="avatar-picker-row">
    <div class="avatar-picker-title">{{ title }}</div>

    <div class="avatar-picker-controls">
      <button class="avatar-arrow" type="button" @click="$emit('previous')">◀</button>

      <div class="avatar-picker-value">
        {{ label }}
      </div>

      <button class="avatar-arrow" type="button" @click="$emit('next')">▶</button>
    </div>

    <p v-if="lockedNote" class="avatar-note">{{ lockedNote }}</p>
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

<style scoped>
.avatar-picker-row{
  border:3px solid #c5a66f;
  background:#fff4d2;
  padding:10px;
  margin-bottom:10px;
}

.avatar-picker-title{
  font-family:var(--font-pixel, 'Silkscreen', monospace);
  letter-spacing:.08em;
  font-size:14px;
  margin-bottom:8px;
  color:#2b2115;
}

.avatar-picker-controls{
  display:grid;
  grid-template-columns:42px 1fr 42px;
  gap:8px;
  align-items:center;
}

.avatar-arrow{
  min-height:38px;
  border:3px solid #8a6330;
  background:#ffe2a8;
  color:#2b2115;
  font-weight:900;
  cursor:pointer;
  box-shadow:2px 2px 0 rgba(0,0,0,.18);
}

.avatar-picker-value{
  min-height:38px;
  display:grid;
  place-items:center;
  border:3px solid #b89354;
  background:#fffdf6;
  font-weight:800;
  text-align:center;
}

.avatar-note{
  margin:7px 0 0;
  color:#5f6f86;
  font-size:12px;
}
</style>
