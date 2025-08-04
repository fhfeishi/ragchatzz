import type { Message as M } from '@/stores/chat'

export default function Message({ msg }: { msg: M }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-md rounded bg-white p-2 shadow"
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {msg.type === 'image' ? (
          <img src={msg.content} alt="img" className="rounded" />
        ) : (
          <>{msg.content}</>
        )}
        {msg.refs && (
          <div className="mt-1 text-xs text-gray-500">
            引用：{msg.refs.join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}