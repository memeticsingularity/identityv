<template>
  <div class="container">
    <h1 class="page-title">地图与场景</h1>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab', { active: currentTab === tab.value }]"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="grid">
      <router-link
        v-for="map in filteredMaps"
        :key="map.id"
        :to="`/maps/${map.id}`"
        class="map-card"
      >
        <div class="map-name">{{ map.name }}</div>
        <div class="map-type">{{ typeText(map.type) }}</div>
        <div class="map-desc">{{ map.description }}</div>
        <div class="map-features">
          <span v-for="f in map.features" :key="f" class="feature-tag">{{ f }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import maps from '../../data/maps.json'

const tabs = [
  { label: '全部', value: 'all' },
  { label: '竞技地图', value: 'map' },
  { label: '剧情场景', value: 'scene' },
]

const currentTab = ref('all')

const filteredMaps = computed(() => {
  if (currentTab.value === 'all') return maps
  return maps.filter((m) => m.type === currentTab.value)
})

function typeText(type) {
  return type === 'map' ? '竞技地图' : '剧情场景'
}
</script>

<style scoped>
.page-title {
  font-size: 24px;
  margin-bottom: 16px;
  color: var(--accent-gold);
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tab:hover {
  background: var(--bg-hover);
}

.tab.active {
  background: var(--accent-gold);
  color: #1a1510;
  border-color: var(--accent-gold);
  font-weight: bold;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.map-card {
  display: block;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  transition: background 0.2s, transform 0.1s;
}

.map-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  text-decoration: none;
}

.map-name {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 4px;
}

.map-type {
  font-size: 12px;
  color: var(--accent-gold);
  margin-bottom: 8px;
}

.map-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 10px;
  line-height: 1.6;
}

.map-features {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.feature-tag {
  font-size: 12px;
  padding: 3px 8px;
  background: #1a1510;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
}
</style>
