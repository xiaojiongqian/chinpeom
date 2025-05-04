import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import en from './locales/en'
import es from './locales/es'
import ja from './locales/ja'
import fr from './locales/fr'
import de from './locales/de'
import { checkResourceFiles } from './utils/resourceChecker'
import './assets/theme.css'
import './assets/main.css'

// 检查资源文件
checkResourceFiles().then(result => {
  if (!result.success) {
    console.error('资源文件检查失败:', result.errors)
    alert('应用资源文件加载失败，请检查控制台获取详细信息。')
  }
})

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en': en,
    'es': es,
    'ja': ja,
    'fr': fr,
    'de': de
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app') 