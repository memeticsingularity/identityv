# 精华系统（Essence System）设计文档

> 文档编号：DES-001
> 创建日期：2026-04-21
> 适用版本：v4.0+

---

## 1. 概述

### 1.1 系统定位

精华系统是本项目「氪金抽卡模拟器」的核心数据与逻辑层，负责：

1. **精华池配置管理**：定义每个精华池可抽取的物品及其稀有度分布
2. **抽卡引擎**：模拟官方概率、保底机制、特殊规则（去重/连续限制）
3. **物品解析**：将池子中的引用（`itemId`）解析为带角色信息、显示名称的完整物品对象
4. **收藏册数据源**：为收藏图鉴提供全量可抽取物品目录

### 1.2 核心概念

| 概念 | 说明 | 示例 |
|------|------|------|
| **精华池（Pool）** | 一组可抽取物品的集合，有独立保底计数 | `s42-e1`（第42赛季·精华1） |
| **物品（Item）** | 池子中的单个可抽取对象，绑定稀有度 | `costume-matador-no-abode` |
| **引用（Ref）** | 池子配置中对物品的不完整描述，运行时解析 | `{ "itemId": "xxx" }` |
| **稳定 Key** | 用于收藏册去重和持久化的唯一标识 | `item:costume-matador-no-abode` |
| **保底（Pity）** | 连续未出货时的强制出货计数器 | `legendary: 0/200` |

### 1.3 设计目标

- **数据与逻辑分离**：池子配置是静态 JSON，抽卡逻辑是运行时计算
- **向后兼容**：支持新旧两种引用格式（旧版 `character`/`common` 引用仍可读）
- **按需加载**：运行时通过 `fetch` 加载数据，不打包进 JS bundle
- **易扩展**：新增精华池只需添加一个 JSON 文件和一行元数据

---

## 2. 数据模型

### 2.1 精华池（Essence Pool）

```ts
interface EssencePool {
  id: string                    // 全局唯一标识，如 "s42-e1"
  contents: {
    legendary: ItemRef[]        // 稀世品质物品列表
    epic: ItemRef[]             // 奇珍品质物品列表
    unique: ItemRef[]           // 独特品质物品列表
    rare: ItemRef[]             // 罕见品质物品列表
    common: ItemRef[]           // 普通品质物品列表
  }
}
```

**文件位置**：`src/data/essences/{poolId}.json`

**示例**（`s42-e1.json`）：
```json
{
  "id": "s42-e1",
  "contents": {
    "legendary": [{ "itemId": "costume-matador-no-abode" }],
    "epic": [
      { "itemId": "costume-priestess-white-flame" },
      { "itemId": "costume-cueist-dark-night-finale" }
    ],
    "unique": [...],
    "rare": [...],
    "common": [...]
  }
}
```

### 2.2 物品引用（ItemRef）

池子配置中的物品引用支持三种格式。当前项目统一使用 **新版 `itemId` 格式**，旧格式保留兼容。

#### 格式一：直接引用（推荐，当前使用）

```json
{ "itemId": "costume-matador-no-abode" }
```

- 运行时通过 `getItemById(itemId)` 从全局物品索引查找
- 返回的完整物品包含 `characterId`、`name`、`rarity`、`type` 等字段

#### 格式二：角色引用（旧版兼容）

```json
{
  "ref": "character",
  "characterId": "hell_ember",
  "itemType": "skin",
  "name": "金匠"
}
```

- 通过 `characterId + itemType + name` 在角色数据中查找
- 找不到时进入 fallback，使用内联信息生成兜底对象

#### 格式三：通用物品引用（旧版兼容）

```json
{
  "ref": "common",
  "id": "avatar-c-hell_ember"
}
```

- 从 `common-items.json` 中查找
- 主要用于头像、涂鸦、印记等无角色绑定的物品

### 2.3 全局物品（Global Item）

所有可抽取物品统一注册到全局索引中，来源有两个：

