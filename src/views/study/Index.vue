<template>
  <div class="upload-test-container">
    <div class="page-header">
      <h1>📁 文件上传组件综合测试</h1>
      <p>测试四个文件上传组件的完整功能展示</p>
    </div>
    
    <!-- 测试组件卡片 -->
    <div class="test-cards">
      <template v-for="(testCase, index) in testCases" :key="testCase.id">
        <el-card class="test-card" :class="{ 'has-files': hasFiles(testCase) }">
          <!-- 卡片头部 -->
          <template #header>
            <div class="card-header">
              <div class="header-info">
                <h3>{{ index + 1 }}. {{ testCase.title }}</h3>
                <el-tag :type="getTestCaseType(testCase)" size="small">
                  {{ testCase.componentName }}
                </el-tag>
              </div>
              <div class="file-debug" v-if="isDev">
                <span>文件: {{ JSON.stringify(testCase.form.fileList) }}</span>
                <br v-if="testCase.form.sequenceCode" />
                <span v-if="testCase.form.sequenceCode">序列: {{ testCase.form.sequenceCode }}</span>
              </div>
            </div>
          </template>
          
          <!-- 表单内容 -->
          <el-form 
            :model="testCase.form" 
            :rules="testCase.rules" 
            :ref="el => setFormRef(testCase.id, el)"
            label-width="120px"
            class="test-form"
          >
            <!-- 动态表单字段 -->
            <template v-for="field in testCase.fields" :key="field.prop">
              <el-form-item :label="field.label" :prop="field.prop">
                <!-- 文本输入 -->
                <el-input 
                  v-if="field.type === 'input'"
                  v-model="testCase.form[field.prop]" 
                  :placeholder="field.placeholder"
                  :readonly="field.readonly"
                />
                
                <!-- 数字输入 -->
                <el-input-number 
                  v-else-if="field.type === 'number'"
                  v-model="testCase.form[field.prop]" 
                  :min="field.min || 0"
                  :precision="field.precision || 2"
                  :placeholder="field.placeholder"
                  style="width: 100%;"
                />
                
                <!-- 文本域 -->
                <el-input 
                  v-else-if="field.type === 'textarea'"
                  v-model="testCase.form[field.prop]" 
                  type="textarea"
                  :placeholder="field.placeholder"
                  :rows="field.rows || 3"
                />
                
                <!-- 选择器 -->
                <el-select 
                  v-else-if="field.type === 'select'"
                  v-model="testCase.form[field.prop]" 
                  :placeholder="field.placeholder"
                  style="width: 100%;"
                >
                  <el-option 
                    v-for="option in field.options" 
                    :key="option.value"
                    :label="option.label" 
                    :value="option.value" 
                  />
                </el-select>
              </el-form-item>
            </template>
            
            <!-- 文件上传组件 -->
            <el-form-item label="文件上传" prop="fileList">
              <!-- UploadFile 单文件上传 -->
              <UploadFile 
                v-if="testCase.componentName === 'UploadFile'"
                :ref="el => setUploadRef(testCase.id, el)"
                v-model:fileList="testCase.form.fileList"
                :sequence-code="testCase.form.sequenceCode"
                v-bind="testCase.uploadProps"
              />
              
              <!-- BatchFileUpload 批量文件上传 -->
              <BatchFileUpload 
                v-else-if="testCase.componentName === 'BatchFileUpload'"
                :ref="el => setUploadRef(testCase.id, el)"
                v-model:fileList="testCase.form.fileList"
                :sequence-code="testCase.form.sequenceCode"
                v-bind="testCase.uploadProps"
              />
              
              <!-- StaticFileUpload 静态文件上传 -->
              <StaticFileUpload 
                v-else-if="testCase.componentName === 'StaticFileUpload'"
                :ref="el => setUploadRef(testCase.id, el)"
                v-model:fileList="testCase.form.fileList"
                :sequence-code="testCase.form.sequenceCode"
                v-bind="testCase.uploadProps"
              />
              
              <!-- StaticImgUpload 静态图片上传 -->
              <StaticImgUpload 
                v-else-if="testCase.componentName === 'StaticImgUpload'"
                :ref="el => setUploadRef(testCase.id, el)"
                v-model:fileList="testCase.form.fileList"
                :sequence-code="testCase.form.sequenceCode"
                v-bind="testCase.uploadProps"
              />
              

            </el-form-item>
            
            <!-- 操作按钮 -->
            <el-form-item class="action-buttons">
              <el-button 
                type="primary" 
                @click="submitForm(testCase)"
                :loading="testCase.submitting"
              >
                提交表单
              </el-button>
              <el-button @click="resetForm(testCase)">重置表单</el-button>
              <el-button @click="validateFiles(testCase)">验证文件</el-button>
              <el-button type="warning" @click="clearFiles(testCase)">清理文件</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </template>
    </div>

    <!-- 测试结果预览 -->
    <el-card v-if="showPreview" class="preview-card">
      <template #header>
        <div class="card-header">
          <h3>📊 测试结果预览</h3>
          <el-button size="small" @click="showPreview = false">关闭</el-button>
        </div>
      </template>
      <div class="preview-content">
        <pre>{{ JSON.stringify(previewData, null, 2) }}</pre>
      </div>
    </el-card>

    <!-- 全局操作区 -->
    <div class="global-actions">
      <el-button type="success" @click="submitAllForms">🚀 提交所有表单</el-button>
      <el-button type="danger" @click="resetAllForms">🔄 重置所有表单</el-button>
      <el-button @click="togglePreview">{{ showPreview ? '隐藏' : '显示' }}预览</el-button>
      <el-button @click="toggleDev">{{ isDev ? '隐藏' : '显示' }}调试信息</el-button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// TagProps type used in getTestCaseType function
