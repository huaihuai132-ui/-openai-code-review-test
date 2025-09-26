<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="收租记录唯一code" prop="collectRentCode">
        <el-input v-model="formData.collectRentCode" placeholder="请输入收租记录唯一code" />
      </el-form-item>
      <el-form-item label="资产ID，关联business_asset_basic_info.id" prop="assetId">
        <el-input v-model="formData.assetId" placeholder="请输入资产ID，关联business_asset_basic_info.id" />
      </el-form-item>
      <el-form-item label="租赁信息ID，business_asset_rental_info.id" prop="rentalId">
        <el-input v-model="formData.rentalId" placeholder="请输入租赁信息ID，business_asset_rental_info.id" />
      </el-form-item>
      <el-form-item label="承租人id" prop="renterId">
        <el-input v-model="formData.renterId" placeholder="请输入承租人id" />
      </el-form-item>
      <el-form-item label="办理人/收租人id" prop="handleManId">
        <el-input v-model="formData.handleManId" placeholder="请输入办理人/收租人id" />
      </el-form-item>
      <el-form-item label="账单名称" prop="rentBillName">
        <el-input v-model="formData.rentBillName" placeholder="请输入账单名称" />
      </el-form-item>
      <el-form-item label="预计收取租金(元)" prop="planRentCount">
        <el-input v-model="formData.planRentCount" placeholder="请输入预计收取租金(元)" />
      </el-form-item>
      <el-form-item label="实际收取租金(元)" prop="actualRentCount">
        <el-input v-model="formData.actualRentCount" placeholder="请输入实际收取租金(元)" />
      </el-form-item>
      <el-form-item label="账单文件id列表" prop="filePath">
        <el-input v-model="formData.filePath" placeholder="请输入账单文件id列表" />
      </el-form-item>
      <el-form-item label="文件序列编码" prop="sequenceCode">
        <el-input v-model="formData.sequenceCode" placeholder="请输入文件序列编码" />
      </el-form-item>
      <el-form-item label="预计收租日期" prop="planCollectDate">
        <el-date-picker
          v-model="formData.planCollectDate"
          type="date"
          value-format="x"
          placeholder="选择预计收租日期"
        />
      </el-form-item>
      <el-form-item label="实际收租日期" prop="actualCollectDate">
        <el-date-picker
          v-model="formData.actualCollectDate"
          type="date"
          value-format="x"
          placeholder="选择实际收租日期"
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
import { AssetCollectRentInfoApi, AssetCollectRentInfoVO } from '@/api/business/asset/assetCollectRentInfo'

/** 收租记录 表单 */
defineOptions({ name: 'AssetCollectRentInfoForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  collectRentCode: undefined,
  assetId: undefined,
  rentalId: undefined,
  renterId: undefined,
  handleManId: undefined,
  rentBillName: undefined,
  planRentCount: undefined,
  actualRentCount: undefined,
  filePath: undefined,
  sequenceCode: undefined,
  planCollectDate: undefined,
  actualCollectDate: undefined,
})
const formRules = reactive({
  collectRentCode: [{ required: true, message: '收租记录唯一code不能为空', trigger: 'blur' }],
  renterId: [{ required: true, message: '承租人id不能为空', trigger: 'blur' }],
  rentBillName: [{ required: true, message: '账单名称不能为空', trigger: 'blur' }],
  planRentCount: [{ required: true, message: '预计收取租金(元)不能为空', trigger: 'blur' }],
  actualRentCount: [{ required: true, message: '实际收取租金(元)不能为空', trigger: 'blur' }],
  filePath: [{ required: true, message: '账单文件id列表不能为空', trigger: 'blur' }],
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
      formData.value = await AssetCollectRentInfoApi.getAssetCollectRentInfo(id)
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
    const data = formData.value as unknown as AssetCollectRentInfoVO
    if (formType.value === 'create') {
      await AssetCollectRentInfoApi.createAssetCollectRentInfo(data)
      message.success(t('common.createSuccess'))
    } else {
      await AssetCollectRentInfoApi.updateAssetCollectRentInfo(data)
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
    collectRentCode: undefined,
    assetId: undefined,
    rentalId: undefined,
    renterId: undefined,
    handleManId: undefined,
    rentBillName: undefined,
    planRentCount: undefined,
    actualRentCount: undefined,
    filePath: undefined,
    sequenceCode: undefined,
    planCollectDate: undefined,
    actualCollectDate: undefined,
  }
  formRef.value?.resetFields()
}
</script>
