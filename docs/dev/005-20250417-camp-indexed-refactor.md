# 005 — 数据层再重构：按阵营+序号分目录

> 文档编号：005  
> 创建日期：2025-04-17  
> 最后更新：2025-04-17

---

## 版本记录

| 版本 | 日期 | 更新内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2025-04-17 | 在 004 基础上，将角色目录按阵营分组，并以 `XXX-slug` 的序号格式命名 | Claude |

---

## 重构背景

004 文档完成后，角色数据虽然已从单一 `characters.json` 拆分为按角色分目录的结构，但所有角色的目录平铺在同一层级：
- 随着角色数量增加（51 位求生者 + 35 位监管者 + 3 位 NPC），平铺目录会变得难以浏览。
- 目录名不含序号，无法直观反映角色上线顺序。
- 不利于批量管理和按阵营筛选。

## 新目录规范

```
src/data/characters/
├── index.js
├── survivors/               # 求生者阵营
│   ├── 001-lucky-guy/
│   ├── 002-doctor/
│   ├── ...
│   └── 051-matador/
├── hunters/                 # 监管者阵营
│   ├── 001-hell-ember/
│   ├── 002-smiley-face/
│   ├── ...
│   └── 035-dentist/
└── npcs/                    # 剧情 NPC
    ├── 001-detective-orpheus/
    ├── 002-game-master/
    └── 003-martha/
```

### 命名规则

- **文件夹名**：`XXX-slug`
  - `XXX`：三位序号，阵营内独立递增（从 001 开始）
  - `slug`：角色英文名或惯用简称，经过以下处理：
    - 全小写
    - 去掉引号 `'` 和特殊符号
    - 空格变连字符 `-`
    - 去首尾连字符
- **内部文件**：每个角色目录下固定四个文件
  - `profile.json` — 基础资料、背景、档案、关系网
  - `abilities.json` — 技能 / 外在特质
  - `stories.json` — 推演、生日信、传闻等剧情文本
  - `gameplay.json` — 天赋、标签

## 数据迁移

- **51 位求生者**：全部生成空模板（四个空 JSON），其中已有数据的角色（doctor, mercenary, mechanic, seer）保留原内容。
- **35 位监管者**：全部生成空模板，其中已有数据的角色（hell_ember, ripper, geisha）保留原内容。
- **3 位 NPC**：全部生成空模板，其中已有数据的角色（detective_orpheus, game_master, martha）保留原内容。

## 聚合器 (`index.js`)

`index.js` 按 `survivors/`、`hunters/`、`npcs/` 的顺序导入所有子目录中的 JSON，并展开合并为统一的 `characters` 数组。导入变量名中的连字符已替换为下划线，确保合法的 JavaScript 标识符。

前端页面的 import 路径保持不变：
```js
import { characters } from '../data/characters/index.js'
```

## 变更清单

### 新增/重建
- `src/data/characters/survivors/` — 51 个角色目录
- `src/data/characters/hunters/` — 35 个角色目录
- `src/data/characters/npcs/` — 3 个角色目录
- `src/data/characters/index.js` — 重新生成的聚合器

### 保留的中间产物
- `scripts/rebuild-chars.cjs` — 批量生成脚本，作为纪念和后续复用参考

## 验证结果

- `npm run dev` 正常启动（Vite 无报错）
- 角色图鉴页正确渲染 89 个角色
- 已有数据角色（如先知 `017-seer`）的推演、档案、技能等内容正常显示

## 后续扩展建议

- 新增求生者时，在 `survivors/` 下创建 `052-new-character/` 目录并更新 `index.js` 即可。
- 后续可将 `maps.json` 和 `analyses.json` 也拆分为 `maps/XXX-slug/` 和 `analyses/XXX-slug/` 的目录结构，与角色数据保持统一。
