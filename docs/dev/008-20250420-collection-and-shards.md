# 008 — 收藏图鉴、碎片系统与首次获得弹窗

> 文档编号：008
> 创建日期：2026-04-20
> 最后更新：2026-04-20

---

## 版本记录

| 版本 | 日期 | 更新内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-04-20 | 收藏图鉴页面：已获得/未获得、筛选排序、快捷跳转 | Claude |
| v1.1 | 2026-04-20 | 碎片系统：重复道具自动返还碎片 | Claude |
| v1.2 | 2026-04-20 | 首次获得时装弹窗：记录第 X 件时装 | Claude |
| v1.3 | 2026-04-20 | 个人中心新增碎片统计 + 注销账号功能 | Claude |
| v1.4 | 2026-04-20 | 修复 characterId 格式错误（连字符 vs 下划线） | Claude |
| v2.0 | 2026-04-20 | 深渊珍宝Ⅰ~Ⅸ：数据、概率、图标、分组 | Claude |
| v2.1 | 2026-04-20 | 奇珍连续重复规则修正（29-1 起才有限制，与 37-3 保底分界解耦） | Claude |
| v2.2 | 2026-04-20 | 内容说明弹窗、概率文案注释、Dialog 全局样式方案 | Claude |
| v2.3 | 2026-04-20 | 抽卡结果区域常驻占位；首次获得弹窗延迟到动画结束后；代码注释补全 | Claude |
| v3.0 | 2026-04-20 | 收藏图鉴筛选大改：角色级联多选、类型筛选、获得顺序仅时装显示、弹窗期间禁用抽取 | Claude |
| v3.1 | 2026-04-20 | 收藏图鉴分页：默认 15/页，支持 15/30/60/100 切换，筛选重置页码 | Claude |

---

## 需求来源

用户提供两张截图和一段描述：

1. **收藏图鉴概念**：类似游戏内「已获取的条目」，展示已获得/未获得状态，标注获取来源（通过抽取 xxx 精华获得），支持快捷跳转到对应精华池抽取。
2. **首次获得弹窗**：游戏内获得新时装时的弹窗，显示「记录第 X 件时装」，带时装立绘和角色名。
3. **碎片返还规则**：
   - 稀世：2000 碎片
   - 奇珍：1000 碎片
   - 独特：200 碎片
   - 罕见：36 碎片
   - 普通：6 碎片

**核心诉求**：在现有抽卡系统上叠加收藏册、碎片经济系统和首次获得仪式感。

---

## 开发过程

### 阶段一：数据层 — 构建全物品目录

**目标**：从精华池配置中解析出所有可抽取物品，生成稳定 key 用于收藏册去重。

**新增函数**（`src/data/essences/index.js`）：

```js
// 为引用生成稳定 key
export function getItemKey(ref) {
  if (ref.ref === 'character') {
    return `character:${ref.characterId}:${ref.itemType}:${ref.name}`
  }
  if (ref.ref === 'common') {
    return `common:${ref.id}`
  }
  return null
}

// 构建全物品目录（所有精华池去重）
export function buildItemCatalog()

// 查询物品来源精华池
export function getItemPool(key)
```

**关键设计**：`buildItemCatalog()` 是运行时派生数据，从 `POOL_MAP` 遍历所有 `contents`，调用 `resolveItem()` 解析引用，不需要额外持久化。

---

### 阶段二：Store 层 — 收藏册 + 碎片 + 弹窗队列

**目标**：抽卡后自动记录收藏状态，计算碎片返还，维护时装计数。

**新增 State**（`src/stores/app.js`）：

```js
const ownedItems = ref([])   // 已拥有物品的稳定 key 数组
const ownedOrder = ref([])   // { key, timestamp }[] 获得顺序
const shards = ref(0)        // 当前碎片余额
const totalShardsEarned = ref(0)
const skinCount = ref(0)     // 累计获得时装数
const skinModalQueue = ref([]) // 首次获得时装弹窗队列
```

**碎片返还规则**：

