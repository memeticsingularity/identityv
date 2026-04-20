import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { hasRealPool, drawFromPool, buildItemCatalog, getItemKey, getPoolContents } from '../data/essences/index.js'
import { getItemById, getAllItems } from '../data/items/index.js'
import { loadGameData } from '../services/data.js'

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
  { id: 's1-e1', name: '第1赛季·精华1', season: 1, type: 'standard', number: 1, legendaryPity: 250, releaseDate: '2018-04-02', endDate: '2018-04-12' },
  { id: 's1-e2', name: '第1赛季·精华2', season: 1, type: 'standard', number: 2, legendaryPity: 250, releaseDate: '2018-04-12', endDate: '2018-04-29' },
  { id: 's1-e3', name: '第1赛季·精华3', season: 1, type: 'standard', number: 3, legendaryPity: 250, releaseDate: '2018-04-29', endDate: '2018-05-24' },
  { id: 's42-e1', name: '第42赛季·精华1', season: 42, type: 'standard', number: 1, legendaryPity: 200, releaseDate: '2026-02-05', endDate: '2026-04-23' },
  { id: 's42-e2', name: '第42赛季·精华2', season: 42, type: 'standard', number: 2, legendaryPity: 200, releaseDate: '2026-02-27', endDate: '2026-04-23' },
  { id: 's42-e3', name: '第42赛季·精华3', season: 42, type: 'standard', number: 3, legendaryPity: 200, releaseDate: '2026-04-02', endDate: '2026-04-23' },
  { id: 's41-e1', name: '第41赛季·精华1', season: 41, type: 'standard', number: 1, legendaryPity: 200 },
  { id: 's41-e2', name: '第41赛季·精华2', season: 41, type: 'standard', number: 2, legendaryPity: 200 },
  { id: 's41-e3', name: '第41赛季·精华3', season: 41, type: 'standard', number: 3, legendaryPity: 200 },
  { id: 'abyss-01', name: '深渊珍宝Ⅰ', season: 0, type: 'abyss', number: 1, releaseDate: '2018-07-26', endDate: '2018-08-09' },
  { id: 'abyss-02', name: '深渊珍宝Ⅱ', season: 0, type: 'abyss', number: 2, releaseDate: '2019-01-03', endDate: '2019-02-28' },
  { id: 'abyss-03', name: '深渊珍宝Ⅲ', season: 0, type: 'abyss', number: 3, releaseDate: '2019-12-26', endDate: '2020-02-20' },
  { id: 'abyss-04', name: '深渊珍宝Ⅳ', season: 0, type: 'abyss', number: 4, releaseDate: '2021-01-21', endDate: '2021-02-23' },
  { id: 'abyss-05', name: '深渊珍宝Ⅴ', season: 0, type: 'abyss', number: 5, releaseDate: '2021-12-30', endDate: '2022-02-17' },
  { id: 'abyss-06', name: '深渊珍宝Ⅵ', season: 0, type: 'abyss', number: 6, releaseDate: '2022-12-29', endDate: '2023-02-02' },
  { id: 'abyss-07', name: '深渊珍宝Ⅶ', season: 0, type: 'abyss', number: 7, releaseDate: '2024-01-11', endDate: '2024-03-21' },
  { id: 'abyss-08', name: '深渊珍宝Ⅷ', season: 0, type: 'abyss', number: 8, releaseDate: '2025-01-02', endDate: '2025-05-04' },
  { id: 'abyss-09', name: '深渊珍宝Ⅸ', season: 0, type: 'abyss', number: 9, releaseDate: '2026-01-08', endDate: '2026-05-05' },
  { id: 'memory', name: '记忆珍宝', season: 0, type: 'memory' },
  { id: 'rank', name: '排位珍宝', season: 0, type: 'rank' },
  { id: 'crossover', name: '联动精华', season: 0, type: 'special', icon: '/assets/essences/special/crossover.png' },
]

// 获取精华图标路径
export function getEssenceIcon(pool) {
  if (!pool) return '/assets/essences/standard-1.png'
  if (pool.icon) return pool.icon
  if (pool.type === 'standard' && pool.number) {
    return `/assets/essences/standard-${pool.number}.png`
  }
  if (pool.type === 'memory') return '/assets/essences/memory.png'
  if (pool.type === 'rank') return `/assets/essences/rank-${String(pool.rank || 1).padStart(2, '0')}.png`
  if (pool.type === 'abyss') return `/assets/essences/abyss/abyss-${String(pool.number || 1).padStart(2, '0')}.png`
  if (pool.type === 'story') return `/assets/essences/story-s${pool.season}-e${pool.number}.png`
  if (pool.type === 'crossover') return `/assets/essences/crossover-${pool.crossoverId}.png`
  return '/assets/essences/standard-1.png'
}

