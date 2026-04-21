export const allItems = []

let ITEM_INDEX = new Map()

export function setItems(data) {
  allItems.length = 0
  allItems.push(...data)
  ITEM_INDEX = new Map(data.map(i => [i.id, i]))
}

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
