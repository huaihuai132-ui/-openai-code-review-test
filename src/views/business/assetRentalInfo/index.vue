<template>
  <div class="asset-rental-info">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="承租户">
          <el-input v-model="searchForm.tenant" placeholder="请输入承租户" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 租赁列表 -->
    <el-card class="table-card">
      <div class="table-header">
        <h3>租赁信息列表</h3>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增租赁
        </el-button>
      </div>

      <el-table :data="filteredTableData" style="width: 100%" stripe>
        <el-table-column prop="tenant" label="承租户" min-width="120" />
        <el-table-column prop="assetName" label="资产名称" min-width="180" />
        <el-table-column prop="address" label="资产地址" min-width="220" />
        <el-table-column prop="deposit" label="押金" min-width="100">
          <template #default="scope"> ¥{{ scope.row.deposit }} </template>
        </el-table-column>
        <el-table-column prop="externalAssetName" label="外部资产名称" min-width="180" />
        <el-table-column prop="businessPurpose" label="经营用途" min-width="140" />
        <el-table-column prop="contractPeriod" label="合同期限" min-width="180">
          <template #default="scope">
            {{ scope.row.contractPeriod }}
          </template>
        </el-table-column>
        <el-table-column prop="rentEndDate" label="收租截止期限" min-width="120" />
        <el-table-column prop="annualRent" label="年租金" min-width="100">
          <template #default="scope"> ¥{{ scope.row.annualRent }} </template>
        </el-table-column>
        <el-table-column prop="phoneNumber" label="联系电话" min-width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index)"
              >删除</el-button
            >
            <el-tooltip content="地图定位" placement="top">
              <el-button size="small" circle @click="handleLocate(scope.row)">
                <el-icon><Location /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <AssetRentalInfoDialog
      v-model:visible="dialogVisible"
      :is-edit="isEdit"
      :data="currentData"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Location } from '@element-plus/icons-vue'
import AssetRentalInfoDialog from './components/AssetRentalInfoDialog.vue'

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentData = ref({})
const router = useRouter()

// 搜索表单
const searchForm = reactive({
  tenant: '',
})

// 响应式数据
const tableData = ref([
  {
    id: 1,
    assetId: 1,
    tenant: '张三',
    assetName: '林荫东路南侧C栋9号',
    address: '江西省鹰潭市月湖区林荫东路南侧C栋9号',
    deposit: 5000,
    externalAssetName: '外部-林荫东路C栋9号',
    businessPurpose: '商业经营',
    contractPeriod: '2024-01-01 至 2026-12-31',
    rentEndDate: '2026-12-31',
    annualRent: 384000,
    phoneNumber: '13800138001',
  },
  {
    id: 2,
    assetId: 2,
    tenant: '李四',
    assetName: '林荫东路南侧C栋8号',
    address: '江西省鹰潭市月湖区林荫东路南侧C栋8号',
    deposit: 5000,
    externalAssetName: '外部-林荫东路C栋8号',
    businessPurpose: '商业经营',
    contractPeriod: '2024-02-01 至 2027-01-31',
    rentEndDate: '2027-01-31',
    annualRent: 384000,
    phoneNumber: '13800138002',
  },
  {
    id: 3,
    assetId: 3,
    tenant: '王五',
    assetName: '民昇佳苑21号楼-02#店面',
    address: '江西省鹰潭市月湖区民昇佳苑21号楼',
    deposit: 3000,
    externalAssetName: '外部-民昇佳苑21-02',
    businessPurpose: '商业经营',
    contractPeriod: '2024-03-01 至 2027-02-28',
    rentEndDate: '2027-02-28',
    annualRent: 432000,
    phoneNumber: '13800138003',
  },
  {
    id: 4,
    assetId: 4,
    tenant: '赵六',
    assetName: '环城西路6号-2#店面',
    address: '江西省鹰潭市月湖区环城西路6号',
    deposit: 8000,
    externalAssetName: '外部-环城西路6号-2',
    businessPurpose: '商业经营',
    contractPeriod: '2024-01-15 至 2026-12-14',
    rentEndDate: '2026-12-14',
    annualRent: 720000,
    phoneNumber: '13800138004',
  },
  {
    id: 5,
    assetId: 5,
    tenant: '钱七',
    assetName: '民昇佳苑22号楼-01#店面',
    address: '江西省鹰潭市月湖区民昇佳苑22号楼',
    deposit: 2000,
    externalAssetName: '外部-民昇佳苑22-01',
    businessPurpose: '商业经营',
    contractPeriod: '2024-04-01 至 2027-03-31',
    rentEndDate: '2027-03-31',
    annualRent: 252000,
    phoneNumber: '13800138005',
  },
  {
    id: 6,
    assetId: 6,
    tenant: '孙八',
    assetName: '岱宝山路9号（1-4层）',
    address: '江西省鹰潭市月湖区岱宝山路9号',
    deposit: 10000,
    externalAssetName: '外部-岱宝山路9号',
    businessPurpose: '商业经营',
    contractPeriod: '2024-05-01 至 2027-04-30',
    rentEndDate: '2027-04-30',
    annualRent: 720000,
    phoneNumber: '13800138006',
  },
  {
    id: 7,
    assetId: 7,
    tenant: '周九',
    assetName: '环城西路6号-1#店面',
    address: '江西省鹰潭市月湖区环城西路6号',
    deposit: 8000,
    externalAssetName: '外部-环城西路6号-1',
    businessPurpose: '商业经营',
    contractPeriod: '2024-06-01 至 2027-05-31',
    rentEndDate: '2027-05-31',
    annualRent: 720000,
    phoneNumber: '13800138007',
  },
  {
    id: 8,
    assetId: 8,
    tenant: '吴十',
    assetName: '民昇佳苑22号楼-02#店面',
    address: '江西省鹰潭市月湖区民昇佳苑22号楼',
    deposit: 1500,
    externalAssetName: '外部-民昇佳苑22-02',
    businessPurpose: '商业经营',
    contractPeriod: '2024-07-01 至 2027-06-30',
    rentEndDate: '2027-06-30',
    annualRent: 162000,
    phoneNumber: '13800138008',
  },
  {
    id: 9,
    assetId: 9,
    tenant: '郑十一',
    assetName: '民昇佳苑22号楼-06#店面',
    address: '江西省鹰潭市月湖区民昇佳苑22号楼',
    deposit: 1200,
    externalAssetName: '外部-民昇佳苑22-06',
    businessPurpose: '商业经营',
    contractPeriod: '2024-08-01 至 2027-07-31',
    rentEndDate: '2027-07-31',
    annualRent: 144000,
    phoneNumber: '13800138009',
  },
  {
    id: 10,
    assetId: 10,
    tenant: '王十二',
    assetName: '莲花路菜场南侧',
    address: '江西省鹰潭市月湖区莲花路菜场南侧',
    deposit: 9000,
    externalAssetName: '外部-莲花路菜场南侧',
    businessPurpose: '商业经营',
    contractPeriod: '2024-09-01 至 2027-08-31',
    rentEndDate: '2027-08-31',
    annualRent: 660000,
    phoneNumber: '13800138010',
  },
  {
    id: 11,
    assetId: 11,
    tenant: '李十三',
    assetName: '莲花南路十区17-18号一至三楼商业房',
    address: '江西省鹰潭市月湖区莲花南路十区17-18号',
    deposit: 1000,
    externalAssetName: '外部-莲花南路十区17-18号',
    businessPurpose: '商业经营',
    contractPeriod: '2024-10-01 至 2027-09-30',
    rentEndDate: '2027-09-30',
    annualRent: 78000,
    phoneNumber: '13800138011',
  },
  {
    id: 12,
    assetId: 12,
    tenant: '张十四',
    assetName: '民欣佳园24号楼-02#店面',
    address: '江西省鹰潭市月湖区民欣佳园24号楼',
    deposit: 3000,
    externalAssetName: '外部-民欣佳园24-02',
    businessPurpose: '商业经营',
    contractPeriod: '2024-11-01 至 2027-10-31',
    rentEndDate: '2027-10-31',
    annualRent: 432000,
    phoneNumber: '13800138012',
  },
])

