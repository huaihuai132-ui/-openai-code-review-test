import request from '@/config/axios'

// 资产基本信息 VO
export interface AssetBasicInfoVO {
  id: number // 资产ID，主键
  assetCode: string // 资产编码
  assetName: string // 资产名称
  addressCode: string // 地址12位编码，只用到9位，2省 4市 6区县 9街道 
  address: string // 详细地址
  originalOwnershipUnit: string // 原产权单位
  transferUnit: string // 移交单位
  buildingArea: number // 建筑面积(平方米)
  landArea: number // 土地面积(平方米)
  propertyNumber: string // 产权证号
  isTransferred: number // 是否办证过户: 0-未过户, 1-已过户，字典键business_assets_is_transferred
  transferredDate: Date // 产权证到期时间
  transferIssues: string // 办证过程中遇到的问题
  usage: number // 使用情况：0-闲置,1-出租,2-自用，字典键business_assets_usage
  rentalMethod: number // 出租方式：0-整租,1-分租,2-自用，字典键business_assets_rental_method
  assetValue: number // 资产价值(万元)
  assetType: number // 资产类型: 0-经营性资产, 1-非经营性资产，字典键business_assets_type
  filePath: string // 划拨文件id列表
  sequenceCode: string // 文件序列编码
  longitude: number // 经度坐标
  latitude: number // 纬度坐标
  status: number // 资产状态: 0-停用, 1-正常，字典键business_assets_status
}

// 资产基本信息 API
export const AssetBasicInfoApi = {
  // 查询资产基本信息分页
  getAssetBasicInfoPage: async (params: any) => {
    return await request.get({ url: `/business/asset-basic-info/page`, params })
  },

  // 查询资产基本信息详情
  getAssetBasicInfo: async (id: number) => {
    return await request.get({ url: `/business/asset-basic-info/get?id=` + id })
  },

  // 新增资产基本信息
  createAssetBasicInfo: async (data: AssetBasicInfoVO) => {
    return await request.post({ url: `/business/asset-basic-info/create`, data })
  },

  // 修改资产基本信息
  updateAssetBasicInfo: async (data: AssetBasicInfoVO) => {
    return await request.put({ url: `/business/asset-basic-info/update`, data })
  },

  // 删除资产基本信息
  deleteAssetBasicInfo: async (id: number) => {
    return await request.delete({ url: `/business/asset-basic-info/delete?id=` + id })
  },

  // 导出资产基本信息 Excel
  exportAssetBasicInfo: async (params) => {
    return await request.download({ url: `/business/asset-basic-info/export-excel`, params })
  }
}