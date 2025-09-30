<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="关联 system_common_entrances.id" prop="entranceId">
        <el-input v-model="formData.entranceId" placeholder="请输入关联 system_common_entrances.id" />
      </el-form-item>
      <el-form-item label="用户自定义排序，值越小越靠前" prop="customOrder">
        <el-input v-model="formData.customOrder" placeholder="请输入用户自定义排序，值越小越靠前" />
      </el-form-item>
      <el-form-item label="是否隐藏该入口" prop="hidden">
        <el-select v-model="formData.hidden" placeholder="请选择入口状态" clearable class="!w-240px">
          <el-option v-for="dict in getStrDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)" :key="dict.value"
            :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门编号" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入部门编号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserCommonEntrancesApi, UserCommonEntrancesVO } from '@/api/business/usercommonentrances'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'

/** 用户常用入口维护表（个性化配置） 表单 */
defineOptions({ name: 'UserCommonEntrancesForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  entranceId: undefined,
  customOrder: undefined,
  hidden: undefined,
  deptId: undefined,
})
const formRules = reactive({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  entranceId: [{ required: true, message: '关联 system_common_entrances.id不能为空', trigger: 'blur' }],
  customOrder: [{ required: true, message: '用户自定义排序，值越小越靠前不能为空', trigger: 'blur' }],
  hidden: [{ required: true, message: '是否隐藏该入口不能为空', trigger: 'blur' }],
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
      formData.value = await UserCommonEntrancesApi.getUserCommonEntrances(id)
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
    const data = formData.value as unknown as UserCommonEntrancesVO
    if (formType.value === 'create') {
      await UserCommonEntrancesApi.createUserCommonEntrances(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserCommonEntrancesApi.updateUserCommonEntrances(data)
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
    entranceId: undefined,
    customOrder: undefined,
    hidden: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>