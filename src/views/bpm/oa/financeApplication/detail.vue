<template>
  <ContentWrap>
    <div class="process-form-container">
      <el-form
        :model="formData"
        label-width="100px"
        v-loading="detailLoading"
        :disabled="true"
      >
        <!-- 上部分：输入框以一行三列形式排列 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-row">
            <el-form-item label="企业名称" prop="companyName">
              <el-input v-model="formData.companyName" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="立项申请编码" prop="applicationCode">
              <el-input v-model="formData.applicationCode" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="标的名称" prop="leasedProperty">
              <el-input v-model="formData.leasedProperty" placeholder="无" readonly />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="标的数量" prop="leasedPropertyNum">
              <el-input v-model="formData.leasedPropertyNum" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="拟标的净值" prop="leasedPropertyValue">
              <el-input v-model="formData.leasedPropertyValue" placeholder="无" readonly >
                <template #append>元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="申请额度" prop="leaseAmount">
              <el-input v-model="formData.leaseAmount" placeholder="无" readonly >
                <template #append>元</template>
              </el-input>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="承租租期" prop="leaseTerm">
              <el-input v-model="formData.leaseTerm" placeholder="无" readonly >
                <template #append>月</template>
              </el-input>
            </el-form-item>
            <el-form-item label="申请人编码" prop="userId" >
              <el-input v-model="formData.userId" placeholder="无" readonly :disabled="true"/>
            </el-form-item>
            <el-form-item label="" prop="">
              <div></div>
            </el-form-item>
          </div>
        </div>

        <!-- 下部分：Tab组件 -->
        <div class="form-section">
          <el-tabs v-model="activeTab" class="form-tabs">
            <!-- 指标 tab -->
            <el-tab-pane label="指标" name="radio">
              <div class="radio-content">
                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">是否列为国家产业政策限制/淘汰的高能耗、高水耗、高污染企业：</span>
                    <el-tag :type="getBooleanTagType(formData.restrictedByPolicy)" size="small">
                      {{ getBooleanText(formData.restrictedByPolicy) }}
                    </el-tag>
                  </div>
                  <div class="radio-remark" v-if="formData.restrictedByPolicy === true && formData.restrictedByPolicyReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.restrictedByPolicyReason }}</span>
                  </div>
                </div>

                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">租赁物是否为行业先进技术设备：</span>
                    <el-tag :type="getBooleanTagType(formData.advancedTechEquip)" size="small">
                      {{ getBooleanText(formData.advancedTechEquip) }}
                    </el-tag>
                  </div>
                  <div class="radio-remark" v-if="formData.advancedTechEquip === true && formData.advancedTechEquipReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.advancedTechEquipReason }}</span>
                  </div>
                </div>

                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">租赁物是否为濒临淘汰或折旧严重的设备：</span>
                    <el-tag :type="getBooleanTagType(formData.obsoleteOrOverdep)" size="small">
                      {{ getBooleanText(formData.obsoleteOrOverdep) }}
                    </el-tag>
                  </div>
                  <div class="radio-remark" v-if="formData.obsoleteOrOverdep === true && formData.obsoleteOrOverdepReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.obsoleteOrOverdepReason }}</span>
                  </div>
                </div>

                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">是否涉嫌走私、偷逃税款或骗取出口退税：</span>
                    <el-tag :type="getBooleanTagType(formData.taxFraudRisk)" size="small">
                      {{ getBooleanText(formData.taxFraudRisk) }}
                    </el-tag>
                  </div>
                  <div class="radio-remark" v-if="formData.taxFraudRisk === true && formData.taxFraudRiskReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.taxFraudRiskReason }}</span>
                  </div>
                </div>

                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">企业（项目）立项、生产经营用地批文是否齐全;环评、能耗、安全消防是否达标：</span>
                    <el-tag :type="getBooleanTagType(formData.landPermitEhsOk)" size="small">
                      {{ getBooleanText(formData.landPermitEhsOk) }}
                    </el-tag>
                  </div>
                  <div class="radio-remark" v-if="formData.landPermitEhsOk === true && formData.landPermitEhsOkReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.landPermitEhsOkReason }}</span>
                  </div>
                </div>

                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">营业执照等证件是否经过当地年检：</span>
                    <el-tag :type="getBooleanTagType(formData.licenseAnnualOk)" size="small">
                      {{ getBooleanText(formData.licenseAnnualOk) }}
                    </el-tag>
                  </div>
                  <div class="radio-remark" v-if="formData.licenseAnnualOk === true && formData.licenseAnnualOkReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.licenseAnnualOkReason }}</span>
                  </div>
                </div>

                <div class="radio-row">
                  <div class="radio-item">
                    <span class="radio-label">申请人及其法定代表人是否有不良信用记录：</span>
                    <el-tag :type="getBooleanTagType(formData.badCreditRecord)" size="small">
                      {{ getBooleanText(formData.badCreditRecord) }}
                    </el-tag>
                  </div>
                  <div class="radio-remark" v-if="formData.badCreditRecord === true && formData.badCreditRecordReason">
                    <span class="remark-label">备注：</span>
                    <span class="remark-value">{{ formData.badCreditRecordReason }}</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 附件上传 tab -->
            <el-tab-pane label="附件上传" name="upload">
              <div class="upload-content">
              <el-form-item label="附件文件" prop="fileList">
                <BatchFileUpload  ref="fileUploadRef" v-model:fileList="formData.fileList" mode="view" directory="business" />
              </el-form-item>
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
import { FinanceApplicationApi, type FinanceApplicationVO } from 'src/api/business/finance/financeapplication'
import { FinanceCompanyApi, type FinanceCompanyVO } from 'src/api/business/finance/financecompany'
import { Document } from '@element-plus/icons-vue'
import { BatchFileUpload } from '@/components/UploadFile'

