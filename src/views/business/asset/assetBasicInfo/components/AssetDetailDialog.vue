<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    title="资产详细信息" 
    width="80%" 
    class="asset-detail-dialog"
    :before-close="handleClose"
  >
    <div class="process-form-container">
      <el-form
        :model="formData"
        label-width="120px"
        :disabled="true"
      >
        <!-- 基本信息部分 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-row">
            <el-form-item label="资产名称">
              <el-input v-model="formData.assetName" readonly />
            </el-form-item>
            <el-form-item label="区域">
              <el-input v-model="formData.areaName" readonly />
            </el-form-item>
            <el-form-item label="街道">
              <el-input v-model="formData.streetName" readonly />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="详细地址">
              <el-input v-model="formData.address" readonly />
            </el-form-item>
            <el-form-item label="移交单位">
              <el-input v-model="formData.transferUnit" readonly />
            </el-form-item>
            <el-form-item label="原产权单位">
              <el-input v-model="formData.originalOwnershipUnit" readonly />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="房产面积">
              <el-input v-model="formData.buildingAreaDisplay" readonly>
                <template #append>㎡</template>
              </el-input>
            </el-form-item>
            <el-form-item label="土地面积">
              <el-input v-model="formData.landAreaDisplay" readonly>
                <template #append>㎡</template>
              </el-input>
            </el-form-item>
            <el-form-item label="产权证号">
              <el-input v-model="formData.propertyNumber" readonly />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="是否办证过户">
              <el-input v-model="formData.isTransferredDisplay" readonly />
            </el-form-item>
            <el-form-item label="使用情况">
              <el-input v-model="formData.usage" readonly />
            </el-form-item>
            <el-form-item label="出租方式">
              <el-input v-model="formData.rentalMethod" readonly />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="租金">
              <el-input v-model="formData.rentDisplay" readonly>
                <template #append>元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="价值">
              <el-input v-model="formData.valueDisplay" readonly>
                <template #append>万元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="资产评估时间">
              <el-input v-model="formData.assessmentDateDisplay" readonly />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="办证过程中遇到的问题" style="flex: 2;">
              <el-input 
                v-model="formData.transferIssues" 
                type="textarea" 
                :rows="2"
                readonly 
              />
            </el-form-item>
            <el-form-item label="划拨文件">
              <el-input v-model="formData.allocationFileDisplay" readonly />
            </el-form-item>
          </div>
        </div>

        <!-- Tab组件部分 -->
        <div class="form-section">
          <el-tabs v-model="activeTab" class="form-tabs">
            <!-- 附件信息 tab -->
            <el-tab-pane label="附件信息" name="attachment">
              <div class="upload-content">
                <el-form-item label="相关文件">
                  <div class="file-display">
                    <el-tag v-if="formData.allocationFile" type="primary" size="default">
                      <el-icon><Document /></el-icon>
                      {{ formData.allocationFile }}
                    </el-tag>
                    <span v-else class="no-file">暂无附件</span>
                  </div>
                </el-form-item>
              </div>
            </el-tab-pane>

            <!-- 位置信息 tab -->
            <el-tab-pane label="位置信息" name="location">
              <div class="location-content">
                <div class="form-row">
                  <el-form-item label="完整地址">
                    <el-input v-model="formData.fullAddress" readonly />
                  </el-form-item>
                  <el-form-item label="地理坐标">
                    <el-input v-model="formData.coordinates" readonly />
                  </el-form-item>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-form>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'

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

// 当前激活的tab
const activeTab = ref('attachment')

// 表单数据
const formData = ref({
  assetName: '',
  areaName: '',
  streetName: '',
  address: '',
  transferUnit: '',
  originalOwnershipUnit: '',
  buildingArea: 0,
  landArea: 0,
  propertyNumber: '',
  isTransferred: false,
  usage: '',
  rentalMethod: '',
  rent: 0,
  value: 0,
  assessmentDate: '',
  transferIssues: '',
  allocationFile: '',
  // 显示字段
  buildingAreaDisplay: '',
  landAreaDisplay: '',
  isTransferredDisplay: '',
  rentDisplay: '',
  valueDisplay: '',
  assessmentDateDisplay: '',
  allocationFileDisplay: '',
  fullAddress: '',
  coordinates: ''
})

// 监听 props.data 的变化，更新 formData
watch(() => props.data, (newData) => {
  if (newData) {
    // 基本数据赋值
    Object.keys(formData.value).forEach(key => {
      if (key in newData) {
        formData.value[key] = newData[key] || ''
      }
    })
    
    // 处理显示字段
    formData.value.buildingAreaDisplay = newData.buildingArea ? String(newData.buildingArea) : ''
    formData.value.landAreaDisplay = newData.landArea ? String(newData.landArea) : ''
    formData.value.isTransferredDisplay = newData.isTransferred ? '已过户' : '未过户'
    formData.value.rentDisplay = newData.rent ? newData.rent.toLocaleString() : ''
    formData.value.valueDisplay = newData.value ? String(newData.value) : ''
    formData.value.assessmentDateDisplay = newData.assessmentDate || '未评估'
    formData.value.allocationFileDisplay = newData.allocationFile || '未上传'
    
    // 处理位置信息
    formData.value.fullAddress = `${newData.areaName || ''} ${newData.streetName || ''} ${newData.address || ''}`.trim()
    formData.value.coordinates = '暂无坐标信息' // 可以根据实际情况修改
  }
}, { 
  immediate: true,
  deep: true 
})

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
/* 流程表单容器样式 */
.process-form-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

/* 表单区域样式 */
.form-section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 20px 0;
  padding: 0 0 10px 0;
  border-bottom: 2px solid #e4e7ed;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

/* 一行三列布局 */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
}

/* Tab组件样式 */
.form-tabs {
  margin-top: 20px;
}

.upload-content,
.location-content {
  padding: 20px 0;
}

/* 文件显示样式 */
.file-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-display .el-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
}

.no-file {
  color: #909399;
  font-style: italic;
}

/* 对话框底部样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 只读输入框样式优化 */
:deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  color: #495057;
}

:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  color: #495057;
}

/* 表单标签样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 自定义对话框大小和样式 */
:deep(.asset-detail-dialog) {
  width: calc(100vw - 200px) !important;
  max-width: none !important;
  margin: 0 !important;
  left: 200px !important;
  top: 0 !important;
  height: 100vh !important;
  border-radius: 0 !important;
}

:deep(.asset-detail-dialog .el-dialog__body) {
  height: calc(100vh - 120px) !important;
  overflow-y: auto;
  padding: 20px;
}

:deep(.asset-detail-dialog .el-dialog__header) {
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.asset-detail-dialog .el-dialog__footer) {
  padding: 0 20px 20px 20px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
}
</style>
