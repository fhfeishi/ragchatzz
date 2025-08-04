// main.ts（应用入口）
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import naive from 'naive-ui'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(naive)
  .mount('#app')