```js
export const SHARD_RETURN = {
  legendary: 2000,
  epic: 1000,
  unique: 200,
  rare: 36,
  common: 6,
}
```

**`draw()` 返回值扩展**：

```js
return {
  success: true,
  record,          // 抽卡记录
  shardsReturned,  // 本次返还碎片总数
  duplicateCount,  // 重复道具数量
  skinModals,      // 首次获得时装弹窗数据
}
```

---

### 阶段三：UI 层 — 收藏图鉴页面

**新增文件**：`src/views/Collection/index.vue`

**页面结构**：
1. **统计栏**：总收集进度条 + 各稀有度「已拥有/总数」卡片
2. **筛选栏**：
   - 稀有度多选（稀世/奇珍/独特/罕见/普通）
   - 角色下拉（仅出现在精华池中的角色）
   - 状态单选（全部/已获得/未获得）
   - 来源精华池下拉
   - 排序方式（获得顺序/稀有度/角色名/精华池）
3. **物品网格**：每张卡片展示占位图、名称、角色、来源、获得顺序和时间
4. **操作按钮**：未获得 → 「前往抽取」；有角色 → 「查看角色」

**样式设计**：
- 已获得：正常显示，带稀有度颜色边框
- 未获得：灰度 + 半透明（`filter: grayscale(0.4); opacity: 0.65`）

---

### 阶段四：UI 层 — 首次获得时装弹窗

**新增文件**：`src/views/Gacha/index.vue` 弹窗区块

**弹窗设计**：
- z-index 3000，覆盖在全屏遮罩之上
- 显示「记录第 X 件时装」
- 占位图标（复用精华图标）
- 时装名称（带稀有度颜色）
- 角色名
- 两个按钮：「更换新时装」「确认记录」（模拟场景下均关闭弹窗）

**队列机制**：一次十连可能获得多件新时装，`skinModalQueue` 按顺序逐个展示。

---

### 阶段五：个人中心增强

**修改文件**：`src/views/Profile/index.vue`

1. **统计卡片新增「当前碎片」**
2. **收藏图鉴快捷入口**：显示已收集进度，点击跳转 `/collection`
3. **注销账号按钮**：
   - 位置：页面底部
   - 二次确认弹窗（红色边框）
   - 确认后调用 `localStorage.removeItem('app')` + `location.reload()`
   - 注：mock 阶段直接删持久化缓存最干净，等后端接入后由服务端管理

---

## 问题与解决方案

### 问题一：characterId 格式不一致导致中英混搭

**现象**：图鉴卡片显示 `queen-bee - 蜂毒`、`female-dancer - 巫云`，而不是中文角色名。

**根因分析**：

```
essence pool JSON          profile.json
characterId: "queen-bee"   id: "queen_bee"
            ↑ 连字符                ↑ 下划线
```

`resolveItem()` 内部调用 `findCharacterItem(ref.characterId, ...)`，由于 `queen-bee` ≠ `queen_bee`，`characters.find(c => c.id === ref.characterId)` 找不到匹配项，进入 fallback 分支，直接用 `ref.characterId`（英文）作为 displayName 前缀。

**影响范围**：12 个角色的 characterId 存在连字符/下划线不匹配：

| pool characterId | profile.json id | 所在文件 |
|---|---|---|
| `the-feaster` | `the_feaster` | s42-e1.json |
| `evil-reptilian` | `evil_reptilian` | s42-e1.json |
| `the-shadow` | `the_shadow` | s42-e1/2.json |
| `the-ripper` | `ripper` | s42-e1.json |
| `queen-bee` | `queen_bee` | s42-e1.json |
| `little-girl` | `little_girl` | s42-e2.json |
| `fire-investigator` | `fire_investigator` | s42-e2.json |
| `faro-lady` | `faro_lady` | s42-e2.json |
| `fools-gold` | `fools_gold` | s42-e2.json |
| `female-dancer` | `female_dancer` | s42-e3.json |
| `night-watch` | `night_watch` | s42-e3.json |
| `opera-singer` | `opera_singer` | s42-e3.json |
| `weeping-clown` | `weeping_clown` | s42-e3.json |