| 来源 | 文件位置 | 内容 | 加载方式 |
|------|----------|------|----------|
| **角色专属物品** | `src/data/items/{type}/{camp}/{file}.json` | 时装、随身物品、个性动作、涂鸦 | 构建时聚合为 `public/data/items/index.json` |
| **通用物品** | `src/data/essences/common-items.json` | 头像、印记、通用动作、通用涂鸦 | 直接包含在 items 聚合中 |

物品结构：
```ts
interface Item {
  id: string              // 全局唯一，如 "costume-matador-no-abode"
  name: string            // 中文名称
  nameEn: string          // 英文名称（当前为中文镜像）
  rarity: 'common' | 'rare' | 'unique' | 'epic' | 'legendary'
  type: 'costume' | 'accessory' | 'emote' | 'graffiti' | 'avatar' | 'mark' | 'pet'
  characterId?: string    // 绑定角色（通用物品无此字段）
  description?: string
}
```

### 2.4 池子元数据（Pool Metadata）

除了 `contents`，每个池子还有运行时所需的元数据，定义在 Store 中：

```ts
interface PoolMeta {
  id: string
  name: string            // 显示名称，如 "第42赛季·精华1"
  season: number          // 赛季号，深渊/特殊池为 0
  type: 'standard' | 'abyss' | 'memory' | 'rank' | 'special'
  number: number          // 精华序号（标准池）或深渊序号
  legendaryPity: number   // 稀世保底阈值（标准池 200/250，深渊 250）
  releaseDate?: string    // 上线日期 YYYY-MM-DD
  endDate?: string        // 结束日期
  icon?: string           // 自定义图标路径
}
```

**定义位置**：`src/stores/app.js` 中的 `ESSENCE_POOLS` 数组。

---

## 3. 文件组织与配置规范

### 3.1 目录结构

```
src/data/essences/
├── index.js              # 运行时解析引擎：resolveItem / drawFromPool / buildItemCatalog
├── common-items.json     # 通用物品库（头像、涂鸦、印记、通用动作等）
├── s1-e1.json            # 第1赛季·精华1
├── s42-e1.json           # 第42赛季·精华1
├── s42-e2.json           # 第42赛季·精华2
├── s42-e3.json           # 第42赛季·精华3
├── abyss-01.json         # 深渊珍宝Ⅰ
├── abyss-02.json         # 深渊珍宝Ⅱ
└── ...
```

### 3.2 文件名规范

| 池子类型 | 文件名格式 | 示例 |
|----------|-----------|------|
| 赛季精华 | `s{赛季号}-e{精华号}.json` | `s42-e1.json` |
| 深渊珍宝 | `abyss-{两位序号}.json` | `abyss-01.json` |
| 特殊池子 | 手动指定 | 未来扩展 |

**注意**：深渊珍宝必须使用两位序号（`01`~`09`），避免文件系统按字母排序时 `abyss-10` 排在 `abyss-2` 之前。

### 3.3 ID 命名规范

物品 `id` 采用 `类型-角色-名称` 的 kebab-case 格式：

```
costume-matador-no-abode          // 时装-角色名-时装名
emote-r-magician-rest             // 动作-稀有度-角色名-动作名
avatar-r-cute-smiley_face         // 头像-稀有度-风格-角色名
graffiti-c-composer-color         // 涂鸦-稀有度-角色名-风格
mark-r-calm                       // 印记-稀有度-名称
pet-u-pointy-nose                 // 随从-稀有度-名称
```

**角色名规范**：
- 使用 `profile.json` 中的 `id` 字段（下划线连接，如 `hell_ember`、`queen_bee`）
- **不可**使用文件夹名（连字符连接，如 `hell-ember`、`queen-bee`）
- 带引号的角色名保持引号，如 `fools_gold`、`little_girl`

### 3.4 稀有度映射

```
中文名 → 英文 key → 显示标签
普通   → common    → 普通
罕见   → rare      → 罕见
独特   → unique    → 独特
奇珍   → epic      → 奇珍
稀世   → legendary → 稀世
虚妄杰作 → legendary → 稀世（与稀世同 key）
```

