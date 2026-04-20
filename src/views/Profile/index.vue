<template>
  <div class="profile-page">
    <h2 class="page-title">个人中心</h2>

    <!-- 全局统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <img src="/assets/echoes.png" alt="回声" class="stat-icon" />
        <div class="stat-value">{{ store.echoes }}</div>
        <div class="stat-label">当前回声</div>
      </div>
      <div class="stat-card">
        <img src="/assets/fragment.png" alt="碎片" class="stat-icon" />
        <div class="stat-value">{{ store.shards }}</div>
        <div class="stat-label">当前碎片</div>
      </div>
      <div class="stat-card">
        <img src="/assets/echoes.png" alt="回声" class="stat-icon" />
        <div class="stat-value">¥{{ store.totalRecharged }}</div>
        <div class="stat-label">累计充值</div>
      </div>
      <div class="stat-card">
        <img src="/assets/echoes.png" alt="回声" class="stat-icon" />
        <div class="stat-value">{{ store.totalDraws }}</div>
        <div class="stat-label">总抽取次数</div>
      </div>
      <div class="stat-card">
        <img src="/assets/echoes.png" alt="回声" class="stat-icon" />
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
      <div class="pool-pity-header-bar">
        <h3>各精华池保底进度</h3>
        <div class="pool-pity-filters">
          <el-input
            v-model="poolSearch"
            placeholder="搜索精华池..."
            size="small"
            clearable
            style="width: 160px"
          />
          <el-select v-model="poolFilterSeason" placeholder="全部赛季" clearable size="small" style="width: 120px" popper-class="dark-popper">
            <el-option label="全部赛季" value="" />
            <el-option
              v-for="season in poolSeasonOptions"
              :key="season"
              :label="`第${season}赛季`"
              :value="season"
            />
          </el-select>
          <el-select v-model="poolSort" size="small" style="width: 140px" popper-class="dark-popper">
            <el-option label="默认顺序" value="default" />
            <el-option label="赛季（新→旧）" value="season-desc" />
            <el-option label="赛季（旧→新）" value="season-asc" />
            <el-option label="抽取次数（多→少）" value="draws-desc" />
            <el-option label="抽取次数（少→多）" value="draws-asc" />
            <el-option label="上线时间（新→旧）" value="date-desc" />
            <el-option label="上线时间（旧→新）" value="date-asc" />
          </el-select>
        </div>
      </div>
      <div v-if="filteredActivePools.length === 0" class="empty-tip">
        没有找到符合条件的精华池
      </div>
      <div v-else class="pool-pity-list">
        <div
          v-for="pool in filteredActivePools"
          :key="pool.id"
          class="pool-pity-card"
          :class="{ active: pool.id === store.currentPoolId }"
          @click="goToGachaPool(pool.id)"
        >
          <div class="pool-pity-header">
            <span class="pool-name">{{ pool.name }}</span>
            <span class="pool-draws">{{ pool.draws }}抽</span>
          </div>
          <div class="pool-pity-bars">
            <div class="mini-bar">
              <span class="mini-label">金</span>
              <div class="mini-track">
                <div class="mini-fill gold" :style="{ width: (pool.pity.legendary / (pool.legendaryPity || 200) * 100) + '%' }"></div>
              </div>
              <span class="mini-num">{{ pool.pity.legendary }}/{{ pool.legendaryPity || 200 }}</span>
            </div>
            <div class="mini-bar">
              <span class="mini-label">紫</span>
              <div class="mini-track">
                <div class="mini-fill purple" :style="{ width: (pool.pity.epic / 60 * 100) + '%' }"></div>
              </div>
              <span class="mini-num">{{ pool.pity.epic }}/60</span>
            </div>
          </div>
          <div class="pool-shards">累计碎片 {{ pool.totalShardsReturned }}</div>
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

    <!-- 抽卡分析 -->
    <div class="analysis-panel">
      <div class="analysis-header">
        <h3>抽卡分析</h3>
        <el-select v-model="analysisFilter" placeholder="全局统计" clearable size="small" style="width: 180px">
          <el-option label="全局统计" value="" />
          <el-option
            v-for="pool in ESSENCE_POOLS"
            :key="pool.id"
            :label="pool.name"
            :value="pool.id"
          />
        </el-select>
      </div>

      <div v-if="!analysisData" class="empty-tip">
        {{ analysisFilter ? '该精华池暂无抽卡数据' : '暂无抽卡数据，快去抽取吧～' }}
      </div>

      <div v-else>
        <!-- 核心指标卡片 -->
        <div class="analysis-grid">
          <div class="analysis-card">
            <div class="analysis-label">总抽取次数</div>
            <div class="analysis-value">{{ analysisData.totalDraws }} 次</div>
            <div class="analysis-sub">{{ analysisData.totalPulls }} 抽 / {{ analysisData.totalCost }} 回声</div>
          </div>

          <div class="analysis-card highlight-gold">
            <div class="analysis-label">最欧十连</div>
            <div v-if="analysisData.luckiestTen" class="analysis-value">+{{ analysisData.maxLuckValue }}</div>
            <div v-else class="analysis-value">—</div>
            <div v-if="analysisData.luckiestTen" class="analysis-tags">
              <span
                v-for="item in analysisData.luckiestTen.results"
                :key="item.id"
                class="mini-tag"
                :style="{ backgroundColor: RARITY_CONFIG[item.rarity]?.bg, color: RARITY_CONFIG[item.rarity]?.color }"
              >{{ item.displayName || item.name }}</span>
            </div>
          </div>

          <div class="analysis-card">
            <div class="analysis-label">最非十连</div>
            <div v-if="analysisData.unluckiestTen" class="analysis-value" style="color:#9e9e9e">全低稀有度</div>
            <div v-else class="analysis-value">—</div>
            <div v-if="analysisData.unluckiestTen" class="analysis-sub">{{ store.formatDate(analysisData.unluckiestTen.timestamp) }}</div>
          </div>

          <div class="analysis-card">
            <div class="analysis-label">最快出稀世</div>
            <div v-if="analysisData.legendaryStreaks.firstAppearPulls" class="analysis-value" style="color:#ff9800">{{ analysisData.legendaryStreaks.firstAppearPulls }} 抽</div>
            <div v-else class="analysis-value">—</div>
            <div v-if="analysisData.legendaryStreaks.firstAppearItem" class="analysis-sub">
              {{ analysisData.legendaryStreaks.firstAppearItem.displayName || analysisData.legendaryStreaks.firstAppearItem.name }}
            </div>
          </div>

          <div class="analysis-card">
            <div class="analysis-label">最慢出稀世</div>
            <div v-if="analysisData.legendaryStreaks.maxStreak" class="analysis-value" style="color:#ff9800">{{ analysisData.legendaryStreaks.maxStreak }} 抽</div>
            <div v-else class="analysis-value">—</div>
            <div v-if="analysisData.legendaryStreaks.maxStreakItem" class="analysis-sub">
              {{ analysisData.legendaryStreaks.maxStreakItem.displayName || analysisData.legendaryStreaks.maxStreakItem.name }}
            </div>
          </div>

          <div class="analysis-card">
            <div class="analysis-label">最快出奇珍</div>
            <div v-if="analysisData.epicStreaks.firstAppearPulls" class="analysis-value" style="color:#9c27b0">{{ analysisData.epicStreaks.firstAppearPulls }} 抽</div>
            <div v-else class="analysis-value">—</div>
            <div v-if="analysisData.epicStreaks.firstAppearItem" class="analysis-sub">
              {{ analysisData.epicStreaks.firstAppearItem.displayName || analysisData.epicStreaks.firstAppearItem.name }}
            </div>
          </div>

          <div class="analysis-card">
            <div class="analysis-label">最慢出奇珍</div>
            <div v-if="analysisData.epicStreaks.maxStreak" class="analysis-value" style="color:#9c27b0">{{ analysisData.epicStreaks.maxStreak }} 抽</div>
            <div v-else class="analysis-value">—</div>
            <div v-if="analysisData.epicStreaks.maxStreakItem" class="analysis-sub">
              {{ analysisData.epicStreaks.maxStreakItem.displayName || analysisData.epicStreaks.maxStreakItem.name }}
            </div>
          </div>

          <div class="analysis-card">
            <div class="analysis-label">稀世平均间隔</div>
            <div v-if="analysisData.avgLegendaryInterval" class="analysis-value" style="color:#ff9800">{{ analysisData.avgLegendaryInterval }} 抽</div>
            <div v-else class="analysis-value">—</div>
            <div v-if="analysisData.avgLegendaryCost" class="analysis-sub">{{ analysisData.avgLegendaryCost }} 回声 / 个</div>
          </div>

          <div class="analysis-card">
            <div class="analysis-label">奇珍平均间隔</div>
            <div v-if="analysisData.avgEpicInterval" class="analysis-value" style="color:#9c27b0">{{ analysisData.avgEpicInterval }} 抽</div>
            <div v-else class="analysis-value">—</div>
            <div v-if="analysisData.avgEpicCost" class="analysis-sub">{{ analysisData.avgEpicCost }} 回声 / 个</div>
          </div>
        </div>

        <!-- 保底记录 -->
        <div v-if="analysisData.legendaryPityHistory.length || analysisData.epicPityHistory.length" class="pity-section">
          <div class="pity-tabs">
            <div
              class="pity-tab"
              :class="{ active: pityTab === 'legendary' }"
              @click="pityTab = 'legendary'"
            >
              稀世保底 ({{ analysisData.legendaryPityHistory.length }})
            </div>
            <div
              class="pity-tab"
              :class="{ active: pityTab === 'epic' }"
              @click="pityTab = 'epic'"
            >
              奇珍保底 ({{ analysisData.epicPityHistory.length }})
            </div>
          </div>
          <div class="pity-list">
            <div
              v-for="(entry, idx) in activePityList"
              :key="idx"
              class="pity-item"
            >
              <span class="pity-tag" :style="{ color: pityTab === 'legendary' ? '#ff9800' : '#9c27b0' }"">
                {{ entry.item.displayName || entry.item.name }}
              </span>
              <el-tag size="small" type="info" effect="dark">{{ entry.poolName }}</el-tag>
              <span class="pity-time">{{ store.formatDate(entry.record.timestamp) }}</span>
            </div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-title">出率雷达（实际/理论）</div>
            <v-chart class="chart" :option="rateChartOption" autoresize />
          </div>
          <div class="chart-card">
            <div class="chart-title">出货占比</div>
            <v-chart class="chart" :option="pieChartOption" autoresize />
          </div>
        </div>
      </div>
    </div>

    <div class="records-row">
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

      <!-- 碎片获取记录 -->
      <div class="records-section">
        <div class="records-header">
          <h3>
            碎片获取记录
            <span class="record-count">（{{ shardRecords.length }} 条）</span>
          </h3>
          <div class="header-actions">
            <el-select v-model="shardFilter" placeholder="全部精华池" style="width: 140px" size="small">
              <el-option label="全部精华池" value="" />
              <el-option
                v-for="pool in ESSENCE_POOLS"
                :key="pool.id"
                :label="pool.name"
                :value="pool.id"
              />
            </el-select>
            <el-button
              v-if="shardRecords.length > COLLAPSE_LIMIT"
              text
              size="small"
              @click="shardExpanded = !shardExpanded"
            >
              {{ shardExpanded ? '收起' : '展开' }}
              <el-icon><ArrowUp v-if="shardExpanded" /><ArrowDown v-else /></el-icon>
            </el-button>
          </div>
        </div>

        <div v-if="shardRecords.length === 0" class="empty-tip">
          {{ shardFilter ? '该精华池暂无碎片获取记录' : '暂无碎片获取记录' }}
        </div>

        <div v-else class="record-list">
          <div
            v-for="record in visibleShardRecords"
            :key="record.id"
            class="shard-record-card"
          >
            <div class="shard-record-header">
              <div class="shard-record-meta">
                <el-tag size="small" type="info" effect="dark">{{ record.poolName }}</el-tag>
                <el-tag :type="record.type === 'ten' ? 'danger' : 'primary'" size="small" effect="dark">
                  {{ record.type === 'ten' ? '十连' : '单抽' }}
                </el-tag>
                <span class="shard-record-shards">
                  <img src="/assets/fragment.png" class="shard-icon-mini" alt="碎片" />
                  <span class="shard-count">+{{ record.shardsReturned }}</span>
                  <span class="shard-duplicate">（{{ record.duplicateCount }} 个重复）</span>
                </span>
              </div>
              <span class="draw-time">{{ store.formatDate(record.timestamp) }}</span>
            </div>
          </div>
        </div>

        <div v-if="shardRecords.length > COLLAPSE_LIMIT && !shardExpanded" class="expand-hint">
          还有 {{ shardRecords.length - COLLAPSE_LIMIT }} 条记录被收起
        </div>
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
          <div v-if="record.shardsReturned" class="draw-record-shards">
            <img src="/assets/fragment.png" class="shard-icon-mini" alt="碎片" />
            <span>返还 {{ record.shardsReturned }} 碎片（{{ record.duplicateCount }} 个重复）</span>
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
import { useRouter } from 'vue-router'
import { useAppStore, RARITY_CONFIG, ESSENCE_POOLS } from '../../stores/app'
import { Star, ArrowDown, ArrowUp, ArrowRight } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart, RadarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, RadarComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, PieChart, LineChart, RadarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, RadarComponent])

