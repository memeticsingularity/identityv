# 003 — Wiki 内容扩展：NPC、地图与剧情分析

> 文档编号：003  
> 创建日期：2025-04-17  
> 最后更新：2025-04-17

---

## 版本记录

| 版本 | 日期 | 更新内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2025-04-17 | 初始版本，定义 NPC、地图、剧情分析模块及双向关联方案 | Claude |

---

## 需求背景

在首次搭建的 Wiki 基础上，用户提出第二次增量需求：
1. **NPC 角色图鉴**：除玩家可操作的求生者/监管者外，补充剧情中出现的 NPC（如侦探奥尔菲斯、庄园主、玛莎等）。
2. **游戏地图/场景收录**：对局地图及剧情中提到的关键场景（如圣心医院、红教堂、湖景村等）。
3. **剧情分析文章**：独立的分析类内容，可对主线、角色推演、活动剧情进行解读、考据、时间线梳理。
4. **双向关联**：角色 ↔ 剧情分析、地图 ↔ 剧情分析之间需互相引用，便于跳转和阅读。

## 技术方案

### 1. 数据层扩展

#### `characters.json` 字段调整
新增 `type` 字段区分角色类型：
- `survivor` — 求生者（可玩）
- `hunter` — 监管者（可玩）
- `npc` — 剧情 NPC

NPC 对象保留与可玩角色相同的字段结构（`id`、`name`、`background`、`stories` 等），但 `camp` 统一为 `npc`，`role` 可描述其在剧情中的身份。

#### 新增 `maps.json`
```json
{
  "id": "sacred_heart_hospital",
  "name": "圣心医院",
  "type": "map",
  "description": "...",
  "background": "...",
  "features": ["二楼破洞", "女神像", "废墟"],
  "relatedAnalyses": ["a001"]
}
```

#### 新增 `analyses.json`
```json
{
  "id": "a001",
  "title": "圣心医院与主线剧情的关联",
  "category": "地图考据",
  "summary": "...",
  "content": "...",
  "relatedCharacters": ["detective_orpheus"],
  "relatedMaps": ["sacred_heart_hospital"],
  "tags": ["主线", "医院"]
}
```

### 2. 页面层扩展

| 路由 | 页面组件 | 说明 |
|------|----------|------|
| `/maps` | `MapListView` | 地图/场景列表，按类型筛选 |
| `/maps/:id` | `MapDetailView` | 地图详情，展示背景、特征、关联分析 |
| `/analyses` | `AnalysisListView` | 剧情分析文章列表，带分类和标签筛选 |
| `/analyses/:id` | `AnalysisDetailView` | 分析详情正文，底部展示关联角色和地图 |

### 3. 已有页面调整

- **CharacterListView**：Tab 增加 "NPC" 选项（全部 / 求生者 / 监管者 / NPC）。
- **CharacterDetailView**：详情标签页增加 "关联分析"，列出引用了该角色的分析文章。
- **NavHeader**：导航栏增加 "地图"、"剧情分析" 入口。
- **StoryListView**：保持活动剧情和角色剧情入口，后续可与分析内容做交叉推荐。

### 4. 关联实现方式

- **正向关联**：分析文章通过 `relatedCharacters` 和 `relatedMaps` 字段声明关联对象。
- **反向关联**：页面组件内通过 `computed` 遍历 `analyses.json`，筛选出包含当前角色/地图 ID 的分析列表。无需维护反向索引，降低数据维护成本。

## 变更清单

### 新增文件
- `src/data/maps.json`
- `src/data/analyses.json`
- `src/views/MapList/index.vue`
- `src/views/MapDetail/index.vue`
- `src/views/AnalysisList/index.vue`
- `src/views/AnalysisDetail/index.vue`

### 修改文件
- `src/data/characters.json` — 增加 `type` 字段，补充 NPC 示例数据
- `src/views/CharacterList/index.vue` — 增加 NPC 筛选 Tab
- `src/views/CharacterDetail/index.vue` — 增加 "关联分析" 标签页
- `src/components/NavHeader.vue` — 增加地图、剧情分析导航
- `src/router/index.js` — 注册新增路由
- `docs/README.md` — 更新文档索引

## 可扩展方向

- 引入全文搜索，支持角色、地图、分析文章的统一检索。
- 增加 "时间线" 页面，将角色推演、活动剧情、分析文章按时间轴串联。
- 支持 Markdown / 富文本渲染，提升分析文章的可读性。