**解决方案**：统一修正 essence pool JSON 中的 `characterId`，从连字符改为下划线，与 `profile.json` 的 `id` 保持一致。

**教训**：
- 角色文件夹命名使用连字符（如 `034-queen-bee`），但 `profile.json` 的 `id` 字段使用下划线（如 `queen_bee`）。
- essence pool 配置时直接 copy 了文件夹名风格，而不是查 `profile.json` 的 `id` 字段。
- **规范**：以后所有 `characterId` 引用必须以 `profile.json` 的 `id` 字段为准，不可假设与文件夹名一致。

---

### 问题二：common items 缺少 `id` 字段

**现象**：抽卡后 common items（头像/涂鸦/动作）无法被收藏册追踪。

**根因**：`resolveItem()` 对 `ref: 'common'` 的解析结果中不包含 `id`，只返回 `name`/`rarity`/`category`。

**解决方案**：在 `resolveItem()` 的 common 分支中增加 `id: ref.id` 字段，使得收藏册 key 生成逻辑可以正确工作。

---

### 问题三：历史记录不支持迁移

**现象**：大改后，之前抽卡的历史记录无法自动同步到收藏册。

**根因**：收藏册依赖 `ownedItems`/`ownedOrder`，而历史记录只存了 `drawRecords`。旧记录的 `results` 中物品没有稳定 key。

**决策**：mock 阶段历史记录丢失可接受。等后端接入后，收藏状态由服务端统一管理，前端无需维护迁移逻辑。

---

