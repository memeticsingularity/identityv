<template>
  <div class="page-container">
    <div class="page-header">
      <div class="title-wrap">
        <h1 class="page-title">{{ t('pageTitle') }}</h1>
        <button class="locale-switch" @click="toggleLocale">{{ t('localeSwitch') }}</button>
      </div>
      <p class="page-subtitle">{{ t('pageSubtitle') }}</p>
    </div>

    <div class="difficulty-tabs">
      <button
        class="difficulty-tab hard"
        :class="{ active: currentDifficulty === 'hard' }"
        @click="setDifficulty('hard')"
      >
        {{ difficultyLabel('hard') }}
      </button>
      <button
        class="difficulty-tab nightmare"
        :class="{ active: currentDifficulty === 'nightmare' }"
        @click="setDifficulty('nightmare')"
      >
        {{ difficultyLabel('nightmare') }}
      </button>
    </div>

    <div class="toolbar">
      <div class="compass-tabs">
        <button
          class="compass-tab all"
          :class="{ active: currentDirection === 'all' }"
          @click="currentDirection = 'all'"
        >
          {{ t('all') }}
        </button>
        <button
          class="compass-tab north"
          :class="{ active: currentDirection === 'north' }"
          @click="currentDirection = 'north'"
        >
          {{ t('north') }}
        </button>
        <button
          class="compass-tab south"
          :class="{ active: currentDirection === 'south' }"
          @click="currentDirection = 'south'"
        >
          {{ t('south') }}
        </button>
        <button
          class="compass-tab west"
          :class="{ active: currentDirection === 'left' }"
          @click="currentDirection = 'left'"
        >
          {{ t('left') }}
        </button>
        <button
          class="compass-tab east"
          :class="{ active: currentDirection === 'right' }"
          @click="currentDirection = 'right'"
        >
          {{ t('right') }}
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

    <div class="grid" :class="currentDifficulty">
      <div
        v-for="m in filteredMaps"
        :key="m.id"
        class="map-card"
      >
        <div class="thumb-wrapper" @click="openImage(m.image)">
          <img :src="m.thumbnail" :alt="m.name" loading="lazy" />
          <span class="number-badge">{{ padNumber(m.number) }}</span>
        </div>
        <router-link :to="`/cryptic-notes/${m.difficulty}/${m.id}`" class="card-info">
          <span class="direction-tag" :class="m.direction">{{ directionLabel(m.direction) }}</span>
          <div class="map-name">{{ m.name }}</div>
        </router-link>
      </div>
    </div>

    <div v-if="!filteredMaps.length" class="empty">{{ t('empty') }}</div>

    <JiayeLightbox
      :visible="lightboxVisible"
      :image="lightboxImage"
      @close="lightboxVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import maps from '../../data/jiaye-maps.json'
import JiayeLightbox from '../../components/JiayeLightbox.vue'
import { useI18n, locale, setLocale } from '../../composables/useI18n.js'
import { jiayeNotesMessages, directionLabels, difficultyLabels } from '../../locales/jiayeNotes.js'

const props = defineProps({
  difficulty: { type: String, default: 'hard' },
})

const router = useRouter()
const { t } = useI18n(jiayeNotesMessages)

const VALID_DIFFICULTIES = ['hard', 'nightmare']
const currentDifficulty = computed(() =>
  VALID_DIFFICULTIES.includes(props.difficulty) ? props.difficulty : 'hard'
)

const currentDirection = ref('all')
const searchKeyword = ref('')
const lightboxVisible = ref(false)
const lightboxImage = ref('')

