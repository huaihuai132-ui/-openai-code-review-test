# FileUpload 文件上传组件

提供单个文件上传和批量文件上传功能，支持进度显示、取消上传、自定义文件名等特性。

## 组件介绍

### SingleFileUpload - 单个文件上传组件

用于上传单个文件，支持拖拽上传、进度显示、自定义文件名等功能。

### BatchFileUpload - 批量文件上传组件

用于批量上传多个文件，支持并发上传、整体进度显示、单个文件进度显示等功能。

## 基本用法

### 单个文件上传

```vue
<template>
  <div>
    <SingleFileUpload
      :drag="true"
      directory="documents"
      @upload-success="handleSingleUploadSuccess"
      @upload-error="handleUploadError"
    />
  </div>
  <!-- accept=".jpg,.png,.pdf,.doc,.docx"
      tip="支持 jpg、png、pdf、doc、docx 格式" -->
</template>

<script setup>
import { SingleFileUpload } from '@/components/FileUpload'

const handleSingleUploadSuccess = (result, file) => {
  console.log('上传成功:', result)
  // result 格式: { "文件名": "文件URL" }
  // 例如: { "我的文档": "https://minio.example.com/bucket/file.pdf" }
}

const handleUploadError = (error, file) => {
  console.error('上传失败:', error)
}
</script>
```

### 批量文件上传

```vue
<template>
  <div>
    <BatchFileUpload
      :max-files="5"
      :concurrent="2"
      :drag="true"
      accept=".jpg,.png,.pdf"
      tip="最多可选择5个文件，支持jpg、png、pdf格式"
      directory="uploads"
      @upload-success="handleBatchUploadSuccess"
      @upload-complete="handleUploadComplete"
    />
  </div>
</template>

<script setup>
import { BatchFileUpload } from '@/components/FileUpload'

const handleBatchUploadSuccess = (results) => {
  console.log('批量上传成功:', results)
  // results 格式: { "文件名1": "URL1", "文件名2": "URL2", ... }
  // 例如: {
  //   "图片1": "https://minio.example.com/bucket/image1.jpg",
  //   "文档1": "https://minio.example.com/bucket/doc1.pdf"
  // }
}

const handleUploadComplete = (summary) => {
  console.log('上传完成统计:', summary)
  // summary 格式: { success: 3, total: 5, results: [...] }
}
</script>
```

## API 文档

### SingleFileUpload Props

| 参数             | 说明             | 类型    | 默认值 |
| ---------------- | ---------------- | ------- | ------ |
| showFileList     | 是否显示文件列表 | boolean | true   |
| showUploadButton | 是否显示上传按钮 | boolean | true   |
| drag             | 是否启用拖拽上传 | boolean | false  |
| accept           | 接受的文件类型   | string  | ''     |
| tip              | 提示文字         | string  | ''     |
| directory        | 上传目录         | string  | ''     |
| autoUpload       | 是否自动上传     | boolean | false  |

### SingleFileUpload Events

| 事件名          | 说明     | 回调参数                       |
| --------------- | -------- | ------------------------------ |
| upload-success  | 上传成功 | (result: object, file: File)   |
| upload-error    | 上传失败 | (error: any, file: File)       |
| upload-progress | 上传进度 | (progress: object)             |
| file-change     | 文件改变 | (file: File, fileList: File[]) |

### BatchFileUpload Props

| 参数       | 说明             | 类型    | 默认值 |
| ---------- | ---------------- | ------- | ------ |
| maxFiles   | 最大文件数量     | number  | 10     |
| drag       | 是否启用拖拽上传 | boolean | false  |
| accept     | 接受的文件类型   | string  | ''     |
| tip        | 提示文字         | string  | ''     |
| directory  | 上传目录         | string  | ''     |
| concurrent | 并发上传数量     | number  | 3      |

### BatchFileUpload Events

| 事件名          | 说明     | 回调参数                       |
| --------------- | -------- | ------------------------------ |
| upload-success  | 上传成功 | (results: object)              |
| upload-error    | 上传失败 | (error: any)                   |
| upload-progress | 上传进度 | (progress: object)             |
| file-change     | 文件改变 | (file: File, fileList: File[]) |
| upload-complete | 上传完成 | (summary: object)              |

## 返回数据格式

### 单个文件上传成功返回

```javascript
{
  "文件名": "文件URL"
}
```

### 批量文件上传成功返回

```javascript
{
  "文件名1": "文件URL1",
  "文件名2": "文件URL2",
  "文件名3": "文件URL3"
}
```

## 特性说明

### 1. 自定义文件名

- 用户可以为每个文件设置自定义名称
- 如果不设置，默认使用原文件名（去掉扩展名）
- 返回结果中的key使用自定义文件名或原文件名

### 2. 上传进度显示

- 实时显示上传进度百分比
- 显示上传速度和预估剩余时间
- 支持取消上传操作

### 3. 批量上传特性

- 支持并发上传，可配置并发数量
- 显示整体上传进度和单个文件进度
- 支持取消全部上传或单个文件上传

### 4. 错误处理

- 完善的错误提示和状态显示
- 支持重试机制
- 区分不同类型的错误（网络错误、取消等）

## 注意事项

1. 组件依赖 `@/components/UploadFile/src/useUpload` 钩子
2. 需要正确配置后端上传接口和Minio服务
3. 文件名中的特殊字符会被自动处理
4. 大文件上传建议适当调整并发数量以避免性能问题
