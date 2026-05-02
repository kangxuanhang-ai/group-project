<template>
    <div>
        <h1>Home</h1>
        <button @click="showLogin">立即学习</button>
    </div>
</template>
<script setup lang="ts">
import { IS_SHOW_LOGIN } from '@/components/Login/type';
import { inject, ref } from 'vue';
import { useLogin } from '@/hooks/useLogin'
const { login } = useLogin()
const isShowLogin = inject(IS_SHOW_LOGIN, ref(false))
const showLogin = () => {
    login()
}
</script>