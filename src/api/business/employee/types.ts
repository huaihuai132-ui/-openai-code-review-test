// 员工管理相关的 TypeScript 类型定义

// 基础员工信息接口
export interface BaseEmployeeInfo {
  id?: number // 用户ID
  username: string // 用户账号
  nickname: string // 用户昵称
  workerCode: number // 工号
  status: number // 状态：0=在职，1=离职
}

// 完整员工信息接口
export interface EmployeeVO extends BaseEmployeeInfo {
  rank?: string // 职级
  deptId?: number // 部门编号
  deptName?: string // 部门名称
  postIds?: number[] // 岗位编号数组
  email?: string // 用户邮箱
  mobile?: string // 手机号码
  sex?: number // 用户性别：1=男性，2=女性
  avatar?: string // 用户头像
  officePhone?: string // 办公电话
  officeNumber?: string // 办公室房号
  password?: string // 密码，新增时必填
  remark?: string // 备注
  createTime?: Date // 创建时间
  updateTime?: Date // 更新时间
  loginDate?: Date // 最后登录时间
  loginIp?: string // 最后登录IP
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

// 员工表单数据接口（用于新增/编辑表单）
export interface EmployeeFormData {
  id?: number // 编辑时需要
  username: string // 用户账号
  nickname: string // 用户昵称
  workerCode: number // 工号
  rank?: string // 职级
  deptId?: number // 部门编号
  postIds?: number[] // 岗位编号数组
  email?: string // 用户邮箱
  mobile?: string // 手机号码
  sex?: number // 用户性别
  avatar?: string // 用户头像
  status: number // 帐号状态
  officePhone?: string // 办公电话
  officeNumber?: string // 办公室房号
  password?: string // 密码
  remark?: string // 备注
}

// 员工统计信息接口
export interface EmployeeStatistics {
  totalEmployees: number // 员工总数
  activeEmployees: number // 在职员工数
  inactiveEmployees: number // 离职员工数
  activeRate: number // 在职率
}

// 员工状态枚举
export enum EmployeeStatus {
  ACTIVE = 0,   // 在职
  INACTIVE = 1  // 离职
}

// 性别枚举
export enum Gender {
  MALE = 1,   // 男性
  FEMALE = 2  // 女性
}

// 学历枚举
export enum EducationLevel {
  HIGH_SCHOOL = 1, // 高中及以下
  COLLEGE = 2,     // 大专
  BACHELOR = 3,    // 本科
  MASTER = 4,      // 硕士
  PHD = 5          // 博士
}

// 员工列表项接口（用于列表显示）
export interface EmployeeListItem {
  id: number
  username: string
  nickname: string
  workerCode: number
  rank?: string
  deptName?: string
  mobile?: string
  email?: string
  status: number
  createTime?: Date
}

// 员工下拉选择项接口
export interface EmployeeSelectOption {
  value: number // 员工ID
  label: string // 显示文本（昵称 + 工号）
  workerCode: number // 工号
  deptId?: number // 部门ID
  disabled?: boolean // 是否禁用
}

// 导入员工数据接口
export interface EmployeeImportData {
  username: string
  nickname: string
  workerCode: number
  deptName?: string
  mobile?: string
  email?: string
  rank?: string
}

// 导入结果接口
export interface EmployeeImportResult {
  successCount: number // 成功导入数量
  failCount: number // 失败数量
  errors?: string[] // 错误信息列表
}

// 员工查询条件接口
export interface EmployeeQueryCondition {
  keyword?: string // 关键词搜索（姓名、工号、手机号）
  deptId?: number // 部门ID
  status?: number // 状态
  dateRange?: Date[] // 时间范围
  postId?: number // 岗位ID
}

// 员工操作日志接口
export interface EmployeeOperateLog {
  id: number
  employeeId: number
  operateType: string // 操作类型：create, update, delete, activate, deactivate
  operateDesc: string // 操作描述
  operatorName: string // 操作人
  operateTime: Date // 操作时间
}

// 导出参数接口
export interface EmployeeExportParams extends EmployeePageReqVO {
  exportType?: 'all' | 'selected' // 导出类型：全部或选中
  selectedIds?: number[] // 选中的员工ID列表
}
