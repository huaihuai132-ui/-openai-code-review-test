// 普通文件上传组件（使用 /infra/file/ 接口）
import UploadFile from './src/UploadFile.vue'
import BatchFileUpload from './src/BatchFileUpload.vue'

// 静态文件上传组件（使用 /infra/static-file/ 接口）
import StaticFileUpload from './src/StaticFileUpload.vue'
import StaticImgUpload from './src/StaticImgUpload.vue'

// 头像上传组件
import UploadImg from './src/UploadImg.vue'

export {
  // 普通文件上传
  UploadFile,
  BatchFileUpload,

  // 静态文件上传
  StaticFileUpload,
  StaticImgUpload,

  // 头像上传组件
  UploadImg,

  // 兼容性导出：UploadImgs 使用 UploadImg 替代
  UploadImg as UploadImgs
}
