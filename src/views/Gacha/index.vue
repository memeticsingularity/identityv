<template>
  <div class="gacha-page">
    <!-- 顶部信息栏 -->
    <div class="info-bar">
      <div class="info-item">
        <el-icon size="20"><Coin /></el-icon>
        <span class="info-label">回声</span>
        <span class="info-value">{{ store.echoes }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">总抽取</span>
        <span class="info-value">{{ store.totalDraws }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">消耗回声</span>
        <span class="info-value">{{ store.totalEchoesSpent }}</span>
      </div>
    </div>

    <!-- 精华池切换 -->
    <div class="pool-selector">
      <span class="pool-label">当前精华：</span>
      <el-cascader
        v-model="selectedPool"
        :options="POOL_CASCADER_OPTIONS"
        :props="{ emitPath: true }"
        filterable
        placeholder="选择赛季和精华"
        style="width: 260px"
        @change="onPoolChange"
      />
    </div>

    <!-- 抽卡区域 -->
    <div class="gacha-area">
      <!-- 光效覆盖层 -->
      <div
        v-if="lightEffect"
        class="light-overlay"
        :class="lightEffect"
      >
        <div class="light-core"></div>
        <div class="light-rays"></div>
        <div class="light-particles">
          <span v-for="n in 12" :key="n" class="particle" :style="particleStyle(n)"></span>
        </div>
      </div>

      <div class="gacha-visual">
        <div class="gacha-orb" :class="{ spinning: isSpinning }">
          <el-icon size="64"><Present /></el-icon>
        </div>
        <p class="gacha-title">
          {{ store.currentPoolInfo.name }}
          <el-popover placement="bottom" :width="420" trigger="hover" popper-class="prob-popover">
            <template #reference>
              <el-icon class="prob-icon" size="18"><InfoFilled /></el-icon>
            </template>
            <div class="prob-popover-inner">
              <h4 class="prob-popover-title">珍宝概率公示</h4>
              <div v-for="row in probData" :key="row.label" class="prob-row">
                <span class="prob-dot" :style="{ backgroundColor: row.color }"></span>
                <span class="prob-name" :style="{ color: row.color }">{{ row.label }}</span>
                <span class="prob-value">{{ row.probText }}</span>
                <span class="prob-desc">{{ row.desc }}</span>
              </div>
            </div>
          </el-popover>
        </p>
        <p class="gacha-sub">开启珍宝，获取稀世时装</p>
      </div>

      <!-- 提示信息 -->
      <div class="tips-panel">
        <p class="tip-line">
          已开启 <strong>{{ store.poolTips.drawCount }}</strong> 件，共获得：
          <span class="tip-gold">{{ store.poolTips.legendaryCount }}</span> 件稀世道具 和
          <span class="tip-purple">{{ store.poolTips.epicCount }}</span> 件奇珍道具
        </p>
        <p class="tip-line">
          再开启 <strong class="tip-purple">{{ store.poolTips.nextEpic }}</strong> 件必得奇珍以上道具
          <span class="tip-divider">|</span>
          再开启 <strong class="tip-gold">{{ store.poolTips.nextLegendary }}</strong> 件必得稀世道具
        </p>
      </div>

      <div class="gacha-actions">
        <el-button
          type="primary"
          size="large"
          :disabled="store.echoes < 96 || isSpinning"
          @click="handleDraw('single')"
        >
          <el-icon><Present /></el-icon>
          开启1个 (96回声)
        </el-button>
        <el-button
          type="danger"
          size="large"
          :disabled="store.echoes < 960 || isSpinning"
          @click="handleDraw('ten')"
        >
          <el-icon><Present /></el-icon>
          开启10个 (960回声)
        </el-button>
      </div>
    </div>

    <!-- 抽卡结果 -->
    <div v-if="lastResult" class="result-area">
      <h3>抽取结果</h3>
      <div class="result-grid" :class="{ ten: lastResult.results.length === 10 }">
        <div
          v-for="(item, idx) in lastResult.results"
          :key="item.id"
          class="result-item"
          :style="{ backgroundColor: RARITY_CONFIG[item.rarity].bg, borderColor: RARITY_CONFIG[item.rarity].color }"
          :class="{ highlight: isHighRarity(item.rarity), pop: showPop && idx < popIndex }"
        >
          <div class="rarity-badge" :style="{ backgroundColor: RARITY_CONFIG[item.rarity].color }">
            {{ RARITY_CONFIG[item.rarity].label }}
          </div>
          <div class="item-name" :style="{ color: RARITY_CONFIG[item.rarity].color }">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>


    <!-- 抽卡记录（可折叠） -->
    <div class="records-section">
      <h3>
        抽卡记录
        <span class="record-count">（{{ currentPoolRecords.length }} 条）</span>
      </h3>

      <div v-if="currentPoolRecords.length === 0" class="empty-tip">当前精华池暂无抽卡记录</div>

      <el-timeline v-else>
        <el-timeline-item
          v-for="record in visibleRecords"
          :key="record.id"
          :type="record.results.some(r => r.rarity === 'legendary') ? 'warning' : record.results.some(r => r.rarity === 'epic') ? 'primary' : ''"
        >
          <div class="record-header">
            <span>{{ record.type === 'ten' ? '十连' : '单抽' }} — {{ record.cost }}回声</span>
            <span class="record-time">{{ store.formatDate(record.timestamp) }}</span>
          </div>
          <div class="record-items">
            <el-tag
              v-for="item in record.results"
              :key="item.id"
              size="small"
              :style="{ backgroundColor: RARITY_CONFIG[item.rarity].bg, color: RARITY_CONFIG[item.rarity].color, borderColor: RARITY_CONFIG[item.rarity].color }"
            >
              {{ item.name }}
            </el-tag>
          </div>
        </el-timeline-item>
      </el-timeline>

      <div v-if="currentPoolRecords.length > COLLAPSE_LIMIT" class="expand-bar">
        <el-button text @click="isExpanded = !isExpanded">
          {{ isExpanded ? '收起记录' : `展开全部 (${currentPoolRecords.length} 条)` }}
          <el-icon>
            <ArrowUp v-if="isExpanded" />
            <ArrowDown v-else />
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore, RARITY_CONFIG, POOL_CASCADER_OPTIONS } from '../../stores/app'
import { Coin, Present, ArrowUp, ArrowDown, InfoFilled } from '@element-plus/icons-vue'

const store = useAppStore()
const isSpinning = ref(false)
const lastResult = ref(null)
const showPop = ref(false)
const popIndex = ref(0)
const isExpanded = ref(false)
const lightEffect = ref(null)
const COLLAPSE_LIMIT = 3

const selectedPool = computed({
  get() {
    const pool = store.currentPoolInfo
    if (!pool) return []
    if (pool.season === 0) return [pool.id]
    return [pool.season, pool.id]
  },
  set(val) {
    if (!val || val.length === 0) return
    const poolId = val[val.length - 1]
    store.switchPool(poolId)
  }
})

function onPoolChange(val) {
  if (!val || val.length === 0) return
  const poolId = val[val.length - 1]
  store.switchPool(poolId)
}

const currentPoolRecords = computed(() => store.currentPool.drawRecords)

const visibleRecords = computed(() => {
  if (isExpanded.value) return currentPoolRecords.value
  return currentPoolRecords.value.slice(0, COLLAPSE_LIMIT)
})

const probData = [
  { label: '稀世', color: '#ff9800', probText: '0.7%', desc: '开启200个必有一个稀世品质道具' },
  { label: '奇珍', color: '#9c27b0', probText: '2.5%', desc: '开启60个必有一个奇珍或更高品质道具' },
  { label: '独特', color: '#2196f3', probText: '15.3%', desc: '开启10个必有一个独特或更高品质道具' },
  { label: '罕见', color: '#4caf50', probText: '49.8%', desc: '常见品质' },
  { label: '普通', color: '#9e9e9e', probText: '31.7%', desc: '最基础品质' },
]

function isHighRarity(rarity) {
  return rarity === 'legendary' || rarity === 'epic'
}

function getHighestRarity(results) {
  const order = ['legendary', 'epic', 'unique', 'rare', 'common']
  for (const r of order) {
    if (results.some(item => item.rarity === r)) return r
  }
  return 'common'
}

function particleStyle(n) {
  const angle = (n / 12) * 360
  const delay = Math.random() * 0.5
  const size = 4 + Math.random() * 5
  return {
    '--rotate': `${angle}deg`,
    animationDelay: `${delay}s`,
    width: `${size}px`,
    height: `${size}px`,
  }
}

async function handleDraw(type) {
  if (isSpinning.value) return
  isSpinning.value = true
  lastResult.value = null
  lightEffect.value = null

  await new Promise(r => setTimeout(r, type === 'ten' ? 2000 : 800))

  const result = store.draw(type)
  if (!result.success) {
    ElMessage?.error?.(result.message) || alert(result.message)
    isSpinning.value = false
    return
  }

  lastResult.value = result.record
  isSpinning.value = false

  // 判断光效
  const highest = getHighestRarity(result.record.results)
  if (highest === 'legendary' || highest === 'epic') {
    lightEffect.value = 'gold'
  } else {
    lightEffect.value = 'blue'
  }

  // 光效持续时间
  const lightDuration = highest === 'legendary' ? 2500 : highest === 'epic' ? 2000 : 1200
  await new Promise(r => setTimeout(r, lightDuration))
  lightEffect.value = null

  // 逐个弹出结果
  showPop.value = false
  popIndex.value = 0
  await new Promise(r => setTimeout(r, 100))
  showPop.value = true
  for (let i = 0; i < result.record.results.length; i++) {
    popIndex.value = i + 1
    await new Promise(r => setTimeout(r, 200))
  }
}
</script>

<style scoped>
.gacha-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.info-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-label {
  color: #a89b8c;
  font-size: 14px;
}

.info-value {
  color: #c9a227;
  font-size: 20px;
  font-weight: bold;
}

.pool-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 24px;
}

