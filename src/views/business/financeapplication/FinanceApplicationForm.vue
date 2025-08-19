<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" class="right-full-dia">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <!-- 上部分：输入框以一行三列形式排列 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <div class="form-row">
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
          <el-form-item label="立项申请编码" prop="applicationCode">
            <el-input v-model="formData.applicationCode" placeholder="请输入立项申请编码" />
          </el-form-item>
          <el-form-item label="标的名称" prop="leasedProperty">
            <el-input v-model="formData.leasedProperty" placeholder="请输入标的名称" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="标的数量" prop="leasedPropertyNum">
            <el-input v-model="formData.leasedPropertyNum" placeholder="请输入标的数量" />
          </el-form-item>
          <el-form-item label="拟标的净值" prop="leasedPropertyValue">
            <el-input v-model="formData.leasedPropertyValue" placeholder="请输入拟标的净值" />
          </el-form-item>
          <el-form-item label="申请额度" prop="leaseAmount">
            <el-input v-model="formData.leaseAmount" placeholder="请输入申请额度" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="承租租期" prop="leaseTerm">
            <el-input v-model="formData.leaseTerm" placeholder="请输入承租租期" />
          </el-form-item>
          <el-form-item label="" prop="">
            <div></div>
          </el-form-item>
          <el-form-item label="" prop="">
            <div></div>
          </el-form-item>
        </div>
      </div>

      <!-- 下部分：Tab组件 -->
      <div class="form-section">
        <el-tabs v-model="activeTab" class="form-tabs">
                    <el-tab-pane label="指标" name="radio">
            <div class="radio-content">
              <div class="radio-row">
                <el-form-item label="是否列为国家产业政策限制/淘汰的高能耗、高水耗、高污染企业" prop="restrictedByPolicy" label-width="388px">
                  <el-radio-group v-model="formData.restrictedByPolicy">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="是否列为国家产业政策限制/淘汰的高能耗、高水耗、高污染企业备注" prop="restrictedByPolicyReason">
                  <el-input v-model="formData.restrictedByPolicyReason" placeholder="请输入是否列为国家产业政策限制/淘汰的高能耗、高水耗、高污染企业备注" />
                </el-form-item>
                <el-form-item label="租赁物是否为行业先进技术设备" prop="advancedTechEquip" label-width="388px">
                  <el-radio-group v-model="formData.advancedTechEquip">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
              <el-form-item label="租赁物是否为行业先进技术设备备注" prop="advancedTechEquipReason">
                <el-input v-model="formData.advancedTechEquipReason" placeholder="请输入租赁物是否为行业先进技术设备备注" />
              </el-form-item>
              <div class="radio-row">
                <el-form-item label="租赁物是否为濒临淘汰或折旧严重的设备" prop="obsoleteOrOverdep" label-width="388px">
                  <el-radio-group v-model="formData.obsoleteOrOverdep">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="租赁物是否为濒临淘汰或折旧严重的设备备注" prop="obsoleteOrOverdepReason">
                  <el-input v-model="formData.obsoleteOrOverdepReason" placeholder="请输入租赁物是否为濒临淘汰或折旧严重的设备备注" />
                </el-form-item>
                <el-form-item label="是否涉嫌走私、偷逃税款或骗取出口退税" prop="taxFraudRisk" label-width="388px">
                  <el-radio-group v-model="formData.taxFraudRisk">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="是否涉嫌走私、偷逃税款或骗取出口退税备注" prop="taxFraudRiskReason">
                  <el-input v-model="formData.taxFraudRiskReason" placeholder="请输入是否涉嫌走私、偷逃税款或骗取出口退税备注" />
                </el-form-item>
              </div>
              <div class="radio-row">
                <el-form-item label="企业（项目）立项、生产经营用地批文是否齐全;环评、能耗、安全消防是否达标" prop="landPermitEhsOk" label-width="388px">
                  <el-radio-group v-model="formData.landPermitEhsOk">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="企业（项目）立项、生产经营用地批文是否齐全;环评、能耗、安全消防是否达标备注" prop="landPermitEhsOkReason">
                  <el-input v-model="formData.landPermitEhsOkReason" placeholder="请输入企业（项目）立项、生产经营用地批文是否齐全;环评、能耗、安全消防是否达标备注" />
                </el-form-item>
              </div>
              <div class="radio-row">
                <el-form-item label="营业执照等证件是否经过当地年检" prop="licenseAnnualOk" label-width="388px">
                  <el-radio-group v-model="formData.licenseAnnualOk">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="营业执照等证件是否经过当地年检备注" prop="licenseAnnualOkReason">
                  <el-input v-model="formData.licenseAnnualOkReason" placeholder="请输入营业执照等证件是否经过当地年检备注" />
                </el-form-item>
                <el-form-item label="申请人及其法定代表人是否有不良信用记录" prop="badCreditRecord" label-width="388px">
                  <el-radio-group v-model="formData.badCreditRecord">
                    <el-radio
                      v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
                      :key="String(dict.value)"
                      :label="dict.value"
                    >
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="申请人及其法定代表人是否有不良信用记录备注" prop="badCreditRecordReason">
                  <el-input v-model="formData.badCreditRecordReason" placeholder="请输入申请人及其法定代表人是否有不良信用记录备注" />
                </el-form-item>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="附件上传" name="upload">
            <div class="upload-content">
              <el-form-item label="文件路径" prop="filePath">
                <UploadFile
                  v-model="formData.filePath"
                  :limit="10"
                  file-type="jpg,png,pdf,doc,docx"
                  :file-size="10"
                  :drag="true"
                  directory="uploads"
                />
              </el-form-item>
            </div>
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
import { getBoolDictOptions, DICT_TYPE } from '@/utils/dict'
import { FinanceApplicationApi, FinanceApplicationVO } from '@/api/business/financeapplication'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/financecompany";
import { UploadFile } from '@/components/UploadFile'

