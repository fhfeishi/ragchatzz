
```css
pgc/
├── src/
│   ├── app/
│   │   ├── App.tsx     # 顶层布局与路由(目前单页)
│   │   └── main.tsx    # 入口
│   ├── assets/         # 需要在代码里 import / require
│   │   ├── icons/      # 图标
│   │   └── images/     # 静态图片，打包时由 Vite 处理为 URL
│   ├── components/     # 纯 UI，无业务；可被多 feature 复用
│   │   ├── chat/
│   │   │   ├── AssistantBubble/
│   │   │   │   ├── AssistantBubble.tsx
│   │   │   │   └── AssistantBubble.module.css
│   │   │   ├── MarkdownRenderer/
│   │   │   │   ├── MarkdownRenderer.tsx
│   │   │   │   └── MarkdownRenderer.module.css
│   │   │   ├── ChatInput/
│   │   │   │   └── ChatInput.tsx
│   │   │   └── index.ts        # chat 组件聚合导出
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarGroup.tsx
│   │   │   ├── SidebarItem.tsx
│   │   │   └── Sidebar.module.css
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   └── Modal.tsx
│   │   └── index.ts            # 根组件桶⼦⽂件
│   ├── features/
│   │   └── chat/        # 包含 业务逻辑 + 页面，与 UI 组件解耦。
│   │       ├── pages/
│   │       │   └── ChatPage.tsx        # 页面骨架
│   │       ├── hooks/
│   │       │   └── useChatHistory.ts   # 封装本地持久化+ 分页加载
│   │       └── index.ts                
│   ├── hooks/
│   │   ├── useToggle.ts    # 布尔开关
│   │   └── useOutsideClick.ts  # 监听点击非元素区域触发Sidebar、Modal
│   ├── stores/                 # (Zustand)
│   │   ├── chat.store.ts       # conversations、currentId、
│   │   └── ui.store.ts         # sidebarOpen, modal等 UI 层状态。
│   ├── utils/
│   │   ├── date.ts             # ⽇期分组与格式化  
│   │   ├── markdown.ts         # markdown ⽀撑函数 
│   │   └── export.ts           # 导出到 docx / md   
│   ├── styles/
│   │   ├── globals.css         # Reset + 全局样式 
│   │   └── theme.css           # 设计令牌（CSS variables） 
│   └── types/
│       └── index.ts            # 全局 TypeScript 类型（Message, Conversation 等）统一出口
├── public/            # 纯静态访问
│   ├── images/
│   └── favicon.svg
├── tests/
│   ├── unit/       # unit/ 放 hook/store 纯逻辑测试
│   └── e2e/        # e2e/ 用 Playwright 测 UI
├── vite.config.ts | tsconfig.json  # 路径别名、SVG 插件、proxy
├── index.html     # 仅挂载点 + meta，其他资源交给 Vite 注入
└── README.md


```bash
# logs -


# 安装 Vite-SVGR
npm install -D vite-svg-loader @svgr/webpack  # 或  yarn / pnpm

#  React 及其类型（如果你已经装过可跳过）
npm install react react-dom
npm install -D @types/react @types/react-dom   # 仅 TS 项目需要

# Vite 插件
npm install -D @vitejs/plugin-react vite-plugin-svgr
# -D 等同于 --save-dev，表示放到 devDependencies
# 普通运行时包（如 react）不加 -D，放到 dependencies

# 安装 SVGR 插件
npm install -D vite-plugin-svgr@latest

# node出问题 ？？  'path'找不到
npm i -D @types/node

npm run dev

```



```
#### 关键设计原则
- 功能隔离：所有聊天相关逻辑放在 features/chat，实现 页面‑状态‑逻辑 闭环。
- 样式就近：组件级样式采⽤ CSS Modules (*.module.css)，全局 Reset 与主题 token 独⽴在 styles/。
- Barrel 文件：每层建 index.ts 聚合导出，保持导⼊路径简短。
- Hooks / Utils：可复⽤逻辑 (hooks) 与纯函数⼯具 (utils) 分离。
- Assets：图标与图像拆分，保障构建时可单独处理（如 SVG Sprites）。

#### 推荐依赖（package.json）
- zustand —— 轻量状态管理
- react-markdown + remark-gfm —— Markdown 渲染
- file-saver + html-to-docx —— ⽂档导出
- clsx —— 条件 class 组合
- react-router-dom@6 —— 如果后续需要多路由

####   路径别名（tsconfig.json / vite.config.ts）
# vite.config.ts
npm i -D vite-tsconfig-paths


```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@components/*": ["src/components/*"],
      "@features/*": ["src/features/*"],
      "@hooks/*": ["src/hooks/*"],
      "@stores/*": ["src/stores/*"],
      "@utils/*": ["src/utils/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```



