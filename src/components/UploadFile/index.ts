// 普通文件上传组件（使用 /infra/file/ 接口）
import UploadFile from './src/UploadFile.vue'
import BatchFileUpload from './src/BatchFileUpload.vue'

// 静态文件上传组件（使用 /infra/static-file/ 接口）
import StaticFileUpload from './src/StaticFileUpload.vue'
import StaticImgUpload from './src/StaticImgUpload.vue'

// 保留的原有组件
import UploadImg from './src/UploadImg.vue'
import UploadImgs from './src/UploadImgs.vue'

export {
  // 普通文件上传
  UploadFile,
  BatchFileUpload,

  // 静态文件上传
  StaticFileUpload,
  StaticImgUpload,

  // 原有组件（保持兼容性）
  UploadImg,
  UploadImgs
}
