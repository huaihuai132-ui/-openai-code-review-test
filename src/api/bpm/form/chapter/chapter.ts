import request from '@/config/axios'

export interface ChapterVO {
  id?: number
  userId?: number // 用户ID
  deptId?: number // 部门ID
  deptName?: string // 部门名称
  fund: number
  reason: string
  useDate: Date // 用章日期
  chapterFileName: string
  chapterName: string
  fileList: string // 文件ID列表，逗号分隔的字符串
  sequenceCode?: string // 文件序列编码
  isTakeOut: string
  status?: number
  processInstanceId?: string
  createTime?: Date
  startUserSelectAssignees?: Record<string, number[]>
}

// 创建用章申请
export const createChapter = (data: ChapterVO) => {
  return request.post({ url: '/bpm/oa/form/chapter/create', data })
}

// 获取用章申请详情
export const getChapter = (id: number) => {
  return request.get({ url: '/bpm/oa/form/chapter/get', params: { id } })
}

// 获取用章申请分页
export const getChapterPage = (params) => {
  return request.get({ url: '/bpm/oa/form/chapter/page', params })
} 