<template>
  <div class="profile-page">
    <h2 class="page-title">个人中心</h2>

    <!-- 全局统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <el-icon size="32" color="#c9a227"><Coin /></el-icon>
        <div class="stat-value">{{ store.echoes }}</div>
        <div class="stat-label">当前回声</div>
      </div>
      <div class="stat-card">
        <el-icon size="32" color="#9c27b0"><MagicStick /></el-icon>
        <div class="stat-value">{{ store.shards }}</div>
        <div class="stat-label">当前碎片</div>
      </div>
      <div class="stat-card">
        <el-icon size="32" color="#ff4d4f"><Wallet /></el-icon>
        <div class="stat-value">¥{{ store.totalRecharged }}</div>
        <div class="stat-label">累计充值</div>
      </div>
      <div class="stat-card">
        <el-icon size="32" color="#9c27b0"><Present /></el-icon>
        <div class="stat-value">{{ store.totalDraws }}</div>
        <div class="stat-label">总抽取次数</div>
      </div>
      <div class="stat-card">
        <el-icon size="32" color="#ff9800"><Star /></el-icon>
        <div class="stat-value">{{ store.totalEchoesSpent }}</div>
        <div class="stat-label">消耗回声</div>
      </div>
    </div>

    <!-- 收藏图鉴快捷入口 -->
    <div class="collection-entry" @click="$router.push('/collection')">
      <div class="collection-entry-left">
        <el-icon size="24" color="#c9a227"><Star /></el-icon>
        <div class="collection-entry-text">
          <div class="collection-entry-title">收藏图鉴</div>
          <div class="collection-entry-sub">
            已收集 <strong>{{ store.collectionStats.obtained }}</strong> / {{ store.collectionStats.total }} 件物品
          </div>
        </div>
      </div>
      <el-icon size="18" color="#a89b8c"><ArrowRight /></el-icon>
    </div>

    <!-- 各精华池保底进度 -->
    <div class="pool-pity-panel">
      <h3>各精华池保底进度</h3>
      <div class="pool-pity-list">
        <div
          v-for="pool in activePools"
          :key="pool.id"
          class="pool-pity-card"
          :class="{ active: pool.id === store.currentPoolId }"
          @click="store.switchPool(pool.id)"
        >
          <div class="pool-pity-header">
            <span class="pool-name">{{ pool.name }}</span>
            <span class="pool-draws">{{ pool.draws }}抽</span>
          </div>
          <div class="pool-pity-bars">
            <div class="mini-bar">
              <span class="mini-label">金</span>
              <div class="mini-track">
                <div class="mini-fill gold" :style="{ width: (pool.pity.legendary / 200 * 100) + '%' }"></div>
              </div>
              <span class="mini-num">{{ pool.pity.legendary }}/200</span>
            </div>
            <div class="mini-bar">
              <span class="mini-label">紫</span>
              <div class="mini-track">
                <div class="mini-fill purple" :style="{ width: (pool.pity.epic / 60 * 100) + '%' }"></div>
              </div>
              <span class="mini-num">{{ pool.pity.epic }}/60</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 全局出货统计 -->
    <div class="rarity-stats">
      <h3>全局出货统计</h3>
      <div class="rarity-grid">
        <div v-for="key in ['legendary', 'epic', 'unique', 'rare', 'common']" :key="key" class="rarity-card">
          <div class="rarity-dot" :style="{ backgroundColor: RARITY_CONFIG[key].color }"></div>
          <div class="rarity-name" :style="{ color: RARITY_CONFIG[key].color }">{{ RARITY_CONFIG[key].label }}</div>
          <div class="rarity-count">{{ store.globalRarityStats[key] }}</div>
        </div>
      </div>
    </div>

    <!-- 充值记录 -->
    <div class="records-section">
      <div class="records-header">
        <h3>
          充值记录
          <span class="record-count">（{{ store.rechargeRecords.length }} 条）</span>
        </h3>
        <el-button
          v-if="store.rechargeRecords.length > COLLAPSE_LIMIT"
          text
          size="small"
          @click="rechargeExpanded = !rechargeExpanded"
        >
          {{ rechargeExpanded ? '收起' : '展开' }}
          <el-icon><ArrowUp v-if="rechargeExpanded" /><ArrowDown v-else /></el-icon>
        </el-button>
      </div>

      <div v-if="store.rechargeRecords.length === 0" class="empty-tip">暂无充值记录</div>

      <div v-else class="record-list">
        <div
          v-for="record in visibleRechargeRecords"
          :key="record.id"
          class="record-card"
          :class="{ first: record.isFirst }"
        >
          <div class="record-main">
            <div class="record-left">
              <span class="record-amount">¥{{ record.amount }}</span>
              <el-tag :type="record.isFirst ? 'danger' : 'info'" size="small" effect="dark">
                {{ record.isFirst ? '首充双倍' : '常规充值' }}
              </el-tag>
            </div>
            <div class="record-right">
              <span class="record-echoes">+{{ record.echoesReceived }}</span>
              <span class="record-time">{{ store.formatDate(record.timestamp) }}</span>
            </div>
          </div>
          <div v-if="record.isFirst" class="record-bar">
            <div class="record-bar-fill" style="width: 100%"></div>
          </div>
        </div>
      </div>

      <div v-if="store.rechargeRecords.length > COLLAPSE_LIMIT && !rechargeExpanded" class="expand-hint">
        还有 {{ store.rechargeRecords.length - COLLAPSE_LIMIT }} 条记录被收起
      </div>
    </div>

    <!-- 抽卡记录（支持按精华池筛选） -->
    <div class="records-section">
      <div class="records-header">
        <h3>
          抽卡记录
          <span class="record-count">（{{ filteredDrawRecords.length }} 条）</span>
        </h3>
        <div class="header-actions">
          <el-select v-model="recordFilter" placeholder="全部精华池" style="width: 160px" size="small">
            <el-option label="全部精华池" value="" />
            <el-option
              v-for="pool in ESSENCE_POOLS"
              :key="pool.id"
              :label="pool.name"
              :value="pool.id"
            />
          </el-select>
          <el-button
            v-if="filteredDrawRecords.length > COLLAPSE_LIMIT"
            text
            size="small"
            @click="drawExpanded = !drawExpanded"
          >
            {{ drawExpanded ? '收起' : '展开' }}
            <el-icon><ArrowUp v-if="drawExpanded" /><ArrowDown v-else /></el-icon>
          </el-button>
        </div>
      </div>

      <div v-if="filteredDrawRecords.length === 0" class="empty-tip">
        {{ recordFilter ? '该精华池暂无抽卡记录' : '暂无抽卡记录' }}
      </div>

      <div v-else class="record-list">
        <div
          v-for="record in visibleDrawRecords"
          :key="record.id"
          class="draw-record-card"
          :class="{ highlight: record.results.some(r => r.rarity === 'legendary') }"
        >
          <div class="draw-record-header">
            <div class="draw-record-meta">
              <el-tag size="small" type="info" effect="dark">{{ record.poolName }}</el-tag>
              <el-tag :type="record.type === 'ten' ? 'danger' : 'primary'" size="small" effect="dark">
                {{ record.type === 'ten' ? '十连' : '单抽' }}
              </el-tag>
              <span class="draw-cost">{{ record.cost }} 回声</span>
            </div>
            <span class="draw-time">{{ store.formatDate(record.timestamp) }}</span>
          </div>
          <div class="draw-record-results">
            <span
              v-for="item in record.results"
              :key="item.id"
              class="draw-result-tag"
              :style="{ backgroundColor: RARITY_CONFIG[item.rarity].bg, color: RARITY_CONFIG[item.rarity].color, borderColor: RARITY_CONFIG[item.rarity].color }"
            >
              {{ item.displayName || item.name }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="filteredDrawRecords.length > COLLAPSE_LIMIT && !drawExpanded" class="expand-hint">
        还有 {{ filteredDrawRecords.length - COLLAPSE_LIMIT }} 条记录被收起
      </div>
    </div>

    <!-- 账号重置 -->
    <div class="reset-section">
      <el-button type="danger" plain size="small" @click="showResetConfirm = true">
        注销账号（清空所有数据）
      </el-button>
    </div>

    <!-- 重置确认弹窗 -->
    <div v-if="showResetConfirm" class="modal-overlay" @click.self="showResetConfirm = false">
      <div class="reset-modal">
        <div class="reset-modal-title">确认注销账号？</div>
        <div class="reset-modal-text">
          此操作将清空所有本地数据，包括回声、碎片、抽卡记录、收藏图鉴等，且不可恢复。
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="showResetConfirm = false">取消</button>
          <button class="modal-btn danger" @click="confirmReset">确认清空</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore, RARITY_CONFIG, ESSENCE_POOLS } from '../../stores/app'
