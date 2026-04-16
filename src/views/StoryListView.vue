<template>
  <div class="container">
    <h1 class="page-title">剧情收录</h1>

    <div class="story-section">
      <h2>活动剧情</h2>
      <div class="story-grid">
        <div v-for="story in eventStories" :key="story.id" class="story-card">
          <div class="story-header">
            <div class="story-name">{{ story.title }}</div>
            <div class="story-date">{{ story.date }}</div>
          </div>
          <div class="story-desc">{{ story.summary }}</div>
          <div class="story-tags">
            <span v-for="tag in story.tags" :key="tag" class="story-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="story-section">
      <h2>主线与角色剧情</h2>
      <p class="hint">前往角色详情页的「背景与剧情」标签可查看角色推演、生日信等内容。</p>
      <div class="char-story-links">
        <router-link
          v-for="c in charactersWithStories"
          :key="c.id"
          :to="`/characters/${c.id}`"
          class="char-story-item"
        >
          {{ c.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import eventStories from '../data/stories.json'
import { characters } from '../data/characters/index.js'

const charactersWithStories = computed(() =>
  characters.filter((c) => c.stories && c.stories.length > 0)
)
</script>

<style scoped>
.page-title {
  font-size: 24px;
  margin-bottom: 16px;
  color: var(--accent-gold);
}

.story-section {
  margin-bottom: 32px;
}

.story-section h2 {
  font-size: 18px;
  color: var(--text-main);
  margin-bottom: 12px;
}

.story-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.story-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.story-name {
  font-weight: bold;
  color: var(--text-main);
}

.story-date {
  font-size: 13px;
  color: var(--text-muted);
}

.story-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 10px;
  line-height: 1.6;
}

.story-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.story-tag {
  font-size: 12px;
  padding: 3px 8px;
  background: #1a1510;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
}

.hint {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 12px;
}

.char-story-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.char-story-item {
  display: inline-block;
  padding: 8px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-main);
  transition: background 0.2s;
}

.char-story-item:hover {
  background: var(--bg-hover);
  text-decoration: none;
}
</style>
