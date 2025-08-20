# 📁 文件上传组件使用手册

本文档详细介绍了新一代文件上传组件库的完整使用方法。该组件库提供了四个核心组件，采用文件全能框设计，支持拖拽、实时编辑、进度显示等现代化交互功能。

## 📋 组件概览

| 组件 | 功能定位 | 适用场景 | 存储位置 | 特色功能 |
| --- | --- | --- | --- | --- |
| `UploadFile` | 普通文件上传 | 表单中需要上传普通文件 | MinIO oafile 桶 | 文件全能框、实时别名编辑 |
| `BatchFileUpload` | 批量文件上传 | 需要上传多个文件 | MinIO oafile 桶 | 动态文件框、序列模式 |
| `StaticFileUpload` | 静态文件上传 | 公共资源、静态文件 | MinIO static 桶 | 匿名访问、公共存储 |
| `StaticImgUpload` | 静态图片上传 | 头像、产品图片等 | MinIO static 桶 | 图片预览、格式限制 |

## ✨ 核心特性

### 🎯 文件全能框设计

- **拖拽 + 点击**：支持文件拖拽和点击选择两种方式
- **实时预览**：上传完成后悬停显示预览按钮
- **视觉反馈**：不同状态下的清晰视觉指示

### 📝 实时别名编辑

- **点击编辑**：点击 🖊 图标进入编辑模式
- **即时保存**：点击 ✓ 确认保存别名
- **表单集成**：别名作为文件的显示名称

### 📊 智能进度显示

- **圆形进度条**：显示上传进度百分比
- **速度监控**：实时显示上传速度（KB/s, MB/s）
- **剩余时间**：动态计算预估完成时间
- **取消功能**：悬停进度条显示红色取消按钮

### 🔄 序列模式支持

- **业务序列表**：根据序列编码自动生成文件框
- **有序上传**：按序列值顺序上传文件
- **命名规范**：自动显示对应的文件名要求

### 🧹 自动清理机制

- **生命周期管理**：页面离开时自动清理未保存文件
- **内存优化**：及时释放未使用的文件资源
- **状态跟踪**：区分已保存和未保存的文件

## 📖 详细使用指南

### 1. UploadFile - 单文件上传组件

**适用场景**：表单中需要上传单个文件，如合同、报告、证书等。

#### 基础用法

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="合同文件" prop="fileList">
      <UploadFile
        ref="uploadFileRef"
        v-model:fileList="form.fileList"
        mode="create"
        directory="contracts"
        tip="支持上传单个文件，大小不超过10MB"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue'
import { UploadFile } from '@/components/UploadFile'

const form = reactive({
  fileList: [] as number[]
})

const rules = {
  fileList: [{ required: true, message: '请上传合同文件', trigger: 'change' }]
}

const uploadFileRef = ref()
const formRef = ref()

// 提交表单
const submitForm = async () => {
  // 1. 验证表单
  const formValid = await formRef.value?.validate()
  if (!formValid) return

  // 2. 验证文件
  const fileValidation = uploadFileRef.value?.validateFiles()
  if (!fileValidation?.valid) {
    ElMessage.error(fileValidation.message)
    return
  }

  // 3. 获取文件信息
  const fileList = uploadFileRef.value?.getFileList() || []
  const fileDetails = uploadFileRef.value?.getFileDetails() || []

  // 4. 提交数据
  console.log('文件ID列表:', fileList)
  console.log('文件详细信息:', fileDetails)

  // 5. 标记为已保存
  uploadFileRef.value?.markFilesAsSaved()
}

// 页面离开时清理
onBeforeUnmount(() => {
  uploadFileRef.value?.clearUnsavedFiles()
})
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
    tip="根据序列编码自动生成对应的文件框"
  />
</template>

