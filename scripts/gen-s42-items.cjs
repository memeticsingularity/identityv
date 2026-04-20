const fs = require('fs');
const path = require('path');

const charTypeMap = {
  matador: 'survivors',
  priestess: 'survivors',
  cueist: 'hunters',
  the_feaster: 'hunters',
  evil_reptilian: 'hunters',
  composer: 'survivors',
  the_shadow: 'hunters',
  ripper: 'hunters',
  doctor: 'survivors',
  magician: 'survivors',
  mechanic: 'survivors',
  meteorologist: 'survivors',
  archer: 'survivors',
  peddler: 'hunters',
  escapologist: 'survivors',
  lanternist: 'survivors',
  queen_bee: 'hunters',
  coordinator: 'survivors',
  gamekeeper: 'hunters',
  thief: 'survivors',
  mercenary: 'survivors',
  little_girl: 'survivors',
  puppeteer: 'survivors',
  fire_investigator: 'survivors',
  faro_lady: 'survivors',
  goatman: 'hunters',
  knight: 'survivors',
  hullabaloo: 'hunters',
  cheerleader: 'survivors',
  fools_gold: 'hunters',
  novelist: 'survivors',
  female_dancer: 'survivors',
  aeroplanist: 'survivors',
  entomologist: 'survivors',
  weeping_clown: 'survivors',
  clerk: 'hunters',
  nightmare: 'hunters',
  professor: 'survivors',
  antiquarian: 'survivors',
  journalist: 'survivors',
  night_watch: 'hunters',
  hermit: 'hunters',
  opera_singer: 'hunters',
};

const charFileMap = {
  the_ripper: '003-the-ripper',
  hell_ember: '001-hell-ember',
  smiley_face: '002-smiley-face',
  gamekeeper: '004-gamekeeper',
  doctor: '002-doctor',
  lawyer: '003-lawyer',
  thief: '004-thief',
  magician: '006-magician',
  explorer: '007-explorer',
  mercenary: '008-mercenary',
  coordinator: '009-coordinator',
  seer: '017-seer',
  matador: '051-matador',
  priestess: '013-priestess',
  cueist: '033-cueist',
  the_feaster: '007-the-feaster',
  evil_reptilian: '013-evil-reptilian',
  composer: '039-composer',
  the_shadow: '029-the-shadow',
  mechanic: '010-mechanic',
  meteorologist: '047-meteorologist',
  archer: '048-archer',
  peddler: '032-peddler',
  escapologist: '049-escapologist',
  lanternist: '050-lanternist',
  queen_bee: '034-queen-bee',
  little_girl: '035-little-girl',
  puppeteer: '043-puppeteer',
  fire_investigator: '044-fire-investigator',
  faro_lady: '045-faro-lady',
  goatman: '030-goatman',
  knight: '046-knight',
  hullabaloo: '031-hullabaloo',
  cheerleader: '042-cheerleader',
  fools_gold: '028-fools-gold',
  novelist: '034-novelist',
  female_dancer: '016-female-dancer',
  aeroplanist: '041-aeroplanist',
  entomologist: '028-entomologist',
  weeping_clown: '036-weeping-clown',
  clerk: '024-clerk',
  nightmare: '023-nightmare',
  professor: '037-professor',
  antiquarian: '038-antiquarian',
  journalist: '040-journalist',
  night_watch: '026-night-watch',
  hermit: '025-hermit',
  opera_singer: '027-opera-singer',
};

