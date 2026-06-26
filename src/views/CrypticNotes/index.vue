<template>
  <div class="container">
    <div class="page-header">
      <div class="title-wrap">
        <h1 class="page-title">{{ t('pageTitle') }}</h1>
        <button class="locale-switch" @click="toggleLocale">{{ t('localeSwitch') }}</button>
      </div>
      <p class="page-subtitle">{{ t('pageSubtitle') }}</p>
    </div>

    <div class="toolbar">
      <div class="tabs">
        <button
          v-for="d in directions"
          :key="d.value"
          :class="['tab', { active: currentDirection === d.value }]"
          @click="currentDirection = d.value"
        >
          {{ d.label }}
        </button>
      </div>
      <div class="search">
        <input
          v-model="searchKeyword"
          type="text"
          :placeholder="t('searchPlaceholder')"
          class="search-input"
        />
      </div>
    </div>

    <div class="grid">
      <router-link
        v-for="m in filteredMaps"
        :key="m.id"
        :to="`/cryptic-notes/${m.id}`"
        class="map-card"
      >
        <div class="thumb-wrapper">
          <img :src="m.image" :alt="m.name" loading="lazy" />
          <span class="number-badge">{{ padNumber(m.number) }}</span>
        </div>
        <div class="card-info">
          <span class="direction-tag" :class="m.direction">{{ directionLabel(m.direction) }}</span>
          <div class="map-name">{{ m.name }}</div>
        </div>
      </router-link>
    </div>

    <div v-if="!filteredMaps.length" class="empty">{{ t('empty') }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import maps from '../../data/jiaye-maps.json'
import { useI18n, locale, setLocale } from '../../composables/useI18n.js'
import { jiayeNotesMessages, directionLabels } from '../../locales/jiayeNotes.js'

const { t } = useI18n(jiayeNotesMessages)

const directions = computed(() => [
  { label: t('all'), value: 'all' },
  { label: t('right'), value: 'right' },
  { label: t('left'), value: 'left' },
  { label: t('south'), value: 'south' },
  { label: t('north'), value: 'north' },
])

const currentDirection = ref('all')
const searchKeyword = ref('')

const filteredMaps = computed(() => {
  let result = maps
  if (currentDirection.value !== 'all') {
    result = result.filter((m) => m.direction === currentDirection.value)
  }
  const kw = searchKeyword.value.trim().toLowerCase()
  if (kw) {
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(kw) ||
        m.number.toString().includes(kw) ||
        (m.description && m.description.toLowerCase().includes(kw))
    )
  }
  return result
})

function directionLabel(direction) {
  return directionLabels[locale.value]?.[direction] || directionLabels.zh[direction]
}

function toggleLocale() {
  setLocale(locale.value === 'zh' ? 'en' : 'zh')
}

function padNumber(n) {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.page-title {
  font-size: 24px;
  color: var(--accent-gold);
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.locale-switch {
  flex-shrink: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.locale-switch:hover {
  border-color: var(--accent-gold);
  color: var(--accent-gold);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.search-input {
  width: 220px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--text-main);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--accent-gold);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.map-card {
  display: block;
  background: #2f2820;
  border: 1px solid #4a3f34;
  border-radius: 12px;
  padding: 14px;
  transition: background 0.2s, transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.map-card:hover {
  background: #3a3228;
  transform: translateY(-3px);
  border-color: var(--accent-gold);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  text-decoration: none;
}

.thumb-wrapper {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 14px;
  background: #3a3228;
  line-height: 0;
}

.thumb-wrapper img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}

.number-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  min-width: 32px;
  text-align: center;
  background: var(--accent-gold);
  color: #1a1510;
  font-size: 14px;
  font-weight: bold;
  padding: 5px 7px;
  border-radius: 5px;
}

.card-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.direction-tag {
  flex-shrink: 0;
  font-size: 13px;
  padding: 3px 9px;
  border-radius: 5px;
  border: 1px solid;
  font-weight: bold;
}

.direction-tag.right {
  color: #e07a6a;
  border-color: rgba(224, 122, 106, 0.6);
  background: rgba(224, 122, 106, 0.12);
}

.direction-tag.left {
  color: #6ab4e0;
  border-color: rgba(106, 180, 224, 0.6);
  background: rgba(106, 180, 224, 0.12);
}

.direction-tag.south {
  color: #8fd69e;
  border-color: rgba(143, 214, 158, 0.6);
  background: rgba(143, 214, 158, 0.12);
}

.direction-tag.north {
  color: #b996d4;
  border-color: rgba(185, 150, 212, 0.6);
  background: rgba(185, 150, 212, 0.12);
}

.map-name {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
  font-size: 14px;
}

@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
