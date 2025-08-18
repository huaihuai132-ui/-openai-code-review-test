<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
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
      <el-form-item label="项目申请" prop="leasedCode">
        <el-input v-model="formData.leasedCode" placeholder="请输入项目申请" />
      </el-form-item>
      <el-form-item label="标的名称" prop="leasedProperty">
        <el-input v-model="formData.leasedProperty" placeholder="请输入融资标的物名称" />
      </el-form-item>
      <el-form-item label="标的数量" prop="leasedPropertyNum">
        <el-input v-model="formData.leasedPropertyNum" placeholder="请输入融资标的物数量" />
      </el-form-item>
      <el-form-item label="标的净值" prop="leasedPropertyValue">
        <el-input v-model="formData.leasedPropertyValue" placeholder="请输入拟融资标的物净值" />
      </el-form-item>
      <el-form-item label="租赁模式" prop="leaseMode">
        <el-select v-model="formData.leaseMode" placeholder="请选择租赁模式">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.LEASE_MODE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="担保方式" prop="lienMode">
        <el-select v-model="formData.lienMode" placeholder="请选择担保方式">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.LIEN_MODE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="申请额度" prop="leaseAmount">
        <el-input v-model="formData.leaseAmount" placeholder="请输入申请额度" />
      </el-form-item>
      <el-form-item label="承租时间" prop="leaseDate">
        <el-date-picker
          v-model="formData.leaseDate"
          type="date"
          value-format="x"
          placeholder="选择承租时间"
        />
      </el-form-item>
      <el-form-item label="承租租期" prop="leaseTerm">
        <el-input v-model="formData.leaseTerm" placeholder="请输入承租租期" />
      </el-form-item>
      <el-form-item label="利率" prop="interestRate">
        <el-input v-model="formData.interestRate" placeholder="请输入利率" />
      </el-form-item>
      <el-form-item label="文件路径" prop="filePath">
        <UploadFile
          v-model="formData.filePath"
          :limit="10"
          :file-type="['jpg', 'png', 'pdf', 'doc', 'docx']"
          :file-size="10"
          :drag="true"
          directory="uploads"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { FinanceLeaseApi, FinanceLeaseVO } from '@/api/business/financelease'
import {FinanceCompanyApi, FinanceCompanyVO} from "@/api/business/financecompany";
import { UploadFile } from '@/components/UploadFile'

/** 融资租赁 表单 */
defineOptions({ name: 'FinanceLeaseForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

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
  filePath: undefined,
  status: undefined,
  processInstanceId: undefined,
  deptId: undefined,
})
const formRules = reactive({
  companyId: [{ required: true, message: '企业id不能为空', trigger: 'change' }],
  leasedProperty: [{ required: true, message: '标的名称不能为空', trigger: 'blur' }],
  leasedPropertyNum: [{ required: true, message: '标的数量不能为空', trigger: 'blur' }],
  leasedPropertyValue: [{ required: true, message: '标的净值不能为空', trigger: 'blur' }],
  leaseMode: [{ required: true, message: '租赁模式不能为空', trigger: 'change' }],
  lienMode: [{ required: true, message: '担保方式不能为空', trigger: 'change' }],
  leaseAmount: [{ required: true, message: '申请额度不能为空', trigger: 'blur' }],
  leaseDate: [{ required: true, message: '承租时间不能为空', trigger: 'blur' }],
  leaseTerm: [{ required: true, message: '承租租期不能为空', trigger: 'blur' }],
  interestRate: [{ required: true, message: '利率不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const companyList = ref<FinanceCompanyVO[]>([]) // 公司列表

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
      formData.value = await FinanceLeaseApi.getFinanceLease(id)
    } finally {
      formLoading.value = false
    }
  }
  companyList.value = await FinanceCompanyApi.getSimpleFinanceCompanyList()
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
    const data = formData.value as unknown as FinanceLeaseVO
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
    filePath: undefined,
    status: undefined,
    processInstanceId: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
