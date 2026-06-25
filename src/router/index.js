import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('../views/Home/index.vue')
const CharacterListView = () => import('../views/CharacterList/index.vue')
const CharacterDetailView = () => import('../views/CharacterDetail/index.vue')
const StoryListView = () => import('../views/StoryList/index.vue')
const MapListView = () => import('../views/MapList/index.vue')
const MapDetailView = () => import('../views/MapDetail/index.vue')
const AnalysisListView = () => import('../views/AnalysisList/index.vue')
const AnalysisDetailView = () => import('../views/AnalysisDetail/index.vue')
const RechargeView = () => import('../views/Recharge/index.vue')
const GachaView = () => import('../views/Gacha/index.vue')
const ProfileView = () => import('../views/Profile/index.vue')
const CollectionView = () => import('../views/Collection/index.vue')
const JiayeNotesView = () => import('../views/JiayeNotes/index.vue')
const JiayeNotesDetailView = () => import('../views/JiayeNotesDetail/index.vue')

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

  // ===== 加页手记 Cryptic Notes =====
  { path: '/cryptic-notes', name: 'CrypticNotes', component: JiayeNotesView },
  { path: '/cryptic-notes/:id', name: 'CrypticNotesDetail', component: JiayeNotesDetailView, props: true },

  // ===== 个人中心 =====
  { path: '/profile', name: 'Profile', component: ProfileView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 兜底：当懒加载 chunk 因部署更新而 404 时，自动刷新页面重新加载最新版本
router.onError((error, to) => {
  if (
    error.message?.includes('Failed to fetch dynamically imported module') ||
    error.message?.includes('Loading chunk') ||
    error.message?.includes('Loading CSS chunk')
  ) {
    window.location.href = to.fullPath
  }
})

export default router
