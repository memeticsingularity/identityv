<template>
  <div class="gacha-page">
    <!-- 顶部信息栏 -->
    <div class="info-bar">
      <div class="info-item">
        <img src="/assets/echoes.png" alt="回声" class="echoes-top-icon" />
        <span class="info-label">回声</span>
        <span class="info-value">{{ store.echoes }}</span>
      </div>
      <div class="info-item">
        <img src="/assets/fragment.png" alt="碎片" class="fragment-top-icon" />
        <span class="info-label">碎片</span>
        <span class="info-value" style="color:#9c27b0">{{ store.shards }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">总抽取</span>
        <span class="info-value">{{ store.totalDraws }}</span>
      </div>
      <div class="info-item">
        <img src="/assets/echoes.png" alt="回声" class="echoes-top-icon" />
        <span class="info-label">消耗回声</span>
        <span class="info-value">{{ store.totalEchoesSpent }}</span>
      </div>
      <div class="info-item">
        <img src="/assets/fragment.png" alt="碎片" class="fragment-top-icon" />
        <span class="info-label">本池碎片</span>
        <span class="info-value" style="color:#9c27b0">{{ store.currentPool.totalShardsReturned || 0 }}</span>
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
        popper-class="dark-popper"
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
          <img :src="currentPoolIcon" class="essence-icon" alt="精华图标" />
        </div>
        <p class="gacha-title">
          {{ store.currentPoolInfo.name }}
          <el-popover placement="bottom" :width="420" trigger="hover" popper-class="prob-popover">
            <template #reference>
              <Icon icon="ep:info-filled" class="prob-icon" width="18" height="18" />
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
        <el-button text class="content-btn" @click="showContentModal = true">
          <Icon icon="ep:info-filled" width="16" height="16" />
          内容说明
        </el-button>
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
          :disabled="isSpinning || store.skinModalQueue.length > 0"
          :class="{ 'insufficient': store.echoes < 96 }"
          @click="handleDraw('single')"
        >
          <Icon icon="ep:gift" width="16" height="16" />
          开启1个 (96回声)
        </el-button>
        <el-button
          type="danger"
          size="large"
          :disabled="isSpinning || store.skinModalQueue.length > 0"
          :class="{ 'insufficient': store.echoes < 960 }"
          @click="handleDraw('ten')"
        >
          <Icon icon="ep:gift" width="16" height="16" />
          开启10个 (960回声)
        </el-button>
      </div>
    </div>

    <!-- 回声不足提示弹窗 -->
    <div v-if="showInsufficient" class="modal-overlay" @click.self="showInsufficient = false">
      <div class="insufficient-modal">
        <div class="modal-text">
          购买<strong class="highlight">{{ pendingDrawType === 'ten' ? '10个' : '1个' }}</strong>{{ store.currentPoolInfo.name }}需要<strong class="highlight">{{ pendingDrawType === 'ten' ? 960 : 96 }}回声</strong><br/>
          当前回声不足，是否前往充值回声？
        </div>
        <div class="echoes-display">
          <img src="/assets/echoes.png" alt="回声" class="echoes-modal-icon" />
          <span class="echoes-number">{{ store.echoes }}</span>
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="showInsufficient = false">取消</button>
          <button class="modal-btn confirm" @click="openRecharge">前往充值</button>
        </div>
      </div>
    </div>

    <!-- 充值弹窗 -->
    <div v-if="showRecharge" class="modal-overlay" @click.self="showRecharge = false">
      <div class="recharge-modal">
        <div class="recharge-header">
          <h3>回声充值</h3>
          <button class="close-btn" @click="showRecharge = false">&times;</button>
        </div>
        <div class="recharge-body">
          <div class="echoes-balance-mini">
            <img src="/assets/echoes.png" alt="回声" class="echoes-modal-icon" />
            <span class="echoes-label">当前回声</span>
            <span class="echoes-value">{{ store.echoes }}</span>
          </div>
          <div class="tier-grid-mini">
            <div
              v-for="tier in RECHARGE_TIERS"
              :key="tier.amount"
              class="tier-card-mini"
              :class="{ first: store.tierCounts[tier.amount] === 0 }"
              @click="doRecharge(tier.amount)"
            >
              <div class="tier-amount-mini">¥{{ tier.amount }}</div>
              <div class="tier-echoes-mini">
                <span class="base">{{ tier.base }}</span>
                <span v-if="store.tierCounts[tier.amount] === 0" class="bonus">+{{ tier.firstBonus }}</span>
                <span v-else-if="tier.bonus > 0" class="bonus">+{{ tier.bonus }}</span>
              </div>
              <div class="tier-total-mini">= {{ tier.base + (store.tierCounts[tier.amount] === 0 ? tier.firstBonus : tier.bonus) }} 回声</div>
              <div v-if="store.tierCounts[tier.amount] === 0" class="first-tag">首充双倍</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 首次获得时装弹窗 -->
    <div v-if="store.skinModalQueue.length > 0" class="modal-overlay skin-modal-overlay" @click.self="store.closeSkinModal()">
      <div class="skin-modal">
        <div class="skin-modal-header">
          记录第 <strong>{{ store.skinModalQueue[0].skinCount }}</strong> 件时装
        </div>
        <div class="skin-modal-body">
          <div class="skin-modal-orb">
            <img :src="currentPoolIcon" class="skin-modal-icon" alt="时装占位" />
          </div>
          <div
            class="skin-modal-name"
            :style="{ color: RARITY_CONFIG[store.skinModalQueue[0].rarity].color }"
          >
            {{ store.skinModalQueue[0].displayName }}
          </div>
          <div v-if="store.skinModalQueue[0].characterName" class="skin-modal-char">
            {{ store.skinModalQueue[0].characterName }}
          </div>
        </div>
        <div class="skin-modal-actions">
          <button class="modal-btn cancel" @click="store.closeSkinModal()">更换新时装</button>
          <button class="modal-btn confirm" @click="store.closeSkinModal()">确认记录</button>
        </div>
      </div>
    </div>

    <!-- 抽卡结果（常驻占位，避免页面高度跳动） -->
    <div class="result-area">
      <h3>抽取结果</h3>
      <div v-if="!lastResult" class="result-placeholder">
        点击上方按钮开启珍宝
      </div>
      <div v-else class="result-grid" :class="{ ten: lastResult.results.length === 10 }">
        <div
          v-for="(item, idx) in lastResult.results"
          :key="item.id"
          class="result-item"
          :style="{
            backgroundColor: item.isDuplicate ? '#2a1f30' : RARITY_CONFIG[item.rarity].bg,
            borderColor: RARITY_CONFIG[item.rarity].color
          }"
          :class="{
            highlight: isHighRarity(item.rarity) && !item.isDuplicate,
            'is-duplicate': item.isDuplicate,
            pop: showPop && idx < popIndex,
            'show-fragment': showFragments && item.isDuplicate
          }"
        >
          <!-- 正面：物品展示 -->
          <div class="card-front">
            <div class="rarity-badge" :style="{ backgroundColor: RARITY_CONFIG[item.rarity].color }">
              {{ RARITY_CONFIG[item.rarity].label }}
            </div>
            <div class="item-name" :style="{ color: RARITY_CONFIG[item.rarity].color }">
              {{ item.displayName || item.name }}
            </div>
          </div>
          <!-- 背面：碎片展示（重复物品翻转后显示） -->
          <div class="card-back">
            <div class="rarity-badge" :style="{ backgroundColor: RARITY_CONFIG[item.rarity].color }">
              {{ RARITY_CONFIG[item.rarity].label }}
            </div>
            <img src="/assets/fragment.png" class="fragment-icon" alt="碎片" />
            <div class="fragment-count" :style="{ color: RARITY_CONFIG[item.rarity].color }">
              +{{ item.shardsReturned }}
            </div>
            <div class="fragment-label">碎片</div>
            <div class="duplicate-tag">重复</div>
          </div>
        </div>
      </div>
    </div>


    <!-- 抽卡记录（外层折叠） -->
    <el-collapse v-model="recordsActive" class="records-collapse">
      <el-collapse-item name="records">
        <template #title>
          <span class="records-collapse-title">
            抽卡记录
            <span class="record-count">（{{ currentPoolRecords.length }} 条）</span>
          </span>
        </template>

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
                {{ item.displayName || item.name }}
              </el-tag>
            </div>
            <div v-if="record.shardsReturned" class="record-shards">
              <img src="/assets/fragment.png" class="shard-icon-mini" alt="碎片" />
              <span>返还 {{ record.shardsReturned }} 碎片（{{ record.duplicateCount }} 个重复）</span>
            </div>
          </el-timeline-item>
        </el-timeline>

        <div v-if="currentPoolRecords.length > COLLAPSE_LIMIT" class="expand-bar">
          <el-button text @click="isExpanded = !isExpanded">
            {{ isExpanded ? '收起记录' : `展开全部 (${currentPoolRecords.length} 条)` }}
            <Icon v-if="isExpanded" icon="ep:arrow-up" width="16" height="16" />
            <Icon v-else icon="ep:arrow-down" width="16" height="16" />
          </el-button>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 内容说明弹窗 -->
    <el-dialog
      v-model="showContentModal"
      :title="`内容说明 - ${store.currentPoolInfo?.name || ''}`"
      width="800px"
      class="content-modal"
      destroy-on-close
    >
      <div v-for="group in contentGroups" :key="group.title" class="content-group">
        <h4 class="content-group-title">{{ group.title }}</h4>
        <div class="content-grid">
          <div
            v-for="item in group.items"
            :key="item.key"
            class="content-card"
            :class="{ owned: item.owned }"
            :style="{ borderColor: RARITY_CONFIG[item.rarity]?.color || '#9e9e9e' }"
          >
            <div class="content-card-img">
              <img :src="currentPoolIcon" alt="" />
            </div>
            <div class="content-card-name">{{ item.displayName || item.name }}</div>
            <div v-if="item.owned" class="content-card-tag">已获得</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore, RARITY_CONFIG, POOL_CASCADER_OPTIONS, getEssenceIcon, RECHARGE_TIERS } from '../../stores/app'
