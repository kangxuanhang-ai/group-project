<template>
    <div>
        <h1>Home</h1>
        <button @click="showLogin">立即学习</button>
    </div>
</template>
<script setup lang="ts">
import { useLogin } from '@/hooks/useLogin'
const { login } = useLogin()
const showLogin = () => {
    login()
}
</script>