**定义位置**：`src/data/essences/index.js` 中的 `RARITY_MAP`。

---

## 4. 运行时架构

### 4.1 启动时序

```
1. 浏览器加载 HTML + JS bundle
2. main.js 调用 store.init()
3. loadGameData() 并行 fetch 三个 JSON：
   - public/data/characters/index.json
   - public/data/items/index.json
   - public/data/essences/pools.json
4. 数据注入：
   - setCharacters(charsData) → 角色数组
   - setItems(itemsData) → 全局物品数组 + Map 索引
   - setPools(poolsData) → POOL_MAP + 清空缓存
5. 角色物品挂载：将 items 按 characterId 反向挂到角色对象上（skins/emotes/graffitis/accessories）
6. store.init() 完成 → mount('#app')
```

**关键文件**：`src/services/data.js`、`src/main.js`

### 4.2 解析引擎

`src/data/essences/index.js` 是精华系统的解析引擎，职责如下：

#### 4.2.1 解析单个引用（resolveItem）

```js
resolveItem(ref, defaultRarity) → ResolvedItem
```

流程：
1. 若 `ref.itemId` 存在 → 从 `ITEM_INDEX` 查物品 → 拼接 `displayName`（`角色名 - 物品名`）
2. 若 `ref.ref === 'character'` → 从角色数据中查找（兼容旧格式）
3. 若 `ref.ref === 'common'` → 从 `COMMON_INDEX` 查找（兼容旧格式）
4. 都找不到 → 返回 fallback 对象（仅含 `name` 和 `rarity`）

#### 4.2.2 获取池子完整内容（getPoolContents）

```js
getPoolContents(poolId) → { legendary: [...], epic: [...], ... }
```

- 首次调用时解析该池子的全部引用，按稀有度分组缓存到 `POOL_CONTENTS_CACHE`
- 后续调用直接返回缓存结果
- `setPools()` 会清空所有缓存

#### 4.2.3 从池子抽取（drawFromPool）

```js
drawFromPool(poolId, rarity) → ResolvedItem | null
```

- 先调用 `getPoolContents(poolId)` 获取该稀有度的物品数组
- 随机返回数组中的一个物品
- 若池子不存在或该稀有度无物品 → 返回 `null`

#### 4.2.4 构建全物品目录（buildItemCatalog）

```js
buildItemCatalog() → CatalogItem[]
```

- 遍历所有池子的 `contents`，去重后生成全局可抽取物品列表
- 每个物品附加 `poolId`（来源池子）和 `key`（稳定标识）
- 是收藏图鉴的数据源

#### 4.2.5 稳定 Key 生成（getItemKey）

```js
getItemKey(ref) → string | null
```

- `itemId` 格式 → `item:{itemId}`
- `character` 格式 → `character:{characterId}:{itemType}:{name}`
- `common` 格式 → `common:{id}`

**用途**：收藏册去重、持久化、碎片返还判定

### 4.3 缓存策略

| 缓存 | 类型 | 生命周期 | 清空时机 |
|------|------|----------|----------|
| `POOL_CONTENTS_CACHE` | Map<poolId, contents> | 应用生命周期 | `setPools()` |
| `ITEM_POOL_MAP_CACHE` | Map<key, poolId> | 应用生命周期 | `setPools()` |
| `ITEM_INDEX` | Map<itemId, item> | 应用生命周期 | `setItems()` |
| `COMMON_INDEX` | Map<id, item> | 模块级常量 | 永不 |
| `fetchJSON cache` | Map<path, data> | 应用生命周期 | 永不（可扩展为 LRU） |

---

## 5. 抽卡引擎

### 5.1 概率模型

系统支持三种概率分支，由池子元数据自动判定：

#### 5.1.1 深渊珍宝（Abyss）

