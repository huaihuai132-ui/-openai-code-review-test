<template>
    <ContentWrap>
        <template #extra>
            <el-button type="info" @click="showPrintPreview" v-if="detailData.id">
                <Icon icon="ep:view" class="mr-5px" />
                打印预览
            </el-button>
        </template>
        <el-descriptions :column="1" border>
            <el-descriptions-item label="采购事由">
                {{ detailData.reason }}
            </el-descriptions-item>
            <el-descriptions-item label="采购日期">
                {{ formatDate(detailData.purchaseDate, 'YYYY-MM-DD') }}
            </el-descriptions-item>
            <el-descriptions-item label="物品清单">
                <div v-if="detailData.itemList && detailData.itemList.length > 0">
                    <el-table :data="detailData.itemList" border style="width: 100%">
                        <el-table-column prop="type" label="类别" />
                        <el-table-column prop="itemName" label="名称" />
                        <el-table-column prop="specification" label="型号" />
                        <el-table-column prop="number" label="数量" />
                        <el-table-column prop="usage" label="用途" />
                        <el-table-column prop="estimatedAmount" label="预计金额" />
                    </el-table>
                </div>
                <div v-else>无物品信息</div>
            </el-descriptions-item>
            <el-descriptions-item label="总价">
                {{ detailData.totalPrice }}
            </el-descriptions-item>
            <el-descriptions-item label="附件" v-if="fileIdList && fileIdList.length > 0">
                <BatchFileUpload v-model:fileList="fileIdList" mode="view" directory="business" />
            </el-descriptions-item>
            <el-descriptions-item label="附件" v-else>
                <span>无附件</span>
            </el-descriptions-item>
        </el-descriptions>
    </ContentWrap>

    <!-- 打印预览弹窗 -->
    <PrintPreview v-model="printPreviewVisible" :purchase-data="detailData" />
</template>
<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import * as PurchaseApi from '@/api/bpm/form/purchase/purchase'
import { BatchFileUpload } from '@/components/UploadFile'
import PrintPreview from './components/PrintPreview.vue'

defineOptions({ name: 'BpmOAPurchaseDetail' })

const { query } = useRoute() // 查询参数

const props = defineProps({
    id: propTypes.number.def(undefined),
    previewMode: propTypes.bool.def(false), // 是否为预览模式
    readonly: propTypes.bool.def(false), // 是否为只读模式
    modelInfo: propTypes.object.def({}) // 模型信息
})
const detailLoading = ref(false) // 表单的加载中
const detailData = ref<any>({}) // 详情数据
const queryId = query.id as unknown as number // 从 URL 传递过来的 id 编号
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
    // 如果是预览模式，直接使用传入的模型信息
    if (props.previewMode && props.modelInfo) {
        detailData.value = props.modelInfo
        fileIdList.value = parseFileIdList(props.modelInfo.fileList)
        return
    }

    detailLoading.value = true
    try {
        detailData.value = await PurchaseApi.getPurchase(props.id || queryId)
        fileIdList.value = parseFileIdList(detailData.value.fileList)
    } finally {
        detailLoading.value = false
    }
}
defineExpose({ open: getInfo }) // 提供 open 方法，用于打开弹窗

/** 显示打印预览 */
const showPrintPreview = () => {
    printPreviewVisible.value = true
}

/** 初始化 **/
onMounted(() => {
    getInfo()
})
</script>
