const fs = require('fs')
const path = require('path')

const baseDir = path.resolve(__dirname, '../src/data/characters')

const placeholderAvatar = {
  survivor: 'https://patchwiki.biligame.com/images/dwrg/thumb/2/26/placeholder_survivor.png/120px-placeholder_survivor.png',
  hunter: 'https://patchwiki.biligame.com/images/dwrg/thumb/2/26/placeholder_hunter.png/120px-placeholder_hunter.png',
  npc: 'https://patchwiki.biligame.com/images/dwrg/thumb/2/26/placeholder_npc.png/120px-placeholder_npc.png',
}

const survivorData = {
  '001-lucky-guy': { name: '幸运儿', englishName: 'Lucky Guy', role: '辅助位', difficulty: 1, releaseDate: '2018-04-02', background: '一个来历不明的青年，在欧利蒂丝庄园中寻求幸运与机遇。' },
  '002-doctor': null, // 已有数据，跳过
  '003-lawyer': { name: '律师', englishName: 'Lawyer', role: '辅助位', difficulty: 1, releaseDate: '2018-04-02', background: '弗雷迪·莱利曾是一位律师，因一场失败的官司而陷入困境，为了改变命运，他来到了庄园。' },
  '004-thief': { name: '"慈善家"', englishName: 'Thief', role: '牵制位', difficulty: 1, releaseDate: '2018-04-02', background: '克利切·皮尔森经营着一家孤儿院，自称“慈善家”，但他的行为举止总是令人捉摸不透。' },
  '005-gardener': { name: '园丁', englishName: 'Gardener', role: '辅助位', difficulty: 1, releaseDate: '2018-04-02', background: '艾玛·伍兹热爱园艺，她对火焰有着复杂的情感，来到庄园是为了寻找某个人。' },
  '006-magician': { name: '魔术师', englishName: 'Magician', role: '牵制位', difficulty: 2, releaseDate: '2018-04-02', background: '瑟维·勒·罗伊是一位魔术师，擅长用魔术棒和分身戏法迷惑对手。' },
  '007-explorer': { name: '冒险家', englishName: 'Explorer', role: '辅助位', difficulty: 1, releaseDate: '2018-04-02', background: '库特·弗兰克热爱阅读探险小说，他相信自己能缩小身形，在书本与现实中穿梭。' },
  '008-mercenary': null, // 已有
  '009-coordinator': { name: '空军', englishName: 'Coordinator', role: '救援位', difficulty: 1, releaseDate: '2018-04-02', background: '玛尔塔·贝坦菲尔曾是一名空军飞行员，为了寻找失踪的恋人而来到庄园。' },
  '010-mechanic': null, // 已有
  '011-forward': { name: '前锋', englishName: 'Forward', role: 'ob位', difficulty: 3, releaseDate: '2018-04-02', background: '威廉·艾利斯是一位橄榄球运动员，他用冲撞保护队友，是监管者最不愿面对的对手之一。' },
  '012-the-minds-eye': { name: '盲女', englishName: "The Mind's Eye", role: '解码位', difficulty: 3, releaseDate: '2018-04-02', background: '海伦娜·亚当斯虽然失明，但凭借盲杖的敲击声感知世界，是杰出的密码机破译专家。' },
  '013-priestess': { name: '祭司', englishName: 'Priestess', role: '辅助位', difficulty: 2, releaseDate: '2018-04-02', background: '菲欧娜·吉尔曼信仰犹格·索托斯，能通过门之钥在庄园中开辟通道。' },
  '014-perfumer': { name: '调香师', englishName: 'Perfumer', role: '牵制位', difficulty: 2, releaseDate: '2018-04-02', background: '薇拉·奈尔调制的“忘忧之香”能让她回溯到过去的状态，摆脱伤痛。' },
  '015-cowboy': { name: '牛仔', englishName: 'Cowboy', role: 'ob位', difficulty: 3, releaseDate: '2018-04-02', background: '凯文·阿尤索是一位来自美洲的牛仔，他的套索能套中队友或监管者，改变战局走向。' },
  '016-female-dancer': { name: '舞女', englishName: 'Female Dancer', role: '辅助位', difficulty: 1, releaseDate: '2018-04-02', background: '玛格丽莎·泽莱习惯用八音盒控制节奏，她的舞姿能影响周围人的行动速度。' },
  '017-seer': null, // 已有
  '018-embalmer': { name: '入殓师', englishName: 'Embalmer', role: '辅助位', difficulty: 2, releaseDate: '2018-04-02', background: '伊索·卡尔从事入殓工作，他认为每个人都应在死后保持体面的容颜。' },
  '019-prospector': { name: '勘探员', englishName: 'Prospector', role: 'ob位', difficulty: 3, releaseDate: '2018-04-02', background: '诺顿·坎贝尔是一位勘探员，能利用磁铁吸引或弹射监管者，保护队友安全。' },
  '020-enchantress': { name: '咒术师', englishName: 'Enchantress', role: '牵制位', difficulty: 2, releaseDate: '2018-04-02', background: '帕缇夏·多里瓦出生于神秘学家族，她的猴头咒像能令监管者陷入眩晕。' },
  '021-wildling': { name: '野人', englishName: 'Wildling', role: 'ob位', difficulty: 2, releaseDate: '2018-04-02', background: '穆罗与野猪伙伴一同长大，在庄园中骑着野猪横冲直撞，扰乱监管者节奏。' },
  '022-acrobat': { name: '杂技演员', englishName: 'Acrobat', role: '牵制位', difficulty: 3, releaseDate: '2018-04-02', background: '麦克·莫顿是喧嚣马戏团的杂技演员，他的爆弹能在舞台上制造绚烂又危险的演出。' },
  '023-first-officer': { name: '大副', englishName: 'First Officer', role: '救援位', difficulty: 2, releaseDate: '2018-04-02', background: '何塞·巴登是一位落魄的海上大副，他的怀表能制造幻影，迷惑敌人的视线。' },
  '024-barmaid': { name: '调酒师', englishName: 'Barmaid', role: '辅助位', difficulty: 2, releaseDate: '2018-04-02', background: '黛米·波本在酒吧工作，她调制的多夫林酒能让自己和队友恢复状态。' },
  '025-postman': { name: '邮差', englishName: 'Postman', role: '辅助位', difficulty: 1, releaseDate: '2018-04-02', background: '维克多·葛兰兹是一位羞涩的邮差，他的信件能为队友带来各种增益效果。' },
  '026-grave-keeper': { name: '守墓人', englishName: 'Grave Keeper', role: '救援位', difficulty: 2, releaseDate: '2018-04-02', background: '安德鲁·克雷斯习惯与墓穴为伴，他的铁铲能让他潜入地下躲避追击。' },
  '027-prisoner': { name: '"囚徒"', englishName: 'Prisoner', role: '解码位', difficulty: 2, releaseDate: '2018-04-02', background: '卢卡·巴尔萨是一位天才发明家，他的线路连接能远程传输破译进度。' },
  '028-entomologist': { name: '昆虫学者', englishName: 'Entomologist', role: '辅助位', difficulty: 2, releaseDate: '2018-04-02', background: '梅莉·普林尼常年与昆虫为伴，她能驱使蜂群干扰监管者的行动。' },
  '029-painter': { name: '画家', englishName: 'Painter', role: '牵制位', difficulty: 2, releaseDate: '2018-04-02', background: '艾格·瓦尔登是一位画家，他的画作能将监管者吸引其中，暂时忘却追击。' },
  '030-batter': { name: '击球手', englishName: 'Batter', role: 'ob位', difficulty: 3, releaseDate: '2018-04-02', background: '甘吉·古普塔是一位板球运动员，他的板球能击退监管者，守护队友。' },
  '031-toy-merchant': { name: '玩具商', englishName: 'Toy Merchant', role: '辅助位', difficulty: 2, releaseDate: '2018-04-02', background: '安妮·莱斯特是一位玩具商，她的弹射板车和玩具箱能为团队创造便利。' },
  '032-psychologist': { name: '"心理学家"', englishName: 'Psychologist', role: '辅助位', difficulty: 1, releaseDate: '2018-04-02', background: '艾达·梅斯默是一位心理学家，她的移情能远程为队友恢复健康。' },
  '033-patient': { name: '病患', englishName: 'Patient', role: '牵制位', difficulty: 2, releaseDate: '2018-04-02', background: '埃米尔是一位失去记忆的病患，他的钩爪能帮助他快速翻越地形。' },
  '034-novelist': { name: '小说家', englishName: 'Novelist', role: '辅助位', difficulty: 2, releaseDate: '2018-04-02', background: '“奥尔菲斯”以小说家的身份出现，他的隐喻能短暂操控监管者的行动。' },
  '035-little-girl': { name: '"小女孩"', englishName: 'Little Girl', role: '辅助位', difficulty: 1, releaseDate: '2018-04-02', background: '“回忆”是一位神秘的小女孩，她的记忆同步能让她附身在队友身上。' },
  '036-weeping-clown': { name: '哭泣小丑', englishName: 'Weeping Clown', role: '牵制位', difficulty: 2, releaseDate: '2018-04-02', background: '裘克曾是喧嚣马戏团的小丑，他的火箭能带他快速穿越地图。' },
  '037-professor': { name: '教授', englishName: 'Professor', role: '牵制位', difficulty: 2, releaseDate: '2018-04-02', background: '卢基诺·迪鲁西是一位生物学家，他能蜕皮并释放鳞粉保护自己。' },
  '038-antiquarian': { name: '古董商', englishName: 'Antiquarian', role: 'ob位', difficulty: 3, releaseDate: '2018-04-02', background: '戚十一精通箫中剑法，她的招式能连续击退监管者。' },
  '039-composer': { name: '作曲家', englishName: 'Composer', role: '解码位', difficulty: 2, releaseDate: '2018-04-02', background: '弗雷德里克·克雷伯格是一位作曲家，他的音叉能帮他快速破译密码机。' },
  '040-journalist': { name: '记者', englishName: 'Journalist', role: '辅助位', difficulty: 2, releaseDate: '2018-04-02', background: '爱丽丝·德罗斯是一位记者，她的相机能召唤出幻影干扰监管者。' },
  '041-aeroplanist': { name: '飞行家', englishName: 'Aeroplanist', role: '牵制位', difficulty: 3, releaseDate: '2018-04-02', background: '查尔斯·霍尔特是一位飞行家，他的飞行器能带他高空飞行，躲避地面追击。' },
  '042-cheerleader': { name: '拉拉队员', englishName: 'Cheerleader', role: '辅助位', difficulty: 2, releaseDate: '2018-04-02', background: '莉莉·巴利尔是一位充满活力的拉拉队员，她的鼓舞能加速队友的行动。' },
  '043-puppeteer': { name: '木偶师', englishName: 'Puppeteer', role: '牵制位', difficulty: 2, releaseDate: '2018-04-02', background: '马蒂亚斯·切尔宁是一位木偶师，他能与木偶互换位置，躲避致命一击。' },
  '044-fire-investigator': { name: '火灾调查员', englishName: 'Fire Investigator', role: '救援位', difficulty: 2, releaseDate: '2018-04-02', background: '弗洛里安·布兰德是一位火灾调查员，他的气囊能阻挡监管者的攻击。' },
  '045-faro-lady': { name: '"法罗女士"', englishName: 'Faro Lady', role: '解码位', difficulty: 2, releaseDate: '2018-04-02', background: '伊芙琳是一位神秘的法罗女士，她的骗术能让她在庄园中来去无踪。' },
  '046-knight': { name: '"骑士"', englishName: 'Knight', role: '救援位', difficulty: 2, releaseDate: '2018-04-02', background: '理查德·斯特林是一位骑士，他的荣誉与剑术让他成为队友可靠的守护者。' },
  '047-meteorologist': { name: '气象学家', englishName: 'Meteorologist', role: '辅助位', difficulty: 2, releaseDate: '2018-04-02', background: '温迪·福特是一位气象学家，她能召唤风雨雷电改变局部战场的局势。' },
  '048-archer': { name: '弓箭手', englishName: 'Archer', role: 'ob位', difficulty: 2, releaseDate: '2018-04-02', background: '伯纳德·伍德是一位弓箭手，他的箭矢能远距离干扰监管者的行动。' },
  '049-escapologist': { name: '"逃脱大师"', englishName: 'Escapologist', role: '牵制位', difficulty: 2, releaseDate: '2018-04-02', background: '默里安是一位逃脱大师，他的魔术与逃脱术让他在庄园中游刃有余。' },
  '050-lanternist': { name: '幻灯师', englishName: 'Lanternist', role: '辅助位', difficulty: 2, releaseDate: '2018-04-02', background: '一位神秘的幻灯师，能用光影制造幻象，迷惑监管者的视线。' },
  '051-matador': { name: '斗牛士', englishName: 'Matador', role: '牵制位', difficulty: 2, releaseDate: '2018-04-02', background: '一位来自伊比利亚的斗牛士，他的红布与身姿是庄园中独特的风景。' },
}

