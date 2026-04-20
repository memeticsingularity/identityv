<template>
  <div class="collection-page">
    <h2 class="page-title">收藏图鉴</h2>

    <!-- 统计栏 -->
    <div class="stats-bar">
      <div class="total-stat">
        <div class="total-number">{{ store.collectionStats.obtained }} / {{ store.collectionStats.total }}</div>
        <div class="total-label">总收集进度</div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: collectionProgressPercent + '%' }"
          />
        </div>
      </div>
      <div
        v-for="key in rarityOrder"
        :key="key"
        class="rarity-stat-card"
        :style="{ borderColor: RARITY_CONFIG[key].color }"
      >
        <div class="rarity-stat-count" :style="{ color: RARITY_CONFIG[key].color }">
          {{ store.collectionStats.byRarity[key].obtained }} / {{ store.collectionStats.byRarity[key].total }}
        </div>
        <div class="rarity-stat-label">{{ RARITY_CONFIG[key].label }}</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">稀有度</span>
        <el-checkbox-group v-model="filterRarity">
          <el-checkbox
            v-for="key in rarityOrder"
            :key="key"
            :value="key"
            :style="{ '--el-checkbox-checked-text-color': RARITY_CONFIG[key].color }"
          >
            <span :style="{ color: RARITY_CONFIG[key].color }">{{ RARITY_CONFIG[key].label }}</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="filter-group">
        <span class="filter-label">角色</span>
        <el-cascader
          v-model="filterCharacters"
          :options="characterCascaderOptions"
          :props="{ multiple: true, emitPath: false }"
          filterable
          :show-all-levels="false"
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="1"
          clearable
          placeholder="选择角色"
          size="small"
          style="width: 220px"
          popper-class="dark-popper"
        />
      </div>

      <div class="filter-group">
        <span class="filter-label">类型</span>
        <el-checkbox-group v-model="filterItemTypes" size="small">
          <el-checkbox value="skin">时装</el-checkbox>
          <el-checkbox value="accessory">随身物品</el-checkbox>
          <el-checkbox value="emote">个性动作</el-checkbox>
          <el-checkbox value="avatar">头像</el-checkbox>
          <el-checkbox value="graffiti">涂鸦</el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="filter-group">
        <span class="filter-label">状态</span>
        <el-radio-group v-model="filterOwned" size="small">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="owned">已获得</el-radio-button>
          <el-radio-button value="unowned">未获得</el-radio-button>
        </el-radio-group>
      </div>

      <div class="filter-group">
        <span class="filter-label">来源</span>
        <el-select v-model="filterPool" placeholder="全部精华池" clearable size="small" style="width: 160px" popper-class="dark-popper">
          <el-option label="全部精华池" value="" />
          <el-option
            v-for="pool in realPools"
            :key="pool.id"
            :label="pool.name"
            :value="pool.id"
          />
        </el-select>
      </div>

      <div class="filter-group" style="flex: 1; min-width: 200px">
        <span class="filter-label">搜索</span>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索时装、赛季..."
          size="small"
          clearable
          style="width: 100%; max-width: 280px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="filter-group">
        <span class="filter-label">排序</span>
        <el-select v-model="sortBy" size="small" style="width: 160px" popper-class="dark-popper">
          <el-option label="获得顺序" value="acquired" />
          <el-option label="稀有度（高→低）" value="rarity-desc" />
          <el-option label="稀有度（低→高）" value="rarity-asc" />
          <el-option label="角色名" value="character" />
          <el-option label="精华池" value="pool" />
          <el-option label="上线时间（新→旧）" value="date-desc" />
          <el-option label="上线时间（旧→新）" value="date-asc" />
        </el-select>
      </div>
    </div>

    <!-- 结果统计 -->
    <div class="result-info">
      共 <strong>{{ filteredItems.length }}</strong> 件物品
      <span v-if="filterOwned === 'unowned'" class="hint">（未获得物品可点击「前往抽取」）</span>
    </div>

    <!-- 物品网格 -->
    <div v-if="pagedItems.length > 0" class="item-grid">
      <div
        v-for="item in pagedItems"
        :key="item.key"
        class="item-card"
        :class="{ owned: isOwned(item.key), unowned: !isOwned(item.key) }"
        :style="{ borderColor: isOwned(item.key) ? RARITY_CONFIG[item.rarity].color : '#5a4d3e' }"
      >
        <div class="card-header">
          <span
            class="rarity-tag"
            :style="{ backgroundColor: RARITY_CONFIG[item.rarity].color }"
          >
            {{ RARITY_CONFIG[item.rarity].label }}
          </span>
          <span v-if="isOwned(item.key)" class="owned-badge">已拥有</span>
          <span v-else class="unowned-badge">未获得</span>
        </div>

        <div class="card-body">
          <div class="item-image-placeholder">
            <img src="/assets/essences/standard-1.png" alt="占位" />
          </div>
          <div class="item-title" :style="{ color: isOwned(item.key) ? RARITY_CONFIG[item.rarity].color : '#a89b8c' }">
            {{ item.displayName || item.name }}
          </div>
          <div v-if="item.characterName" class="item-character">
            角色：<a class="link-text" @click.stop="goToCharacter(item.characterId)">{{ item.characterName }}</a>
          </div>
          <div v-if="item.category" class="item-category">
            类型：{{ categoryLabel(item.category) }}
          </div>
          <div class="item-source">
            来源：<a class="link-text" @click.stop="goToPool(item.poolId)">{{ poolName(item.poolId) }}</a>
          </div>
          <div v-if="isOwned(item.key) && item.itemType === 'skin'" class="item-acquired">
            <span>第 {{ acquiredIndex(item.key) }} 个获得</span>
            <span class="acquired-time">{{ formatAcquiredTime(item.key) }}</span>
          </div>
        </div>

        <div class="card-footer">
          <el-button
            v-if="!isOwned(item.key) && item.poolId"
            type="primary"
            size="small"
            @click="goToPool(item.poolId)"
          >
            前往抽取
          </el-button>
          <el-button
            v-if="item.characterId"
            type="info"
            size="small"
            text
            @click="goToCharacter(item.characterId)"
          >
            查看角色
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="filteredItems.length > 0" class="pagination-bar">
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

    <div v-else class="empty-tip">
      没有找到符合条件的物品
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useAppStore, RARITY_CONFIG, ESSENCE_POOLS } from '../../stores/app'
import { buildItemCatalog } from '../../data/essences/index.js'
import characters from '../../data/characters/index.js'

