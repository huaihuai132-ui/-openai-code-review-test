# 文件上传组件使用文档

本文档详细介绍了四个文件上传组件的使用方法，包括单文件上传、批量文件上传、静态文件上传和静态图片上传。

## 📋 组件概览

| 组件 | 功能 | 适用场景 | 存储位置 |
|------|------|----------|----------|
| `UploadFile` | 单文件上传 | 表单中需要上传单个文件 | MinIO oafile 桶 |
| `BatchFileUpload` | 批量文件上传 | 需要上传多个文件 | MinIO oafile 桶 |
| `StaticFileUpload` | 静态文件上传 | 公共资源、静态文件 | MinIO static 桶（匿名访问） |
| `StaticImgUpload` | 静态图片上传 | 头像、产品图片等单张图片 | MinIO static 桶（匿名访问） |

## 🔧 通用特性

所有组件都支持以下特性：
- ✅ **文件全能框设计**：拖拽 + 点击选择文件
- ✅ **实时别名编辑**：点击 🖊 图标编辑文件名，点击 ✓ 确认
- ✅ **圆形进度条**：显示上传进度、速度和剩余时间
- ✅ **取消上传**：悬停进度条显示红色取消按钮
- ✅ **文件预览**：上传完成后悬停显示预览按钮
- ✅ **文件删除**：右上角 × 按钮删除文件
- ✅ **序列模式**：支持按业务文件序列表上传
- ✅ **自动清理**：页面离开时自动清理未保存的文件
- ✅ **表单验证**：提供文件验证方法

## 📁 组件详细使用说明

### 1. UploadFile - 单文件上传组件

**适用场景**：表单中需要上传单个文件，如合同、报告等。

#### 基本用法

```vue
<template>
  <UploadFile 
    ref="uploadFileRef"
    v-model:fileList="form.fileList"
    mode="create"
    file-type="common"
    directory="contracts"
    tip="支持上传单个文件，大小不超过10MB"
  />
</template>

<script setup>
import { UploadFile } from '@/components/UploadFile'

const form = reactive({
  fileList: [] as number[]
})

const uploadFileRef = ref()
</script>
```

#### 序列模式用法

```vue
<template>
  <UploadFile 
    ref="uploadFileRef"
    v-model:fileList="form.fileList"
    :sequence-code="form.sequenceCode"
    mode="create"
    file-type="common"
    directory="product"
  />
</template>

<script setup>
const form = reactive({
  sequenceCode: 'SPQD1-20250817', // 序列编码
  fileList: [] as number[]
})
</script>
```

#### Props

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `fileList` | `number[]` | `[]` | 文件ID列表，支持v-model |
| `mode` | `'create' \| 'view' \| 'edit'` | `'create'` | 组件模式 |
| `sequenceCode` | `string` | `''` | 序列编码，关联业务文件序列表 |
| `fileType` | `'common' \| 'static'` | `'common'` | 文件类型，决定使用的API |
| `directory` | `string` | `'files'` | 上传目录 |
| `tip` | `string` | `''` | 提示文字 |

#### 事件

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `update:fileList` | `number[]` | 文件列表更新 |
| `delete` | `number` | 文件被删除 |

#### 方法

```vue
<script setup>
// 清理未保存的文件
const clearFiles = () => {
  uploadFileRef.value?.clearUnsavedFiles()
}

// 验证文件
const validateFiles = () => {
  return uploadFileRef.value?.validateFiles()
}
</script>
```

---

### 2. BatchFileUpload - 批量文件上传组件

**适用场景**：需要上传多个文件，如文档资料、附件等。

#### 基本用法

```vue
<template>
  <BatchFileUpload 
    ref="batchUploadRef"
    v-model:fileList="form.fileList"
    mode="create"
    file-type="common"
    directory="documents"
    :max-files="5"
    tip="支持批量上传多个文件，最多5个"
  />
</template>

<script setup>
import { BatchFileUpload } from '@/components/UploadFile'

const form = reactive({
  fileList: [] as number[]
})

const batchUploadRef = ref()
</script>
```

#### 序列模式用法

