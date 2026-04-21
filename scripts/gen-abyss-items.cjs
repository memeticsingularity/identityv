const fs = require('fs');
const path = require('path');

// Character type and file mappings
const charTypeMap = {
  hell_ember: 'hunters', smiley_face: 'hunters', ripper: 'hunters', gamekeeper: 'hunters',
  soul_weaver: 'hunters', geisha: 'hunters', the_feaster: 'hunters', wu_chang: 'hunters',
  photographer: 'hunters', mad_eyes: 'hunters', dream_witch: 'hunters', axe_boy: 'hunters',
  evil_reptilian: 'hunters', bloody_queen: 'hunters', guard_26: 'hunters', disciple: 'hunters',
  violinist: 'hunters', sculptor: 'hunters', undead: 'hunters', breaking_wheel: 'hunters',
  naiad: 'hunters', wax_artist: 'hunters', nightmare: 'hunters', clerk: 'hunters',
  hermit: 'hunters', night_watch: 'hunters', opera_singer: 'hunters', fools_gold: 'hunters',
  the_shadow: 'hunters', goatman: 'hunters', hullabaloo: 'hunters', peddler: 'hunters',
  cueist: 'hunters', queen_bee: 'hunters', dentist: 'hunters',
  lucky_guy: 'survivors', doctor: 'survivors', lawyer: 'survivors', thief: 'survivors',
  gardener: 'survivors', magician: 'survivors', explorer: 'survivors', mercenary: 'survivors',
  coordinator: 'survivors', mechanic: 'survivors', forward: 'survivors', the_minds_eye: 'survivors',
  priestess: 'survivors', perfumer: 'survivors', cowboy: 'survivors', female_dancer: 'survivors',
  seer: 'survivors', embalmer: 'survivors', prospector: 'survivors', enchantress: 'survivors',
  wildling: 'survivors', acrobat: 'survivors', first_officer: 'survivors', barmaid: 'survivors',
  postman: 'survivors', grave_keeper: 'survivors', prisoner: 'survivors', entomologist: 'survivors',
  painter: 'survivors', batter: 'survivors', toy_merchant: 'survivors', psychologist: 'survivors',
  patient: 'survivors', novelist: 'survivors', little_girl: 'survivors', weeping_clown: 'survivors',
  professor: 'survivors', antiquarian: 'survivors', composer: 'survivors', journalist: 'survivors',
  aeroplanist: 'survivors', cheerleader: 'survivors', puppeteer: 'survivors',
  fire_investigator: 'survivors', faro_lady: 'survivors', knight: 'survivors',
  meteorologist: 'survivors', archer: 'survivors', escapologist: 'survivors', lanternist: 'survivors',
  matador: 'survivors',
};

