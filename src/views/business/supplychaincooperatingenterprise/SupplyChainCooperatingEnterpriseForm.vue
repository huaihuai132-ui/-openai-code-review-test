<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <!-- 新增时显示企业选择下拉框 -->
      <el-form-item label="选择企业" prop="selectedCompanyId" v-if="formType === 'create'">
        <el-select
          v-model="formData.selectedCompanyId"
          placeholder="请选择企业"
          filterable
          clearable
          @change="handleCompanyChange"
          style="width: 100%"
        >
          <el-option
            v-for="company in availableCompanies"
            :key="company.id"
            :label="company.enterpriseName"
            :value="company.id"
          />
        </el-select>
      </el-form-item>
      
      <!-- 企业信息展示 -->
      <el-form-item label="企业全称" prop="enterpriseName">
        <el-input v-model="formData.enterpriseName" placeholder="请输入企业全称" :readonly="formType === 'create'" />
      </el-form-item>
      <el-form-item label="统一社会信用代码" prop="creditCode">
        <el-input v-model="formData.creditCode" placeholder="请输入统一社会信用代码" :readonly="formType === 'create'" />
      </el-form-item>
      <el-form-item label="企业简称" prop="shortName">
        <el-input v-model="formData.shortName" placeholder="请输入企业简称" :readonly="formType === 'create'" />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入地址" :readonly="formType === 'create'" />
      </el-form-item>
      <el-form-item label="法定代表人" prop="legalRepresentative">
        <el-input v-model="formData.legalRepresentative" placeholder="请输入法定代表人" :readonly="formType === 'create'" />
      </el-form-item>
      <el-form-item label="所属行业" prop="industry">
        <el-input v-model="formData.industry" placeholder="请输入所属行业" :readonly="formType === 'create'" />
      </el-form-item>
      <el-form-item label="注册资本（万）" prop="registeredCapital">
        <el-input v-model="formData.registeredCapital" placeholder="请输入注册资本" :readonly="formType === 'create'" />
      </el-form-item>
      <el-form-item label="企业性质" prop="companyNature">
        <el-input v-model="formData.companyNature" placeholder="请输入企业性质" :readonly="formType === 'create'" />
      </el-form-item>
      <el-form-item label="主营业务" prop="mainBusiness">
        <el-input v-model="formData.mainBusiness" placeholder="请输入主营业务" :readonly="formType === 'create'" />
      </el-form-item>
      <el-form-item label="主要产品" prop="mainProducts">
        <el-input v-model="formData.mainProducts" placeholder="请输入主要产品" :readonly="formType === 'create'" />
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注信息" />
      </el-form-item>
      <el-form-item label="部门编号" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入部门编号" :readonly="formType === 'create'" />
      </el-form-item>
      <el-form-item label="附件文件" prop="fileList">
        <BatchFileUpload
          ref="fileUploadRef"
          v-model:fileList="formData.fileList"
          :mode="getUploadMode()"
          directory="business"
        />
      </el-form-item>
      <el-form-item label="企业联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入企业联系电话" :readonly="formType === 'create'" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { FinanceCompanyApi, FinanceCompanyVO } from '@/api/business/finance/financecompany'
import { BatchFileUpload } from '@/components/UploadFile'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'