## 关键文件改动清单

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/data/essences/index.js` | 修改 | 新增 `getItemKey()`、`buildItemCatalog()`、`getItemPool()`；common items 返回 `id` |
| `src/stores/app.js` | 修改 | 新增 `shards`/`skinCount`/`skinModalQueue`/`ownedItems`/`ownedOrder`；`draw()` 返回碎片/弹窗数据；新增 `resetAccount()` |
| `src/views/Collection/index.vue` | 新增 | 收藏图鉴页面：统计、筛选、排序、卡片网格 |
| `src/views/Collection/index.vue` | 修改 | 角色级联多选、类型筛选、获得顺序仅时装显示 |
| `src/views/Gacha/index.vue` | 修改 | 新增碎片余额显示、碎片返还提示、首次获得时装弹窗、弹窗期间禁用抽取 |
| `src/views/Profile/index.vue` | 修改 | 新增碎片统计、收藏图鉴入口、注销账号按钮和弹窗 |
| `src/router/index.js` | 修改 | 新增 `/collection` 路由 |
| `src/components/NavHeader.vue` | 修改 | 新增「收藏图鉴」导航链接 |
| `src/data/essences/s42-e1.json` | 修改 | 修正 5 处 characterId（下划线化） |
| `src/data/essences/s42-e2.json` | 修改 | 修正 5 处 characterId（下划线化） |
| `src/data/essences/s42-e3.json` | 修改 | 修正 4 处 characterId（下划线化） |

---

## v2.0 — 深渊珍宝Ⅰ~Ⅸ（2026-04-20）

### 数据层

- **新增数据文件**：`src/data/essences/abyss-01.json` ~ `abyss-09.json`，共 9 个深渊珍宝池。
- **文件名规范**：统一为两位数字（`01`~`09`），避免文件系统排序错乱。
- **新增通用物品**：`common-items.json` 新增 91 个深渊专属物品（头像、涂鸦、随从、个性动作等）。

### Store 层

**深渊专属概率配置**：

| 品质 | 基础概率 | 保底 |
|---|---|---|
| 稀世（金） | 0.5% | 250抽 |
| 奇珍（紫） | 2.5% | 60抽 |
| 独特（蓝） | 15% | 10抽 |
| 罕见（绿） | 82% | — |
| 普通（灰） | **无** | — |

**奇珍不重复机制**：深渊池子的奇珍道具在全部获得之前不会重复。每个池子独立维护 `obtainedEpics` 数组，抽到 epic 时自动从尚未获得的列表中选取。

**`_performSingleDraw()` 逻辑拆分**：标准池与深渊池走不同概率分支，通过 `currentPoolInfo.type === 'abyss'` 判定。

### UI 层

**级联选择器分组**：深渊珍宝从平铺的特殊项改为「深渊的呼唤」二级分组，与赛季精华平级。

**图标路径**：`getEssenceIcon()` 深渊路径修正为 `/assets/essences/abyss/abyss-01.png`，图标需放入 `public/assets/essences/abyss/` 子目录。

**概率公示弹窗动态切换**：`probData` 从硬编码改为 computed，根据当前池子类型显示标准池（5行）或深渊池（4行，无普通）的概率与保底说明。

### 关键文件改动

| 文件 | 改动 |
|------|------|
| `src/data/essences/abyss-01~09.json` | **新增** 9 个深渊珍宝池 |
| `src/data/essences/common-items.json` | 新增 91 个深渊通用物品 |
| `src/data/essences/index.js` | POOL_MAP 注册 abyss-01~09 |
| `src/stores/app.js` | 扩展 ESSENCE_POOLS、深渊概率、奇珍去重、图标路径、级联分组 |
| `src/views/Gacha/index.vue` | 概率公示弹窗改为 computed，根据池子类型动态切换标准池/深渊池数据 |

---

---

## v2.1 — 奇珍连续重复规则修正（2026-04-20）

### 问题
最初将「最多连续2次相同奇珍」规则与「稀世保底200/250」绑定，统一以 s37-e3 为分界。但用户指出：
- **29-1 及之后**的常规精华才有「最多连续2次相同奇珍」规则
- **28-3 及之前**的常规精华允许连续多次相同奇珍（纯随机）
- 而稀世保底 200/250 的分界仍然是 **s37-e3**

### 修正

`_performSingleDraw()` 中新增独立判定 `hasEpicConsecutiveLimit`：

```js
const hasEpicConsecutiveLimit = poolInfo?.type === 'standard' && (
  (poolInfo?.season || 0) > 29 || ((poolInfo?.season || 0) === 29 && (poolInfo?.number || 0) >= 1)
)
```

- `isOldStandard`：仍控制概率分支（0.5%/250 还是 0.7%/200）
- `hasEpicConsecutiveLimit`：独立控制 max-2 奇珍连续限制

### 影响

| 赛季 | 稀世保底 | 奇珍连续限制 |
|------|----------|--------------|
| s28-e3 及之前 | 250 | 无限制 |
| s29-e1 ~ s37-e2 | 250 | 最多连续2次相同 |
| s37-e3 及之后 | 200 | 最多连续2次相同 |

---

## v2.2 — 内容说明弹窗与概率文案注释（2026-04-20）

### 内容说明弹窗

在抽卡界面精华标题下方新增「内容说明」按钮，点击后弹窗展示当前精华池内所有可获得物品，并标注已获得状态。

**分组规则**（参照官方图鉴）：
1. **稀世/奇珍精华时装**（legendary/epic + skin）
2. **独特/罕见精华时装**（unique/rare + skin）
3. **个性动作/等待动作**（itemType === 'emote' 或 category === 'emote'）
4. **其余物品**（头像、涂鸦、随从、随身物品等）

**卡片样式**：
- 已获得：正常不透明度 + 金色「已获得」徽章
- 未获得：`opacity: 0.45`，灰度展示
- 名称最多两行，防止截断

**关键文件**：`src/views/Gacha/index.vue`

### 概率文案注释

将官方深渊珍宝和 37-3 标准池的完整概率公示文案写入 `probData` 上方的代码注释，作为后续维护参考，不改动现有弹窗 UI。

### 关键文件改动

| 文件 | 改动 |
|------|------|
| `src/views/Gacha/index.vue` | 新增「内容说明」按钮与弹窗；概率文案注释；样式修复 |

---

---

## v2.3 — 抽卡结果常驻与弹窗时序优化（2026-04-20）

### 抽卡结果区域常驻

**问题**：`v-if` 切换导致抽卡结果区域出现时页面高度跳动，下方内容（抽卡记录折叠面板）被挤下去。

**方案**：改为常驻 `div`，无结果时显示占位提示：

```vue
<div class="result-area">
  <h3>抽取结果</h3>
  <div v-if="!lastResult" class="result-placeholder">点击上方按钮开启珍宝</div>
  <div v-else class="result-grid">...</div>
