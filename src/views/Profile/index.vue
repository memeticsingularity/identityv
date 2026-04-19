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
      <h3>充值记录</h3>
      <el-table :data="store.rechargeRecords" style="width: 100%" empty-text="暂无充值记录">
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isFirst ? 'danger' : 'info'" size="small">
              {{ row.isFirst ? '首充' : '常规' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="获得回声" width="120">
          <template #default="{ row }">
            <span style="color: #c9a227; font-weight: bold;">+{{ row.echoesReceived }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间">
          <template #default="{ row }">{{ store.formatDate(row.timestamp) }}</template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 抽卡记录（支持按精华池筛选） -->
    <div class="records-section">
      <div class="records-header">
        <h3>抽卡记录</h3>
        <el-select v-model="recordFilter" placeholder="全部精华池" style="width: 180px" size="small">
          <el-option label="全部精华池" value="" />
          <el-option
            v-for="pool in ESSENCE_POOLS"
            :key="pool.id"
            :label="pool.name"
            :value="pool.id"
          />
        </el-select>
      </div>

      <el-table :data="filteredDrawRecords" style="width: 100%" empty-text="暂无抽卡记录">
        <el-table-column label="精华池" width="160">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.poolName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'ten' ? 'danger' : 'primary'" size="small">
              {{ row.type === 'ten' ? '十连' : '单抽' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="消耗" width="120">
          <template #default="{ row }">
            <span style="color: #c9a227;">{{ row.cost }} 回声</span>
          </template>
        </el-table-column>
        <el-table-column label="结果">
          <template #default="{ row }">
            <div class="result-tags">
              <el-tag
                v-for="item in row.results"
                :key="item.id"
                size="small"
                :style="{ backgroundColor: RARITY_CONFIG[item.rarity].bg, color: RARITY_CONFIG[item.rarity].color, borderColor: RARITY_CONFIG[item.rarity].color }"
              >
                {{ item.name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="160">
          <template #default="{ row }">{{ store.formatDate(row.timestamp) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore, RARITY_CONFIG, ESSENCE_POOLS } from '../../stores/app'
import { Coin, Wallet, Present, Star } from '@element-plus/icons-vue'

const store = useAppStore()
const recordFilter = ref('')

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
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
