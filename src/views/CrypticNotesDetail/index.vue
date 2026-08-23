<template>
  <div class="container" v-if="map">
    <div class="breadcrumb">
      <router-link :to="`/cryptic-notes/${map.difficulty}`">{{ t('backToList') }}</router-link>
    </div>

    <div class="map-header">
      <div class="title-row">
        <h1 class="map-title">
          <span class="direction-label" :class="map.direction">{{ directionLabel(map.direction) }}</span>
          <span class="difficulty-label" :class="map.difficulty">{{ difficultyLabel(map.difficulty) }}</span>
          {{ map.name }}
        </h1>
        <button class="locale-switch" @click="toggleLocale">{{ t('localeSwitch') }}</button>
      </div>
      <div class="map-meta">{{ metaText }}</div>
    </div>

    <div class="map-image-wrapper" @click="openLightbox">
      <img :src="map.image" :alt="map.name" class="map-image" @error="onImageError" />
      <div v-if="imageError" class="placeholder-overlay">
        <div class="placeholder-content">
          <div class="placeholder-title">{{ t('nightmarePlaceholderTitle') }}</div>
          <div class="placeholder-hint">{{ t('nightmarePlaceholderHint') }}</div>
        </div>
      </div>
      <div class="zoom-hint">{{ t('zoomHint') }}</div>
    </div>

    <CrypticNotesLightbox
      :visible="lightboxVisible"
      :image="map.image"
      @close="lightboxVisible = false"
    />
  </div>

  <div class="container" v-else>
    <div class="empty-state">
      <p>{{ t('notFound') }}</p>
      <router-link to="/cryptic-notes/hard">{{ t('backToListLink') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import maps from '../../data/cryptic-notes-maps.json'
import CrypticNotesLightbox from '../../components/CrypticNotesLightbox.vue'
import { useI18n, locale, setLocale } from '../../composables/useI18n.js'
import { crypticNotesMessages, directionLabels, difficultyLabels } from '../../locales/crypticNotes.js'

const props = defineProps({
  difficulty: { type: String, default: '' },
  id: { type: String, required: true },
})

const { t } = useI18n(crypticNotesMessages)
const map = computed(() => maps.find((m) => m.id === props.id))
const lightboxVisible = ref(false)
const imageError = ref(false)

const metaText = computed(() => {
  if (!map.value) return ''
  return t('meta')
    .replace('{number}', padNumber(map.value.number))
    .replace('{releaseDate}', formatDate(map.value.releaseDate))
    .replace('{description}', map.value.description)
})

function directionLabel(direction) {
  return directionLabels[locale.value]?.[direction] || directionLabels.zh[direction]
}

function difficultyLabel(difficulty) {
  return difficultyLabels[locale.value]?.[difficulty] || difficultyLabels.zh[difficulty]
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function openLightbox() {
  lightboxVisible.value = true
}

function onImageError() {
  imageError.value = true
}

function toggleLocale() {
  setLocale(locale.value === 'zh' ? 'en' : 'zh')
}

function padNumber(n) {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
.breadcrumb {
  margin-bottom: 16px;
}

.breadcrumb a {
  color: var(--text-muted);
  font-size: 14px;
}

.map-header {
  margin-bottom: 20px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.map-title {
  font-size: 24px;
  color: var(--accent-gold);
  display: flex;
  align-items: center;
  gap: 10px;
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

.direction-label {
  flex-shrink: 0;
  font-size: 13px;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid;
  font-weight: bold;
}

.direction-label.right {
  color: #c46b5a;
  border-color: rgba(196, 107, 90, 0.5);
  background: rgba(196, 107, 90, 0.1);
}

.direction-label.left {
  color: #5a9ec4;
  border-color: rgba(90, 158, 196, 0.5);
  background: rgba(90, 158, 196, 0.1);
}

.direction-label.south {
  color: #7ab88a;
  border-color: rgba(122, 184, 138, 0.5);
  background: rgba(122, 184, 138, 0.1);
}

.direction-label.north {
  color: #9e7ab8;
  border-color: rgba(158, 122, 184, 0.5);
  background: rgba(158, 122, 184, 0.1);
}

.difficulty-label {
  flex-shrink: 0;
  font-size: 13px;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid;
  font-weight: bold;
}

.difficulty-label.hard {
  color: var(--accent-gold);
  border-color: rgba(196, 155, 60, 0.5);
  background: rgba(196, 155, 60, 0.12);
}

.difficulty-label.nightmare {
  color: #c95e5e;
  border-color: rgba(201, 94, 94, 0.5);
  background: rgba(201, 94, 94, 0.12);
}

.map-meta {
  font-size: 14px;
  color: var(--text-muted);
}

.map-image-wrapper {
  position: relative;
  background: #2f2820;
  border: 1px solid #4a3f34;
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.map-image-wrapper:hover {
  background: #3a3228;
  border-color: var(--accent-gold);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.map-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
}

.placeholder-overlay {
  position: absolute;
  inset: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(45, 25, 25, 0.92);
  border-radius: 8px;
  pointer-events: none;
}

.placeholder-content {
  text-align: center;
  color: #c95e5e;
}

.placeholder-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.placeholder-hint {
  font-size: 14px;
  color: #a36666;
}

.zoom-hint {
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: rgba(26, 21, 16, 0.85);
  color: var(--text-main);
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 6px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.map-image-wrapper:hover .zoom-hint {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
}

.empty-state p {
  margin-bottom: 12px;
}

@media (max-width: 640px) {
  .map-title {
    font-size: 20px;
    flex-wrap: wrap;
  }
}
</style>
