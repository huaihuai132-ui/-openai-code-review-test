<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" class="right-full-dia">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <!-- 上部分：输入框以一行三列形式排列 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <div class="form-row">
          <el-form-item label="融资租赁单编号" prop="leaseId">
            <el-select v-model="formData.leaseId" placeholder="请选择融资租赁单编号" filterable clearable>
              <el-option
                v-for="item in financeLeaseOptions"
                :key="item.id"
                :label="item.leasedCode || item.name || String(item.id)"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="企业" prop="companyId">
            <el-select v-model="formData.companyId" placeholder="请选择企业">
              <el-option
                v-for="item in companyList"
                :key="item.id"
                :label="item.enterpriseName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="放款申请编码" prop="disbursementCode">
            <el-input v-model="formData.disbursementCode" placeholder="请输入放款申请编码" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="formData.projectName" placeholder="请输入项目名称" />
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
          <el-form-item label="申请人编码" prop="userId">
            <el-input v-model="formData.userId" placeholder="请输入申请人编码" readonly :disabled="true"/>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="本次金额" prop="thistimeAmount">
            <el-input v-model="formData.thistimeAmount" placeholder="请输入本次金额" />
          </el-form-item>
          <el-form-item label="累计金额" prop="accruedAmount">
            <el-input v-model="formData.accruedAmount" placeholder="请输入累计金额" />
          </el-form-item>
          <el-form-item label="" prop="">
            <div></div>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="收款账户名称" prop="beneficiaryName">
            <el-input v-model="formData.beneficiaryName" placeholder="请输入收款单位账户名称" />
          </el-form-item>
          <el-form-item label="收款账户开户行" prop="beneficiaryBanklocation">
            <el-input v-model="formData.beneficiaryBanklocation" placeholder="请输入收款单位账开户行" />
          </el-form-item>
          <el-form-item label="收款账号" prop="beneficiaryAccount">
            <el-input v-model="formData.beneficiaryAccount" placeholder="请输入收款单位账号" />
          </el-form-item>
        </div>
      </div>
      <!-- 下部分：Tab组件 -->
      <div class="form-section">
        <el-tabs v-model="activeTab" class="form-tabs">
          <el-tab-pane label="租赁项目方案" name="lease">
            <div class="form-section">
              <div class="form-row">
                <el-form-item label="租赁本金" prop="leaseAmount">
                  <el-input v-model="formData.leaseAmount" placeholder="请输入租赁本金" />
                </el-form-item>
                <el-form-item label="承租租期" prop="leaseTerm">
                  <el-input v-model="formData.leaseTerm" placeholder="请输入承租租期" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="投放期数" prop="putNumbers">
                  <el-input v-model="formData.putNumbers" placeholder="请输入投放期数" />
                </el-form-item>
                <el-form-item label="还租方式" prop="repaymentMode">
                  <el-select v-model="formData.repaymentMode" placeholder="请选择还租方式">
                    <el-option label="每月" :value="1" />
                    <el-option label="每三个月" :value="2" />
                    <el-option label="每半年" :value="3" />
                    <el-option label="每年" :value="4" />
                  </el-select>
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="年租息率" prop="interestRate">
                  <el-input v-model="formData.interestRate" placeholder="请输入年租息率" />
                </el-form-item>
                <el-form-item label="服务费比率" prop="serveRate">
                  <el-input v-model="formData.serveRate" placeholder="请输入服务费比率" />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="保证金" prop="depositAmount">
                  <el-input v-model="formData.depositAmount" placeholder="请输入保证金" />
                </el-form-item>
                <el-form-item label="" prop="">
                  <div></div>
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="融资物基本情况" name="property">
            <div class="form-section">
              <div class="form-row">
                <el-form-item label="主要租赁物名称" prop="propertyMain">
                  <el-input v-model="formData.propertyMain" placeholder="请输入主要租赁物名称" />
                </el-form-item>
                <el-form-item label="" prop="">
                  <div></div>
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item label="标的物原值" prop="propertyOriginalValue">
                  <el-input v-model="formData.propertyOriginalValue" placeholder="请输入标的物原值" />
                </el-form-item>
                <el-form-item label="标的物估值" prop="propertyAssessmentValue">
                  <el-input v-model="formData.propertyAssessmentValue" placeholder="请输入标的物估值" />
                </el-form-item>
                <el-form-item label="平均使用年限" prop="usefulLife">
                  <el-input v-model="formData.usefulLife" placeholder="请输入平均使用年限" />
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>
          <!-- 附件上传 tab -->
          <el-tab-pane label="附件上传" name="upload">
            <div class="upload-content">
              <el-form-item label="附件文件" prop="fileList">
                <BatchFileUpload
                  ref="fileUploadRef"
                  v-model:fileList="formData.fileList"
                  :mode="getUploadMode()"
                  directory="business"
                />
              </el-form-item>
            </div>
          </el-tab-pane>
          <!-- 还款计划 tab -->
          <el-tab-pane label="还款计划" name="repayment">
            <RepaymentPlan 
              ref="repaymentPlanRef"
              :lease-amount="formData.leaseAmount"
              :lease-term="formData.leaseTerm"
              :interest-rate="formData.interestRate"
              :repayment-mode="formData.repaymentMode"
              :project-name="formData.projectName"
              :company-id="formData.companyId"
              :dept-id="formData.deptId"
              :disbursement-id="formData.id"
            />
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
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { FinanceDisbursementApi, FinanceDisbursementVO } from '@/api/business/financedisbursement'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/financecompany";
import RepaymentPlan from './components/RepaymentPlan.vue'
import { useUserStore } from '@/store/modules/user';
import { FinanceLeaseApi } from '@/api/business/financelease'

