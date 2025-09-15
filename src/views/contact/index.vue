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
                  />
                </div>
              </div>
          </div>
        </div>

        <div class="contact-form">
          <h2>留言反馈</h2>
          <p class="form-description">请填写以下信息，我们会尽快回复您</p>

          <el-form :model="contactForm" :rules="formRules" ref="formRef" label-width="80px">
            <el-form-item label="留言内容" prop="message">
              <el-input
                v-model="contactForm.message"
                placeholder="请输入留言内容"
                type="textarea"
                :rows="4"
              />
            </el-form-item>
            <el-form-item label="附件" prop="fileList">
              <BatchFileUpload
                ref="fileUploadRef"
                v-model:fileList="contactForm.fileList"
                mode="create"
                :max-files="1"
                directory="business"
                :file-size="10"
                tip="支持上传1个文件，文件不超过10MB"
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
import { BatchFileUpload } from '@/components/UploadFile'
import { OaContactUsApi } from 'src/api/business/contactus'
import * as UserApi from '@/api/system/user'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'Contact' })

// 消息提示
const { success, error } = useMessage()
const userStore = useUserStore()
const formRef = ref()
const submitting = ref(false)

// 全屏图片显示相关变量
const fullscreenVisible = ref(false)
const fullscreenImageSrc = ref('/src/assets/imgs/wechat-qr.jpg')

// 显示全屏图片
const showFullscreenImage = () => {
  fullscreenImageSrc.value = '/src/assets/imgs/wechat-qr.jpg'
  fullscreenVisible.value = true
}

// 表单数据
const contactForm = reactive({
  message: '',
  fileList: []
})

// 表单验证规则
const formRules = {
  message: [
    {
      required: true,
      validator: (rule: any, value: string, callback: any) => {
        // 去除HTML标签后检查纯文本长度
        const plainText = value.replace(/<[^>]*>/g, '').trim()
        if (!plainText) {
          callback(new Error('请输入留言内容'))
        } else if (plainText.length < 10) {
          callback(new Error('留言内容至少需要10个字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 获取当前用户信息
    const currentUser = userStore.getUser

    // 准备提交数据
    const submitData = {
      userId: currentUser?.id || undefined, // 用户ID
      messageContent: contactForm.message, // 留言内容
      name: currentUser?.nickname || '', // 联系人姓名
      phone: '', // 联系电话，从用户信息获取（如果有mobile字段）
      email: '', // 联系邮箱，从用户信息获取（如果有email字段）
      status: 1, // 默认状态：待处理
      fileId: contactForm.fileList.length > 0 ? contactForm.fileList.map(fileId => fileId).filter(id => id).join(',') : '', // 文件编号，使用上传后返回的文件ID
      deptId: currentUser?.deptId || 1 // 部门编号
    }

    // 调用实际API
    await OaContactUsApi.createOaContactUs(submitData)

    success('留言提交成功，我们会尽快回复您')
    resetForm()
  } catch (err) {
    console.error('提交失败:', err)
    error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
    contactForm.fileList = []
  }
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  console.warn('微信二维码图片加载失败，请检查图片路径')
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