| 品质 | 基础概率 | 保底 | 特殊规则 |
|------|----------|------|----------|
| 稀世 | 0.5% | 250抽 | — |
| 奇珍 | 2.5% | 60抽 | **全部获得前不重复** |
| 独特 | 15% | 10抽 | — |
| 罕见 | 82% | — | — |
| 普通 | **无** | — | — |

#### 5.1.2 旧标准赛季精华（s37-e3 之前）

| 品质 | 基础概率 | 保底 |
|------|----------|------|
| 稀世 | 0.5% | 250抽 |
| 奇珍 | 2.5% | 60抽 |
| 独特 | 15% | 10抽 |
| 罕见 | 50% | — |
| 普通 | 32% | — |

#### 5.1.3 新标准赛季精华（s37-e3 及之后）

| 品质 | 基础概率 | 保底 |
|------|----------|------|
| 稀世 | 0.7% | 200抽 |
| 奇珍 | 2.5% | 60抽 |
| 独特 | 15.3% | 10抽 |
| 罕见 | 49.8% | — |
| 普通 | 31.7% | — |

### 5.2 保底机制

```
每次抽取后：unique++ / epic++ / legendary++

出稀世：legendary = 0, unique = 0       // epic 不清零！
出奇珍：epic = 0, unique = 0             // legendary 不清零！
出独特：unique = 0
出普通/罕见：三个计数器继续累加
```

**核心原则**：稀世不顶奇珍保底，奇珍不顶稀世保底。两个计数器独立维护。

**保底触发**：
- `legendary >= 阈值` → 强制稀世
- `epic >= 60` → 强制奇珍或稀世（按概率再 roll）
- `unique >= 10` → 强制独特或更高

### 5.3 特殊规则

#### 5.3.1 深渊奇珍去重

深渊池子的奇珍物品在全部获得之前不会重复抽取到已获得的奇珍。

实现：每个池子独立维护 `obtainedEpics` 数组。抽到 epic 时：
1. 若当前物品已在 `obtainedEpics` 中，从剩余未获得的奇珍中重新随机
2. 将最终抽到的奇珍加入 `obtainedEpics`

#### 5.3.2 奇珍连续重复限制

**适用条件**：标准池且 `season > 29` 或 `(season === 29 且 number >= 1)`

规则：同一奇珍物品**最多连续出现 2 次**。第 3 次强制更换为其他奇珍。

实现：每个池子维护 `lastEpics` 数组（长度 2）。抽到 epic 时：
1. 若 `lastEpics[0] === lastEpics[1] === 当前物品名`，从其他奇珍中重新随机
2. 将最终抽到的奇珍 unshift 到 `lastEpics`，保持长度 ≤ 2

**注意**：此规则与稀世保底阈值（200/250）是**独立判定**的。即 s29-e1 ~ s37-e2 的池子虽然仍是 250 保底，但已启用连续 2 次限制。

### 5.4 抽卡流程

```
用户点击「开启1个/10个」
  │
  ▼
校验回声余额（单抽96 / 十连960）
  │
  ▼
扣减回声 → 进入旋转动画（单抽0.8s / 十连2s）
  │
  ▼
循环调用 _performSingleDraw() N 次
  │
  ├─ 累加保底计数器
  ├─ 按池子类型走概率分支判定稀有度
  ├─ 重置对应保底计数器
  ├─ 从真实池子 drawFromPool() 抽取物品
  ├─ 应用特殊规则（深渊去重 / 连续限制）
  └─ 若池子无配置 → fallback 到 dummy 生成器
  │
  ▼
生成抽卡记录 → 写入当前池子的 drawRecords
  │
  ▼
处理收藏 / 碎片 / 弹窗：
  ├─ 新物品 → ownedItems.push(key) + ownedOrder.push({key, timestamp})
  ├─ 新时装 → skinCount++ + skinModalQueue.push({...})
  └─ 重复物品 → shards += SHARD_RETURN[rarity]
  │
  ▼
触发光效（蓝光/金光）
  │
  ▼
结果卡片逐个弹出（200ms/个）
  │
  ▼
重复物品翻转显示碎片返还
  │
  ▼
首次获得时装弹窗入队展示
```

