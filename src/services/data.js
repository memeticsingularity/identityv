import { characters, setCharacters } from '../data/characters/index.js'
import { allItems, setItems, getItemsByCharacter } from '../data/items/index.js'
import { setPools } from '../data/essences/index.js'

const BASE = import.meta.env.BASE_URL || '/'

const cache = new Map()

async function fetchJSON(path) {
  if (cache.has(path)) return cache.get(path)
  const res = await fetch(`${BASE}data/${path}`)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  const data = await res.json()
  cache.set(path, data)
  return data
}

export async function loadGameData() {
  const [
    charsData,
    itemsData,
    poolsData,
  ] = await Promise.all([
    fetchJSON('characters/index.json'),
    fetchJSON('items/index.json'),
    fetchJSON('essences/pools.json'),
  ])

  setCharacters(charsData)
  setItems(itemsData)

  // 用 items 数据覆盖角色上的物品挂载（保持与旧逻辑一致）
  for (const char of characters) {
    char.skins = getItemsByCharacter(char.id, 'costume')
    char.accessories = getItemsByCharacter(char.id, 'accessory')
    char.emotes = getItemsByCharacter(char.id, 'emote')
    char.graffitis = getItemsByCharacter(char.id, 'graffiti')
  }

  setPools(poolsData)

  return { characters, items: allItems, pools: poolsData }
}
