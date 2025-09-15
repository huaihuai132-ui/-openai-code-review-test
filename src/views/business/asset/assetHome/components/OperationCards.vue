<template>
  <el-row :gutter="20">
    <!-- 运营数据卡片 -->
    <el-col :span="6" v-for="(item, index) in operationData" :key="index">
      <el-card class="operation-card" shadow="hover">
        <div class="card-content">
          <div class="card-icon" :style="{ backgroundColor: item.color }">
            <el-icon size="24" color="#fff">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="card-info">
            <div class="card-value">{{ item.value }}</div>
            <div class="card-label">{{ item.label }}</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { House, Money, User } from '@element-plus/icons-vue'

// 运营数据
const operationData = ref([
  {
    label: '资产总数',
    value: 12,
    icon: 'House',
    color: '#409EFF',
  },
  {
    label: '资产总价值',
    value: '1,890万元',
    icon: 'Money',
    color: '#67C23A',
  },
  {
    label: '资产出租数',
    value: 12,
    icon: 'User',
    color: '#E6A23C',
  },
  {
    label: '今年资金收入',
    value: '5,184万元',
    icon: 'Money',
    color: '#F56C6C',
  },
])

// 页面加载时更新数据
onMounted(() => {
  // 监听地图组件的资产数据更新事件
  window.addEventListener('assetDataUpdated', handleAssetDataUpdate)
})

// 页面卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('assetDataUpdated', handleAssetDataUpdate)
})

// 处理资产数据更新事件
const handleAssetDataUpdate = (event) => {
  const { data } = event.detail
  // 更新运营数据
  updateOperationDataFromAssets(data)
}

// 从资产数据更新运营数据
const updateOperationDataFromAssets = (assets) => {
  // 资产总数
  operationData.value[0].value = assets.length

  // 资产总价值（万元）
  const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0)
  operationData.value[1].value = `${totalValue}万元`

  // 资产出租数
  const rentedCount = assets.filter((asset) => asset.usage === '出租').length
  operationData.value[2].value = rentedCount

  // 今年资金收入（万元）- 这里需要从租赁信息计算，暂时使用估算值
  const totalAnnualRent = (assets.reduce((sum, asset) => sum + (asset.rent || 0), 0) * 12) / 10000
  operationData.value[3].value = `${totalAnnualRent.toFixed(0)}万元`
}
</script>

<style scoped>
/* 运营数据卡片样式 */
.operation-card {
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .el-col {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .card-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .card-icon {
    width: 50px;
    height: 50px;
  }

  .card-value {
    font-size: 20px;
  }
}
</style>
