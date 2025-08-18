<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="企业全称" prop="enterpriseName">
        <el-input v-model="formData.enterpriseName" placeholder="请输入企业全称" />
      </el-form-item>
      <el-form-item label="统一社会信用代码" prop="creditCode">
        <el-input v-model="formData.creditCode" placeholder="请输入统一社会信用代码" />
      </el-form-item>
      <el-form-item label="企业简称" prop="shortName">
        <el-input v-model="formData.shortName" placeholder="请输入企业简称" />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入地址" />
      </el-form-item>
      <el-form-item label="法定代表人" prop="legalRepresentative">
        <el-input v-model="formData.legalRepresentative" placeholder="请输入法定代表人" />
      </el-form-item>
      <el-form-item label="所属行业" prop="industry">
        <el-input v-model="formData.industry" placeholder="请输入所属行业" />
      </el-form-item>
      <el-form-item label="注册资本（万）" prop="registeredCapital">
        <el-input v-model="formData.registeredCapital" placeholder="请输入注册资本" />
      </el-form-item>
      <el-form-item label="企业性质" prop="companyNature">
        <el-input v-model="formData.companyNature" placeholder="请输入企业性质" />
      </el-form-item>
      <el-form-item label="主营业务" prop="mainBusiness">
        <el-input v-model="formData.mainBusiness" placeholder="请输入主营业务" />
      </el-form-item>
      <el-form-item label="主要产品" prop="mainProducts">
        <el-input v-model="formData.mainProducts" placeholder="请输入主要产品" />
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注信息" />
      </el-form-item>
      <el-form-item label="部门编号" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入部门编号" />
      </el-form-item>
      <el-form-item label="文件路径" prop="filePath">
        <el-input v-model="formData.filePath" placeholder="请输入文件路径" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { FinanceCompanyApi, FinanceCompanyVO } from '@/api/business/financecompany'

/** 企业名单管理 表单 */
defineOptions({ name: 'FinanceCompanyForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
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
  filePath: undefined,
})
const formRules = reactive({
  enterpriseName: [{ required: true, message: '企业全称不能为空', trigger: 'blur' }],
  creditCode: [{ required: true, message: '统一社会信用代码不能为空', trigger: 'blur' }],
  deptId: [{ required: true, message: '部门编号不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

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
      formData.value = await FinanceCompanyApi.getFinanceCompany(id)
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
    const data = formData.value as unknown as FinanceCompanyVO
    if (formType.value === 'create') {
      await FinanceCompanyApi.createFinanceCompany(data)
      message.success(t('common.createSuccess'))
    } else {
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
  formData.value = {
    id: undefined,
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
    filePath: undefined,
  }
  formRef.value?.resetFields()
}
</script>
