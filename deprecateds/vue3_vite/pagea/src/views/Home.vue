<script setup lang="ts">
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="flex-center h-screen">
    <n-button
      type="primary"
      size="large"
      @click="router.push('/chat')"
      class="animate-bounce hover:scale-110 transition-transform"
    >
      开始对话
    </n-button>
  </div>
</template>