/** 融资租赁立项 表单 */
defineOptions({ name: 'FinanceApplicationForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  applicationCode: undefined,
  userId: undefined,
  companyId: undefined,
  leasedProperty: undefined,
  leasedPropertyNum: undefined,
  leasedPropertyValue: undefined,
  leaseAmount: undefined,
  leaseTerm: undefined,
  restrictedByPolicy: undefined,
  advancedTechEquip: undefined,
  obsoleteOrOverdep: undefined,
  taxFraudRisk: undefined,
  landPermitEhsOk: undefined,
  ehsCompliance: undefined,
  licenseAnnualOk: undefined,
  badCreditRecord: undefined,
  filePath: undefined,
  status: undefined,
  processInstanceId: undefined,
  deptId: undefined,
})
const formRules = reactive({
  userId: [{ required: true, message: '申请人的用户编号不能为空', trigger: 'blur' }],
  companyId: [{ required: true, message: '企业id不能为空', trigger: 'change' }],
  leasedProperty: [{ required: true, message: '标的名称不能为空', trigger: 'blur' }],
  leasedPropertyNum: [{ required: true, message: '标的数量不能为空', trigger: 'blur' }],
  leasedPropertyValue: [{ required: true, message: '拟标的净值不能为空', trigger: 'blur' }],
  leaseAmount: [{ required: true, message: '申请额度不能为空', trigger: 'blur' }],
  leaseTerm: [{ required: true, message: '承租租期不能为空', trigger: 'blur' }],
  restrictedByPolicy: [{ required: true, message: '是否列为国家产业政策限制/淘汰的高能耗、高水耗、高污染企业不能为空', trigger: 'blur' }],
  advancedTechEquip: [{ required: true, message: '租赁物是否为行业先进技术设备不能为空', trigger: 'blur' }],
  obsoleteOrOverdep: [{ required: true, message: '租赁物是否为濒临淘汰或折旧严重的设备不能为空', trigger: 'blur' }],
  taxFraudRisk: [{ required: true, message: '是否涉嫌走私、偷逃税款或骗取出口退税不能为空', trigger: 'blur' }],
  landPermitEhsOk: [{ required: true, message: '企业（项目）立项、生产经营用地批文是否齐全不能为空', trigger: 'blur' }],
  ehsCompliance: [{ required: true, message: '环评、能耗、安全消防是否达标不能为空', trigger: 'blur' }],
  licenseAnnualOk: [{ required: true, message: '营业执照等证件是否经过当地年检不能为空', trigger: 'blur' }],
  badCreditRecord: [{ required: true, message: '申请人及其法定代表人是否有不良信用记录不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '单据状态不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表
const activeTab = ref('radio') // 当前激活的tab


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
      formData.value = await FinanceApplicationApi.getFinanceApplication(id)
    } finally {
      formLoading.value = false
    }
  }
  const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
  companyList.value = response.data
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
    const data = formData.value as unknown as FinanceApplicationVO
    if (formType.value === 'create') {
      await FinanceApplicationApi.createFinanceApplication(data)
      message.success(t('common.createSuccess'))
    } else {
      await FinanceApplicationApi.updateFinanceApplication(data)
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
    applicationCode: undefined,
    userId: undefined,
    companyId: undefined,
    leasedProperty: undefined,
    leasedPropertyNum: undefined,
    leasedPropertyValue: undefined,
    leaseAmount: undefined,
    leaseTerm: undefined,
    restrictedByPolicy: undefined,
    advancedTechEquip: undefined,
    obsoleteOrOverdep: undefined,
    taxFraudRisk: undefined,
    landPermitEhsOk: undefined,
    ehsCompliance: undefined,
    licenseAnnualOk: undefined,
    badCreditRecord: undefined,
    filePath: undefined,
    status: undefined,
    processInstanceId: undefined,
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

/* 单选部分一行两列布局 */
.radio-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.radio-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
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
