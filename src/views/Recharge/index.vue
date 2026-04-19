<template>
  <div class="recharge-page">
    <div class="echoes-balance">
      <el-icon size="28"><Coin /></el-icon>
      <span class="echoes-label">当前回声</span>
      <span class="echoes-value">{{ store.echoes }}</span>
    </div>

    <h2 class="page-title">回声充值</h2>
    <p class="page-desc">每个档位首次充值享受首充赠礼，双倍回声回馈</p>

    <div class="tier-grid">
      <div
        v-for="tier in RECHARGE_TIERS"
        :key="tier.amount"
        class="tier-card"
        :class="{ first: store.tierCounts[tier.amount] === 0 }"
      >
        <div class="tier-header">
          <span class="tier-amount">¥{{ tier.amount }}</span>
          <el-tag v-if="store.tierCounts[tier.amount] === 0" type="danger" size="small">首充</el-tag>
          <el-tag v-else type="info" size="small">已充 {{ store.tierCounts[tier.amount] }} 次</el-tag>
        </div>

        <div class="tier-body">
          <div class="echoes-line">
            <span class="echoes-base">{{ tier.base }}</span>
            <span v-if="tier.bonus > 0" class="echoes-bonus">+{{ store.tierCounts[tier.amount] === 0 ? tier.firstBonus : tier.bonus }}</span>
            <span v-else-if="store.tierCounts[tier.amount] === 0" class="echoes-bonus">+{{ tier.firstBonus }}</span>
          </div>
          <div class="echoes-total">
            = {{ tier.base + (store.tierCounts[tier.amount] === 0 ? tier.firstBonus : tier.bonus) }} 回声
          </div>
        </div>

        <el-button
          type="primary"
          size="large"
          class="recharge-btn"
          @click="store.recharge(tier.amount)"
        >
          充值
        </el-button>
      </div>
    </div>

    <div class="records-section">
      <h3>
        充值记录
        <span class="record-count">（{{ store.rechargeRecords.length }} 条）</span>
      </h3>

      <div v-if="store.rechargeRecords.length === 0" class="empty-tip">暂无充值记录</div>

      <div v-else class="record-list">
        <div
          v-for="record in visibleRecords"
          :key="record.id"
          class="record-card"
          :class="{ first: record.isFirst }"
        >
          <div class="record-main">
            <div class="record-left">
              <span class="record-amount">¥{{ record.amount }}</span>
              <el-tag :type="record.isFirst ? 'danger' : 'info'" size="small" effect="dark">
                {{ record.isFirst ? '首充双倍' : '常规充值' }}
              </el-tag>
            </div>
            <div class="record-right">
              <span class="record-echoes">+{{ record.echoesReceived }}</span>
              <span class="record-time">{{ store.formatDate(record.timestamp) }}</span>
            </div>
          </div>
          <div v-if="record.isFirst" class="record-bar">
            <div class="record-bar-fill" style="width: 100%"></div>
          </div>
        </div>
      </div>

      <div v-if="store.rechargeRecords.length > COLLAPSE_LIMIT" class="expand-bar">
        <el-button text @click="isExpanded = !isExpanded">
          {{ isExpanded ? '收起记录' : `展开全部 (${store.rechargeRecords.length} 条)` }}
          <el-icon>
            <ArrowUp v-if="isExpanded" />
            <ArrowDown v-else />
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore, RECHARGE_TIERS } from '../../stores/app'
import { Coin, ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const store = useAppStore()
const isExpanded = ref(false)
const COLLAPSE_LIMIT = 2

const visibleRecords = computed(() => {
  if (isExpanded.value) return store.rechargeRecords
  return store.rechargeRecords.slice(0, COLLAPSE_LIMIT)
})
</script>

<style scoped>
.recharge-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.echoes-balance {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #2a2018, #3d2e20);
  border: 1px solid #c9a227;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  color: #c9a227;
}

.echoes-label {
  font-size: 14px;
  color: #a89b8c;
}

.echoes-value {
  font-size: 28px;
  font-weight: bold;
  margin-left: 4px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 8px;
}

.page-desc {
  color: #a89b8c;
  margin-bottom: 24px;
}

.tier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.tier-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.2s;
}

.tier-card:hover {
  border-color: #c9a227;
  transform: translateY(-2px);
}

.tier-card.first {
  border-color: #8a2c2c;
  background: linear-gradient(135deg, #241e18, #2a1818);
}

.tier-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tier-amount {
  font-size: 22px;
  font-weight: bold;
  color: #e8dcc8;
}

.tier-body {
  margin-bottom: 16px;
}

.echoes-line {
  font-size: 18px;
  margin-bottom: 4px;
}

.echoes-base {
  color: #e8dcc8;
}

.echoes-bonus {
  color: #ff4d4f;
  font-weight: bold;
}

.echoes-total {
  font-size: 14px;
  color: #c9a227;
}

.recharge-btn {
  width: 100%;
}

.records-section h3 {
  margin-bottom: 16px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-count {
  font-size: 14px;
  color: #a89b8c;
  font-weight: normal;
}

.empty-tip {
  color: #a89b8c;
  padding: 32px;
  text-align: center;
  background: var(--bg-card);
  border-radius: 12px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  transition: all 0.2s;
  overflow: hidden;
}

.record-card:hover {
  border-color: #c9a227;
  transform: translateX(4px);
}

.record-card.first {
  border-color: #8a2c2c;
  background: linear-gradient(135deg, #241e18, #2a1818);
}

.record-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-amount {
  font-size: 20px;
  font-weight: bold;
  color: #e8dcc8;
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.record-echoes {
  font-size: 18px;
  font-weight: bold;
  color: #c9a227;
}

.record-time {
  font-size: 12px;
  color: #a89b8c;
}

.record-bar {
  margin-top: 10px;
  height: 3px;
  background: #3d342b;
  border-radius: 2px;
  overflow: hidden;
}

.record-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9a227, #ffd700);
  border-radius: 2px;
  animation: barShine 2s ease-in-out infinite;
}

@keyframes barShine {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.expand-bar {
  text-align: center;
  margin-top: 12px;
}
</style>
