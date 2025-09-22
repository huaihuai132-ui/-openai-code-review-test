<template>
  <div v-loading="detailLoading">
    <div class="mb-10px text-right">
      <el-button type="info" @click="showPrintPreview" v-if="detailData.id">
        <Icon icon="ep:view" class="mr-5px" />
        打印预览
      </el-button>
    </div>
    <ContentWrap title="外出申请详情">
        <el-descriptions :column="1" border>
            <el-descriptions-item label="外出类型">
                <dict-tag :type="DICT_TYPE.BPM_OA_OUT_TYPE" :value="detailData.type" />
            </el-descriptions-item>
            <el-descriptions-item label="详细原因">
                {{ detailData.reason }}
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">
                {{ formatDate(detailData.startTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="结束时间">
                {{ formatDate(detailData.endTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">
                {{ formatDate(detailData.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="审批状态">
                <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="detailData.status" />
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
  <PrintPreview v-model="printPreviewVisible" :out-data="detailData" />
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import * as OutApi from '@/api/bpm/form/out'
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import { BatchFileUpload } from '@/components/UploadFile'
import PrintPreview from './components/PrintPreview.vue'

defineOptions({ name: 'BpmOAOutDetail' })

const props = defineProps({
    id: propTypes.oneOfType([propTypes.number, propTypes.string]).def(undefined),
    previewMode: propTypes.bool.def(false), // 是否为预览模式
    readonly: propTypes.bool.def(false), // 是否为只读模式
    modelInfo: propTypes.object.def({}) // 模型信息
})

const { query } = useRoute() // 查询参数
const queryId = query.id as unknown as number | string // 从 URL 传递过来的 id 编号

const detailLoading = ref(false) // 表单的加载中
const detailData = ref<OutApi.OutVO>({
    id: 0,
    status: 0,
    type: 0,
    reason: '',
    processInstanceId: '',
    startTime: '',
    endTime: '',
    day: 0,
    createTime: '',
    fileList: '',
    sequenceCode: ''
})
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

/** 获得详情 */
const getInfo = async () => {
    detailLoading.value = true
    try {
        detailData.value = await OutApi.getOut(props.id || queryId)
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

/** 初始化 */
onMounted(async () => {
    await getInfo()
})
</script>
