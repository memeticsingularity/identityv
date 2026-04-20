const fs = require('fs')
const path = require('path')

const essencesDir = path.join(__dirname, '../src/data/essences')
const itemsDir = path.join(__dirname, '../src/data/items')

// 1. 收集所有物品 ID
const allItemIds = new Set()
function collectItems(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectItems(fullPath)
    } else if (entry.name.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
      const items = Array.isArray(data) ? data : (data.contents ? [] : [data])
      if (!Array.isArray(data) && data.contents) {
        // essence JSON, skip
      } else {
        for (const item of items) {
          if (item.id) allItemIds.add(item.id)
        }
      }
    }
  }
}
collectItems(itemsDir)
console.log(`Total items in items/: ${allItemIds.size}`)

// 2. 检查所有 essence pool 中的 itemId
const essenceFiles = fs.readdirSync(essencesDir).filter(f => f.endsWith('.json') && f !== 'common-items.json')
let totalRefs = 0
let missing = []
let pools = []

for (const file of essenceFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(essencesDir, file), 'utf-8'))
  if (!data.contents) continue
  pools.push(file)
  for (const [rarity, refs] of Object.entries(data.contents)) {
    for (const ref of refs) {
      if (ref.itemId) {
        totalRefs++
        if (!allItemIds.has(ref.itemId)) {
          missing.push({ file, rarity, itemId: ref.itemId })
        }
      }
    }
  }
}

console.log(`Essence pools checked: ${pools.length}`)
console.log(`Total itemId refs: ${totalRefs}`)

if (missing.length > 0) {
  console.error(`\nMissing items (${missing.length}):`)
  for (const m of missing) {
    console.error(`  ${m.file} [${m.rarity}] ${m.itemId}`)
  }
  process.exit(1)
} else {
  console.log('All itemId references resolved successfully!')
}