<script setup lang="ts">
const form = reactive({
  sequenceCode: 'SPQD1-20250817', // 业务序列编码
  fileList: [] as number[]
})
</script>
```

#### Props 详解

| 参数 | 类型 | 默认值 | 必填 | 描述 |
| --- | --- | --- | --- | --- |
| `fileList` | `number[]` | `[]` | ✓ | 文件ID列表，支持v-model双向绑定 |
| `mode` | `'create' \| 'view' \| 'edit'` | `'create'` | - | 组件运行模式 |
| `sequenceCode` | `string` | `''` | - | 业务序列编码，启用序列模式 |
| `acceptTypes` | `string[]` | `[]` | - | 允许的文件格式（如：['pdf', 'doc', 'docx']） |
| `fileSource` | `number` | `0` | - | 文件来源（0=业务文件，1=个人文件） |
| `fileSize` | `number` | `10` | - | 文件大小限制（MB） |
| `directory` | `string` | `'files'` | - | 上传目录路径 |
| `accept` | `string` | `''` | - | HTML accept属性值 |
| `tip` | `string` | `''` | - | 提示文字 |
| `isShowTip` | `boolean` | `true` | - | 是否显示提示信息 |

#### 事件

| 事件名            | 参数       | 描述               |
| ----------------- | ---------- | ------------------ |
| `update:fileList` | `number[]` | 文件列表更新时触发 |
| `delete`          | `number`   | 文件被删除时触发   |
| `upload-success`  | `object`   | 文件上传成功时触发 |
| `upload-error`    | `Error`    | 文件上传失败时触发 |
| `upload-progress` | `object`   | 上传进度更新时触发 |

#### 方法

| 方法名                | 返回值                               | 描述                 |
| --------------------- | ------------------------------------ | -------------------- |
| `getFileList()`       | `number[]`                           | 获取当前文件ID列表   |
| `getFileDetails()`    | `object[]`                           | 获取文件详细信息     |
| `validateFiles()`     | `{valid: boolean, message?: string}` | 验证文件是否符合要求 |
| `clearUnsavedFiles()` | `Promise<void>`                      | 清理未保存的文件     |
| `resetComponent()`    | `void`                               | 重置组件状态         |
| `markFilesAsSaved()`  | `void`                               | 标记文件为已保存     |

---

### 2. BatchFileUpload - 批量文件上传组件

**适用场景**：需要上传多个文件，如文档资料、附件清单、材料汇总等。

#### 基础用法

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

<script setup lang="ts">
import { BatchFileUpload } from '@/components/UploadFile'

const form = reactive({
  fileList: [] as number[]
})

const batchUploadRef = ref()
</script>
```

#### 序列模式高级用法

```vue
<template>
  <el-form :model="productForm" :rules="productRules" ref="productFormRef">
    <el-form-item label="商品名称" prop="productName">
      <el-input v-model="productForm.productName" />
    </el-form-item>

    <el-form-item label="序列编码" prop="sequenceCode">
      <el-input v-model="productForm.sequenceCode" readonly />
    </el-form-item>

    <el-form-item label="商品文件清单" prop="fileList">
      <BatchFileUpload
        ref="batchUploadRef"
        v-model:fileList="productForm.fileList"
        :sequence-code="productForm.sequenceCode"
        mode="create"
        file-type="common"
        directory="products"
        :max-files="10"
        tip="根据序列编码自动生成文件框，按顺序上传"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const productForm = reactive({
  productName: '',
  sequenceCode: 'SPQD1-20250817', // 这个编码对应后端的业务序列配置
  fileList: [] as number[]
})

const productRules = {
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  fileList: [{ required: true, message: '请上传商品文件清单', trigger: 'change' }]
}
</script>
```

#### 特有功能

- **动态文件框**：根据maxFiles自动生成文件框
- **添加更多**：点击"添加更多文件"按钮增加文件框
- **批量操作**：支持"上传全部"和"清空全部"操作
- **智能删除**：删除文件时自动移除对应的文件框

#### Props 扩展

| 参数       | 类型     | 默认值 | 描述                       |
| ---------- | -------- | ------ | -------------------------- |
| `maxFiles` | `number` | `5`    | 最大文件数量限制           |
| 其他属性   | -        | -      | 继承自UploadFile的所有属性 |

---

### 3. StaticFileUpload - 静态文件上传组件

**适用场景**：上传公共资源、静态文件，需要支持匿名访问的文件。

#### 基础用法

```vue
<template>
  <StaticFileUpload
    ref="staticUploadRef"
    v-model:fileList="form.fileList"
    mode="create"
    directory="static/resources"
    :max-files="3"
    tip="上传到static桶，支持匿名访问"
  />
</template>

<script setup lang="ts">
import { StaticFileUpload } from '@/components/UploadFile'

const form = reactive({
  fileList: [] as number[]
})

const staticUploadRef = ref()
</script>
```

