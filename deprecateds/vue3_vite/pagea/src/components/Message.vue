// components/Message.vue（消息组件）
<script setup lang="ts">
import type { Message as M } from '@/stores/chat'
defineProps<{ msg: M }>()
</script>

<template>
  <div class="mb-3">
    <div :class="msg.role === 'user' ? 'text-right' : ''">
      <div class="inline-block p-2 rounded bg-white max-w-md text-left">
        <div v-if="msg.type === 'image'"><img :src="msg.content" class="rounded" /></div>
        <div v-else>{{ msg.content }}</div>
        <div v-if="msg.refs?.length" class="text-xs text-gray-500 mt-1">
          引用：<span v-for="r in msg.refs" :key="r">{{ r }} </span>
        </div>
      </div>
    </div>
  </div>
</template>