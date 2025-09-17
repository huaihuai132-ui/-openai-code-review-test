/**
 * 域名配置工具
 * 根据环境变量配置决定使用静态域名还是动态域名
 */

/**
 * 获取配置的域名
 * @returns 返回配置的域名地址
 */
export const getDomainUrl = (): string => {
  const domainType = import.meta.env.VITE_DOMAIN_URL_STATIC

  if (domainType === 'static') {
    // 使用固定域名
    // return 'http://182.109.52.126:49090'
    return 'https://gkt.jxcbdp.com'
  } else {
    // 使用动态域名
    return `${window.location.protocol}//${window.location.host}`
  }
}

/**
 * 获取完整的文件访问URL
 * @param filePath 文件路径
 * @returns 完整的文件访问URL
 */
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return ''

  const domainUrl = getDomainUrl()

  // 如果文件路径已经是完整URL，直接返回
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }

  // 确保路径以 / 开头
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`

  return `${domainUrl}${normalizedPath}`
}
