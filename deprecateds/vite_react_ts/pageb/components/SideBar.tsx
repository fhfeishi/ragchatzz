import { useChatStore, useLayoutStore } from '@/stores'
import { PlusIcon, ChevronDoubleLeftIcon } from '@heroicons/react/24/outline'

const groups = [
  { key: 'today', label: '今天' },
  { key: 'week', label: '7 天内' },
  { key: 'earlier', label: '更早' }
]

export default function SideBar() {
  const { collapsed, toggle } = useLayoutStore()
  const { newChat, setActive, groupedHistories } = useChatStore()

  return (
    <aside
      className={`bg-gray-100 transition-all flex flex-col overflow-hidden
        ${collapsed ? 'w-0' : 'w-64'} p-3 space-y-3`}
    >
      <button
        onClick={newChat}
        className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm text-white"
      >
        <PlusIcon className="h-4 w-4" /> 新建对话
      </button>

      {groups.map(g => (
        <div key={g.key}>
          <h4 className="font-semibold text-sm mb-1">{g.label}</h4>
          {groupedHistories[g.key as keyof typeof groupedHistories].map(c => (
            <div
              key={c.id}
              onClick={() => setActive(c.id)}
              className="truncate p-1 rounded hover:bg-blue-100 cursor-pointer"
            >
              {c.title}
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={toggle}
        className="mt-auto flex items-center gap-1 text-sm text-gray-600"
      >
        <ChevronDoubleLeftIcon className="h-4 w-4" />
        {collapsed ? '展开' : '收起'}
      </button>
    </aside>
  )
}