const hunterData = {
  '001-hell-ember': null, // 已有
  '002-smiley-face': { name: '小丑', englishName: 'Smiley Face', role: '追击型', difficulty: 1, releaseDate: '2018-04-02', background: '裘克曾是马戏团的小丑，他的火箭冲刺让他成为庄园中最具冲击力的监管者之一。' },
  '003-the-ripper': null, // 已有
  '004-gamekeeper': { name: '鹿头', englishName: 'Gamekeeper', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '班恩是一位守林人，他的链爪能远距离勾中求生者，将他们拖向深渊。' },
  '005-soul-weaver': { name: '蜘蛛', englishName: 'Soul Weaver', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '瓦尔莱塔是一位蜘蛛形体的马戏团演员，她的蛛丝能大幅减缓求生者的速度。' },
  '006-geisha': null, // 已有
  '007-the-feaster': { name: '黄衣之主', englishName: 'The Feaster', role: '控场型', difficulty: 2, releaseDate: '2018-04-02', background: '哈斯塔是克苏鲁神话中的旧日支配者，他的触手能从虚空中降临，监视庄园。' },
  '008-wu-chang': { name: '宿伞之魂', englishName: 'Wu Chang', role: '控场型', difficulty: 3, releaseDate: '2018-04-02', background: '谢必安与范无咎是一对双生魂魄，黑白交替间掌控着庄园的生死轮回。' },
  '009-photographer': { name: '摄影师', englishName: 'Photographer', role: '控场型', difficulty: 3, releaseDate: '2018-04-02', background: '约瑟夫·德拉索恩斯通过相片定格时间，在镜像世界中追击求生者。' },
  '010-mad-eyes': { name: '疯眼', englishName: 'Mad Eyes', role: '控场型', difficulty: 3, releaseDate: '2018-04-02', background: '巴尔克·拉帕杜拉是一位疯狂的建筑师，他的机关墙能封锁地图的各个角落。' },
  '011-dream-witch': { name: '梦之女巫', englishName: 'Dream Witch', role: '控场型', difficulty: 3, releaseDate: '2018-04-02', background: '伊德海拉是一位外神，她无法直接攻击，却能通过信徒在庄园中散播恐惧。' },
  '012-axe-boy': { name: '爱哭鬼', englishName: 'Axe Boy', role: '追击型', difficulty: 1, releaseDate: '2018-04-02', background: '罗比是一位被遗弃在孤儿院的孩子，他的怨灵能为他拾取并投掷斧头。' },
  '013-evil-reptilian': { name: '孽蜥', englishName: 'Evil Reptilian', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '卢基诺·迪鲁西因实验变成了蜥蜴人，他的跳跃能跨越各种地形。' },
  '014-bloody-queen': { name: '红夫人', englishName: 'Bloody Queen', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '玛丽·安托瓦内特是法国皇后，她的水镜能制造出镜像进行远距离攻击。' },
  '015-guard-26': { name: '26号守卫', englishName: 'Guard 26', role: '守椅型', difficulty: 2, releaseDate: '2018-04-02', background: '邦邦是一台被安装了炸弹程序的机器人，它的爆炸范围让求生者无处可逃。' },
  '016-disciple': { name: '"使徒"', englishName: 'Disciple', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '安是一位虔诚的使徒，她与黑猫相伴，能放出猫咪禁锢求生者的行动。' },
  '017-violinist': { name: '小提琴家', englishName: 'Violinist', role: '控场型', difficulty: 2, releaseDate: '2018-04-02', background: '安东尼奥是一位被恶魔附体的小提琴家，他的琴弦能在空气中织成死亡的旋律。' },
  '018-sculptor': { name: '雕刻家', englishName: 'Sculptor', role: '控场型', difficulty: 3, releaseDate: '2018-04-02', background: '伽拉泰亚是一位天才雕塑家，她的雕像能封锁求生者的走位并造成损伤。' },
  '019-undead': { name: '"博士"', englishName: 'Undead', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '珀西是一位由尸体拼凑而成的怪物，他的能量涌动让他永不停歇地追逐猎物。' },
  '020-breaking-wheel': { name: '破轮', englishName: 'Breaking Wheel', role: '追击型', difficulty: 3, releaseDate: '2018-04-02', background: '威尔三兄弟共用一具身体，他们的轮形态能高速追击，穿刺求生者。' },
  '021-naiad': { name: '渔女', englishName: 'Naiad', role: '控场型', difficulty: 2, releaseDate: '2018-04-02', background: '格蕾丝是一位被献祭的渔女，她的水渊能包围求生者并造成范围伤害。' },
  '022-wax-artist': { name: '蜡像师', englishName: 'Wax Artist', role: '控场型', difficulty: 2, releaseDate: '2018-04-02', background: '菲利普是一位蜡像师，他的蜡油能封住求生者的交互并造成持续伤害。' },
  '023-nightmare': { name: '"噩梦"', englishName: 'Nightmare', role: '控场型', difficulty: 2, releaseDate: '2018-04-02', background: '“噩梦”是奥尔菲斯内心恐惧的具象化，他的渡鸦能标记并突袭求生者。' },
  '024-clerk': { name: '"记录员"', englishName: 'Clerk', role: '控场型', difficulty: 3, releaseDate: '2018-04-02', background: '柯根是一位法庭记录员，她的记录能回溯求生者的行为，逆转战局。' },
  '025-hermit': { name: '隐士', englishName: 'Hermit', role: '控场型', difficulty: 2, releaseDate: '2018-04-02', background: '阿尔瓦·洛伦兹是一位隐士，他的电磁力场能远距离干扰求生者的破译与移动。' },
  '026-night-watch': { name: '守夜人', englishName: 'Night Watch', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '伊塔库亚是一位守夜人，他的风域能让他高速滑行并快速接近猎物。' },
  '027-opera-singer': { name: '歌剧演员', englishName: 'Opera Singer', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '桑格莉娅是一位歌剧演员，她能在暗影中穿梭，出其不意地出现在求生者身后。' },
  '028-fools-gold': { name: '"愚人金"', englishName: "Fool's Gold", role: '控场型', difficulty: 2, releaseDate: '2018-04-02', background: '诺顿·坎贝尔在矿难后化身为愚人金，他的引石能制造震荡波，破坏地形。' },
  '029-the-shadow': { name: '时空之影', englishName: 'The Shadow', role: '控场型', difficulty: 3, releaseDate: '2018-04-02', background: '艾维是一位被时空侵蚀的监管者，她的幻影与本体协同追击，令人防不胜防。' },
  '030-goatman': { name: '"跛脚羊"', englishName: 'Goatman', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '杰弗里的铁笼能囚禁求生者，他的跛脚并不影响他在庄园中狩猎的残酷效率。' },
  '031-hullabaloo': { name: '"喧嚣"', englishName: 'Hullabaloo', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '喧嚣马戏团的主人，他的噪音与混乱是庄园中最令人不安的存在之一。' },
  '032-peddler': { name: '杂货商', englishName: 'Peddler', role: '控场型', difficulty: 2, releaseDate: '2018-04-02', background: '一位来历不明的杂货商，她的货物中藏着各种意想不到的危险工具。' },
  '033-cueist': { name: '"台球手"', englishName: 'Cueist', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '一位技艺高超的台球手，他的球杆与球体能精准地击中远处的目标。' },
  '034-queen-bee': { name: '"女王蜂"', englishName: 'Queen Bee', role: '控场型', difficulty: 2, releaseDate: '2018-04-02', background: '蜂群的女王，她能召唤蜂群笼罩战场，让求生者无处可逃。' },
  '035-dentist': { name: '牙医', englishName: 'Dentist', role: '追击型', difficulty: 2, releaseDate: '2018-04-02', background: '一位冷酷的牙医，他的手术器械是庄园中最令人毛骨悚然的刑具之一。' },
}

