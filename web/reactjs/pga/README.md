# Next.js React

```bash 
pga/
├── app/            # App Router 核心目录（页面和路由）
│   ├── layout.tsx         # 全局布局
│   ├── page.tsx           # 默认首页（如 / 路由）
│   ├── chat/
│   │   ├── page.tsx       # 聊天主页面
│   │   └── loading.tsx    # 加载状态（骨架屏）
│   ├── api/               # API Routes（可选，用于代理请求）
│   │   └── chat/route.ts   # 处理 POST 请求到后端 LLM 接口
│   └── not-found.tsx       # 404 页面
│
├── components/     # 全局可复用组件（建议放 app 外或使用 components 库）
│   ├── ui/            # 通用 UI 组件（Button, Card, Input）
│   ├── chat/
│   │   ├── MessageBubble.tsx  # 消息气泡
│   │   ├── ChatInput.tsx      # 输入框
│   │   ├── ChatHistory.tsx    # 历史记录列表
│   │   └── TypingIndicator.tsx # 正在输入动画
│   └── layout/
│       └── Navbar.tsx
│
├── lib/                # 工具函数、API 客户端、状态管理
│   ├── api-client.ts   # 封装调用后端 API（如 /api/chat）
│   ├── chat-history.ts    # 本地存储聊天记录（localStorage）
│   └── types.ts        # 全局类型定义
│
├── public/          # 静态资源
│   ├── images/
│   │   └── avatar-bot.png
│   └── favicon.ico
│
├── styles/             # 全局样式（可选）
│   └── globals.css
│
├── types/           # 全局类型定义（也可合并到 lib/types.ts）
│   └── index.d.ts
│
├── .env.local          # 环境变量（如 NEXT_PUBLIC_API_URL）
├── next.config.js      # Next.js 配置（可选）
├── tsconfig.json       # TypeScript 配置
├── tailwind.config.ts  # 若使用 Tailwind
├── postcss.config.js   # 若使用 PostCSS
├── package.json
└── README.md

```

- 部署建议
  - Vercel：Next.js 官方平台，一键部署
  - Netlify / AWS / Docker：也可支持，但 Vercel 最佳