const charFileMap = {
  hell_ember: '001-hell-ember', smiley_face: '002-smiley-face', ripper: '003-the-ripper',
  gamekeeper: '004-gamekeeper', soul_weaver: '005-soul-weaver', geisha: '006-geisha',
  the_feaster: '007-the-feaster', wu_chang: '008-wu-chang', photographer: '009-photographer',
  mad_eyes: '010-mad-eyes', dream_witch: '011-dream-witch', axe_boy: '012-axe-boy',
  evil_reptilian: '013-evil-reptilian', bloody_queen: '014-bloody-queen', guard_26: '015-guard-26',
  disciple: '016-disciple', violinist: '017-violinist', sculptor: '018-sculptor',
  undead: '019-undead', breaking_wheel: '020-breaking-wheel', naiad: '021-naiad',
  wax_artist: '022-wax-artist', nightmare: '023-nightmare', clerk: '024-clerk',
  hermit: '025-hermit', night_watch: '026-night-watch', opera_singer: '027-opera-singer',
  fools_gold: '028-fools-gold', the_shadow: '029-the-shadow', goatman: '030-goatman',
  hullabaloo: '031-hullabaloo', peddler: '032-peddler', cueist: '033-cueist',
  queen_bee: '034-queen-bee', dentist: '035-dentist',
  lucky_guy: '001-lucky-guy', doctor: '002-doctor', lawyer: '003-lawyer', thief: '004-thief',
  gardener: '005-gardener', magician: '006-magician', explorer: '007-explorer',
  mercenary: '008-mercenary', coordinator: '009-coordinator', mechanic: '010-mechanic',
  forward: '011-forward', the_minds_eye: '012-the-minds-eye', priestess: '013-priestess',
  perfumer: '014-perfumer', cowboy: '015-cowboy', female_dancer: '016-female-dancer',
  seer: '017-seer', embalmer: '018-embalmer', prospector: '019-prospector',
  enchantress: '020-enchantress', wildling: '021-wildling', acrobat: '022-acrobat',
  first_officer: '023-first-officer', barmaid: '024-barmaid', postman: '025-postman',
  grave_keeper: '026-grave-keeper', prisoner: '027-prisoner', entomologist: '028-entomologist',
  painter: '029-painter', batter: '030-batter', toy_merchant: '031-toy-merchant',
  psychologist: '032-psychologist', patient: '033-patient', novelist: '034-novelist',
  little_girl: '035-little-girl', weeping_clown: '036-weeping-clown', professor: '037-professor',
  antiquarian: '038-antiquarian', composer: '039-composer', journalist: '040-journalist',
  aeroplanist: '041-aeroplanist', cheerleader: '042-cheerleader', puppeteer: '043-puppeteer',
  fire_investigator: '044-fire-investigator', faro_lady: '045-faro-lady', knight: '046-knight',
  meteorologist: '047-meteorologist', archer: '048-archer', escapologist: '049-escapologist',
  lanternist: '050-lanternist', matador: '051-matador',
};

