<template>
  <div class="container">
    <h1 class="page-title">角色图鉴</h1>

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
      <CharacterCard
        v-for="char in filteredCharacters"
        :key="char.id"
        :character="char"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CharacterCard from '../../components/CharacterCard.vue'
import { characters } from '../../data/characters/index.js'

const tabs = [
  { label: '全部', value: 'all' },
  { label: '求生者', value: 'survivor' },
  { label: '监管者', value: 'hunter' },
  { label: 'NPC', value: 'npc' },
]

const currentTab = ref('all')

const filteredCharacters = computed(() => {
  if (currentTab.value === 'all') return characters
  return characters.filter((c) => c.type === currentTab.value)
})
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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
</style>
