// src/App.tsx
import React, { useState, useEffect } from 'react';
import SideBar from '@/components/SideBar';
import Chat from '@/pages/Chat';
import { useChatStore } from '@/stores/chatStore';
import { useUiStore } from '@/stores/uiStore';
import NewChat from '@/assets/icons/new_chat.svg?react';
import SideButton from '@/assets/icons/side.svg?react';
import '@/styles.css';

const App: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const { conversations, activeId, addConversation, updateSessionTitle } = useChatStore();

  // ---------------- 当前会话标题 ----------------
  const currentSession = conversations.find((c) => c.id === activeId);
  const currentTitle = currentSession?.title || '新会话';
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (currentSession) updateSessionTitle(currentSession.id, newTitle);
  };

  return (
    <div className="app">
      {/* ---------- 顶部智能标题栏 ---------- */}
      <header className="app-header">
        {/* 折叠态：显示两枚按钮 */}
        {!isSidebarOpen && (
          <>
            <button onClick={toggleSidebar} title="展开导航">
              <SideButton className="w-5 h-5" />
            </button>
            <button onClick={addConversation} title="新建会话">
              <NewChat className="w-5 h-5" />
            </button>
          </>
        )}

        {/* 标题输入框（始终可编辑） */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="点击编辑会话标题"
        />
      </header>

      {/* ---------- 主体区域 ---------- */}
      <div className="app-body">
        {isSidebarOpen && <SideBar />}
        <main className="chat-center">
          <Chat />
        </main>
      </div>
    </div>
  );
};

export default App;