# 第五人格 Wiki（本地版）

一个基于 Vue 3 + Vite 构建的本地第五人格资料站，所有数据通过本地 mock JSON 维护，无需后端。

## 核心定位

- **剧情分析**为主：主线解读、角色推演考据、地图背景、活动剧情分析。
- **剧情收录**为辅：角色推演、生日信、活动剧情、主线时间线。
- **角色图鉴**：求生者、监管者、剧情 NPC 资料与技能。
- **地图/场景**：竞技地图与剧情场景的收录及关联分析。

## 快速开始

```bash
npm install
npm run dev
```

浏览器访问 `http://localhost:5173/` 即可预览。

## 页面导航

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 快速入口 |
| 角色图鉴 | `/characters` | 求生者 / 监管者 / NPC 分类浏览 |
| 角色详情 | `/characters/:id` | 背景、技能、天赋、标签、关联分析 |
| 地图与场景 | `/maps` | 竞技地图 / 剧情场景分类浏览 |
| 地图详情 | `/maps/:id` | 背景故事、特征、关联分析 |
| 剧情收录 | `/stories` | 活动剧情与角色剧情入口 |
| 剧情分析 | `/analyses` | 分析文章列表，支持分类筛选 |
| 分析详情 | `/analyses/:id` | 正文与关联角色、地图双向引用 |

## 目录结构

```
src/
├── assets/           # 全局样式
├── components/       # 公共组件
├── data/             # mock 数据
│   ├── characters.json   # 角色总表（求生者 / 监管者 / NPC）
│   ├── stories.json      # 剧情总表
│   ├── maps.json         # 地图/场景总表
│   └── analyses.json     # 剧情分析文章总表
├── router/           # 路由配置
├── views/            # 页面组件
│   ├── HomeView.vue
│   ├── CharacterListView.vue
│   ├── CharacterDetailView.vue
│   ├── StoryListView.vue
│   ├── MapListView.vue
│   ├── MapDetailView.vue
│   ├── AnalysisListView.vue
│   └── AnalysisDetailView.vue
├── App.vue
└── main.js
```

## 扩展数据

所有资料均存储在 `src/data/` 目录下，直接编辑 JSON 即可新增内容，无需后端。

### 双向关联规则

- **分析文章**通过 `relatedCharacters` 和 `relatedMaps` 声明关联对象。
- **角色/地图详情页**会自动反向查找出引用了该对象的分析文章。
- 这保证了数据维护只需维护一个方向，页面自动构建双向链接。

## 文档记录

项目相关的开发记录和排错笔记存放在 `docs/` 目录下：

- [001 项目初始化](docs/dev/001-20250417-project-init.md)
- [002 nvm / Node.js 环境配置排错](docs/troubleshooting/002-20250417-nvm-node-setup.md)
- [003 Wiki 内容扩展：NPC、地图与剧情分析](docs/dev/003-20250417-wiki-expansion.md)

## 技术栈

- Vue 3（Composition API）
- Vue Router 4
- Vite
- 原生 CSS（无重型 UI 框架）
