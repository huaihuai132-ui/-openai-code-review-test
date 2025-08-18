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
      <el-form-item label="融资标的物名称" prop="leasedProperty">
        <el-input v-model="formData.leasedProperty" placeholder="请输入融资标的物名称" />
      </el-form-item>
      <el-form-item label="融资标的物数量" prop="leasedPropertyNum">
        <el-input v-model="formData.leasedPropertyNum" placeholder="请输入融资标的物数量" />
      </el-form-item>
      <el-form-item label="拟融资标的物净值" prop="leasedPropertyValue">
        <el-input v-model="formData.leasedPropertyValue" placeholder="请输入拟融资标的物净值" />
      </el-form-item>
      <el-form-item label="申请额度" prop="leaseAmount">
        <el-input v-model="formData.leaseAmount" placeholder="请输入申请额度" />
      </el-form-item>
      <el-form-item label="承租租期" prop="leaseTerm">
        <el-input v-model="formData.leaseTerm" placeholder="请输入承租租期" />
      </el-form-item>
      <el-form-item label="是否列为国家产业政策限制/淘汰的高能耗、高水耗、高污染企业	" prop="restrictedByPolicy" label-width="388px">
        <el-radio-group v-model="formData.restrictedByPolicy">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="租赁物是否为行业先进技术设备	" prop="advancedTechEquip" label-width="388px">
        <el-radio-group v-model="formData.advancedTechEquip">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="租赁物是否为濒临淘汰或折旧严重的设备" prop="obsoleteOrOverdep" label-width="388px">
        <el-radio-group v-model="formData.obsoleteOrOverdep">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否涉嫌走私、偷逃税款或骗取出口退税" prop="taxFraudRisk" label-width="388px">
        <el-radio-group v-model="formData.taxFraudRisk">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业（项目）立项、生产经营用地批文是否齐全" prop="landPermitOk" label-width="388px">
        <el-radio-group v-model="formData.landPermitOk">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="环评、能耗、安全消防是否达标" prop="ehsCompliance" label-width="388px">
        <el-radio-group v-model="formData.ehsCompliance">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="营业执照等证件是否经过当地年检" prop="licenseAnnualOk" label-width="388px">
        <el-radio-group v-model="formData.licenseAnnualOk">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="申请人及其法定代表人是否有不良信用记录" prop="badCreditRecord" label-width="388px">
        <el-radio-group v-model="formData.badCreditRecord">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
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
  landPermitOk: undefined,
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
  leasedProperty: [{ required: true, message: '融资标的物名称不能为空', trigger: 'blur' }],
  leasedPropertyNum: [{ required: true, message: '融资标的物数量不能为空', trigger: 'blur' }],
  leasedPropertyValue: [{ required: true, message: '拟融资标的物净值不能为空', trigger: 'blur' }],
  leaseAmount: [{ required: true, message: '申请额度不能为空', trigger: 'blur' }],
  leaseTerm: [{ required: true, message: '承租租期不能为空', trigger: 'blur' }],
  restrictedByPolicy: [{ required: true, message: '是否列为国家产业政策限制/淘汰的高能耗、高水耗、高污染企业	不能为空', trigger: 'blur' }],
  advancedTechEquip: [{ required: true, message: '租赁物是否为行业先进技术设备	不能为空', trigger: 'blur' }],
  obsoleteOrOverdep: [{ required: true, message: '租赁物是否为濒临淘汰或折旧严重的设备不能为空', trigger: 'blur' }],
  taxFraudRisk: [{ required: true, message: '是否涉嫌走私、偷逃税款或骗取出口退税不能为空', trigger: 'blur' }],
  landPermitOk: [{ required: true, message: '企业（项目）立项、生产经营用地批文是否齐全不能为空', trigger: 'blur' }],
  ehsCompliance: [{ required: true, message: '环评、能耗、安全消防是否达标不能为空', trigger: 'blur' }],
  licenseAnnualOk: [{ required: true, message: '营业执照等证件是否经过当地年检不能为空', trigger: 'blur' }],
  badCreditRecord: [{ required: true, message: '申请人及其法定代表人是否有不良信用记录不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '单据状态不能为空', trigger: 'blur' }],
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
      formData.value = await FinanceApplicationApi.getFinanceApplication(id)
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
    landPermitOk: undefined,
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
