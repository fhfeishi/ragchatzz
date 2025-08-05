#### 前端： react typescript css
```css 
# react_ts_css
fontend-A/
    ├── src/
    │   ├── components/
    │   │   ├── AssistantBubble.tsx      // 聊天气泡组件
    │   │   ├── MarkdownRenderer.tsx     // Markdown 渲染器
    │   │   └── SideBar.tsx              // 侧边栏
    │   ├── pages/
    │   │   ├── Chat.tsx                 // 聊天页面

    │   ├── stores/
    │   │   ├── chatStore.ts             // 聊天状态管理 (使用 Zustand) 

    │   ├── styles/
    │   │   ├── bubble.css               // todo 聊天气泡样式
    
    │   ├── App.tsx        
    │   ├── index.tsx      
    │   ├── styles.css     
    │   └── types.ts
    ├── public/ 
    │   ├── images/       // 可能会用到的图标、图片之类的

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

