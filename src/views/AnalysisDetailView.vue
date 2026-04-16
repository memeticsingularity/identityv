<template>
  <div class="container" v-if="analysis">
    <div class="breadcrumb">
      <router-link to="/analyses">&larr; 返回分析列表</router-link>
    </div>

    <article class="article">
      <h1 class="article-title">{{ analysis.title }}</h1>
      <div class="article-category">{{ analysis.category }}</div>

      <div class="article-content">
        <p>{{ analysis.content }}</p>
      </div>

      <div class="article-tags">
        <span v-for="tag in analysis.tags" :key="tag" class="article-tag">{{ tag }}</span>
      </div>
    </article>

    <div class="relations" v-if="relatedCharacters.length || relatedMaps.length">
      <h2>相关内容</h2>

      <div class="relation-group" v-if="relatedCharacters.length">
        <h3>关联角色</h3>
        <div class="relation-links">
          <router-link
            v-for="c in relatedCharacters"
            :key="c.id"
            :to="`/characters/${c.id}`"
            class="relation-item"
          >
            {{ c.name }}
          </router-link>
        </div>
      </div>

      <div class="relation-group" v-if="relatedMaps.length">
        <h3>关联地图/场景</h3>
        <div class="relation-links">
          <router-link
            v-for="m in relatedMaps"
            :key="m.id"
            :to="`/maps/${m.id}`"
            class="relation-item"
          >
            {{ m.name }}
          </router-link>
        </div>
      </div>
    </div>
  </div>

  <div class="container" v-else>
    <p>文章不存在</p>
    <router-link to="/analyses">返回列表</router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import analyses from '../data/analyses.json'
import { characters } from '../data/characters/index.js'
import maps from '../data/maps.json'

const props = defineProps({
  id: { type: String, required: true },
})

const analysis = computed(() => analyses.find((a) => a.id === props.id))

const relatedCharacters = computed(() => {
  if (!analysis.value) return []
  return characters.filter((c) => analysis.value.relatedCharacters.includes(c.id))
})

const relatedMaps = computed(() => {
  if (!analysis.value) return []
  return maps.filter((m) => analysis.value.relatedMaps.includes(m.id))
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

.article {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 20px;
}

.article-title {
  font-size: 26px;
  color: var(--accent-gold);
  margin-bottom: 8px;
}

.article-category {
  font-size: 14px;
  color: var(--accent-gold);
  margin-bottom: 16px;
}

.article-content {
  color: var(--text-muted);
  line-height: 1.9;
  font-size: 15px;
  margin-bottom: 16px;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.article-tag {
  padding: 4px 10px;
  background: #1a1510;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-main);
}

.relations {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
}

.relations h2 {
  font-size: 18px;
  color: var(--accent-gold);
  margin-bottom: 16px;
}

.relation-group {
  margin-bottom: 16px;
}

.relation-group:last-child {
  margin-bottom: 0;
}

.relation-group h3 {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.relation-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.relation-item {
  display: inline-block;
  padding: 8px 14px;
  background: #1a1510;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-main);
  transition: background 0.2s;
}

.relation-item:hover {
  background: #2a231c;
  text-decoration: none;
}
</style>