import { buildItemCatalog } from '../../data/essences/index.js'
import { Icon } from '@iconify/vue'

const store = useAppStore()
const isSpinning = ref(false)
const lastResult = ref(null)
const showPop = ref(false)
const popIndex = ref(0)
const isExpanded = ref(false)
const recordsActive = ref([])
const lightEffect = ref(null)
const showInsufficient = ref(false)
const showRecharge = ref(false)
const pendingDrawType = ref('single')
const showFragments = ref(false)
const showContentModal = ref(false)
const COLLAPSE_LIMIT = 3

const currentPoolIcon = computed(() => getEssenceIcon(store.currentPoolInfo))

// ===== 内容说明弹窗数据 =====
const contentGroups = computed(() => {
  const catalog = buildItemCatalog().filter(i => i.poolId === store.currentPoolId)
  const ownedSet = new Set(store.ownedItems)
  const items = catalog.map(item => ({ ...item, owned: ownedSet.has(item.key) }))

  const groups = []
  const usedKeys = new Set()

  // 1. 稀世/奇珍精华时装
  const highSkins = items.filter(i =>
    (i.rarity === 'legendary' || i.rarity === 'epic') && i.itemType === 'skin'
  )
  if (highSkins.length) {
    groups.push({ title: '稀世/奇珍精华时装', items: highSkins })
    highSkins.forEach(i => usedKeys.add(i.key))
  }

  // 2. 独特/罕见精华时装
  const lowSkins = items.filter(i =>
    (i.rarity === 'unique' || i.rarity === 'rare') && i.itemType === 'skin'
  )
  if (lowSkins.length) {
    groups.push({ title: '独特/罕见精华时装', items: lowSkins })
    lowSkins.forEach(i => usedKeys.add(i.key))
  }

  // 3. 个性动作/等待动作
  const emotes = items.filter(i =>
    i.itemType === 'emote' || i.category === 'emote'
  )
  if (emotes.length) {
    groups.push({ title: '个性动作/等待动作', items: emotes })
    emotes.forEach(i => usedKeys.add(i.key))
  }

  // 4. 其余物品
  const others = items.filter(i => !usedKeys.has(i.key))
  if (others.length) {
    groups.push({ title: '其余物品', items: others })
  }

  return groups
})

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

