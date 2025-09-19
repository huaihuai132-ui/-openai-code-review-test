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
        <h3 class="section-title">基本信息</h3>
        <div class="form-row">
          <el-form-item label="立项申请名称" prop="applicationName">
            <el-input v-model="formData.applicationName" placeholder="请输入立项申请名称" />
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
          <el-form-item label="申请产品类型" prop="applicationType">
            <el-select v-model="formData.applicationType" placeholder="请选择申请产品类型">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SUPPLYCHAIN_PRODUCT)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
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
      </div>
      <!-- 下部分：Tab组件 -->
      <div class="form-section">
        <el-tabs v-model="activeTab" class="form-tabs">
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
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { SupplychainApplicationApi, SupplychainApplicationVO } from '@/api/business/supplychainapplication'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/finance/financecompany";
import {useUserStore} from "@/store/modules/user";

/** 供应链金融立项 表单 */
defineOptions({ name: 'SupplychainApplicationForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  companyId: undefined,
  applicationType: undefined,
  applicationName: undefined,
  applicationTime: undefined,
  applicationStatus: undefined,
  filePath: undefined,
  status: undefined,
  processInstanceId: undefined,
  deptId: undefined,
})
const formRules = reactive({
  userId: [{ required: true, message: '申请人的用户编号不能为空', trigger: 'blur' }],
  companyId: [{ required: true, message: '企业id不能为空', trigger: 'change' }],
  applicationType: [{ required: true, message: '申请产品类型不能为空', trigger: 'change' }],
  applicationName: [{ required: true, message: '立项申请名称不能为空', trigger: 'blur' }],
  applicationTime: [{ required: true, message: '申请时间不能为空', trigger: 'blur' }],
})
const userStore = useUserStore()
const formRef = ref() // 表单 Ref
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表
const activeTab = ref('upload') // 当前激活的tab

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
      formData.value = await SupplychainApplicationApi.getSupplychainApplication(id)
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
    const data = formData.value as unknown as SupplychainApplicationVO
    if (formType.value === 'create') {
      await SupplychainApplicationApi.createSupplychainApplication(data)
      message.success(t('common.createSuccess'))
    } else {
      await SupplychainApplicationApi.updateSupplychainApplication(data)
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
    companyId: undefined,
    applicationType: undefined,
    applicationName: undefined,
    applicationTime: undefined,
    applicationStatus: undefined,
    filePath: undefined,
    status: undefined,
    processInstanceId: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
