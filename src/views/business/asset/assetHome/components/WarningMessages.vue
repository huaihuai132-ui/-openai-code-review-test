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
        <el-tag :type="warning.type" size="small">{{ warning.level }}</el-tag>
        <span class="warning-text">{{ warning.message }}</span>
        <span class="warning-time">{{ warning.time }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { Warning } from '@element-plus/icons-vue'

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
