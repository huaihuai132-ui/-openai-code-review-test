<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="序列业务名" prop="sequenceBusiness">
        <el-select
          v-model="formData.sequenceBusiness"
          :disabled="!!formData.sequenceCode"
          filterable
          allow-create
          default-first-option
          clearable
          placeholder="请输入或选择序列业务名"
          class="!w-240px"
        >
          <el-option v-for="opt in businessOptionsUniq" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>
      <el-form-item label="序列文件名" prop="sequenceFile">
        <el-input v-model="formData.sequenceFile" placeholder="请输入序列文件名" />
      </el-form-item>
      <el-form-item label="序列值" prop="sequenceValue">
        <el-input v-model="formData.sequenceValue" placeholder="请输入序列值" />
      <el-form-item>
        <!-- <div class="text-12px text-gray-500">在“该分组下新增”时，此字段将自动带入且不可编辑</div> -->
      </el-form-item>

      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { FileBusinessSequenceApi, FileBusinessSequenceVO } from '@/api/infra/file/fileBusinessSequence'

/** 文件业务序列 表单 */
defineOptions({ name: 'FileBusinessSequenceForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const props = defineProps<{ businessOptions: string[] }>()
const businessOptionsUniq = computed<string[]>(() => Array.from(new Set(props.businessOptions || [])))

const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  sequenceCode: undefined,
  sequenceBusiness: undefined,
  sequenceFile: undefined,
  sequenceValue: undefined,
})
const formRules = reactive({
  sequenceBusiness: [{ required: true, message: '序列业务名不能为空', trigger: 'blur' }],
  sequenceFile: [{ required: true, message: '序列文件名不能为空', trigger: 'blur' }],
  sequenceValue: [{ required: true, message: '序列值不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number, preset?: Partial<FileBusinessSequenceVO>) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 如果有预填参数（例如 sequenceCode），先灌入
  if (preset) {
    formData.value = { ...formData.value, ...preset }
  }
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await FileBusinessSequenceApi.getFileBusinessSequence(id)
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
    const data = formData.value as unknown as FileBusinessSequenceVO
    if (formType.value === 'create') {
      await FileBusinessSequenceApi.createFileBusinessSequence(data)
      message.success(t('common.createSuccess'))
    } else {
      await FileBusinessSequenceApi.updateFileBusinessSequence(data)
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
    sequenceCode: undefined,
    sequenceBusiness: undefined,
    sequenceFile: undefined,
    sequenceValue: undefined,
  }
  formRef.value?.resetFields()
}
</script>
