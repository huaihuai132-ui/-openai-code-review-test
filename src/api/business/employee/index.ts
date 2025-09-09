import request from '@/config/axios'

// 员工管理 VO
export interface EmployeeVO {
  id?: number // 用户编号，更新时必填
  username: string // 用户账号
  nickname: string // 用户昵称
  workerCode: number // 工号
  rank?: string // 职级
  deptId?: number // 部门编号
  postIds?: number[] // 岗位编号数组
  email?: string // 用户邮箱
  mobile?: string // 手机号码
  sex?: number // 用户性别：1=男性，2=女性
  avatar?: string // 用户头像
  status: number // 帐号状态：0=正常，1=禁用
  officePhone?: string // 办公电话
  officeNumber?: string // 办公室房号
  password?: string // 密码，新增时必填
  remark?: string // 备注
  createTime?: Date // 创建时间
  updateTime?: Date // 更新时间

  // 扩展字段：关联的用户信息
  userId?: number // 用户ID
  deptName?: string // 部门名称
}

// 员工分页查询参数
export interface EmployeePageReqVO {
  pageNo?: number // 页码
  pageSize?: number // 每页大小
  nickname?: string // 用户昵称，模糊匹配
  workerCode?: number // 工号
  mobile?: string // 手机号码
  status?: number // 用户状态：0=正常，1=禁用
  deptId?: number // 部门编号
  createTime?: Date[] // 创建时间范围
}

// 员工管理 API
export const EmployeeApi = {
  // 查询员工分页
  getEmployeePage: async (params: EmployeePageReqVO) => {
    return await request.get({ url: `/admin-api/business/employee/page`, params })
  },

  // 查询员工详情
  getEmployee: async (id: number) => {
    return await request.get({ url: `/admin-api/business/employee/get?id=` + id })
  },

  // 新增员工
  createEmployee: async (data: EmployeeVO) => {
    return await request.post({ url: `/admin-api/business/employee/create`, data })
  },

  // 修改员工
  updateEmployee: async (data: EmployeeVO) => {
    return await request.put({ url: `/admin-api/business/employee/update`, data })
  },

  // 删除员工
  deleteEmployee: async (id: number) => {
    return await request.delete({ url: `/admin-api/business/employee/delete?id=` + id })
  },

  // 导出员工 Excel
  exportEmployee: async (params: EmployeePageReqVO) => {
    return await request.download({ url: `/admin-api/business/employee/export-excel`, params })
  },

  // 根据工号获取员工信息
  getEmployeeByWorkerCode: async (workerCode: number) => {
    return await request.get({ url: `/admin-api/business/employee/get-by-worker-code?workerCode=` + workerCode })
  },

  // 获取指定部门的员工列表
  getEmployeeListByDept: async (deptId: number) => {
    return await request.get({ url: `/admin-api/business/employee/list-by-dept?deptId=` + deptId })
  },

  // 根据员工状态获取员工列表
  getEmployeeListByStatus: async (status: number) => {
    return await request.get({ url: `/admin-api/business/employee/list-by-status?status=` + status })
  },

  // 生成工号
  generateWorkerCode: async () => {
    return await request.get({ url: `/admin-api/business/employee/generate-worker-code` })
  },

  // ==================== 扩展功能 ====================

  // 获取在职员工精简信息列表（用于下拉选择）
  getActiveEmployeeList: async (): Promise<EmployeeVO[]> => {
    return await request.get({ url: `/admin-api/business/employee/list-by-status?status=0` })
  },

  // 获取指定部门的在职员工列表
  getActiveEmployeeListByDept: async (deptId: number): Promise<EmployeeVO[]> => {
    const params = { status: 0, deptId }
    const result = await request.get({ url: `/admin-api/business/employee/page`, params })
    return result.list || []
  },

  // 批量更新员工状态
  batchUpdateEmployeeStatus: async (ids: number[], status: number) => {
    const promises = ids.map(id => {
      const data = { id, status }
      return request.put({ url: `/admin-api/business/employee/update`, data })
    })
    return await Promise.all(promises)
  },

  // 校验工号是否唯一
  checkWorkerCodeUnique: async (workerCode: number, excludeId?: number) => {
    try {
      const result = await EmployeeApi.getEmployeeByWorkerCode(workerCode)
      if (result && result.id !== excludeId) {
        return false // 工号已存在
      }
      return true // 工号可用
    } catch (error) {
      return true // 查询不到，说明可用
    }
  },

  // 获取员工统计信息
  getEmployeeStatistics: async () => {
    const [activeEmployees, inactiveEmployees] = await Promise.all([
      EmployeeApi.getEmployeeListByStatus(0), // 在职员工
      EmployeeApi.getEmployeeListByStatus(1)  // 离职员工
    ])

    return {
      totalEmployees: activeEmployees.length + inactiveEmployees.length,
      activeEmployees: activeEmployees.length,
      inactiveEmployees: inactiveEmployees.length,
      activeRate: activeEmployees.length / (activeEmployees.length + inactiveEmployees.length) * 100
    }
  }
}

// 员工状态枚举
export const EmployeeStatus = {
  ACTIVE: 0,   // 在职
  INACTIVE: 1  // 离职
} as const

// 性别枚举
export const Gender = {
  MALE: 1,   // 男性
  FEMALE: 2  // 女性
} as const

// 学历枚举（如果需要扩展）
export const EducationLevel = {
  HIGH_SCHOOL: 1, // 高中及以下
  COLLEGE: 2,     // 大专
  BACHELOR: 3,    // 本科
  MASTER: 4,      // 硕士
  PHD: 5          // 博士
} as const

// 员工管理相关的工具函数
export const EmployeeUtils = {
  // 格式化员工状态
  formatStatus: (status: number): string => {
    return status === EmployeeStatus.ACTIVE ? '在职' : '离职'
  },

  // 格式化性别
  formatGender: (sex?: number): string => {
    if (!sex) return '未设置'
    return sex === Gender.MALE ? '男' : '女'
  },

  // 格式化工号（补零）
  formatWorkerCode: (workerCode: number): string => {
    return workerCode.toString().padStart(5, '0')
  },

  // 生成员工显示名称（昵称 + 工号）
  formatEmployeeName: (employee: EmployeeVO): string => {
    return `${employee.nickname}(${EmployeeUtils.formatWorkerCode(employee.workerCode)})`
  },

  // 检查员工是否在职
  isActive: (employee: EmployeeVO): boolean => {
    return employee.status === EmployeeStatus.ACTIVE
  }
}

export default EmployeeApi
