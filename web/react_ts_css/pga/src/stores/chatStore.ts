// src/stores/chatStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation, Message } from '../types';

export const useChatStore = create<{
  conversations: Conversation[];
  activeId: string | null;
  addConversation: () => void;
  setActive: (id: string) => void;
  addMessage: (id: string, msg: Omit<Message, 'id'>) => void;
}>()(
  persist(
    (set) => ({
      conversations: [],
      activeId: null,
      addConversation() {
        const conv: Conversation = {
          id: crypto.randomUUID(),
          title: '新会话',
          messages: [],
          ts: Date.now(),
        };
        set((s) => ({
          conversations: [conv, ...s.conversations],
          activeId: conv.id,
        }));
      },
      setActive(id) {
        set({ activeId: id });
      },
      addMessage(id, msg) {
        set((s) => {
          const conv = s.conversations.find((c) => c.id === id);
          if (!conv) return s;
          conv.messages.push({ ...msg, id: crypto.randomUUID() });
          return { conversations: [...s.conversations] };
        });
      },
    }),
    { name: 'chat-history' }
  )
);