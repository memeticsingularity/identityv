const fs = require('fs');
const path = require('path');

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function pad(n) { return String(n).padStart(3, '0'); }

const survivors = [
  'Lucky Guy', 'Doctor', 'Lawyer', 'Thief', 'Gardener', 'Magician', 'Explorer',
  'Mercenary', 'Coordinator', 'Mechanic', 'Forward', "The Mind's Eye", 'Priestess',
  'Perfumer', 'Cowboy', 'Female Dancer', 'Seer', 'Embalmer', 'Prospector', 'Enchantress',
  'Wildling', 'Acrobat', 'First Officer', 'Barmaid', 'Postman', 'Grave Keeper',
  '"Prisoner"', 'Entomologist', 'Painter', 'Batter', 'Toy Merchant', '"Psychologist"',
  'Patient', 'Novelist', '"Little Girl"', 'Weeping Clown', 'Professor', 'Antiquarian',
  'Composer', 'Journalist', 'Aeroplanist', 'Cheerleader', 'Puppeteer', 'Fire Investigator',
  '"Faro Lady"', '"Knight"', 'Meteorologist', 'Archer', '"Escapologist"', 'Lanternist', 'Matador'
];

const hunters = [
  'Hell Ember', 'Smiley Face', 'The Ripper', 'Gamekeeper', 'Soul Weaver', 'Geisha',
  'The Feaster', 'Wu Chang', 'Photographer', 'Mad Eyes', 'Dream Witch', 'Axe Boy',
  'Evil Reptilian', 'Bloody Queen', 'Guard 26', '"Disciple"', 'Violinist', 'Sculptor',
  '"Undead"', 'Breaking Wheel', 'Naiad', 'Wax Artist', '"Nightmare"', 'Clerk',
  'Hermit', 'Night Watch', 'Opera Singer', "Fool's Gold", 'The Shadow', '"Goatman"',
  '"Hullabaloo"', 'Peddler', '"Cueist"', '"Queen Bee"', '"Dentist"'
];

const npcs = ['Detective Orpheus', 'Game Master', 'Martha'];

const migrateMap = {
  mercenary: { camp: 'survivors', idx: 8 },
  mechanic: { camp: 'survivors', idx: 10 },
  doctor: { camp: 'survivors', idx: 2 },
  hell_ember: { camp: 'hunters', idx: 1 },
  ripper: { camp: 'hunters', idx: 3 },
  geisha: { camp: 'hunters', idx: 6 },
  seer: { camp: 'survivors', idx: 17 },
  detective_orpheus: { camp: 'npcs', idx: 1 },
  game_master: { camp: 'npcs', idx: 2 },
  martha: { camp: 'npcs', idx: 3 },
};

const base = path.join('src', 'data', 'characters');
const backup = path.join('src', 'data', 'characters-backup');

// 备份旧数据
if (fs.existsSync(base)) {
  fs.rmSync(backup, { recursive: true, force: true });
  fs.cpSync(base, backup, { recursive: true });
  fs.rmSync(base, { recursive: true, force: true });
}
fs.mkdirSync(base, { recursive: true });

const meta = [];

function createEmpty(camp, name, idx) {
  const slug = slugify(name);
  const dirName = pad(idx) + '-' + slug;
  const dir = path.join(base, camp, dirName);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'profile.json'), JSON.stringify({}, null, 2));
  fs.writeFileSync(path.join(dir, 'abilities.json'), JSON.stringify([], null, 2));
  fs.writeFileSync(path.join(dir, 'stories.json'), JSON.stringify([], null, 2));
  fs.writeFileSync(path.join(dir, 'gameplay.json'), JSON.stringify({ talents: [], tags: [] }, null, 2));
  return { dirName, slug };
}

survivors.forEach((n, i) => meta.push({ camp: 'survivors', idx: i + 1, name: n, ...createEmpty('survivors', n, i + 1) }));
hunters.forEach((n, i) => meta.push({ camp: 'hunters', idx: i + 1, name: n, ...createEmpty('hunters', n, i + 1) }));
npcs.forEach((n, i) => meta.push({ camp: 'npcs', idx: i + 1, name: n, ...createEmpty('npcs', n, i + 1) }));

// 迁移旧数据
Object.entries(migrateMap).forEach(([oldId, { camp, idx }]) => {
  const m = meta.find(x => x.camp === camp && x.idx === idx);
  if (!m) return;
  const newDir = path.join(base, camp, m.dirName);
  const oldDir = path.join(backup, oldId);
  if (!fs.existsSync(oldDir)) return;

  ['profile.json', 'abilities.json', 'stories.json', 'gameplay.json'].forEach(file => {
    const src = path.join(oldDir, file);
    const dest = path.join(newDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  });
});

// 生成 index.js
const lines = [];
meta.forEach(m => {
  const prefix = `${m.camp}_${m.dirName}`;
  const rel = `./${m.camp}/${m.dirName}`;
  lines.push(`import ${prefix}_profile from '${rel}/profile.json'`);
  lines.push(`import ${prefix}_gameplay from '${rel}/gameplay.json'`);
  lines.push(`import ${prefix}_abilities from '${rel}/abilities.json'`);
  lines.push(`import ${prefix}_stories from '${rel}/stories.json'`);
});

lines.push('');
lines.push('export const characters = [');
meta.forEach((m, i) => {
  const prefix = `${m.camp}_${m.dirName}`;
  lines.push('  {');
  lines.push(`    ...${prefix}_profile,`);
  lines.push(`    ...${prefix}_gameplay,`);
  lines.push(`    abilities: ${prefix}_abilities,`);
  lines.push(`    stories: ${prefix}_stories,`);
  lines.push('  }' + (i < meta.length - 1 ? ',' : ''));
});
lines.push(']');
lines.push('');
lines.push('export default characters');

fs.writeFileSync(path.join(base, 'index.js'), lines.join('\n') + '\n', 'utf8');

// 清理备份
fs.rmSync(backup, { recursive: true, force: true });

console.log('Done. Total characters:', meta.length);
