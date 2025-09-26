<template>
  <ContentWrap>
    <el-descriptions :column="2" border>
      <el-descriptions-item label="编号">
        {{ detailData.id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="申请人">
        {{ getUserName(detailData.userId) || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="申请部门">
        {{ getDeptName(detailData.applyDept) || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="申请时间">
        {{ detailData.applicationTime ? formatDate(new Date(detailData.applicationTime)) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="采购单位">
        {{ getCompanyName(detailData.companyId) || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="供应商">
        {{ getSupplierName(detailData.supplierId) || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="供应商账户">
        {{ getSupplierAccountName(detailData.supplierAccountId) || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="账号">
        {{ getSupplierAccountNum(detailData.supplierAccountId) || detailData.accountNum || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="开户行">
        {{ getSupplierAccountBankLocation(detailData.supplierAccountId) || detailData.accountBanklocation || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="资金来源">
        {{ detailData.fundSource || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="产品名称">
        {{ getMaterialName(detailData.metalId) || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="数量">
        {{ detailData.metalWeight || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="单价">
        <span v-if="detailData.metalPrice">{{ formatAmount(detailData.metalPrice) }}</span>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="总价">
        <span v-if="detailData.repaymentAmount">{{ formatAmount(detailData.repaymentAmount) }}</span>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        <div class="whitespace-pre-wrap">
          {{ detailData.remark || '-' }}
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="单据状态">
        <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="detailData.status || 0" />
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ detailData.createTime ? formatDate(new Date(detailData.createTime)) : '-' }}
      </el-descriptions-item>

      <!-- 附件列表 -->
      <el-descriptions-item label="附件" :span="2">
        <div v-if="fileList.length > 0" class="flex flex-col gap-2">
          <div
            v-for="file in fileList"
            :key="file.id"
            class="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
            @click="previewFile(file)"
          >
            <div class="flex items-center justify-center w-8 h-8 rounded bg-blue-100 text-blue-500">
              {{ getFileTypeIcon(file.name) }}
            </div>
            <span class="text-sm text-gray-700 truncate flex-1">{{ file.name }}</span>
            <el-icon class="text-gray-400"><View /></el-icon>
          </div>
        </div>
        <span v-else>-</span>
      </el-descriptions-item>
    </el-descriptions>
  </ContentWrap>
</template>

<script lang="ts" setup>
import {formatDate} from '@/utils/formatTime'
import {DICT_TYPE} from '@/utils/dict'
import {propTypes} from '@/utils/propTypes'
import {SupplychainRepaymentApi} from '@/api/business/supplychainrepayment'
import {useRoute} from 'vue-router'
import {onMounted, ref} from 'vue'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import {FinanceCompanyApi} from '@/api/business/finance/financecompany'
import {SupplychainSupplierApi} from '@/api/business/supplychainsupplier'
import {SupplychainMaterialsApi} from '@/api/business/supplychainmaterials'
import * as FileApi from '@/api/infra/file'
import {base64Encode} from '@/utils'
import {useUserStore} from '@/store/modules/user'
import {openPreviewWindow} from '@/utils/previewWindow'
import {View} from '@element-plus/icons-vue'
import {getDomainUrl} from '@/utils/domainConfig'
import {useMessage} from '@/hooks/web/useMessage'

defineOptions({ name: 'SupplychainRepaymentDetail' })

const { query } = useRoute() // 查询参数
const userStore = useUserStore() // 用户信息
const message = useMessage() // 消息提示

// 获取配置的域名
const FIXED_DOMAIN = getDomainUrl()

const props = defineProps({
  id: propTypes.number.def(undefined),
  previewMode: propTypes.bool.def(false), // 是否为预览模式
  readonly: propTypes.bool.def(false), // 是否为只读模式
  modelInfo: propTypes.object.def({}) // 模型信息
})

const detailLoading = ref(false) // 表单的加载中
const detailData = ref<any>({}) // 详情数据
const queryId = query.id as unknown as number // 从 URL 传递过来的 id 编号
const fileList = ref<Array<{ id: number; name: string; url: string }>>([]) // 附件列表

// 用户列表
const userList = ref<UserApi.UserVO[]>([])

// 部门列表
const deptList = ref<DeptApi.DeptVO[]>([])

// 企业列表
const companyList = ref<any[]>([])

// 供应商列表
const supplierList = ref<any[]>([])

// 供应商账户列表
const supplierAccountList = ref<any[]>([])

// 材料列表
const materialsList = ref<any[]>([])

/** 获取用户列表 */
const getUserList = async () => {
  try {
    const data = await UserApi.getSimpleUserList()
    userList.value = data
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

/** 获取部门列表 */
const getDeptList = async () => {
  try {
    const data = await DeptApi.getSimpleDeptList()
    deptList.value = data
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

/** 获取企业列表 */
const getCompanyList = async () => {
  try {
    const data = await FinanceCompanyApi.getSimpleFinanceCompanyList()
    companyList.value = data
  } catch (error) {
    console.error('获取企业列表失败:', error)
  }
}

/** 获取供应商列表 */
const getSupplierList = async () => {
  try {
    const data = await SupplychainSupplierApi.getSimpleSupplychainSupplierList()
    supplierList.value = data
  } catch (error) {
    console.error('获取供应商列表失败:', error)
  }
}

/** 获取供应商账户列表 */
const getSupplierAccountList = async (supplierId?: number) => {
  try {
    if (supplierId) {
      // 根据供应商ID获取特定供应商的账户列表
      const data = await SupplychainSupplierApi.getSupplychainSupplierAccountListBySupplierId(supplierId.toString())
      supplierAccountList.value = data
    } else {
      // 不需要获取所有账户列表，因为我们需要的是特定供应商的账户
      supplierAccountList.value = []
    }
  } catch (error) {
    console.error('获取供应商账户列表失败:', error)
  }
}

/** 获取材料列表 */
const getMaterialsList = async () => {
  try {
    const data = await SupplychainMaterialsApi.getSimpleList()
    materialsList.value = data
  } catch (error) {
    console.error('获取材料列表失败:', error)
  }
}

/** 根据用户ID获取用户昵称 */
const getUserName = (userId: number | undefined) => {
  if (!userId) return ''
  const user = userList.value.find(u => u.id === userId)
  return user ? user.nickname : ''
}

/** 根据部门ID获取部门名称 */
const getDeptName = (deptId: number | undefined) => {
  if (!deptId) return ''
  const dept = deptList.value.find(d => d.id === deptId)
  return dept ? dept.name : ''
}

/** 获取企业名称 */
const getCompanyName = (companyId: number | undefined) => {
  if (!companyId) return ''
  const company = companyList.value.find(c => c.id === companyId)
  return company ? company.enterpriseName : ''
}

/** 获取供应商名称 */
const getSupplierName = (supplierId: number | undefined) => {
  if (!supplierId) return ''
  const supplier = supplierList.value.find(s => s.id === supplierId)
  return supplier ? supplier.supplierName : ''
}

/** 获取供应商账户名称 */
const getSupplierAccountName = (accountId: number | undefined) => {
  if (!accountId) return ''
  const account = supplierAccountList.value.find(a => a.id === accountId)
  return account ? account.accountName : ''
}

/** 获取供应商账户的账号 */
const getSupplierAccountNum = (accountId: number | undefined) => {
  if (!accountId) return ''
  const account = supplierAccountList.value.find(a => a.id === accountId)
  return account ? account.accountNum : ''
}

/** 获取供应商账户的开户行 */
const getSupplierAccountBankLocation = (accountId: number | undefined) => {
  if (!accountId) return ''
  const account = supplierAccountList.value.find(a => a.id === accountId)
  return account ? account.accountBanklocation : ''
}

/** 获取材料名称 */
const getMaterialName = (materialId: string | undefined) => {
  if (!materialId) return ''
  const material = materialsList.value.find(m => m.id == materialId)
  return material ? material.materialsName : ''
}

/** 获取文件类型图标 */
const getFileTypeIcon = (fileName: string): string => {
  if (!fileName) return '📄'

  const extension = fileName.toLowerCase().split('.').pop() || ''

  // 图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'].includes(extension)) {
    return '🖼️'
  }

  // PDF文件
  if (extension === 'pdf') {
    return '📕'
  }

  // Word文档
  if (['doc', 'docx'].includes(extension)) {
    return '📘'
  }

  // Excel文档
  if (['xls', 'xlsx', 'xlsm', 'xlsb'].includes(extension)) {
    return '📗'
  }

  // PowerPoint文档
  if (['ppt', 'pptx', 'pps', 'ppsx'].includes(extension)) {
    return '📙'
  }

  // 压缩文件
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
    return '🗜️'
  }

  // 视频文件
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', '3gp'].includes(extension)) {
    return '🎬'
  }

  // 音频文件
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'].includes(extension)) {
    return '🎵'
  }

  // 代码文件
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'php', 'py', 'java', 'cpp', 'c', 'go', 'rs'].includes(extension)) {
    return '💻'
  }

  // 文本文件
  if (['txt', 'md', 'log', 'rtf'].includes(extension)) {
    return '📝'
  }

  // 数据文件
  if (['json', 'xml', 'csv', 'sql', 'yaml', 'yml'].includes(extension)) {
    return '📊'
  }

  // 字体文件
  if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(extension)) {
    return '🔤'
  }

  // 可执行文件
  if (['exe', 'msi', 'dmg', 'deb', 'rpm', 'app'].includes(extension)) {
    return '⚙️'
  }

  // 默认文档图标
  return '📄'
}

/** 预览文件 */
const previewFile = async (file: { id: number; name: string; url: string }) => {
  try {
    // 添加用户昵称参数
    const nickname = userStore.getUser?.nickname || ''

    // 获取文件下载URL
    const signedUrl = await FileApi.getDownloadUrl(file.id)
    // 构建文件访问URL，保持签名完整性
    const fileUrl = signedUrl + `&nickname=${nickname}`

    // 构建预览URL
    const encodedUrl = encodeURIComponent(base64Encode(fileUrl))
    const previewUrl = `${FIXED_DOMAIN}/preview/onlinePreview?url=${encodedUrl}`

    // 使用预览工具类打开窗口
    openPreviewWindow(previewUrl, file.name)
  } catch (error) {
    console.error('预览文件失败:', error)
    message.error('预览文件失败')
  }
}

/** 处理附件列表 */
const processFileList = async (fileData: string | any[] | undefined) => {
  try {
    if (fileData) {
      let fileIds: (number | string)[] = []

      // 如果fileList是字符串，则按逗号分割并过滤空值
      if (typeof fileData === 'string') {
        const cleanFileList = fileData.replace(/^\[|\]$/g, '')
        fileIds = cleanFileList.split(',').map(id => id.trim()).filter(id => id !== '')
      } else if (Array.isArray(fileData)) {
        fileIds = fileData
      }

      // 如果有文件ID，则获取文件详情
      if (fileIds.length > 0) {
        const filesResponse = await FileApi.getFilesByIds(fileIds)
        const filesData = filesResponse.data || filesResponse

        if (Array.isArray(filesData)) {
          fileList.value = filesData.map(file => ({
            id: file.id,
            name: file.name,
            url: file.url
          }))
        }
      } else {
        fileList.value = []
      }
    } else {
      fileList.value = []
    }
  } catch (error) {
    console.warn('处理附件列表时出错:', error)
    fileList.value = []
  }
}

/** 获得数据 */
const getInfo = async () => {
  // 如果是预览模式，直接使用传入的模型信息
  if (props.previewMode && props.modelInfo) {
    detailData.value = props.modelInfo
    // 处理附件列表
    await processFileList(props.modelInfo.fileList)
    return
  }

  detailLoading.value = true
  try {
    // 并行获取所有需要的列表数据
    await Promise.all([
      getUserList(),
      getDeptList(),
      getCompanyList(),
      getSupplierList(),
      getMaterialsList()
    ])

    const data = await SupplychainRepaymentApi.getSupplychainRepayment(props.id || queryId)
    detailData.value = data

    // 根据供应商ID获取对应的账户列表
    if (data.supplierId) {
      await getSupplierAccountList(data.supplierId)
    }

    // 处理附件列表
    await processFileList(data.fileList)
  } finally {
    detailLoading.value = false
  }
}

/** 格式化金额，添加千分位和元单位 */
const formatAmount = (amount: number | string | undefined) => {
  if (amount === undefined || amount === null) return '-'
  
  // 转换为数字
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  // 格式化为带千分位的数字，保留两位小数，并添加"元"单位
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }) + ' 元'
}

defineExpose({ open: getInfo }) // 提供 open 方法，用于打开弹窗

/** 初始化 **/
onMounted(() => {
  getInfo()
})
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
