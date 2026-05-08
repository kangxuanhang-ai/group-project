<template>
    <header class="flex items-center h-20 border-b border-gray-200 justify-center sticky top-0 bg-white z-10">
        <div class="w-[1200px] mx-auto flex items-center justify-between">
            <div
                class="text-2xl font-bold bg-indigo-700 text-white rounded-[10px] px-2 py-1 w-10 flex items-center justify-center h-10 ">
                E</div>
            <div class="text-2xl font-bold">English App</div>
            <template v-for="route in routes" :key="route.path">
                <div @click="gotoPath(route.path)"
                class="flex items-center gap-2 cursor-pointer rounded-[10px] px-2 py-1 text-gray-500">
                <el-icon>
                    <component :is="route.icon" />
                </el-icon> <span>{{ route.name }}</span>
            </div>

            </template>
            <div class="flex items-center gap-2 bg-blue-200 text-blue-700 rounded-full px-2 py-1"><el-icon>
                    <Sunny />
                </el-icon> <span class="font-bold text-sm">{{ userStore.user?.wordNumber ?? 0 }}</span></div>
            <div class="flex items-center gap-2 bg-amber-200 text-amber-700 rounded-full px-2 py-1"><el-icon>
                    <Star />
                </el-icon> <span class="font-bold text-sm">{{ userStore.user?.dayNumber ?? 0 }}</span></div>
                <el-popover :width="340">
                    <template #reference>
                        <el-dropdown v-if="userStore.isLoggedIn" trigger="click">
                <div class="flex items-center gap-2 border-l cursor-pointer border-gray-200 pl-4">
                    <img class="w-10 h-10 rounded-full ml-2 mr-2"
                        :src="avatar" />
                    <span class="text-sm font-bold">{{ userStore.user?.name }}</span>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <div v-else @click="login()" class="flex items-center gap-2 border-l cursor-pointer border-gray-200 pl-4">
                <img class="w-10 h-10 rounded-full ml-2 mr-2"
                :src="avatar" />
                <span class="text-sm font-bold text-gray-400">未登录</span>
            </div>
                    </template>
                    <Profile />
                </el-popover>
            
        </div>
        
    </header>
</template>


<script setup lang="ts">
import { Sunny, Star, HomeFilled, Notebook, MagicStick, Reading, Setting, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useLogin } from '@/hooks/useLogin';
import Profile from '../Profile/index.vue'
import { useAvatar } from '@/hooks/useAvatar'
const {avatar} = useAvatar()




import { ElMessage, ElMessageBox } from 'element-plus'

const routes = [
    {path:'/',name:'主页',icon:HomeFilled,isAuth:false},
    {path:'/chat/index',name:'聊天',icon:MagicStick,isAuth:true},   
    {path:'/word-book/index',name:'词库',icon:Notebook,isAuth:false},
    {path:'/courses/index',name:'课程',icon:Reading,isAuth:false},
    {path:'/setting/index',name:'设置',icon:Setting,isAuth:true},   
]

const router = useRouter()
const userStore = useUserStore()
const { login } = useLogin()

const gotoPath = async (path: string) => {
    const isAuth = routes.find(route => route.path === path)?.isAuth ?? false
    if(isAuth){
        await login()
        if(userStore.isLoggedIn){
            router.push(path)
        }

    }else{
        router.push(path)
    }
}

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