- 主界面：一个按钮（带动画） → 点击进入对话界面
- 对话界面：
  – 侧边栏（可收起、历史会话按时间分组、新建对话按钮）
  – 主对话窗口（支持文本 / 图片 / 引用结构、回车发送）

```bash
npm create vite@latest vue-rag-chat -- --template vue-ts
cd vue-rag-chat
npm i
npm i vue-router@4 pinia @vueuse/core dayjs
# UI 用 Naive UI（你也可以换 Element Plus）
npm i naive-ui

```


#### 目录结构（src 内）
```css
src/
 ├─ main.ts
 ├─ App.vue
 ├─ router/
 │   └─ index.ts
 ├─ stores/
 │   ├─ chat.ts      // Pinia 对话 store
 │   └─ layout.ts    // 侧边栏折叠状态
 ├─ views/
 │   ├─ Home.vue     // 主界面按钮
 │   └─ Chat.vue     // 对话界面
 ├─ components/
 │   ├─ SideBar.vue
 │   └─ Message.vue  // 单条消息渲染
 └─ types/
     └─ index.ts

```

```bash
npm run build
# dist 目录丢到 Nginx 或 `python -m http.server 8000`

```

