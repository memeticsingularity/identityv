<template>
  <div class="container" v-if="map">
    <div class="breadcrumb">
      <router-link to="/cryptic-notes">{{ t('backToList') }}</router-link>
    </div>

    <div class="map-header">
      <div class="title-row">
        <h1 class="map-title">
          <span class="direction-label" :class="map.direction">{{ directionLabel(map.direction) }}</span>
          {{ map.name }}
        </h1>
        <button class="locale-switch" @click="toggleLocale">{{ t('localeSwitch') }}</button>
      </div>
      <div class="map-meta">{{ metaText }}</div>
    </div>

    <div class="map-image-wrapper" @click="openLightbox">
      <img :src="map.image" :alt="map.name" class="map-image" />
      <div class="zoom-hint">{{ t('zoomHint') }}</div>
    </div>

    <JiayeLightbox
      :visible="lightboxVisible"
      :image="map.image"
      @close="lightboxVisible = false"
    />
  </div>

  <div class="container" v-else>
    <div class="empty-state">
      <p>{{ t('notFound') }}</p>
      <router-link to="/cryptic-notes">{{ t('backToListLink') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import maps from '../../data/jiaye-maps.json'
import JiayeLightbox from '../../components/JiayeLightbox.vue'
import { useI18n, locale, setLocale } from '../../composables/useI18n.js'
import { jiayeNotesMessages, directionLabels } from '../../locales/jiayeNotes.js'

const props = defineProps({
  id: { type: String, required: true },
})

const { t } = useI18n(jiayeNotesMessages)
const map = computed(() => maps.find((m) => m.id === props.id))
const lightboxVisible = ref(false)

const metaText = computed(() => {
  if (!map.value) return ''
  return t('meta')
    .replace('{number}', padNumber(map.value.number))
    .replace('{description}', map.value.description)
})

function directionLabel(direction) {
  return directionLabels[locale.value]?.[direction] || directionLabels.zh[direction]
}

function openLightbox() {
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
