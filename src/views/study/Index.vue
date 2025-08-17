<template>
  <div class="form-container">
    <h1>批量文件上传测试 (无序列编码)</h1>
    
    <!-- 
      注释掉的单个文件上传测试 (UploadFile组件)
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <span>单个文件上传测试</span>
          </div>
        </template>
        <UploadFile 
          ref="singleUploadFileRef"
          v-model:fileList="singleForm.fileList"
          file-type="common"
          mode="create"
          directory="single"
          :max-files="1"
        />
      </el-card>
    -->
    
    <!-- 
      注释掉的批量有序列编码测试
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <span>商品信息录入 (序列模式)</span>
          </div>
        </template>
        <el-form :model="productForm" :rules="rules" ref="formRef" label-width="120px">
          <el-form-item label="商品名称" prop="productName">
            <el-input v-model="productForm.productName" placeholder="请输入商品名称" />
          </el-form-item>
          <el-form-item label="序列编码">
            <el-input v-model="productForm.sequenceCode" readonly />
          </el-form-item>
          <el-form-item label="商品文件清单" prop="fileList">
            <BatchFileUpload 
              ref="uploadFileRef"
              v-model:fileList="productForm.fileList"
              :sequence-code="productForm.sequenceCode"
              file-type="common"
              mode="create"
              directory="product"
              :max-files="5"
            />
          </el-form-item>
        </el-form>
      </el-card>
    -->
    
    
    <!-- 批量模式测试 (无序列编码) -->
<!--    <el-card class="form-card">-->
<!--      <template #header>-->
<!--        <div class="card-header">-->
<!--          <span>文档上传表单 (批量模式 - 无序列编码)</span>-->
<!--        </div>-->
<!--      </template>-->
<!--      -->
<!--      <el-form :model="documentForm" :rules="documentRules" ref="documentFormRef" label-width="120px">-->
<!--        &lt;!&ndash; 文档标题 &ndash;&gt;-->
<!--        <el-form-item label="文档标题" prop="documentTitle">-->
<!--          <el-input v-model="documentForm.documentTitle" placeholder="请输入文档标题" />-->
<!--        </el-form-item>-->
<!--        -->
<!--        &lt;!&ndash; 文档类型 &ndash;&gt;-->
<!--        <el-form-item label="文档类型" prop="documentType">-->
<!--          <el-select v-model="documentForm.documentType" placeholder="请选择文档类型" style="width: 100%;">-->
<!--            <el-option label="技术文档" value="tech" />-->
<!--            <el-option label="产品资料" value="product" />-->
<!--            <el-option label="用户手册" value="manual" />-->
<!--            <el-option label="其他" value="other" />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        -->
<!--        &lt;!&ndash; 批量文件上传 (无序列模式) &ndash;&gt;-->
<!--        <el-form-item label="文档附件" prop="fileList">-->
<!--          <BatchFileUpload -->
<!--            ref="batchUploadFileRef"-->
<!--            v-model:fileList="documentForm.fileList"-->
<!--            file-type="common"-->
<!--            mode="create"-->
<!--            directory="documents"-->
<!--            :max-files="10"-->
<!--            tip="支持批量选择多个文件，最多10个，单个文件不超过10MB"-->
<!--          />-->
<!--        </el-form-item>-->
<!--        -->
<!--        &lt;!&ndash; 操作按钮 &ndash;&gt;-->
<!--        <el-form-item>-->
<!--          <el-button type="primary" @click="submitDocumentForm">提交表单</el-button>-->
<!--          <el-button @click="resetDocumentForm">重置表单</el-button>-->
<!--          <el-button @click="validateDocumentFiles">验证文件</el-button>-->
<!--          <el-button type="danger" @click="clearDocumentFiles">清理文件</el-button>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </el-card>-->

    <!-- 静态文件上传测试 -->
