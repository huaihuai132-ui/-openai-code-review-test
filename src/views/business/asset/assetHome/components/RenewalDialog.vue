<template>
  <el-dialog
    v-model="dialogVisible"
    title="资产续期"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="renewalFormRef"
      :model="renewalForm"
      :rules="renewalRules"
      label-width="120px"
    >
      <el-form-item label="资产名称">
        <el-input v-model="renewalForm.assetName" readonly />
      </el-form-item>
      <el-form-item label="外部资产名称">
        <el-input v-model="renewalForm.externalAssetName" readonly />
      </el-form-item>
      <el-form-item label="详细地址">
        <el-input v-model="renewalForm.address" readonly />
      </el-form-item>
      <el-form-item label="承租人">
        <el-input v-model="renewalForm.tenant" readonly />
      </el-form-item>
      <el-form-item label="合同期限">
        <el-input v-model="renewalForm.contractPeriod" readonly />
      </el-form-item>
      <el-form-item label="收租截至期限">
        <el-input v-model="renewalForm.rentEndDate" readonly />
      </el-form-item>
      <el-form-item label="续签至" prop="renewalPeriod">
        <el-select v-model="renewalForm.renewalPeriod" placeholder="请选择续签期限" @change="calculateNewEndDate">
          <el-option label="半年" value="6" />
          <el-option label="一年" value="12" />
          <el-option label="二年" value="24" />
          <el-option label="三年" value="36" />
        </el-select>
      </el-form-item>
      <el-form-item label="最新合同期限">
        <el-input v-model="renewalForm.newContractPeriod" readonly />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirmRenewal">确认续期</el-button>
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

const renewalFormRef = ref()

const dialogVisible = computed({
  get() {
    return props.visible
  },
  set(value) {
    emit('update:visible', value)
  }
})

// 表单数据
const renewalForm = ref({
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
const renewalRules = {
  renewalPeriod: [
    { required: true, message: '请选择续签期限', trigger: 'change' }
  ]
}

// 监听props.data变化，更新表单数据
watch(() => props.data, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    renewalForm.value = {
      assetName: newData.assetName || '岱宝山路9号（1-4层）',
      externalAssetName: newData.externalAssetName || '外部-岱宝山路9号',
      address: newData.address || '江西省鹰潭市月湖区岱宝山路9号',
      tenant: newData.tenant || '孙八',
      contractPeriod: newData.contractPeriod || '2024-05-01 至 2027-04-30',
      rentEndDate: newData.rentEndDate || '2027-04-30',
      renewalPeriod: '',
      newContractPeriod: ''
    }
  }
}, { immediate: true })

// 计算新的合同期限
const calculateNewEndDate = () => {
  if (!renewalForm.value.renewalPeriod || !renewalForm.value.rentEndDate) {
    renewalForm.value.newContractPeriod = ''
    return
  }

  const currentEndDate = new Date(renewalForm.value.rentEndDate)
  const months = parseInt(renewalForm.value.renewalPeriod)
  
  // 计算新的结束日期
  const newEndDate = new Date(currentEndDate)
  newEndDate.setMonth(newEndDate.getMonth() + months)
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }
  
  renewalForm.value.newContractPeriod = `${renewalForm.value.rentEndDate} 至 ${formatDate(newEndDate)}`
}

// 关闭弹窗
const handleClose = () => {
  renewalForm.value.renewalPeriod = ''
  renewalForm.value.newContractPeriod = ''
  dialogVisible.value = false
}

// 确认续期   确定后后端要返回去除了刚刚处理了续期的数据列表
const handleConfirmRenewal = async () => {
  if (!renewalFormRef.value) return
  
  try {
    await renewalFormRef.value.validate()
    
    // 发送确认事件
    emit('confirm', {
      ...renewalForm.value
    })
    
    ElMessage.success('续期申请提交成功')
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