// 计算属性：过滤后的表格数据
const filteredTableData = computed(() => {
  return tableData.value.filter((item) => {
    const tenantMatch = !searchForm.tenant || item.tenant.includes(searchForm.tenant)
    return tenantMatch
  })
})

// 搜索
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

// 重置搜索
const resetSearch = () => {
  searchForm.tenant = ''
}

// 新增租赁
const handleAdd = () => {
  isEdit.value = false
  currentData.value = {}
  dialogVisible.value = true
}

// 编辑租赁
const handleEdit = (row) => {
  isEdit.value = true
  currentData.value = { ...row }
  dialogVisible.value = true
}

// 删除租赁
const handleDelete = (index) => {
  ElMessageBox.confirm('确定要删除这条租赁记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // 取消删除
    })
}

// 地图定位
const handleLocate = (row) => {
  if (!row.id) return
  router.push({ name: 'assetMap', query: { assetId: row.id } })
}

// 提交表单
const handleSubmit = (formData) => {
  if (isEdit.value) {
    // 编辑模式：更新现有数据
    const index = tableData.value.findIndex((item) => item.tenant === currentData.value.tenant)
    if (index !== -1) {
      const contractPeriod =
        formData.contractStartDate && formData.contractEndDate
          ? `${formData.contractStartDate} 至 ${formData.contractEndDate}`
          : formData.contractPeriod || ''
      tableData.value[index] = { ...formData, contractPeriod }
    }
  } else {
    // 新增模式：添加新数据
    const contractPeriod =
      formData.contractStartDate && formData.contractEndDate
        ? `${formData.contractStartDate} 至 ${formData.contractEndDate}`
        : formData.contractPeriod || ''
    tableData.value.push({ ...formData, contractPeriod })
  }
}
</script>

<style scoped>
.asset-rental-info {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 500;
}

.page-header p {
  margin: 0;
  opacity: 0.9;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

/* 表格样式优化 */
:deep(.el-table) {
  width: 100% !important;
}

:deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

:deep(.el-table__header-wrapper) {
  overflow-x: auto;
}

:deep(.el-table .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式表格 */
@media (max-width: 1200px) {
  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-table .cell) {
    padding: 8px 4px;
  }
}

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .search-form .el-form-item {
    margin-bottom: 10px;
  }
}
</style>
