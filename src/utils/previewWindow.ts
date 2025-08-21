/**
 * 文件预览窗口工具类
 * 统一处理文件预览窗口的打开，包括窗口位置错开和文件名显示
 */

// 全局窗口计数器
declare global {
  interface Window {
    previewWindowCount?: number
  }
}

/**
 * 计算窗口位置（错开显示）
 */
const calculateWindowPosition = () => {
  if (!window.previewWindowCount) window.previewWindowCount = 0
  
  const baseLeft = 100      // 基础左边距
  const baseTop = 100       // 基础上边距  
  const offset = 30         // 每次偏移量
  const maxOffset = 300     // 最大偏移量（10个窗口后重新开始）
  
  const currentOffset = (window.previewWindowCount * offset) % maxOffset
  window.previewWindowCount++
  
  return { 
    left: baseLeft + currentOffset, 
    top: baseTop + currentOffset 
  }
}

/**
 * 生成唯一的窗口名称
 */
const generateWindowName = () => {
  return `filePreview_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * 生成窗口特性字符串
 */
const generateWindowFeatures = (position: { left: number; top: number }) => {
  return `width=1200,height=800,left=${position.left},top=${position.top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no,titlebar=no,directories=no`
}

/**
 * 根据文件扩展名获取预览类型前缀
 */
const getPreviewTypePrefix = (fileName: string): string => {
  if (!fileName) return '文件预览-'
  
  const extension = fileName.split('.').pop()?.toUpperCase() || ''
  
  const imageExts = ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'WEBP']
  const docExts = ['DOC', 'DOCX', 'RTF']
  const pdfExts = ['PDF']
  const excelExts = ['XLS', 'XLSX', 'CSV']
  const pptExts = ['PPT', 'PPTX']
  const videoExts = ['MP4', 'AVI', 'MOV', 'WMV', 'FLV']
  const audioExts = ['MP3', 'WAV', 'AAC', 'FLAC']

  if (imageExts.includes(extension)) return '图片预览-'
  if (docExts.includes(extension)) return 'Word文档预览-'
  if (pdfExts.includes(extension)) return 'PDF预览-'
  if (excelExts.includes(extension)) return 'Excel预览-'
  if (pptExts.includes(extension)) return 'PPT预览-'
  if (videoExts.includes(extension)) return '视频预览-'
  if (audioExts.includes(extension)) return '音频预览-'
  
  return '文件预览-'
}

/**
 * 打开文件预览窗口
 * @param previewUrl 预览URL（已经构建好的完整URL）
 * @param fileName 文件名（用于窗口标题显示）
 */
export const openPreviewWindow = (previewUrl: string, fileName: string = '未知文件') => {
  try {
    // 计算窗口位置
    const position = calculateWindowPosition()
    
    // 生成窗口特性
    const windowFeatures = generateWindowFeatures(position)
    
    // 生成唯一窗口名称
    const windowName = generateWindowName()
    
    // 打开预览窗口
    const previewWindow = window.open(previewUrl, windowName, windowFeatures)
    
    if (!previewWindow) {
      console.error('无法打开预览窗口，请检查浏览器弹窗设置')
      return
    }

    // 尝试设置窗口标题
    const titlePrefix = getPreviewTypePrefix(fileName)
    const windowTitle = `${titlePrefix}${fileName}`
    
    // 监听窗口加载完成事件
    previewWindow.onload = () => {
      try {
        // 尝试设置窗口标题
        if (previewWindow.document) {
          previewWindow.document.title = windowTitle
        }
      } catch (error) {
        // 跨域限制，无法设置标题
        console.log('无法设置窗口标题（跨域限制）:', error)
      }
    }

    // 如果窗口已经加载完成，直接设置标题
    setTimeout(() => {
      try {
        if (previewWindow.document && previewWindow.document.readyState === 'complete') {
          previewWindow.document.title = windowTitle
        }
      } catch (error) {
        // 跨域限制，忽略错误
      }
    }, 1000)

    console.log(`预览文件: ${fileName}，窗口位置: (${position.left}, ${position.top})`)
    
  } catch (error) {
    console.error('打开预览窗口失败:', error)
  }
}

/**
 * 重置窗口计数器（可选，用于测试或特殊场景）
 */
export const resetPreviewWindowCount = () => {
  window.previewWindowCount = 0
}
