<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="申请人的用户编号" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入申请人的用户编号" />
      </el-form-item>
      <el-form-item label="用车申请流程实例的编号" prop="useCarProcessInstanceId">
        <el-input v-model="formData.useCarProcessInstanceId" placeholder="请输入用车申请流程实例的编号" />
      </el-form-item>
      <el-form-item label="车编号" prop="carNo">
        <el-input v-model="formData.carNo" placeholder="请输入车编号" />
      </el-form-item>
      <el-form-item label="里程数" prop="mileage">
        <el-input v-model="formData.mileage" placeholder="请输入里程数" />
      </el-form-item>
      <el-form-item label="目的地" prop="destination">
        <el-input v-model="formData.destination" placeholder="请输入目的地" />
      </el-form-item>
      <el-form-item label="用车时间" prop="useTime">
        <el-date-picker
          v-model="formData.useTime"
          type="date"
          value-format="x"
          placeholder="选择用车时间"
        />
      </el-form-item>
      <el-form-item label="还车时间" prop="returnTime">
        <el-date-picker
          v-model="formData.returnTime"
          type="date"
          value-format="x"
          placeholder="选择还车时间"
        />
      </el-form-item>
      <el-form-item label="文件序列编码" prop="sequenceCode">
        <el-input v-model="formData.sequenceCode" placeholder="请输入文件序列编码" />
      </el-form-item>
      <el-form-item label="文件id列表" prop="fileList">
        <el-input v-model="formData.fileList" placeholder="请输入文件id列表" />
      </el-form-item>
      <el-form-item label="审批状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="流程实例的编号" prop="processInstanceId">
        <el-input v-model="formData.processInstanceId" placeholder="请输入流程实例的编号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ReturnCarApi, ReturnCarVO } from '@/api/business/returnCar'

/** 还车申请表单 表单 */
defineOptions({ name: 'ReturnCarForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  useCarProcessInstanceId: undefined,
  carNo: undefined,
  mileage: undefined,
  destination: undefined,
  useTime: undefined,
  returnTime: undefined,
  sequenceCode: undefined,
  fileList: undefined,
  status: undefined,
  processInstanceId: undefined,
})
const formRules = reactive({
  userId: [{ required: true, message: '申请人的用户编号不能为空', trigger: 'blur' }],
  useCarProcessInstanceId: [{ required: true, message: '用车申请流程实例的编号不能为空', trigger: 'blur' }],
  mileage: [{ required: true, message: '里程数不能为空', trigger: 'blur' }],
  destination: [{ required: true, message: '目的地不能为空', trigger: 'blur' }],
  useTime: [{ required: true, message: '用车时间不能为空', trigger: 'blur' }],
  returnTime: [{ required: true, message: '还车时间不能为空', trigger: 'blur' }],
  sequenceCode: [{ required: true, message: '文件序列编码不能为空', trigger: 'blur' }],
  fileList: [{ required: true, message: '文件id列表不能为空', trigger: 'blur' }],
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
      formData.value = await ReturnCarApi.getReturnCar(id)
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
    const data = formData.value as unknown as ReturnCarVO
    if (formType.value === 'create') {
      await ReturnCarApi.createReturnCar(data)
      message.success(t('common.createSuccess'))
    } else {
      await ReturnCarApi.updateReturnCar(data)
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
    useCarProcessInstanceId: undefined,
    carNo: undefined,
    mileage: undefined,
    destination: undefined,
    useTime: undefined,
    returnTime: undefined,
    sequenceCode: undefined,
    fileList: undefined,
    status: undefined,
    processInstanceId: undefined,
  }
  formRef.value?.resetFields()
}
</script>
