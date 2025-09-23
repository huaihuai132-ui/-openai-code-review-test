<template>
  <ContentWrap>
    <div class="process-form-container">
      <el-form
        :model="formData"
        label-width="100px"
        v-loading="detailLoading"
        :disabled="true"
      >
        <!-- 上部分：输入框以一行三列形式排列 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-row">
            <el-form-item label="立项编号" prop="applicationId">
              <el-input v-model="formData.applicationId" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="企业名称" prop="companyName">
              <el-input v-model="formData.companyName" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="项目申请编码" prop="leasedCode">
              <el-input v-model="formData.leasedCode" placeholder="无" readonly />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="标的名称" prop="leasedProperty">
              <el-input v-model="formData.leasedProperty" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="标的数量" prop="leasedPropertyNum">
              <el-input v-model="formData.leasedPropertyNum" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="标的净值" prop="leasedPropertyValue">
              <el-input v-model="formData.leasedPropertyValue" placeholder="无" readonly >
                <template #append>元</template>
              </el-input>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="租赁模式" prop="leaseMode">
              <el-input v-model="formData.leaseModeText" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="担保方式" prop="lienMode">
              <el-input v-model="formData.lienModeText" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="申请额度" prop="leaseAmount">
              <el-input v-model="formData.leaseAmount" placeholder="无" readonly >
                <template #append>元</template>
              </el-input>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="承租时间" prop="leaseDate">
              <el-input v-model="formData.leaseDateText" placeholder="无" readonly />
            </el-form-item>
            <el-form-item label="承租租期" prop="leaseTerm">
              <el-input v-model="formData.leaseTerm" placeholder="无" readonly >
                <template #append>月</template>
              </el-input>
            </el-form-item>
            <el-form-item label="利率" prop="interestRate">
              <el-input v-model="formData.interestRate" placeholder="无" readonly >
                <template #append>%</template>
              </el-input>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="申请人编码" prop="userId" >
              <el-input v-model="formData.userId" placeholder="无" readonly :disabled="true"/>
            </el-form-item>
          </div>
        </div>

        <!-- 下部分：Tab组件 -->
        <div class="form-section">
          <el-tabs v-model="activeTab" class="form-tabs">
            <!-- 设备管理 tab -->
            <el-tab-pane label="设备" name="equipment">
              <div class="equipment-content">
                <div v-if="formData.deviceList && formData.deviceList.length > 0" class="device-list">
                  <el-table :data="formData.deviceList" style="width: 100%" border>
                    <el-table-column prop="deviceName" label="设备名称" align="center" />
                    <el-table-column prop="deviceSpecification" label="规格型号" align="center" />
                    <el-table-column prop="deviceManufacturers" label="生产厂家" align="center" />
                    <el-table-column prop="buyDate" label="购买时间" align="center">
                      <template #default="scope">
                        {{ scope.row.buyDate ? formatDate(scope.row.buyDate) : '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="quantity" label="数量" align="center" />
                    <el-table-column prop="netWorth" label="净值" align="center">
                      <template #default="scope">
                        {{ scope.row.netWorth ? scope.row.netWorth.toLocaleString() + '元' : '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="originalWorth" label="原值" align="center">
                      <template #default="scope">
                        {{ scope.row.originalWorth ? scope.row.originalWorth.toLocaleString() + '元' : '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="deviceStatus" label="设备状态" align="center">
                      <template #default="scope">
                        <el-tag :type="getDeviceStatusType(scope.row.deviceStatus)" size="small">
                          {{ getDeviceStatusText(scope.row.deviceStatus) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
                <div v-else class="no-data">
                  <el-empty description="暂无设备信息" />
                </div>
              </div>
            </el-tab-pane>

            <!-- 附件上传 tab -->
            <el-tab-pane label="附件上传" name="upload">
              <div class="upload-content">
              <el-form-item label="附件文件" prop="fileList">
                <BatchFileUpload  ref="fileUploadRef" v-model:fileList="formData.fileList" mode="view" directory="business" />
              </el-form-item>
            </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-form>
    </div>
  </ContentWrap>
</template>
<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import { FinanceLeaseApi, type FinanceLeaseVO } from '@/api/business/finance/financelease'
import { Document } from '@element-plus/icons-vue'
import { BatchFileUpload } from '@/components/UploadFile'

defineOptions({ name: 'BpmOAFinanceLeaseDetail' })

const { query } = useRoute() // 查询参数

const props = defineProps({
    id: propTypes.oneOfType([propTypes.number, propTypes.string]).def(undefined),
    previewMode: propTypes.bool.def(false), // 是否为预览模式
    readonly: propTypes.bool.def(false), // 是否为只读模式
    modelInfo: propTypes.object.def({}) // 模型信息
})

const fileUploadRef = ref() // 文件上传组件 Ref


const detailLoading = ref(false) // 表单的加载中
const detailData = ref<FinanceLeaseVO>({} as FinanceLeaseVO) // 详情数据
const queryId = query.id as unknown as number // 从 URL 传递过来的 id 编号
const fileList = ref<any[]>([]) // 文件列表
const activeTab = ref('equipment') // 当前激活的tab

// 表单数据
const formData = ref({
  id: undefined,
  applicationId: '',
  companyId: undefined,
  companyName: '',
  leasedCode: '',
  leasedProperty: '',
  leasedPropertyNum: '',
  leasedPropertyValue: '',
  leaseMode: undefined,
  leaseModeText: '',
  lienMode: undefined,
  lienModeText: '',
  leaseAmount: '',
  leaseDate: undefined,
  leaseDateText: '',
  leaseTerm: '',
  interestRate: '',
  userId: '',
  deviceList: [] as any[],
  fileList: [] as string[], // 添加文件列表字段
  status: undefined
})

/** 获得租赁模式文本 */
const getLeaseModeText = (leaseMode: number) => {
    switch (leaseMode) {
        case 1:
            return '融资租赁'
        case 2:
            return '经营租赁'
        default:
            return '未知'
    }
}

/** 获取担保方式文本 */
const getLienModeText = (lienMode: number) => {
    switch (lienMode) {
        case 1:
            return '抵押担保'
        case 2:
            return '质押担保'
        case 3:
            return '保证担保'
        default:
            return '未知'
    }
}

/** 获取状态文本 */
const getStatusText = (status: number) => {
    switch (status) {
        case 0:
            return '草稿'
        case 1:
            return '审批中'
        case 2:
            return '已通过'
        case 3:
            return '已拒绝'
        default:
            return '未知状态'
    }
}

/** 获取设备状态文本 */
const getDeviceStatusText = (status: number) => {
    switch (status) {
        case 1:
            return '正常'
        case 2:
            return '维修中'
        case 3:
            return '报废'
        case 4:
            return '闲置'
        default:
            return '未知'
    }
}

/** 获取设备状态类型 */
const getDeviceStatusType = (status: number) => {
    switch (status) {
        case 1:
            return 'success' // 正常
        case 2:
            return 'warning' // 维修中
        case 3:
            return 'danger'  // 报废
        case 4:
            return 'info'    // 闲置
        default:
            return ''
    }
}

/** 解析附件列表 */
const parseFileList = (fileData: any) => {
    if (!fileData) return []

    // 如果是字符串，尝试按逗号分割
    if (typeof fileData === 'string') {
        // 先尝试 JSON 解析
        try {
            return JSON.parse(fileData)
        } catch {
            // 如果 JSON 解析失败，尝试逗号分割
            return fileData.split(',').filter(id => id.trim() !== '')
        }
    }

    // 如果已经是数组，直接返回
    if (Array.isArray(fileData)) {
        return fileData
    }

    return []
}


/**
 * 加载融资租赁数据
 */
const loadFinanceLeaseData = async (businessKey: string) => {
  try {
    detailLoading.value = true

    // 从后端获取融资租赁详细数据
    const response = await FinanceLeaseApi.getFinanceLease(businessKey as any)
    if (response) {
      // 更新表单数据
      Object.keys(response).forEach(key => {
        if (key in formData.value) {
          formData.value[key] = response[key]
        }
      })

      // 处理一些特殊字段
      formData.value.leaseModeText = getLeaseModeText(response.leaseMode)
      formData.value.lienModeText = getLienModeText(response.lienMode)
      formData.value.leaseDateText = response.leaseDate ? formatDate(response.leaseDate, 'YYYY-MM-DD') : ''

      // 将数值类型转换为字符串用于显示
      formData.value.leasedPropertyNum = response.leasedPropertyNum ? String(response.leasedPropertyNum) : ''
      formData.value.leasedPropertyValue = response.leasedPropertyValue ? String(response.leasedPropertyValue) : ''
      formData.value.leaseAmount = response.leaseAmount ? String(response.leaseAmount) : ''
      formData.value.leaseTerm = response.leaseTerm ? String(response.leaseTerm) : ''
      formData.value.interestRate = response.interestRate ? String(response.interestRate) : ''
      formData.value.userId = response.userId ? String(response.userId) : ''

      // 处理文件列表 - 与 FinanceLeaseForm 保持一致
      const processedFileList = response.fileList ? (typeof response.fileList === 'string' ? response.fileList.split(',').filter(id => id.trim() !== '') : response.fileList) : []
      formData.value.fileList = processedFileList
    }
  } catch (error) {
    console.error('获取融资租赁数据失败:', error)
  } finally {
    detailLoading.value = false
  }
}

/** 获得数据 */
const getInfo = async () => {
    // 如果是预览模式且有ID，优先使用businessKey获取数据
    if (props.previewMode && props.id) {
        await loadFinanceLeaseData(props.id as string)
        return
    }

    const targetId = props.id || queryId

    if (!targetId) {
        console.error('没有找到有效的 ID 来加载数据')
        return
    }

    await loadFinanceLeaseData(targetId as string)
}

defineExpose({
    open: getInfo
}) // 提供 open 方法，用于打开弹窗

/** 初始化 **/
onMounted(() => {
    getInfo()
})
</script>
<style scoped>
/* 流程表单容器样式 */
.process-form-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}


/* Tab组件样式 */
.form-tabs {
  margin-top: 20px;
}

.equipment-content,
.upload-content {
  padding: 20px 0;
}

/* 设备列表样式 */
.device-list {
  margin-top: 10px;
}

.no-data {
  text-align: center;
  padding: 40px 0;
}

/* 文件列表样式 */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item .el-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  width: fit-content;
}

.no-files {
  padding: 20px 0;
  text-align: center;
}

.no-file-text {
  color: #909399;
  font-style: italic;
}

/* 只读输入框样式优化 */
:deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  color: #495057;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 表格样式优化 */
:deep(.el-table) {
  margin-top: 10px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 600;
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
}

/* 空状态组件样式 */
:deep(.el-empty) {
  padding: 20px 0;
}
</style>
