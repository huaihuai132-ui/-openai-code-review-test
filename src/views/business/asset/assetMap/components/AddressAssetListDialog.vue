<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`该地址的资产信息 (${assetList.length}个)`"
    width="80%"
    max-width="900px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="address-info" v-if="address">
      <el-tag type="info" size="large">
        <el-icon><Location /></el-icon>
        {{ address }}
      </el-tag>
    </div>

    <el-table 
      :data="assetList" 
      stripe 
      style="width: 100%; margin-top: 20px;"
      @row-click="handleRowClick"
      row-class-name="clickable-row"
    >
      <el-table-column prop="assetName" label="资产名称" min-width="180" show-overflow-tooltip>
        <template #default="scope">
          <div class="asset-name-cell">
            <el-icon class="asset-icon"><House /></el-icon>
            <span>{{ scope.row.assetName }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="buildingArea" label="建筑面积" width="100" align="center">
        <template #default="scope">
          {{ scope.row.buildingArea }}㎡
        </template>
      </el-table-column>
      
      <el-table-column prop="landArea" label="土地面积" width="100" align="center">
        <template #default="scope">
          {{ scope.row.landArea }}㎡
        </template>
      </el-table-column>
      
      <el-table-column prop="isTransferred" label="办证状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.isTransferred ? 'success' : 'warning'" size="small">
            {{ scope.row.isTransferred ? '已过户' : '未过户' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="usage" label="使用情况" width="100" align="center" />
      
      <el-table-column prop="rentalMethod" label="出租方式" width="100" align="center" />
      
      <el-table-column prop="rent" label="月租金" width="120" align="center">
        <template #default="scope">
          <span class="rent-amount">¥{{ scope.row.rent.toLocaleString() }}</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="value" label="价值" width="100" align="center">
        <template #default="scope">
          <span class="value-amount">{{ scope.row.value }}万</span>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="scope">
          <el-button size="small" text type="primary" @click.stop="handleViewDetail(scope.row)">
            <el-icon><View /></el-icon>
            查看详情
          </el-button>
          <el-button size="small" text type="success" @click.stop="handleLocateAsset(scope.row)">
            <el-icon><Location /></el-icon>
            地图定位
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="summary-info" v-if="summaryData">
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="8">
          <el-statistic title="资产总数" :value="summaryData.totalCount" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="总建筑面积" :value="summaryData.totalBuildingArea" suffix="㎡" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="总价值" :value="summaryData.totalValue" suffix="万元" />
        </el-col>
      </el-row>
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
import { ElMessage } from 'element-plus'
import { Location, House, View } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    default: ''
  },
  assetList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'view-detail', 'locate-asset'])

const dialogVisible = computed({
  get() {
    return props.visible
  },
  set(value) {
    emit('update:visible', value)
  }
})

// 计算汇总数据
const summaryData = computed(() => {
  if (!props.assetList || props.assetList.length === 0) {
    return null
  }
  
  return {
    totalCount: props.assetList.length,
    totalBuildingArea: props.assetList.reduce((sum, asset) => sum + (asset.buildingArea || 0), 0),
    totalValue: props.assetList.reduce((sum, asset) => sum + (asset.value || 0), 0)
  }
})

const handleClose = () => {
  dialogVisible.value = false
}

const handleRowClick = (row) => {
  handleViewDetail(row)
}

const handleViewDetail = (asset) => {
  emit('view-detail', asset)
}

const handleLocateAsset = (asset) => {
  emit('locate-asset', asset)
  // 定位后关闭弹窗
  handleClose()
}

// 监听assetList变化，在控制台输出调试信息
watch(() => props.assetList, (newList) => {
  console.log('AddressAssetListDialog 接收到资产列表:', newList)
}, { deep: true })
</script>

<style scoped>
.address-info {
  margin-bottom: 15px;
  text-align: center;
}

.address-info .el-tag {
  padding: 8px 16px;
  font-size: 14px;
}

.address-info .el-icon {
  margin-right: 8px;
}

.asset-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-icon {
  color: #409eff;
  font-size: 16px;
}

.rent-amount {
  color: #e6a23c;
  font-weight: 600;
}

.value-amount {
  color: #67c23a;
  font-weight: 600;
}

:deep(.clickable-row) {
  cursor: pointer;
}

:deep(.clickable-row:hover) {
  background-color: #f5f7fa !important;
}

.summary-info {
  padding: 20px 0 10px 0;
  border-top: 1px solid #e4e7ed;
}

.dialog-footer {
  text-align: right;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #303133;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-table__row:last-child td) {
  border-bottom: none;
}

/* 按钮样式 */
:deep(.el-button--text) {
  padding: 4px 8px;
  margin: 0 2px;
  border-radius: 4px;
}

:deep(.el-button--text:hover) {
  background-color: rgba(64, 158, 255, 0.1);
}
</style>