const store = useAppStore()
const router = useRouter()

const catalog = buildItemCatalog()
const rarityOrder = ['legendary', 'epic', 'unique', 'rare', 'common']

// 筛选状态
const filterRarity = ref([...rarityOrder])
const filterCharacters = ref([])
const filterItemTypes = ref([])
const filterOwned = ref('')
const filterPool = ref('')
const searchKeyword = ref('')
const sortBy = ref('acquired')
const currentPage = ref(1)
const pageSize = ref(15)

// 筛选条件变化时重置到第 1 页
watch([filterRarity, filterCharacters, filterItemTypes, filterOwned, filterPool, searchKeyword, sortBy], () => {
  currentPage.value = 1
}, { deep: true })

// 所有角色按阵营分组（不限于精华池中出现过的）
const allCharactersRaw = characters.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))

const characterCascaderOptions = computed(() => {
  const groups = [
    { key: 'survivor', label: '求生者' },
    { key: 'hunter', label: '监管者' },
    { key: 'npc', label: 'NPC' },
  ]
  return groups.map(g => ({
    value: g.key,
    label: g.label,
    children: allCharactersRaw
      .filter(c => c.type === g.key)
      .map(c => ({ value: c.id, label: c.name })),
  }))
})

// 有真实配置的精华池
const realPools = computed(() => ESSENCE_POOLS.filter(p => catalog.some(i => i.poolId === p.id)))

