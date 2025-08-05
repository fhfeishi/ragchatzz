import React, { useState } from 'react';
import SideBar from './components/SideBar';
import Chat from './pages/Chat';
import {
  PlusIcon,
  Bars3Icon,
  ChevronDoubleLeftIcon,
} from '@heroicons/react/24/outline';
import { useChatStore } from './stores/chatStore';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app">
      {/* 顶部栏：按钮 + 标题 */}
      <header className="app-header">
        <div className="header-left">
          <button
            className="icon-btn"
            onClick={() => useChatStore.getState().addConversation()}
            title="新建会话"
          >
            <PlusIcon className="w-5 h-5" />
          </button>

          <button
            className="icon-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
          >
            {sidebarOpen ? (
              <ChevronDoubleLeftIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>
        </div>

        <h1 className="header-title">本地知识库智能体</h1>
      </header>

      {/* 主体：侧边栏 + 聊天区 */}
      <div className="app-body">
        {sidebarOpen && <SideBar />}
        <main className="chat-center">
          <Chat />
        </main>
      </div>
    </div>
  );
}

export default App;