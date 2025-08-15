<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="企业" prop="companyId">
        <el-input v-model="formData.companyId" placeholder="请输入企业id" />
      </el-form-item>
      <el-form-item label="租赁模式" prop="leaseMode">
        <el-select v-model="formData.leaseMode" placeholder="请选择租赁模式">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.LEASE_MODE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="承租时间" prop="leaseDate">
        <el-date-picker
          v-model="formData.leaseDate"
          type="date"
          value-format="x"
          placeholder="选择承租时间"
        />
      </el-form-item>
      <el-form-item label="租金" prop="rent">
        <el-input v-model="formData.rent" placeholder="请输入租金" />
      </el-form-item>
      <el-form-item label="利率" prop="interestRate">
        <el-input v-model="formData.interestRate" placeholder="请输入利率" />
      </el-form-item>
      <el-form-item label="租赁物" prop="leasedProperty">
        <el-input v-model="formData.leasedProperty" placeholder="请输入租赁物" />
      </el-form-item>
      <el-form-item label="担保方式" prop="lienMode">
        <el-select v-model="formData.lienMode" placeholder="请选择担保方式">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.LIEN_MODE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="附件" prop="filePath">
        <UploadFile v-model="formData.filePath" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { FinanceLeaseApi, FinanceLeaseVO } from '@/api/business/financelease'

/** 融资租赁 表单 */
defineOptions({ name: 'FinanceLeaseForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  companyId: undefined,
  leaseMode: undefined,
  leaseDate: undefined,
  rent: undefined,
  interestRate: undefined,
  leasedProperty: undefined,
  lienMode: undefined,
  status: undefined,
  filePath: undefined,
  processInstanceId: undefined,
  deptId: undefined,
})
const formRules = reactive({
  companyId: [{ required: true, message: '企业id不能为空', trigger: 'blur' }],
  leaseMode: [{ required: true, message: '租赁模式不能为空', trigger: 'change' }],
  leaseDate: [{ required: true, message: '承租时间不能为空', trigger: 'blur' }],
  rent: [{ required: true, message: '租金不能为空', trigger: 'blur' }],
  interestRate: [{ required: true, message: '利率不能为空', trigger: 'blur' }],
  leasedProperty: [{ required: true, message: '租赁物不能为空', trigger: 'blur' }],
  lienMode: [{ required: true, message: '担保方式不能为空', trigger: 'change' }]
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
      formData.value = await FinanceLeaseApi.getFinanceLease(id)
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
    const data = formData.value as unknown as FinanceLeaseVO
    if (formType.value === 'create') {
      await FinanceLeaseApi.createFinanceLease(data)
      message.success(t('common.createSuccess'))
    } else {
      await FinanceLeaseApi.updateFinanceLease(data)
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
    userId: undefined,
    companyId: undefined,
    leaseMode: undefined,
    leaseDate: undefined,
    rent: undefined,
    interestRate: undefined,
    leasedProperty: undefined,
    lienMode: undefined,
    status: undefined,
    filePath: undefined,
    processInstanceId: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