// Manual mapping for all abyss items
// Format: "characterId:name" -> { id, type }
const manualMap = {
  // abyss-01
  'hell_ember:嗜金海怪[限定]': { id: 'costume-he-gold-sea-monster', type: 'costume' },
  'hell_ember:海怪船长[限定]': { id: 'costume-he-sea-monster-captain', type: 'costume' },
  'doctor:海盗巫医[限定]': { id: 'costume-doc-pirate-witch-doctor', type: 'costume' },
  'lawyer:海盗领航员[限定]': { id: 'costume-law-pirate-navigator', type: 'costume' },
  'gardener:海盗船匠[限定]': { id: 'costume-gard-pirate-shipwright', type: 'costume' },
  'thief:海盗远望者[限定]': { id: 'costume-thief-pirate-lookout', type: 'costume' },
  'coordinator:海盗枪手[限定]': { id: 'costume-co-pirate-gunner', type: 'costume' },
  'doctor:海盗酒壶[限定]': { id: 'accessory-doc-pirate-flask', type: 'accessory' },
  'lawyer:海盗罗盘[限定]': { id: 'accessory-law-pirate-compass', type: 'accessory' },
  'gardener:海盗旗[限定]': { id: 'accessory-gard-pirate-flag', type: 'accessory' },
  'soul_weaver:刺痛[限定]': { id: 'costume-sw-sting', type: 'costume' },
  'mechanic:船舶技师[限定]': { id: 'costume-mech-ship-tech', type: 'costume' },
  'mechanic:起身': { id: 'emote-mech-stand', type: 'emote' },
  'explorer:起身': { id: 'emote-exp-stand', type: 'emote' },
  'coordinator:起身': { id: 'emote-co-stand', type: 'emote' },
  'forward:起身': { id: 'emote-fwd-stand', type: 'emote' },
  'mechanic:挑衅': { id: 'emote-mech-provoke', type: 'emote' },
  'coordinator:呼喊': { id: 'emote-co-shout', type: 'emote' },
  'forward:躺地': { id: 'emote-fwd-lie', type: 'emote' },
  'forward:呼喊': { id: 'emote-fwd-shout', type: 'emote' },
  'the_minds_eye:呼喊': { id: 'emote-tme-shout', type: 'emote' },
  'the_minds_eye:躺地': { id: 'emote-tme-lie', type: 'emote' },
  'forward:生机绿': { id: 'costume-fwd-vitality-green', type: 'costume' },
  'mechanic:可爱粉': { id: 'costume-mech-cute-pink', type: 'costume' },
  'priestess:淡粉桃': { id: 'costume-priest-pale-pink', type: 'costume' },
  'geisha:黄袖': { id: 'costume-geisha-yellow-sleeve', type: 'costume' },
  // abyss-02
  'ripper:邪眼寄主[限定]': { id: 'costume-ripper-evil-eye-host', type: 'costume' },
  'mercenary:蒸汽少年[限定]': { id: 'costume-merc-steam-boy', type: 'costume' },
  'perfumer:时之砂[限定]': { id: 'costume-perf-sand-of-time', type: 'costume' },
  'magician:光学镜面[限定]': { id: 'costume-mag-optic-mirror', type: 'costume' },
  'the_minds_eye:音波[限定]': { id: 'costume-tme-sound-wave', type: 'costume' },
  'smiley_face:铁帽团长[限定]': { id: 'costume-sf-iron-hat-captain', type: 'costume' },
  'cowboy:铁帽警长[限定]': { id: 'costume-cowboy-iron-hat-sheriff', type: 'costume' },
  'thief:铁帽黑手[限定]': { id: 'costume-thief-iron-hat-gangster', type: 'costume' },
  'doctor:化学剂师[限定]': { id: 'costume-doc-chemist', type: 'costume' },
  'embalmer:银行家[限定]': { id: 'costume-emb-banker', type: 'costume' },
  'magician:抛雪球': { id: 'emote-mag-snowball', type: 'emote' },
  'perfumer:抛雪球': { id: 'emote-perf-snowball', type: 'emote' },
  'mercenary:抛雪球': { id: 'emote-merc-snowball', type: 'emote' },
  'the_minds_eye:抛雪球': { id: 'emote-tme-snowball', type: 'emote' },
  'perfumer:挑衅': { id: 'emote-perf-provoke', type: 'emote' },
  'perfumer:呼喊': { id: 'emote-perf-shout', type: 'emote' },
  'perfumer:躺地': { id: 'emote-perf-lie', type: 'emote' },
  'cowboy:挑衅': { id: 'emote-cowboy-provoke', type: 'emote' },
  'cowboy:呼喊': { id: 'emote-cowboy-shout', type: 'emote' },
  'cowboy:躺地': { id: 'emote-cowboy-lie', type: 'emote' },
  'lucky_guy:棕': { id: 'costume-lg-brown', type: 'costume' },
  'female_dancer:翠舞': { id: 'costume-fd-jade-dance', type: 'costume' },
  'the_feaster:夜紫': { id: 'costume-tf-night-purple', type: 'costume' },
  'perfumer:幽香粉': { id: 'costume-perf-fragrant-pink', type: 'costume' },
  'embalmer:赤服': { id: 'costume-emb-red-robes', type: 'costume' },
  'mad_eyes:黄铜': { id: 'costume-me-brass', type: 'costume' },
  // abyss-03
  'smiley_face:异界行者': { id: 'costume-sf-otherworld-walker', type: 'costume' },
  'mechanic:人偶师': { id: 'costume-mech-puppet-master', type: 'costume' },
  'cowboy:教鞭': { id: 'costume-cowboy-riding-crop', type: 'costume' },
  'embalmer:嬉命人': { id: 'costume-emb-jester-of-fate', type: 'costume' },
  'seer:观测者': { id: 'costume-seer-observer', type: 'costume' },
  'wildling:保镖': { id: 'costume-wild-bodyguard', type: 'costume' },
  'geisha:碎裂瓷人': { id: 'costume-geisha-shattered-porcelain', type: 'costume' },
  'priestess:接线员': { id: 'costume-priest-operator', type: 'costume' },
  'photographer:拍卖师': { id: 'costume-photo-auctioneer', type: 'costume' },
  'prospector:补丁': { id: 'costume-pros-patch', type: 'costume' },
  'first_officer:起舞': { id: 'emote-fo-dance', type: 'emote' },
  'wildling:起舞': { id: 'emote-wild-dance', type: 'emote' },
  'acrobat:起舞': { id: 'emote-acro-dance', type: 'emote' },
  'cowboy:枯草黄': { id: 'costume-cowboy-withered-yellow', type: 'costume' },
  'prospector:朱褐石': { id: 'costume-pros-red-brown-stone', type: 'costume' },
  'acrobat:花紫': { id: 'costume-acro-flower-purple', type: 'costume' },
  'first_officer:帆布白': { id: 'costume-fo-canvas-white', type: 'costume' },
  'barmaid:大麦酒': { id: 'costume-bar-ale', type: 'costume' },
  'barmaid:蓝香橙': { id: 'costume-bar-blue-orange', type: 'costume' },
  'guard_26:湖蓝漆': { id: 'costume-g26-lake-blue', type: 'costume' },
  'guard_26:紫钢': { id: 'costume-g26-purple-steel', type: 'costume' },
  'enchantress:躺地': { id: 'emote-ench-lie', type: 'emote' },
  'enchantress:挑衅': { id: 'emote-ench-provoke', type: 'emote' },
  'prospector:躺地': { id: 'emote-pros-lie', type: 'emote' },
  'prospector:挑衅': { id: 'emote-pros-provoke', type: 'emote' },
  'embalmer:躺地': { id: 'emote-emb-lie', type: 'emote' },
  'seer:躺地': { id: 'emote-seer-lie', type: 'emote' },
  // abyss-04
  'gamekeeper:熔铁猎犬': { id: 'costume-gk-molten-iron-hound', type: 'costume' },
  'barmaid:助燃剂': { id: 'costume-bar-accelerant', type: 'costume' },
  'priestess:反光镜': { id: 'costume-priest-reflector', type: 'costume' },
  'acrobat:气胎': { id: 'costume-acro-air-tire', type: 'costume' },
  'prospector:公路骑士': { id: 'costume-pros-road-knight', type: 'costume' },
  'sculptor:轮椅车手': { id: 'costume-sculpt-wheelchair-racer', type: 'costume' },
  'prisoner:赛车机师': { id: 'costume-pris-race-mechanic', type: 'costume' },
  'postman:报童': { id: 'costume-post-news-boy', type: 'costume' },
  'axe_boy:狂热观众': { id: 'costume-ab-fanatic-audience', type: 'costume' },
  'mad_eyes:拆卸工': { id: 'costume-me-dismantler', type: 'costume' },
  'violinist:拜访': { id: 'emote-viol-visit', type: 'emote' },
  'grave_keeper:准备': { id: 'emote-gk-prepare', type: 'emote' },
  'painter:起身': { id: 'emote-painter-stand', type: 'emote' },
  'grave_keeper:红沙土': { id: 'costume-gk-red-sand', type: 'costume' },
  'prisoner:黄土墙': { id: 'costume-pris-yellow-earth-wall', type: 'costume' },
  'violinist:蓝金调': { id: 'costume-viol-blue-gold', type: 'costume' },
  'entomologist:灰蝶': { id: 'costume-ento-gray-butterfly', type: 'costume' },
  'entomologist:枯叶蝶': { id: 'costume-ento-withered-leaf', type: 'costume' },
  'sculptor:绀': { id: 'costume-sculpt-navy', type: 'costume' },
  'painter:绘蓝': { id: 'costume-painter-paint-blue', type: 'costume' },
  'painter:涂绿': { id: 'costume-painter-paint-green', type: 'costume' },
  'magician:羞愧': { id: 'emote-mag-shame', type: 'emote' },
  'explorer:羞愧': { id: 'emote-exp-shame', type: 'emote' },
  'lawyer:羞愧': { id: 'emote-law-shame', type: 'emote' },
  'doctor:羞愧': { id: 'emote-doc-shame', type: 'emote' },
  'cowboy:羞愧': { id: 'emote-cowboy-shame', type: 'emote' },
  'the_minds_eye:羞愧': { id: 'emote-tme-shame', type: 'emote' },
  // abyss-05
  'geisha:永夜极光': { id: 'costume-geisha-eternal-night-aurora', type: 'costume' },
  'forward:霓虹先锋': { id: 'costume-fwd-neon-pioneer', type: 'costume' },
  'enchantress:花边新闻': { id: 'costume-ench-gossip', type: 'costume' },
  'first_officer:海盗电台': { id: 'costume-fo-pirate-radio', type: 'costume' },
  'prisoner:放映厅': { id: 'costume-pris-projection-room', type: 'costume' },
  'violinist:军乐队': { id: 'costume-viol-military-band', type: 'costume' },
  'entomologist:化妆师': { id: 'costume-ento-makeup-artist', type: 'costume' },
  'painter:粉刷匠': { id: 'costume-painter-painter', type: 'costume' },
  'batter:治安官': { id: 'costume-bat-peace-officer', type: 'costume' },
  'breaking_wheel:交通旗': { id: 'costume-bw-traffic-flag', type: 'costume' },
  'toy_merchant:准备': { id: 'emote-tm-prepare', type: 'emote' },
  'patient:张望': { id: 'emote-patient-look', type: 'emote' },
  'sculptor:大笑': { id: 'emote-sculpt-laugh', type: 'emote' },
  'nightmare:示威': { id: 'emote-nightmare-demonstrate', type: 'emote' },
  'embalmer:羞愧': { id: 'emote-emb-shame', type: 'emote' },
  'prospector:羞愧': { id: 'emote-pros-shame', type: 'emote' },
  'wildling:羞愧': { id: 'emote-wild-shame', type: 'emote' },
  'barmaid:羞愧': { id: 'emote-bar-shame', type: 'emote' },
  'grave_keeper:羞愧': { id: 'emote-gk-shame', type: 'emote' },
  'prisoner:羞愧': { id: 'emote-pris-shame', type: 'emote' },
  // abyss-06
  'wu_chang:亘古双星': { id: 'costume-wc-eternal-twin-stars', type: 'costume' },
  'entomologist:生态圈': { id: 'costume-ento-ecosphere', type: 'costume' },
  'weeping_clown:炮弹飞船': { id: 'costume-wc-cannon-ship', type: 'costume' },
  'toy_merchant:线控信号': { id: 'costume-tm-wire-signal', type: 'costume' },
  'grave_keeper:异星开采': { id: 'costume-gk-alien-mining', type: 'costume' },
  'novelist:跟组编剧': { id: 'costume-nov-scriptwriter', type: 'costume' },
  'patient:安全员': { id: 'costume-patient-safety-officer', type: 'costume' },
  'psychologist:"服装师"': { id: 'costume-psy-costumer', type: 'costume' },
  'evil_reptilian:特效化妆': { id: 'costume-er-special-fx', type: 'costume' },
  'nightmare:探班粉丝': { id: 'costume-nightmare-fan-visit', type: 'costume' },
  'patient:等待': { id: 'emote-patient-wait', type: 'emote' },
  'weeping_clown:张望': { id: 'emote-wc-look', type: 'emote' },
  'weeping_clown:小憩': { id: 'emote-wc-rest', type: 'emote' },
  'psychologist:等待': { id: 'emote-psy-wait', type: 'emote' },
  'sculptor:靛': { id: 'costume-sculpt-indigo', type: 'costume' },
  'undead:焦土': { id: 'costume-undead-scorched-earth', type: 'costume' },
  'batter:蒙尘': { id: 'costume-bat-dusty', type: 'costume' },
  'breaking_wheel:寡言棕': { id: 'costume-bw-taciturn-brown', type: 'costume' },
  'toy_merchant:秸秆绿': { id: 'costume-tm-straw-green', type: 'costume' },
  'patient:旧墙褐': { id: 'costume-patient-old-wall-brown', type: 'costume' },
  'naiad:毒环蓝': { id: 'costume-naiad-poison-ring-blue', type: 'costume' },
  'psychologist:追忆灰': { id: 'costume-psy-memories-gray', type: 'costume' },
  'postman:羞愧': { id: 'emote-post-shame', type: 'emote' },
  'batter:羞愧': { id: 'emote-bat-shame', type: 'emote' },
  'toy_merchant:羞愧': { id: 'emote-tm-shame', type: 'emote' },
  'patient:羞愧': { id: 'emote-patient-shame', type: 'emote' },
  'weeping_clown:羞愧': { id: 'emote-wc-shame', type: 'emote' },
  'psychologist:羞愧': { id: 'emote-psy-shame', type: 'emote' },
  // abyss-07
  'the_feaster:灾厄之主': { id: 'costume-tf-lord-of-calamity', type: 'costume' },
  'patient:稀缺病案': { id: 'costume-patient-rare-case', type: 'costume' },
  'psychologist:末世搜救': { id: 'costume-psy-apocalypse-rescue', type: 'costume' },
  'composer:先驱探索': { id: 'costume-comp-pioneer-exploration', type: 'costume' },
  'antiquarian:菌丝研究': { id: 'costume-anti-mycelium-research', type: 'costume' },
  'lucky_guy:机构齿轮': { id: 'costume-lg-gear-mechanism', type: 'costume' },
  'disciple:末世信仰': { id: 'costume-disc-apocalypse-faith', type: 'costume' },
  'clerk:菌丝专著': { id: 'costume-clerk-mycelium-treatise', type: 'costume' },
  'aeroplanist:失败的探索': { id: 'costume-aero-failed-exploration', type: 'costume' },
  'journalist:官方报道': { id: 'costume-jour-official-report', type: 'costume' },
  'nightmare:大笑': { id: 'emote-nightmare-laugh', type: 'emote' },
  'clerk:拜访': { id: 'emote-clerk-visit', type: 'emote' },
  'professor:小憩': { id: 'emote-prof-rest', type: 'emote' },
  'antiquarian:起身': { id: 'emote-anti-stand', type: 'emote' },
  'composer:高傲黄': { id: 'costume-comp-arrogant-yellow', type: 'costume' },
  'antiquarian:风铃蓝': { id: 'costume-anti-wind-chime-blue', type: 'costume' },
  'aeroplanist:怯懦白': { id: 'costume-aero-timid-white', type: 'costume' },
  'journalist:自信红': { id: 'costume-jour-confident-red', type: 'costume' },
  'night_watch:丛林绿': { id: 'costume-nw-jungle-green', type: 'costume' },
  'hermit:悲观青': { id: 'costume-hermit-pessimistic-cyan', type: 'costume' },
  'opera_singer:魅惑红': { id: 'costume-os-charming-red', type: 'costume' },
  'cheerleader:活力黄': { id: 'costume-cl-vitality-yellow', type: 'costume' },
  'patient:挑衅': { id: 'emote-patient-provoke', type: 'emote' },
  'antiquarian:呼喊': { id: 'emote-anti-shout', type: 'emote' },
  'weeping_clown:呼喊': { id: 'emote-wc-shout', type: 'emote' },
  'entomologist:躺地': { id: 'emote-ento-lie', type: 'emote' },
  'painter:挑衅': { id: 'emote-painter-provoke', type: 'emote' },
  'novelist:躺地': { id: 'emote-nov-lie', type: 'emote' },
  // abyss-08
  'soul_weaver:不息载械': { id: 'costume-sw-endless-mech', type: 'costume' },
  'little_girl:异动指针': { id: 'costume-lg-abnormal-pointer', type: 'costume' },
  'aeroplanist:警戒哨台': { id: 'costume-aero-watch-tower', type: 'costume' },
  'cheerleader:采集速巡': { id: 'costume-cl-collection-patrol', type: 'costume' },
  'puppeteer:义体再构': { id: 'costume-puppet-cyber-reconstruct', type: 'costume' },
  'guard_26:木卫兵领队': { id: 'costume-g26-wood-guard-leader', type: 'costume' },
  'wax_artist:异体同生': { id: 'costume-wa-alien-symbiosis', type: 'costume' },
  'night_watch:塔顶人': { id: 'costume-nw-tower-top', type: 'costume' },
  'fire_investigator:未燃书页': { id: 'costume-fi-unburned-page', type: 'costume' },
  'fools_gold:被抹除者': { id: 'costume-fg-erased-one', type: 'costume' },
  'undead:大笑': { id: 'emote-undead-laugh', type: 'emote' },
  'hermit:拜访': { id: 'emote-hermit-visit', type: 'emote' },
  'professor:张望': { id: 'emote-prof-look', type: 'emote' },
  'antiquarian:小憩': { id: 'emote-anti-rest', type: 'emote' },
  'cheerleader:运动蓝': { id: 'costume-cl-sports-blue', type: 'costume' },
  'aeroplanist:缄默棕': { id: 'costume-aero-silent-brown', type: 'costume' },
  'opera_singer:优雅蓝': { id: 'costume-os-elegant-blue', type: 'costume' },
  'fools_gold:石化白': { id: 'costume-fg-petrified-white', type: 'costume' },
  'puppeteer:枯木黄': { id: 'costume-puppet-withered-wood-yellow', type: 'costume' },
  'the_shadow:远古绿': { id: 'costume-ts-ancient-green', type: 'costume' },
  'fire_investigator:火焰橙': { id: 'costume-fi-flame-orange', type: 'costume' },
  'faro_lady:优雅灰': { id: 'costume-fl-elegant-gray', type: 'costume' },
  'novelist:羞愧': { id: 'emote-nov-shame', type: 'emote' },
  'little_girl:羞愧': { id: 'emote-lg-shame', type: 'emote' },
  'aeroplanist:羞愧': { id: 'emote-aero-shame', type: 'emote' },
  'puppeteer:羞愧': { id: 'emote-puppet-shame', type: 'emote' },
  'cheerleader:羞愧': { id: 'emote-cl-shame', type: 'emote' },
  'journalist:羞愧': { id: 'emote-jour-shame', type: 'emote' },
  // abyss-09
  'photographer:"恒光"': { id: 'costume-photo-eternal-light', type: 'costume' },
  'painter:深蓝暗面': { id: 'costume-painter-deep-blue-dark', type: 'costume' },
  'fire_investigator:匣中焰星': { id: 'costume-fi-flame-star-in-box', type: 'costume' },
  'faro_lady:苍白冠冕': { id: 'costume-fl-pale-crown', type: 'costume' },
  'knight:不羁欢歌': { id: 'costume-knight-unrestrained-song', type: 'costume' },
  'explorer:阴谋论者': { id: 'costume-exp-conspiracy-theorist', type: 'costume' },
  'coordinator:漆黑神官': { id: 'costume-co-dark-priest', type: 'costume' },
  'the_shadow:惊惧故事集': { id: 'costume-ts-horror-stories', type: 'costume' },
  'lanternist:乐园游人': { id: 'costume-lantern-paradise-visitor', type: 'costume' },
  'puppeteer:起身': { id: 'emote-puppet-stand', type: 'emote' },
  'aeroplanist:起身': { id: 'emote-aero-stand', type: 'emote' },
  'escapologist:准备': { id: 'emote-esc-prepare', type: 'emote' },
  'the_shadow:拜访': { id: 'emote-ts-visit', type: 'emote' },
  'priestess:深幽灰': { id: 'costume-priest-deep-gray', type: 'costume' },
  'puppeteer:阴沉蓝': { id: 'costume-puppet-gloomy-blue', type: 'costume' },
  'the_shadow:虚空黑': { id: 'costume-ts-void-black', type: 'costume' },
  'fire_investigator:黯影紫': { id: 'costume-fi-shadow-purple', type: 'costume' },
  'faro_lady:迷影棕': { id: 'costume-fl-misty-brown', type: 'costume' },
  'goatman:锁链银': { id: 'costume-goatman-chain-silver', type: 'costume' },
  'knight:秋叶棕': { id: 'costume-knight-autumn-leaf-brown', type: 'costume' },
  'hullabaloo:记忆黄': { id: 'costume-hull-memory-yellow', type: 'costume' },
  'fire_investigator:羞愧': { id: 'emote-fi-shame', type: 'emote' },
  'journalist:挑衅': { id: 'emote-jour-provoke', type: 'emote' },
  'knight:躺地': { id: 'emote-knight-lie', type: 'emote' },
  'meteorologist:羞愧': { id: 'emote-meteo-shame', type: 'emote' },
  'archer:欢呼': { id: 'emote-archer-cheer', type: 'emote' },
  'escapologist:呼喊': { id: 'emote-esc-shout', type: 'emote' },
};

