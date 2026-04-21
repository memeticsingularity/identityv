<template>
  <div class="container" v-if="map">
    <div class="breadcrumb">
      <router-link to="/maps">&larr; 返回地图列表</router-link>
    </div>

    <div class="profile">
      <div class="profile-info">
        <h1 class="name">{{ map.name }}</h1>
        <div class="type">{{ typeText }}</div>
        <div class="desc">{{ map.description }}</div>
      </div>
    </div>

    <div class="detail-section">
      <h2>背景故事</h2>
      <p class="story-text">{{ map.background }}</p>
    </div>

    <div class="detail-section">
      <h2>特征/地标</h2>
      <div class="talent-tags">
        <span v-for="f in map.features" :key="f" class="talent-tag">{{ f }}</span>
      </div>
    </div>

    <div class="detail-section" v-if="relatedAnalyses.length">
      <h2>关联剧情分析</h2>
      <div class="analysis-links">
        <router-link
          v-for="a in relatedAnalyses"
          :key="a.id"
          :to="`/analyses/${a.id}`"
          class="analysis-item"
        >
          <div class="analysis-title">{{ a.title }}</div>
          <div class="analysis-category">{{ a.category }}</div>
        </router-link>
      </div>
    </div>
  </div>

  <div class="container" v-else>
    <p>地图不存在</p>
    <router-link to="/maps">返回列表</router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import maps from '../../data/maps.json'
import analyses from '../../data/analyses.json'

const props = defineProps({
  id: { type: String, required: true },
})

const map = computed(() => maps.find((m) => m.id === props.id))
const typeText = computed(() => (map.value?.type === 'map' ? '竞技地图' : '剧情场景'))

const relatedAnalyses = computed(() => {
  if (!map.value) return []
  return analyses.filter((a) => map.value.relatedAnalyses.includes(a.id))
})
</script>

<style scoped>
.breadcrumb {
  margin-bottom: 16px;
}

.breadcrumb a {
  color: var(--text-muted);
  font-size: 14px;
}

.profile {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.name {
  font-size: 28px;
  color: var(--accent-gold);
  margin-bottom: 8px;
}

.type {
  font-size: 14px;
  color: var(--accent-gold);
  margin-bottom: 12px;
}

.desc {
  color: var(--text-muted);
  line-height: 1.8;
}

.detail-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
}

.detail-section h2 {
  font-size: 18px;
  color: var(--accent-gold);
  margin-bottom: 12px;
}

.story-text {
  color: var(--text-muted);
  line-height: 1.8;
}

.talent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.talent-tag {
  padding: 6px 12px;
  background: #1a1510;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-main);
}

.analysis-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.analysis-item {
  display: block;
  padding: 12px;
  background: #1a1510;
  border-radius: 8px;
  transition: background 0.2s;
}

.analysis-item:hover {
  background: #2a231c;
  text-decoration: none;
}

.analysis-title {
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 4px;
}

.analysis-category {
  font-size: 13px;
  color: var(--text-muted);
}
</style>
