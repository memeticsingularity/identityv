import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { MotionPlugin } from '@vueuse/motion'
import { RecycleScroller } from 'vue-virtual-scroller'
import App from './App.vue'
import router from './router'
import { useAppStore } from './stores/app'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import './assets/style.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.component('RecycleScroller', RecycleScroller)

app.use(pinia)
app.use(router)

const store = useAppStore()

store.init().then(() => {
  app.use(MotionPlugin)
  app.mount('#app')
}).catch((err) => {
  const loading = document.getElementById('loading')
  if (loading) {
    loading.textContent = '数据加载失败，请刷新页面重试'
    loading.style.color = '#c44'
  }
  console.error('Failed to initialize app:', err)
})
