import request from '@/config/axios'

// 供应链金融物料 VO
export interface SupplychainMaterialsVO {
  id: number // 供应链金融物料主键
  materialsName: string // 物料名称
  deptId: number // 部门id
}

// 供应链金融物料 API
export const SupplychainMaterialsApi = {
  // 查询供应链金融物料分页
  getSupplychainMaterialsPage: async (params: any) => {
    return await request.get({ url: `/business/supplychain-materials/page`, params })
  },

  // 查询供应链金融物料详情
  getSupplychainMaterials: async (id: number) => {
    return await request.get({ url: `/business/supplychain-materials/get?id=` + id })
  },

  // 新增供应链金融物料
  createSupplychainMaterials: async (data: SupplychainMaterialsVO) => {
    return await request.post({ url: `/business/supplychain-materials/create`, data })
  },

  // 修改供应链金融物料
  updateSupplychainMaterials: async (data: SupplychainMaterialsVO) => {
    return await request.put({ url: `/business/supplychain-materials/update`, data })
  },

  // 删除供应链金融物料
  deleteSupplychainMaterials: async (id: number) => {
    return await request.delete({ url: `/business/supplychain-materials/delete?id=` + id })
  },

  // 导出供应链金融物料 Excel
  exportSupplychainMaterials: async (params) => {
    return await request.download({ url: `/business/supplychain-materials/export-excel`, params })
  },
  // 获取供应链金融物料列表
  getSimpleList: async () => {
    return await request.get({ url: `/business/supplychain-materials/list-all-simple`})
  },
}
