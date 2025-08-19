import { ref, computed } from 'vue'
import { useMessage } from '@/hooks/web/useMessage'
import * as FileApi from '@/api/infra/file/index'
import type { MySharedFileVO } from '@/api/infra/file/index'

export function useFileData() {
  const message = useMessage()

  // 文件列表状态
  const personalLoading = ref(false)
  const personalFiles = ref<any[]>([])
  const publicLoading = ref(false)
  const publicFiles = ref<any[]>([])
  const sharedLoading = ref(false)
  const sharedFiles = ref<any[]>([])

  // 我分享的文件相关
  const mySharedLoading = ref(false)
  const mySharedFiles = ref<MySharedFileVO[]>([])

  // 路径和文件夹结构
  const currentPath = ref('')
  const allFolders = ref<any[]>([])

  // 排序相关
  const sortBy = ref('time')
  const sortOrder = ref('desc')

  // 计算属性：面包屑文件夹
  const breadcrumbFolders = computed(() => {
    if (!currentPath.value) return []
    const parts = currentPath.value.split('/').filter(Boolean)
    const folders: any[] = []
    let path = ''

    parts.forEach(part => {
      path += (path ? '/' : '') + part
      folders.push({ name: part, path: path })
    })

    return folders
  })

  // 计算属性：当前文件夹
  const currentFolders = computed(() => {
    const folders = new Set<string>()

    personalFiles.value.forEach(file => {
      const fileDir = file.dir || ''

      if (!currentPath.value) {
        if (fileDir && !fileDir.startsWith('/')) {
          const firstFolder = fileDir.split('/')[0]
          if (firstFolder) {
            folders.add(firstFolder)
          }
        }
      } else {
        if (fileDir.startsWith(currentPath.value + '/')) {
          const relativePath = fileDir.substring(currentPath.value.length + 1)
          const firstFolder = relativePath.split('/')[0]
          if (firstFolder) {
            folders.add(firstFolder)
          }
        }
      }
    })

    return Array.from(folders).map(name => ({
      name,
      path: currentPath.value ? `${currentPath.value}/${name}` : name
    }))
  })

  // 计算属性：当前文件
  const currentFiles = computed(() => {
    const files = personalFiles.value.filter(file => {
      const fileDir = file.dir || ''

      if (!currentPath.value) {
        return !fileDir || fileDir === '/' || fileDir === ''
      }

      return fileDir === currentPath.value
    })

    // 排序逻辑
    return files.sort((a, b) => {
      if (sortBy.value === 'time') {
        const timeA = new Date(a.createTime).getTime()
        const timeB = new Date(b.createTime).getTime()
        return sortOrder.value === 'desc' ? timeB - timeA : timeA - timeB
      } else if (sortBy.value === 'name') {
        const nameA = a.name.toLowerCase()
        const nameB = b.name.toLowerCase()
        if (sortOrder.value === 'desc') {
          return nameB.localeCompare(nameA)
        } else {
          return nameA.localeCompare(nameB)
        }
      }
      return 0
    })
  })

  // 获取个人文件
  const getPersonalFiles = async () => {
    personalLoading.value = true
    try {
      const response = await FileApi.getUserVisibleFiles()

      if (Array.isArray(response)) {
        personalFiles.value = response
      } else if (response && (response as any).code === 0 && (response as any).data) {
        personalFiles.value = (response as any).data
      } else {
        personalFiles.value = []
      }

      buildAllFolders()
    } catch (error) {
      console.error('获取个人文件失败:', error)
      message.error('获取个人文件失败')
      personalFiles.value = []
    } finally {
      personalLoading.value = false
    }
  }

  // 获取公共文件
  const getPublicFiles = async () => {
    publicLoading.value = true
    try {
      const response = await FileApi.getPublicFiles()

      if (Array.isArray(response)) {
        publicFiles.value = response
      } else if (response && (response as any).code === 0 && (response as any).data) {
        publicFiles.value = (response as any).data
      } else {
        publicFiles.value = []
      }
    } catch (error) {
      console.error('获取公共文件失败:', error)
      message.error('获取公共文件失败')
      publicFiles.value = []
    } finally {
      publicLoading.value = false
    }
  }

  // 获取共享文件
  const getSharedFiles = async () => {
    sharedLoading.value = true
    try {
      const response = await FileApi.getSharedFiles()

      if (Array.isArray(response)) {
        sharedFiles.value = response
      } else if (response && (response as any).code === 0 && (response as any).data) {
        sharedFiles.value = (response as any).data
      } else {
        sharedFiles.value = []
      }
    } catch (error) {
      console.error('获取共享文件失败:', error)
      message.error('获取共享文件失败')
      sharedFiles.value = []
    } finally {
      sharedLoading.value = false
    }
  }

  // 获取我分享的文件
  const getMySharedFiles = async () => {
    try {
      mySharedLoading.value = true
      const data = await FileApi.getMySharedFiles()
      mySharedFiles.value = data || []
    } catch (error) {
      console.error('获取我分享的文件失败:', error)
      message.error('获取我分享的文件失败')
    } finally {
      mySharedLoading.value = false
    }
  }

  // 构建所有文件夹
  const buildAllFolders = () => {
    const folders = new Set<string>()

    personalFiles.value.forEach(file => {
      const fileDir = file.dir || ''
      if (fileDir && fileDir !== '/') {
        const parts = fileDir.split('/').filter(Boolean)
        let path = ''
        parts.forEach(part => {
          path += (path ? '/' : '') + part
          folders.add(path)
        })
      }
    })

    allFolders.value = Array.from(folders).map(path => ({
      name: path.split('/').pop() || path,
      path: path
    }))
  }

  // 导航到文件夹
  const navigateToFolder = (path: string) => {
    currentPath.value = path
  }

  // 切换排序
  const toggleSort = (type: 'time' | 'name') => {
    if (sortBy.value === type) {
      sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    } else {
      sortBy.value = type
      sortOrder.value = 'desc'
    }
  }

  // 刷新方法
  const refreshPersonalFiles = () => {
    getPersonalFiles()
  }

  const refreshPublicFiles = () => {
    getPublicFiles()
  }

  const refreshSharedFiles = () => {
    getSharedFiles()
  }

  return {
    // 状态
    personalLoading,
    personalFiles,
    publicLoading,
    publicFiles,
    sharedLoading,
    sharedFiles,
    mySharedLoading,
    mySharedFiles,
    currentPath,
    allFolders,
    sortBy,
    sortOrder,
    
    // 计算属性
    breadcrumbFolders,
    currentFolders,
    currentFiles,
    
    // 方法
    getPersonalFiles,
    getPublicFiles,
    getSharedFiles,
    getMySharedFiles,
    buildAllFolders,
    navigateToFolder,
    toggleSort,
    refreshPersonalFiles,
    refreshPublicFiles,
    refreshSharedFiles
  }
}
