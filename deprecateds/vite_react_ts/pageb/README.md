# React 18 + Vite + TypeScript + Zustand

- 主界面按钮（带动画） → 点击进入对话
- 对话界面：
  – 侧边栏（可收起、历史会话按「今天 / 7 天内 / 更早」分组、新建会话）
  – 主窗口（文本 / 图片 / 引用结构、回车发送）
  – 全局状态用 Zustand（无 Provider 嵌套，精准订阅）

```bash
npm create vite@latest react-rag-chat --template react-ts
cd react-rag-chat
npm i
npm i zustand react-router-dom @heroicons/react dayjs clsx tailwindcss
npx tailwindcss init -p
```
tailwind.config.js 里启 JIT（默认即可）。

目录速览
```css
src/
 ├─ main.tsx     # 主入口 main.tsx
 ├─ App.tsx      # 首页 Home.tsx
 ├─ router.tsx   # 路由 router.tsx
 ├─ stores/      # 全局状态 store — Zustand
 │   ├─ chat.ts   
 │   └─ layout.ts
 ├─ pages/
 │   ├─ Home.tsx
 │   └─ Chat.tsx    # 对话页 Chat.tsx
 ├─ components/
 │   ├─ SideBar.tsx  # 侧边栏 SideBar.tsx
 │   ├─ Message.tsx  # 单条消息 Message.tsx
 │   └─ ChatInput.tsx  # 输入框 ChatInput.tsx
 └─ types.d.ts

```



运行 & 构建
```bash
npm run dev          # http://localhost:5173
npm run build        # dist/ 静态产物
# 把 dist 丢 Nginx 或 serve -s dist 即可上线。
```


