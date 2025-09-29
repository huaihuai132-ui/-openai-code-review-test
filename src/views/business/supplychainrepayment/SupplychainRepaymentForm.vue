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
          <el-form-item label="经办人" prop="userId">
            <el-input v-model="userName" placeholder="请输入经办人" :disabled="formType === 'create'" />
          </el-form-item>
          <el-form-item label="申请部门" prop="applyDept">
            <el-input v-model="deptName" placeholder="请输入申请部门" :disabled="formType === 'create'" />
          </el-form-item>
          <el-form-item label="申请时间" prop="applicationTime">
            <el-date-picker
              v-model="formData.applicationTime"
              type="date"
              value-format="x"
              placeholder="选择申请时间"
              :disabled="formType === 'create'"
            />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="供应商" prop="supplierId">
            <el-select 
              v-model="formData.supplierId" 
              placeholder="请选择供应商"
              filterable
              remote
              :remote-method="fetchSuppliers"
              :loading="supplierLoading"
              @change="handleSupplierChange"
              @focus="fetchSuppliers('')"
            >
              <el-option
                v-for="item in filteredSupplierList"
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
          <el-form-item label="账号" prop="accountNum">
            <el-input v-model="formData.accountNum" placeholder="请选择账户以自动填充账号" :disabled="true" />
          </el-form-item>
          <el-form-item label="开户行" prop="accountBanklocation">
            <el-input v-model="formData.accountBanklocation" placeholder="请选择账户以自动填充开户行" :disabled="true" />
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
          <el-form-item label="产品名称" prop="metalId">
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
            <el-input 
              v-model="formData.metalWeight" 
              placeholder="请输入数量" 
              @input="handleQuantityInput"
              @blur="validateQuantity"
            />
          </el-form-item>
          <el-form-item label="单价" prop="metalPrice">
            <el-input 
              v-model="formData.metalPrice" 
              placeholder="请输入单价" 
              @input="handlePriceInput"
              @blur="validatePrice"
            />
          </el-form-item>
          <el-form-item label="总价" prop="repaymentAmount">
            <el-input v-model="formattedTotalAmount" placeholder="总价将自动计算" :disabled="true" />
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
      <el-button 
        v-if="formType === 'update' && formData.status === -1" 
        @click="handleSendApprove" 
        type="success" 
        :disabled="formLoading"
      >
        送 审
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import {SupplychainRepaymentApi, SupplychainRepaymentVO} from '@/api/business/supplychainrepayment'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/finance/financecompany";
import {
  SupplychainSupplierAccountVO,
  SupplychainSupplierApi,
  SupplychainSupplierVO
} from "@/api/business/supplychainsupplier";
import {SupplychainMaterialsApi, SupplychainMaterialsVO} from "@/api/business/supplychainmaterials";
import {useUserStore} from '@/store/modules/user'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'