<!--    <el-card class="form-card" style="margin-top: 20px;">-->
<!--      <template #header>-->
<!--        <div class="card-header">-->
<!--          <span>静态文件上传测试 (无序列编码)</span>-->
<!--        </div>-->
<!--      </template>-->
<!--      -->
<!--      <el-form :model="staticForm" :rules="staticRules" ref="staticFormRef" label-width="120px">-->
<!--        &lt;!&ndash; 静态文件标题 &ndash;&gt;-->
<!--        <el-form-item label="静态文件标题" prop="staticTitle">-->
<!--          <el-input v-model="staticForm.staticTitle" placeholder="请输入静态文件标题" />-->
<!--        </el-form-item>-->
<!--        -->
<!--        &lt;!&ndash; 静态文件类型 &ndash;&gt;-->
<!--        <el-form-item label="静态文件类型" prop="staticType">-->
<!--          <el-select v-model="staticForm.staticType" placeholder="请选择静态文件类型" style="width: 100%;">-->
<!--            <el-option label="图片文件" value="image" />-->
<!--            <el-option label="文档文件" value="document" />-->
<!--            <el-option label="压缩文件" value="archive" />-->
<!--            <el-option label="其他文件" value="other" />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        -->
<!--        &lt;!&ndash; 静态文件上传 (无序列模式) &ndash;&gt;-->
<!--        <el-form-item label="静态文件" prop="fileList">-->
<!--          <StaticFileUpload -->
<!--            ref="staticUploadFileRef"-->
<!--            v-model:fileList="staticForm.fileList"-->
<!--            mode="create"-->
<!--            directory="static"-->
<!--            :max-files="5"-->
<!--            tip="支持批量选择多个静态文件，最多5个，单个文件不超过10MB"-->
<!--          />-->
<!--        </el-form-item>-->
<!--        -->
<!--        &lt;!&ndash; 操作按钮 &ndash;&gt;-->
<!--        <el-form-item>-->
<!--          <el-button type="primary" @click="submitStaticForm">提交表单</el-button>-->
<!--          <el-button @click="resetStaticForm">重置表单</el-button>-->
<!--          <el-button @click="validateStaticFiles">验证文件</el-button>-->
<!--          <el-button type="danger" @click="clearStaticFiles">清理文件</el-button>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </el-card>-->

    <!-- 静态图片上传测试 (单图片模式) -->
    <el-card class="form-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>静态图片上传测试 (单图片模式)</span>
        </div>
      </template>
      
      <el-form :model="staticImgForm" :rules="staticImgRules" ref="staticImgFormRef" label-width="120px">
        <!-- 静态图片标题 -->
        <el-form-item label="图片集标题" prop="imgTitle">
          <el-input v-model="staticImgForm.imgTitle" placeholder="请输入图片集标题" />
        </el-form-item>
        
        <!-- 图片分类 -->
        <el-form-item label="图片分类" prop="imgCategory">
          <el-select v-model="staticImgForm.imgCategory" placeholder="请选择图片分类" style="width: 100%;">
            <el-option label="产品图片" value="product" />
            <el-option label="宣传图片" value="promotion" />
            <el-option label="头像图片" value="avatar" />
            <el-option label="其他图片" value="other" />
          </el-select>
        </el-form-item>
        
        <!-- 静态图片上传 (单图片模式) -->
        <el-form-item label="图片文件" prop="fileList">
          <StaticImgUpload 
            ref="staticImgUploadFileRef"
            v-model:fileList="staticImgForm.fileList"
            mode="create"
            directory="images"
            :max-files="1"
            :file-size="5"
            tip="支持上传单张图片，文件大小不超过5MB，支持jpg/png/gif/webp格式"
          />
        </el-form-item>
        
        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitStaticImgForm">提交表单</el-button>
          <el-button @click="resetStaticImgForm">重置表单</el-button>
          <el-button @click="validateStaticImages">验证图片</el-button>
          <el-button type="danger" @click="clearStaticImages">清理图片</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 表单数据预览 -->
    <el-card class="preview-card" v-if="showPreview">
      <template #header>
        <div class="card-header">
          <span>表单数据预览</span>
        </div>
      </template>
      <pre>{{ JSON.stringify(formPreview, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { BatchFileUpload, StaticFileUpload, StaticImgUpload } from '@/components/UploadFile'

// 表单引用
const documentFormRef = ref()
const batchUploadFileRef = ref()
const staticFormRef = ref()
const staticUploadFileRef = ref()
const staticImgFormRef = ref()
const staticImgUploadFileRef = ref()

// 注释掉的表单引用
// const formRef = ref()
// const uploadFileRef = ref()

// 注释掉的商品表单数据
// const productForm = ref({
//   productName: '',
//   description: '',
//   price: 0,
//   sequenceCode: 'SPQD1-20250817', // 固定不可修改
//   fileList: [] as number[]
// })

// 文档表单数据 (批量模式测试)
const documentForm = ref({
  documentTitle: '',
  documentType: '',
  fileList: [] as number[]
})

// 静态文件表单数据
const staticForm = ref({
  staticTitle: '',
  staticType: '',
  fileList: [] as number[]
})

// 静态图片表单数据
const staticImgForm = ref({
  imgTitle: '',
  imgCategory: '',
  fileList: [] as number[]
})

// 注释掉的商品表单验证规则
// const rules = {
//   productName: [
//     { required: true, message: '请输入商品名称', trigger: 'blur' }
//   ],
//   description: [
//     { required: true, message: '请输入商品描述', trigger: 'blur' }
//   ],
//   price: [
//     { required: true, message: '请输入商品价格', trigger: 'blur' },
//     { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' }
//   ],
//   fileList: [
//     { required: true, message: '请上传商品文件清单', trigger: 'change' }
//   ]
// }

// 文档表单验证规则
const documentRules = {
  documentTitle: [
    { required: true, message: '请输入文档标题', trigger: 'blur' }
  ],
  documentType: [
    { required: true, message: '请选择文档类型', trigger: 'change' }
  ],
  fileList: [
    { required: true, message: '请上传文档附件', trigger: 'change' }
  ]
}

// 静态文件表单验证规则
const staticRules = {
  staticTitle: [
    { required: true, message: '请输入静态文件标题', trigger: 'blur' }
  ],
  staticType: [
    { required: true, message: '请选择静态文件类型', trigger: 'change' }
  ],
  fileList: [
    { required: true, message: '请上传静态文件', trigger: 'change' }
  ]
}

// 静态图片表单验证规则
const staticImgRules = {
  imgTitle: [
    { required: true, message: '请输入图片集标题', trigger: 'blur' }
  ],
  imgCategory: [
    { required: true, message: '请选择图片分类', trigger: 'change' }
  ],
  fileList: [
    { required: true, message: '请上传图片文件', trigger: 'change' }
  ]
}

// 表单预览相关
const showPreview = ref(false)
const formPreview = ref({})

// 注释掉的商品表单相关方法
/*
// 提交表单
const submitForm = async () => {
  try {
    // 1. 验证表单
    const formValid = await formRef.value?.validate()
    if (!formValid) {
      ElMessage.error('请填写完整的表单信息')
      return
    }
    
    // 2. 验证文件上传
    const fileValidation = uploadFileRef.value?.validateFiles()
    if (!fileValidation.valid) {
      ElMessage.error(fileValidation.message)
      return
    }
    
    // 3. 获取最新的文件列表
    const fileList = uploadFileRef.value?.getFileList() || []
    const fileDetails = uploadFileRef.value?.getFileDetails() || []
    
    // 4. 构造提交数据
    const submitData = {
      ...productForm.value,
      fileList,
      fileDetails,
      submitTime: new Date().toISOString()
    }
    
    console.log('=== 表单提交数据 ===')
    console.log(JSON.stringify(submitData, null, 2))
    
    // 5. 模拟提交成功
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 6. 标记文件为已保存（避免被清理）
    uploadFileRef.value?.markFilesAsSaved()
    
    // 7. 显示预览数据
    formPreview.value = submitData
    showPreview.value = true
    
    ElMessage.success('商品表单提交成功！')
    
  } catch (error) {
    console.error('表单提交失败:', error)
    ElMessage.error('表单提交失败，请重试')
  }
}

// 重置表单
const resetForm = async () => {
  try {
    await ElMessageBox.confirm('确定要重置表单吗？这将清理已上传的文件。', '确认重置', {
      type: 'warning'
    })
    
    // 清理未保存的文件
    await uploadFileRef.value?.clearUnsavedFiles()
    
    // 重置表单数据
    formRef.value?.resetFields()
    productForm.value.fileList = []
    
    // 重置文件上传组件
    uploadFileRef.value?.resetComponent()
    
    // 隐藏预览
    showPreview.value = false
    formPreview.value = {}
    
    ElMessage.success('表单重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置表单失败:', error)
    }
  }
}

// 验证文件
const validateFiles = () => {
  const validation = uploadFileRef.value?.validateFiles()
  if (validation?.valid) {
    const fileList = uploadFileRef.value?.getFileList() || []
    const fileDetails = uploadFileRef.value?.getFileDetails() || []
    
    ElMessage.success(`文件验证通过！已上传 ${fileList.length} 个文件`)
    console.log('文件ID列表:', fileList)
    console.log('文件详细信息:', fileDetails)
  } else {
    ElMessage.error(validation?.message || '文件验证失败')
  }
}

// 清理文件
const clearFiles = async () => {
  try {
    await ElMessageBox.confirm('确定要清理所有未保存的文件吗？', '确认清理', {
      type: 'warning'
    })
    
    await uploadFileRef.value?.clearUnsavedFiles()
    ElMessage.success('文件清理完成')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清理文件失败:', error)
    }
  }
}
*/

// ========== 文档表单相关方法 ==========
// 提交文档表单
const submitDocumentForm = async () => {
  try {
    // 1. 验证表单
    const formValid = await documentFormRef.value?.validate()
    if (!formValid) {
      ElMessage.error('请填写完整的文档表单信息')
      return
    }
    
    // 2. 验证文件上传
    const fileValidation = batchUploadFileRef.value?.validateFiles()
    if (!fileValidation.valid) {
      ElMessage.error(fileValidation.message)
      return
    }
    
    // 3. 获取最新的文件列表
    const fileList = batchUploadFileRef.value?.getFileList() || []
    const fileDetails = batchUploadFileRef.value?.getFileDetails() || []
    
    // 4. 构造提交数据
    const submitData = {
      ...documentForm.value,
      fileList,
      fileDetails,
      submitTime: new Date().toISOString()
    }
    
    console.log('=== 文档表单提交数据 ===')
    console.log(JSON.stringify(submitData, null, 2))
    
    // 5. 模拟提交成功
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 6. 标记文件为已保存（避免被清理）
    batchUploadFileRef.value?.markFilesAsSaved()
    
    // 7. 显示预览数据
    formPreview.value = submitData
    showPreview.value = true
    
    ElMessage.success('文档表单提交成功！')
    
  } catch (error) {
    console.error('文档表单提交失败:', error)
    ElMessage.error('文档表单提交失败，请重试')
  }
}

// 重置文档表单
const resetDocumentForm = async () => {
  try {
    await ElMessageBox.confirm('确定要重置文档表单吗？这将清理已上传的文件。', '确认重置', {
      type: 'warning'
    })
    
    // 清理未保存的文件
    await batchUploadFileRef.value?.clearUnsavedFiles()
    
    // 重置表单数据
    documentFormRef.value?.resetFields()
    documentForm.value.fileList = []
    
    // 重置文件上传组件
    batchUploadFileRef.value?.resetComponent()
    
    // 隐藏预览
    showPreview.value = false
    formPreview.value = {}
    
    ElMessage.success('文档表单重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置文档表单失败:', error)
    }
  }
}

// 验证文档文件
const validateDocumentFiles = () => {
  const validation = batchUploadFileRef.value?.validateFiles()
  if (validation?.valid) {
    const fileList = batchUploadFileRef.value?.getFileList() || []
    const fileDetails = batchUploadFileRef.value?.getFileDetails() || []
    
    ElMessage.success(`文档文件验证通过！已上传 ${fileList.length} 个文件`)
    console.log('文档文件ID列表:', fileList)
    console.log('文档文件详细信息:', fileDetails)
  } else {
    ElMessage.error(validation?.message || '文档文件验证失败')
  }
}

// 清理文档文件
const clearDocumentFiles = async () => {
  try {
    await ElMessageBox.confirm('确定要清理所有未保存的文档文件吗？', '确认清理', {
      type: 'warning'
    })
    
    await batchUploadFileRef.value?.clearUnsavedFiles()
    ElMessage.success('文档文件清理完成')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清理文档文件失败:', error)
    }
  }
}

// ========== 静态文件表单相关方法 ==========
// 提交静态文件表单
const submitStaticForm = async () => {
  try {
    // 1. 验证表单
    const formValid = await staticFormRef.value?.validate()
    if (!formValid) {
      ElMessage.error('请填写完整的静态文件表单信息')
      return
    }
    
    // 2. 验证文件上传
    const fileValidation = staticUploadFileRef.value?.validateFiles()
    if (!fileValidation.valid) {
      ElMessage.error(fileValidation.message)
      return
    }
    
    // 3. 获取最新的文件列表
    const fileList = staticUploadFileRef.value?.getFileList() || []
    const fileDetails = staticUploadFileRef.value?.getFileDetails() || []
    
    // 4. 构造提交数据
    const submitData = {
      ...staticForm.value,
      fileList,
      fileDetails,
      submitTime: new Date().toISOString()
    }
    
    console.log('=== 静态文件表单提交数据 ===')
    console.log(JSON.stringify(submitData, null, 2))
    
    // 5. 模拟提交成功
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 6. 标记文件为已保存（避免被清理）
    staticUploadFileRef.value?.markFilesAsSaved()
    
    // 7. 显示预览数据
    formPreview.value = submitData
    showPreview.value = true
    
    ElMessage.success('静态文件表单提交成功！')
    
  } catch (error) {
    console.error('静态文件表单提交失败:', error)
    ElMessage.error('静态文件表单提交失败，请重试')
  }
}

// 重置静态文件表单
const resetStaticForm = async () => {
  try {
    await ElMessageBox.confirm('确定要重置静态文件表单吗？这将清理已上传的文件。', '确认重置', {
      type: 'warning'
    })
    
    // 清理未保存的文件
    await staticUploadFileRef.value?.clearUnsavedFiles()
    
    // 重置表单数据
    staticFormRef.value?.resetFields()
    staticForm.value.fileList = []
    
    // 重置文件上传组件
    staticUploadFileRef.value?.resetComponent()
    
    // 隐藏预览
    showPreview.value = false
    formPreview.value = {}
    
    ElMessage.success('静态文件表单重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置静态文件表单失败:', error)
    }
  }
}

