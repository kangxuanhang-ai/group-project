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
import { provide, ref } from 'vue';
provide(IS_SHOW_LOGIN, ref(false)) //是否显示登录弹框 并且扩展为全局调用 默认不显示
</script>