/** 供应链金融付款申请 表单 */
defineOptions({ name: 'SupplychainRepaymentForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const userStore = useUserStore() // 用户信息

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
  deptId: undefined
})
const formRules = reactive({
  userId: [{ required: true, message: '申请人不能为空', trigger: 'blur' }],
  companyId: [{ required: true, message: '采购单位不能为空', trigger: 'blur' }],
  supplierId: [{ required: true, message: '供应商不能为空', trigger: 'blur' }],
  supplierAccountId: [{ required: true, message: '供应商账户不能为空', trigger: 'blur' }],
  applicationTime: [{ required: true, message: '申请时间不能为空', trigger: 'blur' }],
  fundSource: [{ required: true, message: '资金来源不能为空', trigger: 'blur' }],
  metalId: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
  metalWeight: [{ required: true, message: '数量不能为空', trigger: 'blur' }],
  metalPrice: [{ required: true, message: '单价不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表
const materialsList = ref<SupplychainMaterialsVO[]>([])
const supplierList = ref<SupplychainSupplierVO[]>([]) // 供应商列表
const filteredSupplierList = ref<SupplychainSupplierVO[]>([]) // 过滤后的供应商列表
const supplierLoading = ref(false) // 供应商加载状态
const supplierAccountList = ref<SupplychainSupplierAccountVO[]>([]) // 供应商账户列表
const userList = ref<UserApi.UserVO[]>([]) // 用户列表
const deptList = ref<DeptApi.DeptVO[]>([]) // 部门列表

// 计算属性：显示用户名
const userName = computed(() => {
  if (formType.value === 'create') {
    // 新增时显示当前用户名称
    const currentUser = userList.value.find(user => user.id === userStore.getUser.id)
    return currentUser ? currentUser.nickname : ''
  } else {
    // 修改时根据 formData.userId 查找用户名称
    const user = userList.value.find(user => user.id === formData.value.userId)
    return user ? user.nickname : ''
  }
})

// 计算属性：显示部门名称
const deptName = computed(() => {
  if (formType.value === 'create') {
    // 新增时显示当前用户部门名称
    const currentDept = deptList.value.find(dept => dept.id === userStore.getUser.deptId)
    return currentDept ? currentDept.name : ''
  } else {
    // 修改时根据 formData.applyDept 查找部门名称
    const dept = deptList.value.find(dept => dept.id === formData.value.applyDept)
    return dept ? dept.name : ''
  }
})

// 计算属性：总价
const totalAmount = computed(() => {
  const weight = parseFloat(formData.value.metalWeight) || 0
  const price = parseFloat(formData.value.metalPrice) || 0
  const total = weight * price
  
  // 返回数值，不带格式化
  return total
})

// 计算属性：格式化后的总价（带千位分隔符和单位）
const formattedTotalAmount = computed(() => {
  // 格式化为带千位分隔符的数字，保留两位小数，并添加"元"单位
  return totalAmount.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' 元'
})

/** 获取供应商列表（支持模糊搜索） */
const fetchSuppliers = async (query: string) => {
  supplierLoading.value = true
  try {
    const response = await SupplychainSupplierApi.getSimpleSupplychainSupplierList()
    supplierList.value = response
    // 根据查询关键字过滤供应商列表
    if (query) {
      filteredSupplierList.value = response.filter(supplier => 
        supplier.supplierName.toLowerCase().includes(query.toLowerCase())
      )
    } else {
      filteredSupplierList.value = response
    }
  } catch (error) {
    message.error('获取供应商列表失败')
    console.error('获取供应商列表失败:', error)
    supplierList.value = []
    filteredSupplierList.value = []
  } finally {
    supplierLoading.value = false
  }
}

/** 处理数量输入 */
const handleQuantityInput = (value: string) => {
  // 只允许输入整数
  const numericValue = value.replace(/[^0-9]/g, '')
  formData.value.metalWeight = numericValue
  calculateTotalAmount()
}

/** 验证数量输入 */
const validateQuantity = () => {
  const value = formData.value.metalWeight
  if (value && !/^\d+$/.test(value)) {
    message.warning('数量只能输入整数')
    formData.value.metalWeight = value.replace(/[^0-9]/g, '')
  }
}

/** 处理单价输入 */
const handlePriceInput = (value: string) => {
  // 允许输入整数或小数
  let numericValue = value.replace(/[^0-9.]*/g, '')
  
  // 确保小数点只能出现一次
  const parts = numericValue.split('.')
  if (parts.length > 2) {
    numericValue = parts[0] + '.' + parts.slice(1).join('')
  }
  
  // 限制小数点后最多两位
  if (parts.length === 2 && parts[1].length > 2) {
    numericValue = parts[0] + '.' + parts[1].substring(0, 2)
  }
  
  formData.value.metalPrice = numericValue
  calculateTotalAmount()
}

/** 验证单价输入 */
const validatePrice = () => {
  const value = formData.value.metalPrice
  if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
    message.warning('单价只能输入数字，小数点后最多两位')
    // 修正输入值
    const match = value.match(/^\d+(\.\d{0,2})?/)
    if (match) {
      formData.value.metalPrice = match[0]
    } else {
      formData.value.metalPrice = ''
    }
  }
}

/** 计算总价 */
const calculateTotalAmount = () => {
  // 触发计算，由于使用了计算属性，不需要手动赋值
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 获取用户和部门列表
  await Promise.all([
    UserApi.getSimpleUserList(),
    DeptApi.getSimpleDeptList()
  ]).then(([users, depts]) => {
    userList.value = users
    deptList.value = depts
  })
  
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await SupplychainRepaymentApi.getSupplychainRepayment(id)
      // 如果是编辑模式且已有供应商ID，则获取对应的供应商账户信息
      if (formData.value.supplierId) {
        await handleSupplierChange(formData.value.supplierId)
        // 如果已有供应商账户ID，则获取账户详细信息
        if (formData.value.supplierAccountId) {
          const supplierAccount = await SupplychainSupplierApi.getSupplychainSupplierAccount(
            formData.value.supplierAccountId.toString()
          )
          formData.value.accountNum = supplierAccount.accountNum
          formData.value.accountBanklocation = supplierAccount.accountBanklocation
        }
      }
    } finally {
      formLoading.value = false
    }
  } else {
    // 新增时，设置默认值
    formData.value.userId = userStore.getUser.id
    formData.value.applyDept = userStore.getUser.deptId
    formData.value.applicationTime = new Date().getTime()
  }
  // 获取供应链金融合作企业列表
  const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
  companyList.value = response.filter(company => 
    company.supplyChainFinancePartner === true || company.supplyChainFinancePartner === '1'
  )
  // 新增时不需要加载供应商列表，编辑时才需要
  if (id) {
    await fetchSuppliers('') // 获取供应商列表用于编辑模式
  }
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

/** 送审操作 */
const handleSendApprove = async () => {
  if (!formData.value.id) return
  
  try {
    // 送审的二次确认
    await message.confirm('确定要送审该申请吗？')
    // 发起送审
    await SupplychainRepaymentApi.sendApprove(formData.value.id)
    message.success('送审成功')
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } catch {}
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    // 将计算出的总价赋值给 formData
    formData.value.repaymentAmount = totalAmount.value
    
    // 获取选中的产品名称
    let metalName = ''
    if (formData.value.metalId) {
      const selectedMaterial = materialsList.value.find(item => item.id === formData.value.metalId)
      metalName = selectedMaterial ? selectedMaterial.materialsName : ''
    }
    
    // 设置默认状态为-1
    const data = {
      ...formData.value,
      metalName,
      status: formData.value.status || -1
    } as unknown as SupplychainRepaymentVO
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
