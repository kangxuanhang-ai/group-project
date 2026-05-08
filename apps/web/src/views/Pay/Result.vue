<template>
    <div class="min-h-[60vh] bg-zinc-50/80 flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md w-full mx-4">
            <div v-if="loading" class="space-y-4">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p class="text-zinc-500">正在查询支付结果...</p>
            </div>

            <div v-else-if="success" class="space-y-4">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-zinc-900">支付成功</h2>
                <p class="text-zinc-500">即将跳转到我的课程...</p>
            </div>

            <div v-else class="space-y-4">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-zinc-900">{{ errorMsg }}</h2>
                <button @click="goCourses"
                    class="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors">
                    返回课程页面
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { queryPayStatus } from '@/apis/pay'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const success = ref(false)
const errorMsg = ref('支付失败')

const goCourses = () => {
    router.replace('/courses/index?tab=my')
}

onMounted(async () => {
    const outTradeNo = route.query.out_trade_no as string
    if (!outTradeNo) {
        loading.value = false
        errorMsg.value = '缺少订单参数'
        return
    }

    try {
        const res = await queryPayStatus(outTradeNo)
        if (res.code === 200) {
            const status = res.data?.status || res.data
            if (status === 'TRADE_SUCCESS' || status === 'TRADE_FINISHED') {
                success.value = true
                setTimeout(() => {
                    router.replace('/courses/index?tab=my')
                }, 2000)
            } else if (status === 'NOT_PAY') {
                errorMsg.value = '支付尚未完成，请稍后查看'
            } else {
                errorMsg.value = '支付未成功'
            }
        } else {
            errorMsg.value = '查询支付状态失败'
        }
    } catch {
        errorMsg.value = '查询支付状态失败'
    } finally {
        loading.value = false
    }
})
</script>
