<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ContentWrap title="供应链金融付款申请">
        <el-form
          ref="formRef"
          v-loading="formLoading"
          :model="formData"
          :rules="formRules"
          label-width="120px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="申请人" prop="userId">
                <el-input v-model="userName" placeholder="请输入申请人" :disabled="true" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请部门" prop="applyDept">
                <el-input v-model="deptName" placeholder="请输入申请部门" :disabled="true" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
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
            </el-col>
            <el-col :span="12">
              <el-form-item label="账户名称" prop="supplierAccountId">
                <el-select
                  v-model="formData.supplierAccountId"
                  placeholder="请选择供应商账户"
                  @change="handleSupplierAccountChange"
                >
                  <el-option
                    v-for="item in supplierAccountList"
                    :key="item.id"
                    :label="item.accountName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="账号" prop="accountNum">
                <el-input
                  v-model="formData.accountNum"
                  placeholder="请选择账户以自动填充账号"
                  :disabled="true"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开户行" prop="accountBanklocation">
                <el-input
                  v-model="formData.accountBanklocation"
                  placeholder="请选择账户以自动填充开户行"
                  :disabled="true"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
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
            </el-col>
            <el-col :span="12">
              <el-form-item label="资金来源" prop="fundSource">
                <el-input v-model="formData.fundSource" placeholder="请输入资金来源" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
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
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请时间" prop="applicationTime">
                <el-date-picker
                  v-model="formData.applicationTime"
                  type="date"
                  value-format="x"
                  placeholder="选择申请时间"
                  :disabled="true"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="数量" prop="metalWeight">
                <el-input
                  v-model="formData.metalWeight"
                  placeholder="请输入数量"
                  @input="handleQuantityInput"
                  @blur="validateQuantity"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单价" prop="metalPrice">
                <el-input
                  v-model="formData.metalPrice"
                  placeholder="请输入单价"
                  @input="handlePriceInput"
                  @blur="validatePrice"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="总价" prop="repaymentAmount">
                <el-input
                  v-model="formattedTotalAmount"
                  placeholder="总价将自动计算"
                  :disabled="true"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" placeholder="请输入备注" />
          </el-form-item>

          <el-form-item label="附件文件" prop="fileList">
            <BatchFileUpload
              ref="fileUploadRef"
              v-model:fileList="formData.fileList"
              mode="create"
              directory="business"
              :max-files="5"
              :concurrent="2"
              :drag="true"
            />
          </el-form-item>

          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="submitForm">
              提交申请
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
    </el-col>

    <!-- 审批相关：流程信息 -->
    <el-col :span="8">
      <ContentWrap title="审批流程" :bodyStyle="{ padding: '0 20px 0' }">
        <ProcessInstanceTimeline
          ref="timelineRef"
          :activity-nodes="activityNodes"
          :show-status-icon="false"
          @select-user-confirm="selectUserConfirm"
        />
      </ContentWrap>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue'
import {useMessage} from '@/hooks/web/useMessage'
import {useTagsViewStore} from '@/store/modules/tagsView'
import {useRouter} from 'vue-router'
import {useUserStore} from '@/store/modules/user'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import {BatchFileUpload} from '@/components/UploadFile'
import {SupplychainRepaymentApi, SupplychainRepaymentVO} from '@/api/business/supplychainrepayment'
import {FinanceCompanyApi, FinanceCompanyVO} from '@/api/business/finance/financecompany'
import {
  SupplychainSupplierAccountVO,
  SupplychainSupplierApi,
  SupplychainSupplierVO
} from '@/api/business/supplychainsupplier'
import {SupplychainMaterialsApi, SupplychainMaterialsVO} from '@/api/business/supplychainmaterials'

// 审批相关：import
import * as DefinitionApi from '@/api/bpm/definition'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import {ApprovalNodeInfo} from '@/api/bpm/processInstance'
import {CandidateStrategy, NodeId} from '@/components/SimpleProcessDesignerV2/src/consts'

defineOptions({ name: 'BpmSupplychainRepaymentCreate' })

const message = useMessage() // 消息弹窗
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由
const userStore = useUserStore() // 用户信息

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formRef = ref() // 表单 Ref
const fileUploadRef = ref()

// 上传组件引用
const supplierLoading = ref(false) // 供应商加载状态

// 表单数据
const formData = ref({
  id: undefined,
  userId: undefined,
  applyDept: undefined,
  companyId: undefined,
  supplierId: undefined,
  supplierAccountId: undefined,
  accountNum: undefined,
  accountBanklocation: undefined,
  applicationTime: new Date().getTime(),
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
  fileList: [] as (number | string)[]
})

// 表单验证规则
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

// 数据列表
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表
const materialsList = ref<SupplychainMaterialsVO[]>([])
const supplierList = ref<SupplychainSupplierVO[]>([]) // 供应商列表
const filteredSupplierList = ref<SupplychainSupplierVO[]>([]) // 过滤后的供应商列表
const supplierAccountList = ref<SupplychainSupplierAccountVO[]>([]) // 供应商账户列表
const userList = ref<UserApi.UserVO[]>([]) // 用户列表
const deptList = ref<DeptApi.DeptVO[]>([]) // 部门列表