#### 特点说明

- **存储位置**：MinIO static 桶
- **访问权限**：支持匿名访问，无需认证
- **API差异**：使用静态文件专用API (`/infra/static-file/`)
- **公共使用**：适合公开资源、下载文件等场景

---

### 4. StaticImgUpload - 静态图片上传组件

**适用场景**：上传头像、产品图片、宣传图等单张图片。

#### 基础用法

```vue
<template>
  <StaticImgUpload
    ref="staticImgRef"
    v-model:fileList="form.avatarList"
    mode="create"
    directory="avatars"
    :file-size="5"
    :file-type="['jpg', 'jpeg', 'png', 'gif', 'webp']"
    tip="支持上传单张图片，大小不超过5MB"
  />
</template>

<script setup lang="ts">
import { StaticImgUpload } from '@/components/UploadFile'

const form = reactive({
  avatarList: [] as number[] // 只包含一个图片ID
})

const staticImgRef = ref()
</script>
```

#### 高级配置

```vue
<template>
  <el-form :model="imageForm" :rules="imageRules" ref="imageFormRef">
    <el-form-item label="图片标题" prop="title">
      <el-input v-model="imageForm.title" />
    </el-form-item>

    <el-form-item label="图片分类" prop="category">
      <el-select v-model="imageForm.category">
        <el-option label="产品图片" value="product" />
        <el-option label="宣传图片" value="promotion" />
        <el-option label="头像图片" value="avatar" />
      </el-select>
    </el-form-item>

    <el-form-item label="图片文件" prop="fileList">
      <StaticImgUpload
        ref="imageUploadRef"
        v-model:fileList="imageForm.fileList"
        mode="create"
        :directory="`images/${imageForm.category}`"
        :file-size="10"
        :file-type="['jpg', 'jpeg', 'png', 'webp']"
        tip="支持jpg、png、webp格式，建议尺寸不超过2000x2000像素"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const imageForm = reactive({
  title: '',
  category: 'product',
  fileList: [] as number[]
})

const imageRules = {
  title: [{ required: true, message: '请输入图片标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择图片分类', trigger: 'change' }],
  fileList: [{ required: true, message: '请上传图片文件', trigger: 'change' }]
}
</script>
```

#### 特色功能

- **单图片模式**：只支持上传一张图片
- **图片预览**：直接显示图片而不是文件图标
- **格式限制**：只允许图片格式文件
- **尺寸建议**：可以配置推荐的图片尺寸
- **质量压缩**：支持前端图片质量压缩（可选）

---

## 🔄 组件模式详解

### create 模式（创建模式）

```vue
<UploadFile mode="create" />
```

- **功能**：显示空的文件框，允许选择和上传文件
- **交互**：支持拖拽和点击选择
- **编辑**：支持实时编辑文件名
- **使用场景**：新建表单、数据录入

### view 模式（查看模式）

```vue
<UploadFile mode="view" />
```

- **功能**：只读模式，显示已上传的文件
- **限制**：不允许添加、删除或编辑
- **交互**：支持预览和下载功能
- **使用场景**：数据查看、详情页面

### edit 模式（编辑模式）

```vue
<UploadFile mode="edit" />
```

- **功能**：显示已有文件，允许添加新文件
- **操作**：支持删除现有文件
- **替换**：支持文件替换（先删除再上传）
- **使用场景**：数据编辑、信息更新

---

## 📝 序列模式深入指南

序列模式是组件库的一个高级功能，通过 `sequenceCode` 参数启用。它需要后端配置对应的业务文件序列表。

### 后端配置示例