import { Coin, Wallet, Present, Star, ArrowDown, ArrowUp, ArrowRight } from '@element-plus/icons-vue'

const store = useAppStore()
const recordFilter = ref('')
const rechargeExpanded = ref(false)
const drawExpanded = ref(false)
const showResetConfirm = ref(false)
const COLLAPSE_LIMIT = 3

function confirmReset() {
  store.resetAccount()
}

const visibleRechargeRecords = computed(() => {
  if (rechargeExpanded.value) return store.rechargeRecords
  return store.rechargeRecords.slice(0, COLLAPSE_LIMIT)
})

const visibleDrawRecords = computed(() => {
  if (drawExpanded.value) return filteredDrawRecords.value
  return filteredDrawRecords.value.slice(0, COLLAPSE_LIMIT)
})

// 有抽卡记录的精华池
const activePools = computed(() => {
  return ESSENCE_POOLS.map(pool => {
    const p = store.pools[pool.id]
    return {
      ...pool,
      draws: p.drawCount,
      pity: p.pity,
    }
  }).filter(p => p.draws > 0)
})

// 过滤后的抽卡记录
const filteredDrawRecords = computed(() => {
  const allRecords = []
  Object.values(store.pools).forEach(pool => {
    allRecords.push(...pool.drawRecords)
  })
  // 按时间倒序
  allRecords.sort((a, b) => b.timestamp - a.timestamp)

  if (!recordFilter.value) return allRecords
  return allRecords.filter(r => r.poolId === recordFilter.value)
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #c9a227;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin: 8px 0;
  color: #e8dcc8;
}

.stat-label {
  color: #a89b8c;
  font-size: 14px;
}

.pool-pity-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.pool-pity-panel h3 {
  margin-bottom: 20px;
}

.pool-pity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.pool-pity-card {
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.pool-pity-card:hover {
  border-color: #c9a227;
}

.pool-pity-card.active {
  border-color: #c9a227;
  background: linear-gradient(135deg, #2a2018, #241e18);
}

.pool-pity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pool-name {
  font-weight: bold;
  font-size: 14px;
}

.pool-draws {
  font-size: 12px;
  color: #a89b8c;
}

.mini-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.mini-label {
  font-size: 11px;
  width: 20px;
  color: #a89b8c;
}

.mini-track {
  flex: 1;
  height: 6px;
  background: #333;
  border-radius: 3px;
  overflow: hidden;
}

.mini-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.mini-fill.gold {
  background: #ff9800;
}

.mini-fill.purple {
  background: #9c27b0;
}

.mini-num {
  font-size: 11px;
  color: #a89b8c;
  width: 50px;
  text-align: right;
}

.rarity-stats {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.rarity-stats h3 {
  margin-bottom: 20px;
}

.rarity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.rarity-card {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: var(--bg-dark);
}

.rarity-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin: 0 auto 8px;
}

.rarity-name {
  font-size: 14px;
  margin-bottom: 4px;
}

.rarity-count {
  font-size: 24px;
  font-weight: bold;
  color: #e8dcc8;
}

.records-section {
  margin-bottom: 32px;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.records-header h3 {
  margin: 0;
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
  padding: 32px;
  text-align: center;
  background: var(--bg-card);
  border-radius: 12px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  transition: all 0.2s;
  overflow: hidden;
}

.record-card:hover {
  border-color: #c9a227;
  transform: translateX(4px);
}

.record-card.first {
  border-color: #8a2c2c;
  background: linear-gradient(135deg, #241e18, #2a1818);
}

.record-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-amount {
  font-size: 20px;
  font-weight: bold;
  color: #e8dcc8;
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.record-echoes {
  font-size: 18px;
  font-weight: bold;
  color: #c9a227;
}

.record-time {
  font-size: 12px;
  color: #a89b8c;
}

.record-bar {
  margin-top: 10px;
  height: 3px;
  background: #3d342b;
  border-radius: 2px;
  overflow: hidden;
}

.record-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9a227, #ffd700);
  border-radius: 2px;
  animation: barShine 2s ease-in-out infinite;
}

@keyframes barShine {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.draw-record-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  transition: all 0.2s;
}

.draw-record-card:hover {
  border-color: #c9a227;
  transform: translateX(4px);
}

.draw-record-card.highlight {
  border-color: #ff9800;
  background: linear-gradient(135deg, #241e18, #2a2010);
}

.draw-record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.draw-record-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.draw-cost {
  color: #c9a227;
  font-size: 14px;
  font-weight: bold;
}

.draw-time {
  font-size: 12px;
  color: #a89b8c;
}

.draw-record-results {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.draw-result-tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid;
  white-space: nowrap;
}

.expand-hint {
  text-align: center;
  padding: 12px;
  color: #a89b8c;
  font-size: 13px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== 收藏图鉴入口 ===== */
.collection-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #2a2018, #241e18);
  border: 1px solid #c9a227;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.collection-entry:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(201, 162, 39, 0.2);
}

.collection-entry-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collection-entry-title {
  font-size: 16px;
  font-weight: bold;
  color: #e8dcc8;
}

.collection-entry-sub {
  font-size: 13px;
  color: #a89b8c;
}

.collection-entry-sub strong {
  color: #c9a227;
}

/* ===== 弹窗遮罩层 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

/* ===== 账号重置 ===== */
.reset-section {
  text-align: center;
  padding: 32px;
  border-top: 1px solid var(--border);
  margin-top: 16px;
}

.reset-modal {
  background: linear-gradient(180deg, #2a2520, #1e1a15);
  border: 1px solid #8a2c2c;
  border-radius: 16px;
  padding: 32px 28px 24px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}

.reset-modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #ff4d4f;
  margin-bottom: 12px;
}

.reset-modal-text {
  color: #e8dcc8;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.modal-btn {
  flex: 1;
  padding: 12px 0;
  border-radius: 8px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: bold;
}

.modal-btn.cancel {
  background: #3d342b;
  color: #a89b8c;
  border: 1px solid #5a4d3e;
}

.modal-btn.cancel:hover {
  background: #4a3f34;
  color: #e8dcc8;
}

.modal-btn.danger {
  background: linear-gradient(135deg, #ff4d4f, #c62828);
  color: white;
}

.modal-btn.danger:hover {
  background: linear-gradient(135deg, #ff7875, #d32f2f);
  transform: translateY(-1px);
}
</style>
