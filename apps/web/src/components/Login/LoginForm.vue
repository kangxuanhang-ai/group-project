<template>
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">欢迎回来</h1>
        <p class="text-gray-500 text-sm">请登录您的账户以继续</p>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" class="space-y-6" @submit.prevent="handleLogin">
        <el-form-item prop="account">
            <el-input v-model="form.account" placeholder="手机号 / 邮箱" size="large" class="h-12" :prefix-icon="User"
                @focus="emit('update-status', { isTyping: true })"
                @blur="emit('update-status', { isTyping: false })" />
        </el-form-item>

        <el-form-item prop="password">
            <el-input v-model="form.password" :type="passwordFieldType" placeholder="请输入密码" size="large" class="h-12"
                :prefix-icon="Lock" @input="onPasswordInput" @focus="emit('update-status', { isTyping: true })"
                @blur="emit('update-status', { isTyping: false })">
                <template #suffix>
                    <span class="cursor-pointer flex items-center h-full px-1" @click="togglePasswordVisible">
                        <svg v-if="!passwordVisible" class="w-5 h-5 text-gray-400 hover:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M2 12C3.8 8.5 7.4 6 12 6C16.6 6 20.2 8.5 22 12C20.2 15.5 16.6 18 12 18C7.4 18 3.8 15.5 2 12Z" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <svg v-else class="w-5 h-5 text-gray-400 hover:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M3 3L21 21" stroke-linecap="round"/>
                            <path d="M10.58 10.58A2 2 0 0013.42 13.42" stroke-linecap="round"/>
                            <path d="M9.88 5.09A10.94 10.94 0 0112 4.9C16.6 4.9 20.2 7.4 22 10.9A17.2 17.2 0 0118.91 15.1" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6.1 6.1C4.38 7.3 3 8.93 2 10.9C3.8 14.4 7.4 16.9 12 16.9C13.27 16.9 14.48 16.71 15.6 16.36" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                </template>
            </el-input>
        </el-form-item>

        <el-form-item class="pt-4">
            <el-button type="primary" size="large" native-type="submit" :loading="loading"
                class="w-full h-12 text-base font-semibold bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0">
                登录
            </el-button>
        </el-form-item>

        <el-form-item class="text-center mb-0">
            <el-button link type="primary" @click="handleForgotPassword">忘记密码？</el-button>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { loginApi } from '@/apis/user'
import { useUserStore } from '@/stores/user'
import type { FormInstance } from 'element-plus'

const emit = defineEmits<{
    (e: 'success'): void
    (e: 'update-status', status: { isTyping?: boolean; passwordLength?: number; showPassword?: boolean }): void
}>()

const formRef = ref<FormInstance>()
const form = ref({
    account: '',
    password: '',
})
const loading = ref(false)
const passwordVisible = ref(false)

const passwordFieldType = computed(() => passwordVisible.value ? 'text' : 'password')

const rules = {
    account: [
        { required: true, message: '请输入手机号或邮箱', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
    ],
}

const togglePasswordVisible = () => {
    passwordVisible.value = !passwordVisible.value
    emit('update-status', { showPassword: passwordVisible.value })
}

const onPasswordInput = (val: string) => {
    emit('update-status', { passwordLength: val.length })
}

const handleLogin = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
        const res = await loginApi({
            account: form.value.account,
            password: form.value.password,
        })
        if (res.success) {
            const userStore = useUserStore()
            userStore.setLogin(res.data)
            ElMessage.success('登录成功')
            emit('success')
        } else {
            ElMessage.error(res.message || '登录失败')
        }
    } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || '登录失败，请稍后重试'
        console.error('登录错误:', err)
        ElMessage.error(msg)
    } finally {
        loading.value = false
    }
}

const handleForgotPassword = () => {
    ElMessage.info('功能开发中，敬请期待')
}
</script>