const npcData = {
  '001-detective-orpheus': null, // 已有
  '002-game-master': null, // 已有
  '003-martha': null, // 已有
}

function processCamp(campDir, dataMap) {
  const dirs = fs.readdirSync(campDir).filter(d => fs.statSync(path.join(campDir, d)).isDirectory())
  for (const dir of dirs) {
    const info = dataMap[dir]
    if (info === null) {
      console.log(`Skip existing: ${dir}`)
      continue
    }
    const profilePath = path.join(campDir, dir, 'profile.json')
    let existing = {}
    try {
      existing = JSON.parse(fs.readFileSync(profilePath, 'utf-8'))
    } catch (e) {
      existing = {}
    }
    if (Object.keys(existing).length > 0) {
      console.log(`Skip non-empty: ${dir}`)
      continue
    }
    const id = dir.replace(/^\d+-/, '').replace(/-/g, '_')
    const type = campDir.includes('hunters') ? 'hunter' : campDir.includes('npcs') ? 'npc' : 'survivor'
    const payload = {
      id,
      name: info.name,
      englishName: info.englishName,
      type,
      camp: type,
      role: info.role,
      difficulty: info.difficulty,
      releaseDate: info.releaseDate,
      avatar: placeholderAvatar[type],
      background: info.background,
    }
    fs.writeFileSync(profilePath, JSON.stringify(payload, null, 2) + '\n')
    console.log(`Filled: ${dir} -> ${id}`)
  }
}

processCamp(path.join(baseDir, 'survivors'), survivorData)
processCamp(path.join(baseDir, 'hunters'), hunterData)
processCamp(path.join(baseDir, 'npcs'), npcData)

console.log('Done.')
