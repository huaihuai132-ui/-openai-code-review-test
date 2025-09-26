<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="租赁信息唯一code" prop="rentalCode">
        <el-input v-model="formData.rentalCode" placeholder="请输入租赁信息唯一code" />
      </el-form-item>
      <el-form-item label="承租户id，关联business_assets_renter.id" prop="renterId">
        <el-input v-model="formData.renterId" placeholder="请输入承租户id，关联business_assets_renter.id" />
      </el-form-item>
      <el-form-item label="押金(元)" prop="deposit">
        <el-input v-model="formData.deposit" placeholder="请输入押金(元)" />
      </el-form-item>
      <el-form-item label="年租金(元)" prop="annualRent">
        <el-input v-model="formData.annualRent" placeholder="请输入年租金(元)" />
      </el-form-item>
      <el-form-item label="收租方式：0-年租，1-月租，2-季度租，3-半年租，字典键business_asset_rent_type" prop="rentType">
        <el-select v-model="formData.rentType" placeholder="请选择收租方式：0-年租，1-月租，2-季度租，3-半年租，字典键business_asset_rent_type">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="合同开始日期" prop="contractStartDate">
        <el-date-picker
          v-model="formData.contractStartDate"
          type="date"
          value-format="x"
          placeholder="选择合同开始日期"
        />
      </el-form-item>
      <el-form-item label="合同结束日期" prop="contractEndDate">
        <el-date-picker
          v-model="formData.contractEndDate"
          type="date"
          value-format="x"
          placeholder="选择合同结束日期"
        />
      </el-form-item>
      <el-form-item label="收租截止期限" prop="rentEndDate">
        <el-date-picker
          v-model="formData.rentEndDate"
          type="date"
          value-format="x"
          placeholder="选择收租截止期限"
        />
      </el-form-item>
      <el-form-item label="经营用途" prop="businessPurpose">
        <el-input v-model="formData.businessPurpose" placeholder="请输入经营用途" />
      </el-form-item>
      <el-form-item label="资产ID，关联business_asset_basic_info.id" prop="assetId">
        <el-input v-model="formData.assetId" placeholder="请输入资产ID，关联business_asset_basic_info.id" />
      </el-form-item>
      <el-form-item label="外部资产名称" prop="assetName">
        <el-input v-model="formData.assetName" placeholder="请输入外部资产名称" />
      </el-form-item>
      <el-form-item label="合同状态：0-草稿，1-生效中，2-失效，3-自动过期，4-完结，字典键business_assets_contract_status" prop="contractStatus">
        <el-radio-group v-model="formData.contractStatus">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="合同文件id列表" prop="filePath">
        <el-input v-model="formData.filePath" placeholder="请输入合同文件id列表" />
      </el-form-item>
      <el-form-item label="文件序列编码" prop="sequenceCode">
        <el-input v-model="formData.sequenceCode" placeholder="请输入文件序列编码" />
      </el-form-item>
      <el-form-item label="备注信息" prop="remarks">
        <el-input v-model="formData.remarks" placeholder="请输入备注信息" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { AssetRentalInfoApi, AssetRentalInfoVO } from '@/api/business/asset/assetRentalInfo'

/** 资产租赁信息 表单 */
defineOptions({ name: 'AssetRentalInfoForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  rentalCode: undefined,
  renterId: undefined,
  deposit: undefined,
  annualRent: undefined,
  rentType: undefined,
  contractStartDate: undefined,
  contractEndDate: undefined,
  rentEndDate: undefined,
  businessPurpose: undefined,
  assetId: undefined,
  assetName: undefined,
  contractStatus: undefined,
  filePath: undefined,
  sequenceCode: undefined,
  remarks: undefined,
})
const formRules = reactive({
  rentalCode: [{ required: true, message: '租赁信息唯一code不能为空', trigger: 'blur' }],
  renterId: [{ required: true, message: '承租户id，关联business_assets_renter.id不能为空', trigger: 'blur' }],
  annualRent: [{ required: true, message: '年租金(元)不能为空', trigger: 'blur' }],
  rentType: [{ required: true, message: '收租方式：0-年租，1-月租，2-季度租，3-半年租，字典键business_asset_rent_type不能为空', trigger: 'change' }],
  contractStartDate: [{ required: true, message: '合同开始日期不能为空', trigger: 'blur' }],
  contractEndDate: [{ required: true, message: '合同结束日期不能为空', trigger: 'blur' }],
  assetId: [{ required: true, message: '资产ID，关联business_asset_basic_info.id不能为空', trigger: 'blur' }],
  filePath: [{ required: true, message: '合同文件id列表不能为空', trigger: 'blur' }],
  sequenceCode: [{ required: true, message: '文件序列编码不能为空', trigger: 'blur' }],
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
      formData.value = await AssetRentalInfoApi.getAssetRentalInfo(id)
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
    const data = formData.value as unknown as AssetRentalInfoVO
    if (formType.value === 'create') {
      await AssetRentalInfoApi.createAssetRentalInfo(data)
      message.success(t('common.createSuccess'))
    } else {
      await AssetRentalInfoApi.updateAssetRentalInfo(data)
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
    rentalCode: undefined,
    renterId: undefined,
    deposit: undefined,
    annualRent: undefined,
    rentType: undefined,
    contractStartDate: undefined,
    contractEndDate: undefined,
    rentEndDate: undefined,
    businessPurpose: undefined,
    assetId: undefined,
    assetName: undefined,
    contractStatus: undefined,
    filePath: undefined,
    sequenceCode: undefined,
    remarks: undefined,
  }
  formRef.value?.resetFields()
}
</script>