// 生成级联选择器选项（按赛季分组）
export const POOL_CASCADER_OPTIONS = (() => {
  const seasonMap = new Map()
  const abyssGroup = []
  const special = []

  for (const pool of ESSENCE_POOLS) {
    if (pool.type === 'abyss') {
      abyssGroup.push({ value: pool.id, label: pool.name })
    } else if (pool.season === 0) {
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
  const groups = [...seasons]
  if (abyssGroup.length > 0) {
    groups.push({ value: 'abyss', label: '深渊的呼唤', children: abyssGroup })
  }
  return [...groups, ...special]
})()

function createEmptyPool() {
  return {
    drawCount: 0,
    pity: { unique: 0, epic: 0, legendary: 0 },
    drawRecords: [],
    rarityStats: { common: 0, rare: 0, unique: 0, epic: 0, legendary: 0 },
    obtainedEpics: [],
    lastEpics: [],
    totalShardsReturned: 0,
  }
}

// ===== 碎片返还规则 =====
export const SHARD_RETURN = {
  legendary: 2000,
  epic: 1000,
  unique: 200,
  rare: 36,
  common: 6,
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

// ===== 收藏数据迁移：旧 key 格式 → 新 item:xxx 格式 =====
function migrateOwnedData(items, order) {
  const migratedItems = []
  const migratedOrder = []
  const seen = new Set()

  for (const key of items) {
    if (key.startsWith('item:')) {
      if (!seen.has(key)) {
        migratedItems.push(key)
        seen.add(key)
      }
      continue
    }

    let newKey = key
    const parts = key.split(':')
    if (parts[0] === 'character' && parts.length === 4) {
      const [, characterId, itemType, name] = parts
      const type = itemType === 'skin' ? 'costume' : itemType
      const found = getAllItems().find(i =>
        i.characterId === characterId && i.type === type && i.name === name
      )
      if (found) newKey = `item:${found.id}`
    } else if (parts[0] === 'common' && parts.length === 2) {
      const [, id] = parts
      const found = getItemById(id)
      if (found) newKey = `item:${found.id}`
    }

    if (!seen.has(newKey)) {
      migratedItems.push(newKey)
      seen.add(newKey)
    }
  }

  for (const o of order) {
    let newKey = o.key
    const parts = o.key.split(':')
    if (parts[0] === 'character' && parts.length === 4) {
      const [, characterId, itemType, name] = parts
      const type = itemType === 'skin' ? 'costume' : itemType
      const found = getAllItems().find(i =>
        i.characterId === characterId && i.type === type && i.name === name
      )
      if (found) newKey = `item:${found.id}`
    } else if (parts[0] === 'common' && parts.length === 2) {
      const [, id] = parts
      const found = getItemById(id)
      if (found) newKey = `item:${found.id}`
    }
    migratedOrder.push({ ...o, key: newKey })
  }

  return { items: migratedItems, order: migratedOrder }
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

  // --- 收藏册状态（Set 用数组持久化） ---
  const ownedItems = ref([]) // 存储稳定 key 字符串数组
  const ownedOrder = ref([]) // { key, timestamp }[]

  // --- 数据加载状态 ---
  const isDataLoaded = ref(false)
  const dataLoadError = ref(null)

  // --- 碎片系统 ---
  const shards = ref(0)
  const totalShardsEarned = ref(0)

  // --- 时装计数（用于首次获得弹窗：记录第 X 件时装） ---
  const skinCount = ref(0)

  // --- 首次获得时装弹窗队列 ---
  const skinModalQueue = ref([])

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
    const poolInfo = currentPoolInfo.value
    const isAbyss = poolInfo?.type === 'abyss'
    const legendaryPity = isAbyss ? 250 : (poolInfo?.legendaryPity || 200)
    return {
      drawCount: pool.drawCount,
      legendaryCount: pool.rarityStats.legendary,
      epicCount: pool.rarityStats.epic,
      nextLegendary: Math.max(0, legendaryPity - pool.pity.legendary),
      nextEpic: Math.max(0, 60 - pool.pity.epic),
      nextUnique: Math.max(0, 10 - pool.pity.unique),
    }
  })

  // 收藏册统计
  const collectionStats = computed(() => {
    const catalog = buildItemCatalog()
    const ownedSet = new Set(ownedItems.value)
    const stats = {}
    const order = ['legendary', 'epic', 'unique', 'rare', 'common']
    for (const r of order) {
      const total = catalog.filter(i => i.rarity === r).length
      const obtained = catalog.filter(i => i.rarity === r && ownedSet.has(i.key)).length
      stats[r] = { total, obtained }
    }
    const totalAll = catalog.length
    const obtainedAll = catalog.filter(i => ownedSet.has(i.key)).length
    return { byRarity: stats, total: totalAll, obtained: obtainedAll }
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

    const poolInfo = currentPoolInfo.value
    const isAbyss = poolInfo?.type === 'abyss'
    const legendaryPity = isAbyss ? 250 : (poolInfo?.legendaryPity || 200)
    const isOldStandard = !isAbyss && legendaryPity === 250
    // 29-1 及之后的常规精华才有「最多连续2次相同奇珍」规则
    const hasEpicConsecutiveLimit = poolInfo?.type === 'standard' && (
      (poolInfo?.season || 0) > 29 || ((poolInfo?.season || 0) === 29 && (poolInfo?.number || 0) >= 1)
    )
    let rarity
    const rand = Math.random()

    if (isAbyss) {
      // ===== 深渊珍宝概率（无普通品质） =====
      // 250抽金保底
      if (pool.pity.legendary >= 250) {
        rarity = 'legendary'
      }
      // 60抽紫保底
      else if (pool.pity.epic >= 60) {
        rarity = rand < 0.005 ? 'legendary' : 'epic'
      }
      // 10抽蓝保底
      else if (pool.pity.unique >= 10) {
        if (rand < 0.005) rarity = 'legendary'
        else if (rand < 0.03) rarity = 'epic'
        else rarity = 'unique'
      }
      // 基础概率：金0.5% 紫2.5% 蓝15% 罕见82%
      else {
        if (rand < 0.005) rarity = 'legendary'
        else if (rand < 0.03) rarity = 'epic'
        else if (rand < 0.18) rarity = 'unique'
        else rarity = 'rare'
      }
    } else if (isOldStandard) {
      // ===== 旧标准精华池（37赛季精华3之前）：金0.5% 250保底，奇珍无连续限制 =====
      if (pool.pity.legendary >= 250) {
        rarity = 'legendary'
      }
      else if (pool.pity.epic >= 60) {
        rarity = rand < 0.005 ? 'legendary' : 'epic'
      }
      else if (pool.pity.unique >= 10) {
        if (rand < 0.005) rarity = 'legendary'
        else if (rand < 0.03) rarity = 'epic'
        else rarity = 'unique'
      }
      // 基础概率：0.5+2.5+15+50+32=100
      else {
        if (rand < 0.005) rarity = 'legendary'
        else if (rand < 0.03) rarity = 'epic'
        else if (rand < 0.18) rarity = 'unique'
        else if (rand < 0.68) rarity = 'rare'
        else rarity = 'common'
      }
    } else {
      // ===== 新标准精华池（37赛季精华3及之后）：金0.7% 200保底，29-1及之后奇珍限连续2次相同 =====
      if (pool.pity.legendary >= 200) {
        rarity = 'legendary'
      }
      else if (pool.pity.epic >= 60) {
        rarity = rand < 0.007 ? 'legendary' : 'epic'
      }
      else if (pool.pity.unique >= 10) {
        if (rand < 0.007) rarity = 'legendary'
        else if (rand < 0.032) rarity = 'epic'
        else rarity = 'unique'
      }
      // 基础概率：0.7+2.5+15.3+49.8+31.7=100
      else {
        if (rand < 0.007) rarity = 'legendary'
        else if (rand < 0.032) rarity = 'epic'
        else if (rand < 0.185) rarity = 'unique'
        else if (rand < 0.683) rarity = 'rare'
        else rarity = 'common'
      }
    }

    // 更新计数器
    if (rarity === 'legendary') {
      pool.pity.legendary = 0
      pool.pity.unique = 0
    } else if (rarity === 'epic') {
      pool.pity.epic = 0
      pool.pity.unique = 0
    } else if (rarity === 'unique') {
      pool.pity.unique = 0
    }

    pool.rarityStats[rarity]++

    // 优先从真实精华池配置中抽取
    let realItem = hasRealPool(currentPoolId.value)
      ? drawFromPool(currentPoolId.value, rarity)
      : null

    // ===== 深渊池 epic 去重：全部获得之前不会重复 =====
    if (isAbyss && rarity === 'epic' && realItem) {
      const obtained = new Set(pool.obtainedEpics || [])
      if (obtained.has(realItem.displayName)) {
        const contents = getPoolContents(currentPoolId.value)
        const available = contents?.epic?.filter(i => !obtained.has(i.displayName))
        if (available && available.length > 0) {
          realItem = available[Math.floor(Math.random() * available.length)]
        }
      }
      if (!pool.obtainedEpics) pool.obtainedEpics = []
      if (!pool.obtainedEpics.includes(realItem.displayName)) {
        pool.obtainedEpics.push(realItem.displayName)
      }
    }

    // ===== 新标准池 epic 防连续重复：最多连续2次相同（29赛季精华1之后） =====
    if (hasEpicConsecutiveLimit && rarity === 'epic' && realItem) {
      const lastEpics = pool.lastEpics || []
      if (lastEpics.length >= 2 &&
          lastEpics[0] === lastEpics[1] &&
          lastEpics[0] === realItem.displayName) {
        const contents = getPoolContents(currentPoolId.value)
        const others = contents?.epic?.filter(i => i.displayName !== realItem.displayName)
        if (others && others.length > 0) {
          realItem = others[Math.floor(Math.random() * others.length)]
        }
      }
      if (!pool.lastEpics) pool.lastEpics = []
      pool.lastEpics.unshift(realItem.displayName)
      if (pool.lastEpics.length > 2) pool.lastEpics.pop()
    }

    if (realItem) {
      return {
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        ...realItem,
      }
    }

    // fallback：没有真实配置时，用 dummy 生成
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

    // 记录收藏册、碎片、首次获得弹窗
    let shardsReturned = 0
    let duplicateCount = 0
    const skinModals = []

    for (const item of results) {
      let key = null
      if (item.source === 'item' && item.id) {
        key = `item:${item.id}`
      } else if (item.characterId && item.itemType && item.name) {
        key = `character:${item.characterId}:${item.itemType}:${item.name}`
      } else if (item.source === 'common' && item.id) {
        key = `common:${item.id}`
      }

      const alreadyOwned = key ? ownedItems.value.includes(key) : false

      if (key && !alreadyOwned) {
        ownedItems.value.push(key)
        ownedOrder.value.push({ key, timestamp: Date.now() })

        // 首次获得时装 → 弹窗
        if (item.itemType === 'skin') {
          skinCount.value++
          skinModals.push({
            skinCount: skinCount.value,
            displayName: item.displayName || item.name,
            rarity: item.rarity,
            characterName: item.characterName || '',
          })
        }
      } else if (alreadyOwned) {
        const returned = SHARD_RETURN[item.rarity] || 0
        shards.value += returned
        totalShardsEarned.value += returned
        shardsReturned += returned
        duplicateCount++
        item.isDuplicate = true
        item.shardsReturned = returned
      }
    }

    const record = {
      id: `dr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      poolId: currentPoolId.value,
      poolName: currentPoolInfo.value.name,
      type,
      cost,
      results,
      timestamp: Date.now(),
      shardsReturned,
      duplicateCount,
    }
    pool.drawRecords.unshift(record)
    pool.totalShardsReturned += shardsReturned

    return { success: true, record, shardsReturned, duplicateCount, skinModals }
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

  function closeSkinModal() {
    skinModalQueue.value.shift()
  }

  async function init() {
    if (isDataLoaded.value) return
    try {
      await loadGameData()
      // 数据迁移（旧 key → 新 item:xxx 格式）
      const migrated = migrateOwnedData(ownedItems.value, ownedOrder.value)
      ownedItems.value = migrated.items
      ownedOrder.value = migrated.order

      // 兼容旧数据：补充池子级 totalShardsReturned
      Object.values(pools.value).forEach(pool => {
        if (typeof pool.totalShardsReturned !== 'number') {
          pool.totalShardsReturned = pool.drawRecords.reduce((sum, r) => sum + (r.shardsReturned || 0), 0)
        }
      })

      isDataLoaded.value = true
    } catch (err) {
      dataLoadError.value = err.message || '数据加载失败'
      console.error('[appStore] init failed:', err)
      throw err
    }
  }

  function resetAccount() {
    localStorage.removeItem('app')
    location.reload()
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
    ownedItems,
    ownedOrder,
    collectionStats,
    shards,
    totalShardsEarned,
    skinCount,
    skinModalQueue,
    isDataLoaded,
    dataLoadError,
    recharge,
    draw,
    switchPool,
    formatDate,
    closeSkinModal,
    init,
    resetAccount,
  }
}, {
  persist: {
    pick: ['echoes', 'totalRecharged', 'rechargeRecords', 'tierCounts', 'currentPoolId', 'pools', 'ownedItems', 'ownedOrder', 'shards', 'totalShardsEarned', 'skinCount'],
  },
})