</div>
```

占位区域 `min-height: 140px`，与有结果时高度基本一致，彻底消除跳动。

### 首次获得弹窗时序调整

**问题**：`skinModalQueue.push()` 在 `store.draw()` 后立即执行，导致弹窗在光效/卡片动画之前出现，用户还没看到金光就看到了「记录第 X 件时装」。

**方案**：将入队逻辑移到所有动画结束后（卡片逐个弹出 + 碎片翻转完成后）：

```js
// 延迟后，重复物品翻转为碎片展示
const hasDuplicates = result.record.results.some(r => r.isDuplicate)
if (hasDuplicates) {
  await new Promise(r => setTimeout(r, 800))
  showFragments.value = true
}

// 所有动画结束后，首次获得时装弹窗入队
if (result.skinModals?.length > 0) {
  store.skinModalQueue.push(...result.skinModals)
}
```

### 代码注释补全

| 文件 | 补全范围 |
|------|----------|
| `src/views/Gacha/index.vue` | computed（`contentGroups`、`visibleRecords`、`probData`）、辅助函数（`isHighRarity`、`getHighestRarity`、`particleStyle`、`handleDraw`）、style 分区 |
| `src/views/Collection/index.vue` | `filteredItems` 筛选排序逻辑 |
| `src/router/index.js` | 路由按功能模块分组注释 |
| `src/components/NavHeader.vue` | 模板分区 + style 区块 |

---

## 问题与解决方案（追加）

### 问题四：Element Plus Dialog 样式覆盖失败

**现象**：内容说明弹窗设置了暗色背景，但实际渲染仍为白色。

**根因**：Element Plus 的 `el-dialog` 默认开启 `append-to-body`（teleport 到 body 下），Vue scoped CSS 的 `[data-v-xxx]` 属性选择器只作用于组件内的 DOM，无法穿透到 body 下的 dialog。

**解决方案**：将 dialog 样式从 `scoped` 块移到单独的 `<style>` 全局块，并加 `!important` 覆盖 Element Plus 默认变量：

```vue
<style>
.content-modal .el-dialog {
  background: #1e1a15 !important;
  border: 1px solid #3d342b !important;
}
</style>
```

**教训**：所有需要 teleport 到 body 的 Element Plus 组件（Dialog、Drawer、Popconfirm、MessageBox 等），其外层容器样式都不能放在 scoped CSS 里，必须走全局样式。

---

## v3.0 — 收藏图鉴筛选大改（2026-04-20）

### 需求

用户提出 5 点改进：
1. 角色筛选支持两级：先选阵营（求生者/监管者/NPC），再选具体角色
2. 支持输入角色名快速搜索，并支持同时选中多个角色
3. 支持物品类型多选筛选（时装/随身物品/个性动作/头像/涂鸦）
4. 只有时装显示「第 X 个获得」，其他物品不显示
5. 抽卡动画和弹窗期间，禁用抽取按钮，防止误触

### 角色筛选：级联选择器（el-cascader）

**替换组件**：单选 `el-select` → `el-cascader`（multiple + filterable + collapse-tags）

**数据结构**：

```js
[
  { value: 'survivor', label: '求生者', children: [...] },
  { value: 'hunter',   label: '监管者', children: [...] },
  { value: 'npc',      label: 'NPC',    children: [...] },
]
```

**交互**：
- 点击复选框 → 选中整个阵营（所有该阵营角色的物品）
- 展开二级 → 可单独勾选/取消具体角色
- 输入搜索 → 可跨级搜索角色名

**标签显示优化**：
- `show-all-levels="false"`：标签只显示角色名，不显示完整路径
- `collapse-tags` + `:max-collapse-tags="1"`：最多显示 1 个标签，其余折叠为 `+N`
- CSS 限制标签区域高度，防止溢出

### 物品类型筛选

新增「类型」筛选组：

```vue
<el-checkbox-group v-model="filterItemTypes" size="small">
  <el-checkbox label="skin">时装</el-checkbox>
  <el-checkbox label="accessory">随身物品</el-checkbox>
  <el-checkbox label="emote">个性动作</el-checkbox>
  <el-checkbox label="avatar">头像</el-checkbox>
  <el-checkbox label="graffiti">涂鸦</el-checkbox>
