<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="资产ID，关联business_asset_basic_info.id" prop="assetId">
        <el-input v-model="formData.assetId" placeholder="请输入资产ID，关联business_asset_basic_info.id" />
      </el-form-item>
      <el-form-item label="租赁信息ID，business_asset_rental_info.id" prop="rentalId">
        <el-input v-model="formData.rentalId" placeholder="请输入租赁信息ID，business_asset_rental_info.id" />
      </el-form-item>
      <el-form-item label="预警级别：0低，1-中，2-高,字典键business_asset_warnings_level" prop="warningLevel">
        <el-input v-model="formData.warningLevel" placeholder="请输入预警级别：0低，1-中，2-高,字典键business_asset_warnings_level" />
      </el-form-item>
      <el-form-item label="预警日期" prop="warningDate">
        <el-date-picker
          v-model="formData.warningDate"
          type="date"
          value-format="x"
          placeholder="选择预警日期"
        />
      </el-form-item>
      <el-form-item label="预警标题" prop="warningTitle">
        <el-input v-model="formData.warningTitle" placeholder="请输入预警标题" />
      </el-form-item>
      <el-form-item label="预警消息" prop="warningContent">
        <Editor v-model="formData.warningContent" height="150px" />
      </el-form-item>
      <el-form-item label="短信通知明细id列表" prop="notifyIds">
        <el-input v-model="formData.notifyIds" placeholder="请输入短信通知明细id列表" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { AssetWarningsApi, AssetWarningsVO } from '@/api/business/asset/assetWarnings'

/** 资产预警信息 表单 */
defineOptions({ name: 'AssetWarningsForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  assetId: undefined,
  rentalId: undefined,
  warningLevel: undefined,
  warningDate: undefined,
  warningTitle: undefined,
  warningContent: undefined,
  notifyIds: undefined,
})
const formRules = reactive({
  warningLevel: [{ required: true, message: '预警级别：0低，1-中，2-高,字典键business_asset_warnings_level不能为空', trigger: 'blur' }],
  warningTitle: [{ required: true, message: '预警标题不能为空', trigger: 'blur' }],
  warningContent: [{ required: true, message: '预警消息不能为空', trigger: 'blur' }],
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
      formData.value = await AssetWarningsApi.getAssetWarnings(id)
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
    const data = formData.value as unknown as AssetWarningsVO
    if (formType.value === 'create') {
      await AssetWarningsApi.createAssetWarnings(data)
      message.success(t('common.createSuccess'))
    } else {
      await AssetWarningsApi.updateAssetWarnings(data)
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
    assetId: undefined,
    rentalId: undefined,
    warningLevel: undefined,
    warningDate: undefined,
    warningTitle: undefined,
    warningContent: undefined,
    notifyIds: undefined,
  }
  formRef.value?.resetFields()
}
</script>
