import { useMessage } from '@/hooks/web/useMessage'
import { useUserStore } from '@/store/modules/user'
import * as FileApi from '@/api/infra/file/index'
import { openPreviewWindow } from '@/utils/previewWindow'

// 常量配置
const FIXED_DOMAIN = 'http://182.109.52.126:49090'

// 工具函数
const base64Encode = (str: string) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16))
  }))
}

export function useFileOperations() {
  const message = useMessage()
  const userStore = useUserStore()

  // 预览文件
  const previewFile = async (file: any) => {
    try {
      console.log('预览文件:', file)

      const nickname = userStore.getUser?.nickname || ''

      if (file.configId === 0) {
        // 静态文件预览
        const staticFileUrl = `${file.url}?nickname=${nickname}`

        if (file.type && file.type.includes('image')) {
          // 静态图片文件直接预览
          openPreviewWindow(staticFileUrl, file.name || '未知文件')
        } else {
          // 静态非图片文件通过预览服务
          const encodedUrl = encodeURIComponent(base64Encode(staticFileUrl))
          const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`
          openPreviewWindow(previewUrl, file.name || '未知文件')
        }
      } else {
        // 普通文件预览
        const signedUrl = await FileApi.getDownloadUrl(file.id)
        const fileUrl = signedUrl + `&nickname=${nickname}`
        const encodedUrl = encodeURIComponent(base64Encode(fileUrl))
        const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`

        // 使用预览工具类打开窗口
        openPreviewWindow(previewUrl, file.name || '未知文件')
      }
    } catch (error) {
      console.error('预览文件失败:', error)
      message.error('预览文件失败')
    }
  }

  // 下载文件
  const downloadFile = async (file: any) => {
    try {
      console.log('下载文件:', file)

      if (file.configId === 0) {
        const staticDownloadUrl = `${file.url}`
        window.open(staticDownloadUrl, '_blank')
      } else {
        const signedUrl = await FileApi.getDownloadUrl(file.id)
        const downloadUrl = `${signedUrl}`
        window.open(downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('获取下载地址失败:', error)
      message.error('获取下载地址失败')
    }
  }

  // 删除文件
  const deleteFile = async (file: any) => {
    try {
      await message.delConfirm()
      console.log('删除文件:', file)
      await FileApi.deleteFile(file.id)
      message.success('文件删除成功！')
      return true
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除文件失败:', error)
        message.error('删除文件失败')
      }
      return false
    }
  }

  // 移动文件
  const moveFile = async (fileId: number, targetDir: string) => {
    try {
      await FileApi.moveFile(fileId, targetDir)
      message.success('文件移动成功！')
      return true
    } catch (error: any) {
      console.error('移动文件失败:', error)
      message.error('移动文件失败')
      return false
    }
  }

  // 重命名文件
  const renameFile = async (fileId: number, newName: string) => {
    try {
      await FileApi.renameFile(fileId, newName)
      message.success('文件重命名成功！')
      return true
    } catch (error) {
      console.error('重命名文件失败:', error)
      message.error('重命名文件失败')
      return false
    }
  }

  // 设置文件为公共文件
  const setFileAsPublic = async (file: any) => {
    try {
      await message.delConfirm('确定要将此文件设置为公共文件吗？')
      await FileApi.setFilePublic(file.id)
      message.success('文件已设置为公共文件！')
      return true
    } catch (error) {
      if (error !== 'cancel') {
        console.error('设置公共文件失败:', error)
        message.error('设置公共文件失败')
      }
      return false
    }
  }

  // 取消分享
  const unshareFile = async (fileId: number, userId: string) => {
    try {
      await message.delConfirm('确定要取消对此用户的分享吗？')
      await FileApi.unshareFile(fileId, userId)
      message.success('取消分享成功！')
      return true
    } catch (error) {
      if (error !== 'cancel') {
        console.error('取消分享失败:', error)
        message.error('取消分享失败')
      }
      return false
    }
  }

  // 取消订阅
  const unshareFromMe = async (file: any) => {
    try {
      await message.delConfirm('确定要取消订阅此文件吗？')

      const currentUserId = userStore.getUser?.id?.toString()
      if (!currentUserId) {
        message.error('用户信息获取失败')
        return false
      }

      await FileApi.unshareFile(file.id, currentUserId)
      message.success('取消订阅成功！')
      return true
    } catch (error) {
      if (error !== 'cancel') {
        console.error('取消订阅失败:', error)
        message.error('取消订阅失败')
      }
      return false
    }
  }

  // 批量删除文件
  const bulkDeleteFiles = async (files: any[]) => {
    try {
      await message.delConfirm(`确定要删除选中的 ${files.length} 个文件吗？`)

      for (const file of files) {
        await FileApi.deleteFile(file.id)
      }

      message.success('批量删除成功！')
      return true
    } catch (error) {
      if (error !== 'cancel') {
        message.error('批量删除失败')
      }
      return false
    }
  }

  // 批量设为公共文件
  const bulkSetPublic = async (files: any[]) => {
    try {
      await message.delConfirm(`确定要将选中的 ${files.length} 个文件设置为公共文件吗？`)

      for (const file of files) {
        await FileApi.setFilePublic(file.id)
      }

      message.success('批量设为公共文件成功！')
      return true
    } catch (error) {
      if (error !== 'cancel') {
        message.error('批量设为公共文件失败')
      }
      return false
    }
  }

  // 批量下载文件
  const bulkDownloadFiles = async (files: any[]) => {
    try {
      for (const file of files) {
        await downloadFile(file)
      }
      message.success(`开始下载 ${files.length} 个文件`)
      return true
    } catch (error) {
      message.error('批量下载失败')
      return false
    }
  }

  return {
    previewFile,
    downloadFile,
    deleteFile,
    moveFile,
    renameFile,
    setFileAsPublic,
    unshareFile,
    unshareFromMe,
    bulkDeleteFiles,
    bulkSetPublic,
    bulkDownloadFiles
  }
}