</el-checkbox-group>
```

**兼容两种字段**：
- character items 用 `itemType`（skin/accessory/emote）
- common items 用 `category`（avatar/graffiti/emote）
- 统一通过 `getItemCategory(item)` 获取

### 获得顺序仅时装显示

收藏图鉴卡片中的「第 X 个获得」信息，从 `isOwned(item.key)` 改为：

```vue
<div v-if="isOwned(item.key) && item.itemType === 'skin'" class="item-acquired">
```

**配套 Store 逻辑**：`draw()` 中只给 `itemType === 'skin'` 的首次获得物品入 `skinModalQueue`，只有时装弹窗。

### 弹窗期间禁用抽取按钮

抽卡按钮的 `:disabled` 条件从 `isSpinning` 扩展为：

```vue
:disabled="isSpinning || store.skinModalQueue.length > 0"
```

确保所有动画（光效、卡片弹出、碎片翻转）和弹窗队列全部结束后，才能进行下一次抽取。

### 关键文件改动

| 文件 | 改动 |
|------|------|
| `src/views/Collection/index.vue` | 角色筛选改为级联选择器；新增类型筛选；筛选逻辑支持多角色+多类型；获得顺序仅时装显示 |
| `src/views/Gacha/index.vue` | 抽取按钮禁用条件增加 `skinModalQueue.length > 0` |

---

## v3.1 — 收藏图鉴分页（2026-04-20）

### 背景

收藏图鉴物品总数已增长至 500+，全量渲染导致页面滚动过长、DOM 节点过多。用户反馈需要分页或虚拟滚动提升浏览体验。

### 方案：Element Plus 分页

选用 `el-pagination` 而非虚拟滚动，原因：
- 图鉴以「浏览+筛选」为主，分页更符合用户心智模型
- 虚拟滚动对 CSS Grid 布局支持不佳（`vue-virtual-scroller` 主要针对一维列表）
- 分页实现简单，无额外依赖

**实现**：

```vue
<!-- 分页栏 -->
<div class="pagination-bar">
  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="filteredItems.length"
    :page-sizes="[15, 30, 60, 100]"
    layout="total, sizes, prev, pager, next, jumper"
    background
    size="small"
  />
</div>
```

**分页数据**：

```js
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredItems.value.slice(start, start + pageSize.value)
})
```

**交互细节**：
- 默认每页 15 条（约 3 行 × 5 列），兼顾首屏展示密度和加载性能
- 筛选条件变化时通过 `watch` 自动重置到第 1 页，避免「筛选后当前页超出范围」

### 关键文件改动

| 文件 | 改动 |
|------|------|
| `src/views/Collection/index.vue` | 新增分页状态、分页计算属性、分页栏；网格改为渲染 `pagedItems` |

---

## 后续待办

1. **图片占位替换**：目前使用 `standard-1.png` 作为所有物品的占位图，后续需接入真实物品图标。
2. **国际化（i18n）**：`nameEn` 字段目前只是中文镜像，需要填入真实英文翻译。
3. **后端接入**：收藏状态、碎片余额、抽卡记录等迁移到服务端。
4. **时装立绘**：首次获得弹窗目前用精华图标占位，需接入角色时装立绘。
5. **联动精华/剧情精华**：图标目录结构和池子数据待补充。
