/**
 * 快捷入口项接口定义
 */
export interface Shortcut {
  /** 唯一标识符 - 系统自动生成的ID */
  id: string | number
  
  /** 排序序号 - 用于控制显示顺序，数字越小越靠前 */
  order: number
  
  /** 显示名称 - 快捷入口的显示文本 */
  name: string
  
  /** 图标标识 - Element Plus 图标名称，如 ep:document */
  icon: string
  
  /** 跳转链接 - 点击后跳转的路由地址 */
  url: string
  
  /** 主题颜色 - 图标的显示颜色，支持十六进制颜色值 */
  color: string
}
