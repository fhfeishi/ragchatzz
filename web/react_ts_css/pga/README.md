#### 前端： react typescript css
```css 
# react_ts_css
fontend-A/
    ├── src/
    │   ├── components/
    │   │   ├── AssistantBubble.module.css   
    │   │   ├── AssistantBubble.tsx      // 聊天气泡组件
    │   │   ├── MarkdownRenderer.module.css
    │   │   ├── MarkdownRenderer.tsx     // Markdown 渲染器
    │   │   ├── SessionTitleEditor.tsx   // 会话标题编辑器
    │   │   ├── SideBar.module.css
    │   │   └── SideBar.tsx              // 侧边栏
    │   ├── pages/
    │   │   ├── SidebarTogglePlaceholder.module.css
    │   │   ├── SidebarTogglePlaceholder.tsx  // 侧边栏切换占位符
    │   │   └── Chat.tsx                 // 聊天页面
    │   ├── stores/
    │   │   ├── uiStore.ts               // UI 状态管理 (使用 Zustand)
    │   │   └── chatStore.ts             // 聊天状态管理 (使用 Zustand) 
    │   ├── App.tsx        
    │   ├── index.tsx      
    │   ├── styles.css     // App.tsx 全局样式
    │   └── types.ts
    ├── public/ 
    │   ├── images/       // 可能会用到的图标、图片之类的
    │   └── gkgd/         // background 背景图 如需要
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── vite.config.ts
    └── README.md                         // 项目说明文档
```

参考工作1 [link](https://github.com/zhttyy520/ai-medical-assistant)

- start
```
npm install react react-dom @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react

npm install typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-unicorn eslint-plugin-react-refresh
npm install postcss postcss-cli tailwindcss autoprefixer
npm install react-markdown remark-gfm
```

- answer-fake

