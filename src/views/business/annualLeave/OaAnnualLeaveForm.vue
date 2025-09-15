<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <!-- <el-form-item label="用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户ID" />
      </el-form-item> -->
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="formData.userName" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="已使用年假天数" prop="usedDays">
        <el-input v-model="formData.usedDays" placeholder="请输入已使用年假天数" />
      </el-form-item>
      <el-form-item label="年假总天数" prop="totalDays">
        <el-input v-model="formData.totalDays" placeholder="请输入年假总天数" />
      </el-form-item>
      <!-- <el-form-item label="部门编号" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入部门编号" />
      </el-form-item> -->
      <el-form-item label="部门名" prop="deptName">
        <el-input v-model="formData.deptName" placeholder="请输入部门名" />
      </el-form-item>
    </el-form>
    <!-- 子表的表单 -->
    <el-tabs v-model="subTabsName">
      <el-tab-pane label="OA 请假申请表单" name="oaFormLeave">
        <OaFormLeaveForm ref="oaFormLeaveFormRef" :user-id="formData.userId" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { OaAnnualLeaveApi, OaAnnualLeaveVO } from 'src/api/business/annualLeave'
import OaFormLeaveForm from './components/OaFormLeaveForm.vue'

/** 年假 表单 */
defineOptions({ name: 'OaAnnualLeaveForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  totalDays: undefined,
  usedDays: undefined,
  deptId: undefined,
})
const formRules = reactive({
  userName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  totalDays: [{ required: true, message: '年假总天数不能为空', trigger: 'blur' }],
  usedDays: [{ required: true, message: '已使用年假天数不能为空', trigger: 'blur' }],
  deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 子表的表单 */
const subTabsName = ref('oaFormLeave')
const oaFormLeaveFormRef = ref()

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
      formData.value = await OaAnnualLeaveApi.getOaAnnualLeave(id)
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
    await oaFormLeaveFormRef.value.validate()
  } catch (e) {
    subTabsName.value = 'oaFormLeave'
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as OaAnnualLeaveVO
    // 拼接子表的数据
    data.oaFormLeaves = oaFormLeaveFormRef.value.getData()
    if (formType.value === 'create') {
      await OaAnnualLeaveApi.createOaAnnualLeave(data)
      message.success(t('common.createSuccess'))
    } else {
      await OaAnnualLeaveApi.updateOaAnnualLeave(data)
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
    totalDays: undefined,
    usedDays: undefined,
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
