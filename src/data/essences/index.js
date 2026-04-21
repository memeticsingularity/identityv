import { characters } from '../characters/index.js'
import { getItemById } from '../items/index.js'
import commonItems from './common-items.json'

// ===== 精华池注册（运行时注入） =====
let POOL_MAP = new Map()

export function setPools(pools) {
  POOL_MAP = new Map(Object.entries(pools))
  POOL_CONTENTS_CACHE.clear()
  ITEM_POOL_MAP_CACHE = null
}

// ===== 精华池内容缓存（解析后缓存，避免重复计算） =====
const POOL_CONTENTS_CACHE = new Map()

// ===== 稀有度中文 → 英文 key =====
export const RARITY_MAP = {
  '普通': 'common',
  '罕见': 'rare',
  '独特': 'unique',
  '奇珍': 'epic',
  '稀世': 'legendary',
  '虚妄杰作': 'legendary',
}

// ===== 通用道具索引 =====
const COMMON_INDEX = new Map(commonItems.map(i => [i.id, i]))

// ===== 角色道具查找 =====
function findCharacterItem(characterId, itemType, name) {
  const char = characters.find(c => c.id === characterId)
  if (!char) return null
  const items = char[itemType] || []
  const item = items.find(i => i.name === name)
  return item ? { item, char } : null
}

// ===== 解析单个引用 =====
export function resolveItem(ref, defaultRarity = 'common') {
  // 新格式：直接引用 itemId
  if (ref.itemId) {
    const item = getItemById(ref.itemId)
    if (item) {
      const char = item.characterId ? characters.find(c => c.id === item.characterId) : null
      return {
        id: item.id,
        name: item.name,
        nameEn: item.name,
        displayName: char ? `${char.name} - ${item.name}` : item.name,
        rarity: item.rarity,
        description: item.description || '',
        characterId: item.characterId,
        characterName: char?.name || '',
        characterNameEn: char?.englishName || char?.name || '',
        itemType: item.type === 'costume' ? 'skin' : item.type,
        source: 'item',
      }
    }
    return {
      id: ref.itemId,
      name: ref.itemId,
      nameEn: ref.itemId,
      displayName: ref.itemId,
      rarity: defaultRarity,
      description: '',
      source: 'item',
    }
  }

  // 旧格式：character 引用（兼容）
  if (ref.ref === 'character') {
    const found = findCharacterItem(ref.characterId, ref.itemType + 's', ref.name)
    if (found) {
      const { item, char } = found
      const rarity = RARITY_MAP[item.rarity] || defaultRarity
      return {
        name: item.name,
        nameEn: item.name,
        displayName: `${char.name} - ${item.name}`,
        rarity,
        description: item.description || '',
        characterId: ref.characterId,
        characterName: char.name,
        characterNameEn: char.englishName || char.name,
        itemType: ref.itemType,
        source: 'character',
      }
    }
    // fallback：角色数据中找不到时，用内联兜底
    const char = characters.find(c => c.id === ref.characterId)
    const charName = char?.name || ref.characterId
    const charNameEn = char?.englishName || charName
    return {
      name: ref.name,
      nameEn: ref.name,
      displayName: `${charName} - ${ref.name}`,
      rarity: ref.rarity || defaultRarity,
      description: '',
      characterId: ref.characterId,
      characterName: charName,
      characterNameEn: charNameEn,
      itemType: ref.itemType,
      source: 'character',
    }
  }

  // 旧格式：common 引用（兼容）
  if (ref.ref === 'common') {
    const item = COMMON_INDEX.get(ref.id)
    if (item) {
      return {
        id: ref.id,
        name: item.name,
        nameEn: item.nameEn || item.name,
        displayName: item.name,
        rarity: item.rarity,
        description: '',
        category: item.category,
        source: 'common',
      }
    }
    return {
      id: ref.id,
      name: ref.id,
      nameEn: ref.id,
      displayName: ref.id,
      rarity: defaultRarity,
      description: '',
      source: 'common',
    }
  }

  return null
}

// ===== 获取精华池完整内容（按稀有度分组） =====
export function getPoolContents(poolId) {
  if (POOL_CONTENTS_CACHE.has(poolId)) {
    return POOL_CONTENTS_CACHE.get(poolId)
  }

  const pool = POOL_MAP.get(poolId)
  if (!pool) return null

  const result = {}
  for (const [rarity, refs] of Object.entries(pool.contents)) {
    result[rarity] = refs.map(ref => resolveItem(ref, rarity)).filter(Boolean)
  }

  POOL_CONTENTS_CACHE.set(poolId, result)
  return result
}

// ===== 从精华池中按稀有度抽取一个道具 =====
export function drawFromPool(poolId, rarity) {
  const contents = getPoolContents(poolId)
  if (!contents || !contents[rarity] || contents[rarity].length === 0) {
    return null
  }
  const items = contents[rarity]
  return items[Math.floor(Math.random() * items.length)]
}

// ===== 检查精华池是否有配置 =====
export function hasRealPool(poolId) {
  return POOL_MAP.has(poolId)
}

// ===== 为引用生成稳定 key（用于收藏册去重） =====
export function getItemKey(ref) {
  if (ref.itemId) {
    return `item:${ref.itemId}`
  }
  if (ref.ref === 'character') {
    return `character:${ref.characterId}:${ref.itemType}:${ref.name}`
  }
  if (ref.ref === 'common') {
    return `common:${ref.id}`
  }
  return null
}

// ===== 构建全物品目录（所有精华池中的物品，去重） =====
export function buildItemCatalog() {
  const catalog = []
  const seen = new Set()

  for (const [poolId, pool] of POOL_MAP) {
    for (const [rarity, refs] of Object.entries(pool.contents)) {
      for (const ref of refs) {
        const key = getItemKey(ref)
        if (!key || seen.has(key)) continue
        seen.add(key)

        const item = resolveItem(ref, rarity)
        if (!item) continue

        catalog.push({
          key,
          poolId,
          rarity,
          ...item,
        })
      }
    }
  }

  return catalog
}

// ===== 构建物品 key → 精华池 ID 映射 =====
let ITEM_POOL_MAP_CACHE = null

export function getItemPoolMap() {
  if (ITEM_POOL_MAP_CACHE) return ITEM_POOL_MAP_CACHE

  const map = new Map()
  for (const [poolId, pool] of POOL_MAP) {
    for (const refs of Object.values(pool.contents)) {
      for (const ref of refs) {
        const key = getItemKey(ref)
        if (key) map.set(key, poolId)
      }
    }
  }

  ITEM_POOL_MAP_CACHE = map
  return map
}

export function getItemPool(key) {
  return getItemPoolMap().get(key) || null
}
