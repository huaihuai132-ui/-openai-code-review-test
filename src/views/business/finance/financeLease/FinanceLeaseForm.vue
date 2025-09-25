<template>
  <!-- 流程表单模式 -->
  <div v-if="isProcessForm" class="process-form-container">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="readonly"
    >
      <!-- 上部分：输入框以一行三列形式排列 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <div class="form-row">
          <el-form-item label="立项编号" prop="applicationId">
            <el-select v-model="formData.applicationId" placeholder="请选择立项编号">
              <el-option
                v-for="item in applicationList"
                :key="item.id"
                :label="item.applicationCode"
                :value="item.id"
              />
            </el-select>
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
          <el-form-item label="项目申请编码" prop="leasedCode">
            <el-input v-model="formData.leasedCode" placeholder="请输入项目申请编码" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="标的名称" prop="leasedProperty">
            <el-input v-model="formData.leasedProperty" placeholder="请输入融资标的物名称" />
          </el-form-item>
          <el-form-item label="标的数量" prop="leasedPropertyNum">
            <el-input v-model="formData.leasedPropertyNum" placeholder="请输入融资标的物数量"  type="number"/>
          </el-form-item>
          <el-form-item label="标的净值" prop="leasedPropertyValue">
              <el-input
              v-model="formData.leasedPropertyValue"
              placeholder="请输入标的净值" 
              :formatter="(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            >
              <template #append>元</template>
            </el-input>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="租赁模式" prop="leaseMode">
            <el-select v-model="formData.leaseMode" placeholder="请选择租赁模式">
              <el-option label="融资租赁" value="1" />
              <el-option label="经营租赁" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="担保方式" prop="lienMode">
            <el-select v-model="formData.lienMode" placeholder="请选择担保方式">
              <el-option label="抵押担保" value="1" />
              <el-option label="质押担保" value="2" />
              <el-option label="保证担保" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="申请额度" prop="leaseAmount">      
              <el-input
              v-model="formData.leaseAmount" 
              placeholder="请输入申请额度" 
              :formatter="(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            >
              <template #append>元</template>
            </el-input>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="承租时间" prop="leaseDate">
            <el-date-picker
              v-model="formData.leaseDate"
              type="date"
              value-format="x"
              placeholder="选择承租时间"
            />
          </el-form-item>
          <el-form-item label="承租租期" prop="leaseTerm">
            <el-input v-model="formData.leaseTerm" placeholder="请输入承租租期"  type="number" >
              <template #append>月</template>
            </el-input>
          </el-form-item>
          <el-form-item label="利率" prop="interestRate">
            <el-input v-model="formData.interestRate" placeholder="请输入利率"  type="number" >
              <template #append>%</template>
            </el-input>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="申请人" prop="userId">
            <el-select v-model="formData.userId" readonly :disabled="true">
              <el-option
                v-for="user in userList"
                :key="user.id"
                :label="user.nickname"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </div>
      </div>

      <!-- 下部分：Tab组件 -->
      <div class="form-section">
        <el-tabs v-model="activeTab" class="form-tabs">
          <!-- 设备管理 tab -->
          <el-tab-pane label="设备" name="equipment">
            <div class="equipment-content">
              <EquipmentList v-model="formData.deviceList" />
            </div>
          </el-tab-pane>

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
    </el-form>
  </div>

  <!-- 弹窗模式 -->
  <Dialog v-else :title="dialogTitle" v-model="dialogVisible" class="right-full-dia">
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
          <el-form-item label="立项编号" prop="applicationId">
            <el-select v-model="formData.applicationId" placeholder="请选择立项编号"
                       @change="applicationIdChange">
              <el-option
                v-for="item in applicationList"
                :key="item.id"
                :label="item.applicationCode"
                :value="item.id"
              />
            </el-select>
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
          <el-form-item label="项目申请编码" prop="leasedCode">
            <el-input v-model="formData.leasedCode" placeholder="请输入项目申请编码" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="标的名称" prop="leasedProperty">
            <el-input v-model="formData.leasedProperty" placeholder="请输入融资标的物名称" />
          </el-form-item>
          <el-form-item label="标的数量" prop="leasedPropertyNum">
            <el-input v-model="formData.leasedPropertyNum" placeholder="请输入融资标的物数量"  type="number"/>
          </el-form-item>
          <el-form-item label="标的净值" prop="leasedPropertyValue">
              <el-input
              v-model="formData.leasedPropertyValue"
              placeholder="请输入拟标的净值" 
              :formatter="(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            >
              <template #append>元</template>
            </el-input>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="租赁模式" prop="leaseMode">
            <el-select v-model="formData.leaseMode" placeholder="请选择租赁模式">
              <el-option label="融资租赁" value="1" />
              <el-option label="经营租赁" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="担保方式" prop="lienMode">
            <el-select v-model="formData.lienMode" placeholder="请选择担保方式">
              <el-option label="抵押担保" value="1" />
              <el-option label="质押担保" value="2" />
              <el-option label="保证担保" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="申请额度" prop="leaseAmount">
            <el-input
              v-model="formData.leaseAmount" 
              placeholder="请输入申请额度" 
              :formatter="(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            >
              <template #append>元</template>
            </el-input>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="承租时间" prop="leaseDate">
            <el-date-picker
              v-model="formData.leaseDate"
              type="date"
              value-format="x"
              placeholder="选择承租时间"
            />
          </el-form-item>
          <el-form-item label="承租租期" prop="leaseTerm">
            <el-input v-model="formData.leaseTerm" placeholder="请输入承租租期"  type="number" >
              <template #append>月</template>
            </el-input>
          </el-form-item>
          <el-form-item label="利率" prop="interestRate">
            <el-input v-model="formData.interestRate" placeholder="请输入利率"  type="number" >
              <template #append>%</template>
            </el-input>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="申请人" prop="userId">
            <el-select v-model="formData.userId" readonly :disabled="true">
              <el-option
                v-for="user in userList"
                :key="user.id"
                :label="user.nickname"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="" prop=""/>
          <el-form-item label="" prop=""/>
        </div>
      </div>

      <!-- 下部分：Tab组件 -->
      <div class="form-section">
        <el-tabs v-model="activeTab" class="form-tabs">
          <!-- 设备管理 tab -->
          <el-tab-pane label="设备" name="equipment">
            <div class="equipment-content">
              <EquipmentList v-model="formData.deviceList" />
            </div>
          </el-tab-pane>

          <!-- 附件上传 tab -->
          <el-tab-pane label="附件上传" name="upload">
            <div class="upload-content">
              <el-form-item label="附件文件" prop="fileList">
                <BatchFileUpload
                  ref="fileUploadRef"
                  v-model:fileList="formData.fileList"
                  :mode="fileStatus"
                  :max-files="10"
                  directory="business"
                  :file-size="10"
                  tip="支持上传多个文件，每个文件不超过10MB"
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
import { FinanceLeaseApi, FinanceLeaseVO } from '@/api/business/finance/financelease'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/finance/financecompany";
import { BatchFileUpload } from '@/components/UploadFile'
import { useUserStore } from '@/store/modules/user'
import EquipmentList from './components/EquipmentList.vue'
import {
  FinanceApplicationApi,
  FinanceApplicationVO
} from "@/api/business/finance/financeapplication";
import * as UserApi from "@/api/system/user";

