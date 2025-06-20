import request from '@/config/axios'

export interface PurchaseVO {
  id: number
  userId: number
  reason: string
  purchaseDate: Date
  itemList: string
  totalPrice: number
  storagePath: string
  editStatus: string
  status: number
  processInstanceId: string
  createTime: Date
  startUserSelectAssignees?: Record<string, number[]>
}

// 创建采购申请
export const createPurchase = (data: PurchaseVO) => {
  return request.post({ url: '/bpm/oa/form/purchase/create', data })
}

// 获取采购申请详情
export const getPurchase = (id: number) => {
  return request.get({ url: '/bpm/oa/form/purchase/get', params: { id } })
}

// 获取采购申请分页
export const getPurchasePage = (params: any) => {
  return request.get({ url: '/bpm/oa/form/purchase/page', params })
} 