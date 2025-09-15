<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="会议ID" prop="meetingId">
        <el-input v-model="formData.meetingId" placeholder="请输入会议ID" />
      </el-form-item>
      <el-form-item label="参会用户ID" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入参会用户ID" />
      </el-form-item>
      <el-form-item label="确认状态" prop="confirmStatus">
        <el-radio-group v-model="formData.confirmStatus">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.MEET_CONFIRM_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="确认时间" prop="confirmTime">
        <el-date-picker
          v-model="formData.confirmTime"
          type="date"
          value-format="x"
          placeholder="选择确认时间"
        />
      </el-form-item>
      <el-form-item label="拒绝/取消理由" prop="confirmReason">
        <el-input v-model="formData.confirmReason" placeholder="请输入拒绝/取消理由" />
      </el-form-item>
      <el-form-item label="通知状态" prop="notifyStatus">
        <el-radio-group v-model="formData.notifyStatus">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.INFRA_01_NOTIFY)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="通知时间" prop="notifyTime">
        <el-date-picker
          v-model="formData.notifyTime"
          type="date"
          value-format="x"
          placeholder="选择通知时间"
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
import { OaMeetingAttendeeApi, OaMeetingAttendeeVO } from '@/api/business/meet/meetingAttendee'

/** 会议参会人员 表单 */
defineOptions({ name: 'OaMeetingAttendeeForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  meetingId: undefined,
  userId: undefined,
  confirmStatus: undefined,
  confirmTime: undefined,
  confirmReason: undefined,
  notifyStatus: undefined,
  notifyTime: undefined,
})
const formRules = reactive({
  meetingId: [{ required: true, message: '会议ID不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '参会用户ID不能为空', trigger: 'blur' }],
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
      formData.value = await OaMeetingAttendeeApi.getOaMeetingAttendee(id)
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
    const data = formData.value as unknown as OaMeetingAttendeeVO
    if (formType.value === 'create') {
      await OaMeetingAttendeeApi.createOaMeetingAttendee(data)
      message.success(t('common.createSuccess'))
    } else {
      await OaMeetingAttendeeApi.updateOaMeetingAttendee(data)
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
    meetingId: undefined,
    userId: undefined,
    confirmStatus: undefined,
    confirmTime: undefined,
    confirmReason: undefined,
    notifyStatus: undefined,
    notifyTime: undefined,
  }
  formRef.value?.resetFields()
}
</script>
