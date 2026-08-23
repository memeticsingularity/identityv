<script setup>
import { Icon } from '@iconify/vue'

const modules = [
  {
    to: '/characters',
    title: '角色图鉴',
    desc: '求生者与监管者资料、技能、推演剧情',
    icon: 'ep:user-filled',
    color: '#c49b3c',
    bg: 'rgba(196, 155, 60, 0.08)',
    glow: 'rgba(196, 155, 60, 0.15)',
  },
  {
    to: '/maps',
    title: '地图',
    desc: '全地图点位与机制说明',
    icon: 'ep:map-location',
    color: '#5a9e8f',
    bg: 'rgba(90, 158, 143, 0.08)',
    glow: 'rgba(90, 158, 143, 0.15)',
  },
  {
    to: '/cryptic-notes',
    title: '加页手记',
    desc: '地图侧门识别与楼层平面图速查',
    icon: 'ep:notebook',
    preview: '/assets/cryptic-notes/hard/thumbs/01-thumb.png',
    color: '#7a9eb8',
    bg: 'rgba(122, 158, 184, 0.08)',
    glow: 'rgba(122, 158, 184, 0.15)',
  },
  {
    to: '/stories',
    title: '剧情收录',
    desc: '角色推演、活动剧情、生日信与主线时间线',
    icon: 'ep:collection',
    color: '#9e7ab8',
    bg: 'rgba(158, 122, 184, 0.08)',
    glow: 'rgba(158, 122, 184, 0.15)',
  },
  {
    to: '/analyses',
    title: '剧情分析',
    desc: '剧情深度解读与关联分析',
    icon: 'ep:data-analysis',
    color: '#7ab88a',
    bg: 'rgba(122, 184, 138, 0.08)',
    glow: 'rgba(122, 184, 138, 0.15)',
  },
  {
    to: '/recharge',
    title: '回声充值',
    desc: '回声充值记录与累计统计',
    icon: 'ep:wallet-filled',
    color: '#c46b5a',
    bg: 'rgba(196, 107, 90, 0.08)',
    glow: 'rgba(196, 107, 90, 0.15)',
  },
  {
    to: '/gacha',
    title: '珍宝抽取',
    desc: '珍宝抽取模拟与概率展示',
    icon: 'ep:gift-filled',
    color: '#b8a87a',
    bg: 'rgba(184, 168, 122, 0.08)',
    glow: 'rgba(184, 168, 122, 0.15)',
  },
  {
    to: '/collection',
    title: '收藏图鉴',
    desc: '个人收藏与图鉴管理',
    icon: 'ep:star-filled',
    color: '#7a8ab8',
    bg: 'rgba(122, 138, 184, 0.08)',
    glow: 'rgba(122, 138, 184, 0.15)',
  },
]
</script>

<template>
  <div class="container home">
    <section class="hero">
      <div class="hero-glow" />
      <h1>第五人格 Wiki</h1>
      <p class="subtitle">本地剧情与资料收录站</p>
      <div class="hero-line" />
    </section>

    <section class="quick-links">
      <router-link
        v-for="(m, i) in modules"
        :key="m.to"
        :to="m.to"
        class="link-card"
        :style="{ '--m-color': m.color, '--m-bg': m.bg, '--m-glow': m.glow, '--delay': i * 0.05 + 's' }"
      >
        <div class="card-icon" :class="{ preview: m.preview }">
          <img v-if="m.preview" :src="m.preview" alt="" class="card-preview" />
          <Icon v-else :icon="m.icon" width="22" height="22" />
        </div>
        <div class="card-body">
          <div class="link-title">{{ m.title }}</div>
          <div class="link-desc">{{ m.desc }}</div>
        </div>
        <div class="card-arrow">
          <Icon icon="ep:arrow-right" width="16" height="16" />
        </div>
      </router-link>
    </section>

    <section class="intro">
      <p>欢迎访问第五人格 Wiki，核心聚焦剧情收录，同时提供角色图鉴、地图、充值统计等实用工具。</p>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding-top: 40px;
  padding-bottom: 64px;
}

/* ===== Hero ===== */
.hero {
  position: relative;
  text-align: center;
  margin-bottom: 48px;
  padding: 24px 0;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 360px;
  height: 180px;
  background: radial-gradient(ellipse, rgba(196, 155, 60, 0.12) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.hero h1 {
  position: relative;
  font-size: 42px;
  font-weight: 700;
  color: var(--accent-gold);
  margin-bottom: 10px;
  letter-spacing: 2px;
  z-index: 1;
}

.subtitle {
  position: relative;
  color: var(--text-muted);
  font-size: 15px;
  z-index: 1;
}

.hero-line {
  position: relative;
  width: 48px;
  height: 2px;
  background: var(--accent-gold);
  margin: 16px auto 0;
  border-radius: 1px;
  opacity: 0.5;
  z-index: 1;
}

/* ===== Quick Links ===== */
.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
}

.link-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  overflow: hidden;
  opacity: 0;
  transform: translateY(12px);
  animation: fadeInUp 0.5s ease forwards;
  animation-delay: var(--delay, 0s);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.link-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 90% 50%, var(--m-glow), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.link-card:hover {
  transform: translateY(-3px);
  text-decoration: none;
  border-color: var(--m-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.link-card:hover::before {
  opacity: 1;
}

.card-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--m-bg);
  border: 1px solid color-mix(in srgb, var(--m-color) 20%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--m-color);
  transition: background 0.25s ease, transform 0.25s ease;
  overflow: hidden;
}

.card-icon.preview {
  padding: 0;
  background: #1a1510;
}

.card-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.link-card:hover .card-icon {
  background: color-mix(in srgb, var(--m-color) 15%, transparent);
  transform: scale(1.08);
}

.card-body {
  min-width: 0;
  flex: 1;
}

.link-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 5px;
  transition: color 0.2s ease;
}

.link-card:hover .link-title {
  color: var(--m-color);
}

.link-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

.card-arrow {
  flex-shrink: 0;
  color: var(--text-muted);
  opacity: 0.4;
  transform: translateX(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;
}

.link-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--m-color);
}

/* ===== Intro ===== */
.intro {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.8;
  opacity: 0;
  animation: fadeInUp 0.5s ease 0.4s forwards;
}

.intro p {
  margin: 0;
}
</style>
