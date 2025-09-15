<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    title="资产详细信息" 
    width="80%" 
    :before-close="handleClose"
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="资产名称">
        <span>{{ data.assetName }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="区域">
        <el-tag size="small">{{ data.areaName }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="街道">
        <el-tag size="small" type="info">{{ data.streetName }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="详细地址">
        <span>{{ data.address }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="移交单位">
        <span>{{ data.transferUnit }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="原产权单位">
        <span>{{ data.originalOwnershipUnit }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="房产面积">
        <span>{{ data.buildingArea }}㎡</span>
      </el-descriptions-item>
      <el-descriptions-item label="土地面积">
        <span>{{ data.landArea }}㎡</span>
      </el-descriptions-item>
      <el-descriptions-item label="产权证号">
        <span>{{ data.propertyNumber }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="是否办证过户">
        <el-tag :type="data.isTransferred ? 'success' : 'warning'">
          {{ data.isTransferred ? '已过户' : '未过户' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="使用情况">
        <span>{{ data.usage }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="出租方式">
        <span>{{ data.rentalMethod || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="租金">
        <span style="color: #E6A23C; font-weight: bold;">¥{{ data.rent?.toLocaleString() }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="价值">
        <span style="color: #67C23A; font-weight: bold;">{{ data.value }}万元</span>
      </el-descriptions-item>
      <el-descriptions-item label="资产评估时间">
        <span>{{ data.assessmentDate || '未评估' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="办证过程中遇到的问题" :span="2">
        <span>{{ data.transferIssues || '无' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="划拨文件" :span="2">
        <el-button 
          v-if="data.allocationFile" 
          type="primary" 
          size="small" 
          @click="handleViewFile"
        >
          查看文件
        </el-button>
        <span v-else>未上传</span>
      </el-descriptions-item>
    </el-descriptions>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'

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

const emit = defineEmits(['update:visible', 'edit', 'view-file'])

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}

// 编辑按钮处理
const handleEdit = () => {
  emit('edit', props.data)
}

// 查看文件处理
const handleViewFile = () => {
  emit('view-file', props.data)
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
