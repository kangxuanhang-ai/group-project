<template>
    <div class="p-5 rounded-[5px] w-[256px] bg-purple-50 border border-right-1 border-t-0 border-b-0 border-l-0 border-gray-200">
        <div @click="changeActive(value)" :class="{'bg-purple-300': active === value.id}" class="rounded-[5px] p-2 transition-all duration-300" v-for="value in chatMode" :key="value.id">
            <div class="text-sm  cursor-pointer p-2 px-4 text-gray-700">
                {{ value.label }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getChatMode } from '@/apis/chat'
import type { ChatModeList, ChatMode } from '@en/common/chat';
const emit = defineEmits(['onGetRole'])
const chatMode = ref<ChatModeList>([]) // 消息模式列表
const active = ref<string | null>(null) // 当前激活的id

const changeActive = (value: ChatMode) => {
    active.value = value.id
    emit('onGetRole',value.role)
}

const getChatModeList = async () => {
    const res = await getChatMode()
    chatMode.value = res.data
    active.value = res.data[0].id
    emit('onGetRole',res.data[0].role)
}

onMounted(() => {
    getChatModeList()
})
</script>