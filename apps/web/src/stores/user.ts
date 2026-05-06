import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Token, ResultUser } from '@en/common/user'

export const useUserStore = defineStore('user', () => {
  const token = ref<Token | null>(null)
  const user = ref<ResultUser | null>(null)

  const isLoggedIn = computed(() => !!token.value?.accessToken)

  function setLogin(data: { token: Token } & ResultUser) {
    token.value = data.token
    const { token: _, ...userInfo } = data
    user.value = userInfo
  }

  function logout() {
    token.value = null
    user.value = null
  }

  return { token, user, isLoggedIn, setLogin, logout }
}, {
  persist: true,
})
