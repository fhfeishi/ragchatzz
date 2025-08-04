// stores/chat.ts（Pinia）
import { defineStore } from 'pinia'
import dayjs from 'dayjs'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  type: 'text' | 'image' | 'mixed'
  refs?: string[]
  ts: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  ts: number
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as Conversation[],
    activeId: '' as string
  }),
  getters: {
    active: (s) => s.conversations.find(c => c.id === s.activeId),
    groupedHistories: (s) => {
      const now = dayjs()
      const groups = {
        today: [] as Conversation[],
        week: [] as Conversation[],
        earlier: [] as Conversation[]
      }
      s.conversations.forEach(c => {
        const d = dayjs(c.ts)
        if (d.isSame(now, 'day')) groups.today.push(c)
        else if (d.isAfter(now.subtract(7, 'day'))) groups.week.push(c)
        else groups.earlier.push(c)
      })
      return groups
    }
  },
  actions: {
    newChat() {
      const id = crypto.randomUUID()
      this.conversations.unshift({
        id,
        title: '新对话',
        messages: [],
        ts: Date.now()
      })
      this.activeId = id
    },
    addMessage(msg: Omit<Message, 'id' | 'ts'>) {
      const c = this.active
      if (!c) return
      c.messages.push({ ...msg, id: crypto.randomUUID(), ts: Date.now() })
    }
  }
})