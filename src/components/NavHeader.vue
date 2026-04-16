<template>
  <header class="nav-header">
    <div class="container nav-inner">
      <router-link to="/" class="logo">第五人格 Wiki</router-link>
      <nav class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/characters">角色图鉴</router-link>
        <router-link to="/maps">地图</router-link>
        <router-link to="/stories">剧情收录</router-link>
        <router-link to="/analyses">剧情分析</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
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
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: var(--accent-gold);
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  color: var(--text-muted);
  font-size: 15px;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--text-main);
  text-decoration: none;
}
</style>
