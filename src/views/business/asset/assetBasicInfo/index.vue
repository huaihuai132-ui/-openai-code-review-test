<template>
  <div class="asset-basic-info">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="资产名称">
          <el-input v-model="searchForm.assetName" placeholder="请输入资产名称" clearable />
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="searchForm.area" placeholder="请选择区域" clearable style="width: 150px">
            <el-option 
              v-for="area in areaOptions" 
              :key="area.value" 
              :label="area.label" 
              :value="area.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="街道">
          <el-select v-model="searchForm.street" placeholder="请选择街道" clearable style="width: 150px" :disabled="!searchForm.area">
            <el-option 
              v-for="street in searchStreetOptions" 
              :key="street.value" 
              :label="street.label" 
              :value="street.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否办证过户">
          <el-select v-model="searchForm.isTransferred" placeholder="请选择状态" clearable>
            <el-option label="已过户" :value="true" />
            <el-option label="未过户" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="出租方式">
          <el-select v-model="searchForm.rentalMethod" placeholder="请选择出租方式" clearable>
            <el-option label="整租" value="整租" />
            <el-option label="分租" value="分租" />
            <el-option label="自用" value="自用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 资产列表 -->
    <el-card class="table-card">
      <div class="table-header">
        <h3>资产列表</h3>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增资产
        </el-button>
      </div>

      <el-table :data="filteredTableData" style="width: 100%" stripe>
        <el-table-column prop="areaName" label="区域" min-width="100" />
        <el-table-column prop="streetName" label="街道" min-width="120" />
        <el-table-column prop="assetName" label="资产名称" min-width="120" />
        <el-table-column prop="address" label="详细地址" min-width="180" />
        <el-table-column prop="transferUnit" label="移交单位" min-width="140" />
        <el-table-column prop="originalOwnershipUnit" label="原产权单位" min-width="140" />
        <el-table-column prop="buildingArea" label="房产面积" min-width="100">
          <template #default="scope"> {{ scope.row.buildingArea }}㎡ </template>
        </el-table-column>
        <el-table-column prop="landArea" label="土地面积" min-width="100">
          <template #default="scope"> {{ scope.row.landArea }}㎡ </template>
        </el-table-column>
        <el-table-column prop="propertyNumber" label="产权证号" min-width="140" />
        <el-table-column prop="isTransferred" label="是否办证过户" min-width="120">
          <template #default="scope">
            <el-tag :type="scope.row.isTransferred ? 'success' : 'warning'">
              {{ scope.row.isTransferred ? '已过户' : '未过户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usage" label="使用情况" min-width="100" />
        <el-table-column prop="rentalMethod" label="出租方式" min-width="100" />
        <el-table-column prop="rent" label="租金" min-width="100">
          <template #default="scope"> ¥{{ scope.row.rent }} </template>
        </el-table-column>
        <el-table-column prop="value" label="价值(万元)" min-width="100">
          <template #default="scope"> {{ scope.row.value }}万元 </template>
        </el-table-column>
        <el-table-column prop="transferIssues" label="办证过程中遇到的问题" min-width="150">
          <template #default="scope">
            <el-tooltip
              v-if="scope.row.transferIssues"
              :content="scope.row.transferIssues"
              placement="top"
            >
              <span class="issue-text">{{ scope.row.transferIssues }}</span>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="allocationFile" label="划拨文件" min-width="120">
          <template #default="scope">
            <el-button
              v-if="scope.row.allocationFile"
              type="text"
              size="small"
              @click="viewFile(scope.row)"
            >
              查看文件
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <AssetBasicInfoDialog
      v-model:visible="dialogVisible"
      :is-edit="isEdit"
      :data="formData"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue'
import AssetBasicInfoDialog from './components/AssetBasicInfoDialog.vue'

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formData = ref({})

// 搜索表单
const searchForm = reactive({
  assetName: '',
  area: '',
  street: '',
  isTransferred: '',
  rentalMethod: '',
})

// 区域街道配置数据
const areaOptions = ref([])
const searchStreetOptions = ref([])

// 区域街道配置数据 (完整版本)
const areaStreetConfig = {
  areaStreetConfig: [
    {
      areaCode: '001',
      areaName: '月湖区',
      streets: [
        { streetCode: '001001', streetName: '童家街道' },
        { streetCode: '001002', streetName: '夏埠街道' },
        { streetCode: '001003', streetName: '四青街道' },
        { streetCode: '001004', streetName: '梅园街道' },
        { streetCode: '001005', streetName: '江边街道' },
        { streetCode: '001006', streetName: '交通街道' },
        { streetCode: '001007', streetName: '东湖街道' },
        { streetCode: '001008', streetName: '白露街道' }
      ]
    },
    {
      areaCode: '002',
      areaName: '贵溪市',
      streets: [
        { streetCode: '002001', streetName: '东门街道' },
        { streetCode: '002002', streetName: '雄石街道' },
        { streetCode: '002003', streetName: '花园街道' },
        { streetCode: '002004', streetName: '泗汥镇' },
        { streetCode: '002005', streetName: '河潭镇' },
        { streetCode: '002006', streetName: '周坊镇' },
        { streetCode: '002007', streetName: '鸿塘镇' },
        { streetCode: '002008', streetName: '志光镇' },
        { streetCode: '002009', streetName: '流口镇' },
        { streetCode: '002010', streetName: '罗河镇' },
        { streetCode: '002011', streetName: '金屯镇' },
        { streetCode: '002012', streetName: '塘湾镇' },
        { streetCode: '002013', streetName: '文坊镇' },
        { streetCode: '002014', streetName: '冷水镇' },
        { streetCode: '002015', streetName: '龙虎山镇' },
        { streetCode: '002016', streetName: '上清镇' },
        { streetCode: '002017', streetName: '滨江镇' },
        { streetCode: '002018', streetName: '白田乡' },
        { streetCode: '002019', streetName: '雷溪乡' },
        { streetCode: '002020', streetName: '彭湾乡' },
        { streetCode: '002021', streetName: '樟坪畲族乡' },
        { streetCode: '002022', streetName: '耳口乡' },
        { streetCode: '002023', streetName: '余家乡' },
        { streetCode: '002024', streetName: '塔桥园艺场' },
        { streetCode: '002025', streetName: '河潭垦殖场' },
        { streetCode: '002026', streetName: '西窯林场' },
        { streetCode: '002027', streetName: '双圳林场' },
        { streetCode: '002028', streetName: '耳口林场' },
        { streetCode: '002029', streetName: '冷水林场' },
        { streetCode: '002030', streetName: '三县岭林场' },
        { streetCode: '002031', streetName: '上清林场' }
      ]
    },
    {
      areaCode: '003',
      areaName: '余江区',
      streets: [
        { streetCode: '003001', streetName: '邓埠镇' },
        { streetCode: '003002', streetName: '锦江镇' },
        { streetCode: '003003', streetName: '画桥镇' },
        { streetCode: '003004', streetName: '潢溪镇' },
        { streetCode: '003005', streetName: '中童镇' },
        { streetCode: '003006', streetName: '马荃镇' },
        { streetCode: '003007', streetName: '黄庄乡' },
        { streetCode: '003008', streetName: '春涛乡' },
        { streetCode: '003009', streetName: '平定乡' },
        { streetCode: '003010', streetName: '杨溪乡' },
        { streetCode: '003011', streetName: '洪湖乡' },
        { streetCode: '003012', streetName: '高公寨林场' },
        { streetCode: '003013', streetName: '水产场' },
        { streetCode: '003014', streetName: '大桥良种场' },
        { streetCode: '003015', streetName: '张公桥农场' },
        { streetCode: '003016', streetName: '塘潮源林场' },
        { streetCode: '003017', streetName: '青年农场' },
        { streetCode: '003018', streetName: '刘垦场' }
      ]
    }
  ]
}

// 响应式数据
const tableData = ref([
  {
    id: 1,
    assetName: '林荫东路南侧C检9号',
    area: '001',
    areaName: '月湖区',
    street: '001005',
    streetName: '江边街道',
    address: '林荫东路南侧C检9号',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 120,
    landArea: 80,
    propertyNumber: '鹰房权证字第001号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 32000,
    value: 120,
    transferIssues: '无',
    allocationFile: '已上传',
  },
  {
    id: 2,
    assetName: '林荫东路南侧C检8号',
    area: '001',
    areaName: '月湖区',
    street: '001005',
    streetName: '江边街道',
    address: '林荫东路南侧C检8号',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 120,
    landArea: 80,
    propertyNumber: '鹰房权证字第002号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 32000,
    value: 120,
    transferIssues: '无',
    allocationFile: '已上传',
  },
  {
    id: 3,
    assetName: '民昇佳苑21号楼-02＃、01022#、01023#店面',
    area: '002',
    areaName: '贵溪市',
    street: '002001',
    streetName: '东门街道',
    address: '民昇佳苑21号楼',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 150,
    landArea: 100,
    propertyNumber: '鹰房权证字第003号',
    isTransferred: false,
    usage: '出租',
    rentalMethod: '分租',
    rent: 36000,
    value: 150,
    transferIssues: '产权证办理中',
    allocationFile: '已上传',
  },
  {
    id: 4,
    assetName: '林荫东路南侧C检8号',
    area: '001',
    areaName: '月湖区',
    street: '001005',
    streetName: '江边街道',
    assetName: '环城西路6号-2#店面',
    address: '江西省鹰潭市环城西路6号',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 200,
    landArea: 120,
    propertyNumber: '鹰房权证字第004号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 60000,
    value: 200,
    transferIssues: '无',
    allocationFile: '已上传',
  },
  {
    id: 5,
    assetName: '林荫东路南侧C检8号',
    area: '001',
    areaName: '月湖区',
    street: '001005',
    streetName: '江边街道',
    assetName: '民昇佳苑22号楼-01＃店面',
    address: '江西省鹰潭市民昇佳苑22号楼',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 100,
    landArea: 70,
    propertyNumber: '鹰房权证字第005号',
    isTransferred: false,
    usage: '出租',
    rentalMethod: '整租',
    rent: 21000,
    value: 100,
    transferIssues: '等待产权证',
    allocationFile: '已上传',
  },
  {
    id: 6,
    assetName: '林荫东路南侧C检8号',
    area: '001',
    areaName: '月湖区',
    street: '001005',
    streetName: '江边街道',
    assetName: '岱宝山路9号（1-4层）',
    address: '江西省鹰潭市岱宝山路9号',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 400,
    landArea: 200,
    propertyNumber: '鹰房权证字第006号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 60000,
    value: 400,
    transferIssues: '无',
    allocationFile: '已上传',
  },
  {
    id: 7,
    assetName: '林荫东路南侧C检8号',
    area: '001',
    areaName: '月湖区',
    street: '001005',
    streetName: '江边街道',
    assetName: '环城西路6号-1#店面',
    address: '江西省鹰潭市环城西路6号',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 200,
    landArea: 120,
    propertyNumber: '鹰房权证字第007号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 60000,
    value: 200,
    transferIssues: '无',
    allocationFile: '已上传',
  },
  {
    id: 8,
    assetName: '林荫东路南侧C检8号',
    area: '001',
    areaName: '月湖区',
    street: '001005',
    streetName: '江边街道',
    assetName: '民昇佳苑22号楼-02＃店面',
    address: '江西省鹰潭市民昇佳苑22号楼',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 80,
    landArea: 60,
    propertyNumber: '鹰房权证字第008号',
    isTransferred: false,
    usage: '出租',
    rentalMethod: '整租',
    rent: 13500,
    value: 80,
    transferIssues: '产权证办理中',
    allocationFile: '已上传',
  },
  {
    id: 9,
    assetName: '林荫东路南侧C检8号',
    area: '001',
    areaName: '月湖区',
    street: '001005',
    streetName: '江边街道',
    assetName: '民昇佳苑22号楼-06#店面',
    address: '江西省鹰潭市民昇佳苑22号楼',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 70,
    landArea: 50,
    propertyNumber: '鹰房权证字第009号',
    isTransferred: false,
    usage: '出租',
    rentalMethod: '整租',
    rent: 12000,
    value: 70,
    transferIssues: '等待产权证',
    allocationFile: '已上传',
  },
  {
    id: 10,
    assetName: '林荫东路南侧C检8号',
    area: '001',
    areaName: '月湖区',
    street: '001005',
    streetName: '江边街道',
    assetName: '莲花路菜场南侧',
    address: '江西省鹰潭市莲花路菜场南侧',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 180,
    landArea: 120,
    propertyNumber: '鹰房权证字第010号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 55000,
    value: 180,
    transferIssues: '无',
    allocationFile: '已上传',
  },
  {
    id: 11,
    assetName: '林荫东路南侧C检8号',
    area: '001',
    areaName: '月湖区',
    street: '001005',
    streetName: '江边街道',
    assetName: '莲花南路十区17-18号一至三楼商业房',
    address: '江西省鹰潭市莲花南路十区17-18号',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 300,
    landArea: 200,
    propertyNumber: '鹰房权证字第011号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 6500,
    value: 300,
    transferIssues: '无',
    allocationFile: '已上传',
  },
  {
    id: 12,
    assetName: '林荫东路南侧C检8号',
    area: '001',
    areaName: '月湖区',
    street: '001005',
    streetName: '江边街道',
    assetName: '民欣佳园24号楼-02#店面',
    address: '江西省鹰潭市民欣佳园24号楼',
    transferUnit: '市财政局',
    originalOwnershipUnit: '原国资委',
    buildingArea: 150,
    landArea: 100,
    propertyNumber: '鹰房权证字第012号',
    isTransferred: false,
    usage: '出租',
    rentalMethod: '整租',
    rent: 36000,
    value: 150,
    transferIssues: '产权证办理中',
    allocationFile: '已上传',
  },
])

// 计算属性：过滤后的表格数据
const filteredTableData = computed(() => {
  return tableData.value.filter((item) => {
    const nameMatch = !searchForm.assetName || item.assetName.includes(searchForm.assetName)
    const areaMatch = !searchForm.area || (item.address && item.address.includes(searchForm.area))
    const statusMatch = !searchForm.isTransferred || item.isTransferred === searchForm.isTransferred
    const rentalMethodMatch =
      !searchForm.rentalMethod || item.rentalMethod === searchForm.rentalMethod
    return nameMatch && areaMatch && statusMatch && rentalMethodMatch
  })
})

// 查看文件
const viewFile = (row) => {
  ElMessage.info(`查看文件：${row.allocationFile}`)
  // 这里可以添加实际的文件查看逻辑，比如打开新窗口或下载文件
}

// 搜索
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

// 重置搜索
const resetSearch = () => {
  searchForm.assetName = ''
  searchForm.area = ''
  searchForm.isTransferred = ''
  searchForm.rentalMethod = ''
}

// 添加资产
const handleAdd = () => {
  dialogVisible.value = true
  isEdit.value = false
  formData.value = {
    assetName: '',
    area: '',
    areaName: '',
    street: '',
    streetName: '',
    address: '',
    transferUnit: '',
    originalOwnershipUnit: '',
    buildingArea: '',
    landArea: '',
    propertyNumber: '',
    isTransferred: false,
    usage: '',
    rentalMethod: '',
    rent: '',
    value: '',
    transferIssues: '',
    allocationFile: '',
  }
}

// 编辑资产
const handleEdit = (row) => {
  dialogVisible.value = true
  isEdit.value = true
  formData.value = { ...row }
}

// 删除资产
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除资产"${row.assetName}"吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = tableData.value.findIndex((item) => item.id === row.id)
      if (index !== -1) {
        tableData.value.splice(index, 1)
        handleDeleteSuccess(row.id) // 通知地图组件
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 处理表单提交
const handleSubmit = (formData) => {
  if (isEdit.value) {
    // 编辑模式
    const index = tableData.value.findIndex((item) => item.id === formData.id)
    if (index !== -1) {
      tableData.value[index] = { ...formData }
      handleEditSuccess(formData) // 通知地图组件
      ElMessage.success('编辑成功')
    }
  } else {
    // 添加模式
    const newAsset = {
      ...formData,
      id: Math.max(...tableData.value.map((item) => item.id)) + 1,
    }
    tableData.value.push(newAsset)
    handleAddSuccess(newAsset) // 通知地图组件
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

// 页面加载时更新数据
onMounted(() => {
  // 监听地图组件的资产数据更新事件
  window.addEventListener('assetDataUpdated', handleAssetDataUpdate)

  // 从地图组件获取最新数据
  syncDataWithMap()
})

// 页面卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('assetDataUpdated', handleAssetDataUpdate)
})

// 处理资产数据更新事件
const handleAssetDataUpdate = (event) => {
  const { data } = event.detail
  // 更新表格数据，保持与地图组件同步
  tableData.value = data.map((asset) => ({
    id: asset.id,
    assetName: asset.assetName,
    address: asset.address,
    transferUnit: asset.transferUnit || '市财政局',
    originalOwnershipUnit: asset.originalOwnershipUnit || '原国资委',
    buildingArea: asset.buildingArea,
    landArea: asset.landArea,
    propertyNumber: asset.propertyNumber,
    isTransferred: asset.isTransferred,
    usage: asset.usage,
    rentalMethod: asset.rentalMethod,
    rent: asset.rent,
    value: asset.value,
    transferIssues: asset.transferIssues || '无',
    allocationFile: asset.allocationFile || '已上传',
  }))
}

// 与地图组件同步数据
const syncDataWithMap = () => {
  // 这里可以添加从地图组件获取数据的逻辑
  // 目前使用本地数据，但保持结构一致
  console.log('资产基本信息页面已与地图组件数据同步')
}

// 添加资产后通知地图组件
const handleAddSuccess = (assetData) => {
  // 通知地图组件添加新资产
  window.dispatchEvent(
    new CustomEvent('assetDataUpdateRequest', {
      detail: {
        type: 'addAssetBasicInfo',
        data: assetData,
      },
    }),
  )
}

// 编辑资产后通知地图组件
const handleEditSuccess = (assetData) => {
  // 通知地图组件更新资产信息
  window.dispatchEvent(
    new CustomEvent('assetDataUpdateRequest', {
      detail: {
        type: 'updateAssetBasicInfo',
        data: assetData,
      },
    }),
  )
}

// 删除资产后通知地图组件
const handleDeleteSuccess = (assetId) => {
  // 通知地图组件删除资产
  window.dispatchEvent(
    new CustomEvent('assetDataUpdateRequest', {
      detail: {
        type: 'deleteAssetBasicInfo',
        data: { id: assetId },
      },
    }),
  )
}
</script>

<style scoped>
.asset-basic-info {
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

/* 问题文本样式 */
.issue-text {
  max-width: 120px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 文件按钮样式 */
:deep(.el-button--text) {
  color: #409eff;
  padding: 0;
}

:deep(.el-button--text:hover) {
  color: #66b1ff;
}
</style>