// Collect all abyss character refs
const essencesDir = 'src/data/essences';
const files = fs.readdirSync(essencesDir)
  .filter(f => f.startsWith('abyss-') && f.endsWith('.json'));

const byCharAndType = {}; // { charId: { costume: [], accessory: [], emote: [] } }

for (const file of files) {
  const content = JSON.parse(fs.readFileSync(path.join(essencesDir, file), 'utf8'));
  for (const [rarity, refs] of Object.entries(content.contents)) {
    for (const ref of refs) {
      if (ref.ref === 'character') {
        const key = `${ref.characterId}:${ref.name}`;
        const mapped = manualMap[key];
        if (!mapped) {
          console.warn(`Missing manual mapping for ${key}`);
          continue;
        }
        const charId = ref.characterId;
        const itemType = mapped.type;
        if (!byCharAndType[charId]) byCharAndType[charId] = { costume: [], accessory: [], emote: [] };
        byCharAndType[charId][itemType].push({
          id: mapped.id,
          name: ref.name.replace(/\[限定\]$/, ''),
          rarity,
          type: itemType,
          characterId: charId,
          note: ref.name.includes('[限定]') ? '限定' : undefined,
          obtainSources: [{ source: 'essence', poolId: content.id }],
        });
      }
    }
  }
}

// Write files
for (const [charId, types] of Object.entries(byCharAndType)) {
  const charType = charTypeMap[charId];
  const fileName = charFileMap[charId];
  if (!charType || !fileName) {
    console.warn(`Missing mapping for ${charId}`);
    continue;
  }

  for (const [itemType, items] of Object.entries(types)) {
    if (items.length === 0) continue;
    const dir = path.join('src/data/items', itemType === 'costume' ? 'costumes' : itemType === 'accessory' ? 'accessories' : 'emotes', charType);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${fileName}.json`);

    let existing = [];
    if (fs.existsSync(filePath)) {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    const existingIds = new Set(existing.map(i => i.id));
    for (const item of items) {
      if (!existingIds.has(item.id)) {
        existing.push(item);
        existingIds.add(item.id);
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n');
    console.log(`Wrote ${filePath} (${items.length} new items)`);
  }
}

console.log('Done generating abyss item files!');
