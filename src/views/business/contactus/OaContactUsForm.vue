<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="用户ID（可选，如为登录用户）" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID（可选，如为登录用户）" />
      </el-form-item>
      <el-form-item label="留言内容" prop="messageContent">
        <Editor v-model="formData.messageContent" height="150px" />
      </el-form-item>
      <el-form-item label="联系人姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入联系人姓名" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="联系邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入联系邮箱" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态">
          <el-option label="待处理" :value="1" />
          <el-option label="处理中" :value="2" />
          <el-option label="已回复" :value="3" />
          <el-option label="已关闭" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="文件编号（用于关联上传的附件）" prop="fileId">
        <el-input v-model="formData.fileId" placeholder="请输入文件编号（用于关联上传的附件）" />
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
import { OaContactUsApi, OaContactUsVO } from 'src/api/business/contactus'

/** 联系我们 表单 */
defineOptions({ name: 'OaContactUsForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  messageContent: undefined,
  name: undefined,
  phone: undefined,
  email: undefined,
  status: undefined,
  fileId: undefined,
  deptId: undefined,
})
const formRules = reactive({
  messageContent: [{ required: true, message: '留言内容不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '联系人姓名不能为空', trigger: 'blur' }],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
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
      formData.value = await OaContactUsApi.getOaContactUs(id)
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
    const data = formData.value as unknown as OaContactUsVO
    if (formType.value === 'create') {
      await OaContactUsApi.createOaContactUs(data)
      message.success(t('common.createSuccess'))
    } else {
      await OaContactUsApi.updateOaContactUs(data)
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
    messageContent: undefined,
    name: undefined,
    phone: undefined,
    email: undefined,
    status: undefined,
    fileId: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
