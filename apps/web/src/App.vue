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
import { provide, ref, onMounted, onUnmounted ,watch} from 'vue';
import { useUserStore } from '@/stores/user';
import { Tracker } from '@en/tracker';
provide(IS_SHOW_LOGIN, ref(false))

const userStore = useUserStore()

const tracker = new Tracker({
  baseUrl: '/api/v1',
  uv: {
    api: '/tracker/uv',
    updateApi: '/tracker/update-uv',
  },
  pv: {
    api: '/tracker/pv',
  },
  event: {
    api: '/tracker/event',
  },
  error: {
    api: '/tracker/error',
  },
  performance: {
    api: '/tracker/performance',
  },
});
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  setTimeout(() => { userStore.checkAuth() }, 0)
  timer = setInterval(() => { userStore.checkAuth() }, 30000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
watch(()=>userStore.user?.id,(newVal)=>{
  if(newVal){
    tracker.setUserId(newVal)
  }else{

  }
},{
  immediate:true
})
</script>