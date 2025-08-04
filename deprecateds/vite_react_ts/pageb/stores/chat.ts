import { create } from 'zustand'
import dayjs from 'dayjs'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  type: 'text' | 'image' | 'mixed'
  refs?: string[]
  ts: number
}
export type Conversation = {
  id: string
  title: string
  messages: Message[]
  ts: number
}

type ChatStore = {
  conversations: Conversation[]
  activeId: string
  groupedHistories: {
    today: Conversation[]
    week: Conversation[]
    earlier: Conversation[]
  }
  newChat: () => void
  addMessage: (msg: Omit<Message, 'id' | 'ts'>) => void
  setActive: (id: string) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeId: '',
  groupedHistories: { today: [], week: [], earlier: [] },
  newChat() {
    const id = crypto.randomUUID()
    const conv: Conversation = {
      id,
      title: '新对话',
      messages: [],
      ts: Date.now()
    }
    set(state => ({
      conversations: [conv, ...state.conversations],
      activeId: id
    }))
    get().group()
  },
  setActive(id) {
    set({ activeId: id })
  },
  addMessage(msg) {
    set(state => {
      const conv = state.conversations.find(c => c.id === state.activeId)
      if (!conv) return state
      conv.messages.push({ ...msg, id: crypto.randomUUID(), ts: Date.now() })
      return { conversations: [...state.conversations] }
    })
  },
  group() {
    const now = dayjs()
    const map = { today: [], week: [], earlier: [] } as any
    get().conversations.forEach(c => {
      const d = dayjs(c.ts)
      if (d.isSame(now, 'day')) map.today.push(c)
      else if (d.isAfter(now.subtract(7, 'day'))) map.week.push(c)
      else map.earlier.push(c)
    })
    set({ groupedHistories: map })
  }
}))