const userStore = useUserStore()
const userList = ref<UserApi.UserVO[]>([]) // 用户列表

/** 融资租赁 表单 */
defineOptions({ name: 'FinanceLeaseForm' })

// 定义组件属性
interface Props {
  // 流程表单相关属性
  processInstance?: any
  processDefinition?: any
  formVariables?: any
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const fileUploadRef = ref() // 文件上传组件 Ref
// 根据不同的使用场景设置文件上传状态
const fileStatus = computed(() => {
  if (isProcessForm.value) {
    // 流程表单模式，只读显示
    console.log("====view")
    return 'view'
  } else if (dialogVisible.value) {
    // 弹窗模式
    if (formType.value === 'create') {
      console.log("====create")
      return 'create'
    } else if (formType.value === 'update') {
      console.log("====update")
      return 'edit'
    } else {
      return 'view'
    }
  }
  return 'view'
})

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

// 判断是否为流程表单模式
const isProcessForm = computed(() => {
  return !!props.processInstance
})

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改



const formData = ref({
  id: undefined,
  leasedCode: undefined,
  applicationId: undefined,
  userId: undefined,
  companyId: undefined,
  leasedProperty: undefined,
  leasedPropertyNum: undefined,
  leasedPropertyValue: undefined,
  leaseMode: undefined,
  lienMode: undefined,
  leaseAmount: undefined,
  leaseDate: undefined,
  leaseTerm: undefined,
  interestRate: undefined,
  fileList: [] as string[],
  sequenceCode: undefined,
  deviceList: [],
  status: undefined,
  processInstanceId: undefined,
  deptId: undefined,
})

const formRules = reactive({
  companyId: [{ required: true, message: '企业id不能为空', trigger: 'change' }],
  leasedProperty: [{ required: true, message: '标的名称不能为空', trigger: 'blur' }],
  leasedPropertyNum: [{ required: true, message: '标的数量不能为空', trigger: 'blur' }],
  leasedPropertyValue: [{ required: true, message: '标的净值不能为空', trigger: 'blur' }],
  leaseAmount: [{ required: true, message: '申请额度不能为空', trigger: 'blur' }],
  leaseDate: [{ required: true, message: '承租时间不能为空', trigger: 'blur' }],
  leaseTerm: [{ required: true, message: '承租租期不能为空', trigger: 'blur' }],
  interestRate: [{ required: true, message: '利率不能为空', trigger: 'blur' }]
})

const formRef = ref() // 表单 Ref
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表
const applicationList = ref<FinanceApplicationVO[]>([]) // 融资租赁立项列表
const activeTab = ref('equipment') // 当前激活的tab

/**
 * 加载融资租赁数据
 */
const loadFinanceLeaseData = async (businessKey: string) => {
  try {
    console.log('开始加载融资租赁数据，业务键:', businessKey)
    formLoading.value = true

    // 从后端获取融资租赁详细数据
    const response = await FinanceLeaseApi.getFinanceLease(businessKey as any)
    if (response) {
      console.log('获取到的融资租赁数据:', response)

      // 更新表单数据
      Object.keys(response).forEach(key => {
        if (key in formData.value) {
          formData.value[key] = response[key]
        }
      })

      // 确保流程相关字段不被覆盖
      if (props.processInstance?.id) {
        formData.value.processInstanceId = props.processInstance.id as any
      }
      if (props.processInstance?.startUser?.id) {
        formData.value.userId = props.processInstance.startUser.id as any
      }

      console.log('更新后的表单数据:', formData.value)
    }
  } catch (error) {
    console.error('加载融资租赁数据失败:', error)
    // 如果获取失败，至少显示流程变量中的数据
    console.log('使用流程变量中的默认数据')
  } finally {
    formLoading.value = false
  }
}

// 流程表单模式下的数据初始化
watchEffect(() => {
  if (isProcessForm.value && props.formVariables) {
    console.log('watchEffect 触发，流程表单模式:', isProcessForm.value)
    console.log('流程变量:', props.formVariables)
    console.log('流程实例:', props.processInstance)

    // 从流程变量中加载表单数据
    Object.keys(props.formVariables).forEach(key => {
      if (key in formData.value) {
        formData.value[key] = props.formVariables[key]
      }
    })

    // 设置流程实例ID
    if (props.processInstance?.id) {
      formData.value.processInstanceId = props.processInstance.id as any
    }

    // 设置申请人ID
    if (props.processInstance?.startUser?.id) {
      formData.value.userId = props.processInstance.startUser.id as any
    }

    // 如果有业务键，尝试从后端获取详细数据
    if (props.processInstance?.businessKey) {
      console.log('准备调用 loadFinanceLeaseData，业务键:', props.processInstance.businessKey)
      loadFinanceLeaseData(props.processInstance.businessKey)
    } else {
      console.log('没有业务键，无法加载详细数据')
    }
  } else {
    console.log('watchEffect 条件不满足:', {
      isProcessForm: isProcessForm.value,
      hasFormVariables: !!props.formVariables
    })
  }
})

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  formData.value.userId = userStore.getUser?.id
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const data = await FinanceLeaseApi.getFinanceLease(id)
      const processedFileList = data.fileList ? (typeof data.fileList === 'string' ? data.fileList.split(',').filter(id => id.trim() !== '') : data.fileList) : []


