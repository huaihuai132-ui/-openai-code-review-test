<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="融资租赁放款表编号" prop="disbursementId">
        <el-input v-model="formData.disbursementId" placeholder="请输入融资租赁放款表编号" />
      </el-form-item>
      <el-form-item label="企业id" prop="companyId">
        <el-input v-model="formData.companyId" placeholder="请输入企业id" />
      </el-form-item>
      <el-form-item label="还款时间" prop="repaymentDate">
        <el-date-picker
          v-model="formData.repaymentDate"
          type="date"
          value-format="x"
          placeholder="选择还款时间"
        />
      </el-form-item>
      <el-form-item label="租金" prop="rent">
        <el-input v-model="formData.rent" placeholder="请输入租金" />
      </el-form-item>
      <el-form-item label="利率" prop="interestRate">
        <el-input v-model="formData.interestRate" placeholder="请输入利率" />
      </el-form-item>
      <el-form-item label="还款本金" prop="capital">
        <el-date-picker
          v-model="formData.capital"
          type="date"
          value-format="x"
          placeholder="选择还款本金"
        />
      </el-form-item>
      <el-form-item label="还款利息" prop="interest">
        <el-date-picker
          v-model="formData.interest"
          type="date"
          value-format="x"
          placeholder="选择还款利息"
        />
      </el-form-item>
      <el-form-item label="还款状态" prop="repaymentStatus">
        <el-select v-model="formData.repaymentStatus" placeholder="请选择还款状态">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="还款凭证文件路径" prop="filePath">
        <el-input v-model="formData.filePath" placeholder="请输入还款凭证文件路径" />
      </el-form-item>
      <el-form-item label="部门id" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入部门id" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { FinanceRepaymentApi, FinanceRepaymentVO } from '@/api/business/financerepayment'

/** 融资租赁放款 表单 */
defineOptions({ name: 'FinanceRepaymentForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  disbursementId: undefined,
  companyId: undefined,
  repaymentDate: undefined,
  rent: undefined,
  interestRate: undefined,
  capital: undefined,
  interest: undefined,
  repaymentStatus: undefined,
  filePath: undefined,
  deptId: undefined,
})
const formRules = reactive({
  disbursementId: [{ required: true, message: '融资租赁放款表编号不能为空', trigger: 'blur' }],
  companyId: [{ required: true, message: '企业id不能为空', trigger: 'blur' }],
  repaymentDate: [{ required: true, message: '还款时间不能为空', trigger: 'blur' }],
  rent: [{ required: true, message: '租金不能为空', trigger: 'blur' }],
  interestRate: [{ required: true, message: '利率不能为空', trigger: 'blur' }],
  capital: [{ required: true, message: '还款本金不能为空', trigger: 'blur' }],
  interest: [{ required: true, message: '还款利息不能为空', trigger: 'blur' }],
  repaymentStatus: [{ required: true, message: '还款状态不能为空', trigger: 'change' }],
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
      formData.value = await FinanceRepaymentApi.getFinanceRepayment(id)
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
    const data = formData.value as unknown as FinanceRepaymentVO
    if (formType.value === 'create') {
      await FinanceRepaymentApi.createFinanceRepayment(data)
      message.success(t('common.createSuccess'))
    } else {
      await FinanceRepaymentApi.updateFinanceRepayment(data)
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
    disbursementId: undefined,
    companyId: undefined,
    repaymentDate: undefined,
    rent: undefined,
    interestRate: undefined,
    capital: undefined,
    interest: undefined,
    repaymentStatus: undefined,
    filePath: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>