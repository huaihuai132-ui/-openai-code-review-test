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
          <el-image v-if="row.type && row.type.includes('image')" class="h-80px w-80px" lazy :src="row.url"
            :preview-src-list="[row.url]" preview-teleported fit="cover" />
          <el-link v-else-if="row.type && row.type.includes('pdf')" type="primary" :href="row.url" :underline="false"
            target="_blank">
            预览
          </el-link>
          <el-link v-else type="primary" download :href="row.url" :underline="false" target="_blank">下载</el-link>
        </template>
      </el-table-column>
      <el-table-column label="上传时间" align="center" prop="createTime" width="180" :formatter="safeDateFormatter" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="copyToClipboard(scope.row.url)">
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
</template>
<script lang="ts" setup>
import { fileSizeFormatter, base64Encode } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import * as FileApi from '@/api/infra/file'
import FileForm from './FileForm.vue'
import { SingleFileUpload, BatchFileUpload } from '@/components/FileUpload'

defineOptions({ name: 'InfraFile' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

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
  FileApi.getFileContent(2).then((res) => {
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

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await FileApi.deleteFile(id)
    message.success(t('common.delSuccess'))
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
