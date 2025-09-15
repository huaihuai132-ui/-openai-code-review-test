<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    title="租赁资产详细信息" 
    width="80%" 
    :before-close="handleClose"
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="承租户">
        <el-tag size="small" type="primary">{{ data.tenant || '-' }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="联系电话">
        <span>{{ data.phoneNumber || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="资产ID">
        <span>{{ data.assetId || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="记录ID">
        <span>{{ data.id || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="资产名称" :span="2">
        <span>{{ data.assetName || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="资产地址" :span="2">
        <span>{{ data.address || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="外部资产名称" :span="2">
        <span>{{ data.externalAssetName || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="经营用途">
        <el-tag size="small" type="info">{{ data.businessPurpose || '-' }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="押金">
        <span style="color: #E6A23C; font-weight: bold;">{{ data.deposit ? `¥${data.deposit.toLocaleString()}` : '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="年租金">
        <span style="color: #67C23A; font-weight: bold;">{{ data.annualRent ? `¥${data.annualRent.toLocaleString()}` : '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="收租截止期限">
        <span>{{ data.rentEndDate || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="合同期限" :span="2">
        <span>{{ data.contractPeriod || '-' }}</span>
      </el-descriptions-item>
    </el-descriptions>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
        <el-button type="success" @click="handleLocate">
          <el-icon><Location /></el-icon>
          地图定位
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { Location } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'edit', 'locate'])

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}

// 编辑按钮处理
const handleEdit = () => {
  emit('edit', props.data)
}

// 地图定位处理
const handleLocate = () => {
  emit('locate', props.data)
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}

/* 描述列表样式优化 */
:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
  width: 120px;
}

:deep(.el-descriptions__content) {
  color: #303133;
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
}

/* 按钮样式 */
:deep(.el-button--small) {
  padding: 5px 11px;
  font-size: 12px;
  border-radius: 3px;
}
</style>
