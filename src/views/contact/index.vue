<template>
  <div class="contact-page">
    <ContentWrap>
      <div class="contact-header">
        <h1 class="page-title">联系我们</h1>
        <p class="page-description">如果您有任何问题或建议，请通过以下方式与我们联系</p>
      </div>
      
      <div class="contact-content">
        <div class="contact-info">
          <div class="info-item">
            <div class="info-icon">📧</div>
            <div class="info-content">
              <h3>邮箱地址</h3>
              <p>1530885478@qq.com</p>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">📞</div>
            <div class="info-content">
              <h3>联系电话</h3>
              <p>18046885523</p>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">📱</div>
              <div class="info-content">
                <h3>微信号</h3>
                <p>18046885523</p>
                <div class="qr-code-container">
                  <img 
                    src="/src/assets/imgs/wechat-qr.jpg" 
                    alt="微信二维码" 
                    class="qr-code-image"
                    @error="handleImageError"
                    @click="showFullscreenImage"
                    @mousedown="showFullscreenImage"
                  />
                  <div 
                    class="qr-code-overlay"
                    style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; z-index: 10;"
                    @mouseenter="showOverlay"
                    @mouseleave="hideOverlay"
                  >
                    <div 
                      class="zoom-icon"
                      style="font-size: 24px; margin-bottom: 8px; color: white; display: block;"
                    >🔍</div>
                    <span 
                      class="scan-text"
                      style="color: white; font-size: 12px; font-weight: 500; display: block;"
                    >点击放大查看</span>
                  </div>
                </div>
              </div>
          </div>
        </div>
        
        <div class="contact-form">
          <h2>留言反馈</h2>
          <p class="form-description">请填写以下信息，我们会尽快回复您</p>
          
          <el-form :model="contactForm" :rules="formRules" ref="formRef" label-width="80px">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="contactForm.name" placeholder="请输入您的姓名" />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="contactForm.email" placeholder="请输入您的邮箱地址（选填）" />
            </el-form-item>
            
            <el-form-item label="微信号" prop="wechat">
              <el-input v-model="contactForm.wechat" placeholder="请输入您的微信号" />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="contactForm.phone" placeholder="请输入您的手机号" />
            </el-form-item>
            
            <el-form-item label="主题" prop="subject">
              <el-input v-model="contactForm.subject" placeholder="请输入留言主题" />
            </el-form-item>
            
            <el-form-item label="留言内容" prop="message">
              <Editor 
                v-model="contactForm.message" 
                :height="300"
                :editor-config="{
                  placeholder: '请输入您的留言内容...'
                }"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitForm" :loading="submitting">
                提交留言
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </ContentWrap>
    
    <!-- 全屏图片对话框 -->
    <el-dialog
      v-model="fullscreenVisible"
      title="微信二维码"
      width="90%"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      class="fullscreen-image-dialog"
    >
      <div class="fullscreen-image-container">
        <img 
          :src="fullscreenImageSrc" 
          alt="微信二维码" 
          class="fullscreen-image"
          @error="handleImageError"
        />
      </div>
      <template #footer>
        <el-button @click="fullscreenVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMessage } from '@/hooks/web/useMessage'
import { Editor } from '@/components/Editor'

defineOptions({ name: 'Contact' })

const message = useMessage()
const formRef = ref()
const submitting = ref(false)

// 全屏图片相关
const fullscreenVisible = ref(false)
const fullscreenImageSrc = ref('')

// 表单数据
const contactForm = reactive({
  name: '',
  email: '',
  wechat: '',
  phone: '',
  subject: '',
  message: ''
})

// 表单验证规则
// 自定义验证：微信号和手机号至少填写一个
const validateContactInfo = (rule: any, value: any, callback: any) => {
  if (!contactForm.wechat && !contactForm.phone) {
    callback(new Error('微信号和手机号至少填写一个'))
  } else {
    callback()
  }
}

const formRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email' as const, message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  wechat: [
    { validator: validateContactInfo, trigger: 'blur' },
    { min: 3, max: 30, message: '微信号长度在 3 到 30 个字符', trigger: 'blur' }
  ],
  phone: [
    { validator: validateContactInfo, trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  subject: [
    { required: true, message: '请输入留言主题', trigger: 'blur' },
    { min: 5, max: 100, message: '主题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  message: [
    { required: true, message: '请输入留言内容', trigger: 'blur' },
    { min: 10, message: '留言内容至少 10 个字符', trigger: 'blur' }
  ]
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 这里可以调用API提交表单数据
    console.log('提交的表单数据:', contactForm)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success('留言提交成功！我们会尽快回复您')
    resetForm()
    
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  contactForm.wechat = ''
  contactForm.phone = ''
  contactForm.message = ''
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  console.warn('微信二维码图片加载失败，请检查图片路径')
}

// 全屏展示图片
const showFullscreenImage = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  
  const target = event.target as HTMLImageElement
  
  fullscreenImageSrc.value = target.src
  fullscreenVisible.value = true
}

// 显示覆盖层
const showOverlay = (event: Event) => {
  const target = event.target as HTMLElement
  target.style.opacity = '1'
  target.style.visibility = 'visible'
}

// 隐藏覆盖层
const hideOverlay = (event: Event) => {
  const target = event.target as HTMLElement
  target.style.opacity = '0'
  target.style.visibility = 'hidden'
}


</script>

<style scoped lang="scss">
.contact-page {
  padding: 20px 0;
  
  .contact-header {
    text-align: center;
    margin-bottom: 40px;
    
    .page-title {
      font-size: 32px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
    }
    
    .page-description {
      font-size: 16px;
      color: #606266;
      line-height: 1.6;
    }
  }
  
  .contact-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 40px;
    max-width: 1200px;
    margin: 0 auto;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 30px;
    }
  }
  
    .contact-info {
    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      transition: all 0.3s ease;
      min-height: 120px;
      
      &:hover {
        background: #e9ecef;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .info-icon {
        font-size: 24px;
        margin-right: 16px;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #409eff;
        color: white;
        border-radius: 50%;
        flex-shrink: 0;
      }
      
      .info-content {
        flex: 1;
        
        h3 {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }
        
        p {
          font-size: 14px;
          color: #606266;
          margin: 0 0 8px 0;
        }
        
        .qr-code-container {
          position: relative;
          margin-top: 8px;
          display: inline-block;
          
          .qr-code-image {
            width: 180px;
            height: 180px;
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            z-index: 5;
            
            &:hover {
              transform: scale(1.05);
              border-color: #409eff;
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
            }
          }
          
          .qr-code-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0, 0, 0, 0.6) !important;
            border-radius: 8px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            opacity: 0 !important;
            transition: opacity 0.3s ease !important;
            pointer-events: none !important;
            z-index: 10 !important;
            
            .zoom-icon {
              font-size: 24px !important;
              margin-bottom: 8px !important;
              color: white !important;
              display: block !important;
            }
            
            .scan-text {
              color: white !important;
              font-size: 12px !important;
              font-weight: 500 !important;
              display: block !important;
            }
          }
          
          &:hover .qr-code-overlay {
            opacity: 1 !important;
          }
          
          // 确保悬停时覆盖层可见
          &:hover .qr-code-overlay {
            opacity: 1 !important;
            visibility: visible !important;
          }
        }
      }
    }
  }
  
  .contact-form {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    h2 {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }
    
    .form-description {
      font-size: 14px;
      color: #909399;
      margin-bottom: 24px;
    }
    
    .el-form-item {
      margin-bottom: 20px;
    }
    
    .el-button {
      margin-right: 12px;
    }
  }
}

// 全屏图片对话框样式
:deep(.fullscreen-image-dialog) {
  .el-dialog__body {
    padding: 20px;
    text-align: center;
  }
  
  .fullscreen-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    
    .fullscreen-image {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
