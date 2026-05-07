import { IS_SHOW_LOGIN } from "@/components/Login/type";
import { inject, ref } from "vue";
import { useUserStore } from "@/stores/user";

let loginResolve: (() => void) | null = null

export const useLogin = () => {
  const isShowLogin = inject(IS_SHOW_LOGIN, ref(false));

  const login = async () => {
    const userStore = useUserStore()
    await userStore.checkAuth()

    if (userStore.isLoggedIn) return

    isShowLogin.value = true
    return new Promise<void>((resolve) => {
      loginResolve = resolve
    })
  };

  const resolveLogin = () => {
    loginResolve?.()
    loginResolve = null
    isShowLogin.value = false
  }

  const logout = () => {
    isShowLogin.value = false
  };

  return {
    login,
    resolveLogin,
    logout,
  };
};
