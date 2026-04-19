# 004 — 数据层重构：按角色分目录拆分

> 文档编号：004  
> 创建日期：2025-04-17  
> 最后更新：2025-04-17

---

## 版本记录

| 版本 | 日期 | 更新内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2025-04-17 | 完成 `characters.json` 拆分，建立按角色分目录的 mock 数据结构 | Claude |

---

## 重构背景

随着先知等角色的加入，`src/data/characters.json` 迅速膨胀到 250+ 行，包含：基础资料、技能、天赋、标签、推演、生日信、档案、关系网等多种异构数据。这带来以下问题：
- **维护困难**：新增/修改一个角色需要编辑同一个巨大文件，易产生冲突和误操作。
- **结构臃肿**：剧情内容（推演/信件）与 gameplay 内容（技能/天赋）混合，不利于阅读和管理。
- **难以对接后端**：真实后端通常会将这些数据拆分到不同的表（角色表、技能表、剧情表），单一 JSON 无法体现这种关系。

## 重构方案

### 新目录结构

```
src/data/characters/
├── index.js                 # 聚合器：统一导入并合并为原来的角色数组
├── mercenary/
│   ├── profile.json         # 基础资料、背景、档案、关系网
│   ├── abilities.json       # 技能 / 外在特质
│   ├── stories.json         # 推演、生日信、传闻等剧情
│   └── gameplay.json        # 天赋、标签
├── seer/                    # 先知，第一个完整使用新结构的示例
│   ├── profile.json
│   ├── abilities.json
│   ├── stories.json
│   └── gameplay.json
└── ...
```

### 文件职责

| 文件 | 内容 | 对应后端概念 |
|------|------|--------------|
| `profile.json` | `id`, `name`, `type`, `camp`, `role`, `background`, `avatar`, `profile`（档案）, `relationships`（关系网） | 角色主表 |
| `abilities.json` | `abilities` 数组 | 技能表 |
| `stories.json` | `stories` 数组（推演、信件、传闻） | 剧情/文本表 |
| `gameplay.json` | `talents`, `tags` | 玩法配置表 |

### 聚合器 (`index.js`)

每个角色的四个文件在 `index.js` 中被导入并展开合并，最终导出与旧版完全一致的 `characters` 数组：

```js
import seer_profile from './seer/profile.json'
import seer_gameplay from './seer/gameplay.json'
import seer_abilities from './seer/abilities.json'
import seer_stories from './seer/stories.json'

export const characters = [
  {
    ...seer_profile,
    ...seer_gameplay,
    abilities: seer_abilities,
    stories: seer_stories,
  },
  // ...
]
```

前端页面只需将 import 路径从：
```js
import characters from '../data/characters.json'
```
改为：
```js
import { characters } from '../data/characters/index.js'
```

即可零改动地继续使用原来的数据结构。

## 影响范围

### 修改的文件
- `src/views/CharacterList/index.vue` — 更新 import 路径
- `src/views/CharacterDetail/index.vue` — 更新 import 路径
- `src/views/StoryList/index.vue` — 更新 import 路径
- `src/views/AnalysisDetail/index.vue` — 更新 import 路径

### 删除的文件
- `src/data/characters.json` — 由拆分后的目录结构替代

### 新增的文件
- `src/data/characters/index.js` — 聚合器
- `src/data/characters/{id}/*` — 每个角色的 4 个拆分文件（共 9 个角色 × 4 = 36 个新文件）

## 验证结果

- `npm install` 成功
- `npm run dev` 启动成功（Vite 正常运行于 `localhost:5174`）
- 角色图鉴、角色详情、剧情分析等页面加载无报错

## 后续扩展建议

- 当角色数量进一步增加时，可将 `index.js` 改为动态 `import()`，实现按需加载。
- 可进一步将 `maps.json` 和 `analyses.json` 也拆分为按实体分目录的结构，保持整个 `src/data/` 层的一致性。
- `stories.json` 未来可细分为 `deductions.json`（推演）和 `letters.json`（信件），如果剧情内容继续膨胀。
