const fs = require('fs')
const path = require('path')

const baseDir = path.resolve(__dirname, '../src/data/characters')
const indexPath = path.join(baseDir, 'index.js')

const camps = ['survivors', 'hunters', 'npcs']
const meta = []

for (const camp of camps) {
  const campDir = path.join(baseDir, camp)
  const dirs = fs.readdirSync(campDir)
    .filter(d => fs.statSync(path.join(campDir, d)).isDirectory())
    .sort()
  for (const dir of dirs) {
    const safeName = dir.replace(/-/g, '_')
    meta.push({ camp, dir, safeName })
  }
}

const lines = []
meta.forEach(m => {
  const prefix = `${m.camp}_${m.safeName}`
  const rel = `./${m.camp}/${m.dir}`
  lines.push(`import ${prefix}_profile from '${rel}/profile.json'`)
  lines.push(`import ${prefix}_gameplay from '${rel}/gameplay.json'`)
  lines.push(`import ${prefix}_abilities from '${rel}/abilities.json'`)
  lines.push(`import ${prefix}_stories from '${rel}/stories.json'`)
  lines.push(`import ${prefix}_skins from '${rel}/skins.json'`)
  lines.push(`import ${prefix}_accessories from '${rel}/accessories.json'`)
})

lines.push('')
lines.push('export const characters = [')
meta.forEach((m, i) => {
  const prefix = `${m.camp}_${m.safeName}`
  lines.push('  {')
  lines.push(`    ...${prefix}_profile,`)
  lines.push(`    ...${prefix}_gameplay,`)
  lines.push(`    abilities: ${prefix}_abilities,`)
  lines.push(`    stories: ${prefix}_stories,`)
  lines.push(`    skins: ${prefix}_skins,`)
  lines.push(`    accessories: ${prefix}_accessories,`)
  lines.push('  }' + (i < meta.length - 1 ? ',' : ''))
})
lines.push(']')
lines.push('')
lines.push('export default characters')

fs.writeFileSync(indexPath, lines.join('\n') + '\n', 'utf8')
console.log('Regenerated index.js with skins + accessories. Total:', meta.length)