const store = useAppStore()
const router = useRouter()
const recordFilter = ref('')
const rechargeExpanded = ref(false)
const drawExpanded = ref(false)
const showResetConfirm = ref(false)
const COLLAPSE_LIMIT = 3

// 保底进度筛选/排序
const poolSearch = ref('')
const poolFilterSeason = ref('')
const poolSort = ref('default')

function confirmReset() {
  store.resetAccount()
}

function goToGachaPool(poolId) {
  store.switchPool(poolId)
  router.push('/gacha')
}

const visibleRechargeRecords = computed(() => {
  if (rechargeExpanded.value) return store.rechargeRecords
  return store.rechargeRecords.slice(0, COLLAPSE_LIMIT)
})

const visibleDrawRecords = computed(() => {
  if (drawExpanded.value) return filteredDrawRecords.value
  return filteredDrawRecords.value.slice(0, COLLAPSE_LIMIT)
})

// 有抽卡记录的精华池（带筛选/排序）
const activePools = computed(() => {
  return ESSENCE_POOLS.map(pool => {
    const p = store.pools[pool.id]
    return {
      ...pool,
      draws: p.drawCount,
      pity: p.pity,
      totalShardsReturned: p.totalShardsReturned || 0,
    }
  }).filter(p => p.draws > 0)
})

