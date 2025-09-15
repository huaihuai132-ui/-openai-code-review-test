<template>
  <el-card class="rental-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-icon color="#67C23A"><House /></el-icon>
        <span>出租公示情况</span>
      </div>
    </template>
    <div class="rental-list">
      <div v-for="rental in rentalPublicity" :key="rental.id" class="rental-item">
        <div class="rental-info">
          <div class="rental-name">{{ rental.assetName }}</div>
          <div class="rental-details">
            <span>租金：¥{{ rental.rent.toLocaleString() }}/月</span>
            <span>状态：{{ rental.status }}</span>
          </div>
        </div>
        <el-tag :type="rental.status === '已出租' ? 'success' : 'warning'" size="small">
          {{ rental.status }}
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { House } from '@element-plus/icons-vue'

// 出租公示情况
const rentalPublicity = ref([
  {
    id: 1,
    assetName: '林荫东路南侧C栋9号',
    rent: 32000,
    status: '已出租',
  },
  {
    id: 2,
    assetName: '林荫东路南侧C栋8号',
    rent: 32000,
    status: '已出租',
  },
  {
    id: 3,
    assetName: '民昇佳苑21号楼-02＃、01022#、01023#店面',
    rent: 36000,
    status: '已出租',
  },
  {
    id: 4,
    assetName: '环城西路6号-2#店面',
    rent: 60000,
    status: '已出租',
  },
  {
    id: 5,
    assetName: '岱宝山路9号（1-4层）',
    rent: 60000,
    status: '已出租',
  },
])
</script>

<style scoped>
/* 出租公示情况卡片样式 */
.rental-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #303133;
}

.rental-list {
  max-height: 300px;
  overflow-y: auto;
}

.rental-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.rental-item:last-child {
  border-bottom: none;
}

.rental-info {
  flex: 1;
}

.rental-name {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.rental-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #606266;
}
</style>