```sql
-- 业务文件序列表
CREATE TABLE infra_file_business_sequence (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sequence_code VARCHAR(50) NOT NULL COMMENT '序列编码',
  sequence_business VARCHAR(50) NOT NULL COMMENT '序列业务名',
  sequence_file VARCHAR(50) NOT NULL COMMENT '序列文件名',
  sequence_value TINYINT UNSIGNED NOT NULL COMMENT '序列值',
  status TINYINT NOT NULL DEFAULT 0 COMMENT '状态',
  creator VARCHAR(64) DEFAULT '' COMMENT '创建者',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updater VARCHAR(64) DEFAULT '' COMMENT '更新者',
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted BIT(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  tenant_id BIGINT NOT NULL DEFAULT 0 COMMENT '租户编号'
);

-- 示例数据：商品清单序列
INSERT INTO infra_file_business_sequence
(sequence_code, sequence_business, sequence_file, sequence_value) VALUES
('SPQD1-20250817', '商品清单', '商品清单1', 1),
('SPQD1-20250817', '商品清单', '商品清单2', 2),
('SPQD1-20250817', '商品清单', '商品清单3', 3),
('SPQD1-20250817', '商品清单', '质检报告', 4),
('SPQD1-20250817', '商品清单', '证书文件', 5);
```

### 序列模式工作原理

1. **序列查询**：组件根据 `sequenceCode` 查询后端序列配置
2. **框体生成**：根据序列长度自动生成对应数量的文件框
3. **名称显示**：每个文件框显示对应的 `sequence_file` 名称
4. **顺序上传**：文件按 `sequence_value` 顺序上传和存储
5. **验证机制**：确保所有序列位置都有对应的文件

### 序列模式使用示例

```vue
<template>
  <div class="sequence-upload-demo">
    <h3>商品资料上传 - 序列模式演示</h3>

    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item label="商品名称" prop="productName">
        <el-input v-model="form.productName" />
      </el-form-item>

      <el-form-item label="序列编码" prop="sequenceCode">
        <el-input v-model="form.sequenceCode" readonly />
        <div class="form-tip"> * 序列编码对应后端配置的文件上传要求 </div>
      </el-form-item>

      <el-form-item label="商品文件" prop="fileList">
        <BatchFileUpload
          ref="sequenceUploadRef"
          v-model:fileList="form.fileList"
          :sequence-code="form.sequenceCode"
          mode="create"
          file-type="common"
          directory="products"
          tip="请按序列要求上传对应的文件"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  productName: '',
  sequenceCode: 'SPQD1-20250817',
  fileList: [] as number[]
})

const rules = {
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  fileList: [{ required: true, message: '请上传所有必需的文件', trigger: 'change' }]
}

const handleSubmit = async () => {
  // 验证表单
  const formValid = await formRef.value?.validate()
  if (!formValid) return

  // 验证序列文件
  const fileValidation = sequenceUploadRef.value?.validateFiles()
  if (!fileValidation?.valid) {
    ElMessage.error(fileValidation.message)
    return
  }

  // 提交数据...
  ElMessage.success('商品资料提交成功！')
}
</script>
```

---

## 🎯 最佳实践指南