      formData.value = {
        ...data,
        fileList: processedFileList
      }
    } finally {
      formLoading.value = false
    }
  }
  const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
  companyList.value = response
  const applicationListResponse = await FinanceApplicationApi.getSimpleFinanceApplicationListApproved()
  applicationList.value = applicationListResponse
  userList.value = await UserApi.getSimpleUserList()
}
const applicationIdChange = async (val) => {
  const financeApplication = await FinanceApplicationApi.getFinanceApplication(val);
  formData.value.companyId = financeApplication.companyId;
  formData.value.leasedProperty = financeApplication.leasedProperty;
  formData.value.leasedPropertyNum = financeApplication.leasedPropertyNum;
  formData.value.leasedPropertyValue = financeApplication.leasedPropertyValue;
  formData.value.leaseAmount = financeApplication.leaseAmount;
  formData.value.leaseTerm = financeApplication.leaseTerm;
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success', 'click']) // 定义 success 和 click 事件
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
    } as unknown as FinanceLeaseVO

    if (formType.value === 'create') {
      await FinanceLeaseApi.createFinanceLease(data)
      message.success(t('common.createSuccess'))
    } else {
      await FinanceLeaseApi.updateFinanceLease(data)
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
    leasedCode: undefined,
    applicationId: undefined,
    userId: undefined,
    companyId: undefined,
    leasedProperty: undefined,
    leasedPropertyNum: undefined,
    leasedPropertyValue: undefined,
    leaseMode: undefined,
    lienMode: undefined,
    leaseAmount: undefined,
    leaseDate: undefined,
    leaseTerm: undefined,
    interestRate: undefined,
    fileList: [],
    sequenceCode: undefined,
    deviceList: [],
    status: undefined,
    processInstanceId: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}

  // 流程表单模式下的初始化
  onMounted(async () => {
    console.log('onMounted 触发，流程表单模式:', isProcessForm.value)

    if (isProcessForm.value) {
      // 加载企业列表
      const response = await FinanceCompanyApi.getSimpleFinanceCompanyList()
      companyList.value = response
      const applicationListResponse = await FinanceApplicationApi.getSimpleFinanceApplicationListApproved()
      applicationList.value = applicationListResponse
      // 如果 watchEffect 没有触发，在这里也尝试加载数据
      if (props.processInstance?.businessKey && !formData.value.id) {
        console.log('onMounted 中尝试加载数据，业务键:', props.processInstance.businessKey)
        await loadFinanceLeaseData(props.processInstance.businessKey)
      }
    }
  })
</script>

<style scoped>
/* 流程表单容器样式 */
.process-form-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}


/* Tab组件样式 */
.form-tabs {
  margin-top: 20px;
}

.tab-content,
.upload-content {
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