defineOptions({ name: 'BpmOAFinanceApplicationDetail' })

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
const detailData = ref<FinanceApplicationVO>({} as FinanceApplicationVO) // 详情数据
const queryId = query.id as unknown as number // 从 URL 传递过来的 id 编号
const fileList = ref<any[]>([]) // 文件列表
const activeTab = ref('radio') // 当前激活的tab
const companyList = ref<FinanceCompanyVO[]>([]) // 企业列表

// 表单数据
const formData = ref({
  id: undefined,
  userId: '',
  companyId: undefined,
  companyName: '',
  applicationCode: '',
  leasedProperty: '',
  leasedPropertyNum: '',
  leasedPropertyValue: '',
  leaseAmount: '',
  leaseTerm: '',
  restrictedByPolicy: undefined,
  restrictedByPolicyReason: '',
  advancedTechEquip: undefined,
  advancedTechEquipReason: '',
  obsoleteOrOverdep: undefined,
  obsoleteOrOverdepReason: '',
  taxFraudRisk: undefined,
  taxFraudRiskReason: '',
  landPermitEhsOk: undefined,
  landPermitEhsOkReason: '',
  licenseAnnualOk: undefined,
  licenseAnnualOkReason: '',
  badCreditRecord: undefined,
  badCreditRecordReason: '',
  fileList: [] as string[], // 文件列表字段
  sequenceCode: '',
  status: undefined,
  processInstanceId: '',
  deptId: undefined
})

/** 获取布尔值文本 */
const getBooleanText = (value: boolean | undefined) => {
    if (value === true) return '是'
    if (value === false) return '否'
    return '未设置'
}

/** 获取布尔值标签类型 */
const getBooleanTagType = (value: boolean | undefined) => {
    if (value === true) return 'success'
    if (value === false) return 'danger'
    return 'info'
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
 * 加载融资申请数据
 */
const loadFinanceApplicationData = async (businessKey: string) => {
  try {
    detailLoading.value = true

    // 从后端获取融资申请详细数据
    const response = await FinanceApplicationApi.getFinanceApplication(businessKey as any)
    if (response) {
      // 更新表单数据
      Object.keys(response).forEach(key => {
        if (key in formData.value) {
          formData.value[key] = response[key]
        }
      })
      
      // 处理数值类型转换为字符串用于显示
      formData.value.leasedPropertyNum = response.leasedPropertyNum ? String(response.leasedPropertyNum) : ''
      formData.value.leasedPropertyValue = response.leasedPropertyValue ? String(response.leasedPropertyValue) : ''
      formData.value.leaseAmount = response.leaseAmount ? String(response.leaseAmount) : ''
      formData.value.leaseTerm = response.leaseTerm ? String(response.leaseTerm) : ''
      formData.value.userId = response.userId ? String(response.userId) : ''
      
      // 处理文件列表
      const processedFileList = response.fileList ? (typeof response.fileList === 'string' ? response.fileList.split(',').filter(id => id.trim() !== '') : response.fileList) : []
      formData.value.fileList = processedFileList
      
      // 加载企业信息
      await loadCompanyData()
    }
  } catch (error) {
    console.error('获取融资申请数据失败:', error)
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
    
    await loadFinanceApplicationData(targetId as string)
}

defineExpose({ 
    open: getInfo
}) // 提供 open 方法，用于打开弹窗

/** 初始化 **/
onMounted(() => {
    getInfo()
})
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

.radio-content,
.upload-content {
  padding: 20px 0;
}

/* 指标项目样式 */
.radio-row {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.radio-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.radio-label {
  flex: 1;
  font-weight: 500;
  color: #495057;
  margin-right: 15px;
  line-height: 1.4;
}

.radio-remark {
  display: flex;
  align-items: flex-start;
  padding-left: 20px;
  margin-top: 10px;
}

.remark-label {
  font-weight: 500;
  color: #6c757d;
  margin-right: 8px;
  white-space: nowrap;
}

.remark-value {
  color: #495057;
  line-height: 1.4;
  word-break: break-all;
}

.no-data {
  text-align: center;
  padding: 40px 0;
}

/* 文件列表样式 */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item .el-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  width: fit-content;
}

.no-files {
  padding: 20px 0;
  text-align: center;
}

.no-file-text {
  color: #909399;
  font-style: italic;
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
</style>
