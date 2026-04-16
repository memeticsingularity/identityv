import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CharacterListView from '../views/CharacterListView.vue'
import CharacterDetailView from '../views/CharacterDetailView.vue'
import StoryListView from '../views/StoryListView.vue'
import MapListView from '../views/MapListView.vue'
import MapDetailView from '../views/MapDetailView.vue'
import AnalysisListView from '../views/AnalysisListView.vue'
import AnalysisDetailView from '../views/AnalysisDetailView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/characters', name: 'CharacterList', component: CharacterListView },
  { path: '/characters/:id', name: 'CharacterDetail', component: CharacterDetailView, props: true },
  { path: '/stories', name: 'StoryList', component: StoryListView },
  { path: '/maps', name: 'MapList', component: MapListView },
  { path: '/maps/:id', name: 'MapDetail', component: MapDetailView, props: true },
  { path: '/analyses', name: 'AnalysisList', component: AnalysisListView },
  { path: '/analyses/:id', name: 'AnalysisDetail', component: AnalysisDetailView, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
