import * as StaticFileApi from '@/api/infra/file/staticFile'
import { UploadRequestOptions } from 'element-plus/es/components/upload/src/upload'
import axios from 'axios'

/**
 * 获得静态文件上传 URL
 */
export const getStaticUploadUrl = (): string => {
  return import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/infra/static-file/upload'
}

/**
 * 静态文件上传类型
 */
enum STATIC_UPLOAD_TYPE {
  // 客户端直接上传（使用预签名URL上传到static桶）
  CLIENT = 'client',
  // 客户端发送到后端上传（后端上传到static桶）
  SERVER = 'server'
}

export const useStaticFileUpload = (directory?: string) => {
  // 后端上传地址
  const uploadUrl = getStaticUploadUrl()
  // 是否使用前端直连上传 - 静态文件默认使用预签名上传
  const isClientUpload = STATIC_UPLOAD_TYPE.CLIENT === import.meta.env.VITE_UPLOAD_TYPE || true
  
  // 重写ElUpload上传方法
  const httpRequest = async (options: UploadRequestOptions & { onProgress?: (progressEvent: any) => void, cancelToken?: any }) => {
    // 模式一：前端直连上传（预签名）
    if (isClientUpload) {
      // 1.1 生成文件名称
      const fileName = await generateFileName(options.file)
      // 1.2 获取静态文件预签名地址（不使用目录）
      const response = await StaticFileApi.getStaticFilePresignedUrl(fileName)
      const presignedInfo = response.data || response
      
      if (!presignedInfo || !presignedInfo.uploadUrl) {
        throw new Error('获取静态文件预签名地址失败')
      }
      
      // 1.3 上传文件到static桶
      return axios
        .put(presignedInfo.uploadUrl, options.file, {
          headers: {
            'Content-Type': options.file.type
          },
          // 添加上传进度回调
          onUploadProgress: (progressEvent) => {
            if (options.onProgress && progressEvent.lengthComputable) {
              options.onProgress(progressEvent)
            }
          },
          // 添加取消令牌
          cancelToken: options.cancelToken
        })
        .then(() => {
          // 1.4. 记录文件信息到后端（异步）
          createStaticFile(presignedInfo, options.file)
          // 通知成功，数据格式保持与后端上传的返回结果一致
          return { data: presignedInfo.url }
        })
    } else {
      // 模式二：后端上传
      return new Promise((resolve, reject) => {
        // 创建FormData
        const formData = new FormData()
        formData.append('file', options.file)
        // 静态文件不使用目录参数

        // 使用axios上传以支持进度回调
        axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          // 添加上传进度回调
          onUploadProgress: (progressEvent) => {
            if (options.onProgress && progressEvent.lengthComputable) {
              options.onProgress(progressEvent)
            }
          },
          // 添加取消令牌
          cancelToken: options.cancelToken
        })
        .then((response) => {
          if (response.data.code === 0) {
            resolve(response.data)
          } else {
            reject(response.data)
          }
        })
        .catch((error) => {
          reject(error)
        })
      })
    }
  }

  return {
    uploadUrl,
    httpRequest
  }
}

/**
 * 创建静态文件信息
 * @param vo 文件预签名信息
 * @param file 文件
 */
function createStaticFile(vo: StaticFileApi.StaticFilePresignedUrlRespVO, file: File) {
  const fileVo = {
    configId: vo.configId,
    url: vo.url,
    path: vo.path,
    name: file.name,
    type: file.type,
    size: file.size
  }
  StaticFileApi.createStaticFile(fileVo)
  return fileVo
}

/**
 * 生成文件名称（使用原文件名）
 * @param file 要上传的文件
 */
async function generateFileName(file: File) {
  return file.name
}

export interface StaticFileInfo {
  name: string
  path: string
  size: number
  type: string
}