// 当前精华池的抽卡记录
const currentPoolRecords = computed(() => store.currentPool.drawRecords)

// 记录折叠展示：默认只显示前 COLLAPSE_LIMIT 条
const visibleRecords = computed(() => {
  if (isExpanded.value) return currentPoolRecords.value
  return currentPoolRecords.value.slice(0, COLLAPSE_LIMIT)
})

/*
  ===== 官方概率文案（供参考） =====

  -- 深渊珍宝 --
  a. 罕见品质(绿色)：82%
  b. 独特品质(蓝色)：第一次开启精华时的掉率为10.2%，开启10个相同的精华或者珍宝后必然有一个独特(蓝色)或者更高品质的道具，因此总体上单次掉率约为15%
  c. 奇珍品质(紫色)：掉落概率会在未开出奇珍品质道具的条件下不断累加。开启前15个精华时，从这15个精华中获得奇珍品质道具的概率为10%；开启前30个精华时，从这30个精华中获得奇珍品质道具的概率为38%；开启60个必有一个奇珍(紫色)或者更高品质的道具。平均下来，单次掉率为2.5%。
  d. 稀世品质(金色)：掉落概率会在未开出稀世品质道具的条件下不断累加。开启前50个精华时，从这50个精华中获得稀世品质道具的概率为6.3%；开启前100个精华时，从这100个精华中获得稀世品质道具的概率为25%；开启250个必有一个稀世品质(金色)的道具。平均下来，单次掉率为0.5%

  -- 赛季精华（37-3及之后，200保底） --
  a. 普通品质(白色)：31.7%
  b. 罕见品质(绿色)：49.8%
  c. 独特品质(蓝色)：第一次开启精华时的掉率为10.2%，开启10个相同的精华或者珍宝后必然有一个独特(蓝色)或者更高品质的道具，因此总体上单次掉率约为15.3%
  d. 奇珍品质(紫色)：同深渊，单次掉率为2.5%
  e. 稀世品质(金色)：开启前50个精华时概率6.3%；开启前100个时概率25%；开启200个必出。平均下来，单次掉率为0.7%
*/
const probData = computed(() => {
  const poolInfo = store.currentPoolInfo
  const isAbyss = poolInfo?.type === 'abyss'
  const legendaryPity = isAbyss ? 250 : (poolInfo?.legendaryPity || 200)
  const isOldStandard = !isAbyss && legendaryPity === 250
  const goldProb = isOldStandard ? '0.5%' : '0.7%'
  if (isAbyss) {
    return [
      { label: '稀世', color: '#ff9800', probText: '0.5%', desc: '开启250个必有一个稀世品质道具' },
      { label: '奇珍', color: '#9c27b0', probText: '2.5%', desc: '开启60个必有一个奇珍或更高品质道具（奇珍全部获得前不会重复）' },
      { label: '独特', color: '#2196f3', probText: '15%', desc: '开启10个必有一个独特或更高品质道具' },
      { label: '罕见', color: '#4caf50', probText: '82%', desc: '常见品质' },
    ]
  }
  if (isOldStandard) {
    return [
      { label: '稀世', color: '#ff9800', probText: '0.5%', desc: '开启250个必有一个稀世品质道具' },
      { label: '奇珍', color: '#9c27b0', probText: '2.5%', desc: '开启60个必有一个奇珍或更高品质道具' },
      { label: '独特', color: '#2196f3', probText: '15%', desc: '开启10个必有一个独特或更高品质道具' },
      { label: '罕见', color: '#4caf50', probText: '50%', desc: '常见品质' },
      { label: '普通', color: '#9e9e9e', probText: '32%', desc: '最基础品质' },
    ]
  }
  return [
    { label: '稀世', color: '#ff9800', probText: '0.7%', desc: '开启200个必有一个稀世品质道具' },
    { label: '奇珍', color: '#9c27b0', probText: '2.5%', desc: '开启60个必有一个奇珍或更高品质道具（最多连续2次相同）' },
    { label: '独特', color: '#2196f3', probText: '15.3%', desc: '开启10个必有一个独特或更高品质道具' },
    { label: '罕见', color: '#4caf50', probText: '49.8%', desc: '常见品质' },
    { label: '普通', color: '#9e9e9e', probText: '31.7%', desc: '最基础品质' },
  ]
})

