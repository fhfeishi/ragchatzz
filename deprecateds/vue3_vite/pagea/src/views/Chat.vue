<script setup lang="ts">
import { onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import SideBar from '@/components/SideBar.vue'
import Message from '@/components/Message.vue'

const chat = useChatStore()
onMounted(() => {
  if (!chat.activeId) chat.newChat()
})
</script>

<template>
  <div class="flex h-screen">
    <SideBar />
    <div class="flex-1 flex flex-col bg-gray-50">
      <header class="p-3 border-b">对话标题：{{ chat.active?.title }}</header>
      <main class="flex-1 overflow-y-auto p-4">
        <Message v-for="msg in chat.active?.messages" :key="msg.id" :msg="msg" />
      </main>
      <!-- 输入框 -->
      <ChatInput />
    </div>
  </div>
</template>