const filteredMaps = computed(() => {
  let result = maps.filter((m) => m.difficulty === currentDifficulty.value)
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

function difficultyLabel(difficulty) {
  return difficultyLabels[locale.value]?.[difficulty] || difficultyLabels.zh[difficulty]
}

function setDifficulty(difficulty) {
  router.push(`/cryptic-notes/${difficulty}`)
}

function openImage(image) {
  lightboxImage.value = image
  lightboxVisible.value = true
}

function toggleLocale() {
  setLocale(locale.value === 'zh' ? 'en' : 'zh')
}

function padNumber(n) {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 24px;
}

@media (min-width: 1920px) {
  .page-container {
    padding: 0 48px;
  }
}

@media (min-width: 2560px) {
  .page-container {
    padding: 0 64px;
  }
}

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
  font-size: 26px;
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
  margin-bottom: 24px;
}

.difficulty-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.difficulty-tab {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s;
  text-align: center;
}

.difficulty-tab:hover {
  background: var(--bg-hover);
}

.difficulty-tab.hard.active {
  background: var(--accent-gold);
  color: #1a1510;
  border-color: var(--accent-gold);
}

.difficulty-tab.nightmare.active {
  background: var(--accent-nightmare, #a13d3d);
  color: #fff;
  border-color: var(--accent-nightmare, #a13d3d);
}

.compass-tabs {
  display: grid;
  grid-template-columns: auto auto auto;
  grid-template-rows: auto auto auto;
  gap: 8px;
  width: fit-content;
  position: relative;
}

.compass-tabs::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, transparent calc(50% - 1px), rgba(196, 155, 60, 0.15) calc(50% - 1px), rgba(196, 155, 60, 0.15) calc(50% + 1px), transparent calc(50% + 1px)),
    linear-gradient(to bottom, transparent calc(50% - 1px), rgba(196, 155, 60, 0.15) calc(50% - 1px), rgba(196, 155, 60, 0.15) calc(50% + 1px), transparent calc(50% + 1px));
  border-radius: 12px;
  pointer-events: none;
  z-index: 0;
}

.compass-tab {
  position: relative;
  z-index: 1;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 8px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 64px;
  text-align: center;
}

.compass-tab:hover {
  background: var(--bg-hover);
  border-color: var(--accent-gold);
}

.compass-tab.active {
  background: var(--accent-gold);
  color: #1a1510;
  border-color: var(--accent-gold);
  font-weight: bold;
}

.compass-tab.all {
  grid-column: 2;
  grid-row: 2;
}

.compass-tab.north {
  grid-column: 2;
  grid-row: 1;
}

.compass-tab.south {
  grid-column: 2;
  grid-row: 3;
}

.compass-tab.west {
  grid-column: 1;
  grid-row: 2;
}

.compass-tab.east {
  grid-column: 3;
  grid-row: 2;
}

.search-input {
  width: 260px;
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
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (min-width: 1200px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
}

@media (min-width: 1920px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }
}

@media (min-width: 2560px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 28px;
  }
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
}

.grid.nightmare .map-card:hover {
  border-color: var(--accent-nightmare, #a13d3d);
  box-shadow: 0 8px 24px rgba(161, 61, 61, 0.25);
}

.thumb-wrapper {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 14px;
  background: #3a3228;
  line-height: 0;
  cursor: zoom-in;
  transition: box-shadow 0.2s;
}

.thumb-wrapper:hover {
  box-shadow: 0 0 0 2px var(--accent-gold);
}

.grid.nightmare .thumb-wrapper:hover {
  box-shadow: 0 0 0 2px var(--accent-nightmare, #a13d3d);
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
  min-width: 34px;
  text-align: center;
  background: var(--accent-gold);
  color: #1a1510;
  font-size: 15px;
  font-weight: bold;
  padding: 5px 7px;
  border-radius: 5px;
}

.card-info {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.card-info:hover {
  text-decoration: none;
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
  .difficulty-tabs {
    width: 100%;
  }

  .difficulty-tab {
    max-width: none;
    padding: 10px 16px;
    font-size: 15px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .compass-tabs {
    margin: 0 auto;
  }

  .compass-tab {
    padding: 6px 12px;
    font-size: 13px;
    min-width: 52px;
  }

  .search-input {
    width: 100%;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
