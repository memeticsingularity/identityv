<template>
  <div class="container home">
    <section class="hero">
      <h1>第五人格 Wiki</h1>
      <p class="subtitle">本地剧情与资料收录站</p>
    </section>

    <section class="quick-links">
      <router-link to="/characters" class="link-card">
        <div class="link-title">角色图鉴</div>
        <div class="link-desc">求生者与监管者资料、技能、推演剧情</div>
      </router-link>
      <router-link to="/stories" class="link-card">
        <div class="link-title">剧情收录</div>
        <div class="link-desc">角色推演、活动剧情、生日信与主线时间线</div>
      </router-link>
    </section>

    <section class="intro">
      <h2>关于本站</h2>
      <p>
        这是一个基于本地 mock 数据维护的第五人格资料站，核心聚焦于
        <strong>剧情收录</strong>，同时兼顾角色图鉴等 gameplay 内容。
        所有数据均存储在 <code>src/data/</code> 目录下，可自由编辑扩展。
      </p>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding-top: 32px;
}

.hero {
  text-align: center;
  margin-bottom: 40px;
}

.hero h1 {
  font-size: 36px;
  color: var(--accent-gold);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-muted);
  font-size: 16px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.link-card {
  display: block;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  transition: background 0.2s, transform 0.1s;
}

.link-card:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  text-decoration: none;
}

.link-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 6px;
}

.link-desc {
  font-size: 14px;
  color: var(--text-muted);
}

.intro {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
}

.intro h2 {
  font-size: 18px;
  color: var(--accent-gold);
  margin-bottom: 12px;
}

.intro p {
  color: var(--text-muted);
  line-height: 1.8;
}

.intro strong {
  color: var(--text-main);
}

.intro code {
  background: #1a1510;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: var(--accent-gold);
}
</style>
