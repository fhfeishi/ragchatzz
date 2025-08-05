// src/components/SideBar.tsx
import React from 'react';
import { useChatStore } from '../stores/chatStore';
import dayjs from 'dayjs';
import { PlusIcon } from '@heroicons/react/24/outline';

const SideBar: React.FC = () => {
  const { conversations, activeId, setActive, addConversation } = useChatStore();

  // 分组
  const now = dayjs();
  const groups = {
    today: conversations.filter(c => dayjs(c.ts).isSame(now, 'day')),
    week: conversations.filter(
      c =>
        dayjs(c.ts).isAfter(now.subtract(7, 'day')) &&
        !dayjs(c.ts).isSame(now, 'day')
    ),
    earlier: conversations.filter(c => dayjs(c.ts).isBefore(now.subtract(7, 'day'))),
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button onClick={addConversation} className="new-btn">
          <PlusIcon className="w-5 h-5" />
          新建对话
        </button>
      </div>

      <nav className="sidebar-nav">
        {Object.entries(groups).map(([key, list]) =>
          list.length ? (
            <section key={key}>
              <h3>{key === 'today' ? '今天' : key === 'week' ? '7天内' : '更早'}</h3>
              <ul>
                {list.map(c => (
                  <li
                    key={c.id}
                    className={c.id === activeId ? 'active' : ''}
                    onClick={() => setActive(c.id)}
                  >
                    {c.title}
                  </li>
                ))}
              </ul>
            </section>
          ) : null
        )}
      </nav>
    </aside>
  );
};

export default SideBar;