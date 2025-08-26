import request from '@/config/axios'

export interface ItemListVO {
  id?: number
  type: string
  itemName: string
  specification: string
  number: number
  usage: string
  estimatedAmount: number
}

export interface PurchaseVO {
  id: number
  userId: number
  reason: string
  purchaseDate: Date
  itemList: ItemListVO[]
  totalPrice: number
  fileList: string
  sequenceCode: string
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