<template>
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">欢迎回来</h1>
        <p class="text-gray-500 text-sm">请登录您的账户以继续</p>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" class="space-y-6" @submit.prevent="handleLogin">
        <el-form-item prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" size="large" class="h-12" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" class="h-12"
                :prefix-icon="Lock" show-password />
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
import { ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { loginApi } from '@/apis/user'
import { useUserStore } from '@/stores/user'
import type { FormInstance } from 'element-plus'

const emit = defineEmits<{
    (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const form = ref({
    phone: '',
    password: '',
})
const loading = ref(false)

const rules = {
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
    ],
}

const handleLogin = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
        const res = await loginApi({
            phone: form.value.phone,
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
        ElMessage.error(err?.response?.data?.message || '登录失败，请稍后重试')
    } finally {
        loading.value = false
    }
}

const handleForgotPassword = () => {
    ElMessage.info('功能开发中，敬请期待')
}
</script>