### 5.5 碎片返还规则

| 稀有度 | 返还碎片 |
|--------|----------|
| 稀世 | 2000 |
| 奇珍 | 1000 |
| 独特 | 200 |
| 罕见 | 36 |
| 普通 | 6 |

---

## 6. 与外部系统的集成

### 6.1 收藏图鉴（Collection）

**数据流**：
```
essences/*.json ──► buildItemCatalog() ──► Collection 页面
```

Collection 页面调用 `buildItemCatalog()` 获取全量去重物品列表，再结合 `store.ownedItems` 判定已获得/未获得状态。

**交互**：
- 未获得物品显示「前往抽取」按钮 → 调用 `store.switchPool(item.poolId)` + 路由跳转 `/gacha`
- 角色名可点击 → 跳转到 `/characters/{characterId}`

### 6.2 角色详情（Character Detail）

**数据流**：
```
items/*.json ──► loadGameData() ──► 反向挂载到角色对象 ──► Character Detail 页面
```

`loadGameData()` 在注入 items 后，将每个角色的物品按类型挂载到角色对象上：
```js
char.skins = getItemsByCharacter(char.id, 'costume')
char.emotes = getItemsByCharacter(char.id, 'emote')
char.graffitis = getItemsByCharacter(char.id, 'graffiti')
char.accessories = getItemsByCharacter(char.id, 'accessory')
```

这使得角色详情页可以直接展示该角色的所有物品，与精华池配置共享同一套数据源。

### 6.3 充值系统（Recharge）

充值系统与抽卡系统通过 `echoes`（回声）状态耦合：

- **充值页**（`Recharge/index.vue`）：调用 `store.recharge(tierAmount)` 增加回声
- **抽卡页**（`Gacha/index.vue`）：调用 `store.draw(type)` 消耗回声
- 余额不足时弹出充值引导弹窗，可直接打开充值面板

### 6.4 个人中心（Profile）

展示跨池聚合数据：
- 总抽取次数：`Object.values(pools).reduce(...drawCount)`
- 总消耗回声：`drawRecords.reduce(...cost)`
- 全局稀有度统计：汇总所有池子的 `rarityStats`
- 各池保底进度：独立展示每个池子的 `pity` 状态

---

## 7. 状态持久化

### 7.1 持久化字段

```js
persist: {
  pick: [
    'echoes',           // 回声余额
    'totalRecharged',   // 累计充值金额
    'rechargeRecords',  // 充值记录
    'tierCounts',       // 各档位充值次数（首充判定）
    'currentPoolId',    // 当前选中的精华池
    'pools',            // 各池子的抽卡记录和保底计数
    'ownedItems',       // 已拥有物品 key 数组
    'ownedOrder',       // 获得顺序 + 时间戳
    'shards',           // 碎片余额
    'totalShardsEarned',// 累计获得碎片
    'skinCount',        // 累计获得时装数
  ]
}
```

### 7.2 数据迁移

当物品引用格式升级（如旧 `character:xxx` key 迁移到新的 `item:xxx` key），系统启动时会自动执行迁移：

```js
// migrateOwnedData() 在 store.init() 中调用
const migrated = migrateOwnedData(ownedItems, ownedOrder)
ownedItems = migrated.items
ownedOrder = migrated.order
```

迁移逻辑：遍历所有旧 key，尝试在全局物品索引中查找对应的新 `itemId`，替换为 `item:xxx` 格式。

---

## 8. 扩展指南

### 8.1 新增一个赛季精华池

**步骤**：

1. **准备物品数据**
   - 确保池子中所有角色专属物品已存在于 `src/data/items/` 对应目录
   - 确保通用物品已存在于 `src/data/essences/common-items.json`（或已注册到 items 系统）

2. **创建池子配置**
   - 新建 `src/data/essences/s{赛季}-e{序号}.json`
   - 按 `legendary / epic / unique / rare / common` 分组填入 `itemId`