.pool-label {
  color: #a89b8c;
  font-size: 14px;
}

.gacha-area {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1a1510, #241e18);
  border: 1px solid var(--border);
  border-radius: 16px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

/* ===== 光效覆盖层 ===== */
.light-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  border-radius: 16px;
}

.light-overlay.blue {
  animation: blueFlash 1.2s ease-out forwards;
}

.light-overlay.gold {
  animation: goldFlash 2s ease-out forwards;
}

.light-core {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  opacity: 0;
}

.blue .light-core {
  background: radial-gradient(circle, rgba(33,150,243,0.8) 0%, transparent 70%);
  box-shadow: 0 0 60px 20px rgba(33,150,243,0.4);
  animation: coreExpand 1.2s ease-out forwards;
}

.gold .light-core {
  background: radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,152,0,0.5) 40%, transparent 70%);
  box-shadow: 0 0 80px 30px rgba(255,215,0,0.5), 0 0 120px 60px rgba(255,152,0,0.2);
  animation: coreExpand 2s ease-out forwards;
}

.light-rays {
  position: absolute;
  width: 200%;
  height: 200%;
  opacity: 0;
}

.blue .light-rays {
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(33,150,243,0.15) 20deg,
    transparent 40deg,
    rgba(33,150,243,0.1) 60deg,
    transparent 80deg,
    rgba(33,150,243,0.15) 100deg,
    transparent 120deg,
    rgba(33,150,243,0.1) 140deg,
    transparent 160deg,
    rgba(33,150,243,0.15) 180deg,
    transparent 200deg,
    rgba(33,150,243,0.1) 220deg,
    transparent 240deg,
    rgba(33,150,243,0.15) 260deg,
    transparent 280deg,
    rgba(33,150,243,0.1) 300deg,
    transparent 320deg,
    rgba(33,150,243,0.15) 340deg,
    transparent 360deg
  );
  animation: raysRotate 1.2s ease-out forwards;
}

