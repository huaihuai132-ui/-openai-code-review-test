<template>
  <div v-loading="detailLoading">
    <div class="mb-10px text-right">
      <el-button type="info" @click="showPrintPreview" v-if="detailData.id">
        <Icon icon="ep:view" class="mr-5px" />
        打印预览
      </el-button>
    </div>
    <ContentWrap>
      <el-descriptions :column="1" border>
      <el-descriptions-item label="请假类型">
        <dict-tag :type="DICT_TYPE.BPM_OA_LEAVE_TYPE" :value="detailData.type" />
      </el-descriptions-item>
      <el-descriptions-item label="开始时间">
        {{ formatDate(detailData.startTime, 'YYYY-MM-DD') }}
      </el-descriptions-item>
      <el-descriptions-item label="结束时间">
        {{ formatDate(detailData.endTime, 'YYYY-MM-DD') }}
      </el-descriptions-item>
      <el-descriptions-item label="原因">
        {{ detailData.reason }}
      </el-descriptions-item>
      <el-descriptions-item label="附件" v-if="fileIdList && fileIdList.length > 0">
        <BatchFileUpload v-model:fileList="fileIdList" mode="view" directory="business" />
      </el-descriptions-item>
      <el-descriptions-item label="附件" v-else>
        <span>无附件</span>
      </el-descriptions-item>
    </el-descriptions>
  </ContentWrap>
  </div>
  
  <!-- 打印预览弹窗 -->
  <PrintPreview v-model="printPreviewVisible" :leave-data="detailData" />
</template>
<script lang="ts" setup>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import * as LeaveApi from '@/api/bpm/form/leave'
import { BatchFileUpload } from '@/components/UploadFile'
import PrintPreview from './components/PrintPreview.vue'

defineOptions({ name: 'BpmOALeaveDetail' })

const { query } = useRoute() // 查询参数

const props = defineProps({
  id: propTypes.oneOfType([propTypes.number, propTypes.string]).def(undefined)
})
const detailLoading = ref(false) // 表单的加载中
const detailData = ref<any>({}) // 详情数据
const queryId = query.id as unknown as number | string // 从 URL 传递过来的 id 编号
const fileIdList = ref<string[]>([]) // 文件ID列表（使用字符串避免精度丢失）
const printPreviewVisible = ref(false) // 打印预览弹窗显示状态

/** 解析文件ID列表 */
const parseFileIdList = (fileList: string): string[] => {
    if (!fileList) {
        return []
    }
    try {
        // 直接返回字符串数组，避免数字精度丢失
        return fileList.split(',').map(id => id.trim()).filter(id => id.length > 0)
    } catch (error) {
        console.error('解析文件ID列表失败', error)
        return []
    }
}

/** 获得数据 */
const getInfo = async () => {
  detailLoading.value = true
  try {
    detailData.value = await LeaveApi.getLeave(props.id || queryId)
    // 处理文件列表，如果字段不存在则设为空字符串
    fileIdList.value = parseFileIdList(detailData.value.fileList || '')
  } finally {
    detailLoading.value = false
  }
}

/** 显示打印预览 */
const showPrintPreview = () => {
  printPreviewVisible.value = true
}

defineExpose({ open: getInfo }) // 提供 open 方法，用于打开弹窗

/** 初始化 **/
onMounted(() => {
  getInfo()
})
</script>
