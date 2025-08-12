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
          <Icon icon="ep:picture" class="mr-5px" /> 测试静态文件上传
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
      <el-table-column label="文件大小" align="center" prop="size" width="120" :formatter="safeFileSizeFormatter" />
      <el-table-column label="文件类型" align="center" prop="type" width="180px" />
      <el-table-column label="文件内容" align="center" prop="url" width="110px">
        <template #default="{ row }">
          <el-image v-if="row.type && row.type.includes('image') && row.configId === 0" class="h-80px w-80px" lazy
            :src="getStaticImageUrl(row.path)" :preview-src-list="[getStaticImageUrl(row.path)]" preview-teleported
            fit="cover" />
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
    <SingleFileUpload :drag="true" accept=".jpg,.png,.pdf,.doc,.docx" tip="支持 jpg、png、pdf、doc、docx 格式"
      @upload-success="handleSingleUploadSuccess" @upload-error="handleUploadError" />

    <div v-if="singleUploadResult" class="upload-result">
      <h4>上传结果：</h4>
      <pre>{{ JSON.stringify(singleUploadResult, null, 2) }}</pre>
    </div>

    <template #footer>
      <el-button @click="singleUploadVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 批量文件上传测试弹窗 -->
  <el-dialog v-model="batchUploadVisible" title="测试批量文件上传" width="800px">
    <BatchFileUpload :max-files="5" :concurrent="2" :drag="true" accept=".jpg,.png,.pdf" tip="最多可选择5个文件，支持jpg、png、pdf格式"
      @upload-success="handleBatchUploadSuccess" @upload-complete="handleUploadComplete"
      @upload-error="handleUploadError" />

    <div v-if="batchUploadResult" class="upload-result">
      <h4>批量上传结果：</h4>
      <pre>{{ JSON.stringify(batchUploadResult, null, 2) }}</pre>
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
        <StaticFileUpload :drag="true" accept=".jpg,.png,.pdf,.doc,.docx,.txt,.zip" tip="支持图片、文档等格式，上传到static桶（匿名访问）"
          @upload-success="handleStaticUploadSuccess" @upload-error="handleUploadError" />

        <div v-if="staticUploadResult" class="upload-result">
          <h4>上传结果：</h4>
          <pre>{{ JSON.stringify(staticUploadResult, null, 2) }}</pre>
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
</template>
<script lang="ts" setup>
import { fileSizeFormatter, base64Encode } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import * as FileApi from '@/api/infra/file'
import * as StaticFileApi from '@/api/infra/file/staticFile'
import FileForm from './FileForm.vue'
import { SingleFileUpload, BatchFileUpload, StaticFileUpload } from '@/components/FileUpload'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'InfraFile' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const userStore = useUserStore()

// 固定域名配置
const FIXED_DOMAIN = 'http://182.109.52.126:49090'
// const currentDomain = `${window.location.protocol}//${window.location.host}`

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

// 静态文件上传相关
const staticUploadVisible = ref(false)
const staticUploadResult = ref(null)

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
const getStaticImageUrl = (path: string) => {
  if (!path) return ''
  // 拼接minio静态桶地址
  return `${FIXED_DOMAIN}/minio/static/${path}`
}

// 预览文件
const previewFile = async (file) => {
  try {
    console.log('预览文件:', file)

    // 判断是否为静态文件
    if (file.configId === 0) {
      // 静态文件预览
      if (file.type && file.type.includes('image')) {
        // 静态图片文件：使用现有的getStaticImageUrl方法（在模板中已处理）
        // 这里不需要额外处理，因为图片预览在模板中已经通过getStaticImageUrl处理了
        return
      } else {
        // 静态非图片文件：拼接预览地址
        const staticFileUrl = `${FIXED_DOMAIN}/minio/static/${file.path}`
        const encodedUrl = encodeURIComponent(base64Encode(staticFileUrl))
        const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`
        window.open(previewUrl, '_blank')
      }
    } else {
      // 普通文件预览
      const signedUrl = await FileApi.getDownloadUrl(file.id)

      // 解析原始URL并替换域名
      const urlObj = new URL(signedUrl)
      const pathAndQuery = urlObj.pathname + urlObj.search

      // 构建文件访问URL
      let fileUrl = `${FIXED_DOMAIN}/minio${pathAndQuery}`

      // 添加用户昵称参数
      const nickname = userStore.getUser?.nickname || ''
      if (nickname) {
        const separator = fileUrl.includes('?') ? '&' : '?'
        fileUrl += `${separator}nickName=${encodeURIComponent(nickname)}`
      }

      // 构建预览URL
      const encodedUrl = encodeURIComponent(base64Encode(fileUrl))
      const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`
      window.open(previewUrl, '_blank')
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
      // 静态文件下载：直接拼接静态文件下载地址
      const staticDownloadUrl = `${FIXED_DOMAIN}/minio/static/${file.path}`
      window.open(staticDownloadUrl, '_blank')
    } else {
      // 普通文件下载：获取签名地址并替换域名
      const signedUrl = await FileApi.getDownloadUrl(file.id)

      // 解析原始URL并替换域名
      const urlObj = new URL(signedUrl)
      const pathAndQuery = urlObj.pathname + urlObj.search

      // 构建新的下载URL：当前域名 + /minio/ + 原路径和查询参数
      const downloadUrl = `${FIXED_DOMAIN}/minio${pathAndQuery}`
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

// 静态文件上传成功处理
const handleStaticUploadSuccess = (result, file) => {
  console.log('静态文件上传成功:', result, file)
  staticUploadResult.value = result
  message.success('静态文件上传成功！')
}

// 单个文件上传成功处理
const handleSingleUploadSuccess = (result, file) => {
  console.log('单个文件上传成功:', result, file)
  singleUploadResult.value = result
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
  // window.open('http://182.109.52.126:49090/preview/onlinePreview?url='+encodeURIComponent(base64Encode('http://172.25.169.236:9000/oafile/20250731/1%E6%88%91%E7%94%A8%E5%8F%8C%E6%89%8B%E6%88%90%E5%B0%B1%E4%BD%A0%E7%9A%84%E6%A2%A6%E6%83%B3_1753930379819.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250731T025448Z&X-Amz-SignedHeaders=host&X-Amz-Credential=minioadmin%2F20250731%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Expires=7200&X-Amz-Signature=4f8faa5222a523345ee1cc81de4c185a8db8f132e645412f3870738fa5498825')))
  // window.open('http://127.0.0.1:8012//onlinePreview?url='+encodeURIComponent(base64Encode('http://172.25.169.236:9000/oafile/20250731/1%E6%88%91%E7%94%A8%E5%8F%8C%E6%89%8B%E6%88%90%E5%B0%B1%E4%BD%A0%E7%9A%84%E6%A2%A6%E6%83%B3_1753930379819.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250731T025448Z&X-Amz-SignedHeaders=host&X-Amz-Credential=minioadmin%2F20250731%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Expires=7200&X-Amz-Signature=4f8faa5222a523345ee1cc81de4c185a8db8f132e645412f3870738fa5498825&nickname=anan')))
})
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
