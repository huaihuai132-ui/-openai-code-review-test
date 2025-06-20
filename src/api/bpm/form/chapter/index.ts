import request from '@/config/axios'

export interface ChapterVO {
  id: number
  userId: number
  deptId: number
  deptName: string
  fund: number
  reason: string
  useDate: Date
  chapterFileName: string
  chapterName: string
  storagePath: string
  isTakeOut: string
  editStatus: string
  status: number
  processInstanceId: string
  createTime: Date
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
export const getChapterPage = (params: any) => {
  return request.get({ url: '/bpm/oa/form/chapter/page', params })
} 