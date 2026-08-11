import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import { getMe } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)

  function setUser(u: User) {
    user.value = u
  }

  async function fetchUser() {
    try {
      const u = await getMe()
      user.value = u
    } catch {
      logout()
    }
  }

  function logout() {
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  return { user, isLoggedIn, setUser, fetchUser, logout }
})
