// 员工管理工具函数

import type { EmployeeVO, EmployeeStatus, Gender, EducationLevel, EmployeeSelectOption } from './types'

/**
 * 获取员工状态文本
 */
export function getEmployeeStatusText(status: number): string {
  switch (status) {
    case EmployeeStatus.ACTIVE:
      return '在职'
    case EmployeeStatus.INACTIVE:
      return '离职'
    default:
      return '未知'
  }
}

/**
 * 获取员工状态标签类型
 */
export function getEmployeeStatusType(status: number): 'success' | 'danger' | 'info' {
  switch (status) {
    case EmployeeStatus.ACTIVE:
      return 'success'
    case EmployeeStatus.INACTIVE:
      return 'danger'
    default:
      return 'info'
  }
}

/**
 * 获取性别文本
 */
export function getGenderText(sex: number): string {
  switch (sex) {
    case Gender.MALE:
      return '男'
    case Gender.FEMALE:
      return '女'
    default:
      return '未知'
  }
}

/**
 * 获取学历文本
 */
export function getEducationText(level: number): string {
  switch (level) {
    case EducationLevel.HIGH_SCHOOL:
      return '高中及以下'
    case EducationLevel.COLLEGE:
      return '大专'
    case EducationLevel.BACHELOR:
      return '本科'
    case EducationLevel.MASTER:
      return '硕士'
    case EducationLevel.PHD:
      return '博士'
    default:
      return '未知'
  }
}

/**
 * 格式化员工工号显示
 */
export function formatWorkerCode(workerCode: number): string {
  return workerCode.toString().padStart(6, '0')
}

/**
 * 生成员工选择选项
 */
export function generateEmployeeSelectOptions(employees: EmployeeVO[]): EmployeeSelectOption[] {
  return employees.map(employee => ({
    value: employee.id!,
    label: `${employee.nickname}（${formatWorkerCode(employee.workerCode)}）`,
    workerCode: employee.workerCode,
    deptId: employee.deptId,
    disabled: employee.status === EmployeeStatus.INACTIVE
  }))
}

/**
 * 验证工号格式
 */
export function validateWorkerCode(workerCode: string | number): boolean {
  const code = typeof workerCode === 'string' ? parseInt(workerCode) : workerCode
  return !isNaN(code) && code > 0 && code <= 999999
}

/**
 * 验证手机号格式
 */
export function validateMobile(mobile: string): boolean {
  const mobileRegex = /^1[3-9]\d{9}$/
  return mobileRegex.test(mobile)
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 格式化创建时间显示
 */
export function formatCreateTime(createTime: Date | string): string {
  if (!createTime) return '-'
  const date = typeof createTime === 'string' ? new Date(createTime) : createTime
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 检查员工是否在职
 */
export function isEmployeeActive(status: number): boolean {
  return status === EmployeeStatus.ACTIVE
}

/**
 * 获取员工状态选项
 */
export function getEmployeeStatusOptions() {
  return [
    { label: '在职', value: EmployeeStatus.ACTIVE },
    { label: '离职', value: EmployeeStatus.INACTIVE }
  ]
}

/**
 * 获取性别选项
 */
export function getGenderOptions() {
  return [
    { label: '男', value: Gender.MALE },
    { label: '女', value: Gender.FEMALE }
  ]
}

/**
 * 获取学历选项
 */
export function getEducationOptions() {
  return [
    { label: '高中及以下', value: EducationLevel.HIGH_SCHOOL },
    { label: '大专', value: EducationLevel.COLLEGE },
    { label: '本科', value: EducationLevel.BACHELOR },
    { label: '硕士', value: EducationLevel.MASTER },
    { label: '博士', value: EducationLevel.PHD }
  ]
}

/**
 * 生成默认密码
 */
export function generateDefaultPassword(): string {
  return '123456' // 可以根据需要修改默认密码生成规则
}

/**
 * 处理员工搜索关键词
 */
export function processSearchKeyword(keyword: string): string {
  return keyword.trim()
}

/**
 * 计算员工在职率
 */
export function calculateActiveRate(activeCount: number, totalCount: number): number {
  if (totalCount === 0) return 0
  return Math.round((activeCount / totalCount) * 100)
}

/**
 * 格式化员工完整信息显示
 */
export function formatEmployeeInfo(employee: EmployeeVO): string {
  const parts = []
  parts.push(employee.nickname)
  if (employee.workerCode) {
    parts.push(`工号: ${formatWorkerCode(employee.workerCode)}`)
  }
  if (employee.deptName) {
    parts.push(`部门: ${employee.deptName}`)
  }
  if (employee.rank) {
    parts.push(`职级: ${employee.rank}`)
  }
  return parts.join(' | ')
}

/**
 * 检查是否需要显示密码字段
 */
export function shouldShowPasswordField(isEdit: boolean, employee?: EmployeeVO): boolean {
  return !isEdit || !employee?.id
}

/**
 * 生成导出文件名
 */
export function generateExportFileName(prefix: string = '员工信息'): string {
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[:]/g, '-')
  return `${prefix}_${timestamp}.xlsx`
}

/**
 * 处理员工头像URL
 */
export function processAvatarUrl(avatar?: string): string {
  if (!avatar) {
    return '/images/default-avatar.png' // 默认头像路径
  }
  // 如果是相对路径，添加基础URL
  if (avatar.startsWith('/')) {
    return import.meta.env.VITE_APP_BASE_API + avatar
  }
  return avatar
}
