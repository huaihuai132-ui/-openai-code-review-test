import SingleFileUpload from './SingleFileUpload.vue'
import BatchFileUpload from './BatchFileUpload.vue'

// 导出单个文件上传组件
export { SingleFileUpload }

// 导出批量文件上传组件
export { BatchFileUpload }

// 默认导出单个文件上传组件
export default SingleFileUpload

// 组件安装函数（可选）
export const install = (app: any) => {
  app.component('SingleFileUpload', SingleFileUpload)
  app.component('BatchFileUpload', BatchFileUpload)
} 