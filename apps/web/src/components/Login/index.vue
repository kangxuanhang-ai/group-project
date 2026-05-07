<template>
    <div v-if="isShowLogin" class="fixed inset-0 bg-black opacity-30 z-40"></div>
    <div v-if="isShowLogin" class="fixed inset-0 flex items-center justify-center z-50" @click.self="isShowLogin = false">
        <div class="w-[1200px] h-[550px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex mt-20 relative">
            <button @click="isShowLogin = false"
                class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all z-10"
                type="button">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
            <ModelViewer v-model:formType="formType" />
            <div class="flex-1 flex flex-col justify-center px-12 py-10 bg-white">
                <LoginForm v-if="formType === 'login'" @success="handleSuccess" />
                <RegisterForm v-else @registered="handleRegistered" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ModelViewer from './ModelViewer.vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './ResgisterFrom.vue'
import { ref, inject, onUnmounted } from 'vue';
import { IS_SHOW_LOGIN } from './type';
import { useLogin } from '@/hooks/useLogin';

const isShowLogin = inject(IS_SHOW_LOGIN, ref(false))
const formType = ref<'login' | 'register'>('login')
const { resolveLogin } = useLogin()

const handleSuccess = () => {
    resolveLogin()
    formType.value = 'login'
}

const handleRegistered = () => {
    formType.value = 'login'
}

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        isShowLogin.value = false
    }
}
window.addEventListener('keydown', handleKeydown)
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})
</script>