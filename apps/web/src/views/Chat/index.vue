<template>
    <div class="w-[1200px] mx-auto flex mt-10">
        <Conversations @onGetRole="getRole" />
        <Bubble :list="list" @onSendMessage="sendMessage" />
    </div>
</template>
<script setup lang="ts">
import Conversations from './components/Conversations.vue';
import Bubble from './components/Bubble.vue';
import { useUserStore } from '@/stores/user';
import {ref} from 'vue'
import { getChatHistory } from '@/apis/chat';
import type { ChatRoleType, ChatMessageList, ChatDto ,ChatMessage} from '@en/common/chat';
import { sse, CHAT_URL } from '@/apis/sse';

const userStore = useUserStore();
const userId = userStore.user?.id;
const list = ref<ChatMessageList>([])
const role=ref<ChatRoleType>('normal')
const getRole = async (params: ChatRoleType) => {
    role.value = params
  const res = await getChatHistory(userId!, params)
  list.value = res.data
}

const sendMessage = (message: string) => {
  // 1. 添加用户消息到列表
  list.value.push({ role: 'human', content: message });

  // 2. 先添加一个空的 AI 消息占位
  list.value.push({ role: 'ai', content: '' });

  // 3. 调用 SSE 接口
  sse<ChatMessage, ChatDto>(
    CHAT_URL,
    "POST",
    { role: role.value, content: message, userId: userId! },
    (data) => {
      // 4. 收到数据片段时，更新最后一条 AI 消息
      list.value[list.value.length - 1].content += data.content;
    }
  );
};

</script>