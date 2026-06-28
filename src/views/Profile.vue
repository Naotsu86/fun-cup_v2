<template>
  <section class="screen">
    <PlayerRegisterPanel
      v-if="mode === 'register' && !user"
      @show-login="mode = 'login'"
      @registered="mode = 'login'"
    />

    <PlayerLoginPanel
      v-else-if="!user"
      @logged-in="loadProfile"
    />

    <div v-else class="card pixel-card menu-window">
      <h2>👤 Mein Profil</h2>

      <div class="menu-body">
        <p><strong>E-Mail:</strong><br>{{ user.email }}</p>

        <template v-if="loadingProfile">
          <p class="muted">Profil wird geladen...</p>
        </template>

        <template v-else-if="profile">
          <p>
            <strong>Status:</strong><br>
            <span v-if="profile.players?.approved">Freigegeben</span>
            <span v-else>Wartet auf Admin-Freigabe</span>
          </p>

          <p><strong>Vorname:</strong><br>{{ profile.players?.name || profile.display_name }}</p>
          <p><strong>AKA-Name:</strong><br>{{ profile.players?.aka_name || '-' }}</p>

          <div class="profile-preview">
            <div class="penguin-placeholder">🐧</div>
            <div>
              <p><strong>Avatar</strong></p>
              <p class="muted">
                Körper: {{ profile.avatar_body }}<br>
                Bauch: {{ profile.avatar_belly }}
              </p>
            </div>
          </div>

          <button class="btn primary full" :disabled="!profile.players?.approved">
            {{ profile.players?.approved ? 'Avatar bearbeiten kommt als Nächstes' : 'Avatar erst nach Freigabe möglich' }}
          </button>
        </template>

        <template v-else>
          <p class="error-small">
            Für diesen Login wurde noch kein Spielerprofil gefunden.
          </p>
        </template>

        <button class="btn full" @click="logoutUser">
          Abmelden
        </button>

        <p v-if="message" class="muted">{{ message }}</p>
      </div>
    </div>

    <div v-if="!user && mode === 'login'" class="card pixel-card menu-window">
      <div class="menu-body">
        <button class="btn full" @click="mode = 'register'">
          Noch kein Konto? Registrieren
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import PlayerLoginPanel from '../components/auth/PlayerLoginPanel.vue'
import PlayerRegisterPanel from '../components/auth/PlayerRegisterPanel.vue'
import { getCurrentUser, signOut } from '../services/authV2'
import { getMyProfile } from '../services/playerProfileService'

const emit = defineEmits(['auth-changed'])

const mode = ref('login')
const user = ref(null)
const profile = ref(null)
const loadingProfile = ref(false)
const message = ref('')

onMounted(loadProfile)

async function loadProfile() {
  message.value = ''

  try {
    user.value = await getCurrentUser()

    if (!user.value) return

    loadingProfile.value = true
    profile.value = await getMyProfile()
    emit('auth-changed')
  } catch (error) {
    message.value = error.message || 'Profil konnte nicht geladen werden.'
  } finally {
    loadingProfile.value = false
  }
}

async function logoutUser() {
  await signOut()
  user.value = null
  profile.value = null
  message.value = 'Abgemeldet.'
  emit('auth-changed')
}
</script>
