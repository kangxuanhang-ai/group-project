import { IS_SHOW_LOGIN } from "@/components/Login/type";
import { inject, ref } from "vue";
import { useUserStore } from "@/stores/user";

let loginResolve: (() => void) | null = null

export const useLogin = () => {
  const isShowLogin = inject(IS_SHOW_LOGIN, ref(false));

  const login = () => {
    const userStore = useUserStore()
    if (userStore.isLoggedIn) return Promise.resolve()

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
