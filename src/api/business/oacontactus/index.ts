import request from '@/config/axios'

// 联系我们 VO
export interface OaContactUsVO {
  id: number // 主键ID
  userId: number // 用户ID（可选，如为登录用户）
  messageContent: string // 留言内容
  name: string // 联系人姓名
  phone: string // 联系电话
  email: string // 联系邮箱
  status: number // 状态（1-待处理，2-处理中，3-已回复，4-已关闭）
  fileId: string // 文件编号（用于关联上传的附件）
  deptId: number // 部门编号
}

// 联系我们 API
export const OaContactUsApi = {
  // 查询联系我们分页
  getOaContactUsPage: async (params: any) => {
    return await request.get({ url: `/business/oa-contact-us/page`, params })
  },

  // 查询联系我们详情
  getOaContactUs: async (id: number) => {
    return await request.get({ url: `/business/oa-contact-us/get?id=` + id })
  },

  // 新增联系我们
  createOaContactUs: async (data: OaContactUsVO) => {
    return await request.post({ url: `/business/oa-contact-us/create`, data })
  },

  // 修改联系我们
  updateOaContactUs: async (data: OaContactUsVO) => {
    return await request.put({ url: `/business/oa-contact-us/update`, data })
  },

  // 删除联系我们
  deleteOaContactUs: async (id: number) => {
    return await request.delete({ url: `/business/oa-contact-us/delete?id=` + id })
  },

  // 批量删除联系我们
  deleteOaContactUsList: async (ids: number[]) => {
    return await request.delete({ url: `/business/oa-contact-us/delete-list`, params: { ids } })
  },

  // 导出联系我们 Excel
  exportOaContactUs: async (params) => {
    return await request.download({ url: `/business/oa-contact-us/export-excel`, params })
  },
}
