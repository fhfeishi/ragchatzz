// router/index.ts（路由配置）
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Chat from '@/views/Chat.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/chat', component: Chat }
  ]
})