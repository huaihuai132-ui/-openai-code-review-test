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
        <div class="header-actions">
          <el-button type="success" @click="handleImport">
            <el-icon><Upload /></el-icon>
            导入资产
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增资产
          </el-button>
        </div>
      </div>

      <el-table :data="filteredTableData" style="width: 100%" stripe>
        <el-table-column prop="areaName" label="区域" min-width="80" align="center" header-align="center" />
        <el-table-column prop="streetName" label="街道" min-width="100" align="center" header-align="center" />
        <el-table-column prop="assetName" label="资产名称" min-width="180" show-overflow-tooltip align="center" header-align="center" />
        <el-table-column prop="address" label="详细地址" min-width="200" show-overflow-tooltip align="center" header-align="center" />
        <el-table-column prop="buildingArea" label="房产面积" min-width="100" align="center" header-align="center">
          <template #default="scope"> {{ scope.row.buildingArea }}㎡ </template>
        </el-table-column>
        <el-table-column prop="landArea" label="土地面积" min-width="100" align="center" header-align="center">
          <template #default="scope"> {{ scope.row.landArea }}㎡ </template>
        </el-table-column>
        <el-table-column prop="isTransferred" label="办证状态" min-width="110" align="center" header-align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isTransferred ? 'success' : 'warning'" size="small">
              {{ scope.row.isTransferred ? '已过户' : '未过户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usage" label="使用情况" min-width="90" align="center" header-align="center" />
        <el-table-column prop="rentalMethod" label="出租方式" min-width="100" align="center" header-align="center" />
        <el-table-column prop="rent" label="租金" min-width="120" align="center" header-align="center">
          <template #default="scope"> ¥{{ scope.row.rent }} </template>
        </el-table-column>
        <el-table-column prop="value" label="价值(万元)" min-width="120" align="center" header-align="center">
          <template #default="scope"> {{ scope.row.value }}万元 </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right" align="center" header-align="center">
          <template #default="scope">
            <el-button size="small" text @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" text type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" text type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
    <AssetBasicInfoDialog
      v-model:visible="dialogVisible"
      :is-edit="isEdit"
      :data="formData"
      @submit="handleSubmit"
    />

    <!-- 查看详情对话框 -->
    <AssetDetailDialog
      v-model:visible="viewDialogVisible"
      :data="viewData"
      @edit="handleEditFromDetail"
      @view-file="handleViewFile"
    />

    <!-- 隐藏的文件输入元素 -->
    <input 
      ref="fileInputRef" 
      type="file" 
      accept=".xlsx,.xls,.csv" 
      style="display: none" 
      @change="handleFileChange"
    />

    <!-- 导入进度对话框 -->
    <el-dialog 
      v-model="importDialogVisible" 
      title="资产导入" 
      width="600px" 
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="!importing"
    >
      <div class="import-content">
        <div v-if="!importing && !importResult" class="import-tips">
          <el-alert 
            title="导入说明" 
            type="info" 
            :closable="false"
            show-icon
          >
            <template #default>
              <ul class="tips-list">
                <li>支持 Excel (.xlsx, .xls) 和 CSV 格式文件</li>
                <li>请确保文件包含以下列：资产名称、地址、建筑面积、土地面积、产权证号等</li>
                <li>数据将被验证后添加到系统中</li>
              </ul>
            </template>
          </el-alert>
          <div class="file-info" v-if="selectedFile">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="文件名">
                <el-tag type="primary">{{ selectedFile.name }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="文件大小">
                {{ formatFileSize(selectedFile.size) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <div v-if="importing" class="importing">
          <el-progress 
            :percentage="importProgress" 
            :status="importProgress === 100 ? 'success' : undefined"
            :stroke-width="20"
          />
          <p class="progress-text">{{ importStatus }}</p>
        </div>

        <div v-if="importResult" class="import-result">
          <el-result 
            :icon="importResult.success ? 'success' : 'error'"
            :title="importResult.success ? '导入成功' : '导入失败'"
            :sub-title="importResult.message"
          >
            <template #extra v-if="importResult.success">
              <div class="result-stats">
                <el-statistic title="成功导入" :value="importResult.successCount" />
                <el-statistic title="失败数量" :value="importResult.errorCount" />
              </div>
            </template>
          </el-result>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelImport" :disabled="importing">取消</el-button>
          <el-button 
            v-if="!selectedFile && !importing && !importResult" 
            type="primary" 
            @click="selectFile"
          >
            选择文件
          </el-button>
          <el-button 
            v-if="selectedFile && !importing && !importResult" 
            type="success" 
            @click="startImport"
          >
            开始导入
          </el-button>
          <el-button 
            v-if="importResult" 
            type="primary" 
            @click="finishImport"
          >
            完成
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh, Location, Upload } from '@element-plus/icons-vue'
import AssetBasicInfoDialog from './components/AssetBasicInfoDialog.vue'
import AssetDetailDialog from './components/AssetDetailDialog.vue'
import { useRouter } from 'vue-router'

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formData = ref({})

// 查看对话框相关
const viewDialogVisible = ref(false)
const viewData = ref({})

// 导入相关
const importDialogVisible = ref(false)
const importing = ref(false)
const importProgress = ref(0)
const importStatus = ref('')
const selectedFile = ref(null)
const fileInputRef = ref(null)
const importResult = ref(null)

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
    assetName: '环城西路6号-2#店面',
    area: '001',
    areaName: '月湖区',
    street: '001006',
    streetName: '交通街道',
    address: '环城西路6号',
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
    assetName: '民昇佳苑22号楼-01＃店面',
    area: '002',
    areaName: '贵溪市',
    street: '002002',
    streetName: '雄石街道',
    address: '民昇佳苑22号楼',
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

// 初始化区域街道数据
const initAreaStreetOptions = () => {
  areaOptions.value = areaStreetConfig.areaStreetConfig.map(area => ({
    label: area.areaName,
    value: area.areaCode,
    streets: area.streets
  }))
}

// 监听搜索区域变化
watch(() => searchForm.area, (newAreaCode) => {
  searchForm.street = '' // 清空街道选择
  
  if (newAreaCode) {
    const selectedArea = areaStreetConfig.areaStreetConfig.find(area => area.areaCode === newAreaCode)
    if (selectedArea) {
      searchStreetOptions.value = selectedArea.streets.map(street => ({
        label: street.streetName,
        value: street.streetCode
      }))
    }
  } else {
    searchStreetOptions.value = []
  }
})
const router = useRouter()
// 地图定位
const handleLocate = (row) => {
  if (!row.id) return
  router.push({ name: 'assetMap', query: { assetId: row.id } })
}

// 计算属性：过滤后的表格数据
const filteredTableData = computed(() => {
  return tableData.value.filter((item) => {
    const nameMatch = !searchForm.assetName || item.assetName.includes(searchForm.assetName)
    const areaMatch = !searchForm.area || item.area === searchForm.area
    const streetMatch = !searchForm.street || item.street === searchForm.street
    const statusMatch = searchForm.isTransferred === '' || item.isTransferred === searchForm.isTransferred
    const rentalMethodMatch = !searchForm.rentalMethod || item.rentalMethod === searchForm.rentalMethod
    return nameMatch && areaMatch && streetMatch && statusMatch && rentalMethodMatch
  })
})

// 查看文件
const handleViewFile = (row) => {
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
  searchForm.street = ''
  searchForm.isTransferred = ''
  searchForm.rentalMethod = ''
}

// 查看资产详情
const handleView = (row) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

// 从详情组件跳转到编辑
const handleEditFromDetail = (data) => {
  viewDialogVisible.value = false
  handleEdit(data)
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
    assessmentDate: '', // 资产评估时间
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
  // 初始化区域街道数据
  initAreaStreetOptions()
  
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

// 导入相关方法
// 打开导入对话框
const handleImport = () => {
  importDialogVisible.value = true
  importing.value = false
  importProgress.value = 0
  importStatus.value = ''
  selectedFile.value = null
  importResult.value = null
}

// 选择文件
const selectFile = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 验证文件类型
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                         'application/vnd.ms-excel', 
                         'text/csv']
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      ElMessage.error('请选择 Excel (.xlsx, .xls) 或 CSV 格式的文件')
      return
    }
    
    // 验证文件大小 (限制为10MB)
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过 10MB')
      return
    }
    
    selectedFile.value = file
  }
  // 清空input值，以便可以重复选择同一个文件
  event.target.value = ''
}

