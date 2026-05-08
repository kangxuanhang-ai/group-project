<template>
    <div v-if="isShowLogin" class="fixed inset-0 bg-black opacity-30 z-40"></div>

    <div v-if="isShowLogin" class="fixed inset-0 flex items-center justify-center z-50"
        @click.self="isShowLogin = false">
        <div class="w-[1200px] h-[550px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex mt-20 relative">
            <button @click="isShowLogin = false"
                class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all z-10"
                type="button">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>

            <ModelViewer v-model:formType="formType" :is-typing="loginStatus.isTyping"
                :password-length="loginStatus.passwordLength" :show-password="loginStatus.showPassword" />

            <div class="flex-1 flex flex-col justify-center px-12 py-10 bg-white">
                <LoginForm v-if="formType === 'login'" @success="handleSuccess" @update-status="handleStatusUpdate" />
                <RegisterForm v-else @registered="handleRegistered" @update-status="handleStatusUpdate" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ModelViewer from './ModelViewer.vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './ResgisterFrom.vue'
import { ref, inject, onUnmounted, reactive } from 'vue';
import { IS_SHOW_LOGIN } from './type';
import { useLogin } from '@/hooks/useLogin';

// 弹窗显示状态
const isShowLogin = inject(IS_SHOW_LOGIN, ref(false))
// 切换登录/注册
const formType = ref<'login' | 'register'>('login')
const { resolveLogin } = useLogin()

/**
 * 核心状态管理：用于驱动左侧 ModelViewer 的动画
 * isTyping: 手机号/验证码输入框是否获得焦点
 * passwordLength: 密码框实时输入的长度（用于触发紫色小人躲避）
 * showPassword: 是否开启了“显示密码”
 */
const loginStatus = reactive({
    isTyping: false,
    passwordLength: 0,
    showPassword: false
})

// 处理来自 LoginForm 的状态更新
const handleStatusUpdate = (status: Partial<typeof loginStatus>) => {
    Object.assign(loginStatus, status)
}

const handleSuccess = () => {
    resolveLogin()
    formType.value = 'login'
    // 登录成功重置状态
    resetLoginStatus()
}

const handleRegistered = () => {
    formType.value = 'login'
}

const resetLoginStatus = () => {
    loginStatus.isTyping = false
    loginStatus.passwordLength = 0
    loginStatus.showPassword = false
}

// 监听 ESC 键关闭弹窗
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