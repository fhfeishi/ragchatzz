import { useState } from 'react'
import { useChatStore } from '@/stores/chat'

export default function ChatInput() {
  const [text, setText] = useState('')
  const addMessage = useChatStore(s => s.addMessage)

  const send = () => {
    if (!text.trim()) return
    addMessage({ role: 'user', content: text, type: 'text' })
    setText('')
    // TODO: 调本地 RAG API，异步 addMessage({ role:'assistant', ... })
  }

  return (
    <div className="border-t p-2 bg-white">
      <textarea
        rows={1}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        placeholder="回车发送，Shift+Enter 换行"
        className="w-full resize-none rounded border p-2"
      />
    </div>
  )
}