import { useEffect } from 'react'
import { useChatStore } from '@/stores/chat'
import SideBar from '@/components/SideBar'
import Message from '@/components/Message'
import ChatInput from '@/components/ChatInput'

export default function Chat() {
  const { activeId, newChat } = useChatStore()
  useEffect(() => {
    if (!activeId) newChat()
  }, [activeId, newChat])

  const active = useChatStore(s => s.conversations.find(c => c.id === s.activeId))
  if (!active) return null

  return (
    <div className="flex h-screen">
      <SideBar />
      <div className="flex-1 flex flex-col">
        <header className="border-b px-4 py-2 font-bold">{active.title}</header>
        <main className="flex-1 overflow-y-auto p-4 space-y-3">
          {active.messages.map(m => <Message key={m.id} msg={m} />)}
        </main>
        <ChatInput />
      </div>
    </div>
  )
}