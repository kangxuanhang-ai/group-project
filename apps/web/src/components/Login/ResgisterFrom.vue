<template>
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">欢迎注册</h1>
        <p class="text-gray-500 text-sm">请填写以下信息以完成注册</p>
    </div>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80" label-position="top" class="space-y-6"
        @submit.prevent="handleRegister">
        <el-form-item prop="name">
            <el-input v-model="form.name" placeholder="请输入用户名" size="large" class="h-12" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="phone">
            <div class="flex w-full gap-3">
                <el-input v-model="form.phone" placeholder="请输入手机号" size="large" class="h-12 flex-1"
                    :prefix-icon="Iphone" />
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
                :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" class="h-12"
                :prefix-icon="Lock" show-password />
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
import { ref } from 'vue'
import { User, Lock, Iphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { registerApi, sendCodeApi } from '@/apis/user'
import type { FormInstance } from 'element-plus'

const emit = defineEmits<{
    (e: 'success'): void
    (e: 'registered'): void
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
let countdownTimer: ReturnType<typeof setInterval> | null = null

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