// 开始导入
const startImport = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请先选择要导入的文件')
    return
  }
  
  importing.value = true
  importProgress.value = 0
  importStatus.value = '正在读取文件...'
  
  try {
    // 模拟导入过程
    await simulateImportProcess()
  } catch (error) {
    console.error('导入失败:', error)
    importResult.value = {
      success: false,
      message: '导入过程中发生错误: ' + error.message,
      successCount: 0,
      errorCount: 0
    }
  } finally {
    importing.value = false
  }
}

// 模拟导入过程
const simulateImportProcess = () => {
  return new Promise((resolve) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        // 模拟导入结果
        const successCount = Math.floor(Math.random() * 20) + 10
        const errorCount = Math.floor(Math.random() * 3)
        
        importResult.value = {
          success: true,
          message: `成功导入 ${successCount} 条资产数据，${errorCount > 0 ? `${errorCount} 条数据导入失败` : '所有数据导入成功'}`,
          successCount,
          errorCount
        }
        
        // 模拟添加一些数据到表格中
        const newAssets = []
        for (let i = 0; i < Math.min(successCount, 3); i++) {
          const newAsset = {
            id: Math.max(...tableData.value.map(item => item.id)) + i + 1,
            assetName: `导入资产-${Date.now()}-${i + 1}`,
            area: '001',
            areaName: '月湖区',
            street: '001001',
            streetName: '童家街道',
            address: `导入地址-${Date.now()}-${i + 1}`,
            transferUnit: '市财政局',
            originalOwnershipUnit: '原国资委',
            buildingArea: Math.floor(Math.random() * 200) + 50,
            landArea: Math.floor(Math.random() * 150) + 30,
            propertyNumber: `导入证${Date.now()}-${i + 1}`,
            isTransferred: Math.random() > 0.5,
            usage: '出租',
            rentalMethod: Math.random() > 0.5 ? '整租' : '分租',
            rent: Math.floor(Math.random() * 50000) + 10000,
            value: Math.floor(Math.random() * 200) + 50,
            transferIssues: '无',
            allocationFile: '已上传'
          }
          newAssets.push(newAsset)
        }
        
        // 添加到表格数据中
        tableData.value.push(...newAssets)
        
        // 通知地图组件更新数据
        newAssets.forEach(asset => {
          handleAddSuccess(asset)
        })
        
        resolve()
      } else {
        importProgress.value = Math.floor(progress)
        
        if (progress < 30) {
          importStatus.value = '正在读取文件...'
        } else if (progress < 60) {
          importStatus.value = '正在验证数据格式...'
        } else if (progress < 90) {
          importStatus.value = '正在导入数据...'
        } else {
          importStatus.value = '正在完成导入...'
        }
      }
    }, 200)
  })
}

