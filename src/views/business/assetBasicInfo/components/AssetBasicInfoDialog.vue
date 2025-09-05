<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    :title="isEdit ? '编辑资产' : '新增资产'" 
    width="80%"
    :before-close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="资产名称" prop="assetName">
            <el-input v-model="form.assetName" placeholder="请输入资产名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地址" prop="address">
            <el-input v-model="form.address" placeholder="请输入地址" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="房产面积" prop="buildingArea">
            <el-input-number v-model="form.buildingArea" :min="0" :precision="2" style="width: 100%" />
            <span class="unit">㎡</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="土地面积" prop="landArea">
            <el-input-number v-model="form.landArea" :min="0" :precision="2" style="width: 100%" />
            <span class="unit">㎡</span>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产权证号" prop="propertyNumber">
            <el-input v-model="form.propertyNumber" placeholder="请输入产权证号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否办证过户" prop="isTransferred">
            <el-radio-group v-model="form.isTransferred">
              <el-radio :label="true">已过户</el-radio>
              <el-radio :label="false">未过户</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="使用情况" prop="usage">
            <el-select v-model="form.usage" placeholder="请选择使用情况" style="width: 100%">
              <el-option label="出租" value="出租" />
              <el-option label="自用" value="自用" />
              <el-option label="闲置" value="闲置" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出租方式" prop="rentalMethod">
            <el-select v-model="form.rentalMethod" placeholder="请选择出租方式" style="width: 100%">
              <el-option label="整租" value="整租" />
              <el-option label="分租" value="分租" />
              <el-option label="自用" value="自用" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="租金" prop="rent">
            <el-input-number v-model="form.rent" :min="0" :precision="2" style="width: 100%" />
            <span class="unit">元/月</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="价值(万元)" prop="value">
            <el-input-number v-model="form.value" :min="0" :precision="2" style="width: 100%" />
            <span class="unit">万元</span>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="办证过程中遇到的问题" prop="transferIssues">
            <el-input 
              v-model="form.transferIssues" 
              type="textarea" 
              :rows="3"
              placeholder="请输入办证过程中遇到的问题（如无问题请填写'无'）" 
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="划拨文件" prop="allocationFile">
            <el-upload
              class="upload-demo"
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="fileList"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持 PDF、DOC、DOCX 格式文件，文件大小不超过 10MB
                </div>
              </template>
            </el-upload>
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
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref()
const loading = ref(false)
const fileList = ref([])

// 表单数据
const form = reactive({
  assetName: '',
  address: '',
  buildingArea: 0,
  landArea: 0,
  propertyNumber: '',
  isTransferred: false,
  usage: '',
  rentalMethod: '',
  rent: 0,
  value: 0,
  transferIssues: '',
  allocationFile: ''
})

// 表单验证规则
const rules = {
  assetName: [
    { required: true, message: '请输入资产名称', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ],
  propertyNumber: [
    { required: true, message: '请输入产权证号', trigger: 'blur' }
  ],
  usage: [
    { required: true, message: '请选择使用情况', trigger: 'change' }
  ],
  rentalMethod: [
    { required: true, message: '请选择出租方式', trigger: 'change' }
  ]
}

// 监听数据变化，用于编辑模式
watch(() => props.data, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    Object.assign(form, newData)
    if (newData.allocationFile) {
      fileList.value = [{
        name: newData.allocationFile,
        url: '#'
      }]
    }
  }
}, { immediate: true })

// 监听对话框显示状态
watch(() => props.visible, (visible) => {
  if (!visible) {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    assetName: '',
    address: '',
    buildingArea: 0,
    landArea: 0,
    propertyNumber: '',
    isTransferred: false,
    usage: '',
    rentalMethod: '',
    rent: 0,
    value: 0,
    transferIssues: '',
    allocationFile: ''
  })
  fileList.value = []
  formRef.value?.resetFields()
}

// 文件上传处理
const handleFileChange = (file) => {
  form.allocationFile = file.name
  fileList.value = [file]
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
    await new Promise(resolve => setTimeout(resolve, 1000))
    
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

:deep(.el-select) {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload__tip) {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}
</style>
