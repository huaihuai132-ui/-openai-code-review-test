<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-form-item label="融资租赁单编号" prop="leaseId">
        <el-input v-model="formData.leaseId" placeholder="请输入融资租赁单编号" />
      </el-form-item>
      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="formData.deviceName" placeholder="请输入设备名称" />
      </el-form-item>
      <el-form-item label="规格型号" prop="deviceSpecification">
        <el-input v-model="formData.deviceSpecification" placeholder="请输入规格型号" />
      </el-form-item>
      <el-form-item label="生产厂家" prop="deviceManufacturers">
        <el-input v-model="formData.deviceManufacturers" placeholder="请输入生产厂家" />
      </el-form-item>
      <el-form-item label="购买日期" prop="buyDate">
        <el-date-picker v-model="formData.buyDate" type="date" value-format="x" placeholder="选择购买日期" />
      </el-form-item>
      <el-form-item label="数量" prop="quantity">
        <el-input v-model="formData.quantity" placeholder="请输入数量" />
      </el-form-item>
      <el-form-item label="原值" prop="originalWorth">
        <el-input v-model="formData.originalWorth" placeholder="请输入原值" />
      </el-form-item>
      <el-form-item label="净值" prop="netWorth">
        <el-input v-model="formData.netWorth" placeholder="请输入净值" />
      </el-form-item>
      <el-form-item label="设备状态" prop="deviceStatus">
        <el-radio-group v-model="formData.deviceStatus">
          <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.DEVICE_STATUS)" :key="dict.value"
            :label="parseInt(dict.value)">
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { FinanceDeviceApi, FinanceDeviceVO } from '@/api/business/financedevice'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'

/** 融资租赁设备 表单 */
defineOptions({ name: 'FinanceDeviceForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  leaseId: undefined,
  deviceName: undefined,
  deviceSpecification: undefined,
  deviceManufacturers: undefined,
  buyDate: undefined,
  quantity: undefined,
  originalWorth: undefined,
  netWorth: undefined,
  deviceStatus: undefined,
  deptId: undefined,
})
const formRules = reactive({
  deviceName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
  deviceSpecification: [{ required: true, message: '规格型号不能为空', trigger: 'blur' }],
  deviceManufacturers: [{ required: true, message: '生产厂家不能为空', trigger: 'blur' }],
  buyDate: [{ required: true, message: '购买日期不能为空', trigger: 'blur' }],
  quantity: [{ required: true, message: '数量不能为空', trigger: 'blur' }],
  originalWorth: [{ required: true, message: '原值不能为空', trigger: 'blur' }],
  netWorth: [{ required: true, message: '净值不能为空', trigger: 'blur' }],
  deviceStatus: [{ required: true, message: '设备状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await FinanceDeviceApi.getFinanceDevice(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as FinanceDeviceVO
    if (formType.value === 'create') {
      await FinanceDeviceApi.createFinanceDevice(data)
      message.success(t('common.createSuccess'))
    } else {
      await FinanceDeviceApi.updateFinanceDevice(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    leaseId: undefined,
    deviceName: undefined,
    deviceSpecification: undefined,
    deviceManufacturers: undefined,
    buyDate: undefined,
    quantity: undefined,
    originalWorth: undefined,
    netWorth: undefined,
    deviceStatus: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
