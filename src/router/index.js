import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home/index.vue'
import CharacterListView from '../views/CharacterList/index.vue'
import CharacterDetailView from '../views/CharacterDetail/index.vue'
import StoryListView from '../views/StoryList/index.vue'
import MapListView from '../views/MapList/index.vue'
import MapDetailView from '../views/MapDetail/index.vue'
import AnalysisListView from '../views/AnalysisList/index.vue'
import AnalysisDetailView from '../views/AnalysisDetail/index.vue'
import RechargeView from '../views/Recharge/index.vue'
import GachaView from '../views/Gacha/index.vue'
import ProfileView from '../views/Profile/index.vue'
import CollectionView from '../views/Collection/index.vue'

/**
 * 路由配置表
 * - props: true 表示将路由参数作为 props 传给组件（用于详情页）
 */
const routes = [
  // ===== 首页 =====
  { path: '/', name: 'Home', component: HomeView },

  // ===== 角色图鉴 =====
  { path: '/characters', name: 'CharacterList', component: CharacterListView },
  { path: '/characters/:id', name: 'CharacterDetail', component: CharacterDetailView, props: true },

  // ===== 剧情收录 =====
  { path: '/stories', name: 'StoryList', component: StoryListView },

  // ===== 地图 =====
  { path: '/maps', name: 'MapList', component: MapListView },
  { path: '/maps/:id', name: 'MapDetail', component: MapDetailView, props: true },

  // ===== 剧情分析 =====
  { path: '/analyses', name: 'AnalysisList', component: AnalysisListView },
  { path: '/analyses/:id', name: 'AnalysisDetail', component: AnalysisDetailView, props: true },

  // ===== 氪金抽卡 =====
  { path: '/recharge', name: 'Recharge', component: RechargeView },
  { path: '/gacha', name: 'Gacha', component: GachaView },

  // ===== 收藏图鉴 =====
  { path: '/collection', name: 'Collection', component: CollectionView },

  // ===== 个人中心 =====
  { path: '/profile', name: 'Profile', component: ProfileView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
