import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Token, ResultUser } from '@en/common/user'
import { refreshApi } from '@/apis/refresh'

function isTokenExpired(token: string): boolean {
    try {
        const payload = token.split('.')[1]
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
        const decoded = JSON.parse(
            decodeURIComponent(
                atob(padded).split('').map(c =>
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join('')
            )
        )
        return decoded.exp * 1000 < Date.now()
    } catch {
        return true
    }
}

export const useUserStore = defineStore('user', () => {
  const token = ref<Token | null>(null)
  const user = ref<ResultUser | null>(null)
  const isChecking = ref(false)

  const isLoggedIn = computed(() => !!token.value?.accessToken)
  const getAccessToken = computed(() => token.value?.accessToken)
  const getRefreshToken = computed(() => token.value?.refreshToken)

  function setLogin(data: { token: Token } & ResultUser) {
    token.value = data.token
    const { token: _, ...userInfo } = data
    user.value = userInfo
  }

  function updateToken(newToken: Token) {
    token.value = newToken
  }

  function logout() {
    token.value = null
    user.value = null
  }

  async function checkAuth() {
    if (isChecking.value) return
    isChecking.value = true
    try {
      if (!token.value) return
      if (!token.value.accessToken || !token.value.refreshToken) {
        logout()
        return
      }

      const accessExpired = isTokenExpired(token.value.accessToken)
      const refreshExpired = isTokenExpired(token.value.refreshToken)

      if (!accessExpired) return

      if (refreshExpired) {
        logout()
        return
      }

      const res = await refreshApi.post('/auth/refresh', { refreshToken: token.value.refreshToken }) as any
      if (res?.success) {
        updateToken(res.data)
      } else {
        logout()
      }
    } catch {
      logout()
    } finally {
      isChecking.value = false
    }
  }

  return { token, user, isLoggedIn, getAccessToken, getRefreshToken, setLogin, updateToken, logout, checkAuth }
}, {
  persist: true,
})
