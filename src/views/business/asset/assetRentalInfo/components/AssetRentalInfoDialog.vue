<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="isEdit ? '编辑租赁信息' : '新增租赁信息'"
    width="60%"
    :before-close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="承租户" prop="tenant">
            <el-input v-model="form.tenant" placeholder="请输入承租户名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="押金" prop="deposit">
            <el-input-number v-model="form.deposit" :min="0" :precision="2" style="width: 100%" />
            <span class="unit">元</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="资产名称" prop="assetName">
            <el-input v-model="form.assetName" placeholder="请输入资产名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产地址" prop="address">
            <el-input v-model="form.address" placeholder="请输入资产地址" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="合同开始日期" prop="contractStartDate">
            <el-date-picker
              v-model="form.contractStartDate"
              type="date"
              placeholder="选择合同开始日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合同结束日期" prop="contractEndDate">
            <el-date-picker
              v-model="form.contractEndDate"
              type="date"
              placeholder="选择合同结束日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="收租截止期限" prop="rentEndDate">
            <el-date-picker
              v-model="form.rentEndDate"
              type="date"
              placeholder="选择收租截止日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年租金" prop="annualRent">
            <el-input-number
              v-model="form.annualRent"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
            <span class="unit">元/年</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="外部资产名称" prop="externalAssetName">
            <el-input v-model="form.externalAssetName" placeholder="请输入外部资产名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="经营用途" prop="businessPurpose">
            <el-input v-model="form.businessPurpose" placeholder="请输入经营用途" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref()
const loading = ref(false)

// 表单数据（去除租金，新增押金与资产相关字段）
const form = reactive({
  tenant: '',
  assetName: '',
  address: '',
  externalAssetName: '',
  businessPurpose: '',
  deposit: 0,
  contractStartDate: '',
  contractEndDate: '',
  rentEndDate: '',
  annualRent: 0,
  phone: '',
})

// 表单验证规则
const rules = {
  tenant: [{ required: true, message: '请输入承租户名称', trigger: 'blur' }],
  assetName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入资产地址', trigger: 'blur' }],
  deposit: [{ required: true, message: '请输入押金', trigger: 'blur' }],
  contractStartDate: [{ required: true, message: '请选择合同开始日期', trigger: 'change' }],
  contractEndDate: [{ required: true, message: '请选择合同结束日期', trigger: 'change' }],
  rentEndDate: [{ required: true, message: '请选择收租截止日期', trigger: 'change' }],
  annualRent: [{ required: true, message: '请输入年租金', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
}

// 监听数据变化，用于编辑模式
watch(
  () => props.data,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      Object.assign(form, newData)
    }
  },
  { immediate: true },
)

// 监听对话框显示状态
watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetForm()
    }
  },
)

// 已去除月租金字段；如需自动计算年租金，可在其他字段变更时自定义

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    tenant: '',
    assetName: '',
    address: '',
    externalAssetName: '',
    businessPurpose: '',
    deposit: 0,
    contractStartDate: '',
    contractEndDate: '',
    rentEndDate: '',
    annualRent: 0,
    phone: '',
  })
  formRef.value?.resetFields()
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 模拟提交延迟
    await new Promise((resolve) => setTimeout(resolve, 1000))

    emit('submit', { ...form })
    ElMessage.success(props.isEdit ? '编辑成功' : '新增成功')
    handleClose()
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.unit {
  margin-left: 8px;
  color: #666;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-date-picker) {
  width: 100%;
}
</style>
