<template>
  <div class="panel">
    <button
      type="button"
      class="panel-header"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span class="panel-title">{{ title }}</span>
      <span class="panel-arrow" :class="{ expanded }">▾</span>
    </button>
    <div v-show="expanded" class="panel-body">
      <div class="panel-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  defaultExpanded: { type: Boolean, default: true },
})

const expanded = ref(props.defaultExpanded)
</script>

<style scoped>
.panel {
  background: #1a1510;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.panel-header:hover {
  background: #231d17;
}

.panel-arrow {
  font-size: 12px;
  color: var(--text-muted);
  transition: transform 0.2s;
}

.panel-arrow.expanded {
  transform: rotate(180deg);
}

.panel-body {
  border-top: 1px solid var(--border);
}

.panel-inner {
  padding: 12px 14px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-line;
}
</style>
