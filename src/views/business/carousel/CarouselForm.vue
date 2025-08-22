<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="跳转链接" prop="jumpLink">
        <el-input v-model="formData.jumpLink" placeholder="请输入跳转链接" />
      </el-form-item>
      <el-form-item label="Banner图片URL" prop="bannerImage">
        <UploadImg v-model="formData.bannerImage" />
      </el-form-item>
      <el-form-item label="启用状态" prop="isEnabled">
        <el-radio-group v-model="formData.isEnabled">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.SYS_ENABLE_TYPE)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="顺序" prop="sortOrder">
        <el-input v-model="formData.sortOrder" placeholder="请输入顺序" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getBoolDictOptions, DICT_TYPE } from '@/utils/dict'
import { CarouselApi, CarouselVO } from '@/api/business/carousel'

/** 轮播管理 表单 */
defineOptions({ name: 'CarouselForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  title: undefined,
  jumpLink: undefined,
  bannerImage: undefined,
  isEnabled: undefined,
  sortOrder: undefined,
})
const formRules = reactive({
  title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  jumpLink: [{ required: true, message: '跳转链接不能为空', trigger: 'blur' }],
  bannerImage: [{ required: true, message: 'Banner图片URL不能为空', trigger: 'blur' }],
  isEnabled: [{ required: true, message: '启用状态不能为空', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '顺序不能为空', trigger: 'blur' }],
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
      formData.value = await CarouselApi.getCarousel(id)
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
    const data = formData.value as unknown as CarouselVO
    if (formType.value === 'create') {
      await CarouselApi.createCarousel(data)
      message.success(t('common.createSuccess'))
    } else {
      await CarouselApi.updateCarousel(data)
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
    title: undefined,
    jumpLink: undefined,
    bannerImage: undefined,
    isEnabled: undefined,
    sortOrder: undefined,
  }
  formRef.value?.resetFields()
}
</script>