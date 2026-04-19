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

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/characters', name: 'CharacterList', component: CharacterListView },
  { path: '/characters/:id', name: 'CharacterDetail', component: CharacterDetailView, props: true },
  { path: '/stories', name: 'StoryList', component: StoryListView },
  { path: '/maps', name: 'MapList', component: MapListView },
  { path: '/maps/:id', name: 'MapDetail', component: MapDetailView, props: true },
  { path: '/analyses', name: 'AnalysisList', component: AnalysisListView },
  { path: '/analyses/:id', name: 'AnalysisDetail', component: AnalysisDetailView, props: true },
  { path: '/recharge', name: 'Recharge', component: RechargeView },
  { path: '/gacha', name: 'Gacha', component: GachaView },
  { path: '/profile', name: 'Profile', component: ProfileView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
