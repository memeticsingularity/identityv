const fs = require('fs')
const path = require('path')

const SRC_DATA = path.resolve(__dirname, '../src/data')
const OUT_DIR = path.resolve(__dirname, '../public/data')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

// ===== 1. Characters =====
function buildCharacters() {
  const charsDir = path.join(SRC_DATA, 'characters')
  const characters = []

  for (const faction of ['survivors', 'hunters', 'npcs']) {
    const factionDir = path.join(charsDir, faction)
    if (!fs.existsSync(factionDir)) continue

    for (const charDirName of fs.readdirSync(factionDir)) {
      const charDir = path.join(factionDir, charDirName)
      const stat = fs.statSync(charDir)
      if (!stat.isDirectory()) continue

      const files = fs.readdirSync(charDir).filter(f => f.endsWith('.json'))
      const char = {}

      for (const file of files) {
        const key = file.replace('.json', '')
        const data = readJSON(path.join(charDir, file))
        if (key === 'profile' || key === 'gameplay') {
          Object.assign(char, data)
        } else {
          char[key] = data
        }
      }

      characters.push(char)
    }
  }

  const outFile = path.join(OUT_DIR, 'characters', 'index.json')
  ensureDir(path.dirname(outFile))
  fs.writeFileSync(outFile, JSON.stringify(characters, null, 2))
  console.log(`[build-data] characters -> ${outFile} (${characters.length} chars)`)
}

// ===== 2. Items =====
function buildItems() {
  const itemsDir = path.join(SRC_DATA, 'items')
  const allItems = []

  const typeDirs = ['costumes', 'accessories', 'emotes', 'graffitis', 'avatars', 'marks', 'pets']
  for (const typeDir of typeDirs) {
    const dir = path.join(itemsDir, typeDir)
    if (!fs.existsSync(dir)) continue

    const type = typeDir === 'costumes' ? 'costume' : typeDir.slice(0, -1) // costumes -> costume, accessories -> accessory

    function collect(dirPath) {
      for (const entry of fs.readdirSync(dirPath)) {
        const full = path.join(dirPath, entry)
        const stat = fs.statSync(full)
        if (stat.isDirectory()) {
          collect(full)
        } else if (entry.endsWith('.json')) {
          const items = readJSON(full)
          if (Array.isArray(items)) {
            for (const item of items) {
              if (!item.type && item.category) item.type = item.category
              else if (!item.type) item.type = type
              allItems.push(item)
            }
          }
        }
      }
    }

    collect(dir)
  }

  // 合并 common-items（精华池通用物品）
  const commonSrc = path.join(SRC_DATA, 'essences', 'common-items.json')
  if (fs.existsSync(commonSrc)) {
    const commonItems = readJSON(commonSrc)
    if (Array.isArray(commonItems)) {
      for (const item of commonItems) {
        if (!item.type && item.category) item.type = item.category
        allItems.push(item)
      }
    }
  }

  const outFile = path.join(OUT_DIR, 'items', 'index.json')
  ensureDir(path.dirname(outFile))
  fs.writeFileSync(outFile, JSON.stringify(allItems, null, 2))
  console.log(`[build-data] items -> ${outFile} (${allItems.length} items)`)
}

// ===== 3. Essences =====
function buildEssences() {
  const essencesDir = path.join(SRC_DATA, 'essences')
  const pools = {}

  for (const file of fs.readdirSync(essencesDir)) {
    if (!file.endsWith('.json')) continue
    if (file === 'common-items.json') continue
    if (file === 'index.js') continue

    const pool = readJSON(path.join(essencesDir, file))
    if (pool && pool.id) {
      pools[pool.id] = pool
    }
  }

  const outFile = path.join(OUT_DIR, 'essences', 'pools.json')
  ensureDir(path.dirname(outFile))
  fs.writeFileSync(outFile, JSON.stringify(pools, null, 2))
  console.log(`[build-data] essences -> ${outFile} (${Object.keys(pools).length} pools)`)
}

// ===== 4. Static copies =====
function copyStatic() {
  for (const file of ['stories.json', 'analyses.json', 'maps.json']) {
    const src = path.join(SRC_DATA, file)
    const dst = path.join(OUT_DIR, file)
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst)
      console.log(`[build-data] copy -> ${dst}`)
    }
  }
  // common-items for essences
  const commonSrc = path.join(SRC_DATA, 'essences', 'common-items.json')
  const commonDst = path.join(OUT_DIR, 'essences', 'common-items.json')
  if (fs.existsSync(commonSrc)) {
    fs.copyFileSync(commonSrc, commonDst)
    console.log(`[build-data] copy -> ${commonDst}`)
  }
}

buildCharacters()
buildItems()
buildEssences()
copyStatic()
console.log('[build-data] done')
