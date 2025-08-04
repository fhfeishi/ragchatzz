// stores/layout.ts（侧边栏折叠）
import { defineStore } from 'pinia'
export const useLayoutStore = defineStore('layout', {
  state: () => ({ sidebarCollapsed: false }),
  actions: { toggle() { this.sidebarCollapsed = !this.sidebarCollapsed } }
})