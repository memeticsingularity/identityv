const fs = require('fs')
const path = require('path')

const baseDir = path.resolve(__dirname, '../src/data/characters')
const indexPath = path.join(baseDir, 'index.js')

const emptyItems = JSON.stringify({ skins: [], accessories: [] }, null, 2) + '\n'

const camps = ['survivors', 'hunters', 'npcs']
for (const camp of camps) {
  const campDir = path.join(baseDir, camp)
  const dirs = fs.readdirSync(campDir).filter(d => fs.statSync(path.join(campDir, d)).isDirectory())
  for (const dir of dirs) {
    const itemsPath = path.join(campDir, dir, 'items.json')
    if (!fs.existsSync(itemsPath)) {
      fs.writeFileSync(itemsPath, emptyItems)
      console.log(`Created: ${camp}/${dir}/items.json`)
    }
  }
}

let indexContent = fs.readFileSync(indexPath, 'utf-8')

// Add items import after stories import for each character
indexContent = indexContent.replace(
  /(import (\S+)_stories from '(.+)')\n/g,
  (match, p1, prefix, importPath) => {
    const itemsPath = importPath.replace(/\/stories\.json$/, '/items.json')
    return `${p1}\nimport ${prefix}_items from '${itemsPath}'\n`
  }
)

// Add items field after stories field for each character
indexContent = indexContent.replace(
  /(stories: (\S+_stories),)\n/g,
  (match, p1, varName) => {
    const prefix = varName.replace(/_stories$/, '')
    return `${p1}\n    items: ${prefix}_items,\n`
  }
)

fs.writeFileSync(indexPath, indexContent)
console.log('Updated index.js')
console.log('Done.')