3. **注册元数据**
   - 在 `src/stores/app.js` 的 `ESSENCE_POOLS` 数组中添加：
     ```js
     { id: 's43-e1', name: '第43赛季·精华1', season: 43, type: 'standard', number: 1, legendaryPity: 200, releaseDate: '2026-04-24' }
     ```

4. **构建数据**
   - 运行 `npm run build-data`，确保新池子被聚合到 `public/data/essences/pools.json`

5. **验证**
   - 启动应用，在抽卡页切换至新池子
   - 打开「内容说明」弹窗，确认物品列表正确解析
   - 执行单抽/十连，确认概率和保底正常运作

### 8.2 新增深渊珍宝

与赛季精华类似，区别：
- 文件名：`abyss-{两位序号}.json`
- 元数据：`type: 'abyss'`, `season: 0`, `legendaryPity: 250`
- 无需 `common` 品质层
- 图标需放入 `public/assets/essences/abyss/abyss-{两位序号}.png`

### 8.3 新增通用物品

1. 打开 `src/data/essences/common-items.json`
2. 按格式追加：
   ```json
   {
     "id": "avatar-r-new-character",
     "name": "罕见头像-新角色",
     "rarity": "rare",
     "category": "avatar",
     "nameEn": "罕见头像-新角色"
   }
   ```
3. 运行 `npm run build-data`
4. 在池子 JSON 中引用：`{ "itemId": "avatar-r-new-character" }`

### 8.4 修改概率或保底

- **全局概率**：修改 `src/stores/app.js` 中 `_performSingleDraw()` 的 `rand` 阈值
- **保底阈值**：修改对应池子元数据的 `legendaryPity` 字段
- **特殊规则**：在 `_performSingleDraw()` 中调整 `hasEpicConsecutiveLimit` 的判定条件

---

## 9. 附录

### 9.1 关键文件清单

| 文件 | 职责 |
|------|------|
| `src/data/essences/index.js` | 解析引擎：引用解析、池子内容缓存、抽取、目录构建 |
| `src/data/essences/*.json` | 各精华池的物品配置 |
| `src/data/essences/common-items.json` | 通用物品库 |
| `src/data/items/index.js` | 全局物品索引：`setItems` / `getItemById` |
| `src/services/data.js` | 运行时数据加载：`fetchJSON` / `loadGameData` |
| `src/stores/app.js` | Store：抽卡逻辑、保底、碎片、弹窗、持久化 |
| `src/views/Gacha/index.vue` | 抽卡 UI：光效、结果展示、记录、内容说明弹窗 |
| `src/views/Collection/index.vue` | 收藏图鉴：统计、筛选、排序、分页 |
| `scripts/build-data.cjs` | 构建脚本：聚合数据到 `public/data/` |

### 9.2 常见问题

**Q：为什么池子配置和元数据分开在两个地方？**
A：池子配置（`*.json`）是纯数据，可被构建脚本聚合；元数据（`ESSENCE_POOLS`）包含 UI 显示信息和运行时参数（如保底阈值），与业务逻辑耦合更紧密。

**Q：`buildItemCatalog()` 为什么不在构建时预生成？**
A：运行时生成可以保持数据单一来源（只维护 `*.json`），且物品解析依赖角色数据（中文名拼接），构建时聚合会增加脚本复杂度。当前物品量（~1000）下运行时遍历性能可忽略。

**Q：新增池子后收藏图鉴会自动更新吗？**
A：会。`buildItemCatalog()` 遍历的是运行时的 `POOL_MAP`，只要 `setPools()` 注入了新池子，收藏图鉴就会包含新物品。

**Q：为什么深渊珍宝和标准池的保底不互通？**
A：这是官方设定。每个池子有独立的 `pity` 计数器，存储在 `pools.value[poolId]` 中。

---

*本文档随代码迭代同步更新。如有变更，请在版本记录中追加。*
