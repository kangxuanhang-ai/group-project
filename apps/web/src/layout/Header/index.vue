<template>
    <header class="flex items-center h-20 border-b border-gray-200 justify-center sticky top-0 bg-white z-10">
        <div class="w-[1200px] mx-auto flex items-center justify-between">
            <div
                class="text-2xl font-bold bg-indigo-700 text-white rounded-[10px] px-2 py-1 w-10 flex items-center justify-center h-10 ">
                E</div>
            <div class="text-2xl font-bold">English App</div>
            <div v-for="item in navItems" :key="item.path" @click="router.push(item.path)"
                :class="[
                    'flex items-center gap-2 cursor-pointer rounded-[10px] px-3 py-1.5 transition-all duration-200',
                    currentPath === item.path
                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                ]">
                <el-icon>
                    <component :is="item.icon" />
                </el-icon>
                <span>{{ item.label }}</span>
            </div>
            <div class="flex items-center gap-2 bg-blue-200 text-blue-700 rounded-full px-2 py-1"><el-icon>
                    <Sunny />
                </el-icon> <span class="font-bold text-sm">{{ userStore.user?.wordNumber ?? 0 }}</span></div>
            <div class="flex items-center gap-2 bg-amber-200 text-amber-700 rounded-full px-2 py-1"><el-icon>
                    <Star />
                </el-icon> <span class="font-bold text-sm">{{ userStore.user?.dayNumber ?? 0 }}</span></div>
            <el-dropdown v-if="userStore.isLoggedIn" trigger="click">
                <div class="flex items-center gap-2 border-l cursor-pointer border-gray-200 pl-4">
                    <img class="w-10 h-10 rounded-full ml-2 mr-2"
                        :src="userStore.user?.avatar || 'https://gips3.baidu.com/it/u=3493347002,3356558679&fm=3074&app=3074&f=PNG?w=2048&h=2048'" />
                    <span class="text-sm font-bold">{{ userStore.user?.name }}</span>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <div v-else @click="login()" class="flex items-center gap-2 border-l cursor-pointer border-gray-200 pl-4">
                <el-icon :size="20"><User /></el-icon>
                <span class="text-sm font-bold text-gray-400">未登录</span>
            </div>
        </div>
    </header>
</template>


<script setup lang="ts">
import { Sunny, Star, HomeFilled, Notebook, MagicStick, Reading, Setting, User } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useLogin } from '@/hooks/useLogin';
import { computed } from 'vue';

import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { login } = useLogin()

const currentPath = computed(() => route.path)

const navItems = [
  { path: '/', label: '主页', icon: HomeFilled },
  { path: '/chat/index', label: '聊天', icon: MagicStick },
  { path: '/word-book/index', label: '词库', icon: Notebook },
  { path: '/courses/index', label: '课程', icon: Reading },
  { path: '/setting/index', label: '设置', icon: Setting },
]

const handleLogout = async () => {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/')
}
</script>