<template>
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">欢迎注册</h1>
        <p class="text-gray-500 text-sm">请填写以下信息以完成注册</p>
    </div>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80" label-position="top" class="space-y-6"
        @submit.prevent="handleRegister">
        <el-form-item prop="name">
            <el-input v-model="form.name" placeholder="请输入用户名" size="large" class="h-12" :prefix-icon="User"
                @focus="emit('update-status', { isTyping: true })"
                @blur="emit('update-status', { isTyping: false })" />
        </el-form-item>
        <el-form-item prop="phone">
            <div class="flex w-full gap-3">
                <el-input v-model="form.phone" placeholder="请输入手机号" size="large" class="h-12 flex-1"
                    :prefix-icon="Iphone" @focus="emit('update-status', { isTyping: true })"
                    @blur="emit('update-status', { isTyping: false })" />
                <el-button size="large" :disabled="codeSending || countdown > 0" class="h-12 px-5 shrink-0"
                    @click="handleSendCode"
                    :class="countdown > 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'">
                    <template v-if="countdown > 0">{{ countdown }}s</template>
                    <template v-else-if="codeSending">发送中...</template>
                    <template v-else>获取验证码</template>
                </el-button>
            </div>
        </el-form-item>
        <el-form-item prop="code">
            <el-input v-model="form.code" placeholder="请输入6位验证码" size="large" maxlength="6" class="h-12"
                :prefix-icon="Lock" @focus="emit('update-status', { isTyping: true })"
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
                注册
            </el-button>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { User, Lock, Iphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { registerApi, sendCodeApi } from '@/apis/user'
import type { FormInstance } from 'element-plus'

const emit = defineEmits<{
    (e: 'success'): void
    (e: 'registered'): void
    (e: 'update-status', status: { isTyping?: boolean; passwordLength?: number; showPassword?: boolean }): void
}>()

const formRef = ref<FormInstance>()
const form = ref({
    name: '',
    phone: '',
    code: '',
    password: '',
})
const loading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)
const passwordVisible = ref(false)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const passwordFieldType = computed(() => passwordVisible.value ? 'text' : 'password')

const rules = {
    name: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 10, message: '用户名长度为2-10位', trigger: 'blur' },
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 16, message: '密码长度为6-16位', trigger: 'blur' },
    ],
}

const togglePasswordVisible = () => {
    passwordVisible.value = !passwordVisible.value
    emit('update-status', { showPassword: passwordVisible.value })
}

const onPasswordInput = (val: string) => {
    emit('update-status', { passwordLength: val.length })
}

function startCountdown(seconds: number) {
    countdown.value = seconds
    countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
            if (countdownTimer) clearInterval(countdownTimer)
            countdownTimer = null
        }
    }, 1000)
}

const handleSendCode = async () => {
    if (!formRef.value) return
    const valid = await formRef.value.validateField('phone').catch(() => false)
    if (!valid) return

    codeSending.value = true
    try {
        const res = await sendCodeApi(form.value.phone)
        if (res.success) {
            ElMessage.success('验证码已发送')
            startCountdown(60)
        } else {
            ElMessage.error(res.message || '发送失败')
        }
    } catch (err: any) {
        ElMessage.error(err?.response?.data?.message || '发送失败，请稍后重试')
    } finally {
        codeSending.value = false
    }
}

const handleRegister = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
        const res = await registerApi({
            name: form.value.name,
            phone: form.value.phone,
            password: form.value.password,
            code: form.value.code,
        })
        if (res.success) {
            ElMessage.success('注册成功，请登录')
            emit('registered')
        } else {
            ElMessage.error(res.message || '注册失败')
        }
    } catch (err: any) {
        ElMessage.error(err?.response?.data?.message || '注册失败，请稍后重试')
    } finally {
        loading.value = false
    }
}
</script>
