// components/SideBar
<script setup lang="ts">
import { NButton, NCollapse, NCollapseItem } from 'naive-ui'
import { useChatStore, useLayoutStore } from '@/stores'
const chat = useChatStore()
const layout = useLayoutStore()
</script>

<template>
  <aside
    :class="[
      'bg-gray-100 transition-all flex flex-col',
      layout.sidebarCollapsed ? 'w-0 p-0 overflow-hidden' : 'w-64 p-3'
    ]"
  >
    <n-button @click="chat.newChat()" class="mb-2 w-full">新建对话</n-button>

    <n-collapse>
      <n-collapse-item title="今天" name="today">
        <div v-for="c in chat.groupedHistories.today" :key="c.id"
             @click="chat.activeId = c.id"
             class="cursor-pointer truncate p-1 hover:bg-blue-100 rounded"
        >{{ c.title }}</div>
      </n-collapse-item>
      <n-collapse-item title="7天内" name="week">
        <div v-for="c in chat.groupedHistories.week" :key="c.id"
             @click="chat.activeId = c.id"
             class="cursor-pointer truncate p-1 hover:bg-blue-100 rounded"
        >{{ c.title }}</div>
      </n-collapse-item>
      <n-collapse-item title="更早" name="earlier">
        <div v-for="c in chat.groupedHistories.earlier" :key="c.id"
             @click="chat.activeId = c.id"
             class="cursor-pointer truncate p-1 hover:bg-blue-100 rounded"
        >{{ c.title }}</div>
      </n-collapse-item>
    </n-collapse>

    <n-button @click="layout.toggle()" class="mt-auto">
      {{ layout.sidebarCollapsed ? '展开' : '收起' }}
    </n-button>
  </aside>
</template>