import type { TagProps } from 'element-plus'
import { UploadFile, BatchFileUpload, StaticFileUpload, StaticImgUpload } from '@/components/UploadFile'

// ================= 类型定义 =================
interface FormField {
  prop: string
  label: string
  type: 'input' | 'textarea' | 'number' | 'select'
  placeholder?: string
  readonly?: boolean
  min?: number
  precision?: number
  rows?: number
  options?: Array<{ label: string; value: string | number }>
}

interface TestCase {
  id: string
  title: string
  componentName: 'UploadFile' | 'BatchFileUpload' | 'StaticFileUpload' | 'StaticImgUpload'
  description: string
  form: Record<string, any>
  rules: Record<string, any>
  fields: FormField[]
  uploadProps: Record<string, any>
  submitting: boolean
}

// ================= 响应式数据 =================
const formRefs = ref<Record<string, any>>({})
const uploadRefs = ref<Record<string, any>>({})
const showPreview = ref(false)
const previewData = ref({})
const isDev = ref(false) // 默认关闭调试模式

// ================= 测试案例配置 =================
const testCases = reactive<TestCase[]>([
  {
    id: 'single-file',
    title: '单文件上传测试 (UploadFile)',
    componentName: 'UploadFile',
    description: '测试单个文件上传功能',
    submitting: false,
    form: {
      title: '',
      fileList: [] as number[]
    },
    rules: {
      title: [{ required: true, message: '请输入文件标题', trigger: 'blur' }],
      fileList: [{ required: true, message: '请上传文件', trigger: 'change' }]
    },
    fields: [
      {
        prop: 'title',
        label: '文件标题',
        type: 'input',
        placeholder: '请输入文件标题'
      }
    ],
    uploadProps: {
      key: 'single-upload',
      fileType: 'common',
      mode: 'create',
      directory: 'single',
      tip: '支持上传单个文件，大小不超过10MB'
    }
  },
  {
    id: 'product-batch',
    title: '商品信息录入 (BatchFileUpload - 序列模式)',
    componentName: 'BatchFileUpload',
    description: '测试基于序列编码的批量文件上传',
    submitting: false,
    form: {
      productName: '',
      description: '',
      price: 0,
      sequenceCode: 'SPQD1-20250817',
      fileList: [] as number[]
    },
    rules: {
      productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
      description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }],
      price: [
        { required: true, message: '请输入商品价格', trigger: 'blur' },
        { type: 'number' as const, min: 0, message: '价格不能小于0', trigger: 'blur' }
      ],
      fileList: [{ required: true, message: '请上传商品文件清单', trigger: 'change' }]
    },
    fields: [
      {
        prop: 'productName',
        label: '商品名称',
        type: 'input',
        placeholder: '请输入商品名称'
      },
      {
        prop: 'description',
        label: '商品描述',
        type: 'textarea',
        placeholder: '请输入商品描述',
        rows: 3
      },
      {
        prop: 'price',
        label: '商品价格',
        type: 'number',
        placeholder: '请输入商品价格',
        min: 0,
        precision: 2
      },
      {
        prop: 'sequenceCode',
        label: '序列编码',
        type: 'input',
        readonly: true
      }
    ],
    uploadProps: {
      key: 'product-upload',
      fileType: 'common',
      mode: 'create',
      directory: 'product',
      maxFiles: 5,
      tip: '根据序列编码自动生成文件框，按顺序上传商品文件'
    }
  },
  {
    id: 'document-batch',
    title: '文档上传表单 (BatchFileUpload - 普通模式)',
    componentName: 'BatchFileUpload',
    description: '测试普通模式的批量文件上传',
    submitting: false,
    form: {
      documentTitle: '',
      documentType: '',
      fileList: [] as number[]
    },
    rules: {
      documentTitle: [{ required: true, message: '请输入文档标题', trigger: 'blur' }],
      documentType: [{ required: true, message: '请选择文档类型', trigger: 'change' }],
      fileList: [{ required: true, message: '请上传文档附件', trigger: 'change' }]
    },
    fields: [
      {
        prop: 'documentTitle',
        label: '文档标题',
        type: 'input',
        placeholder: '请输入文档标题'
      },
      {
        prop: 'documentType',
        label: '文档类型',
        type: 'select',
        placeholder: '请选择文档类型',
        options: [
          { label: '技术文档', value: 'tech' },
          { label: '产品资料', value: 'product' },
          { label: '用户手册', value: 'manual' },
          { label: '其他', value: 'other' }
        ]
      }
    ],
    uploadProps: {
      key: 'document-upload',
      fileType: 'common',
      mode: 'create',
      directory: 'documents',
      maxFiles: 10,
      tip: '支持批量选择多个文件，最多10个，单个文件不超过10MB'
    }
  },
  {
    id: 'static-file',
    title: '静态文件上传测试 (StaticFileUpload)',
    componentName: 'StaticFileUpload',
    description: '测试静态文件上传功能',
    submitting: false,
    form: {
      staticTitle: '',
      staticType: '',
      fileList: [] as number[]
    },
    rules: {
      staticTitle: [{ required: true, message: '请输入静态文件标题', trigger: 'blur' }],
      staticType: [{ required: true, message: '请选择静态文件类型', trigger: 'change' }],
      fileList: [{ required: true, message: '请上传静态文件', trigger: 'change' }]
    },
    fields: [
      {
        prop: 'staticTitle',
        label: '静态文件标题',
        type: 'input',
        placeholder: '请输入静态文件标题'
      },
      {
        prop: 'staticType',
        label: '静态文件类型',
        type: 'select',
        placeholder: '请选择静态文件类型',
        options: [
          { label: '图片文件', value: 'image' },
          { label: '文档文件', value: 'document' },
          { label: '压缩文件', value: 'archive' },
          { label: '其他文件', value: 'other' }
        ]
      }
    ],
    uploadProps: {
      key: 'static-upload',
      mode: 'create',
      directory: 'static',
      maxFiles: 5,
      tip: '支持批量选择多个静态文件，最多5个，单个文件不超过10MB'
    }
  },
  {
    id: 'static-image',
    title: '静态图片上传测试 (StaticImgUpload)',
    componentName: 'StaticImgUpload',
    description: '测试单张图片上传功能',
    submitting: false,
    form: {
      imgTitle: '',
      imgCategory: '',
      fileList: [] as number[]
    },
    rules: {
      imgTitle: [{ required: true, message: '请输入图片集标题', trigger: 'blur' }],
      imgCategory: [{ required: true, message: '请选择图片分类', trigger: 'change' }],
      fileList: [{ required: true, message: '请上传图片文件', trigger: 'change' }]
    },
    fields: [
      {
        prop: 'imgTitle',
        label: '图片集标题',
        type: 'input',
        placeholder: '请输入图片集标题'
      },
      {
        prop: 'imgCategory',
        label: '图片分类',
        type: 'select',
        placeholder: '请选择图片分类',
        options: [
          { label: '产品图片', value: 'product' },
          { label: '宣传图片', value: 'promotion' },
          { label: '头像图片', value: 'avatar' },
          { label: '其他图片', value: 'other' }
        ]
      }
    ],
    uploadProps: {
      key: 'static-img-upload',
      mode: 'create',
      directory: 'images',
      maxFiles: 1,
      fileSize: 5,
      tip: '支持上传单张图片，文件大小不超过5MB，支持jpg/png/gif/webp格式'
    }
  }
])