// 取消导入
const cancelImport = () => {
  if (importing.value) {
    ElMessageBox.confirm('导入正在进行中，确定要取消吗？', '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '继续导入',
      type: 'warning'
    }).then(() => {
      importing.value = false
      importDialogVisible.value = false
      ElMessage.info('已取消导入')
    }).catch(() => {
      // 用户选择继续导入，不做任何操作
    })
  } else {
    importDialogVisible.value = false
  }
}

// 完成导入
const finishImport = () => {
  importDialogVisible.value = false
  // 重置所有导入相关状态
  importing.value = false
  importProgress.value = 0
  importStatus.value = ''
  selectedFile.value = null
  importResult.value = null
  
  ElMessage.success('导入操作已完成')
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
  table-layout: auto;
}

/* 确保表格容器占满宽度 */
.table-card {
  width: 100%;
}

.table-card :deep(.el-card__body) {
  padding: 20px;
  overflow-x: auto;
}

:deep(.el-table__body-wrapper) {
  overflow-x: hidden;
}

:deep(.el-table__header-wrapper) {
  overflow-x: hidden;
}

:deep(.el-table .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 表格行高统一 */
:deep(.el-table .el-table__row) {
  height: 50px;
}

:deep(.el-table .el-table__header-wrapper th) {
  height: 45px;
}

/* 表格列对齐样式 */
:deep(.el-table th) {
  text-align: center;
  vertical-align: middle;
}

:deep(.el-table td) {
  text-align: center;
  vertical-align: middle;
}

:deep(.el-table th .cell) {
  text-align: center;
  padding: 0 10px;
  line-height: 1.5;
}

:deep(.el-table td .cell) {
  text-align: center;
  padding: 0 10px;
  line-height: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

/* 标签特殊处理 */
:deep(.el-table td .cell .el-tag) {
  flex-shrink: 0;
}

/* 操作列特殊处理 */
:deep(.el-table th:last-child .cell) {
  text-align: center;
}

:deep(.el-table td:last-child .cell) {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 40px;
}

/* 确保按钮在操作列中垂直居中 */
:deep(.el-table td:last-child .el-button) {
  margin: 2px;
}

/* 导入对话框样式 */
.import-content {
  padding: 10px 0;
}

.import-tips {
  margin-bottom: 20px;
}

.tips-list {
  margin: 10px 0 0 0;
  padding: 0 0 0 20px;
}

.tips-list li {
  margin: 8px 0;
  line-height: 1.6;
}

.file-info {
  margin-top: 20px;
}

.importing {
  text-align: center;
  padding: 40px 20px;
}

.progress-text {
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

.import-result {
  text-align: center;
  padding: 20px;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
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
