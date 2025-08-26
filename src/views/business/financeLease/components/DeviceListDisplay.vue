<template>
  <div class="device-list-display">
    <!-- 设备清单表格 -->
    <el-table 
      :data="deviceList" 
      :stripe="true" 
      :show-overflow-tooltip="true" 
      v-loading="loading"
      class="device-table"
    >
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="规格型号" align="center" prop="deviceSpecification" />
      <el-table-column label="生产厂家" align="center" prop="deviceManufacturers" />
      <el-table-column label="购买时间" align="center" prop="buyDate" width="120">
        <template #default="scope">
          {{ scope.row.buyDate ? formatDate(scope.row.buyDate) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" prop="quantity" width="80" />
      <el-table-column label="净值" align="center" prop="netWorth" width="100">
        <template #default="scope">
          <span>{{ scope.row.netWorth }}元</span>
        </template>
      </el-table-column>
      <el-table-column label="原值" align="center" prop="originalWorth" width="100">
        <template #default="scope">
          <span>{{ scope.row.originalWorth }}元</span>
        </template>
      </el-table-column>
      <el-table-column label="设备状态" align="center" prop="deviceStatus" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.deviceStatus)">
            {{ getStatusText(scope.row.deviceStatus) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空数据提示 -->
    <el-empty 
      v-if="!loading && (!deviceList || deviceList.length === 0)" 
      description="暂无设备数据"
      :image-size="100"
    />
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatTime'

// 定义设备数据结构
interface FinanceDevice {
  id: number
  leaseId: number
  deviceName: string
  deviceSpecification: string
  deviceManufacturers: string
  buyDate: Date | string | number
  quantity: number
  netWorth: number
  originalWorth: number
  deviceStatus: number
  deptId: number
}

// 定义组件属性
interface Props {
  deviceList: FinanceDevice[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// 获取状态类型
const getStatusType = (status: number) => {
  const statusMap: Record<number, string> = {
    1: 'success',
    2: 'warning',
    3: 'danger',
    4: 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '正常',
    2: '维修中',
    3: '报废',
    4: '闲置'
  }
  return statusMap[status] || '未知'
}
</script>

<style scoped>
.device-list-display {
  padding: 20px 0;
}

.device-table {
  margin-bottom: 20px;
}

.device-table .el-table__header {
  background-color: #f5f7fa;
}

.device-table .el-table__row:hover {
  background-color: #f5f7fa;
}
</style>
