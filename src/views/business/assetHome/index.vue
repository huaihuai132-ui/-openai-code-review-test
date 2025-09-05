<template>
  <div class="home">
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

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 预警消息 -->
      <el-col :span="12">
        <el-card class="warning-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon color="#E6A23C"><Warning /></el-icon>
              <span>预警消息</span>
            </div>
          </template>
          <div class="warning-list">
            <div v-for="warning in warningMessages" :key="warning.id" class="warning-item">
              <el-tag :type="warning.type" size="small">{{ warning.level }}</el-tag>
              <span class="warning-text">{{ warning.message }}</span>
              <span class="warning-time">{{ warning.time }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 出租公示情况 -->
      <el-col :span="12">
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
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { House, Money, Warning, User } from '@element-plus/icons-vue'

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

// 预警消息
const warningMessages = ref([
  {
    id: 1,
    level: '高',
    type: 'danger',
    message: '岱宝山路9号产权证即将到期，需要及时续期',
    time: '2小时前',
  },
  {
    id: 2,
    level: '中',
    type: 'warning',
    message: '环城西路6号店面租金即将到期，需要续签合同',
    time: '1天前',
  },
  {
    id: 3,
    level: '低',
    type: 'info',
    message: '民昇佳苑21号楼产权证办理进度正常',
    time: '3天前',
  },
])

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

// 页面加载时更新数据
onMounted(() => {
  // 这里可以从地图组件或其他数据源获取最新数据
  // updateOperationData()

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
.home {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

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

/* 预警消息卡片样式 */
.warning-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #303133;
}

.warning-list {
  max-height: 300px;
  overflow-y: auto;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.warning-item:last-child {
  border-bottom: none;
}

.warning-text {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.warning-time {
  font-size: 12px;
  color: #909399;
}

/* 出租公示情况卡片样式 */
.rental-card {
  height: 100%;
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .el-col {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .home {
    padding: 16px;
  }

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
