<template>
    <Teleport to="body">
        <Transition name="pay-fade">
            <div v-if="props.show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <!-- 遮罩 -->
                <div class="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" aria-hidden="true" />

                <!-- 弹框 -->
                <div class="relative w-full max-w-md rounded-2xl bg-white shadow-xl shadow-indigo-500/10 border border-zinc-100 overflow-hidden"
                    role="dialog" aria-modal="true" aria-labelledby="pay-dialog-title">
                    <!-- 标题 -->
                    <div class="px-6 pt-6 pb-4 border-b border-zinc-100">
                        <h2 id="pay-dialog-title" class="text-lg font-semibold text-zinc-900">确认支付</h2>
                        <p class="mt-1 text-sm text-zinc-500">请核对课程信息后完成支付</p>
                    </div>
                    <!-- 课程信息（有 course 时展示） -->
                    <div v-if="course" class="p-6 space-y-4">
                        <div class="flex gap-4 rounded-xl bg-zinc-50/80 p-4">
                            <div class="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                {{ course.name?.charAt(0) || '课' }}
                            </div>
                            <div class="min-w-0 flex-1">
                                <h3 class="text-sm font-medium text-zinc-900 line-clamp-2">{{ course.name }}</h3>
                                <p class="mt-1 text-xs text-zinc-500">讲师 {{ course.teacher }}</p>
                            </div>
                        </div>
                        <div
                            class="flex items-center justify-between rounded-xl border border-zinc-100 bg-indigo-50/50 px-4 py-3">
                            <span class="text-sm text-zinc-600">支付金额</span>
                            <span class="text-xl font-bold text-indigo-600">¥{{ course.price }}</span>
                        </div>
                        <!-- 支付剩余时间倒计时（创建订单后显示） -->
                        <div v-if="timeExpire > 0"
                            class="flex flex-col items-center rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
                            <el-countdown title="支付剩余时间" format="HH:mm:ss" :value="timeExpire" @finish="tips" />
                        </div>
                    </div>

                    <!-- 无数据时的占位 -->
                    <div v-else class="p-6 text-center text-sm text-zinc-400">
                        暂无课程信息
                    </div>

                    <!-- 底部按钮 -->
                    <div class="flex gap-3 px-6 pb-6 pt-2">
                        <button type="button"
                            class="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors"
                            @click="close">
                            取消
                        </button>
                        <button type="button"
                            class="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="isPay" @click="onConfirm">
                            {{ isPay ? '支付中...' : '确认支付' }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { Course } from '../../../types/course';
import type { CreatePayDto } from '../../../types/pay';
import { createPay, queryPayStatus } from '@/apis/pay';
import { useSocket } from '../../../hooks/useSocket';

const props = defineProps<{
    show: boolean;
    course: Course | null;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    'paid': [];
}>();

const { getSocket } = useSocket();
const socket = getSocket();
const isPay = ref(false);
const timeExpire = ref(0);
const orderId = ref('');

let visibilityHandler: (() => void) | null = null;

// 监听支付结果事件（WebSocket 推送）
if (socket) {
  socket.on('paymentResult', (data: { success: boolean }) => {
    if (data.success) {
      ElMessage.success({ message: '支付成功', duration: 2000 });
      emit('paid');
      close();
    } else {
      ElMessage.error({ message: '支付失败', duration: 2000 });
    }
  });
}

// 页面可见性变化时轮询支付状态（用户从支付宝页面返回）
const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && orderId.value) {
        await checkPaymentStatus();
    }
};

// 监听其他标签页的支付结果通知
const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'payResult' && e.newValue && orderId.value) {
        const result = JSON.parse(e.newValue);
        if (result.success) {
            ElMessage.success({ message: '支付成功', duration: 2000 });
            emit('paid');
            close();
        }
    }
};

const checkPaymentStatus = async () => {
    try {
        const res = await queryPayStatus(orderId.value);
        if (res.code === 200) {
            const status = res.data?.status || res.data;
            if (status === 'TRADE_SUCCESS' || status === 'TRADE_FINISHED') {
                ElMessage.success({ message: '支付成功', duration: 2000 });
                sessionStorage.setItem('payResult', JSON.stringify({ success: true, orderId: orderId.value }));
                emit('paid');
                close();
            }
        }
    } catch { /* 忽略 */ }
};

onMounted(() => {
    visibilityHandler = handleVisibilityChange;
    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('storage', handleStorageChange);
});

onUnmounted(() => {
    if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
    }
    window.removeEventListener('storage', handleStorageChange);
});

// 提示支付过期
const tips = () => {
    ElMessage.error('支付已过期，请重新支付');
    timeExpire.value = 0;
    isPay.value = false;
    orderId.value = '';
}

// 关闭弹窗
const close = () => {
    emit('update:show', false);
    isPay.value = false;
    timeExpire.value = 0;
    orderId.value = '';
    sessionStorage.removeItem('payResult');
}

// 确认支付
const onConfirm = async () => {
    const body: CreatePayDto = {
        subject: props.course?.name || '',
        body: props.course?.teacher || '',
        total_amount: props.course?.price?.toString() || '',
        courseId: props.course?.id || '',
    };
    try {
        const res = await createPay(body);
        if (res.code == 200) {
            isPay.value = true;
            orderId.value = res.data.orderId;
            const payWindow = window.open('', '_blank');
            if (payWindow) {
                payWindow.document.write(res.data.payUrl);
                payWindow.document.close();
            }
            timeExpire.value = res.data.timeExpire;
        } else {
            ElMessage.error(res.message || '创建支付订单失败');
            isPay.value = false;
        }
    } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || '创建支付订单失败';
        ElMessage.error(msg);
        isPay.value = false;
    }
}
</script>

<style scoped>
.pay-fade-enter-active,
.pay-fade-leave-active {
    transition: opacity 0.2s ease;
}

.pay-fade-enter-from,
.pay-fade-leave-to {
    opacity: 0;
}
</style>