### 1. 表单集成最佳实践

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
    <!-- 基础信息 -->
    <el-form-item label="标题" prop="title">
      <el-input v-model="form.title" />
    </el-form-item>

    <!-- 文件上传 -->
    <el-form-item label="附件" prop="fileList">
      <UploadFile
        ref="uploadRef"
        v-model:fileList="form.fileList"
        mode="create"
        directory="attachments"
        :file-size="20"
        tip="支持多种格式，单个文件不超过20MB"
      />
    </el-form-item>

    <!-- 提交按钮 -->
    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="submitting"> 提交 </el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const form = reactive({
  title: '',
  fileList: [] as number[]
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  fileList: [{ required: true, message: '请上传附件', trigger: 'change' }]
}

const submitting = ref(false)

const handleSubmit = async () => {
  try {
    submitting.value = true

    // 1. 验证表单
    const formValid = await formRef.value?.validate()
    if (!formValid) {
      ElMessage.error('请填写完整信息')
      return
    }

    // 2. 验证文件
    const fileValidation = uploadRef.value?.validateFiles()
    if (!fileValidation?.valid) {
      ElMessage.error(fileValidation.message)
      return
    }

    // 3. 获取文件信息
    const fileList = uploadRef.value?.getFileList()
    const fileDetails = uploadRef.value?.getFileDetails()

    // 4. 构造提交数据
    const submitData = {
      ...form,
      fileDetails, // 包含文件的详细信息
      submitTime: new Date().toISOString()
    }

    // 5. 调用API提交
    await submitFormApi(submitData)

    // 6. 标记文件为已保存
    uploadRef.value?.markFilesAsSaved()

    ElMessage.success('提交成功！')
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm('确定要重置表单吗？', '确认', {
      type: 'warning'
    })

    // 清理未保存的文件
    await uploadRef.value?.clearUnsavedFiles()

    // 重置表单
    formRef.value?.resetFields()
    form.fileList = []

    // 重置上传组件
    uploadRef.value?.resetComponent()

    ElMessage.success('表单重置成功')
  } catch (error) {
    // 用户取消操作
  }
}

// 页面离开时清理
onBeforeUnmount(() => {
  uploadRef.value?.clearUnsavedFiles()
})
</script>
```

### 2. 错误处理和用户反馈

```vue
<script setup lang="ts">
// 错误处理函数
const handleUploadError = (error: any, fileName: string) => {
  console.error(`文件 ${fileName} 上传失败:`, error)

  // 根据错误类型给出不同提示
  if (error.code === 'FILE_TOO_LARGE') {
    ElMessage.error(`文件 ${fileName} 超过大小限制`)
  } else if (error.code === 'INVALID_FILE_TYPE') {
    ElMessage.error(`文件 ${fileName} 格式不支持`)
  } else if (error.code === 'NETWORK_ERROR') {
    ElMessage.error('网络连接失败，请检查网络后重试')
  } else {
    ElMessage.error(`文件 ${fileName} 上传失败，请重试`)
  }
}

// 上传成功处理
const handleUploadSuccess = (fileInfo: any) => {
  console.log('文件上传成功:', fileInfo)
  ElMessage.success(`文件 ${fileInfo.displayName} 上传成功`)
}

// 进度更新处理
const handleUploadProgress = (progress: any) => {
  console.log('上传进度:', progress)
  // 可以在这里更新全局进度指示器
}
</script>
```

### 3. 权限控制

```vue
<template>
  <div class="permission-controlled-upload">
    <!-- 根据权限显示不同模式 -->
    <UploadFile
      :mode="uploadMode"
      v-model:fileList="form.fileList"
      :disabled="!canUpload"
      directory="sensitive"
    />

    <!-- 权限提示 -->
    <div v-if="!canUpload" class="permission-tip">
      <el-alert
        title="权限不足"
        description="您没有上传文件的权限，请联系管理员"
        type="warning"
        show-icon
        :closable="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

// 权限检查
const canUpload = computed(() => {
  return userStore.permissions.includes('file:upload')
})

const canEdit = computed(() => {
  return userStore.permissions.includes('file:edit')
})

const canView = computed(() => {
  return userStore.permissions.includes('file:view')
})

// 根据权限确定模式
const uploadMode = computed(() => {
  if (canEdit.value) return 'edit'
  if (canView.value) return 'view'
  return 'create'
})
</script>
```

### 4. 性能优化

```vue
<script setup lang="ts">
// 大文件上传优化
const largeFileConfig = {
  fileSize: 100, // 100MB
  chunkSize: 5 * 1024 * 1024, // 5MB 分片
  concurrency: 3, // 并发上传数
  retryCount: 3 // 重试次数
}

// 批量上传优化
const batchUploadConfig = {
  maxFiles: 10,
  maxConcurrency: 2, // 限制并发数
  batchSize: 5 // 分批处理
}

// 内存优化 - 及时清理
const cleanupStrategy = {
  autoCleanup: true, // 自动清理
  cleanupInterval: 30000, // 30秒清理一次
  maxCacheTime: 300000 // 5分钟后强制清理
}
</script>
```

---

## 🔧 API 接口说明

### 普通文件API (`/infra/file/`)

```typescript
// 获取预签名URL
interface GetPresignedUrlRequest {
  fileName: string
  directory?: string
}

interface GetPresignedUrlResponse {
  uploadUrl: string
  accessUrl: string
  fileName: string
}

// 创建文件记录
interface CreateFileRequest {
  fileName: string
  originalFileName: string
  fileSize: number
  fileType: string
  directory: string
}

interface CreateFileResponse {
  id: number
  fileName: string
  originalFileName: string
  accessUrl: string
  fileSize: number
  createTime: string
}
```

### 静态文件API (`/infra/static-file/`)

```typescript
// 静态文件创建
interface CreateStaticFileRequest {
  fileName: string
  originalFileName: string
  fileSize: number
  fileType: string
  directory: string
}

interface CreateStaticFileResponse {
  id: number
  fileName: string
  originalFileName: string
  accessUrl: string // 公开访问URL
  fileSize: number
  createTime: string
}
```

### 序列API (`/infra/file-business-sequence/`)

```typescript
// 获取业务序列配置
interface GetSequenceRequest {
  sequenceCode: string
}

interface SequenceItem {
  sequenceFile: string
  sequenceValue: number
  sequenceBusiness: string
}

interface GetSequenceResponse {
  sequenceCode: string
  sequences: SequenceItem[]
}
```

---

## ⚠️ 注意事项和常见问题

### 文件大小和格式限制

```vue
<script setup lang="ts">
// 推荐的文件大小配置
const fileSizeConfig = {
  image: 5, // 图片 5MB
  document: 10, // 文档 10MB
  video: 100, // 视频 100MB
  archive: 50 // 压缩包 50MB
}

// 推荐的文件格式配置
const fileTypeConfig = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  archive: ['zip', 'rar', '7z'],
  text: ['txt', 'md']
}
</script>
```

### 错误处理策略

```vue
<script setup lang="ts">
// 常见错误类型
const errorHandlers = {
  // 文件过大
  FILE_TOO_LARGE: (fileName: string, maxSize: number) => {
    ElMessage.error(`文件 ${fileName} 超过 ${maxSize}MB 限制`)
  },

  // 格式不支持
  INVALID_FILE_TYPE: (fileName: string, allowedTypes: string[]) => {
    ElMessage.error(`文件 ${fileName} 格式不支持，请上传 ${allowedTypes.join('/')} 格式`)
  },

  // 网络错误
  NETWORK_ERROR: () => {
    ElMessage.error('网络连接失败，请检查网络后重试')
  },

  // 服务器错误
  SERVER_ERROR: () => {
    ElMessage.error('服务器错误，请稍后重试')
  },

  // 权限不足
  PERMISSION_DENIED: () => {
    ElMessage.error('权限不足，请联系管理员')
  }
}
</script>
```

### 内存管理

```vue
<script setup lang="ts">
// 内存管理最佳实践
onBeforeUnmount(() => {
  // 清理所有上传组件的未保存文件
  const uploadRefs = [uploadFileRef, batchUploadRef, staticUploadRef, staticImgRef]

  uploadRefs.forEach((ref) => {
    ref.value?.clearUnsavedFiles()
  })
})

