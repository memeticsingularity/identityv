// ===== 用 import.meta.glob 自动收集所有分类文件 =====
const costumeModules = import.meta.glob('./costumes/**/*.json', { eager: true })
const accessoryModules = import.meta.glob('./accessories/**/*.json', { eager: true })
const emoteModules = import.meta.glob('./emotes/**/*.json', { eager: true })
const graffitiModules = import.meta.glob('./graffitis/**/*.json', { eager: true })
const avatarModules = import.meta.glob('./avatars/**/*.json', { eager: true })
const markModules = import.meta.glob('./marks/**/*.json', { eager: true })
const petModules = import.meta.glob('./pets/**/*.json', { eager: true })

const allModules = [
  ...Object.values(costumeModules),
  ...Object.values(accessoryModules),
  ...Object.values(emoteModules),
  ...Object.values(graffitiModules),
  ...Object.values(avatarModules),
  ...Object.values(markModules),
  ...Object.values(petModules),
]

// 合并为统一物品数组（兼容旧 common-items 的 category → type 映射）
const fileItems = allModules.flatMap(m => {
  const items = m.default || []
  return items.map(i => {
    if (i.category && !i.type) {
      return { ...i, type: i.category }
    }
    return i
  })
})

const allItems = fileItems

// ===== 全局索引 =====
const ITEM_INDEX = new Map(allItems.map(i => [i.id, i]))

export function getItemById(id) {
  return ITEM_INDEX.get(id) || null
}

export function getItemsByCharacter(characterId, type) {
  return allItems.filter(i => i.characterId === characterId && (!type || i.type === type))
}

export function getItemsByPool(poolId) {
  return allItems.filter(i =>
    i.obtainSources?.some(s => s.source === 'essence' && s.poolId === poolId)
  )
}

export function getAllItems() {
  return allItems
}
