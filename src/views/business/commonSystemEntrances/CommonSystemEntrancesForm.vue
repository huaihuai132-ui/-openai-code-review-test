<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="用户ID" prop="userId" v-if="!formData.isForAll">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="是否给所有人设置" prop="isForAll">
        <el-switch v-model="formData.isForAll" />
      </el-form-item>
      <el-form-item label="入口名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入入口名称" />
      </el-form-item>
      <el-form-item label="图标标识（如：ep:box）" prop="icon">
        <el-input v-model="formData.icon" placeholder="请输入图标标识" />
      </el-form-item>
      <el-form-item label="跳转链接" prop="url">
        <el-input v-model="formData.url" placeholder="请输入跳转链接" />
      </el-form-item>
      <el-form-item label="显示颜色（如：#F56C6C）" prop="color">
        <el-input v-model="formData.color" placeholder="请输入显示颜色" />
      </el-form-item>
      <el-form-item label="排序，值越小越靠前" prop="order">
        <el-input v-model="formData.order" placeholder="请输入排序，值越小越靠前" />
      </el-form-item>
      <el-form-item label="部门编号" prop="deptId" v-if="!formData.isForAll">
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
import { CommonSystemEntrancesApi, CommonSystemEntrancesVO } from 'src/api/business/commonSystemEntrances'

/** 常用系统入口 表单 */
defineOptions({ name: 'CommonSystemEntrancesForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  name: undefined,
  icon: undefined,
  url: undefined,
  color: undefined,
  order: undefined,
  deptId: undefined,
  isForAll: false, // 是否给所有人设置
})

// 监听isForAll变化，当选择给所有人设置时，不需要填写用户ID和部门编号
watch(() => formData.value.isForAll, (newVal) => {
  if (newVal) {
    // 如果选择给所有人设置，则清空用户ID和部门编号
    formData.value.userId = undefined
    formData.value.deptId = undefined
  }
})

const formRules = reactive({
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '入口名称不能为空', trigger: 'blur' }],
  icon: [{ required: true, message: '图标标识（如：ep:box）不能为空', trigger: 'blur' }],
  url: [{ required: true, message: '跳转链接不能为空', trigger: 'blur' }],
  color: [{ required: true, message: '显示颜色（如：#F56C6C）不能为空', trigger: 'blur' }],
  order: [{ required: true, message: '排序，值越小越靠前不能为空', trigger: 'blur' }],
  deptId: [{ required: true, message: '部门编号不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number, presetUserId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await CommonSystemEntrancesApi.getCommonSystemEntrances(id)
      formData.value.isForAll = false // 编辑时默认不是给所有人设置
    } finally {
      formLoading.value = false
    }
  } else if (presetUserId) {
    // 新增时预设userId
    formData.value.userId = presetUserId
    formData.value.isForAll = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 根据是否给所有人设置，动态调整表单验证规则
  if (formData.value.isForAll) {
    // 如果是给所有人设置，则不需要验证用户ID和部门编号
    formRef.value.clearValidate(['userId', 'deptId'])
  } else {
    // 校验表单
    await formRef.value.validate()
  }

  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as CommonSystemEntrancesVO
    if (formType.value === 'create') {
      if (formData.value.isForAll) {
        // 如果是给所有人设置，则调用addListAll接口
        await CommonSystemEntrancesApi.addListAll(data)
        message.success('已成功为所有人添加常用入口')
      } else {
        // 否则调用普通的创建接口
        await CommonSystemEntrancesApi.createCommonSystemEntrances(data)
        message.success(t('common.createSuccess'))
      }
    } else {
      // 修改操作不支持给所有人设置
      await CommonSystemEntrancesApi.updateCommonSystemEntrances(data)
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
    name: undefined,
    icon: undefined,
    url: undefined,
    color: undefined,
    order: undefined,
    deptId: undefined,
    isForAll: false,
  }
  formRef.value?.resetFields()
}
</script>
