import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { MotionPlugin } from '@vueuse/motion'
import { RecycleScroller } from 'vue-virtual-scroller'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import './assets/style.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.component('RecycleScroller', RecycleScroller)

app.use(pinia)
app.use(router)
app.use(MotionPlugin)
app.mount('#app')