// ================= 计算属性 =================
const hasFiles = computed(() => (testCase: TestCase) => {
  return testCase.form.fileList && testCase.form.fileList.length > 0
})

const getTestCaseType = computed(() => (testCase: TestCase): TagProps['type'] => {
  const typeMap: Record<string, TagProps['type']> = {
    'UploadFile': 'primary',
    'BatchFileUpload': 'success',
    'StaticFileUpload': 'warning',
    'StaticImgUpload': 'danger'
  }
  return typeMap[testCase.componentName] || 'info'
})

// ================= 引用管理 =================
const setFormRef = (id: string, el: any) => {
  if (el) {
    formRefs.value[id] = el
  }
}

const setUploadRef = (id: string, el: any) => {
  if (el) {
    uploadRefs.value[id] = el
  }
}

// ================= 表单操作方法 =================
const submitForm = async (testCase: TestCase) => {
  try {
    testCase.submitting = true
    
    // 1. 验证表单
    const formRef = formRefs.value[testCase.id]
    const formValid = await formRef?.validate()
    if (!formValid) {
      ElMessage.error(`请填写完整的${testCase.title}信息`)
      return
    }
    
    // 2. 验证文件上传
    const uploadRef = uploadRefs.value[testCase.id]
    const fileValidation = uploadRef?.validateFiles?.()
    if (fileValidation && !fileValidation.valid) {
      ElMessage.error(fileValidation.message)
      return
    }
    
    // 3. 获取文件信息
    const fileList = uploadRef?.getFileList?.() || []
    const fileDetails = uploadRef?.getFileDetails?.() || []
    
    // 4. 构造提交数据
    const submitData = {
      testCaseId: testCase.id,
      testCaseTitle: testCase.title,
      componentName: testCase.componentName,
      formData: { ...testCase.form },
      fileList,
      fileDetails,
      submitTime: new Date().toISOString()
    }
    
    console.log(`=== ${testCase.title} 提交数据 ===`)
    console.log(JSON.stringify(submitData, null, 2))
    
    // 5. 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 6. 标记文件为已保存
    uploadRef?.markFilesAsSaved?.()
    
    // 7. 显示预览数据
    previewData.value = submitData
    showPreview.value = true
    
    ElMessage.success(`${testCase.title} 提交成功！`)
    
  } catch (error) {
    console.error(`${testCase.title} 提交失败:`, error)
    ElMessage.error(`${testCase.title} 提交失败，请重试`)
  } finally {
    testCase.submitting = false
  }
}

