<template>
  <RouterView />
  <Login />
  <Search />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Login from './components/Login/index.vue';
import Search from './components/Search/index.vue';
import { IS_SHOW_LOGIN } from './components/Login/type';
import { provide, ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/stores/user';
provide(IS_SHOW_LOGIN, ref(false))

const userStore = useUserStore()
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  setTimeout(() => { userStore.checkAuth() }, 0)
  timer = setInterval(() => { userStore.checkAuth() }, 30000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>