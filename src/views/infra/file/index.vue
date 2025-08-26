<template>
  <doc-alert title="上传下载" url="https://doc.iocoder.cn/file/" />
  <!-- 搜索 -->
  <ContentWrap>
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
      <el-form-item label="文件路径" prop="path">
        <el-input v-model="queryParams.path" placeholder="请输入文件路径" clearable @keyup.enter="handleQuery"
          class="!w-240px" />
      </el-form-item>
      <el-form-item label="文件类型" prop="type" width="80">
        <el-input v-model="queryParams.type" placeholder="请输入文件类型" clearable @keyup.enter="handleQuery"
          class="!w-240px" />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" value-format="YYYY-MM-DD HH:mm:ss" type="daterange"
          start-placeholder="开始日期" end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]" class="!w-240px" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" /> 重置
        </el-button>
        <el-button type="primary" plain @click="openForm">
          <Icon icon="ep:upload" class="mr-5px" /> 上传文件
        </el-button>
        <el-button @click="testDown">
          <Icon icon="ep:refresh" class="mr-5px" /> 测试
        </el-button>
        <el-button type="success" @click="testSingleUpload">
          <Icon icon="ep:upload" class="mr-5px" /> 测试单个上传
        </el-button>
        <el-button type="warning" @click="testBatchUpload">
          <Icon icon="ep:upload-filled" class="mr-5px" /> 测试批量上传
        </el-button>
        <el-button type="info" @click="testStaticUpload">
          <Icon icon="ep:document" class="mr-5px" /> 测试静态文件上传
        </el-button>
        <el-button type="success" @click="testStaticImgUpload">
          <Icon icon="ep:picture-filled" class="mr-5px" /> 测试静态图片上传
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="文件名" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="文件路径" align="center" prop="path" :show-overflow-tooltip="true" />
      <el-table-column label="URL" align="center" prop="url" :show-overflow-tooltip="true" />
      <el-table-column label="虚拟目录" align="center" prop="dir" width="120" :show-overflow-tooltip="true" />
      <el-table-column label="文件大小" align="center" prop="size" width="120" :formatter="safeFileSizeFormatter" />
      <el-table-column label="文件类型" align="center" prop="type" width="180px" />
      <el-table-column label="文件内容" align="center" prop="url" width="110px">
        <template #default="{ row }">
          <el-image v-if="row.type && row.type.includes('image') && row.configId === 0" class="h-80px w-80px" lazy
            :src="row.url" :preview-src-list="[row.url]" preview-teleported fit="cover" />
          <el-link v-else type="primary" @click="previewFile(row)" :underline="false">
            预览
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="上传时间" align="center" prop="createTime" width="180" :formatter="safeDateFormatter" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="downloadFile(scope.row)">下载</el-button>
          <el-button link type="success" @click="copyToClipboard(scope.row.url)">
            复制链接
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['infra:file:delete']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination :total="total" v-model:page="queryParams.pageNo" v-model:limit="queryParams.pageSize"
      @pagination="getList" />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <FileForm ref="formRef" @success="getList" />

  <!-- 单个文件上传测试弹窗 -->
  <el-dialog v-model="singleUploadVisible" title="测试单个文件上传" width="600px">
    <UploadFile v-model="singleUploadFileUrl" :drag="true" :show-custom-file-name="true" directory="test"
      @upload-success="handleSingleUploadSuccess" @upload-error="handleUploadError" />

    <template #footer>
      <el-button @click="singleUploadVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 批量文件上传测试弹窗 -->
  <el-dialog v-model="batchUploadVisible" title="测试批量文件上传" width="800px">
    <BatchFileUpload :max-files="5" :concurrent="2" :drag="true" directory="test-batch"
      @upload-success="handleBatchUploadSuccess" @upload-complete="handleUploadComplete"
      @upload-error="handleUploadError" />

    <div v-if="batchUploadResult" class="upload-result">
      <h4>批量上传结果：</h4>
      <div class="batch-result-details">
        <el-table :data="Object.values(batchUploadResult)" border style="width: 100%">
          <el-table-column prop="data.name" label="文件名" width="200" show-overflow-tooltip />
          <el-table-column prop="data.type" label="类型" width="120" />
          <el-table-column label="大小" width="100">
            <template #default="{ row }">{{ formatFileSize(row.data?.size) }}</template>
          </el-table-column>
          <el-table-column label="上传时间" width="160">
            <template #default="{ row }">{{ formatTime(row.data?.createTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="previewUploadedFile(row.data)">预览</el-button>
              <el-button type="danger" size="small" @click="deleteUploadedFile(row.data?.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-collapse style="margin-top: 12px;">
        <el-collapse-item title="查看完整响应数据" name="1">
          <pre>{{ JSON.stringify(batchUploadResult, null, 2) }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div v-if="uploadSummary" class="upload-summary">
      <h4>上传统计：</h4>
      <p>成功：{{ uploadSummary.success }} / 总数：{{ uploadSummary.total }}</p>
    </div>

    <template #footer>
      <el-button @click="batchUploadVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 静态文件上传测试弹窗 -->
  <el-dialog v-model="staticUploadVisible" title="测试静态文件上传（static桶）" width="800px">
    <el-row :gutter="20">
      <el-col :span="24">
        <h4>静态文件上传</h4>
        <StaticFileUpload :drag="true" :show-custom-file-name="true" @upload-success="handleStaticUploadSuccess"
          @upload-error="handleUploadError" />

        <div v-if="staticUploadResult" class="upload-result">
          <h4>静态文件上传结果：</h4>
          <div class="result-details">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="文件ID">{{ staticUploadResult?.id }}</el-descriptions-item>
              <el-descriptions-item label="配置ID">{{ staticUploadResult?.configId }}</el-descriptions-item>
              <el-descriptions-item label="文件名">{{ staticUploadResult?.name }}</el-descriptions-item>
              <el-descriptions-item label="文件类型">{{ staticUploadResult?.type }}</el-descriptions-item>
              <el-descriptions-item label="文件大小">{{ formatFileSize(staticUploadResult?.size) }}</el-descriptions-item>
              <el-descriptions-item label="上传时间">{{ formatTime(staticUploadResult?.createTime) }}</el-descriptions-item>
              <el-descriptions-item label="文件路径" :span="2">{{ staticUploadResult?.path }}</el-descriptions-item>
              <el-descriptions-item label="访问URL" :span="2">
                <el-link type="primary" :href="staticUploadResult?.url" target="_blank">{{ staticUploadResult?.url
                }}</el-link>
              </el-descriptions-item>
            </el-descriptions>
            <div class="file-actions" style="margin-top: 12px;">
              <el-button type="primary" size="small" @click="previewUploadedFile(staticUploadResult)">
                <Icon icon="ep:view" class="mr-5px" /> 预览
              </el-button>
              <el-button type="danger" size="small" @click="deleteUploadedFile(staticUploadResult?.id)">
                <Icon icon="ep:delete" class="mr-5px" /> 删除
              </el-button>
            </div>
          </div>
          <el-collapse style="margin-top: 12px;">
            <el-collapse-item title="查看完整响应数据" name="1">
              <pre>{{ JSON.stringify(staticUploadResult, null, 2) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-col>
    </el-row>




    <el-alert title="说明" type="info" :closable="false" style="margin-top: 20px;">
      <p>• <strong>上传位置</strong>：文件会上传到 MinIO 的 <code>static</code> 桶</p>
      <p>• <strong>访问权限</strong>：static 桶支持匿名访问，无需认证</p>
      <p>• <strong>适用场景</strong>：头像、公共图片、静态资源等</p>
      <p>• <strong>对比</strong>：普通上传使用 <code>oafile</code> 桶，需要认证访问</p>
      <p>• <strong>上传方式</strong>：使用预签名URL直接上传到MinIO</p>
    </el-alert>

    <template #footer>
      <el-button @click="staticUploadVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 静态图片上传测试弹窗 -->
  <el-dialog v-model="staticImgUploadVisible" title="测试静态图片上传（static桶）" width="600px">
    <StaticImgUpload :drag="true" :file-size="5" :show-custom-file-name="true"
      @upload-success="handleStaticImgUploadSuccess" @upload-error="handleUploadError" />

    <div v-if="staticImgUploadResult" class="upload-result">
      <h4>静态图片上传结果：</h4>
      <div class="result-details">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件ID">{{ staticImgUploadResult?.id }}</el-descriptions-item>
          <el-descriptions-item label="配置ID">{{ staticImgUploadResult?.configId }}</el-descriptions-item>
          <el-descriptions-item label="文件名">{{ staticImgUploadResult?.name }}</el-descriptions-item>
          <el-descriptions-item label="文件类型">{{ staticImgUploadResult?.type }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ formatFileSize(staticImgUploadResult?.size) }}</el-descriptions-item>
          <el-descriptions-item label="上传时间">{{ formatTime(staticImgUploadResult?.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="文件路径" :span="2">{{ staticImgUploadResult?.path }}</el-descriptions-item>
          <el-descriptions-item label="访问URL" :span="2">
            <el-link type="primary" :href="staticImgUploadResult?.url" target="_blank">{{ staticImgUploadResult?.url
            }}</el-link>
          </el-descriptions-item>
        </el-descriptions>
        <div class="file-actions" style="margin-top: 12px;">
          <el-button type="primary" size="small" @click="previewUploadedFile(staticImgUploadResult)">
            <Icon icon="ep:view" class="mr-5px" /> 预览
          </el-button>
          <el-button type="danger" size="small" @click="deleteUploadedFile(staticImgUploadResult?.id)">
            <Icon icon="ep:delete" class="mr-5px" /> 删除
          </el-button>
        </div>
        <div v-if="staticImgUploadResult?.url" class="image-preview" style="margin-top: 12px;">
          <h5>图片预览：</h5>
          <img :src="staticImgUploadResult?.url" alt="上传的图片"
            style="max-width: 300px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;" />
        </div>
      </div>
      <el-collapse style="margin-top: 12px;">
        <el-collapse-item title="查看完整响应数据" name="1">
          <pre>{{ JSON.stringify(staticImgUploadResult, null, 2) }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>

    <el-alert title="说明" type="info" :closable="false" style="margin-top: 20px;">
      <p>• <strong>仅限图片</strong>：只能上传 jpg、png、gif、webp 等图片格式</p>
      <p>• <strong>上传位置</strong>：文件会上传到 MinIO 的 <code>static</code> 桶</p>
      <p>• <strong>访问权限</strong>：static 桶支持匿名访问，无需认证</p>
      <p>• <strong>适用场景</strong>：头像、公共图片等静态图片资源</p>
    </el-alert>

    <template #footer>
      <el-button @click="staticImgUploadVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { fileSizeFormatter, base64Encode } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import * as FileApi from '@/api/infra/file'
import * as StaticFileApi from '@/api/infra/file/staticFile'
import FileForm from './FileForm.vue'
import { UploadFile, BatchFileUpload, StaticFileUpload, StaticImgUpload } from '@/components/UploadFile'
import { useUserStore } from '@/store/modules/user'
import { openPreviewWindow } from '@/utils/previewWindow'

defineOptions({ name: 'InfraFile' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const userStore = useUserStore()

// 导入域名配置工具
import { getDomainUrl } from '@/utils/domainConfig'

// 获取配置的域名
const FIXED_DOMAIN = getDomainUrl()

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  type: undefined,
  path: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单

// 测试上传相关
const singleUploadVisible = ref(false)
const batchUploadVisible = ref(false)
const singleUploadResult = ref(null)
const batchUploadResult = ref(null)
const uploadSummary = ref(null)
const singleUploadFileUrl = ref('')

// 静态文件上传相关
const staticUploadVisible = ref(false)
const staticUploadResult = ref(null)
const staticImgUploadVisible = ref(false)
const staticImgUploadResult = ref(null)

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const response = await FileApi.getFilePage(queryParams)

    // 检查响应数据结构
    const data = response.data || response

    list.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const testDown = () => {
  FileApi.getDownloadUrl(2).then((res) => {
    console.log(res)
  })
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = () => {
  formRef.value.open()
}

/** 复制到剪贴板方法 */
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success('复制成功')
  })
}

// 获取静态图片URL
// const getStaticImageUrl = (path: string) => {
//   if (!path) return ''
//   // 拼接minio静态桶地址
//   return `${FIXED_DOMAIN}/minio/static/${path}`
// }

// 预览文件
const previewFile = async (file) => {
  try {
    console.log('预览文件:', file)
    // 添加用户昵称参数
    const nickname = userStore.getUser?.nickname || ''

    // 判断是否为静态文件
    if (file.configId === 0) {
      // 静态文件预览
      const staticFileUrl = `${file.url}?nickname=${nickname}`

      if (file.type && file.type.includes('image')) {
        // 静态图片文件直接预览
        openPreviewWindow(staticFileUrl, file.name || '未知文件')
      } else {
        // 静态非图片文件通过预览服务
        const encodedUrl = encodeURIComponent(base64Encode(staticFileUrl))
        const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`
        openPreviewWindow(previewUrl, file.name || '未知文件')
      }
    } else {
      // 普通文件预览 - 不能修改签名URL的查询参数，否则会破坏签名
      const signedUrl = await FileApi.getDownloadUrl(file.id)
      // 构建文件访问URL，保持签名完整性
      const fileUrl = signedUrl + `&nickname=${nickname}`

      // 构建预览URL
      const encodedUrl = encodeURIComponent(base64Encode(fileUrl))
      const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`

      // 使用预览工具类打开窗口
      openPreviewWindow(previewUrl, file.name || '未知文件')
    }
  } catch (error) {
    console.error('预览文件失败:', error)
    message.error('预览文件失败')
  }
}

// 下载文件
const downloadFile = async (file) => {
  try {
    console.log('下载文件:', file)

    // 判断是否为静态文件
    if (file.configId === 0) {
      // 静态文件下载：
      const staticDownloadUrl = `${file.url}`
      window.open(staticDownloadUrl, '_blank')
    } else {
      // 普通文件下载：获取签名地址并替换域名，保持签名完整性
      const signedUrl = await FileApi.getDownloadUrl(file.id)
      const downloadUrl = `${signedUrl}`
      window.open(downloadUrl, '_blank')
    }
  } catch (error) {
    console.error('获取下载地址失败:', error)
    message.error('获取下载地址失败')
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()

    // 查找要删除的文件信息
    const fileToDelete = list.value.find(file => file.id === id)

    // 判断是否为静态文件（通过configId是否为0来判断）
    const isStaticFile = fileToDelete.configId === 0

    if (isStaticFile) {
      // 删除静态文件
      await StaticFileApi.deleteStaticFile(id)
      message.success('静态文件删除成功')
    } else {
      // 删除普通文件
      await FileApi.deleteFile(id)
      message.success(t('common.delSuccess'))
    }

    // 刷新列表
    await getList()
  } catch { }
}

// 测试单个文件上传
const testSingleUpload = () => {
  singleUploadResult.value = null
  singleUploadVisible.value = true
}

// 测试批量文件上传
const testBatchUpload = () => {
  batchUploadResult.value = null
  uploadSummary.value = null
  batchUploadVisible.value = true
}

// 测试静态文件上传
const testStaticUpload = () => {
  staticUploadResult.value = null
  staticUploadVisible.value = true
}

// 测试静态图片上传
const testStaticImgUpload = () => {
  staticImgUploadResult.value = null
  staticImgUploadVisible.value = true
}

// 静态文件上传成功处理
const handleStaticUploadSuccess = (result, file) => {
  console.log('静态文件上传成功:', result, file)

  // result的格式是 { [fileName]: responseData }，需要提取实际的数据
  const fileName = Object.keys(result)[0]
  const fileData = result[fileName]

  // 检查fileData的结构，如果有data属性则使用data，否则直接使用fileData
  staticUploadResult.value = fileData.data || fileData
  message.success('静态文件上传成功！')
}

// 静态图片上传成功处理
const handleStaticImgUploadSuccess = (result, file) => {
  console.log('静态图片上传成功:', result, file)

  // result的格式是 { [fileName]: responseData }，需要提取实际的数据
  const fileName = Object.keys(result)[0]
  const fileData = result[fileName]

  // 检查fileData的结构，如果有data属性则使用data，否则直接使用fileData
  staticImgUploadResult.value = fileData.data || fileData
  message.success('静态图片上传成功！')
}

// 单个文件上传成功处理
const handleSingleUploadSuccess = (result, file) => {
  console.log('单个文件上传成功:', result, file)

  // result的格式是 { [fileName]: responseData }，需要提取实际的数据
  const fileName = Object.keys(result)[0]
  const fileData = result[fileName]

  // 检查fileData的结构，如果有data属性则使用data，否则直接使用fileData
  singleUploadResult.value = fileData.data || fileData
  message.success('文件上传成功！')
}

// 批量文件上传成功处理
const handleBatchUploadSuccess = (results) => {
  console.log('批量文件上传成功:', results)
  batchUploadResult.value = results
  message.success(`成功上传 ${Object.keys(results).length} 个文件！`)
}

// 上传完成统计
const handleUploadComplete = (summary) => {
  console.log('上传完成统计:', summary)
  uploadSummary.value = summary

  if (summary.success === summary.total) {
    message.success(`全部 ${summary.total} 个文件上传成功！`)
  } else {
    message.warning(`${summary.success}/${summary.total} 个文件上传成功`)
  }
}

// 上传错误处理
const handleUploadError = (error, file) => {
  console.error('上传失败:', error, file)
  message.error('文件上传失败，请重试')
}

// 安全的文件大小格式化函数
const safeFileSizeFormatter = (row, column, cellValue) => {
  try {
    if (cellValue === null || cellValue === undefined || cellValue === '') {
      return '-'
    }
    return fileSizeFormatter(row, column, cellValue)
  } catch (error) {
    console.error('文件大小格式化错误:', error, cellValue)
    return '-'
  }
}

// 安全的日期格式化函数
const safeDateFormatter = (row, column, cellValue) => {
  try {
    if (cellValue === null || cellValue === undefined || cellValue === '') {
      return '-'
    }
    return dateFormatter(row, column, cellValue)
  } catch (error) {
    console.error('日期格式化错误:', error, cellValue)
    return '-'
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
  // 跳转文件预览页面   todo  加上nickname  &nickname=anan
  // window.open(`${FIXED_DOMAIN}/preview/onlinePreview?url=`+encodeURIComponent(base64Encode('http://172.25.169.236:9000/oafile/20250731/1%E6%88%91%E7%94%A8%E5%8F%8C%E6%89%8B%E6%88%90%E5%B0%B1%E4%BD%A0%E7%9A%84%E6%A2%A6%E6%83%B3_1753930379819.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250731T025448Z&X-Amz-SignedHeaders=host&X-Amz-Credential=minioadmin%2F20250731%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Expires=7200&X-Amz-Signature=4f8faa5222a523345ee1cc81de4c185a8db8f132e645412f3870738fa5498825')))
  // window.open('http://127.0.0.1:8012//onlinePreview?url='+encodeURIComponent(base64Encode('http://172.25.169.236:9000/oafile/20250731/1%E6%88%91%E7%94%A8%E5%8F%8C%E6%89%8B%E6%88%90%E5%B0%B1%E4%BD%A0%E7%9A%84%E6%A2%A6%E6%83%B3_1753930379819.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250731T025448Z&X-Amz-SignedHeaders=host&X-Amz-Credential=minioadmin%2F20250731%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Expires=7200&X-Amz-Signature=4f8faa5222a523345ee1cc81de4c185a8db8f132e645412f3870738fa5498825&nickname=anan')))
})

// ========== 工具函数 ==========

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
const formatTime = (timestamp: number): string => {
  if (!timestamp) return '-'
  return dateFormatter({}, {}, timestamp)
}

// 预览已上传的文件
const previewUploadedFile = async (fileData: any) => {
  if (!fileData) return

  try {
    // 判断是否为静态文件（configId为0）
    const isStaticFile = fileData.configId === 0

    if (isStaticFile) {
      // 静态文件直接使用URL预览
      const staticUrl = getStaticImageUrl(fileData.path)
      const fileName = fileData.name || fileData.path || '未知文件'

      // 使用预览工具类打开窗口
      openPreviewWindow(staticUrl, fileName)
    } else {
      // 普通文件需要获取预览URL
      const response = await FileApi.getDownloadUrl(fileData.id)
      const previewUrl = response.data || response

      // 构建预览链接
      const encodedUrl = base64Encode(previewUrl + '&nickname=' + userStore.getUser.nickname)
      const previewLink = `http://127.0.0.1:8012/onlinePreview?url=${encodeURIComponent(encodedUrl)}`

      // 使用预览工具类打开窗口
      openPreviewWindow(previewLink, fileData.name || '未知文件')
    }
  } catch (error) {
    console.error('预览文件失败:', error)
    message.error('预览文件失败')
  }
}

// 删除已上传的文件
const deleteUploadedFile = async (fileId: number) => {
  if (!fileId) return

  try {
    await message.delConfirm('确定要删除这个文件吗？')

    // 调用删除接口
    await FileApi.deleteFile(fileId)

    message.success('文件删除成功')

    // 清空对应的上传结果
    if (singleUploadResult.value?.id === fileId) {
      singleUploadResult.value = null
    }
    if (staticUploadResult.value?.id === fileId) {
      staticUploadResult.value = null
    }
    if (staticImgUploadResult.value?.id === fileId) {
      staticImgUploadResult.value = null
    }

    // 清空批量上传结果中的对应文件
    if (batchUploadResult.value) {
      Object.keys(batchUploadResult.value).forEach(key => {
        if (batchUploadResult.value[key]?.data?.id === fileId) {
          delete batchUploadResult.value[key]
        }
      })
    }

    // 刷新文件列表
    getList()
  } catch (error) {
    console.error('删除文件失败:', error)
    message.error('删除文件失败')
  }
}
</script>

<style scoped lang="scss">
.upload-result {
  margin-top: 16px;

  h4 {
    color: #303133;
    margin-bottom: 8px;
  }

  pre {
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    font-size: 12px;
    overflow-x: auto;
    max-height: 200px;
  }
}

.upload-summary {
  margin-top: 16px;

  h4 {
    color: #303133;
    margin-bottom: 8px;
  }

  p {
    color: #606266;
    font-size: 14px;
  }
}
</style>
