<template>
  <div class="container" v-if="character">
    <div class="breadcrumb">
      <router-link to="/characters">&larr; 返回角色图鉴</router-link>
    </div>

    <div class="profile">
      <img :src="character.avatar" :alt="character.name" class="big-avatar" />
      <div class="profile-info">
        <h1 class="name">{{ character.name }}</h1>
        <div class="en-name">{{ character.englishName }}</div>
        <div class="tags-row">
          <span class="badge camp" :class="character.camp">{{ campText }}</span>
          <span class="badge role">{{ character.role }}</span>
          <span class="badge diff" v-if="character.difficulty > 0">难度 {{ character.difficulty }}</span>
        </div>
        <div class="release">上线日期：{{ character.releaseDate }}</div>
      </div>
    </div>

    <div class="detail-tabs">
      <button
        v-for="t in availableTabs"
        :key="t.key"
        :class="['tab', { active: activeTab === t.key }]"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="detail-content">
      <!-- 档案 -->
      <section v-if="activeTab === 'profile'">
        <div v-if="character.profile">
          <h2>角色档案</h2>
          <div class="profile-grid">
            <div class="profile-item" v-if="character.profile.birthday">
              <div class="profile-label">生日</div>
              <div class="profile-value">{{ character.profile.birthday }}</div>
            </div>
            <div class="profile-item" v-if="character.profile.age">
              <div class="profile-label">年龄</div>
              <div class="profile-value">{{ character.profile.age }} 岁</div>
            </div>
            <div class="profile-item" v-if="character.profile.specialty?.length">
              <div class="profile-label">擅长</div>
              <div class="profile-value">{{ character.profile.specialty.join('、') }}</div>
            </div>
            <div class="profile-item" v-if="character.profile.interest">
              <div class="profile-label">兴趣</div>
              <div class="profile-value">{{ character.profile.interest }}</div>
            </div>
            <div class="profile-item" v-if="character.profile.likes">
              <div class="profile-label">喜欢</div>
              <div class="profile-value">{{ character.profile.likes }}</div>
            </div>
            <div class="profile-item" v-if="character.profile.dislikes">
              <div class="profile-label">厌恶</div>
              <div class="profile-value">{{ character.profile.dislikes }}</div>
            </div>
            <div class="profile-item" v-if="character.profile.traits?.length">
              <div class="profile-label">特质</div>
              <div class="profile-value">{{ character.profile.traits.join('、') }}</div>
            </div>
            <div class="profile-item" v-if="character.profile.dishes?.length">
              <div class="profile-label">菜品</div>
              <div class="profile-value">{{ character.profile.dishes.join('、') }}</div>
            </div>
            <div class="profile-item" v-if="character.profile.roleNumber">
              <div class="profile-label">角色顺序</div>
              <div class="profile-value">{{ character.profile.roleNumber }}</div>
            </div>
            <div class="profile-item" v-if="character.profile.campNumber">
              <div class="profile-label">阵营顺序</div>
              <div class="profile-value">{{ character.profile.campNumber }}</div>
            </div>
            <div class="profile-item" v-if="character.profile.vaCN">
              <div class="profile-label">中文配音</div>
              <div class="profile-value">{{ character.profile.vaCN }}</div>
            </div>
            <div class="profile-item" v-if="character.profile.vaJP">
              <div class="profile-label">日文配音</div>
              <div class="profile-value">{{ character.profile.vaJP }}</div>
            </div>
            <div class="profile-item" v-if="character.talents?.length">
              <div class="profile-label">推荐天赋</div>
              <div class="profile-value">{{ character.talents.join('、') }}</div>
            </div>
            <div class="profile-item" v-if="character.tags?.length">
              <div class="profile-label">角色标签</div>
              <div class="profile-value">{{ character.tags.join('、') }}</div>
            </div>
          </div>

          <div v-if="character.relationships && character.relationships.length" class="relation-section">
            <h3>关系网</h3>
            <div class="relation-list">
              <div v-for="(r, idx) in character.relationships" :key="idx" class="relation-row">
                <span class="relation-name">{{ r.name }}</span>
                <span class="relation-badge">{{ r.relation }}</span>
                <span v-if="r.note" class="relation-note">{{ r.note }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="character.abilities?.length" class="ability-section">
          <h2>外在特质 / 技能</h2>
          <div class="ability-list">
            <CollapsiblePanel
              v-for="(ab, idx) in character.abilities"
              :key="idx"
              :title="ab.name"
              :default-expanded="true"
              class="ability-panel"
            >
              {{ ab.desc }}
            </CollapsiblePanel>
          </div>
        </div>
      </section>

      <!-- 背景 -->
      <section v-if="activeTab === 'background'">
        <h2>背景故事</h2>
        <p class="story-text">{{ character.background }}</p>

        <div v-if="character.stories && character.stories.length" class="story-list">
          <div class="story-columns">
            <div v-if="deductions.length" class="story-col">
              <h3>推演</h3>
              <CollapsiblePanel
                v-for="(story, idx) in deductions"
                :key="idx"
                :title="story.title"
                :default-expanded="true"
                class="story-panel"
              >
                {{ story.content }}
              </CollapsiblePanel>
            </div>
            <div v-if="letters.length" class="story-col">
              <h3>信件与档案</h3>
              <CollapsiblePanel
                v-for="(story, idx) in letters"
                :key="idx"
                :title="story.title"
                :default-expanded="true"
                class="story-panel"
              >
                {{ story.content }}
              </CollapsiblePanel>
            </div>
          </div>
        </div>
      </section>

      <!-- 时装 -->
      <section v-if="activeTab === 'skins'">
        <div v-if="character.skins && character.skins.length">
          <div class="table-toolbar">
            <div class="filter-group">
              <span class="filter-label">筛选品质：</span>
              <button
                v-for="r in skinRarities"
                :key="r"
                :class="['filter-chip', { active: skinFilter === r }]"
                @click="skinFilter = skinFilter === r ? 'all' : r"
              >
                {{ r }}
              </button>
              <button class="filter-chip" :class="{ active: skinFilter === 'all' }" @click="skinFilter = 'all'">全部</button>
            </div>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="sortable" @click="toggleSkinSort('name')">名称 {{ sortArrow(skinSort, 'name') }}</th>
                  <th class="sortable" @click="toggleSkinSort('rarity')">品质 {{ sortArrow(skinSort, 'rarity') }}</th>
                  <th class="sortable" @click="toggleSkinSort('obtain')">获取方式 {{ sortArrow(skinSort, 'obtain') }}</th>
                  <th class="sortable" @click="toggleSkinSort('price')">价格 {{ sortArrow(skinSort, 'price') }}</th>
                  <th>描述</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in sortedSkins" :key="idx">
                  <td class="cell-name">{{ s.name }}</td>
                  <td><span class="rarity-badge" :class="rarityClass(s.rarity)">{{ s.rarity }}</span></td>
                  <td>{{ s.obtain }}</td>
                  <td>{{ s.price }}</td>
                  <td>{{ s.description }}</td>
                  <td>{{ s.note }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-else class="empty-tip">暂无时装数据。</p>
      </section>

      <!-- 随身物品 -->
      <section v-if="activeTab === 'accessories'">
        <div v-if="character.accessories && character.accessories.length">
          <div class="table-toolbar">
            <div class="filter-group">
              <span class="filter-label">筛选品质：</span>
              <button
                v-for="r in accessoryRarities"
                :key="r"
                :class="['filter-chip', { active: accessoryFilter === r }]"
                @click="accessoryFilter = accessoryFilter === r ? 'all' : r"
              >
                {{ r }}
              </button>
              <button class="filter-chip" :class="{ active: accessoryFilter === 'all' }" @click="accessoryFilter = 'all'">全部</button>
            </div>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="sortable" @click="toggleAccessorySort('name')">名称 {{ sortArrow(accessorySort, 'name') }}</th>
                  <th class="sortable" @click="toggleAccessorySort('rarity')">品质 {{ sortArrow(accessorySort, 'rarity') }}</th>
                  <th class="sortable" @click="toggleAccessorySort('obtain')">获取方式 {{ sortArrow(accessorySort, 'obtain') }}</th>
                  <th class="sortable" @click="toggleAccessorySort('price')">价格 {{ sortArrow(accessorySort, 'price') }}</th>
                  <th>描述</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(a, idx) in sortedAccessories" :key="idx">
                  <td class="cell-name">{{ a.name }}</td>
                  <td><span class="rarity-badge" :class="rarityClass(a.rarity)">{{ a.rarity }}</span></td>
                  <td>{{ a.obtain }}</td>
                  <td>{{ a.price }}</td>
                  <td>{{ a.description }}</td>
                  <td>{{ a.note }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-else class="empty-tip">暂无随身物品数据。</p>
      </section>

      <!-- 关联分析 -->
      <section v-if="activeTab === 'analyses'">
        <h2>关联剧情分析</h2>
        <div v-if="relatedAnalyses.length" class="analysis-links">
          <router-link
            v-for="a in relatedAnalyses"
            :key="a.id"
            :to="`/analyses/${a.id}`"
            class="analysis-item"
          >
            <div class="analysis-title">{{ a.title }}</div>
            <div class="analysis-category">{{ a.category }}</div>
          </router-link>
        </div>
        <p v-else class="empty-tip">暂无关联的剧情分析文章。</p>
      </section>
    </div>
  </div>

  <div class="container" v-else>
    <p>角色不存在</p>
    <router-link to="/characters">返回列表</router-link>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { characters } from '../../data/characters/index.js'
import analyses from '../../data/analyses.json'
import CollapsiblePanel from '../../components/CollapsiblePanel.vue'

const props = defineProps({
  id: { type: String, required: true },
})

const character = computed(() => characters.find((c) => c.id === props.id))
const campText = computed(() => {
  const map = { survivor: '求生者', hunter: '监管者', npc: 'NPC' }
  return map[character.value?.camp] || '其他'
})

const deductions = computed(() => {
  return character.value?.stories?.filter((s) => s.title.includes('推演') || s.title.includes('传闻')) || []
})

const letters = computed(() => {
  return character.value?.stories?.filter((s) => !s.title.includes('推演') && !s.title.includes('传闻')) || []
})

const relatedAnalyses = computed(() => {
  if (!character.value) return []
  return analyses.filter((a) => a.relatedCharacters.includes(character.value.id))
})

const baseTabs = [
  { key: 'profile', label: '角色档案' },
  { key: 'background', label: '背景与剧情' },
  { key: 'skins', label: '时装' },
  { key: 'accessories', label: '随身物品' },
  { key: 'analyses', label: '关联分析' },
]

function rarityClass(rarity) {
  const map = {
    '虚妄杰作': 'rarity-splus',
    '稀世': 'rarity-s',
    'legendary': 'rarity-s',
    '奇珍': 'rarity-a',
    'epic': 'rarity-a',
    '独特': 'rarity-b',
    'unique': 'rarity-b',
    '罕见': 'rarity-c',
    'rare': 'rarity-c',
  }
  return map[rarity] || 'rarity-default'
}

const availableTabs = computed(() => {
  return baseTabs.filter((t) => {
    if (t.key === 'profile') {
      return !!character.value?.profile || character.value?.abilities?.length > 0 || character.value?.talents?.length > 0 || character.value?.tags?.length > 0
    }
    if (t.key === 'skins') return character.value?.skins?.length > 0
    if (t.key === 'accessories') return character.value?.accessories?.length > 0
    return true
  })
})

const activeTab = ref('background')

watch(
  character,
  (newChar) => {
    if (newChar?.profile) {
      activeTab.value = 'profile'
    } else {
      activeTab.value = 'background'
    }
  },
  { immediate: true }
)

// Sorting / Filtering for skins
const skinFilter = ref('all')
const skinSort = ref({ key: '', order: 'asc' })
const skinRarities = computed(() => [...new Set(character.value?.skins?.map((s) => s.rarity).filter(Boolean))])

function toggleSkinSort(key) {
  if (skinSort.value.key === key) {
    skinSort.value.order = skinSort.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    skinSort.value = { key, order: 'asc' }
  }
}

const sortedSkins = computed(() => {
  let list = character.value?.skins || []
  if (skinFilter.value !== 'all') {
    list = list.filter((s) => s.rarity === skinFilter.value)
  }
  if (skinSort.value.key) {
    const { key, order } = skinSort.value
    list = [...list].sort((a, b) => {
      const va = (a[key] || '').toString()
      const vb = (b[key] || '').toString()
      if (va < vb) return order === 'asc' ? -1 : 1
      if (va > vb) return order === 'asc' ? 1 : -1
      return 0
    })
  }
  return list
})

// Sorting / Filtering for accessories
const accessoryFilter = ref('all')
const accessorySort = ref({ key: '', order: 'asc' })
const accessoryRarities = computed(() => [...new Set(character.value?.accessories?.map((a) => a.rarity).filter(Boolean))])

function toggleAccessorySort(key) {
  if (accessorySort.value.key === key) {
    accessorySort.value.order = accessorySort.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    accessorySort.value = { key, order: 'asc' }
  }
}

const sortedAccessories = computed(() => {
  let list = character.value?.accessories || []
  if (accessoryFilter.value !== 'all') {
    list = list.filter((a) => a.rarity === accessoryFilter.value)
  }
  if (accessorySort.value.key) {
    const { key, order } = accessorySort.value
    list = [...list].sort((a, b) => {
      const va = (a[key] || '').toString()
      const vb = (b[key] || '').toString()
      if (va < vb) return order === 'asc' ? -1 : 1
      if (va > vb) return order === 'asc' ? 1 : -1
      return 0
    })
  }
  return list
})

function sortArrow(sortState, key) {
  if (sortState.key !== key) return ''
  return sortState.order === 'asc' ? '▲' : '▼'
}
</script>

<style scoped>
.breadcrumb {
  margin-bottom: 16px;
}

.breadcrumb a {
  color: var(--text-muted);
  font-size: 14px;
}

.profile {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
}

.big-avatar {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  background: #1a1510;
}

.profile-info {
  flex: 1;
}

.name {
  font-size: 28px;
  color: var(--accent-gold);
  margin-bottom: 4px;
}

.en-name {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.tags-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
}

.badge.camp.survivor {
  background: #2c4a2c;
  color: #a8d5a2;
}

.badge.camp.hunter {
  background: #4a2c2c;
  color: #d5a2a2;
}

.badge.camp.npc {
  background: #3a3a4a;
  color: #c5c5d5;
}

.badge.role {
  background: #3a3228;
  color: var(--text-main);
}

.badge.diff {
  background: #2a2a2a;
  color: var(--text-muted);
}

.release {
  font-size: 13px;
  color: var(--text-muted);
}

.detail-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.tab {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 8px 14px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.tab:hover {
  background: var(--bg-hover);
}

.tab.active {
  background: var(--accent-gold);
  color: #1a1510;
  font-weight: bold;
}

.detail-content section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
}

.detail-content h2 {
  font-size: 18px;
  color: var(--accent-gold);
  margin-bottom: 12px;
}

.story-text {
  color: var(--text-muted);
  line-height: 1.8;
}

.story-list {
  margin-top: 20px;
}

.story-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.story-col h3 {
  font-size: 16px;
  color: var(--text-main);
  margin-bottom: 12px;
}

.story-panel {
  margin-bottom: 10px;
}

@media (max-width: 800px) {
  .story-columns {
    grid-template-columns: 1fr;
  }
}

.ability-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ability-panel {
  margin-bottom: 10px;
}

.ability-item {
  padding: 12px;
  background: #1a1510;
  border-radius: 8px;
}

.ability-name {
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 4px;
}

.ability-desc {
  color: var(--text-muted);
  font-size: 14px;
}

.talent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.talent-tag {
  padding: 6px 12px;
  background: #1a1510;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-main);
}

.empty-tip {
  color: var(--text-muted);
  font-size: 14px;
}

.analysis-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.analysis-item {
  display: block;
  padding: 12px;
  background: #1a1510;
  border-radius: 8px;
  transition: background 0.2s;
}

.analysis-item:hover {
  background: #2a231c;
  text-decoration: none;
}

.analysis-title {
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 4px;
}

.analysis-category {
  font-size: 13px;
  color: var(--text-muted);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.profile-item {
  background: #1a1510;
  padding: 12px;
  border-radius: 8px;
}

.profile-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.profile-value {
  font-size: 14px;
  color: var(--text-main);
}

.ability-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.ability-section h2 {
  font-size: 16px;
  margin-bottom: 10px;
}

.relation-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.relation-section h3 {
  font-size: 16px;
  color: var(--text-main);
  margin-bottom: 12px;
}

.relation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.relation-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: #1a1510;
  border-radius: 8px;
}

.relation-name {
  font-weight: bold;
  color: var(--text-main);
}

.relation-badge {
  padding: 2px 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  font-size: 12px;
  color: var(--accent-gold);
}

.relation-note {
  font-size: 13px;
  color: var(--text-muted);
}

.table-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.filter-label {
  font-size: 13px;
  color: var(--text-muted);
}

.filter-chip {
  padding: 4px 10px;
  font-size: 13px;
  border: 1px solid var(--border);
  background: #1a1510;
  color: var(--text-muted);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  background: #231d17;
}

.filter-chip.active {
  background: var(--accent-gold);
  color: #1a1510;
  border-color: var(--accent-gold);
  font-weight: bold;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-bottom: 8px;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.data-table th {
  color: var(--accent-gold);
  background: #1a1510;
  font-weight: bold;
  white-space: nowrap;
}

.data-table td {
  color: var(--text-muted);
  vertical-align: top;
}

.data-table .sortable {
  cursor: pointer;
  user-select: none;
}

.data-table .sortable:hover {
  background: #231d17;
}

.cell-name {
  color: var(--text-main);
  font-weight: 500;
  white-space: nowrap;
}

.rarity-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
}

.rarity-splus {
  background: #5a2c4a;
  color: #f5c5e5;
}

.rarity-s {
  background: #4a3a1c;
  color: #f5d5a2;
}

.rarity-a {
  background: #2c3a5a;
  color: #a2c5f5;
}

.rarity-b {
  background: #3a2c5a;
  color: #d5a2f5;
}

.rarity-c {
  background: #2c4a3a;
  color: #a2f5c5;
}

.rarity-default {
  background: #3a3a3a;
  color: #c5c5c5;
}
</style>
