// src/app/App.tsx


import Logo from '@assets/images/logo.svg?react';   // ← 默认导出 + ?react
import { IconButton } from '@components/ui/Button';
import { Sidebar } from '@components/sidebar/Sidebar';


export default function App() {
  return (
    <div style={{display: 'flex'}}>
      <Sidebar />   {/* ← 左侧抽屉 */}
      <main style={{ flex: 1}}>
        <header className="app-header">
        {/* ① SVG 组件直接当标签用 */}
        <Logo className="h-8 select-none" width={32} height={32} />
        
        {/* ② 标题 */}
        <h1>本地智能体</h1>

        {/* 测试按钮 */}
        <IconButton onClick={() => console.log('new chat')} />
      </header>
    </main>
    </div>
  );
}

