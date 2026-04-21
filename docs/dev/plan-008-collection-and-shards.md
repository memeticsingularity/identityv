# 图鉴/收藏册功能实现计划

## Context

目前模拟抽卡已经支持从真实精华池配置中抽取具体道具（角色皮肤、通用动作/头像/涂鸦等），但用户无法在抽卡后查看「我已获得哪些物品」。用户希望在个人中心或独立页面中看到一个图鉴系统，功能包括：

1. **已获得/未获得**状态展示
2. **显示如何获得**（如「通过抽取第42赛季·精华3获得」）
3. **快捷跳转**到对应抽卡池进行抽取
4. **排序筛选**：按获得顺序、稀有度、角色筛选

## Recommended Approach

### 1. 数据层：构建全物品目录（Catalog）

在 `src/data/essences/index.js` 中新增 `buildItemCatalog()` 和 `getItemPoolMap()`：

- 遍历所有已注册的精华池（`POOL_MAP`）
- 调用 `resolveItem()` 解析每个引用为完整物品对象
- 为每个物品生成**稳定 key**：
  - 角色物品：`character:{characterId}:{itemType}:{name}`（例：`character:hullabaloo:skin:黑鹫`）
  - 通用物品：`common:{id}`（例：`common:emote-u-breaking-wheel-visit`）
- 返回 `catalog` 数组和 `itemKeyToPool` 映射（`Map<key, poolId>`）
- 同时暴露 `getItemPool(key)` 查询某个物品来自哪个池子

这些数据是**派生数据**（从 pool JSON 实时计算），不需要持久化，启动时构建一次即可。

### 2. Store 层：跟踪已拥有物品

在 `src/stores/app.js` 中新增：

```js
// 已拥有物品的稳定 key 集合
const ownedItems = ref(new Set())
// 按获得时间排序的 key 数组
const ownedOrder = ref([])
```

在 `draw()` 成功返回后，遍历 `result.record.results`，为每个物品计算稳定 key 并：
- `ownedItems.add(key)`
- `ownedOrder.push(key)`（如首次获得；若重复获得则只更新时间戳）

> 注：重复获得不叠加数量（Identity V 中时装/挂件不重复掉落），只记录「是否拥有」。

Store 的 `persist` 配置需要加入 `ownedItems` 和 `ownedOrder`。由于 `Set` 无法直接 JSON 序列化，需要配合自定义序列化或在 persist 中配置 `beforeRestore`/`afterRestore` 转换。

新增计算属性：
- `collectionStats`：按稀有度统计已拥有/总数
- `ownedItemDetails`：将 `ownedOrder` 映射为完整的物品对象数组（用于按获得顺序展示）

### 3. UI 层：新建图鉴页面

创建 `src/views/Collection/index.vue`：

#### 页面结构
- **顶部统计栏**：各稀有度「已拥有 / 总数」环形进度（复用 Profile 页面的卡片风格）
- **筛选栏**：
  - 稀有度筛选：多选 checkbox（稀世/奇珍/独特/罕见/普通）
  - 角色筛选：下拉选择（从 `characters` 数组生成，仅含出现在精华池中的角色）
  - 获得状态：全部 / 已获得 / 未获得
  - 来源筛选：下拉选择精华池
  - 排序方式：获得顺序（默认） / 稀有度（高→低） / 角色名 / 精华池
- **物品网格**：
  - 每个物品一张卡片
  - 已获得：正常展示，带稀有度颜色边框
  - 未获得：灰度/半透明遮罩，显示「未获得」
  - 卡片内容：物品名称（`displayName`）、角色名、稀有度标签、来源池名称
  - 操作：
    - 已获得：「查看角色详情」跳转到 `/characters/:id`
    - 未获得 + 有来源池：「前往抽取」按钮，点击后 `switchPool(poolId)` + `router.push('/gacha')`

#### 交互细节
- 筛选结果实时响应
- 空结果时显示提示
- 卡片悬停效果（边框高亮）

### 4. 路由与导航

- `src/router/index.js`：新增 `{ path: '/collection', name: 'Collection', component: CollectionView }`
- `src/components/NavHeader.vue`：新增「收藏图鉴」导航链接
- `src/views/Profile/index.vue`：在统计卡片区域下方或抽卡记录旁边增加一个「查看收藏图鉴」快捷入口

### 5. 数据联动

- 抽卡获得新物品后，图鉴页面刷新时自动显示为「已获得」
- 由于 `ownedItems` 是响应式 `Set`，图鉴页面的 `computed` 会自动更新

## Critical Files to Modify

| 文件 | 改动 |
|------|------|
| `src/data/essences/index.js` | 新增 `buildItemCatalog()`、`getItemPoolMap()`、`getItemPool(key)`、稳定 key 生成函数 |
| `src/stores/app.js` | 新增 `ownedItems`/`ownedOrder` ref、`collectionStats` computed、在 `draw()` 中记录拥有状态、调整 persist 配置 |
| `src/views/Collection/index.vue` | **新建**图鉴页面 |
| `src/router/index.js` | 新增 `/collection` 路由 |
| `src/components/NavHeader.vue` | 新增导航链接 |
| `src/views/Profile/index.vue` | 增加图鉴入口、将抽卡记录中的 `item.name` 替换为 `item.displayName || item.name` |

## Verification

1. 启动 dev server，进入「收藏图鉴」页面
2. 验证所有 s42 精华池中的物品都已列出
3. 筛选「未获得」应显示大部分为灰色；筛选「已获得」应为空
4. 进行一次十连抽卡
5. 回到图鉴页面，筛选「已获得」应显示刚才抽到的物品（带颜色、有获得时间排序）
6. 点击某个未获得物品的「前往抽取」按钮，应跳转到 `/gacha` 并自动切换到对应精华池
7. 构建 `npx vite build` 无报错