// 定期清理策略
const setupCleanupTimer = () => {
  const cleanupTimer = setInterval(() => {
    // 清理超时的临时文件
    uploadFileRef.value?.cleanupExpiredFiles()
  }, 300000) // 5分钟清理一次

  onBeforeUnmount(() => {
    clearInterval(cleanupTimer)
  })
}
</script>
```

---

## 🚀 版本更新日志

### v2.1.0 (2025-08-17)

- ✨ **新功能**：全新的文件全能框设计
- ✨ **新功能**：实时别名编辑功能
- ✨ **新功能**：智能进度显示（速度、剩余时间）
- ✨ **新功能**：序列模式支持
- 🐛 **修复**：文件上传取消功能
- 🐛 **修复**：内存泄漏问题
- 💄 **UI优化**：全新的视觉设计和交互体验

### v2.0.0 (2025-08-15)

- 🔄 **重构**：完全重写组件架构
- ✨ **新功能**：支持静态文件上传
- ✨ **新功能**：支持图片专用上传
- 🔧 **改进**：更好的类型定义
- 📖 **文档**：全新的使用手册

### v1.x.x

- 基础文件上传功能
- Element Plus 集成

---

## 🤝 贡献指南

如果您在使用过程中遇到问题或有改进建议，请：

1. **提交Issue**：在项目仓库中提交问题报告
2. **功能建议**：提出新功能需求和改进建议
3. **代码贡献**：提交Pull Request参与开发
4. **文档完善**：帮助完善和翻译文档

## 📞 技术支持

- **开发团队**：前端开发组
- **技术文档**：查看组件源码获取更多技术细节
- **问题反馈**：项目Issue区域
- **即时沟通**：开发团队内部沟通渠道

---

**最后更新时间**：2025年8月17日  
**文档版本**：v2.1.0  
**组件版本**：v2.1.0