/** 判断是否为高稀有度（用于触发金色光效） */
function isHighRarity(rarity) {
  return rarity === 'legendary' || rarity === 'epic'
}

/** 打开充值弹窗 */
function openRecharge() {
  showInsufficient.value = false
  showRecharge.value = true
}

/** 执行充值 */
function doRecharge(tierAmount) {
  store.recharge(tierAmount)
  ElMessage?.success?.(`充值成功，获得回声`)
}

/** 从结果数组中提取最高稀有度，用于决定光效等级 */
function getHighestRarity(results) {
  const order = ['legendary', 'epic', 'unique', 'rare', 'common']
  for (const r of order) {
    if (results.some(item => item.rarity === r)) return r
  }
  return 'common'
}

/** 生成粒子动画样式（12 颗均匀分布） */
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

/** 核心抽卡流程：校验 → 扣费 → 抽卡 → 光效 → 弹窗 */
async function handleDraw(type) {
  if (isSpinning.value) return
  showPop.value = false

  const cost = type === 'ten' ? 960 : 96
  if (store.echoes < cost) {
    pendingDrawType.value = type
    showInsufficient.value = true
    return
  }

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

  // 碎片返还提示
  if (result.shardsReturned > 0) {
    ElMessage?.info?.(`本次抽取返还 ${result.shardsReturned} 碎片（${result.duplicateCount} 个重复道具）`)
  }

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
  showFragments.value = false
  popIndex.value = 0
  await new Promise(r => setTimeout(r, 100))
  showPop.value = true
  for (let i = 0; i < result.record.results.length; i++) {
    popIndex.value = i + 1
    await new Promise(r => setTimeout(r, 200))
  }

  // 延迟后，重复物品翻转为碎片展示
  const hasDuplicates = result.record.results.some(r => r.isDuplicate)
  if (hasDuplicates) {
    await new Promise(r => setTimeout(r, 800))
    showFragments.value = true
  }

  // 所有动画结束后，首次获得时装弹窗入队
  if (result.skinModals?.length > 0) {
    store.skinModalQueue.push(...result.skinModals)
  }

  isSpinning.value = false
}
</script>