```vue
<template>
  <BatchFileUpload 
    ref="batchUploadRef"
    v-model:fileList="form.fileList"
    :sequence-code="form.sequenceCode"
    mode="create"
    file-type="common"
    directory="materials"
    :max-files="3"
  />
</template>
```

#### Props

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `fileList` | `number[]` | `[]` | 文件ID列表，支持v-model |
| `mode` | `'create' \| 'view' \| 'edit'` | `'create'` | 组件模式 |
| `sequenceCode` | `string` | `''` | 序列编码 |
| `fileType` | `'common' \| 'static'` | `'common'` | 文件类型 |
| `maxFiles` | `number` | `5` | 最大文件数量 |
| `directory` | `string` | `'files'` | 上传目录 |
| `tip` | `string` | `''` | 提示文字 |

#### 特有功能

- **添加更多文件**：点击"添加更多文件"按钮增加文件框
- **批量操作**：支持"上传全部"和"清空全部"操作
- **动态删除**：删除文件时移除对应的文件框

---

### 3. StaticFileUpload - 静态文件上传组件

**适用场景**：上传公共资源、静态文件，支持匿名访问。

#### 基本用法

```vue
<template>
  <StaticFileUpload 
    ref="staticUploadRef"
    v-model:fileList="form.fileList"
    mode="create"
    directory="static"
    :max-files="3"
    tip="上传到static桶，支持匿名访问"
  />
</template>

<script setup>
import { StaticFileUpload } from '@/components/UploadFile'

const form = reactive({
  fileList: [] as number[]
})

const staticUploadRef = ref()
</script>
```

#### Props

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `fileList` | `number[]` | `[]` | 文件ID列表，支持v-model |
| `mode` | `'create' \| 'view' \| 'edit'` | `'create'` | 组件模式 |
| `sequenceCode` | `string` | `''` | 序列编码 |
| `maxFiles` | `number` | `5` | 最大文件数量 |
| `directory` | `string` | `'static'` | 上传目录 |
| `tip` | `string` | `''` | 提示文字 |

#### 特点

- **存储位置**：MinIO static 桶
- **访问权限**：支持匿名访问，无需认证
- **API区别**：使用静态文件专用API

---

### 4. StaticImgUpload - 静态图片上传组件

**适用场景**：上传头像、产品图片等单张图片。

#### 基本用法

```vue
<template>
  <StaticImgUpload 
    ref="staticImgRef"
    v-model:fileList="form.avatarList"
    mode="create"
    directory="avatars"
    :file-size="5"
    tip="支持上传单张图片，大小不超过5MB"
  />
</template>

<script setup>
import { StaticImgUpload } from '@/components/UploadFile'

const form = reactive({
  avatarList: [] as number[] // 只包含一个图片ID
})

const staticImgRef = ref()
</script>
```

#### Props

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `fileList` | `number[]` | `[]` | 图片ID列表（只含一个元素） |
| `mode` | `'create' \| 'view' \| 'edit'` | `'create'` | 组件模式 |
| `sequenceCode` | `string` | `''` | 序列编码 |
| `directory` | `string` | `'images'` | 上传目录 |
| `fileSize` | `number` | `5` | 文件大小限制（MB） |
| `fileType` | `string[]` | `['.jpg', '.jpeg', '.png', '.gif', '.webp']` | 支持的图片格式 |
| `tip` | `string` | `''` | 提示文字 |

#### 特点

- **单图片模式**：只支持上传一张图片
- **图片预览**：直接显示图片而不是文件图标
- **格式限制**：只允许图片格式文件
- **存储位置**：MinIO static 桶

---

## 🔄 组件模式说明

### create 模式（创建）
- 显示空的文件框，允许选择和上传文件
- 支持拖拽和点击选择
- 支持实时编辑文件名

### view 模式（查看）
- 只读模式，显示已上传的文件
- 不允许添加、删除或编辑
- 支持预览功能

### edit 模式（编辑）
- 显示已有文件，允许添加新文件
- 支持删除现有文件
- 支持替换文件（先删除再上传）

## 📝 序列模式详解

