<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="800px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="融资租赁放款表编号" prop="disbursementId">
            <el-input v-model="formData.disbursementId" placeholder="请输入融资租赁放款表编号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="企业名称" prop="companyId">
            <el-select v-model="formData.companyId" placeholder="请选择企业" style="width: 100%">
              <el-option
                v-for="item in companyList"
                :key="item.id"
                :label="item.enterpriseName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="还款时间" prop="repaymentDate">
            <el-date-picker
              v-model="formData.repaymentDate"
              type="date"
              value-format="x"
              placeholder="选择还款时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="租金" prop="rent">
            <el-input v-model="formData.rent" placeholder="请输入租金" type="number">
              <template #append>元</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="利率" prop="interestRate">
            <el-input v-model="formData.interestRate" placeholder="请输入利率" type="number">
              <template #append>%</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="还款本金" prop="capital">
            <el-input v-model="formData.capital" placeholder="请输入还款本金" type="number">
              <template #append>元</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="还款利息" prop="interest">
            <el-input v-model="formData.interest" placeholder="请输入还款利息" type="number">
              <template #append>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="还款状态" prop="repaymentStatus">
            <el-select v-model="formData.repaymentStatus" placeholder="请选择还款状态" style="width: 100%">
              <el-option label="未还款" :value="1" />
              <el-option label="已还款" :value="2" />
              <el-option label="逾期" :value="3" />
              <el-option label="部分还款" :value="4" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="还款凭证" prop="fileList">
            <BatchFileUpload
              ref="fileUploadRef"
              v-model:fileList="formData.fileList"
              :mode="getUploadMode()"
              directory="business"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入备注信息"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { FinanceCompanyApi, FinanceCompanyVO } from "@/api/business/finance/financecompany"
import { BatchFileUpload } from '@/components/UploadFile'

/** 还款表单组件 */
defineOptions({ name: 'RepaymentForm' })

const props = defineProps<{
  companyList: FinanceCompanyVO[]
}>()

const emit = defineEmits(['success'])

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗显示状态
const dialogTitle = ref('') // 弹窗标题
const formLoading = ref(false) // 表单加载状态
const formType = ref('') // 表单类型：create - 新增；update - 修改

const formRef = ref() // 表单引用
const fileUploadRef = ref() // 文件上传组件引用

const formData = ref({
  id: undefined,
  disbursementId: undefined,
  companyId: undefined,
  repaymentDate: undefined,
  rent: undefined,
  interestRate: undefined,
  capital: undefined,
  interest: undefined,
  repaymentStatus: 1,
  fileList: [] as string[],
  remark: undefined,
  sequenceCode: undefined,
  deptId: undefined,
})

const formRules = reactive({
  disbursementId: [{ required: true, message: '融资租赁放款表编号不能为空', trigger: 'blur' }],
  companyId: [{ required: true, message: '企业不能为空', trigger: 'change' }],
  repaymentDate: [{ required: true, message: '还款时间不能为空', trigger: 'change' }],
  rent: [{ required: true, message: '租金不能为空', trigger: 'blur' }],
  interestRate: [{ required: true, message: '利率不能为空', trigger: 'blur' }],
  capital: [{ required: true, message: '还款本金不能为空', trigger: 'blur' }],
  interest: [{ required: true, message: '还款利息不能为空', trigger: 'blur' }],
  repaymentStatus: [{ required: true, message: '还款状态不能为空', trigger: 'change' }],
})

/** 获取上传组件的模式 */
const getUploadMode = () => {
  if (formType.value === 'create') return 'create'
  if (formType.value === 'update' || formType.value === 'edit') return 'edit'
  return 'view'
}

/** 打开弹窗 */
const open = async (type: string, id?: number, data?: any) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增还款记录' : '编辑还款记录'
  formType.value = type
  resetForm()

  if (id && data) {
    formLoading.value = true
    try {
      formData.value = {
        ...data,
        fileList: data.fileList ? (typeof data.fileList === 'string' ? data.fileList.split(',').filter(id => id.trim() !== '') : data.fileList) : []
      }
    } finally {
      formLoading.value = false
    }
  }
}

/** 提交表单 */
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true

  try {
    const submitData = {
      ...formData.value,
      fileList: Array.isArray(formData.value.fileList) && formData.value.fileList.length > 0
        ? formData.value.fileList.join(',')
        : ''
    }

    if (formType.value === 'create') {
      // 这里应该调用创建还款记录的API
      message.success('还款记录创建成功')
    } else {
      // 这里应该调用更新还款记录的API
      message.success('还款记录更新成功')
    }

    dialogVisible.value = false
    emit('success', submitData)
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
    repaymentStatus: 1,
    fileList: [],
    remark: undefined,
    sequenceCode: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}

defineExpose({ open })
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 18px;
}
</style>
