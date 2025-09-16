<template>
  <ContentWrap>
    <div class="process-form-container">
      <el-form
        :model="formData"
        label-width="100px"
        v-loading="detailLoading"
        :disabled="true"
      >
        <!-- 上部分：融资放款基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-row">
            <el-form-item label="融资租赁单编号" prop="leaseId">
              <el-input v-model="formData.leaseIdText" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="企业" prop="companyName">
              <el-input v-model="formData.companyName" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="放款申请编码" prop="disbursementCode">
              <el-input v-model="formData.disbursementCode" placeholder="无" readonly />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="formData.projectName" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="租赁模式" prop="leaseMode">
              <el-input v-model="formData.leaseModeText" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="申请人编码" prop="userId">
              <el-input v-model="formData.userId" placeholder="无" readonly :disabled="true" />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="本次金额" prop="thistimeAmount">
              <el-input v-model="formData.thistimeAmount" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="累计金额" prop="accruedAmount">
              <el-input v-model="formData.accruedAmount" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="" prop="">
              <div></div>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="收款账户名称" prop="beneficiaryName">
              <el-input v-model="formData.beneficiaryName" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="收款账户开户行" prop="beneficiaryBanklocation">
              <el-input v-model="formData.beneficiaryBanklocation" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="收款账号" prop="beneficiaryAccount">
              <el-input v-model="formData.beneficiaryAccount" placeholder="无" readonly />
            </el-form-item>
          </div>
        </div>

        <!-- 下部分：Tab组件 -->
        <div class="form-section">
          <el-tabs v-model="activeTab" class="form-tabs">
            <!-- 租赁项目方案 -->
            <el-tab-pane label="租赁项目方案" name="lease">
              <div class="form-section">
                <div class="form-row">
                  <el-form-item label="租赁本金" prop="leaseAmount">
                    <el-input v-model="formData.leaseAmount" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="承租租期" prop="leaseTerm">
                    <el-input v-model="formData.leaseTerm" placeholder="无" readonly />
                  </el-form-item>
                </div>
                <div class="form-row">
                  <el-form-item label="投放期数" prop="putNumbers">
                    <el-input v-model="formData.putNumbers" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="还租方式" prop="repaymentMode">
                    <el-input v-model="formData.repaymentModeText" placeholder="无" readonly />
                  </el-form-item>
                </div>
                <div class="form-row">
                  <el-form-item label="年租息率" prop="interestRate">
                    <el-input v-model="formData.interestRate" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="服务费比率" prop="serveRate">
                    <el-input v-model="formData.serveRate" placeholder="无" readonly />
                  </el-form-item>
                </div>
                <div class="form-row">
                  <el-form-item label="保证金" prop="depositAmount">
                    <el-input v-model="formData.depositAmount" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="" prop="">
                    <div></div>
                  </el-form-item>
                </div>
              </div>
            </el-tab-pane>

            <!-- 融资物基本情况 -->
            <el-tab-pane label="融资物基本情况" name="property">
              <div class="form-section">
                <div class="form-row">
                  <el-form-item label="主要租赁物名称" prop="propertyMain">
                    <el-input v-model="formData.propertyMain" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="" prop="">
                    <div></div>
                  </el-form-item>
                </div>
                <div class="form-row">
                  <el-form-item label="标的物原值" prop="propertyOriginalValue">
                    <el-input v-model="formData.propertyOriginalValue" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="标的物估值" prop="propertyAssessmentValue">
                    <el-input v-model="formData.propertyAssessmentValue" placeholder="无" readonly />
                  </el-form-item>
                  <el-form-item label="平均使用年限" prop="usefulLife">
                    <el-input v-model="formData.usefulLife" placeholder="无" readonly />
                  </el-form-item>
                </div>
              </div>
            </el-tab-pane>

            <!-- 附件上传 -->
            <el-tab-pane label="附件上传" name="upload">
              <div class="upload-content">
                <el-form-item label="附件文件" prop="fileList">
                  <BatchFileUpload ref="fileUploadRef" v-model:fileList="formData.fileList" mode="view" directory="business" />
                </el-form-item>
              </div>
            </el-tab-pane>

            <!-- 还款计划 -->
            <el-tab-pane label="还款计划" name="repayment">
              <div class="repayment-content">
                <div v-if="repaymentPlans.length > 0" class="mt-3">
                  <el-table
                    v-loading="repaymentLoading"
                    :data="repaymentPlans"
                    :stripe="true"
                    :show-overflow-tooltip="true"
                    border
                  >
                    <el-table-column
                      type="index"
                      label="期数"
                      align="center"
                      width="80"
                      :index="(index) => (queryParams.pageNo - 1) * queryParams.pageSize + index + 1"
                    />
                    <el-table-column prop="repaymentDate" label="还款时间" align="center" width="180px">
                      <template #default="{ row }">
                        {{ formatDate(row.repaymentDate, 'YYYY-MM-DD') }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="rent" label="租金" align="center">
                      <template #default="{ row }">
                        {{ formatCurrency(row.rent) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="interestRate" label="利率" align="center">
                      <template #default="{ row }">
                        {{ formatPercent(row.interestRate) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="capital" label="还款本金" align="center">
                      <template #default="{ row }">
                        {{ formatCurrency(row.capital) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="interest" label="还款利息" align="center">
                      <template #default="{ row }">
                        {{ formatCurrency(row.interest) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="temporaryFlag" label="状态" align="center" width="100">
                      <template #default="{ row }">
                        <el-tag :type="row.temporaryFlag ? 'warning' : 'success'" size="small">
                          {{ row.temporaryFlag ? '临时' : '正式' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                  <!-- 分页 -->
                  <Pagination
                    :total="repaymentTotal"
                    v-model:page="queryParams.pageNo"
                    v-model:limit="queryParams.pageSize"
                    @pagination="loadRepaymentPlans"
                  />
                </div>
                <div v-else-if="repaymentTotal === 0" class="text-center py-10">
                  <el-empty description="暂无还款计划数据" />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-form>
    </div>
  </ContentWrap>
</template>
<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import { FinanceDisbursementApi, type FinanceDisbursementVO } from 'src/api/business/finance/financedisbursement'
import { FinanceCompanyApi, type FinanceCompanyVO } from 'src/api/business/finance/financecompany'
import { FinanceLeaseApi } from 'src/api/business/finance/financelease'
import { FinanceRepaymentApi, type FinanceRepaymentVO } from 'src/api/business/finance/financerepayment'
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { Document } from '@element-plus/icons-vue'
import { BatchFileUpload } from '@/components/UploadFile'

defineOptions({ name: 'BpmOAFinanceDisbursementDetail' })

const { query } = useRoute() // 查询参数

const props = defineProps({
    id: propTypes.oneOfType([propTypes.number, propTypes.string]).def(undefined),
    previewMode: propTypes.bool.def(false), // 是否为预览模式
    readonly: propTypes.bool.def(false), // 是否为只读模式
    modelInfo: propTypes.object.def({}), // 模型信息
    businessKey: propTypes.string.def(undefined) // 业务键
})

const fileUploadRef = ref() // 文件上传组件 Ref


const detailLoading = ref(false) // 表单的加载中
const detailData = ref<FinanceDisbursementVO>({} as FinanceDisbursementVO) // 详情数据
const queryId = query.id as unknown as number // 从 URL 传递过来的 id 编号
const activeTab = ref('lease') // 当前激活的tab
const companyList = ref<FinanceCompanyVO[]>([]) // 企业列表
const financeLeaseOptions = ref<any[]>([]) // 融资租赁选项

// 还款计划相关
const repaymentPlans = ref<FinanceRepaymentVO[]>([])
const repaymentLoading = ref(false)
const repaymentTotal = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  disbursementId: undefined as number | undefined
})

// 表单数据
const formData = ref({
  id: undefined,
  leaseId: undefined,
  leaseIdText: '',
  userId: '',
  companyId: undefined,
  companyName: '',
  disbursementCode: '',
  projectName: '',
  leaseMode: undefined,
  leaseModeText: '',
  propertyMain: '',
  propertyOriginalValue: '',
  propertyAssessmentValue: '',
  usefulLife: '',
  leaseAmount: '',
  leaseTerm: '',
  depositAmount: '',
  putNumbers: '',
  interestRate: '',
  serveRate: '',
  repaymentMode: undefined,
  repaymentModeText: '',
  thistimeAmount: '',
  accruedAmount: '',
  beneficiaryName: '',
  beneficiaryBanklocation: '',
  beneficiaryAccount: '',
  fileList: [] as string[], // 文件列表字段
  sequenceCode: '',
  status: undefined,
  processInstanceId: '',
  deptId: undefined
})

/** 格式化货币显示 */
const formatCurrency = (value: number | undefined) => {
  if (!value) return '0 元'
  return `${value.toLocaleString()} 元`
}

/** 格式化百分比显示 */
const formatPercent = (value: number | undefined) => {
  if (!value) return '0%'
  return `${value}%`
}

/** 获得租赁模式文本 */
const getLeaseModeText = (leaseMode: string) => {
  const dictOptions = getStrDictOptions(DICT_TYPE.LEASE_MODE)
  const option = dictOptions.find(item => item.value === leaseMode)
  return option?.label || '未知'
}

/** 获取还租方式文本 */
const getRepaymentModeText = (repaymentMode: number) => {
  switch (repaymentMode) {
    case 1:
      return '每月'
    case 2:
      return '每三个月'
    case 3:
      return '每半年'
    case 4:
      return '每年'
    default:
      return '未知'
  }
}

/** 获取状态文本 */
const getStatusText = (status: number) => {
    switch (status) {
        case 0:
            return '草稿'
        case 1:
            return '审批中'
        case 2:
            return '已通过'
        case 3:
            return '已拒绝'
        default:
            return '未知状态'
    }
}

/** 解析附件列表 */
const parseFileList = (fileData: any) => {
    if (!fileData) return []
    
    // 如果是字符串，尝试按逗号分割
    if (typeof fileData === 'string') {
        // 先尝试 JSON 解析
        try {
            return JSON.parse(fileData)
        } catch {
            // 如果 JSON 解析失败，尝试逗号分割
            return fileData.split(',').filter(id => id.trim() !== '')
        }
    }
    
    // 如果已经是数组，直接返回
    if (Array.isArray(fileData)) {
        return fileData
    }
    
    return []
}


/**
 * 加载融资放款数据
 */
const loadFinanceDisbursementData = async (businessKey: string) => {
  try {
    detailLoading.value = true

    // 从后端获取融资放款详细数据
    const response = await FinanceDisbursementApi.getFinanceDisbursement(businessKey as any)
    if (response) {
      // 更新表单数据
      Object.keys(response).forEach(key => {
        if (key in formData.value) {
          formData.value[key] = response[key]
        }
      })
      
      // 处理数值类型转换为字符串用于显示
      formData.value.propertyOriginalValue = response.propertyOriginalValue ? String(response.propertyOriginalValue) : ''
      formData.value.propertyAssessmentValue = response.propertyAssessmentValue ? String(response.propertyAssessmentValue) : ''
      formData.value.usefulLife = response.usefulLife ? String(response.usefulLife) : ''
      formData.value.leaseAmount = response.leaseAmount ? String(response.leaseAmount) : ''
      formData.value.leaseTerm = response.leaseTerm ? String(response.leaseTerm) : ''
      formData.value.depositAmount = response.depositAmount ? String(response.depositAmount) : ''
      formData.value.putNumbers = response.putNumbers ? String(response.putNumbers) : ''
      formData.value.interestRate = response.interestRate ? String(response.interestRate) : ''
      formData.value.serveRate = response.serveRate ? String(response.serveRate) : ''
      formData.value.thistimeAmount = response.thistimeAmount ? String(response.thistimeAmount) : ''
      formData.value.accruedAmount = response.accruedAmount ? String(response.accruedAmount) : ''
      formData.value.userId = response.userId ? String(response.userId) : ''
      
      // 处理文件列表
      const processedFileList = response.fileList ? (typeof response.fileList === 'string' ? response.fileList.split(',').filter(id => id.trim() !== '') : response.fileList) : []
      formData.value.fileList = processedFileList
      
      // 处理文本字段
      formData.value.leaseModeText = getLeaseModeText(response.leaseMode)
      formData.value.repaymentModeText = getRepaymentModeText(response.repaymentMode)
      
      // 加载企业信息和租赁单信息
      await loadCompanyData()
      await loadLeaseData()
      
      // 加载还款计划
      if (response.id) {
        queryParams.disbursementId = response.id
        await loadRepaymentPlans()
      }
    }
  } catch (error) {
    console.error('获取融资放款数据失败:', error)
  } finally {
    detailLoading.value = false
  }
}

/** 加载企业数据 */
const loadCompanyData = async () => {
  try {
    const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
    companyList.value = response
    
    // 找到对应的企业名称
    const company = companyList.value.find(c => c.id === formData.value.companyId)
    formData.value.companyName = company?.enterpriseName || ''
  } catch (error) {
    console.error('加载企业数据失败:', error)
  }
}

/** 加载租赁单数据 */
const loadLeaseData = async () => {
  try {
    const list = await FinanceLeaseApi.getFinanceLeaseListApproved()
    financeLeaseOptions.value = Array.isArray(list) ? list : []
    
    // 找到对应的租赁单编号
    const lease = financeLeaseOptions.value.find(l => l.id === formData.value.leaseId)
    formData.value.leaseIdText = lease?.leasedCode || lease?.name || String(formData.value.leaseId || '')
  } catch (error) {
    console.error('加载租赁单数据失败:', error)
  }
}

/** 加载还款计划 */
const loadRepaymentPlans = async () => {
  if (!queryParams.disbursementId) {
    return
  }

  repaymentLoading.value = true
  try {
    const data = await FinanceRepaymentApi.getFinanceRepaymentPage(queryParams)
    repaymentPlans.value = data.list || []
    repaymentTotal.value = data.total || 0
  } catch (error) {
    console.error('加载还款计划失败:', error)
  } finally {
    repaymentLoading.value = false
  }
}

/** 获得数据 */
const getInfo = async () => {
    // 优先使用 businessKey，再使用 modelInfo 中的 id
    let targetId = props.businessKey
    if (!targetId && props.modelInfo?.businessData?.id) {
        targetId = props.modelInfo.businessData.id
    }
    if (!targetId && props.modelInfo?.id) {
        targetId = props.modelInfo.id
    }
    if (!targetId && props.id) {
        targetId = props.id
    }
    if (!targetId && queryId) {
        targetId = queryId
    }
    
    if (!targetId) {
        console.error('没有找到有效的 ID 来加载数据')
        return
    }
    
    await loadFinanceDisbursementData(targetId as string)
}

defineExpose({ 
    open: getInfo
}) // 提供 open 方法，用于打开弹窗

/** 初始化 **/
onMounted(() => {
    getInfo()
})

// 监听 props 变化
watch(
  () => [props.modelInfo, props.businessKey],
  () => {
    getInfo()
  },
  { deep: true }
)
</script>
<style scoped>
/* 流程表单容器样式 */
.process-form-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

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

.upload-content,
.repayment-content {
  padding: 20px 0;
}

/* 还款计划表格样式 */
.repayment-content .el-table {
  margin-top: 10px;
}

.text-center {
  text-align: center;
}

.py-10 {
  padding-top: 40px;
  padding-bottom: 40px;
}

.no-data {
  text-align: center;
  padding: 40px 0;
}

/* 只读输入框样式优化 */
:deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  color: #495057;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 表格样式优化 */
:deep(.el-table) {
  margin-top: 10px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 600;
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
}

/* 空状态组件样式 */
:deep(.el-empty) {
  padding: 20px 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
