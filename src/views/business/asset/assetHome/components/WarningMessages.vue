<template>
  <el-card class="warning-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-icon color="#E6A23C"><Warning /></el-icon>
        <span>预警消息</span>
      </div>
    </template>
    <div class="warning-list">
      <div v-for="warning in warningMessages" :key="warning.id" class="warning-item">
        <el-tag 
          :type="getTagType(warning.level)" 
          size="small"
        >
          {{ warning.level }}
        </el-tag>
        <span class="warning-text">{{ warning.message }}</span>
        <span class="warning-time">{{ warning.time }}</span>
        <el-button 
          :type="warning.type === '1' ? 'primary' : 'success'" 
          size="small" 
          @click="handleAction(warning)"
        >
          {{ warning.type === '1' ? '续期' : '续签' }}
        </el-button>
      </div>
    </div>
  </el-card>

  <!-- 续期弹窗 -->
  <RenewalDialog
    v-model:visible="renewalDialogVisible"
    :data="currentRenewalData"
    @confirm="handleRenewalConfirm"
  />

  <!-- 续签弹窗 -->
  <ContractRenewalDialog
    v-model:visible="contractRenewalDialogVisible"
    :data="currentContractRenewalData"
    @confirm="handleContractRenewalConfirm"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import RenewalDialog from './RenewalDialog.vue'
import ContractRenewalDialog from './ContractRenewalDialog.vue'

// 预警消息  type: 1表示续期  2表示续签
const warningMessages = ref([
  {
    id: 1,
    level: '高',
    type: '1',
    message: '岱宝山路9号产权证即将到期，需要及时续期',
    time: '2025-08-09',
  },
  {
    id: 2,
    level: '中',
    type: '2',
    message: '环城西路6号店面租金即将到期，需要续签合同',
    time: '2025-09-10',
  },
  {
    id: 3,
    level: '低',
    type: '1',
    message: '民昇佳苑21号楼资产评估即将到期，建议续期',
    time: '2025-10-15',
  }
])

// 续期弹窗相关数据
const renewalDialogVisible = ref(false)
const currentRenewalData = ref({})

// 续签弹窗相关数据
const contractRenewalDialogVisible = ref(false)
const currentContractRenewalData = ref({})

// 根据level获取标签类型
const getTagType = (level) => {
  switch (level) {
    case '高':
      return 'danger'
    case '中':
      return 'warning'
    default:
      return 'info'
  }
}

// 处理操作按钮点击事件
const handleAction = (warning) => {
  if (warning.type === '1') {
    // 续期操作，打开续期弹窗
    currentRenewalData.value = warning
    renewalDialogVisible.value = true
  } else {
    // 续签操作，打开续签弹窗
    currentContractRenewalData.value = warning
    contractRenewalDialogVisible.value = true
  }
}

// 处理续期确认
const handleRenewalConfirm = (renewalData) => {
  console.log('续期数据:', renewalData)
  ElMessage.success('续期申请已提交！')
  // TODO: 这里可以调用后端接口保存续期信息
}

// 处理续签确认
const handleContractRenewalConfirm = (contractRenewalData) => {
  console.log('续签数据:', contractRenewalData)
  ElMessage.success('续签申请已提交！')
  // TODO: 这里可以调用后端接口保存续签信息
}
</script>

<style scoped>
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
</style>
