<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" class="right-full-dia">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <div class="form-section">
        <div class="form-row">
          <el-form-item label="申请人" prop="userId">
            <el-input v-model="formData.userId" placeholder="请输入申请人" />
          </el-form-item>
          <el-form-item label="申请部门" prop="applyDept">
            <el-input v-model="formData.applyDept" placeholder="请输入申请部门" />
          </el-form-item>
          <el-form-item label="申请时间" prop="applicationTime">
            <el-date-picker
              v-model="formData.applicationTime"
              type="date"
              value-format="x"
              placeholder="选择申请时间"
            />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="供应商" prop="supplierId">
            <el-select v-model="formData.supplierId" placeholder="请选择供应商"
                       @change="handleSupplierChange">
              <el-option
                v-for="item in supplierList"
                :key="item.id"
                :label="item.supplierName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="" prop="">
            <div></div>
          </el-form-item>
          <el-form-item label="" prop="">
            <div></div>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="账户名称" prop="supplierAccountId">
            <el-select v-model="formData.supplierAccountId" placeholder="请选择供应商账户的账户"
                       @change="handleSupplierAccountChange">
              <el-option
                v-for="item in supplierAccountList"
                :key="item.id"
                :label="item.accountName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="账号" prop="supplierId">
            <el-input v-model="formData.accountNum" placeholder="请输入供应商账户的账号" />
          </el-form-item>
          <el-form-item label="开户行" prop="supplierAccountId">
            <el-input v-model="formData.accountBanklocation" placeholder="请输入供应商账户的开户行" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="采购单位" prop="companyId">
            <el-select v-model="formData.companyId" placeholder="请选择采购单位">
              <el-option
                v-for="item in companyList"
                :key="item.id"
                :label="item.enterpriseName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="资金来源" prop="fundSource">
            <el-input v-model="formData.fundSource" placeholder="请输入资金来源" />
          </el-form-item>
          <el-form-item label="" prop="">
            <div></div>
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item label="产品名称" prop="supplierId">
            <el-select v-model="formData.metalId" placeholder="请选择产品">
              <el-option
                v-for="item in materialsList"
                :key="item.id"
                :label="item.materialsName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="" prop="">
            <div></div>
          </el-form-item>
          <el-form-item label="" prop="">
            <div></div>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="数量" prop="metalWeight">
            <el-input v-model="formData.metalWeight" placeholder="请输入数量" />
          </el-form-item>
          <el-form-item label="单价" prop="metalPrice">
            <el-input v-model="formData.metalPrice" placeholder="请输入单价" />
          </el-form-item>
          <el-form-item label="总价" prop="repaymentAmount">
            <el-input v-model="formData.repaymentAmount" placeholder="请输入总价" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" placeholder="请输入备注" />
          </el-form-item>
        </div>
        <!-- 下部分：Tab组件 -->
        <div class="form-section">
          <el-tabs class="form-tabs">
            <!-- 附件上传 tab -->
            <el-tab-pane label="附件上传" name="upload">
              <div class="upload-content">
                <el-form-item label="附件文件" prop="fileList">
                  <BatchFileUpload
                    ref="fileUploadRef"
                    v-model:fileList="formData.fileList"
                    :mode="fileStatus"
                    directory="business"
                  />
                </el-form-item>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { SupplychainRepaymentApi, SupplychainRepaymentVO } from '@/api/business/supplychainrepayment'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/finance/financecompany";
import {SupplierVO} from "@/api/erp/purchase/supplier";
import {
  SupplychainSupplierAccountVO,
  SupplychainSupplierApi,
  SupplychainSupplierVO
} from "@/api/business/supplychainsupplier";
import {SupplychainMaterialsApi, SupplychainMaterialsVO} from "@/api/business/supplychainmaterials";

/** 供应链金融付款申请 表单 */
defineOptions({ name: 'SupplychainRepaymentForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  applyDept: undefined,
  companyId: undefined,
  supplierId: undefined,
  supplierAccountId: undefined,
  accountNum: undefined,
  accountBanklocation: undefined,
  applicationTime: undefined,
  fundSource: undefined,
  metalId: undefined,
  metalWeight: undefined,
  metalPrice: undefined,
  repaymentAmount: undefined,
  remark: undefined,
  filePath: undefined,
  status: undefined,
  processInstanceId: undefined,
  deptId: undefined,
})
const formRules = reactive({
  userId: [{ required: true, message: '申请人不能为空', trigger: 'blur' }],
  companyId: [{ required: true, message: '企业id不能为空', trigger: 'blur' }],
  supplierId: [{ required: true, message: '供应商id不能为空', trigger: 'blur' }],
  supplierAccountId: [{ required: true, message: '供应商账户id不能为空', trigger: 'blur' }],
  applicationTime: [{ required: true, message: '申请时间不能为空', trigger: 'blur' }],
  fundSource: [{ required: true, message: '资金来源不能为空', trigger: 'blur' }],
  metalId: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
  metalWeight: [{ required: true, message: '数量不能为空', trigger: 'blur' }],
  metalPrice: [{ required: true, message: '单价不能为空', trigger: 'blur' }],
  repaymentAmount: [{ required: true, message: '总价不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表
const materialsList = ref<SupplychainMaterialsVO[]>([])
const supplierList = ref<SupplychainSupplierVO[]>([]) // 供应商列表
const supplierAccountList = ref<SupplychainSupplierAccountVO[]>([]) // 供应商账户列表

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
      formData.value = await SupplychainRepaymentApi.getSupplychainRepayment(id)
    } finally {
      formLoading.value = false
    }
  }
  const response = await FinanceCompanyApi.getSupplychainCompany()
  companyList.value = response
  const supplierListResponse = await SupplychainSupplierApi.getSimpleSupplychainSupplierList()
  supplierList.value = supplierListResponse
  const materialsListResponse = await SupplychainMaterialsApi.getSimpleList()
  materialsList.value = materialsListResponse
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const handleSupplierChange = async (val: string) => {
  const supplierAccountListResponse = await SupplychainSupplierApi.getSupplychainSupplierAccountListBySupplierId(val)
  supplierAccountList.value = supplierAccountListResponse
}

const handleSupplierAccountChange = async (val: string) => {
  const supplierAccountListResponse = await SupplychainSupplierApi.getSupplychainSupplierAccount(val)
  formData.value.accountNum = supplierAccountListResponse.accountNum
  formData.value.accountBanklocation = supplierAccountListResponse.accountBanklocation
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as SupplychainRepaymentVO
    if (formType.value === 'create') {
      await SupplychainRepaymentApi.createSupplychainRepayment(data)
      message.success(t('common.createSuccess'))
    } else {
      await SupplychainRepaymentApi.updateSupplychainRepayment(data)
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
    applyDept: undefined,
    companyId: undefined,
    supplierId: undefined,
    supplierAccountId: undefined,
    applicationTime: undefined,
    fundSource: undefined,
    metalId: undefined,
    metalWeight: undefined,
    metalPrice: undefined,
    repaymentAmount: undefined,
    remark: undefined,
    filePath: undefined,
    status: undefined,
    processInstanceId: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
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

.equipment-content,
.upload-content {
  padding: 20px 0;
}

/* 设备列表样式 */
.device-list {
  margin-top: 10px;
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
