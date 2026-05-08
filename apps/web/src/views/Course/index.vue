<template>
    <div class="min-h-[60vh] bg-zinc-50/80">
        <div class="w-[1200px] mx-auto px-4 pt-12 pb-24">
            <!-- 标签切换 -->
            <div class="flex items-center gap-6 mb-8">
                <button
                    type="button"
                    :class="[
                        'text-lg font-semibold pb-2 border-b-2 transition-colors',
                        activeTab === 'all'
                            ? 'text-indigo-600 border-indigo-600'
                            : 'text-zinc-400 border-transparent hover:text-zinc-600'
                    ]"
                    @click="switchTab('all')"
                >
                    精选课程
                </button>
                <button
                    v-if="userStore.isLoggedIn"
                    type="button"
                    :class="[
                        'text-lg font-semibold pb-2 border-b-2 transition-colors',
                        activeTab === 'my'
                            ? 'text-indigo-600 border-indigo-600'
                            : 'text-zinc-400 border-transparent hover:text-zinc-600'
                    ]"
                    @click="switchTab('my')"
                >
                    我的课程
                </button>
            </div>

            <!-- 精选课程：展示所有课程 -->
            <template v-if="activeTab === 'all'">
                <div v-if="list.length === 0" class="text-center text-zinc-400 py-20 text-sm">暂无课程</div>
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <article v-for="item in list" :key="item.id"
                        class="group bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300 flex flex-col">
                        <div class="relative aspect-4/3 bg-zinc-100 overflow-hidden">
                            <img :src="imageSrc(item.url)" :alt="item.name"
                                class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                            <div
                                class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur text-xs font-medium text-zinc-600 shadow-sm">
                                词汇</div>
                        </div>
                        <div class="p-5 flex-1 flex flex-col">
                            <h2 class="text-base font-semibold text-zinc-900 line-clamp-1">{{ item.name }}</h2>
                            <p class="mt-2 text-sm text-zinc-500 line-clamp-2 leading-relaxed flex-1">{{ item.description }}
                            </p>
                            <div class="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                                <span class="text-xs text-zinc-400 truncate">讲师 {{ item.teacher }}</span>
                                <span class="text-lg font-bold text-indigo-600 shrink-0">¥{{ item.price }}</span>
                            </div>
                            <button type="button"
                                v-if="purchasedIds.has(item.id)"
                                disabled
                                class="mt-4 w-full py-2.5 rounded-xl text-sm font-medium text-zinc-400 border border-zinc-200 bg-zinc-50 cursor-not-allowed">
                                已购买
                            </button>
                            <button type="button"
                                v-else
                                @click="handleBuy(item)"
                                class="mt-4 w-full py-2.5 rounded-xl text-sm font-medium text-indigo-600 border border-indigo-200 bg-white hover:bg-indigo-50 transition-colors cursor-pointer">
                                购买课程
                            </button>
                        </div>
                    </article>
                </div>
            </template>

            <!-- 我的课程：展示已购课程 -->
            <template v-if="activeTab === 'my'">
                <div v-if="myCourses.length === 0" class="text-center text-zinc-400 py-20 text-sm">暂无课程</div>
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <article v-for="item in myCourses" :key="item.id"
                        class="group bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300 flex flex-col">
                        <div class="relative aspect-4/3 bg-zinc-100 overflow-hidden">
                            <img :src="imageSrc(item.url)" :alt="item.name"
                                class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                            <div
                                class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-indigo-500/90 backdrop-blur text-xs font-medium text-white shadow-sm">
                                已购</div>
                        </div>
                        <div class="p-5 flex-1 flex flex-col">
                            <h2 class="text-base font-semibold text-zinc-900 line-clamp-1">{{ item.name }}</h2>
                            <p class="mt-2 text-sm text-zinc-500 line-clamp-2 leading-relaxed flex-1">{{ item.description }}
                            </p>
                            <div class="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                                <span class="text-xs text-zinc-400 truncate">讲师 {{ item.teacher }}</span>
                            </div>
                            <button type="button"
                                @click="goLearn(item)"
                                class="mt-4 w-full py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer">
                                去学习
                            </button>
                        </div>
                    </article>
                </div>
            </template>
        </div>

        <!-- 支付弹框 -->
        <Pay :show="showPay" :course="selectedCourse" @update:show="showPay = $event" @paid="onPaid" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCourseList, getMyCourses } from '@/apis/course'
import { queryPayStatus, confirmPay } from '@/apis/pay'
import Pay from './components/Pay.vue'
import type { Course } from '../../types/course'
import { useLogin } from '@/hooks/useLogin'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const activeTab = ref<'all' | 'my'>('all')
const list = ref<Course[]>([])
const myCourses = ref<Course[]>([])
const purchasedIds = computed(() => new Set(myCourses.value.map((c: Course) => c.id)))
const showPay = ref(false)
const selectedCourse = ref<Course | null>(null)
const { login } = useLogin()
const userStore = useUserStore()

const fetchAllCourses = async () => {
    const res = await getCourseList()
    if (res.success) list.value = res.data
}

const fetchMyCourses = async () => {
    const res = await getMyCourses()
    if (res.success) myCourses.value = res.data
}

const imageSrc = (url: string) => { return url }

const switchTab = async (tab: 'all' | 'my') => {
    activeTab.value = tab
    if (tab === 'my') {
        if (!userStore.isLoggedIn) {
            await login()
            if (!userStore.isLoggedIn) return
        }
        fetchMyCourses()
    }
}

const handleBuy = async (course: Course) => {
    if (!userStore.isLoggedIn) {
        await login()
        if (!userStore.isLoggedIn) return
    }
    selectedCourse.value = course
    showPay.value = true
}

const onPaid = () => {
    fetchMyCourses()
}

const goLearn = (course: Course) => {
    if (course.url) {
        window.open(course.url, '_blank')
    }
}

onMounted(() => {
    fetchAllCourses()
    if (userStore.isLoggedIn) {
        fetchMyCourses()
    }
    if (route.query.tab === 'my') {
        switchTab('my')
    }
    const outTradeNo = route.query.out_trade_no as string
    if (outTradeNo) {
        handlePayCallback(outTradeNo)
    }
})

const handlePayCallback = async (outTradeNo: string) => {
    try {
        const res = await confirmPay(outTradeNo)
        if (res.code === 200) {
            const status = res.data?.status || res.data
            if (status === 'TRADE_SUCCESS' || status === 'TRADE_FINISHED') {
                ElMessage.success('支付成功')
                sessionStorage.setItem('payResult', JSON.stringify({ success: true, orderId: outTradeNo }))
                fetchMyCourses()
                switchTab('my')
            } else {
                ElMessage.warning('支付处理中，请稍后查看')
            }
        } else {
            ElMessage.error('确认支付失败')
        }
    } catch {
        ElMessage.error('确认支付失败')
    }
}
</script>

<style>

</style>