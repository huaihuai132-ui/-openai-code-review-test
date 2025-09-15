<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" class="right-full-dia">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
    <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <div class="form-row">
      <el-form-item label="融资租赁放款表编号" prop="disbursementId">
        <el-input v-model="formData.disbursementId" placeholder="请输入融资租赁放款表编号" />
      </el-form-item>
      <el-form-item label="企业名称" prop="companyId">
        <el-select v-model="formData.companyId" placeholder="请选择企业">
          <el-option
            v-for="item in companyList"
            :key="item.id"
            :label="item.enterpriseName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="还款时间" prop="repaymentDate">
        <el-date-picker
          v-model="formData.repaymentDate"
          type="date"
          value-format="x"
          placeholder="选择还款时间"
        />
      </el-form-item>
    </div>
    <div class="form-row">
      <el-form-item label="租金" prop="rent">
        <el-input v-model="formData.rent" placeholder="请输入租金"  type="number" >
          <template #append>元</template>
        </el-input>
      </el-form-item>
      <el-form-item label="利率" prop="interestRate">
        <el-input v-model="formData.interestRate" placeholder="请输入利率"  type="number" >
          <template #append>%</template>
        </el-input>
      </el-form-item>
      <el-form-item label="还款本金" prop="capital">
        <el-input v-model="formData.capital" placeholder="请输入还款本金"  type="number" >
          <template #append>元</template>
        </el-input>
      </el-form-item>
      </div>
      <div class="form-row">
      <el-form-item label="还款利息" prop="interest">
        <el-input v-model="formData.interest" placeholder="请输入还款利息"  type="number" >
        <template #append>元</template>
      </el-input>
      </el-form-item>
      <el-form-item label="还款状态" prop="repaymentStatus">
        <el-select v-model="formData.repaymentStatus" placeholder="请选择还款状态">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.REPAYMENT_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="" prop="">
              <div></div>
          </el-form-item>
    </div>
  </div>
          <!-- 下部分：Tab组件 -->
          <div class="form-section">
            <el-tabs v-model="activeTab" class="form-tabs">
              <el-tab-pane label="还款凭证" name="fileList">
                <el-form-item label="还款凭证" prop="fileList">
                <BatchFileUpload
                  ref="fileUploadRef"
                  v-model:fileList="formData.fileList"
                  :mode="getUploadMode()"
                  directory="business"
                />
              </el-form-item>
              </el-tab-pane>
            </el-tabs>
          </div>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { FinanceRepaymentApi, FinanceRepaymentVO } from '@/api/business/finance/financerepayment'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/finance/financecompany";
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { BatchFileUpload } from '@/components/UploadFile'
const activeTab = ref('fileList') // 当前激活的tab

/** 融资租赁放款 表单 */
defineOptions({ name: 'FinanceRepaymentForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改

/** 获取上传组件的模式 */
const getUploadMode = () => {
  if (formType.value === 'create') return 'create'
  if (formType.value === 'update' || formType.value === 'edit') return 'edit'
  return 'view'
}
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
  fileList: [] as string[],
  sequenceCode: undefined,
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
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表

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
      const data = await FinanceRepaymentApi.getFinanceRepayment(id)
      formData.value = {
        ...data,
        fileList: data.fileList ? (typeof data.fileList === 'string' ? data.fileList.split(',').filter(id => id.trim() !== '') : data.fileList) : []
      }
    } finally {
      formLoading.value = false
    }
  }
  const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
  companyList.value = response
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
    const data = {
      ...formData.value,
      fileList: Array.isArray(formData.value.fileList) && formData.value.fileList.length > 0
        ? formData.value.fileList.join(',')
        : ''
    } as unknown as FinanceRepaymentVO

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
    fileList: [],
    sequenceCode: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
<style scoped>
/* 表单区域样式 */
.form-section {
  margin-bottom: 30px;
}
/* 一行三列布局 */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
}
.form-tabs {
  margin-top: 20px;
}

/* 统一输入类控件宽度为100% */
:deep(.el-form-item) .el-input,
:deep(.el-form-item) .el-select{
  width: 100%;
}

</style>