const itemsToCreate = [
  { characterId: 'matador', name: '此在无栖', rarity: 'legendary', poolId: 's42-e1', id: 'costume-matador-no-abode' },
  { characterId: 'priestess', name: '白焰初照', rarity: 'epic', poolId: 's42-e1', id: 'costume-priestess-white-flame' },
  { characterId: 'cueist', name: '幽夜终章', rarity: 'epic', poolId: 's42-e1', id: 'costume-cueist-dark-night-finale' },
  { characterId: 'the_feaster', name: '永夜之劫', rarity: 'unique', poolId: 's42-e1', id: 'costume-the-feaster-eternal-night' },
  { characterId: 'evil_reptilian', name: '大地行记', rarity: 'unique', poolId: 's42-e1', id: 'costume-evil-reptilian-earth-travel' },
  { characterId: 'composer', name: '白云歌谣', rarity: 'unique', poolId: 's42-e1', id: 'costume-composer-white-cloud-ballad' },
  { characterId: 'the_shadow', name: '永昼之陨', rarity: 'unique', poolId: 's42-e1', id: 'costume-the-shadow-eternal-day-fall' },
  { characterId: 'ripper', name: '黑男爵', rarity: 'rare', poolId: 's42-e1', id: 'costume-ripper-black-baron' },
  { characterId: 'doctor', name: '肃静蓝', rarity: 'rare', poolId: 's42-e1', id: 'costume-doctor-quiet-blue' },
  { characterId: 'magician', name: '葡萄酒', rarity: 'rare', poolId: 's42-e1', id: 'costume-magician-wine' },
  { characterId: 'mechanic', name: '墨黑', rarity: 'rare', poolId: 's42-e1', id: 'costume-mechanic-ink-black' },
  { characterId: 'meteorologist', name: '晴日绿', rarity: 'rare', poolId: 's42-e1', id: 'costume-meteorologist-sunny-green' },
  { characterId: 'archer', name: '离弦绯', rarity: 'rare', poolId: 's42-e1', id: 'costume-archer-off-string-scarlet' },
  { characterId: 'peddler', name: '月桂黄', rarity: 'rare', poolId: 's42-e1', id: 'costume-peddler-laurel-yellow' },
  { characterId: 'escapologist', name: '迷烟青', rarity: 'rare', poolId: 's42-e1', id: 'costume-escapologist-mist-smoke' },
  { characterId: 'lanternist', name: '天窗蓝', rarity: 'rare', poolId: 's42-e1', id: 'costume-lanternist-skylight-blue' },
  { characterId: 'queen_bee', name: '蜂毒', rarity: 'rare', poolId: 's42-e1', id: 'costume-queen-bee-bee-venom' },
  { characterId: 'coordinator', name: '翡色云雀之歌', rarity: 'legendary', poolId: 's42-e2', id: 'costume-coordinator-jade-lark-song' },
  { characterId: 'lanternist', name: '知更鸟', rarity: 'epic', poolId: 's42-e2', id: 'costume-lanternist-robin' },
  { characterId: 'gamekeeper', name: '塞努诺斯', rarity: 'epic', poolId: 's42-e2', id: 'costume-gamekeeper-cernunnos' },
  { characterId: 'thief', name: '鹈鹕', rarity: 'unique', poolId: 's42-e2', id: 'costume-thief-pelican' },
  { characterId: 'mercenary', name: '乌雕', rarity: 'unique', poolId: 's42-e2', id: 'costume-mercenary-black-eagle' },
  { characterId: 'little_girl', name: '银喉', rarity: 'unique', poolId: 's42-e2', id: 'costume-little-girl-silver-throat' },
  { characterId: 'peddler', name: '枯巢', rarity: 'unique', poolId: 's42-e2', id: 'costume-peddler-dry-nest' },
  { characterId: 'puppeteer', name: '灰烬红', rarity: 'rare', poolId: 's42-e2', id: 'costume-puppeteer-ash-red' },
  { characterId: 'the_shadow', name: '幻影紫', rarity: 'rare', poolId: 's42-e2', id: 'costume-the-shadow-phantom-purple' },
  { characterId: 'fire_investigator', name: '使命绿', rarity: 'rare', poolId: 's42-e2', id: 'costume-fire-investigator-mission-green' },
  { characterId: 'faro_lady', name: '睿智蓝', rarity: 'rare', poolId: 's42-e2', id: 'costume-faro-lady-wise-blue' },
  { characterId: 'goatman', name: '锈色黄', rarity: 'rare', poolId: 's42-e2', id: 'costume-goatman-rust-yellow' },
  { characterId: 'knight', name: '骑士蓝', rarity: 'rare', poolId: 's42-e2', id: 'costume-knight-knight-blue' },
  { characterId: 'hullabaloo', name: '美梦紫', rarity: 'rare', poolId: 's42-e2', id: 'costume-hullabaloo-dream-purple' },
  { characterId: 'cheerleader', name: '热烈红', rarity: 'rare', poolId: 's42-e2', id: 'costume-cheerleader-passionate-red' },
  { characterId: 'fools_gold', name: '感染绿', rarity: 'rare', poolId: 's42-e2', id: 'costume-fools-gold-infection-green' },
  { characterId: 'novelist', name: '月影青', rarity: 'rare', poolId: 's42-e2', id: 'costume-novelist-moon-shadow' },
  { characterId: 'little_girl', name: '初绽杏', rarity: 'rare', poolId: 's42-e2', id: 'costume-little-girl-first-bloom' },
  { characterId: 'hullabaloo', name: '黑鹫', rarity: 'legendary', poolId: 's42-e3', id: 'costume-hullabaloo-black-vulture' },
  { characterId: 'female_dancer', name: '巫云', rarity: 'epic', poolId: 's42-e3', id: 'costume-female-dancer-witch-cloud' },
  { characterId: 'aeroplanist', name: '螺旋翼', rarity: 'epic', poolId: 's42-e3', id: 'costume-aeroplanist-spiral-wing' },
  { characterId: 'entomologist', name: '蒲公英', rarity: 'unique', poolId: 's42-e3', id: 'costume-entomologist-dandelion' },
  { characterId: 'goatman', name: '安全线', rarity: 'unique', poolId: 's42-e3', id: 'costume-goatman-safety-line' },
  { characterId: 'cheerleader', name: '小知了', rarity: 'unique', poolId: 's42-e3', id: 'costume-cheerleader-little-cicada' },
  { characterId: 'peddler', name: '利多多', rarity: 'unique', poolId: 's42-e3', id: 'costume-peddler-profit' },
  { characterId: 'weeping_clown', name: '鲜明绿', rarity: 'rare', poolId: 's42-e3', id: 'costume-weeping-clown-bright-green' },
  { characterId: 'clerk', name: '平等绿', rarity: 'rare', poolId: 's42-e3', id: 'costume-clerk-equality-green' },
  { characterId: 'nightmare', name: '深渊蓝', rarity: 'rare', poolId: 's42-e3', id: 'costume-nightmare-abyss-blue' },
  { characterId: 'professor', name: '探索蓝', rarity: 'rare', poolId: 's42-e3', id: 'costume-professor-exploration-blue' },
  { characterId: 'composer', name: '纤弱青', rarity: 'rare', poolId: 's42-e3', id: 'costume-composer-fragile-cyan' },
  { characterId: 'antiquarian', name: '丁香紫', rarity: 'rare', poolId: 's42-e3', id: 'costume-antiquarian-lilac-purple' },
  { characterId: 'aeroplanist', name: '理想红', rarity: 'rare', poolId: 's42-e3', id: 'costume-aeroplanist-ideal-red' },
  { characterId: 'journalist', name: '坚韧棕', rarity: 'rare', poolId: 's42-e3', id: 'costume-journalist-tenacious-brown' },
  { characterId: 'night_watch', name: '沙土褐', rarity: 'rare', poolId: 's42-e3', id: 'costume-night-watch-sand-brown' },
  { characterId: 'hermit', name: '庄重蓝', rarity: 'rare', poolId: 's42-e3', id: 'costume-hermit-solemn-blue' },
  { characterId: 'opera_singer', name: '偏执绿', rarity: 'rare', poolId: 's42-e3', id: 'costume-opera-singer-paranoid-green' },
];

const byCharacter = {};
for (const item of itemsToCreate) {
  if (!byCharacter[item.characterId]) byCharacter[item.characterId] = [];
  byCharacter[item.characterId].push({
    id: item.id,
    name: item.name,
    rarity: item.rarity,
    type: 'costume',
    characterId: item.characterId,
    obtainSources: [{ source: 'essence', poolId: item.poolId }],
  });
}

for (const [charId, items] of Object.entries(byCharacter)) {
  const type = charTypeMap[charId];
  const fileName = charFileMap[charId];
  if (!type || !fileName) {
    console.warn(`Missing mapping for ${charId}`);
    continue;
  }
  const dir = path.join('src/data/items/costumes', type);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${fileName}.json`);

  let existing = [];
  if (fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Appending to ${filePath}`);
  } else {
    console.log(`Creating ${filePath}`);
  }

  const existingIds = new Set(existing.map(i => i.id));
  for (const item of items) {
    if (!existingIds.has(item.id)) {
      existing.push(item);
      existingIds.add(item.id);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n');
}

console.log('Done!');