序列模式通过 `sequenceCode` 参数启用，需要在后端配置文件业务序列表：

```sql
-- 业务文件序列表示例
CREATE TABLE infra_file_business_sequence (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sequence_code VARCHAR(50) NOT NULL,    -- 序列编码
  sequence_business VARCHAR(50) NOT NULL, -- 序列业务名
  sequence_file VARCHAR(50) NOT NULL,     -- 序列文件名
  sequence_value TINYINT UNSIGNED NOT NULL, -- 序列值
  -- ... 其他字段
);

-- 示例数据
INSERT INTO infra_file_business_sequence VALUES
(1, 'SPQD1-20250817', '商品', '商品清单1', 1),
(2, 'SPQD1-20250817', '商品', '商品清单2', 2),
(3, 'SPQD1-20250817', '商品', '商品清单3', 3);
```

使用序列模式时：
- 组件会根据序列长度自动生成对应数量的文件框
- 每个文件框显示对应的文件名要求
- 文件按顺序上传，对应序列值

## 🎯 最佳实践

### 1. 表单集成

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="文件" prop="fileList">
      <UploadFile 
        ref="uploadRef"
        v-model:fileList="form.fileList"
        mode="create"
        directory="contracts"
      />
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
const form = reactive({
  fileList: [] as number[]
})

const rules = {
  fileList: [
    { required: true, message: '请上传文件', trigger: 'change' }
  ]
}

const submitForm = async () => {
  // 1. 验证表单
  const formValid = await formRef.value?.validate()
  if (!formValid) return
  
  // 2. 验证文件
  const fileValid = uploadRef.value?.validateFiles()
  if (!fileValid) return
  
  // 3. 提交数据
  const submitData = {
    ...form,
    submitTime: new Date().toISOString()
  }
  
  console.log('提交数据:', submitData)
  // 调用后端API...
}

// 页面离开时清理未保存文件
onBeforeUnmount(() => {
  uploadRef.value?.clearUnsavedFiles()
})
</script>
```

### 2. 错误处理

```vue
<script setup>
const handleUploadError = (error: any) => {
  console.error('上传失败:', error)
  ElMessage.error('文件上传失败，请重试')
}

const handleFileDelete = (fileId: number) => {
  console.log('文件已删除:', fileId)
  // 可以在这里执行额外的清理逻辑
}
</script>
```

### 3. 权限控制

```vue
<template>
  <!-- 根据权限显示不同模式 -->
  <UploadFile 
    :mode="hasEditPermission ? 'edit' : 'view'"
    v-model:fileList="form.fileList"
  />
</template>

<script setup>
const hasEditPermission = computed(() => {
  // 检查用户权限
  return user.permissions.includes('file:edit')
})
</script>
```

## 🔧 API 接口说明

组件使用以下API接口：

### 普通文件API (`/infra/file/`)
- `getFilePresignedUrl` - 获取预签名URL
- `createFile` - 创建文件记录
- `deleteFile` - 删除文件
- `getFilesByIds` - 根据ID批量获取文件信息

### 静态文件API (`/infra/static-file/`)
- `getStaticFilePresignedUrl` - 获取静态文件预签名URL
- `createStaticFile` - 创建静态文件记录
- `deleteStaticFile` - 删除静态文件

### 序列API (`/infra/file-business-sequence/`)
- `getFileBusinessSequenceGroupListByCode` - 根据序列编码获取序列配置

## ⚠️ 注意事项

1. **文件大小限制**：建议设置合理的文件大小限制
2. **格式限制**：根据业务需求设置允许的文件格式
3. **权限控制**：在不同模式下控制用户操作权限
4. **错误处理**：妥善处理网络错误和上传失败
5. **内存管理**：及时清理未保存的文件避免占用存储空间
6. **用户体验**：提供清晰的提示信息和反馈

## 🚀 更新日志

- **v2.0.0** - 重构为文件全能框设计，支持拖拽、实时编辑、进度显示
- **v1.0.0** - 初始版本，基础上传功能

---

有任何问题或建议，请查看组件源码或联系开发团队。