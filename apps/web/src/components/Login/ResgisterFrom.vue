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
            <el-input v-model="form.phone" placeholder="请输入手机号" size="large" class="h-12" :prefix-icon="Iphone" />
        </el-form-item>
        <el-form-item prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱(可选)" size="large" class="h-12" :prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" class="h-12"
                :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" size="large" class="h-12"
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
import { User, Lock, Iphone, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { registerApi } from '@/apis/user'
import { useUserStore } from '@/stores/user'
import type { FormInstance } from 'element-plus'

const emit = defineEmits<{
    (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const form = ref({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
})
const loading = ref(false)

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
    if (value === '') {
        callback(new Error('请确认密码'))
    } else if (value !== form.value.password) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

const rules = {
    name: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 10, message: '用户名长度为2-10位', trigger: 'blur' },
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    ],
    email: [
        { pattern: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱格式', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 16, message: '密码长度为6-16位', trigger: 'blur' },
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' },
    ],
}

const handleRegister = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
        const res = await registerApi({
            name: form.value.name,
            phone: form.value.phone,
            email: form.value.email || undefined,
            password: form.value.password,
        })
        if (res.success) {
            const userStore = useUserStore()
            userStore.setLogin(res.data)
            ElMessage.success('注册成功')
            emit('success')
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
