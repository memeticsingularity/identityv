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
          <img :src="m.thumbnail" :alt="m.name" loading="lazy" />
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.map-card {
  display: block;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  transition: background 0.2s, transform 0.2s, border-color 0.2s;
}

.map-card:hover {
  background: var(--bg-hover);
  transform: translateY(-3px);
  border-color: var(--accent-gold);
  text-decoration: none;
}

.thumb-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  aspect-ratio: 4 / 3;
  background: #1a1510;
}

.thumb-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.number-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  min-width: 28px;
  text-align: center;
  background: var(--accent-gold);
  color: #1a1510;
  font-size: 13px;
  font-weight: bold;
  padding: 4px 6px;
  border-radius: 4px;
}

.card-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.direction-tag {
  flex-shrink: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid;
  font-weight: bold;
}

.direction-tag.right {
  color: #c46b5a;
  border-color: rgba(196, 107, 90, 0.5);
  background: rgba(196, 107, 90, 0.1);
}

.direction-tag.left {
  color: #5a9ec4;
  border-color: rgba(90, 158, 196, 0.5);
  background: rgba(90, 158, 196, 0.1);
}

.direction-tag.south {
  color: #7ab88a;
  border-color: rgba(122, 184, 138, 0.5);
  background: rgba(122, 184, 138, 0.1);
}

.direction-tag.north {
  color: #9e7ab8;
  border-color: rgba(158, 122, 184, 0.5);
  background: rgba(158, 122, 184, 0.1);
}

.map-name {
  font-size: 15px;
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
