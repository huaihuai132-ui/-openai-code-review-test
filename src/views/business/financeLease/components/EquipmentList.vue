<template>
  <div class="equipment-list">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <Icon icon="ep:plus" class="mr-5px" /> 新增设备
      </el-button>
    </div>

    <!-- 设备列表表格 -->
    <el-table :data="equipmentList.filter(item => !item._deleted)" :stripe="true" :show-overflow-tooltip="true" v-loading="loading">
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="规格型号" align="center" prop="deviceSpecification" />
      <el-table-column label="生产厂家" align="center" prop="deviceManufacturers" />
      <el-table-column label="购买时间" align="center" prop="buyDate">
        <template #default="scope">
          {{ scope.row.buyDate ? formatDate(scope.row.buyDate) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" prop="quantity" />
      <el-table-column label="净值" align="center" prop="netWorth" />
      <el-table-column label="原值" align="center" prop="originalWorth" />
      <el-table-column label="设备状态" align="center" prop="deviceStatus">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.deviceStatus)">
            {{ getStatusText(scope.row.deviceStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 设备表单弹窗 -->
    <el-dialog
      :title="equipmentFormTitle"
      v-model="equipmentDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="equipmentFormRef"
        :model="equipmentForm"
        :rules="equipmentRules"
        label-width="100px"
      >
        <el-form-item label="设备名称" prop="deviceName">
          <el-select 
            v-model="equipmentForm.deviceName" 
            placeholder="请选择设备名称" 
            style="width: 100%"
            @change="handleDeviceChange"
          >
            <el-option
              v-for="item in deviceList"
              :key="item.id"
              :label="item.deviceName"
              :value="item.deviceName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规格型号" prop="deviceSpecification">
          <el-input v-model="equipmentForm.deviceSpecification" placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="生产厂家" prop="deviceManufacturers">
          <el-input v-model="equipmentForm.deviceManufacturers" placeholder="请输入生产厂家" />
        </el-form-item>
        <el-form-item label="购买时间" prop="buyDate">
          <el-date-picker
            v-model="equipmentForm.buyDate"
            type="date"
            value-format="x"
            placeholder="选择购买时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number
            v-model="equipmentForm.quantity"
            :min="1"
            :precision="0"
            placeholder="请输入数量"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="净值" prop="netWorth">
          <el-input-number
            v-model="equipmentForm.netWorth"
            :min="0"
            :precision="2"
            placeholder="请输入净值"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="原值" prop="originalWorth">
          <el-input-number
            v-model="equipmentForm.originalWorth"
            :min="0"
            :precision="2"
            placeholder="请输入原值"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="设备状态" prop="deviceStatus">
          <el-select v-model="equipmentForm.deviceStatus" placeholder="请选择设备状态" style="width: 100%">
            <el-option label="正常" :value="1" />
            <el-option label="维修中" :value="2" />
            <el-option label="报废" :value="3" />
            <el-option label="闲置" :value="4" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="equipmentDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatTime'
import { FinanceDeviceApi, FinanceDeviceVO } from '@/api/business/financedevice'

// 定义设备数据结构
interface Equipment {
  id?: number
  deviceName: string
  deviceSpecification: string
  deviceManufacturers: string
  buyDate: number | undefined
  quantity: number
  netWorth: number
  originalWorth: number
  deviceStatus: number
  _deleted?: boolean // 添加删除标记
}

// 定义组件属性
interface Props {
  modelValue?: Equipment[]
}

// 定义组件事件
interface Emits {
  (e: 'update:modelValue', value: Equipment[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
})

const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)
const deviceList = ref<FinanceDeviceVO[]>([]) // 设备列表
const equipmentList = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 设备表单相关
const equipmentDialogVisible = ref(false)
const equipmentFormTitle = ref('')
const equipmentFormRef = ref()
const submitLoading = ref(false)
const equipmentForm = ref<Equipment>({
  deviceName: '',
  deviceSpecification: '',
  deviceManufacturers: '',
  buyDate: undefined,
  quantity: 1,
  netWorth: 0,
  originalWorth: 0,
  deviceStatus: 1
})

// 表单验证规则
const equipmentRules = reactive({
  deviceName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
  deviceSpecification: [{ required: true, message: '规格型号不能为空', trigger: 'blur' }],
  deviceManufacturers: [{ required: true, message: '生产厂家不能为空', trigger: 'blur' }],
  buyDate: [{ required: true, message: '购买时间不能为空', trigger: 'change' }],
  quantity: [{ required: true, message: '数量不能为空', trigger: 'blur' }],
  netWorth: [{ required: true, message: '净值不能为空', trigger: 'blur' }],
  originalWorth: [{ required: true, message: '原值不能为空', trigger: 'blur' }],
  deviceStatus: [{ required: true, message: '设备状态不能为空', trigger: 'change' }]
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

// 获取设备列表
const getDeviceList = async () => {
  try {
    const data = await FinanceDeviceApi.getFinanceDevicePage({ pageSize: 100 }) // 获取所有设备
    deviceList.value = data.list
  } catch (error) {
    console.error('Error loading device list:', error)
    ElMessage.error('加载设备列表失败')
  }
}

// 设备选择变化处理
const handleDeviceChange = (deviceName: string) => {
  if (deviceName) {
    // 根据选择的设备名称找到对应的设备信息
    const selectedDevice = deviceList.value.find(item => item.deviceName === deviceName)
    if (selectedDevice) {
      // 自动填充其他字段
      equipmentForm.value.deviceSpecification = selectedDevice.deviceSpecification || ''
      equipmentForm.value.deviceManufacturers = selectedDevice.deviceManufacturers || ''
      equipmentForm.value.buyDate = selectedDevice.buyDate ? new Date(selectedDevice.buyDate).getTime() : undefined
      equipmentForm.value.quantity = selectedDevice.quantity || 1
      equipmentForm.value.netWorth = selectedDevice.netWorth || 0
      equipmentForm.value.originalWorth = selectedDevice.originalWorth || 0
      equipmentForm.value.deviceStatus = selectedDevice.deviceStatus || 1
    }
  }
}

// 新增设备
const handleAdd = () => {
  equipmentFormTitle.value = '新增设备'
  equipmentForm.value = {
    deviceName: '',
    deviceSpecification: '',
    deviceManufacturers: '',
    buyDate: undefined,
    quantity: 1,
    netWorth: 0,
    originalWorth: 0,
    deviceStatus: 1
  }
  equipmentDialogVisible.value = true
}

// 编辑设备
const handleEdit = (row: Equipment) => {
  equipmentFormTitle.value = '编辑设备'
  equipmentForm.value = { ...row }
  equipmentDialogVisible.value = true
}

// 删除设备
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个设备吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 打印当前设备列表和要删除的ID，帮助调试
    console.log('当前设备列表:', equipmentList.value)
    console.log('要删除的ID:', id, typeof id)
    
    // 检查是否是新增的设备（临时ID）
    const currentTime = Date.now()
    const oneHourAgo = currentTime - 60 * 60 * 1000
    const isTemporaryId = id && id > oneHourAgo && id <= currentTime
    
    if (isTemporaryId) {
      // 如果是临时ID（新增的设备），直接从列表中移除
      const newList = equipmentList.value.filter(item => {
        return item.id !== id && item.id !== String(id) && String(item.id) !== String(id)
      })
      emit('update:modelValue', [...newList])
    } else {
      // 如果是已存在的设备，标记为删除而不是直接移除
      const newList = equipmentList.value.map(item => {
        if (item.id === id || item.id === String(id) || String(item.id) === String(id)) {
          return { ...item, _deleted: true }
        }
        return item
      })
      emit('update:modelValue', [...newList])
    }
    
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除设备失败:', error)
    // 用户取消删除
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await equipmentFormRef.value.validate()
    submitLoading.value = true
    
    if (equipmentForm.value.id) {
      // 编辑模式
      const index = equipmentList.value.findIndex(item => item.id === equipmentForm.value.id)
      if (index !== -1) {
        equipmentList.value[index] = { ...equipmentForm.value }
      }
    } else {
      // 新增模式
      const newEquipment = {
        ...equipmentForm.value,
        id: Date.now() // 临时ID，实际项目中应该由后端生成
      }
      equipmentList.value.push(newEquipment)
    }
    
    equipmentDialogVisible.value = false
    ElMessage.success(equipmentForm.value.id ? '编辑成功' : '新增成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  getEquipmentList: () => equipmentList.value,
  setEquipmentList: (list: Equipment[]) => {
    equipmentList.value = list
  }
})

// 组件挂载时获取设备列表
onMounted(() => {
  getDeviceList()
})
</script>

<style scoped>
.equipment-list {
  padding: 20px 0;
}

.toolbar {
  margin-bottom: 20px;
}

.equipment-list .el-table {
  margin-bottom: 20px;
}
</style>
