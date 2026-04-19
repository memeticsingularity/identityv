<template>
  <div class="container">
    <h1 class="page-title">剧情分析</h1>

    <div class="category-filter">
      <button
        v-for="c in categories"
        :key="c"
        :class="['filter-btn', { active: currentCategory === c }]"
        @click="currentCategory = c"
      >
        {{ c }}
      </button>
    </div>

    <div class="analysis-list">
      <router-link
        v-for="a in filteredAnalyses"
        :key="a.id"
        :to="`/analyses/${a.id}`"
        class="analysis-card"
      >
        <div class="analysis-header">
          <div class="analysis-title">{{ a.title }}</div>
          <div class="analysis-category">{{ a.category }}</div>
        </div>
        <div class="analysis-summary">{{ a.summary }}</div>
        <div class="analysis-meta">
          <span v-for="tag in a.tags" :key="tag" class="meta-tag">{{ tag }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import analyses from '../../data/analyses.json'

const categories = ['全部', '地图考据', '事件分析', '民俗考据', '角色分析', '主线解读']
const currentCategory = ref('全部')

const filteredAnalyses = computed(() => {
  if (currentCategory.value === '全部') return analyses
  return analyses.filter((a) => a.category === currentCategory.value)
})
</script>

<style scoped>
.page-title {
  font-size: 24px;
  margin-bottom: 16px;
  color: var(--accent-gold);
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: var(--bg-hover);
}

.filter-btn.active {
  background: var(--accent-gold);
  color: #1a1510;
  border-color: var(--accent-gold);
  font-weight: bold;
}

.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-card {
  display: block;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  transition: background 0.2s, transform 0.1s;
}

.analysis-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  text-decoration: none;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.analysis-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-main);
}

.analysis-category {
  font-size: 12px;
  color: var(--accent-gold);
}

.analysis-summary {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 10px;
  line-height: 1.6;
}

.analysis-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.meta-tag {
  font-size: 12px;
  padding: 3px 8px;
  background: #1a1510;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
}
</style>