.gold .light-rays {
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255,215,0,0.2) 15deg,
    transparent 30deg,
    rgba(255,152,0,0.15) 45deg,
    transparent 60deg,
    rgba(255,215,0,0.2) 75deg,
    transparent 90deg,
    rgba(255,152,0,0.15) 105deg,
    transparent 120deg,
    rgba(255,215,0,0.2) 135deg,
    transparent 150deg,
    rgba(255,152,0,0.15) 165deg,
    transparent 180deg,
    rgba(255,215,0,0.2) 195deg,
    transparent 210deg,
    rgba(255,152,0,0.15) 225deg,
    transparent 240deg,
    rgba(255,215,0,0.2) 255deg,
    transparent 270deg,
    rgba(255,152,0,0.15) 285deg,
    transparent 300deg,
    rgba(255,215,0,0.2) 315deg,
    transparent 330deg,
    rgba(255,152,0,0.15) 345deg,
    transparent 360deg
  );
  animation: raysRotate 2s ease-out forwards;
}

.light-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
}

.blue .particle {
  background: rgba(100,200,255,0.8);
  box-shadow: 0 0 8px rgba(100,200,255,0.6);
  animation: particleBurst 1.2s ease-out forwards;
}

.gold .particle {
  background: rgba(255,230,100,0.9);
  box-shadow: 0 0 10px rgba(255,215,0,0.8), 0 0 20px rgba(255,152,0,0.4);
  animation: particleBurst 2s ease-out forwards;
}

.light-text {
  position: absolute;
  font-size: 28px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,152,0,0.5);
  opacity: 0;
  animation: textFade 2s ease-out forwards;
  z-index: 11;
}

/* 动画关键帧 */
@keyframes blueFlash {
  0% { background: transparent; }
  30% { background: radial-gradient(circle at center, rgba(33,150,243,0.3) 0%, transparent 60%); }
  100% { background: transparent; }
}

