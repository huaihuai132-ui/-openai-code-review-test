import request from '@/config/axios'

export interface FileVO {
  id: number
  name: string
  path: string
  url: string
  type: string
  size: number
  businessCode?: string
  dir?: string
  createTime: string
  updateTime: string
}

export interface FileShareVO {
  fileId: number
  userId: string
  permission: number
  expiredTime?: string | null
}

// 文件预签名地址 Response VO
export interface FilePresignedUrlRespVO {
  // 文件配置编号
  configId: number
  // 文件上传 URL
  uploadUrl: string
  // 文件访问 URL
  url: string
  // 文件路径
  path: string
  // 上传所需的请求头
  headers?: Record<string, string>
}

// 文件创建 Request VO
export interface FileCreateReqVO {
  configId: number
  name: string
  path: string
  url: string
  type?: string
  size: number
  businessCode?: string
  dir?: string
}

// 获取文件分页
export const getFilePage = (params: any) => {
  return request.get({ url: '/infra/file/page', params })
}

// 上传文件
export const uploadFile = (file: File, directory?: string, businessCode?: string, dir?: string) => {
  const formData = new FormData()
  formData.append('file', file)
  if (directory) {
    formData.append('directory', directory)
  }
  if (businessCode) {
    formData.append('businessCode', businessCode)
  }
  if (dir) {
    formData.append('dir', dir)
  }
  return request.upload<string>({
    url: '/infra/file/upload',
    data: formData
  })
}

// 获取文件预签名地址
export const getFilePresignedUrl = (name: string, directory?: string) => {
  return request.get<FilePresignedUrlRespVO>({
    url: '/infra/file/presigned-url',
    params: { name, directory }
  })
}

// 创建文件记录
export const createFile = (data: FileCreateReqVO) => {
  return request.post<number>({
    url: '/infra/file/create',
    data
  })
}

// 删除文件
export const deleteFile = (id: number) => {
  return request.delete({ url: '/infra/file/delete?id=' + id })
}

// 获取文件下载地址
export const getDownloadUrl = (fileId: number) => {
  return request.get({ url: `/infra/file/getFileUrl/${fileId}` })
}

// 获取用户可见的文件列表
export const getUserVisibleFiles = () => {
  return request.get({ url: '/infra/file/user-visible' })
}

// 获取公共文件列表
export const getPublicFiles = () => {
  return request.get({ url: '/infra/file/public' })
}

// 获取业务相关文件列表
export const getBusinessFiles = (businessCode: string) => {
  return request.get({ url: '/infra/file/business', params: { businessCode } })
}

// 分享文件
export const shareFile = (data: FileShareVO) => {
  return request.post({ url: '/infra/file/share', data })
}

// 取消文件分享
export const unshareFile = (fileId: number, userId: string) => {
  return request.delete({ url: '/infra/file/unshare', params: { fileId, userId } })
}

// 获取文件内容
export const getFileContent = (id: number) => {
  return request.get({ url: '/infra/file/get-content', params: { id } })
}

// 根据 ID 列表批量查询文件详情
export const getFilesByIds = (ids: number[]) => {
  return request.post<FileVO[]>({ url: '/infra/file/getFilesByIds', data: ids })
}