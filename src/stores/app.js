import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// ===== 充值档位配置 =====
export const RECHARGE_TIERS = [
  { amount: 1, base: 10, bonus: 0, firstBonus: 10 },
  { amount: 6, base: 60, bonus: 0, firstBonus: 60 },
  { amount: 30, base: 300, bonus: 15, firstBonus: 150 },
  { amount: 68, base: 680, bonus: 33, firstBonus: 198 },
  { amount: 128, base: 1280, bonus: 68, firstBonus: 258 },
  { amount: 198, base: 1980, bonus: 98, firstBonus: 398 },
  { amount: 328, base: 3280, bonus: 168, firstBonus: 658 },
  { amount: 648, base: 6480, bonus: 328, firstBonus: 1298 },
]

// ===== 抽卡品质配置 =====
export const RARITY_CONFIG = {
  common: { label: '普通', color: '#9e9e9e', bg: '#f5f5f5', prob: 0.317 },
  rare: { label: '罕见', color: '#4caf50', bg: '#e8f5e9', prob: 0.498 },
  unique: { label: '独特', color: '#2196f3', bg: '#e3f2fd', prob: 0.153 },
  epic: { label: '奇珍', color: '#9c27b0', bg: '#f3e5f5', prob: 0.025 },
  legendary: { label: '稀世', color: '#ff9800', bg: '#fff3e0', prob: 0.007 },
}

// ===== 精华池配置 =====
export const ESSENCE_POOLS = [
  { id: 's42-e1', name: '第42赛季·精华1', season: 42 },
  { id: 's42-e2', name: '第42赛季·精华2', season: 42 },
  { id: 's42-e3', name: '第42赛季·精华3', season: 42 },
  { id: 's41-e1', name: '第41赛季·精华1', season: 41 },
  { id: 's41-e2', name: '第41赛季·精华2', season: 41 },
  { id: 's41-e3', name: '第41赛季·精华3', season: 41 },
  { id: 'memory', name: '记忆珍宝', season: 0 },
  { id: 'rank', name: '排位珍宝', season: 0 },
  { id: 'crossover', name: '联动精华', season: 0 },
]

// 生成级联选择器选项（按赛季分组）
export const POOL_CASCADER_OPTIONS = (() => {
  const seasonMap = new Map()
  const special = []

  for (const pool of ESSENCE_POOLS) {
    if (pool.season === 0) {
      special.push({ value: pool.id, label: pool.name })
    } else {
      if (!seasonMap.has(pool.season)) {
        seasonMap.set(pool.season, {
          value: pool.season,
          label: `第${pool.season}赛季`,
          children: [],
        })
      }
      seasonMap.get(pool.season).children.push({
        value: pool.id,
        label: pool.name.replace(`第${pool.season}赛季·`, ''),
      })
    }
  }

  const seasons = Array.from(seasonMap.values()).sort((a, b) => b.value - a.value)
  return [...seasons, ...special]
})()

function createEmptyPool() {
  return {
    drawCount: 0,
    pity: { unique: 0, epic: 0, legendary: 0 },
    drawRecords: [],
    rarityStats: { common: 0, rare: 0, unique: 0, epic: 0, legendary: 0 },
  }
}

// ===== 模拟物品生成器 =====
const ITEM_TEMPLATES = {
  common: ['旧装', '通用涂鸦·I', '通用涂鸦·II', '通用等待动作', '残影'],
  rare: ['个性动作·起舞', '个性动作·躺下', '个性动作·呐喊', '等待动作·张望', '等待动作·小憩'],
  unique: ['独特时装', '独特随身物品', '独特随从', '独特涂鸦', '独特头像框'],
  epic: ['奇珍时装', '奇珍随身物品', '奇珍随从', '奇珍挂件'],
  legendary: ['稀世时装', '稀世随身物品', '稀世随从', '稀世挂件'],
}

