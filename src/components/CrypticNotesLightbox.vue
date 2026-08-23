<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="lightbox-overlay" @click="close">
        <div class="lightbox-content" @click.stop>
          <button class="lightbox-close" @click="close">×</button>
          <img :src="image" alt="放大查看" class="lightbox-image" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  image: { type: String, default: '' },
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.visible) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 12px;
}

.lightbox-content {
  position: relative;
  max-width: 98vw;
  max-height: 96vh;
}

.lightbox-image {
  max-width: 96vw;
  max-height: 92vh;
  object-fit: contain;
  border-radius: 4px;
  display: block;
}

.lightbox-close {
  position: fixed;
  top: 12px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: var(--text-main);
  font-size: 40px;
  line-height: 1;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}

.lightbox-close:hover {
  color: var(--accent-gold);
  background: rgba(0, 0, 0, 0.8);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
