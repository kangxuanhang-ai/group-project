<template>
    <div class="mb-8">
        <div class="relative flex w-full h-12 bg-gray-50 rounded-xl p-1">
            <div class="absolute top-1 h-10 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out"
                :style="{ width: '50%', left: registerMode === 'phone' ? '0%' : '50%' }"></div>
            <button type="button"
                class="relative z-10 flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-300"
                :class="registerMode === 'phone' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'"
                @click="switchTo('phone')">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                手机号注册
            </button>
            <button type="button"
                class="relative z-10 flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-300"
                :class="registerMode === 'email' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'"
                @click="switchTo('email')">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                邮箱注册
            </button>
        </div>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="80" label-position="top" class="space-y-6"
        :validate-on-rule-change="false" @submit.prevent="handleRegister">
        <el-form-item prop="name">
            <el-input v-model="form.name" placeholder="请输入用户名" size="large" class="h-12" :prefix-icon="User"
                @focus="emit('update-status', { isTyping: true })"
                @blur="emit('update-status', { isTyping: false })" />
        </el-form-item>

        <transition name="mode-fade" mode="out-in">
            <!-- 手机号注册 -->
            <el-form-item key="phone" v-if="registerMode === 'phone'" prop="phone">
                <div class="flex w-full gap-3">
                    <el-input v-model="form.phone" placeholder="请输入手机号" size="large" class="h-12 flex-1"
                        :prefix-icon="Iphone" @focus="emit('update-status', { isTyping: true })"
                        @blur="emit('update-status', { isTyping: false })" />
                    <el-button size="large" :disabled="codeSending || countdown > 0" class="h-12 px-5 shrink-0"
                        @click="handleSendCode"
                        :class="countdown > 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'">
                        <template v-if="countdown > 0">{{ countdown }}s</template>
                        <template v-else-if="codeSending">发送中...</template>
                        <template v-else>
                            <svg class="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                                <line x1="12" y1="18" x2="12.01" y2="18"/>
                            </svg>
                            获取验证码
                        </template>
                    </el-button>
                </div>
            </el-form-item>

            <!-- 邮箱注册 -->
            <el-form-item key="email" v-else prop="email">
                <div class="flex w-full gap-3">
                    <el-input v-model="form.email" placeholder="请输入邮箱" size="large" class="h-12 flex-1"
                        :prefix-icon="Message" @focus="emit('update-status', { isTyping: true })"
                        @blur="emit('update-status', { isTyping: false })" />
                    <el-button size="large" :disabled="codeSending || countdown > 0" class="h-12 px-5 shrink-0"
                        @click="handleSendCode"
                        :class="countdown > 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'">
                        <template v-if="countdown > 0">{{ countdown }}s</template>
                        <template v-else-if="codeSending">发送中...</template>
                        <template v-else>
                            <svg class="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            获取验证码
                        </template>
                    </el-button>
                </div>
            </el-form-item>
        </transition>

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

<style scoped>
.mode-fade-enter-active,
.mode-fade-leave-active {
    transition: all 0.25s ease;
}
.mode-fade-enter-from {
    opacity: 0;
    transform: translateY(-8px);
}
.mode-fade-leave-to {
    opacity: 0;
    transform: translateY(8px);
}
</style>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { User, Lock, Iphone, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { registerApi, registerByEmailApi, sendCodeApi, sendEmailCodeApi } from '@/apis/user'
import type { FormInstance } from 'element-plus'

const emit = defineEmits<{
    (e: 'success'): void
    (e: 'registered'): void
    (e: 'update-status', status: { isTyping?: boolean; passwordLength?: number; showPassword?: boolean }): void
}>()

const registerMode = ref<'phone' | 'email'>('phone')

const formRef = ref<FormInstance>()
const form = ref({
    name: '',
    phone: '',
    email: '',
    code: '',
    password: '',
})
const loading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)
const passwordVisible = ref(false)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const passwordFieldType = computed(() => passwordVisible.value ? 'text' : 'password')

const phoneRules = {
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

const emailRules = {
    name: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 10, message: '用户名长度为2-10位', trigger: 'blur' },
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱', trigger: 'blur' },
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

const rules = computed(() => registerMode.value === 'phone' ? phoneRules : emailRules)

const switchTo = (mode: 'phone' | 'email') => {
    if (registerMode.value === mode) return
    registerMode.value = mode
    form.value.phone = ''
    form.value.email = ''
    form.value.code = ''
    if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
    }
    countdown.value = 0
    nextTick(() => {
        formRef.value?.clearValidate()
    })
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
    const field = registerMode.value === 'phone' ? 'phone' : 'email'
    const valid = await formRef.value.validateField(field).catch(() => false)
    if (!valid) return

    codeSending.value = true
    try {
        const res = registerMode.value === 'phone'
            ? await sendCodeApi(form.value.phone)
            : await sendEmailCodeApi(form.value.email)
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
        const res = registerMode.value === 'phone'
            ? await registerApi({
                name: form.value.name,
                phone: form.value.phone,
                password: form.value.password,
                code: form.value.code,
            })
            : await registerByEmailApi({
                name: form.value.name,
                email: form.value.email,
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
