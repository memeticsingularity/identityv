<template>
  <div class="container" v-if="character">
    <div class="breadcrumb">
      <router-link to="/characters">&larr; 返回角色图鉴</router-link>
    </div>

    <div class="profile">
      <img :src="character.avatar" :alt="character.name" class="big-avatar" />
      <div class="profile-info">
        <h1 class="name">{{ character.name }}</h1>
        <div class="en-name">{{ character.englishName }}</div>
        <div class="tags-row">
          <span class="badge camp" :class="character.camp">{{ campText }}</span>
          <span class="badge role">{{ character.role }}</span>
          <span class="badge diff" v-if="character.difficulty > 0">难度 {{ character.difficulty }}</span>
        </div>
        <div class="release">上线日期：{{ character.releaseDate }}</div>
      </div>
    </div>

    <div class="detail-tabs">
      <button
        v-for="t in availableTabs"
        :key="t.key"
        :class="['tab', { active: activeTab === t.key }]"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="detail-content">
      <!-- 背景 -->
      <section v-if="activeTab === 'background'">
        <h2>背景故事</h2>
        <p class="story-text">{{ character.background }}</p>

        <div v-if="character.stories && character.stories.length" class="story-list">
          <h3>角色剧情节点</h3>
          <div
            v-for="(story, idx) in character.stories"
            :key="idx"
            class="story-item"
          >
            <div class="story-title">{{ story.title }}</div>
            <div class="story-body">{{ story.content }}</div>
          </div>
        </div>
      </section>

      <!-- 技能 -->
      <section v-if="activeTab === 'abilities'">
        <h2>外在特质 / 技能</h2>
        <div class="ability-list">
          <div
            v-for="(ab, idx) in character.abilities"
            :key="idx"
            class="ability-item"
          >
            <div class="ability-name">{{ ab.name }}</div>
            <div class="ability-desc">{{ ab.desc }}</div>
          </div>
        </div>
      </section>

      <!-- 天赋 -->
      <section v-if="activeTab === 'talents'">
        <h2>推荐天赋</h2>
        <div class="talent-tags">
          <span v-for="t in character.talents" :key="t" class="talent-tag">{{ t }}</span>
        </div>
      </section>

      <!-- 标签 -->
      <section v-if="activeTab === 'tags'">
        <h2>角色标签</h2>
        <div class="talent-tags">
          <span v-for="t in character.tags" :key="t" class="talent-tag">{{ t }}</span>
        </div>
      </section>

      <!-- 关联分析 -->
      <section v-if="activeTab === 'analyses'">
        <h2>关联剧情分析</h2>
        <div v-if="relatedAnalyses.length" class="analysis-links">
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
        <p v-else class="empty-tip">暂无关联的剧情分析文章。</p>
      </section>
    </div>
  </div>

  <div class="container" v-else>
    <p>角色不存在</p>
    <router-link to="/characters">返回列表</router-link>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import characters from '../data/characters.json'
import analyses from '../data/analyses.json'

const props = defineProps({
  id: { type: String, required: true },
})

const character = computed(() => characters.find((c) => c.id === props.id))
const campText = computed(() => {
  const map = { survivor: '求生者', hunter: '监管者', npc: 'NPC' }
  return map[character.value?.camp] || '其他'
})

const relatedAnalyses = computed(() => {
  if (!character.value) return []
  return analyses.filter((a) => a.relatedCharacters.includes(character.value.id))
})

const baseTabs = [
  { key: 'background', label: '背景与剧情' },
  { key: 'abilities', label: '技能' },
  { key: 'talents', label: '天赋' },
  { key: 'tags', label: '标签' },
  { key: 'analyses', label: '关联分析' },
]

const availableTabs = computed(() => {
  return baseTabs.filter((t) => {
    if (t.key === 'abilities') return character.value?.abilities?.length > 0
    if (t.key === 'talents') return character.value?.talents?.length > 0
    return true
  })
})

const activeTab = ref('background')
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
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
}

.big-avatar {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  background: #1a1510;
}

.profile-info {
  flex: 1;
}

.name {
  font-size: 28px;
  color: var(--accent-gold);
  margin-bottom: 4px;
}

.en-name {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.tags-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
}

.badge.camp.survivor {
  background: #2c4a2c;
  color: #a8d5a2;
}

.badge.camp.hunter {
  background: #4a2c2c;
  color: #d5a2a2;
}

.badge.camp.npc {
  background: #3a3a4a;
  color: #c5c5d5;
}

.badge.role {
  background: #3a3228;
  color: var(--text-main);
}

.badge.diff {
  background: #2a2a2a;
  color: var(--text-muted);
}

.release {
  font-size: 13px;
  color: var(--text-muted);
}

.detail-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.tab {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 8px 14px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.tab:hover {
  background: var(--bg-hover);
}

.tab.active {
  background: var(--accent-gold);
  color: #1a1510;
  font-weight: bold;
}

.detail-content section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
}

.detail-content h2 {
  font-size: 18px;
  color: var(--accent-gold);
  margin-bottom: 12px;
}

.story-text {
  color: var(--text-muted);
  line-height: 1.8;
}

.story-list {
  margin-top: 20px;
}

.story-list h3 {
  font-size: 16px;
  color: var(--text-main);
  margin-bottom: 12px;
}

.story-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #1a1510;
  border-radius: 8px;
}

.story-title {
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 6px;
}

.story-body {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.ability-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ability-item {
  padding: 12px;
  background: #1a1510;
  border-radius: 8px;
}

.ability-name {
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 4px;
}

.ability-desc {
  color: var(--text-muted);
  font-size: 14px;
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

.empty-tip {
  color: var(--text-muted);
  font-size: 14px;
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
