// ChatInput.vue（回车发送）
<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'

const chat = useChatStore()
const text = ref('')

const send = () => {
  if (!text.value.trim()) return
  chat.addMessage({ role: 'user', content: text.value, type: 'text' })
  text.value = ''
  // TODO: 调用本地 RAG 智能体，异步再把 assistant 消息 push
}
</script>

<template>
  <div class="p-3 bg-white border-t">
    <n-input
      v-model:value="text"
      type="textarea"
      :autosize="{ minRows: 1, maxRows: 4 }"
      placeholder="回车发送，Shift+Enter 换行"
      @keydown.enter.prevent="send"
    />
  </div>
</template>