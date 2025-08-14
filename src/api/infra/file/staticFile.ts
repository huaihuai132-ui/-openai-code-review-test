import request from '@/config/axios'

// 静态文件预签名地址 Response VO
export interface StaticFilePresignedUrlRespVO {
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

// 静态文件创建 Request VO
export interface StaticFileCreateReqVO {
  configId: number
  name: string
  path: string
  url: string
  type?: string
  size: number
  dir?: string
}

// 获取静态文件预签名地址
export const getStaticFilePresignedUrl = (name: string, directory?: string) => {
  return request.get<StaticFilePresignedUrlRespVO>({
    url: '/infra/static-file/get-presigned-url',
    params: { name, directory }
  })
}

// 创建静态文件记录
export const createStaticFile = (data: StaticFileCreateReqVO) => {
  return request.post<number>({
    url: '/infra/static-file/create',
    data
  })
}

// 上传静态文件
export const uploadStaticFile = (file: File, directory?: string, dir?: string) => {
  const formData = new FormData()
  formData.append('file', file)
  if (directory) {
    formData.append('directory', directory)
  }
  if (dir) {
    formData.append('dir', dir)
  }
  return request.upload<string>({
    url: '/infra/static-file/upload',
    data: formData
  })
}

// 删除静态文件
export const deleteStaticFile = (id: number) => {
  return request.delete<boolean>({
    url: '/infra/static-file/delete',
    params: { id }
  })
}
