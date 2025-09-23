<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="供应商名称" prop="supplierName">
        <el-input v-model="formData.supplierName" placeholder="请输入供应商名称" />
      </el-form-item>
    </el-form>
    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="账户信息" name="supplychainSupplierAccount">
        <SupplychainSupplierAccountForm ref="supplychainSupplierAccountFormRef" :supplier-id="formData.id" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { SupplychainSupplierApi, SupplychainSupplierVO } from '@/api/business/supplychainsupplier'
import SupplychainSupplierAccountForm from './components/SupplychainSupplierAccountForm.vue'

/** 供应链金融供应商 表单 */
defineOptions({ name: 'SupplychainSupplierForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  supplierName: undefined,
  deptId: undefined,
})
const formRules = reactive({
  supplierName: [{ required: true, message: '供应商名称不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('supplychainSupplierAccount')
const supplychainSupplierAccountFormRef = ref()

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
      formData.value = await SupplychainSupplierApi.getSupplychainSupplier(id)
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
  // 校验子表单
  try {
    await supplychainSupplierAccountFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'supplychainSupplierAccount'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as SupplychainSupplierVO
    // 拼接子表的数据
    data.supplychainSupplierAccounts = supplychainSupplierAccountFormRef.value.getData()
    if (formType.value === 'create') {
      await SupplychainSupplierApi.createSupplychainSupplier(data)
      message.success(t('common.createSuccess'))
    } else {
      await SupplychainSupplierApi.updateSupplychainSupplier(data)
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
    supplierName: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