const resetForm = async (testCase: TestCase) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置 ${testCase.title} 吗？这将清理已上传的文件。`, 
      '确认重置',
      { type: 'warning' }
    )
    
    // 清理未保存的文件
    const uploadRef = uploadRefs.value[testCase.id]
    await uploadRef?.clearUnsavedFiles?.()
    
    // 重置表单数据
    const formRef = formRefs.value[testCase.id]
    formRef?.resetFields()
    
    // 重置文件列表
    testCase.form.fileList = []
    
    // 重置文件上传组件
    uploadRef?.resetComponent?.()
    
    ElMessage.success(`${testCase.title} 重置成功`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`重置 ${testCase.title} 失败:`, error)
    }
  }
}

const validateFiles = (testCase: TestCase) => {
  const uploadRef = uploadRefs.value[testCase.id]
  const validation = uploadRef?.validateFiles?.()
  
  if (validation?.valid) {
    const fileList = uploadRef?.getFileList?.() || []
    const fileDetails = uploadRef?.getFileDetails?.() || []
    
    ElMessage.success(`${testCase.title} 文件验证通过！已上传 ${fileList.length} 个文件`)
    console.log(`${testCase.title} 文件ID列表:`, fileList)
    console.log(`${testCase.title} 文件详细信息:`, fileDetails)
  } else {
    ElMessage.error(validation?.message || `${testCase.title} 文件验证失败`)
  }
}

const clearFiles = async (testCase: TestCase) => {
  try {
    await ElMessageBox.confirm(
      `确定要清理 ${testCase.title} 中所有未保存的文件吗？`, 
      '确认清理',
      { type: 'warning' }
    )
    
    const uploadRef = uploadRefs.value[testCase.id]
    await uploadRef?.clearUnsavedFiles?.()
    ElMessage.success(`${testCase.title} 文件清理完成`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`清理 ${testCase.title} 文件失败:`, error)
    }
  }
}

// ================= 全局操作方法 =================
const submitAllForms = async () => {
  ElMessage.info('开始批量提交所有表单...')
  
  for (const testCase of testCases) {
    if (hasFiles.value(testCase)) {
      await submitForm(testCase)
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  ElMessage.success('所有表单提交完成！')
}

const resetAllForms = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有表单吗？这将清理所有已上传的文件。', 
      '确认重置',
      { type: 'warning' }
    )
    
    for (const testCase of testCases) {
      await resetForm(testCase)
    }
    
    // 隐藏预览
    showPreview.value = false
    previewData.value = {}
    
    ElMessage.success('所有表单重置完成')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量重置表单失败:', error)
    }
  }
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const toggleDev = () => {
  isDev.value = !isDev.value
}



// ================= 生命周期 =================
onMounted(() => {
  console.log('🚀 文件上传组件综合测试页面初始化')
})

onBeforeUnmount(() => {
  // 清理所有未保存的文件
  Object.values(uploadRefs.value).forEach(ref => {
    ref?.clearUnsavedFiles?.()
  })
})
</script>

<style scoped lang="scss">
.upload-test-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  
  h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 16px;
    opacity: 0.9;
  }
}

.test-cards {
  display: grid;
  gap: 24px;
  margin-bottom: 32px;
}

.test-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  
  &.has-files {
    border-color: #67c23a;
    background: linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
      }
    }
    
    .file-debug {
      font-size: 12px;
      font-family: 'Courier New', monospace;
      background: #f1f2f6;
      padding: 4px 8px;
      border-radius: 4px;
      color: #666;
      border: 1px solid #ddd;
    }
  }
}



.test-form {
  .el-form-item {
    margin-bottom: 24px;
    
    &.action-buttons {
      margin-top: 32px;
      
      .el-button {
        margin-right: 12px;
        
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}

.preview-card {
  margin-bottom: 32px;
  border-radius: 12px;
  
  .preview-content {
    pre {
      background: #2d3748;
      color: #e2e8f0;
      padding: 20px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
      overflow: auto;
      max-height: 500px;
      margin: 0;
      
      /* 滚动条样式 */
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      &::-webkit-scrollbar-track {
        background: #4a5568;
        border-radius: 4px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #718096;
        border-radius: 4px;
        
        &:hover {
          background: #a0aec0;
        }
      }
    }
  }
}

.global-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  .el-button {
    padding: 12px 24px;
    font-weight: 500;
    border-radius: 8px;
    
    &.el-button--success {
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      border: none;
    }
    
    &.el-button--danger {
      background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
      border: none;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-test-container {
    padding: 16px;
  }
  
  .page-header {
    padding: 20px;
    
    h1 {
      font-size: 24px;
    }
    
    p {
      font-size: 14px;
    }
  }
  
  .test-form {
    .el-form-item {
      &.action-buttons {
        .el-button {
          width: 100%;
          margin-right: 0;
          margin-bottom: 8px;
        }
      }
    }
  }
  
  .global-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>
