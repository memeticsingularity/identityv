<template>
  <router-link :to="`/characters/${character.id}`" class="card">
    <img :src="character.avatar" :alt="character.name" class="avatar" />
    <div class="info">
      <div class="name">{{ character.name }}</div>
      <div class="meta">
        <span class="camp" :class="character.camp">{{ campText }}</span>
        <span class="role">{{ character.role }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  character: { type: Object, required: true }
})

const campText = computed(() => {
  const map = { survivor: '求生者', hunter: '监管者', npc: 'NPC' }
  return map[props.character.camp] || '其他'
})
</script>

<style scoped>
.card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  transition: background 0.2s, transform 0.1s;
}

.card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  text-decoration: none;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 6px;
  object-fit: cover;
  background: #1a1510;
}

.info {
  flex: 1;
}

.name {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 4px;
}

.meta {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.camp {
  padding: 2px 8px;
  border-radius: 4px;
  background: #333;
}

.camp.survivor {
  background: #2c4a2c;
  color: #a8d5a2;
}

.camp.hunter {
  background: #4a2c2c;
  color: #d5a2a2;
}

.camp.npc {
  background: #3a3a4a;
  color: #c5c5d5;
}

.role {
  color: var(--text-muted);
}
</style>
