<template>
  <div class="avatar-preview-wrap">
    <div class="avatar-stage">
      <div class="avatar-sun"></div>
      <div class="avatar-cloud cloud-a"></div>
      <div class="avatar-cloud cloud-b"></div>

      <img class="avatar-layer" :src="baseAvatar">
      <img class="avatar-layer" :src="bellyAvatar">

      <img v-if="headSrc" class="avatar-layer" :src="headSrc">
      <img v-if="shortsSrc" class="avatar-layer" :src="shortsSrc">
      <img v-if="accessorySrc" class="avatar-layer" :src="accessorySrc">
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {avatarOptions,getOptionFile} from '../../services/avatarOptions'
const props=defineProps({avatar:Object})
const base=import.meta.env.BASE_URL

const baseAvatar=computed(()=>`${base}avatar/base/${getOptionFile('bodyColor',props.avatar.body_color||'black')}`)
const bellyAvatar=computed(()=>`${base}avatar/belly/${getOptionFile('bellyColor',props.avatar.belly_color||'white')}`)

function layer(group,folder,id){
 const o=avatarOptions[group]?.find(x=>x.id===id)
 return (!o||o.id==='none')?'':`${base}avatar/${folder}/${o.file}`
}
const headSrc=computed(()=>layer('headItem','head',props.avatar.head_item))
const shortsSrc=computed(()=>layer('shortsItem','shorts',props.avatar.shorts_item))
const accessorySrc=computed(()=>layer('accessoryItem','accessory',props.avatar.accessory_item))
</script>

<style scoped>
.avatar-stage{position:relative;width:230px;height:230px;overflow:hidden;border:3px solid #2b2115;
background:linear-gradient(#7bd3ff 0 42%,#2f9bd1 42% 47%,#f8d98a 47% 68%,#e7b861 68%)}
.avatar-layer{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;image-rendering:pixelated}
.avatar-sun{position:absolute;right:20px;top:16px;width:22px;height:22px;background:#ffd65a;border:3px solid #b97819;border-radius:50%}
.avatar-cloud{position:absolute;height:10px;background:#fff;border-radius:8px;opacity:.8}
.cloud-a{left:22px;top:30px;width:46px}.cloud-b{left:92px;top:20px;width:34px}
</style>
