<template>
  <NavHeader />
  <main class="main-content">
    <router-view />
  </main>
</template>

<script setup>
import NavHeader from './components/NavHeader.vue'
</script>

<style scoped>
.main-content {
  padding-top: 24px;
  padding-bottom: 48px;
  min-height: calc(100vh - 64px);
}
</style>
