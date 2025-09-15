<template>
  <el-dialog
    v-model="dialogVisible"
    title="合同续签"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="contractRenewalFormRef"
      :model="contractRenewalForm"
      :rules="contractRenewalRules"
      label-width="120px"
    >
      <el-form-item label="资产名称">
        <el-input v-model="contractRenewalForm.assetName" readonly />
      </el-form-item>
      <el-form-item label="外部资产名称">
        <el-input v-model="contractRenewalForm.externalAssetName" readonly />
      </el-form-item>
      <el-form-item label="详细地址">
        <el-input v-model="contractRenewalForm.address" readonly />
      </el-form-item>
      <el-form-item label="承租人">
        <el-input v-model="contractRenewalForm.tenant" readonly />
      </el-form-item>
      <el-form-item label="合同期限">
        <el-input v-model="contractRenewalForm.contractPeriod" readonly />
      </el-form-item>
      <el-form-item label="收租截至期限">
        <el-input v-model="contractRenewalForm.rentEndDate" readonly />
      </el-form-item>
      <el-form-item label="续约至" prop="renewalPeriod">
        <el-select v-model="contractRenewalForm.renewalPeriod" placeholder="请选择续约期限" @change="calculateNewEndDate">
          <el-option label="三年" value="36" />
        </el-select>
      </el-form-item>
      <el-form-item label="最新合同期限">
        <el-input v-model="contractRenewalForm.newContractPeriod" readonly />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirmRenewal">确认续签</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const contractRenewalFormRef = ref()

const dialogVisible = computed({
  get() {
    return props.visible
  },
  set(value) {
    emit('update:visible', value)
  }
})

// 表单数据
const contractRenewalForm = ref({
  assetName: '',
  externalAssetName: '',
  address: '',
  tenant: '',
  contractPeriod: '',
  rentEndDate: '',
  renewalPeriod: '',
  newContractPeriod: ''
})

// 表单验证规则
const contractRenewalRules = {
  renewalPeriod: [
    { required: true, message: '请选择续约期限', trigger: 'change' }
  ]
}

// 监听props.data变化，更新表单数据
watch(() => props.data, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    contractRenewalForm.value = {
      assetName: newData.assetName || '环城西路6号-2#店面',
      externalAssetName: newData.externalAssetName || '外部-环城西路6号-2',
      address: newData.address || '江西省鹰潭市月湖区环城西路6号',
      tenant: newData.tenant || '赵六',
      contractPeriod: newData.contractPeriod || '2024-01-15 至 2026-12-14',
      rentEndDate: newData.rentEndDate || '2026-12-14',
      renewalPeriod: '',
      newContractPeriod: ''
    }
  }
}, { immediate: true })

// 计算新的合同期限
const calculateNewEndDate = () => {
  if (!contractRenewalForm.value.renewalPeriod || !contractRenewalForm.value.rentEndDate) {
    contractRenewalForm.value.newContractPeriod = ''
    return
  }

  const currentEndDate = new Date(contractRenewalForm.value.rentEndDate)
  const months = parseInt(contractRenewalForm.value.renewalPeriod)
  
  // 计算新的结束日期
  const newEndDate = new Date(currentEndDate)
  newEndDate.setMonth(newEndDate.getMonth() + months)
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }
  
  contractRenewalForm.value.newContractPeriod = `${contractRenewalForm.value.rentEndDate} 至 ${formatDate(newEndDate)}`
}

// 关闭弹窗
const handleClose = () => {
  contractRenewalForm.value.renewalPeriod = ''
  contractRenewalForm.value.newContractPeriod = ''
  dialogVisible.value = false
}

// 确认续签
const handleConfirmRenewal = async () => {
  if (!contractRenewalFormRef.value) return
  
  try {
    await contractRenewalFormRef.value.validate()
    
    // 发送确认事件
    emit('confirm', {
      ...contractRenewalForm.value
    })
    
    ElMessage.success('续签申请提交成功')
    handleClose()
  } catch (error) {
    console.log('验证失败:', error)
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}

/* 只读输入框样式 */
:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
}

:deep(.el-input.is-disabled .el-input__inner) {
  color: #606266;
  -webkit-text-fill-color: #606266;
}

/* 表单项样式 */
.el-form-item {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}
</style>