// 计算属性：显示用户名
const userName = computed(() => {
  const currentUser = userList.value.find(user => user.id === userStore.getUser.id)
  return currentUser ? currentUser.nickname : ''
})

// 计算属性：显示部门名称
const deptName = computed(() => {
  const currentDept = deptList.value.find(dept => dept.id === userStore.getUser.deptId)
  return currentDept ? currentDept.name : ''
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

/** 处理数量输入 */
const handleQuantityInput = (value: string) => {
  // 只允许输入整数
  const numericValue = value.replace(/[^0-9]/g, '')
  formData.value.metalWeight = numericValue
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

const handleSupplierChange = async (val: string) => {
  const supplierAccountListResponse = await SupplychainSupplierApi.getSupplychainSupplierAccountListBySupplierId(val)
  supplierAccountList.value = supplierAccountListResponse
}

const handleSupplierAccountChange = async (val: string) => {
  const supplierAccountListResponse = await SupplychainSupplierApi.getSupplychainSupplierAccount(val)
  formData.value.accountNum = supplierAccountListResponse.accountNum
  formData.value.accountBanklocation = supplierAccountListResponse.accountBanklocation
}

// 审批相关：变量
const processDefineKey = 'supplychain_repayment' // 流程定义 Key
const startUserSelectTasks = ref<any[]>([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref<Record<string, number[]>>({}) // 发起人选择审批人的数据
const tempStartUserSelectAssignees = ref<Record<string, number[]>>({}) // 历史发起人选择审批人的数据，用于每次表单变更时，临时保存
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 审批节点信息
const processDefinitionId = ref('')

/** 审批相关：获取审批详情 */
const getApprovalDetail = async () => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      activityId: NodeId.START_USER_NODE_ID,
      processVariablesStr: JSON.stringify({}) // 可根据实际需求添加变量
    })

    if (!data) {
      message.error('查询不到审批详情信息！')
      return
    }
    // 获取审批节点，显示 Timeline 的数据
    activityNodes.value = data.activityNodes

    // 获取发起人自选的任务
    startUserSelectTasks.value = data.activityNodes?.filter(
      (node: ApprovalNodeInfo) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy
    )
    // 恢复之前的选择审批人
    if (startUserSelectTasks.value?.length > 0) {
      for (const node of startUserSelectTasks.value) {
        if (
          tempStartUserSelectAssignees.value[node.id] &&
          tempStartUserSelectAssignees.value[node.id].length > 0
        ) {
          startUserSelectAssignees.value[node.id] = tempStartUserSelectAssignees.value[node.id]
        } else {
          startUserSelectAssignees.value[node.id] = []
        }
      }
    }
  } finally {
  }
}

/** 审批相关：选择发起人 */
const selectUserConfirm = (id: string, userList: any[]) => {
  startUserSelectAssignees.value[id] = userList?.map((item: any) => item.id)
}

/** 提交表单 */
const submitForm = async () => {
  // 1.1 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 1.2 审批相关：校验指定审批人
  if (startUserSelectTasks.value?.length > 0) {
    for (const userTask of startUserSelectTasks.value) {
      if (
        Array.isArray(startUserSelectAssignees.value[userTask.id]) &&
        startUserSelectAssignees.value[userTask.id].length === 0
      ) {
        return message.warning(`请选择${userTask.name}的审批人`)
      }
    }
  }

  // 2. 提交请求
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
      status: formData.value.status || -1,
      // 处理文件列表
      fileList: Array.isArray(formData.value.fileList) && formData.value.fileList.length > 0
        ? formData.value.fileList.join(',')
        : ''
    } as unknown as SupplychainRepaymentVO

    // 审批相关：设置指定审批人
    if (startUserSelectTasks.value?.length > 0) {
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }

    await SupplychainRepaymentApi.createSupplychainRepayment(data)
    message.success('发起成功')
    // 关闭当前 Tab
    delView(unref(currentRoute))
  } catch (error) {
    console.error('提交失败:', error)
    message.error('提交失败，请重试')
  } finally {
    formLoading.value = false
  }
}

/** 初始化数据 */
const initData = async () => {
  formLoading.value = true
  try {
    // 获取用户和部门列表
    const [users, depts] = await Promise.all([
      UserApi.getSimpleUserList(),
      DeptApi.getSimpleDeptList()
    ])
    userList.value = users
    deptList.value = depts

    // 设置默认值
    formData.value.userId = userStore.getUser.id
    formData.value.applyDept = userStore.getUser.deptId

    // 获取供应链金融合作企业列表
    const companyResponse = await FinanceCompanyApi.getSimpleFinanceCompanyList()
    companyList.value = companyResponse.filter(company =>
      company.supplyChainFinancePartner === true || company.supplyChainFinancePartner === '1'
    )

    // 获取材料列表
    materialsList.value = await SupplychainMaterialsApi.getSimpleList()
  } catch (error) {
    console.error('初始化数据失败:', error)
    message.error('初始化数据失败')
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(async () => {
  await initData()

  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )

  if (!processDefinitionDetail) {
    message.error('供应链金融付款申请的流程模型未配置，请检查！')
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

  // 审批相关：加载最新的审批详情，主要用于节点预测
  await getApprovalDetail()
})
</script>

<style scoped>
:deep(.el-card__header) {
  border-bottom: 1px solid var(--el-border-color);
  padding: 15px 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
