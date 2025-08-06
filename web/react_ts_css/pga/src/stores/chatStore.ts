// src/stores/chatStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation, Message } from '../types';

// 一个简单的模拟函数，用于根据用户的第一条消息生成会话标题
// 在实际应用中，这里可以调用 AI API 来生成更精准的标题
const generateTitle = (userMessage: string): string => {
  // 这里可以根据消息内容进行关键词提取或简单的规则匹配
  const lowerMsg = userMessage.toLowerCase();
  
  if (lowerMsg.includes('灵巧手') || lowerMsg.includes('robot hand')) {
    return '关于灵巧手技术的讨论';
  } else if (lowerMsg.includes('专利') || lowerMsg.includes('patent')) {
    return '专利信息查询';
  } else if (lowerMsg.includes('腾讯') || lowerMsg.includes('tencent')) {
    return '腾讯 Robotics X 实验室';
  } else if (lowerMsg.includes('电机') || lowerMsg.includes('motor')) {
    return '电机与传动技术';
  } else {
    // 默认返回消息的前10个字 + 省略号
    return userMessage.length > 10 ? userMessage.slice(0, 10) + '...' : userMessage;
  }
};

export const useChatStore = create<{
  conversations: Conversation[];
  activeId: string | null;
  addConversation: () => void;
  setActive: (id: string) => void;
  addMessage: (id: string, msg: Omit<Message, 'id'>) => void;
  updateSessionTitle: (id: string, newTitle: string) => void; // 新增：更新会话标题
  autoGenerateTitle: (conversationId: string) => void; // 新增：自动为会话生成标题
}>()(
  persist(
    (set, get) => ({
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

          // 将新消息加入会话
          const newMessage = { ...msg, id: crypto.randomUUID() };
          conv.messages.push(newMessage);

          // 检查是否是用户的第一条消息，如果是，则尝试自动生成标题
          const userMessages = conv.messages.filter(m => m.role === 'user');
          if (userMessages.length === 1 && msg.role === 'user') {
            get().autoGenerateTitle(id); // 调用自动生成标题
          }

          return { conversations: [...s.conversations] };
        });
      },

      // 新增：更新指定会话的标题
      updateSessionTitle(id, newTitle) {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, title: newTitle } : conv
          ),
        }));
      },

      // 新增：为指定会话自动生成标题
      autoGenerateTitle(conversationId) {
        set((state) => {
          const conv = state.conversations.find(c => c.id === conversationId);
          if (!conv || conv.title !== '新会话') return state; // 仅当标题为默认值时才生成

          const firstUserMessage = conv.messages
            .filter(m => m.role === 'user')
            .sort((a, b) => a.ts - b.ts) // 按时间排序
            .map(m => m.content)[0]; // 获取第一条用户消息内容

          if (firstUserMessage) {
            const newTitle = generateTitle(firstUserMessage);
            return {
              conversations: state.conversations.map(c =>
                c.id === conversationId ? { ...c, title: newTitle } : c
              )
            };
          }

          return state; // 如果没有用户消息，则不更新
        });
      }
    }),
    { name: 'chat-history' }
  )
);