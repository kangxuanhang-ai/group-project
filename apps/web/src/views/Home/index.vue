<template>
    <div class="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
        <div class="w-[1200px] mx-auto">
            <div class="flex items-center justify-between py-20">
                <div class="flex-1">
                    <h1 class="text-5xl font-bold text-gray-800 leading-tight mb-6">
                        开启你的<br />
                        <span class="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-600">英语学习</span>之旅
                    </h1>
                    <p class="text-lg text-gray-500 mb-8">科学词库 + AI 智能助手，高效背单词</p>
                    <div class="flex items-center gap-4">
                        <el-button type="primary" size="large" @click="showLogin"
                            class="h-14 px-10 text-lg font-semibold rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0 shadow-lg shadow-indigo-200">
                            立即学习
                        </el-button>
                        <el-button size="large" @click="router.push('/word-book/index')"
                            class="h-14 px-10 text-lg rounded-xl">
                            浏览词库
                        </el-button>
                    </div>
                </div>
                <div class="flex-1 flex justify-center">
                    <div class="w-[400px] h-[300px] bg-linear-to-br from-indigo-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200">
                        <span class="text-white text-8xl font-bold opacity-30">E</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-4 gap-6 mb-20">
                <div v-for="stat in stats" :key="stat.label"
                    class="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div class="text-3xl font-bold text-indigo-600 mb-2">{{ stat.value }}</div>
                    <div class="text-sm text-gray-500">{{ stat.label }}</div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-8 pb-20">
                <div v-for="card in features" :key="card.title"
                    class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 duration-200">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        :class="card.bg">
                        <el-icon :size="24" :color="card.iconColor">
                            <component :is="card.icon" />
                        </el-icon>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">{{ card.title }}</h3>
                    <p class="text-gray-500 leading-relaxed">{{ card.desc }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Notebook, ChatLineRound, Reading } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useLogin } from '@/hooks/useLogin'
import { ElMessage } from 'element-plus'

const router = useRouter()
const { login } = useLogin()

const showLogin = async () => {
    await login()
    ElMessage.success('登录成功，开始学习吧！')
}

const stats = [
    { value: '10,000+', label: '词汇量' },
    { value: '8', label: '考试分类' },
    { value: '99%', label: '好评率' },
    { value: '24/7', label: 'AI 助手' },
]

const features = [
    {
        title: '科学词库',
        desc: '涵盖 CET-4/6、GRE、TOEFL、IELTS、考研等 8 种考试分类，牛津/柯林斯权威词典数据',
        icon: Notebook,
        bg: 'bg-blue-100',
        iconColor: '#3B82F6',
    },
    {
        title: 'AI 智能助手',
        desc: '基于大模型的 AI 学习助手，随时解答你的英语问题，提供个性化学习建议',
        icon: ChatLineRound,
        bg: 'bg-purple-100',
        iconColor: '#8B5CF6',
    },
    {
        title: '精品课程',
        desc: '名师团队打造的系统课程体系，从基础到进阶，循序渐进提升英语水平',
        icon: Reading,
        bg: 'bg-amber-100',
        iconColor: '#F59E0B',
    },
]
</script>