function generateItem(rarity) {
  const templates = ITEM_TEMPLATES[rarity]
  const name = templates[Math.floor(Math.random() * templates.length)]
  const id = `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  return {
    id,
    name,
    rarity,
  }
}

// ===== Store =====
export const useAppStore = defineStore('app', () => {
  // --- 充值状态 ---
  const echoes = ref(0)
  const totalRecharged = ref(0)
  const rechargeRecords = ref([])
  const tierCounts = ref({})
  RECHARGE_TIERS.forEach(t => { tierCounts.value[t.amount] = 0 })

  // --- 精华池状态 ---
  const currentPoolId = ref('s42-e3')
  const pools = ref({})

  // 初始化所有精华池（补充缺失的新池子）
  ESSENCE_POOLS.forEach(pool => {
    if (!pools.value[pool.id]) {
      pools.value[pool.id] = createEmptyPool()
    }
  })

  // --- 计算属性：当前池子 ---
  const currentPool = computed(() => pools.value[currentPoolId.value])

  const currentPoolInfo = computed(() => {
    return ESSENCE_POOLS.find(p => p.id === currentPoolId.value)
  })

  const totalDraws = computed(() =>
    Object.values(pools.value).reduce((sum, p) => sum + p.drawCount, 0)
  )

  const totalEchoesSpent = computed(() =>
    Object.values(pools.value).reduce((sum, p) =>
      sum + p.drawRecords.reduce((s, r) => s + r.cost, 0), 0)
  )

  const globalRarityStats = computed(() => {
    const stats = { common: 0, rare: 0, unique: 0, epic: 0, legendary: 0 }
    Object.values(pools.value).forEach(pool => {
      Object.keys(stats).forEach(k => { stats[k] += pool.rarityStats[k] })
    })
    return stats
  })

  // 当前池子提示信息
  const poolTips = computed(() => {
    const pool = currentPool.value
    return {
      drawCount: pool.drawCount,
      legendaryCount: pool.rarityStats.legendary,
      epicCount: pool.rarityStats.epic,
      nextLegendary: Math.max(0, 200 - pool.pity.legendary),
      nextEpic: Math.max(0, 60 - pool.pity.epic),
      nextUnique: Math.max(0, 10 - pool.pity.unique),
    }
  })

  // --- Actions ---
  function recharge(tierAmount) {
    const tier = RECHARGE_TIERS.find(t => t.amount === tierAmount)
    if (!tier) return

    const isFirst = tierCounts.value[tierAmount] === 0
    const echoesReceived = tier.base + (isFirst ? tier.firstBonus : tier.bonus)

    echoes.value += echoesReceived
    totalRecharged.value += tier.amount
    tierCounts.value[tierAmount]++

    rechargeRecords.value.unshift({
      id: `rc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tier: tierAmount,
      isFirst,
      amount: tier.amount,
      echoesReceived,
      timestamp: Date.now(),
    })
  }

  function _performSingleDraw(pool) {
    pool.pity.unique++
    pool.pity.epic++
    pool.pity.legendary++
    pool.drawCount++

    let rarity
    const rand = Math.random()

    // 200抽金保底
    if (pool.pity.legendary >= 200) {
      rarity = 'legendary'
    }
    // 60抽紫保底
    else if (pool.pity.epic >= 60) {
      // 紫保底时，先判定是否出金（独立概率）
      rarity = rand < 0.007 ? 'legendary' : 'epic'
    }
    // 10抽蓝保底
    else if (pool.pity.unique >= 10) {
      if (rand < 0.007) rarity = 'legendary'
      else if (rand < 0.032) rarity = 'epic'
      else rarity = 'unique'
    }
    // 基础概率
    else {
      if (rand < 0.007) rarity = 'legendary'
      else if (rand < 0.032) rarity = 'epic'
      else if (rand < 0.185) rarity = 'unique'
      else if (rand < 0.683) rarity = 'rare'
      else rarity = 'common'
    }

    // 更新计数器 — 关键：出金只清金保底，不清紫保底！
    if (rarity === 'legendary') {
      pool.pity.legendary = 0
      pool.pity.unique = 0
      // epic 不清零！金不顶紫保底
    } else if (rarity === 'epic') {
      pool.pity.epic = 0
      pool.pity.unique = 0
      // legendary 不清零
    } else if (rarity === 'unique') {
      pool.pity.unique = 0
      // epic 和 legendary 不清零
    }
    // common/rare：三个计数器都已经++过了，不需要额外操作

    pool.rarityStats[rarity]++
    return generateItem(rarity)
  }

  function draw(type) {
    const cost = type === 'ten' ? 960 : 96
    if (echoes.value < cost) return { success: false, message: '回声不足，请充值' }

    echoes.value -= cost
    const pool = currentPool.value
    const count = type === 'ten' ? 10 : 1
    const results = []
    for (let i = 0; i < count; i++) {
      results.push(_performSingleDraw(pool))
    }

    const record = {
      id: `dr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      poolId: currentPoolId.value,
      poolName: currentPoolInfo.value.name,
      type,
      cost,
      results,
      timestamp: Date.now(),
    }
    pool.drawRecords.unshift(record)
    return { success: true, record }
  }

  function switchPool(poolId) {
    if (pools.value[poolId]) {
      currentPoolId.value = poolId
    }
  }

  function formatDate(ts) {
    const d = new Date(ts)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
  }

  return {
    echoes,
    totalRecharged,
    rechargeRecords,
    tierCounts,
    currentPoolId,
    pools,
    currentPool,
    currentPoolInfo,
    totalDraws,
    totalEchoesSpent,
    globalRarityStats,
    poolTips,
    recharge,
    draw,
    switchPool,
    formatDate,
  }
}, {
  persist: {
    pick: ['echoes', 'totalRecharged', 'rechargeRecords', 'tierCounts', 'currentPoolId', 'pools'],
  },
})
