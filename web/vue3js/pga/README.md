# Vue 3 + TypeScript + Vite + Vue Router + Pinia 


```css
pga/
├── src/
│   ├── assets/                  # 静态资源（图片、字体）
│   │   └── logo.png
│   │
│   ├── components/              # 全局可复用组件
│   │   ├── chat/
│   │   │   ├── MessageBubble.vue    # 消息气泡
│   │   │   ├── ChatInput.vue        # 输入框
│   │   │   ├── ChatHistory.vue      # 历史记录列表
│   │   │   └── TypingIndicator.vue  # 正在输入动画
│   │   └── ui/
│   │       ├── Button.vue
│   │       └── Card.vue
│   │
│   ├── views/                   # 页面级组件（路由视图）
│   │   ├── HomeView.vue         # 首页
│   │   └── ChatView.vue         # 聊天主页面
│   │
│   ├── router/                  # 路由配置
│   │   └── index.ts
│   │
│   ├── stores/                  # Pinia 状态管理
│   │   └── useChatStore.ts      # 管理聊天记录、loading 状态等
│   │
│   ├── services/                # API 服务层
│   │   └── api-client.ts        # 封装调用后端 LLM 接口
│   │
│   ├── types/                   # 全局类型定义
│   │   └── index.ts             # 如 MessageType, ChatSession 等
│   │
│   ├── utils/                   # 工具函数
│   │   └── storage.ts           # localStorage 操作
│   │
│   ├── styles/
│   │   └── globals.css          # 全局样式（或 SCSS）
│   │
│   ├── App.vue                  # 根组件
│   └── main.ts                  # 入口文件
│
├── public/                      # 静态资源（不经过构建）
│   ├── favicon.ico
│   └── robots.txt
│
├── env.d.ts                     # 环境变量类型声明
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
├── tailwind.config.ts           # 若使用 Tailwind
├── postcss.config.js
├── .eslintrc.cjs                # ESLint
├── .prettierrc                  # Prettier
├── .env                         # 环境变量
├── .gitignore
├── index.html
├── package.json
└── README.md
```

