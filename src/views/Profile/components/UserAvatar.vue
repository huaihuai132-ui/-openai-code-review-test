<template>
  <div class="change-avatar">
    <CropperAvatar ref="cropperRef" :btnProps="{ preIcon: 'ant-design:cloud-upload-outlined' }" :showBtn="false"
      :value="img" width="120px" @change="handelUpload" />
  </div>
</template>
<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import { updateUserProfile } from '@/api/system/user/profile'
import { CropperAvatar } from '@/components/Cropper'
import { useUserStore } from '@/store/modules/user'
import * as StaticFileApi from '@/api/infra/file/staticFile'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// TODO @芋艿：合并到 ProfileUser 组件中，更简洁一点
defineOptions({ name: 'UserAvatar' })

defineProps({
  img: propTypes.string.def('')
})

const userStore = useUserStore()

const cropperRef = ref()
const handelUpload = async ({ data, filename }) => {
  try {
    // 1. 获取静态文件预签名URL
    const presignedData = await StaticFileApi.getStaticFilePresignedUrl(filename || 'avatar.png', 'avatars')
    const urlData = (presignedData as any).data || presignedData

    // 2. 直传到MinIO
    await axios.put(urlData.uploadUrl, data, {
      headers: {
        'Content-Type': data.type || 'image/png'
      }
    })

    // 3. 创建静态文件记录
    const createFileData = {
      configId: urlData.configId || 0,
      name: filename || 'avatar.png',
      path: urlData.path,
      url: urlData.url,
      type: data.type || 'image/png',
      size: data.size,
      dir: 'avatars',
      fileSource: 1 // 个人文件（头像等）
    }

    const response = await StaticFileApi.createStaticFile(createFileData) as any
    console.log('头像上传-StaticFileApi.createStaticFile 返回结果:', response)

    // 4. 获取文件URL
    const fileInfo = (response as any).data || response
    const avatar = fileInfo.url || urlData.url

    // 5. 更新用户头像
    await updateUserProfile({ avatar })

    // 关闭弹窗，并更新 userStore
    if (cropperRef.value && typeof cropperRef.value.close === 'function') {
      cropperRef.value.close()
    }
    await userStore.setUserAvatarAction(avatar)

    ElMessage.success('头像上传成功')

  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请重试')
  }
}
</script>

<style lang="scss" scoped>
.change-avatar {
  img {
    display: block;
    margin-bottom: 15px;
    border-radius: 50%;
  }
}
</style>