<style scoped>
/* ===== 页面整体 ===== */
.gacha-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* ===== 顶部信息栏 ===== */
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

.fragment-top-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.echoes-top-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* ===== 精华池选择器 ===== */
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

/* ===== 抽卡主区域 ===== */
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

/* ===== 光效核心与粒子 ===== */
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
  width: 140px;
  height: 140px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #2a2520, #1a1510);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1510;
  box-shadow: 0 0 40px rgba(201, 162, 39, 0.2);
  transition: transform 0.3s;
  overflow: hidden;
}

.essence-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
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

/* ===== 抽卡结果展示 ===== */
.result-area {
  margin-bottom: 32px;
}

.result-area h3 {
  margin-bottom: 16px;
}

.result-placeholder {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  background: var(--bg-card);
  border: 1px dashed var(--border);
  border-radius: 12px;
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
  position: relative;
  width: 100px;
  height: 140px;
  border: 2px solid;
  border-radius: 10px;
  text-align: center;
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.4s ease;
  overflow: hidden;
}

.result-item.pop {
  opacity: 1;
  transform: scale(1);
}

.result-item.highlight {
  animation: glow 1.5s ease-in-out infinite alternate;
}

/* ===== 卡片翻转（正面 = 物品信息，背面 = 碎片返还） ===== */
.card-front,
.card-back {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  transition: opacity 0.3s ease, transform 0.4s ease;
  backface-visibility: hidden;
}