const poolSeasonOptions = computed(() => {
  const seasons = new Set()
  for (const pool of activePools.value) {
    if (pool.season > 0) seasons.add(pool.season)
  }
  return Array.from(seasons).sort((a, b) => b - a)
})

const filteredActivePools = computed(() => {
  let list = activePools.value

  // 搜索
  if (poolSearch.value) {
    const kw = poolSearch.value.toLowerCase()
    const seasonText = (s) => s > 0 ? `第${s}赛季` : ''
    list = list.filter(p => {
      const text = [p.name, seasonText(p.season)].filter(Boolean).join(' ').toLowerCase()
      return text.includes(kw)
    })
  }

  // 赛季筛选
  if (poolFilterSeason.value) {
    list = list.filter(p => p.season === poolFilterSeason.value)
  }

  // 排序
  switch (poolSort.value) {
    case 'season-desc':
      list.sort((a, b) => (b.season || 0) - (a.season || 0))
      break
    case 'season-asc':
      list.sort((a, b) => (a.season || 0) - (b.season || 0))
      break
    case 'draws-desc':
      list.sort((a, b) => b.draws - a.draws)
      break
    case 'draws-asc':
      list.sort((a, b) => a.draws - b.draws)
      break
    case 'date-desc':
      list.sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))
      break
    case 'date-asc':
      list.sort((a, b) => (a.releaseDate || '').localeCompare(b.releaseDate || ''))
      break
  }

  return list
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