@keyframes goldFlash {
  0% { background: transparent; }
  20% { background: radial-gradient(circle at center, rgba(255,215,0,0.4) 0%, rgba(255,152,0,0.2) 30%, transparent 60%); }
  50% { background: radial-gradient(circle at center, rgba(255,215,0,0.3) 0%, rgba(255,152,0,0.15) 30%, transparent 60%); }
  100% { background: transparent; }
}

@keyframes coreExpand {
  0% { transform: scale(0); opacity: 0; }
  30% { transform: scale(1.5); opacity: 1; }
  70% { transform: scale(2); opacity: 0.6; }
  100% { transform: scale(3); opacity: 0; }
}

@keyframes raysRotate {
  0% { transform: rotate(0deg) scale(0.5); opacity: 0; }
  30% { transform: rotate(45deg) scale(1); opacity: 1; }
  70% { transform: rotate(90deg) scale(1.2); opacity: 0.5; }
  100% { transform: rotate(135deg) scale(1.5); opacity: 0; }
}

@keyframes particleBurst {
  0% { transform: rotate(var(--rotate)) translateY(0) scale(0); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: rotate(var(--rotate)) translateY(-120px) scale(1); opacity: 0.8; }
  100% { transform: rotate(var(--rotate)) translateY(-180px) scale(0); opacity: 0; }
}

@keyframes textFade {
  0% { opacity: 0; transform: scale(0.5); }
  30% { opacity: 1; transform: scale(1.1); }
  50% { opacity: 1; transform: scale(1); }
  80% { opacity: 0.5; }
  100% { opacity: 0; transform: scale(1.2); }
}

.gacha-visual {
  margin-bottom: 24px;
}

.gacha-orb {
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #c9a227, #8a6d1a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1510;
  box-shadow: 0 0 40px rgba(201, 162, 39, 0.3);
  transition: transform 0.3s;
}

.gacha-orb.spinning {
  animation: spin 0.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.gacha-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 4px;
}

.gacha-sub {
  color: #a89b8c;
}

.tips-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 20px;
  margin: 0 auto 24px;
  max-width: 560px;
  text-align: left;
}

.tip-line {
  font-size: 14px;
  color: #e8dcc8;
  line-height: 1.8;
}

.tip-line strong {
  color: #c9a227;
}

.tip-gold {
  color: #ff9800;
  font-weight: bold;
}

.tip-purple {
  color: #e040fb;
  font-weight: bold;
}

.tip-divider {
  margin: 0 10px;
  color: #666;
}

.gacha-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.gacha-actions .el-button {
  min-width: 160px;
}

.result-area {
  margin-bottom: 32px;
}

.result-area h3 {
  margin-bottom: 16px;
}

.result-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.result-grid.ten {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  max-width: 600px;
  margin: 0 auto;
}

.result-item {
  width: 100px;
  height: 120px;
  border: 2px solid;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  text-align: center;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s ease;
}

.result-item.pop {
  opacity: 1;
  transform: scale(1);
}

.result-item.highlight {
  animation: glow 1.5s ease-in-out infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 0 10px currentColor; }
  to { box-shadow: 0 0 30px currentColor; }
}

.rarity-badge {
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.item-name {
  font-size: 12px;
  font-weight: bold;
}

.gacha-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.prob-icon {
  color: #a89b8c;
  cursor: pointer;
  transition: color 0.2s;
}

.prob-icon:hover {
  color: #c9a227;
}

.prob-popover-inner {
  padding: 8px;
}

.prob-popover-title {
  margin: 0 0 12px 0;
  font-size: 15px;
  text-align: center;
  color: #e8dcc8;
}

.prob-row {
  display: grid;
  grid-template-columns: 16px 50px 60px 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #3d342b;
  font-size: 13px;
}

.prob-row:last-child {
  border-bottom: none;
}

.prob-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.prob-name {
  font-weight: bold;
}

.prob-value {
  color: #c9a227;
  font-weight: bold;
}

.prob-desc {
  color: #a89b8c;
  font-size: 12px;
  text-align: right;
}

.records-section {
  margin-bottom: 32px;
}

.records-section h3 {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-count {
  font-size: 14px;
  color: #a89b8c;
  font-weight: normal;
}

.empty-tip {
  color: #a89b8c;
  padding: 24px;
  text-align: center;
  background: var(--bg-card);
  border-radius: 8px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: bold;
}

.record-time {
  color: #a89b8c;
  font-size: 12px;
  font-weight: normal;
}

.record-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.expand-bar {
  text-align: center;
  margin-top: 12px;
  padding: 8px;
}
</style>