.card-back {
  opacity: 0;
  transform: rotateY(90deg);
  pointer-events: none;
}

.result-item.show-fragment .card-front {
  opacity: 0;
  transform: rotateY(-90deg);
}

.result-item.show-fragment .card-back {
  opacity: 1;
  transform: rotateY(0deg);
  pointer-events: auto;
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
  margin-bottom: 4px;
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

/* ===== 概率公示弹窗 ===== */
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

.records-collapse {
  margin-bottom: 32px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.records-collapse :deep(.el-collapse-item__header) {
  font-size: 16px;
  font-weight: bold;
  padding: 14px 20px;
  background: linear-gradient(135deg, #1a1510, #241e18);
  color: #e8dcc8;
  border-bottom: none;
  transition: background 0.2s ease;
}

.records-collapse :deep(.el-collapse-item__header:hover) {
  background: linear-gradient(135deg, #221c16, #2c2520);
}

.records-collapse :deep(.el-collapse-item__arrow) {
  color: #c9a227;
  font-size: 14px;
  font-weight: bold;
}

.records-collapse :deep(.el-collapse-item__wrap) {
  background: transparent;
  border-bottom: none;
}

.records-collapse :deep(.el-collapse-item__content) {
  padding: 16px 20px 20px;
  color: #e8dcc8;
}

.records-collapse-title {
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

.records-collapse :deep(.el-timeline) {
  padding-left: 8px;
}

.records-collapse :deep(.el-timeline-item__node) {
  background-color: #c9a227;
}

.records-collapse :deep(.el-timeline-item__tail) {
  border-left-color: #5a4d3e;
}

.records-collapse :deep(.el-timeline-item__timestamp) {
  color: #a89b8c;
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

.record-shards {
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

.expand-bar {
  text-align: center;
  margin-top: 12px;
  padding: 8px;
}

/* ===== 内容说明弹窗 ===== */
.content-btn {
  margin-top: 8px;
  color: #a89b8c;
}

.content-btn:hover {
  color: #c9a227;
}

.content-group {
  margin-bottom: 24px;
}

.content-group-title {
  text-align: center;
  color: #ffffff;
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 16px;
  padding: 10px 0;
  border-bottom: 2px solid #c9a227;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.content-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.content-card {
  width: 110px;
  background: var(--bg-card);
  border: 2px solid;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  opacity: 0.45;
  transition: opacity 0.2s;
  display: flex;
  flex-direction: column;
}

.content-card.owned {
  opacity: 1;
}

.content-card-img {
  width: 100%;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  padding: 6px;
}

.content-card-img img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.content-card-name {
  font-size: 12px;
  padding: 6px 8px 2px;
  color: #e8dcc8;
  line-height: 1.3;
  min-height: 36px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.content-card-tag {
  display: inline-block;
  margin: 0 auto 6px;
  background: linear-gradient(180deg, #c9a227, #a07d1a);
  color: #1a1510;
  font-size: 11px;
  font-weight: bold;
  padding: 2px 10px;
  border-radius: 10px;
}

/* ===== 回声不足按钮样式 ===== */
.gacha-actions .el-button.insufficient {
  opacity: 0.6;
  filter: grayscale(0.4);
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

/* ===== 回声不足提示弹窗 ===== */
.insufficient-modal {
  background: linear-gradient(180deg, #2a2520, #1e1a15);
  border: 1px solid #5a4d3e;
  border-radius: 16px;
  padding: 32px 28px 24px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}

.modal-text {
  color: #e8dcc8;
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.modal-text .highlight {
  color: #c9a227;
  font-weight: bold;
}

.echoes-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 24px;
  color: #c9a227;
}

.echoes-number {
  font-size: 24px;
  font-weight: bold;
}

.echoes-modal-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
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

.modal-btn.confirm {
  background: linear-gradient(135deg, #c9a227, #a88820);
  color: #1a1510;
}

.modal-btn.confirm:hover {
  background: linear-gradient(135deg, #d4b030, #b89425);
  transform: translateY(-1px);
}

/* ===== 充值弹窗 ===== */
.recharge-modal {
  background: linear-gradient(180deg, #2a2520, #1e1a15);
  border: 1px solid #5a4d3e;
  border-radius: 16px;
  max-width: 520px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}

.recharge-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #3d342b;
}

.recharge-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: #a89b8c;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
}

.close-btn:hover {
  color: #e8dcc8;
}

.recharge-body {
  padding: 20px;
}

.echoes-balance-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #2a2018, #3d2e20);
  border: 1px solid #c9a227;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #c9a227;
}

.echoes-balance-mini .echoes-label {
  font-size: 13px;
  color: #a89b8c;
}

.echoes-balance-mini .echoes-modal-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.echoes-balance-mini .echoes-value {
  font-size: 22px;
  font-weight: bold;
  margin-left: auto;
}

.tier-grid-mini {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.tier-card-mini {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tier-card-mini:hover {
  border-color: #c9a227;
  transform: translateY(-2px);
}

.tier-card-mini.first {
  border-color: #8a2c2c;
  background: linear-gradient(135deg, #241e18, #2a1818);
}

.tier-amount-mini {
  font-size: 20px;
  font-weight: bold;
  color: #e8dcc8;
  margin-bottom: 4px;
}

.tier-echoes-mini {
  font-size: 16px;
  margin-bottom: 2px;
}

.tier-echoes-mini .base {
  color: #e8dcc8;
}

.tier-echoes-mini .bonus {
  color: #ff4d4f;
  font-weight: bold;
}

.tier-total-mini {
  font-size: 12px;
  color: #c9a227;
}

.first-tag {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #ff4d4f;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

/* ===== 首次获得时装弹窗 ===== */
.skin-modal-overlay {
  z-index: 3000;
}

.skin-modal {
  background: linear-gradient(180deg, #2a2520, #1e1a15);
  border: 2px solid #c9a227;
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  padding: 32px 28px 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8);
}

.skin-modal-header {
  font-size: 20px;
  color: #e8dcc8;
  margin-bottom: 20px;
}

.skin-modal-header strong {
  color: #c9a227;
  font-size: 28px;
}

.skin-modal-body {
  margin-bottom: 24px;
}

.skin-modal-orb {
  width: 160px;
  height: 160px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #2a2520, #1a1510);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px rgba(201, 162, 39, 0.3);
  overflow: hidden;
}

.skin-modal-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.skin-modal-name {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 6px;
}

.skin-modal-char {
  font-size: 14px;
  color: #a89b8c;
}

.skin-modal-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* ===== 重复物品碎片展示 ===== */
.fragment-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin: 2px 0;
}

.fragment-count {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}

.fragment-label {
  font-size: 10px;
  color: #a89b8c;
  margin-bottom: 2px;
}

.duplicate-tag {
  font-size: 10px;
  color: #888;
  background: rgba(0, 0, 0, 0.3);
  padding: 1px 6px;
  border-radius: 4px;
  margin-top: 2px;
}
</style>

<style>
/* ===== 内容说明弹窗（非 scoped，因为 dialog teleport 到 body） ===== */
.content-modal .el-dialog {
  background: #1e1a15 !important;
  border: 1px solid #3d342b !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6) !important;
}

.content-modal .el-dialog__header {
  background: linear-gradient(135deg, #2a2520, #1e1a15) !important;
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #3d342b;
}

.content-modal .el-dialog__title {
  color: #e8dcc8 !important;
  font-weight: bold;
}

.content-modal .el-dialog__body {
  background: #1e1a15 !important;
  padding: 20px;
  color: #e8dcc8;
}

.content-modal .el-dialog__headerbtn .el-dialog__close {
  color: #a89b8c;
}

.content-modal .el-dialog__headerbtn:hover .el-dialog__close {
  color: #e8dcc8;
}
</style>