const shardFilter = ref('')
const shardExpanded = ref(false)

const shardRecords = computed(() => {
  const allRecords = []
  Object.values(store.pools).forEach(pool => {
    allRecords.push(...pool.drawRecords)
  })
  allRecords.sort((a, b) => b.timestamp - a.timestamp)
  let list = allRecords.filter(r => r.shardsReturned > 0)
  if (shardFilter.value) {
    list = list.filter(r => r.poolId === shardFilter.value)
  }
  return list
})

const visibleShardRecords = computed(() => {
  if (shardExpanded.value) return shardRecords.value
  return shardRecords.value.slice(0, COLLAPSE_LIMIT)
})

// ===== 抽卡分析 =====
const analysisFilter = ref('')

const analysisData = computed(() => {
  if (analysisFilter.value) {
    return store.getPoolAnalysis(analysisFilter.value)
  }
  return store.gachaAnalysis
})

const pityTab = ref('legendary')

const activePityList = computed(() => {
  const data = analysisData.value
  if (!data) return []
  return pityTab.value === 'legendary' ? data.legendaryPityHistory : data.epicPityHistory
})

const rateChartOption = computed(() => {
  const data = analysisData.value
  if (!data) return {}
  const order = ['legendary', 'epic', 'unique', 'rare', 'common']
  const indicator = order
    .filter(k => data.theoreticalRates?.[k] > 0)
    .map(k => ({ name: RARITY_CONFIG[k].label, max: 2.5 }))

  const ratioValues = order
    .filter(k => data.theoreticalRates?.[k] > 0)
    .map(k => {
      const actual = data.actualRates[k] || 0
      const theory = data.theoreticalRates[k]
      return theory > 0 ? +(actual / theory).toFixed(3) : 0
    })

  return {
    tooltip: {
      formatter: (params) => {
        const p = params[0]
        let s = p.name + '<br/>'
        p.value.forEach((v, i) => {
          s += `${indicator[i].name}: ${v.toFixed(2)}x<br/>`
        })
        return s
      },
    },
    legend: { data: ['实际/理论', '基准'], textStyle: { color: '#a89b8c' }, bottom: 0 },
    radar: {
      indicator,
      axisName: { color: '#a89b8c' },
      splitArea: { areaStyle: { color: ['#1a1512', '#1e1916'] } },
      splitLine: { lineStyle: { color: '#3a3028' } },
      axisLine: { lineStyle: { color: '#3a3028' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: ratioValues,
            name: '实际/理论',
            areaStyle: { color: 'rgba(255, 152, 0, 0.2)' },
            itemStyle: { color: '#ff9800' },
            lineStyle: { color: '#ff9800', width: 2 },
          },
          {
            value: indicator.map(() => 1),
            name: '基准',
            lineStyle: { type: 'dashed', color: '#666', width: 1 },
            itemStyle: { opacity: 0 },
            symbol: 'none',
          },
        ],
      },
    ],
  }
})