// 验证静态文件
const validateStaticFiles = () => {
  const validation = staticUploadFileRef.value?.validateFiles()
  if (validation?.valid) {
    const fileList = staticUploadFileRef.value?.getFileList() || []
    const fileDetails = staticUploadFileRef.value?.getFileDetails() || []
    
    ElMessage.success(`静态文件验证通过！已上传 ${fileList.length} 个文件`)
    console.log('静态文件ID列表:', fileList)
    console.log('静态文件详细信息:', fileDetails)
  } else {
    ElMessage.error(validation?.message || '静态文件验证失败')
  }
}

// 清理静态文件
const clearStaticFiles = async () => {
  try {
    await ElMessageBox.confirm('确定要清理所有未保存的静态文件吗？', '确认清理', {
      type: 'warning'
    })
    
    await staticUploadFileRef.value?.clearUnsavedFiles()
    ElMessage.success('静态文件清理完成')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清理静态文件失败:', error)
    }
  }
}

// ================= 静态图片表单相关方法 =================

// 提交静态图片表单
const submitStaticImgForm = async () => {
  try {
    // 1. 验证表单
    const formValid = await staticImgFormRef.value?.validate()
    if (!formValid) {
      ElMessage.error('请填写完整的表单信息')
      return
    }
    
    // 2. 验证图片上传
    const fileValidation = staticImgUploadFileRef.value?.validateFiles()
    if (!fileValidation) {
      ElMessage.error('请上传一张图片')
      return
    }
    
    // 3. 构造提交数据
    const submitData = {
      ...staticImgForm.value,
      submitTime: new Date().toISOString()
    }
    
    console.log('静态图片表单提交数据:', submitData)
    
    // 4. 显示表单预览
    formPreview.value = submitData
    showPreview.value = true
    
    ElMessage.success('静态图片表单提交成功！')
    
  } catch (error) {
    console.error('静态图片表单提交失败:', error)
    ElMessage.error('静态图片表单提交失败，请重试')
  }
}

