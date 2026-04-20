<!-- ===== 顶部导航栏 ===== -->
<!-- 全站通用，包含主站导航链接 + 右侧个人中心入口（显示当前回声数） -->
<template>
  <header class="nav-header">
    <div class="container nav-inner">
      <!-- Logo -->
      <router-link to="/" class="logo">第五人格 Wiki</router-link>

      <!-- 主导航链接 -->
      <nav class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/characters">角色图鉴</router-link>
        <router-link to="/maps">地图</router-link>
        <router-link to="/stories">剧情收录</router-link>
        <router-link to="/analyses">剧情分析</router-link>
        <router-link to="/recharge">回声充值</router-link>
        <router-link to="/gacha">珍宝抽取</router-link>
        <router-link to="/collection">收藏图鉴</router-link>
      </nav>

      <!-- 个人中心入口（显示当前回声余额） -->
      <router-link to="/profile" class="profile-link">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em"><path fill="currentColor" d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512zm320 320v-96a96 96 0 0 0-96-96H288a96 96 0 0 0-96 96v96a32 32 0 1 1-64 0v-96a160 160 0 0 1 160-160h448a160 160 0 0 1 160 160v96a32 32 0 1 1-64 0z"/></svg>
        <span v-if="store.echoes > 0" class="echoes-badge">{{ store.echoes }}</span>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { useAppStore } from '../stores/app'

const store = useAppStore()
</script>

<style scoped>
/* ===== 导航栏整体 ===== */
.nav-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: var(--accent-gold);
  white-space: nowrap;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: var(--text-muted);
  font-size: 14px;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--text-main);
  text-decoration: none;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--accent-gold);
  font-size: 14px;
  position: relative;
}

.profile-link:hover {
  text-decoration: none;
}

.echoes-badge {
  background: #8a2c2c;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}
</style>