const pieChartOption = computed(() => {
  const data = analysisData.value
  if (!data) return {}
  const order = ['legendary', 'epic']
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', textStyle: { color: '#a89b8c' } },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#1a1512', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#e8dcc8' } },
        data: order.map(k => ({
          name: RARITY_CONFIG[k].label,
          value: data.rarityCounts[k] || 0,
          itemStyle: { color: RARITY_CONFIG[k].color },
        })),
      },
    ],
  }
})

function formatRate(v) {
  if (v === undefined || v === null) return '0%'
  return (v * 100).toFixed(2) + '%'
}
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

.stat-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.pool-pity-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.pool-pity-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.pool-pity-header-bar h3 {
  margin: 0;
}

.pool-pity-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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

.records-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.records-row .records-section {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .records-row {
    grid-template-columns: 1fr;
  }
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

.draw-record-shards {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9c27b0;
}

.shard-icon-mini {
  width: 14px;
  height: 14px;
}

.pool-shards {
  margin-top: 6px;
  font-size: 12px;
  color: #9c27b0;
}

.shard-record-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 12px 16px;
  transition: all 0.2s;
}

.shard-record-card:hover {
  border-color: #9c27b0;
}

.shard-record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shard-record-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.shard-record-shards {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #9c27b0;
}

.shard-count {
  font-weight: 600;
  font-size: 14px;
}

.shard-duplicate {
  color: #a89b8c;
  font-size: 12px;
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

/* ===== 抽卡分析 ===== */
.analysis-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.analysis-card {
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s;
}

.analysis-card:hover {
  border-color: #c9a227;
  transform: translateY(-2px);
}

.analysis-label {
  font-size: 13px;
  color: #a89b8c;
  margin-bottom: 6px;
}

.analysis-value {
  font-size: 22px;
  font-weight: bold;
  color: #e8dcc8;
  margin-bottom: 4px;
}

.analysis-sub {
  font-size: 12px;
  color: #a89b8c;
}

.analysis-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.mini-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  border: 1px solid;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-card {
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
}

.chart-card.wide {
  grid-column: span 2;
}

.chart-title {
  font-size: 14px;
  color: #a89b8c;
  margin-bottom: 8px;
  text-align: center;
}

.chart {
  width: 100%;
  height: 240px;
}

.pity-section {
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
}

.pity-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.pity-tab {
  cursor: pointer;
  font-size: 14px;
  color: #a89b8c;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.pity-tab:hover {
  color: #e8dcc8;
}

.pity-tab.active {
  color: #c9a227;
  background: rgba(201, 162, 39, 0.1);
  font-weight: 600;
}

.pity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.pity-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 6px;
  background: var(--bg-card);
}

.pity-tag {
  font-weight: 600;
  min-width: 120px;
}

.pity-time {
  color: #a89b8c;
  font-size: 12px;
  margin-left: auto;
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  .chart-card.wide {
    grid-column: span 1;
  }
}
</style>