/** 融资租赁放款 表单 */
defineOptions({ name: 'FinanceDisbursementForm' })

const userStore = useUserStore()

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
  leaseId: undefined,
  userId: userStore.getUser?.id,
  companyId: undefined,
  disbursementCode: undefined,
  projectName: undefined,
  leaseMode: undefined,
  propertyMain: undefined,
  propertyOriginalValue: undefined,
  propertyAssessmentValue: undefined,
  usefulLife: undefined,
  leaseAmount: undefined,
  leaseTerm: undefined,
  depositAmount: undefined,
  putNumbers: undefined,
  interestRate: undefined,
  serveRate: undefined,
  repaymentMode: undefined,
  thistimeAmount: undefined,
  accruedAmount: undefined,
  beneficiaryName: undefined,
  beneficiaryBanklocation: undefined,
  beneficiaryAccount: undefined,
  fileList: [] as string[],
  sequenceCode: undefined,
  status: 1,
  processInstanceId: undefined,
  deptId: undefined,
})

const formRules = reactive({
  leaseId: [{ required: true, message: '融资租赁单编号不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '申请人的用户编号不能为空', trigger: 'blur' }],
  companyId: [{ required: true, message: '企业id不能为空', trigger: 'change' }],
  disbursementCode: [{ required: true, message: '放款申请编码不能为空', trigger: 'blur' }],
  projectName: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
  leaseMode: [{ required: true, message: '租赁模式不能为空', trigger: 'change' }],
  propertyMain: [{ required: true, message: '主要租赁物名称不能为空', trigger: 'blur' }],
  propertyOriginalValue: [{ required: true, message: '标的物原值不能为空', trigger: 'blur' }],
  propertyAssessmentValue: [{ required: true, message: '标的物估值不能为空', trigger: 'blur' }],
  usefulLife: [{ required: true, message: '平均使用年限不能为空', trigger: 'blur' }],
  leaseAmount: [{ required: true, message: '租赁本金不能为空', trigger: 'blur' }],
  leaseTerm: [{ required: true, message: '承租租期不能为空', trigger: 'blur' }],
  depositAmount: [{ required: true, message: '保证金不能为空', trigger: 'blur' }],
  putNumbers: [{ required: true, message: '投放期数不能为空', trigger: 'blur' }],
  interestRate: [{ required: true, message: '年租息率不能为空', trigger: 'blur' }],
  serveRate: [{ required: true, message: '服务费比率不能为空', trigger: 'blur' }],
  repaymentMode: [{ required: true, message: '还租方式不能为空', trigger: 'change' }],
  thistimeAmount: [{ required: true, message: '本次金额不能为空', trigger: 'blur' }],
  accruedAmount: [{ required: true, message: '累计金额不能为空', trigger: 'blur' }],
  beneficiaryName: [{ required: true, message: '收款单位账户名称不能为空', trigger: 'blur' }],
  beneficiaryBanklocation: [{ required: true, message: '收款单位账开户行不能为空', trigger: 'blur' }],
  beneficiaryAccount: [{ required: true, message: '收款单位账号不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '单据状态不能为空', trigger: 'blur' }],
})

const formRef = ref() // 表单 Ref
const activeTab = ref('lease') // 当前激活的tab
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表
const repaymentPlanRef = ref() // 还款计划组件ref
const financeLeaseOptions = ref<any[]>([])

// 加载已审批的融资租赁列表作为下拉选项
const loadFinanceLeaseOptions = async () => {
  try {
    const list = await FinanceLeaseApi.getFinanceLeaseListApproved()
    financeLeaseOptions.value = Array.isArray(list) ? list : []
  } catch (e) {
    financeLeaseOptions.value = []
  }
}

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
      const data = await FinanceDisbursementApi.getFinanceDisbursement(id)
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
  // 加载租赁单编号选项
  await loadFinanceLeaseOptions()
  
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
    } as unknown as FinanceDisbursementVO

    if (formType.value === 'create') {
      await FinanceDisbursementApi.createFinanceDisbursement(data)
      message.success(t('common.createSuccess'))
    } else {
      await FinanceDisbursementApi.updateFinanceDisbursement(data)
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
    userId: userStore.getUser?.id,
    companyId: undefined,
    disbursementCode: undefined,
    projectName: undefined,
    leaseMode: undefined,
    propertyMain: undefined,
    propertyOriginalValue: undefined,
    propertyAssessmentValue: undefined,
    usefulLife: undefined,
    leaseAmount: undefined,
    leaseTerm: undefined,
    depositAmount: undefined,
    putNumbers: undefined,
    interestRate: undefined,
    serveRate: undefined,
    repaymentMode: undefined,
    thistimeAmount: undefined,
    accruedAmount: undefined,
    beneficiaryName: undefined,
    beneficiaryBanklocation: undefined,
    beneficiaryAccount: undefined,
    fileList: [],
    sequenceCode: undefined,
    status: 1,
    processInstanceId: undefined,
    deptId: undefined,
  }
  // 重置还款计划
  repaymentPlanRef.value?.resetPlans()
  formRef.value?.resetFields()
}
</script>

<style scoped>
/* 表单区域样式 */
.form-section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 20px 0;
  padding: 0 0 10px 0;
  border-bottom: 2px solid #e4e7ed;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
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

/* Tab组件样式 */
.form-tabs {
  margin-top: 20px;
}

.tab-content,
.upload-content,
.repayment-content {
  padding: 20px 0;
}

/* 自定义对话框样式，占满除左侧导航栏以外的部分 */
:deep(.right-full-dia) {
  width: calc(100vw - 200px) !important;
  max-width: none !important;
  margin: 0 !important;
  left: 200px !important;
  top: 0 !important;
  height: 100vh !important;
  border-radius: 0 !important;
}

:deep(.right-full-dia .el-dialog__body) {
  height: calc(100vh - 120px) !important;
  overflow-y: auto;
  padding: 20px;
}

:deep(.right-full-dia .el-dialog__header) {
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.right-full-dia .el-dialog__footer) {
  padding: 0 20px 20px 20px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}
</style>