// 重置静态图片表单
const resetStaticImgForm = async () => {
  try {
    await ElMessageBox.confirm('确定要重置静态图片表单吗？这将清理已上传的图片。', '确认重置', {
      type: 'warning'
    })
    
    // 清理未保存的文件
    await staticImgUploadFileRef.value?.clearUnsavedFiles()
    
    // 重置表单数据
    staticImgFormRef.value?.resetFields()
    staticImgForm.value.fileList = []
    
    // 隐藏预览
    showPreview.value = false
    formPreview.value = {}
    
    ElMessage.success('静态图片表单重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置静态图片表单失败:', error)
    }
  }
}

// 验证静态图片
const validateStaticImages = () => {
  const validation = staticImgUploadFileRef.value?.validateFiles()
  if (validation) {
    ElMessage.success('图片验证通过！')
    console.log('静态图片ID:', staticImgForm.value.fileList[0])
  } else {
    ElMessage.error('图片验证失败，请上传一张图片')
  }
}

// 清理静态图片
const clearStaticImages = async () => {
  try {
    await ElMessageBox.confirm('确定要清理所有未保存的图片文件吗？', '确认清理', {
      type: 'warning'
    })
    
    await staticImgUploadFileRef.value?.clearUnsavedFiles()
    ElMessage.success('静态图片清理完成')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清理静态图片失败:', error)
    }
  }
}

// 页面卸载时清理未保存的文件
onBeforeUnmount(() => {
  batchUploadFileRef.value?.clearUnsavedFiles()
  staticUploadFileRef.value?.clearUnsavedFiles()
  staticImgUploadFileRef.value?.clearUnsavedFiles()
  // uploadFileRef.value?.clearUnsavedFiles() // 注释掉的商品表单引用
})

// 在组件挂载时初始化
onMounted(() => {
  console.log('批量文件上传测试页面初始化')
  console.log('当前测试模式：批量模式 - 无序列编码')
})
</script>

<style scoped lang="scss">
.form-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }

  .form-card {
    margin-bottom: 20px;
    
    .card-header {
      font-weight: bold;
      font-size: 16px;
    }
    
    .el-form {
      .el-form-item {
        margin-bottom: 22px;
      }
      
      .el-input-number {
        width: 100%;
      }
    }
  }
  
  .preview-card {
    .card-header {
      font-weight: bold;
      font-size: 16px;
    }
    
    pre {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.4;
      overflow-x: auto;
      max-height: 400px;
      overflow-y: auto;
    }
  }
}
</style>
