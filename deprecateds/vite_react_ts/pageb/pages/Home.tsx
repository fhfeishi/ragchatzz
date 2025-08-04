import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function Home() {
  const nav = useNavigate()
  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={() => nav('/chat')}
        className={clsx(
          'rounded bg-blue-500 px-6 py-3 text-white shadow-lg',
          'hover:scale-110 transition-transform animate-bounce'
        )}
      >
        开始对话
      </button>
    </div>
  )
}