const ownedSet = computed(() => new Set(store.ownedItems))

const collectionProgressPercent = computed(() => {
  const { obtained, total } = store.collectionStats
  return total > 0 ? Math.round((obtained / total) * 100) : 0
})

function isOwned(key) {
  return ownedSet.value.has(key)
}

function poolName(poolId) {
  const pool = ESSENCE_POOLS.find(p => p.id === poolId)
  return pool?.name || poolId
}

function categoryLabel(cat) {
  const map = { emote: '个性动作', avatar: '头像', graffiti: '涂鸦', skin: '时装', accessory: '随身物品' }
  return map[cat] || cat
}

function getItemCategory(item) {
  return item.itemType || item.category || ''
}

function goToPool(poolId) {
  store.switchPool(poolId)
  router.push('/gacha')
}

function goToCharacter(characterId) {
  router.push(`/characters/${characterId}`)
}

const orderMap = computed(() => new Map(store.ownedOrder.map((o, idx) => [o.key, idx])))
const timeMap = computed(() => new Map(store.ownedOrder.map(o => [o.key, o.timestamp])))

function acquiredIndex(key) {
  const idx = orderMap.value.get(key)
  return idx !== undefined ? idx + 1 : '-'
}

function formatAcquiredTime(key) {
  const ts = timeMap.value.get(key)
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`
}

/** 稀有度排序权重（legendary 最高，common 最低） */
const rarityWeight = { legendary: 5, epic: 4, unique: 3, rare: 2, common: 1 }

/** 筛选 + 排序后的图鉴列表 */
const filteredItems = computed(() => {
  // 1. 筛选：稀有度 / 角色 / 类型 / 精华池 / 拥有状态
  let list = catalog.filter(item => {
    if (!filterRarity.value.includes(item.rarity)) return false
    if (filterCharacters.value.length > 0) {
      const selected = new Set(filterCharacters.value)
      let match = false
      if (selected.has(item.characterId)) match = true
      if (!match && item.characterId) {
        const char = characters.find(c => c.id === item.characterId)
        if (char && selected.has(char.type)) match = true
      }
      if (!match) return false
    }
    if (filterItemTypes.value.length > 0 && !filterItemTypes.value.includes(getItemCategory(item))) return false
    if (filterPool.value && item.poolId !== filterPool.value) return false
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      const pool = ESSENCE_POOLS.find(p => p.id === item.poolId)
      const seasonText = pool?.season > 0 ? `第${pool.season}赛季` : ''
      const text = [
        item.name,
        item.displayName,
        pool?.name,
        seasonText,
      ].filter(Boolean).join(' ').toLowerCase()
      if (!text.includes(kw)) return false
    }
    if (filterOwned.value === 'owned' && !isOwned(item.key)) return false
    if (filterOwned.value === 'unowned' && isOwned(item.key)) return false
    return true
  })

  // 2. 排序
  switch (sortBy.value) {
    case 'acquired': {
      // 按获得顺序：已获得的排在前面（按 ownedOrder 索引），未获得的排在后面（保持原序）
      const orderMap = new Map(store.ownedOrder.map((o, idx) => [o.key, idx]))
      list.sort((a, b) => {
        const ao = orderMap.get(a.key)
        const bo = orderMap.get(b.key)
        if (ao !== undefined && bo !== undefined) return ao - bo
        if (ao !== undefined) return -1
        if (bo !== undefined) return 1
        return 0
      })
      break
    }
    case 'rarity-desc':
      // 稀有度从高到低
      list.sort((a, b) => rarityWeight[b.rarity] - rarityWeight[a.rarity])
      break
    case 'rarity-asc':
      // 稀有度从低到高
      list.sort((a, b) => rarityWeight[a.rarity] - rarityWeight[b.rarity])
      break
    case 'character':
      // 先按角色名拼音排序，同名角色按物品名排序
      list.sort((a, b) => {
        const ca = a.characterName || ''
        const cb = b.characterName || ''
        return ca.localeCompare(cb, 'zh-CN') || a.name.localeCompare(b.name, 'zh-CN')
      })
      break
    case 'pool':
      // 按精华池名称拼音排序
      list.sort((a, b) => poolName(a.poolId).localeCompare(poolName(b.poolId), 'zh-CN'))
      break
    case 'date-desc': {
      const poolDate = (poolId) => ESSENCE_POOLS.find(p => p.id === poolId)?.releaseDate || ''
      list.sort((a, b) => poolDate(b.poolId).localeCompare(poolDate(a.poolId)))
      break
    }
    case 'date-asc': {
      const poolDate = (poolId) => ESSENCE_POOLS.find(p => p.id === poolId)?.releaseDate || ''
      list.sort((a, b) => poolDate(a.poolId).localeCompare(poolDate(b.poolId)))
      break
    }
  }

  return list
})

/** 分页后的物品列表 */
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredItems.value.slice(start, start + pageSize.value)
})
</script>

<style scoped>
.collection-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 24px;
}

/* ===== 统计栏 ===== */
.stats-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.total-stat {
  flex: 1;
  min-width: 200px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 24px;
  text-align: center;
}

.total-number {
  font-size: 28px;
  font-weight: bold;
  color: #c9a227;
  margin-bottom: 4px;
}

.total-label {
  font-size: 14px;
  color: #a89b8c;
  margin-bottom: 12px;
}

.progress-track {
  height: 8px;
  background: #3d342b;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9a227, #ffd700);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.rarity-stat-card {
  min-width: 110px;
  background: var(--bg-card);
  border: 1px solid;
  border-radius: 12px;
  padding: 16px 20px;
  text-align: center;
}

.rarity-stat-count {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 4px;
}

.rarity-stat-label {
  font-size: 13px;
  color: #a89b8c;
}

/* ===== 筛选栏 ===== */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  color: #a89b8c;
  white-space: nowrap;
}

.result-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: #a89b8c;
}

.result-info .hint {
  color: #c9a227;
  margin-left: 8px;
}

/* ===== 物品网格 ===== */
.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.item-card {
  background: var(--bg-card);
  border: 2px solid;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.item-card.owned {
  opacity: 1;
}

.item-card.unowned {
  opacity: 0.65;
  filter: grayscale(0.4);
}

.item-card.unowned:hover {
  opacity: 0.85;
  filter: grayscale(0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rarity-tag {
  color: white;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.owned-badge {
  font-size: 12px;
  color: #4caf50;
  font-weight: bold;
}

.unowned-badge {
  font-size: 12px;
  color: #9e9e9e;
}

.card-body {
  flex: 1;
  margin-bottom: 12px;
}

.item-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 6px;
  line-height: 1.4;
}

.item-character,
.item-category,
.item-source {
  font-size: 12px;
  color: #a89b8c;
  line-height: 1.6;
}

.link-text {
  color: var(--accent-gold);
  cursor: pointer;
}
.link-text:hover {
  text-decoration: underline;
}

.card-footer {
  display: flex;
  gap: 8px;
}

.empty-tip {
  text-align: center;
  padding: 48px;
  color: #a89b8c;
  background: var(--bg-card);
  border-radius: 12px;
}

.item-image-placeholder {
  width: 80px;
  height: 80px;
  margin: 0 auto 10px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2a2520, #1e1a15);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.item-image-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px;
  opacity: 0.6;
}

.item-acquired {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #3d342b;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #c9a227;
}

.acquired-time {
  color: #a89b8c;
  font-size: 11px;
}

/* ===== 角色级联选择器标签限制 ===== */
.filter-group :deep(.el-cascader__tags) {
  max-height: 28px;
  overflow: hidden;
  flex-wrap: nowrap;
}

.filter-group :deep(.el-cascader__tags .el-tag) {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.character-cascader-popper .el-cascader-node {
  padding: 0 16px 0 12px;
}

/* ===== 分页栏 ===== */
.pagination-bar {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
</style>