/** 供应链金融合作企业管理 表单 */
defineOptions({ name: 'SupplyChainCooperatingEnterpriseForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const availableCompanies = ref<FinanceCompanyVO[]>([]) // 可选择的企业列表（非供应链金融合作企业）

/** 获取上传组件的模式 */
const getUploadMode = () => {
  if (formType.value === 'create') return 'create'
  if (formType.value === 'update' || formType.value === 'edit') return 'edit'
  return 'view'
}

const formData = ref({
  id: undefined,
  selectedCompanyId: undefined, // 新增时选择的企业ID
  enterpriseName: undefined,
  creditCode: undefined,
  shortName: undefined,
  address: undefined,
  legalRepresentative: undefined,
  industry: undefined,
  registeredCapital: undefined,
  companyNature: undefined,
  mainBusiness: undefined,
  mainProducts: undefined,
  remark: undefined,
  deptId: undefined,
  supplyChainFinancePartner: true, // 默认设为供应链金融合作企业
  fileList: [] as string[],
  sequenceCode: undefined,
  phone: undefined,
})

const formRules = reactive({
  selectedCompanyId: [{ required: true, message: '请选择企业', trigger: 'change' }],
  enterpriseName: [{ required: true, message: '企业全称不能为空', trigger: 'blur' }],
  creditCode: [{ required: true, message: '统一社会信用代码不能为空', trigger: 'blur' }],
  deptId: [{ required: true, message: '部门编号不能为空', trigger: 'blur' }],
})

const formRef = ref() // 表单 Ref

/** 加载可选择的企业列表（非供应链金融合作企业） */
const loadAvailableCompanies = async () => {
  try {
    // 获取所有企业
    const allCompanies = await FinanceCompanyApi.getSimpleFinanceCompanyList()
    // 过滤出非供应链金融合作企业
    availableCompanies.value = allCompanies.filter(company => 
      company.supplyChainFinancePartner !== true && company.supplyChainFinancePartner !== '1'
    )
  } catch (error) {
    console.error('加载企业列表失败:', error)
    message.error('加载企业列表失败')
  }
}

/** 企业选择变化处理 */
const handleCompanyChange = async (companyId: number) => {
  if (!companyId) {
    // 清空表单数据
    resetFormData()
    return
  }
  
  try {
    // 获取选中企业的详细信息
    const companyDetail = await FinanceCompanyApi.getFinanceCompany(companyId)
    if (companyDetail) {
      // 自动填充企业信息
      formData.value.enterpriseName = companyDetail.enterpriseName
      formData.value.creditCode = companyDetail.creditCode
      formData.value.shortName = companyDetail.shortName
      formData.value.address = companyDetail.address
      formData.value.legalRepresentative = companyDetail.legalRepresentative
      formData.value.industry = companyDetail.industry
      formData.value.registeredCapital = companyDetail.registeredCapital
      formData.value.companyNature = companyDetail.companyNature
      formData.value.mainBusiness = companyDetail.mainBusiness
      formData.value.mainProducts = companyDetail.mainProducts
      formData.value.remark = companyDetail.remark
      formData.value.deptId = companyDetail.deptId
      formData.value.phone = companyDetail.phone
      formData.value.fileList = companyDetail.fileList ? 
        (typeof companyDetail.fileList === 'string' ? 
          companyDetail.fileList.split(',').filter(id => id.trim() !== '') : 
          companyDetail.fileList
        ) : []
    }
  } catch (error) {
    console.error('获取企业详情失败:', error)
    message.error('获取企业详情失败')
  }
}

/** 重置表单数据 */
const resetFormData = () => {
  formData.value = {
    id: undefined,
    selectedCompanyId: undefined,
    enterpriseName: undefined,
    creditCode: undefined,
    shortName: undefined,
    address: undefined,
    legalRepresentative: undefined,
    industry: undefined,
    registeredCapital: undefined,
    companyNature: undefined,
    mainBusiness: undefined,
    mainProducts: undefined,
    remark: undefined,
    deptId: undefined,
    supplyChainFinancePartner: true,
    fileList: [],
    sequenceCode: undefined,
    phone: undefined,
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增供应链金融合作企业' : '编辑供应链金融合作企业'
  formType.value = type
  resetFormData()
  
  if (type === 'create') {
    // 新增时加载可选择的企业列表
    await loadAvailableCompanies()
  } else if (id) {
    // 修改时，设置数据
    formLoading.value = true
    try {
      const data = await FinanceCompanyApi.getFinanceCompany(id)
      formData.value = {
        ...data,
        fileList: data.fileList ? 
          (typeof data.fileList === 'string' ? 
            data.fileList.split(',').filter(id => id.trim() !== '') : 
            data.fileList
          ) : []
      }
    } finally {
      formLoading.value = false
    }
  }
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
      supplyChainFinancePartner: true, // 确保设置为供应链金融合作企业
      fileList: Array.isArray(formData.value.fileList) && formData.value.fileList.length > 0
        ? formData.value.fileList.join(',')
        : ''
    } as unknown as FinanceCompanyVO

    if (formType.value === 'create') {
      // 新增时，使用选中企业的ID
      data.id = formData.value.selectedCompanyId
      await FinanceCompanyApi.updateFinanceCompany(data) // 实际上是更新企业的供应链金融合作企业标志
      message.success('添加成功')
    } else {
      // 修改时
      await FinanceCompanyApi.updateFinanceCompany(data)
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
  resetFormData()
  formRef.value?.resetFields()
}
</script>