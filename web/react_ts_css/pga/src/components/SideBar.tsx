// src/components/SideBar.tsx
import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useUiStore } from '@/stores/uiStore';
import dayjs from 'dayjs';
import SideButton from '@/assets/icons/side.svg?react';  // 侧边栏 展开/收起 按钮图标
import NewChat from '@/assets/icons/new_chat.svg?react';  // 新建会话 图标
import Logo from '@/assets/images/logoa.svg?react';   // logo
import styles from './SideBar.module.css';

const SideBar: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const { conversations, activeId, setActive, addConversation } = useChatStore();

  // ---------------- 时间分组 ----------------
  const now = dayjs();
  const groups = {
    today: conversations.filter((c) => dayjs(c.ts).isSame(now, 'day')),
    week: conversations.filter(
      (c) => dayjs(c.ts).isAfter(now.subtract(7, 'day')) && !dayjs(c.ts).isSame(now, 'day')
    ),
    earlier: conversations.filter((c) => dayjs(c.ts).isBefore(now.subtract(7, 'day'))),
  } as const;

  // ---------------- 折叠态 ----------------
  if (!isSidebarOpen) {
    return (
      <aside className={styles.sidebar} data-collapsed="true">
        <div className={styles.collapsedPlaceholder} />
      </aside>
    );
  }

  // ---------------- 展开态 ----------------
  return (
    <aside className={styles.sidebar} data-collapsed="false">
      {/* 顶部：Logo + 标题 + 收起按钮 */}
      <div className={styles.header}>
        <div className={styles.logoRow}>
          <Logo className="w-6 h-6" />
          <h1 className={styles.appTitle}>RAG智能体</h1>
        </div>
        <button className={styles.collapseBtn} onClick={toggleSidebar} title="收起导航">
          <SideButton className="w-5 h-5" />
        </button>
      </div>

      {/* 新建会话 */}
      <div className={styles.actionRow}>
        <button className={styles.newConversationBtn} onClick={addConversation} title="新建会话">
          <NewChat className="w-5 h-5" />
          <span>新建会话</span>
        </button>
      </div>

      {/* 会话列表 */}
      <nav className={styles.nav}>
        {Object.entries(groups).map(([key, list]) =>
          list.length ? (
            <section key={key} className={styles.section}>
              <h3>{key === 'today' ? '今天' : key === 'week' ? '7天内' : '更早'}</h3>
              <ul>
                {list.map((c) => (
                  <li
                    key={c.id}
                    className={`${styles.item} ${c.id === activeId ? styles.active : ''}`}
                    onClick={() => setActive(c.id)}
                    title={c.title}
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