import request from '@/config/axios'

// 文件业务序列 VO
export interface FileBusinessSequenceVO {
  id: number // 主键ID
  sequenceCode: string // 序列编码
  sequenceBusiness: string // 序列业务名
  sequenceFile: string // 序列文件名
  sequenceValue: number // 序列值
}

// 文件业务序列 API
export const FileBusinessSequenceApi = {
  // 查询文件业务序列分页
  getFileBusinessSequencePage: async (params: any) => {
    return await request.get({ url: `/infra/file-business-sequence/page`, params })
  },

  // 查询文件业务序列详情
  getFileBusinessSequence: async (id: number) => {
    return await request.get({ url: `/infra/file-business-sequence/get?id=` + id })
  },

  // 新增文件业务序列
  createFileBusinessSequence: async (data: FileBusinessSequenceVO) => {
    return await request.post({ url: `/infra/file-business-sequence/create`, data })
  },

  // 修改文件业务序列
  updateFileBusinessSequence: async (data: FileBusinessSequenceVO) => {
    return await request.put({ url: `/infra/file-business-sequence/update`, data })
  },

  // 删除文件业务序列
  deleteFileBusinessSequence: async (id: number) => {
    return await request.delete({ url: `/infra/file-business-sequence/delete?id=` + id })
  },

  // 批量删除文件业务序列
  deleteFileBusinessSequenceList: async (ids: number[]) => {
    return await request.delete({ url: `/infra/file-business-sequence/delete-list?ids=` + ids.join(',') })
  },

  // 按序列编码分组获取列表（列表的列表）
  getFileBusinessSequenceGroupList: async (params: any) => {
    return await request.get({ url: `/infra/file-business-sequence/group-list`, params })
  },

  // 导出文件业务序列 Excel
  exportFileBusinessSequence: async (params) => {
    return await request.download({ url: `/infra/file-business-sequence/export-excel`, params })
  },

  // 根据序列编码查询并分组返回
  getFileBusinessSequenceGroupListByCode: async (sequenceCode: string) => {
    return await request.get({ url: `/infra/file-business-sequence/group-list-by-code`, params: { sequenceCode } })
  },

  // 获取去重后的 code-business 映射
  getCodeFileMapping: async () => {
    return await request.get({ url: `/infra/file-business-sequence/code-file-mapping` })
  },

  // 根据序列编码批量更新业务名
  updateBusinessBySequenceCode: async (sequenceCode: string, sequenceBusiness: string) => {
    return await request.put({ url: `/infra/file-business-sequence/update-business-by-code`, params: { sequenceCode, sequenceBusiness } })
  },
}
