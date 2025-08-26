<template>
    <ContentWrap>
        <el-descriptions :column="1" border>
            <el-descriptions-item label="申请编号" v-if="detailData.applicationId">
                {{ detailData.applicationId }}
            </el-descriptions-item>
            <el-descriptions-item label="企业ID">
                {{ detailData.companyId }}
            </el-descriptions-item>
            <el-descriptions-item label="融资标的物名称">
                {{ detailData.leasedProperty || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="标的物数量">
                {{ detailData.leasedPropertyNum }} 件
            </el-descriptions-item>
            <el-descriptions-item label="标的物净值">
                {{ detailData.leasedPropertyValue }} 元
            </el-descriptions-item>
            <el-descriptions-item label="租赁模式">
                {{ getLeaseModeText(detailData.leaseMode) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请额度">
                {{ detailData.leaseAmount }} 元
            </el-descriptions-item>
            <el-descriptions-item label="承租时间">
                {{ formatDate(detailData.leaseDate, 'YYYY-MM-DD') }}
            </el-descriptions-item>
            <el-descriptions-item label="承租租期">
                {{ detailData.leaseTerm }} 月
            </el-descriptions-item>
            <el-descriptions-item label="利率">
                {{ detailData.interestRate }}%
            </el-descriptions-item>
            <el-descriptions-item label="担保方式">
                {{ getLienModeText(detailData.lienMode) }}
            </el-descriptions-item>
            <el-descriptions-item label="部门ID" v-if="detailData.deptId">
                {{ detailData.deptId }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
                {{ getStatusText(detailData.status) }}
            </el-descriptions-item>
            <el-descriptions-item label="附件" v-if="fileList && fileList.length > 0">
                <div v-for="(file, index) in fileList" :key="index" class="mb-10px">
                    <el-link type="primary" :href="file.path" target="_blank">{{ file.name }}</el-link>
                </div>
            </el-descriptions-item>
        </el-descriptions>
    </ContentWrap>
</template>
<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import { FinanceLeaseApi, type FinanceLeaseVO } from '@/api/business/financelease'

defineOptions({ name: 'BpmOAFinanceLeaseDetail' })

const { query } = useRoute() // 查询参数

const props = defineProps({
    id: propTypes.number.def(undefined),
    previewMode: propTypes.bool.def(false), // 是否为预览模式
    readonly: propTypes.bool.def(false), // 是否为只读模式
    modelInfo: propTypes.object.def({}) // 模型信息
})
const detailLoading = ref(false) // 表单的加载中
const detailData = ref<FinanceLeaseVO>({} as FinanceLeaseVO) // 详情数据
const queryId = query.id as unknown as number // 从 URL 传递过来的 id 编号
const fileList = ref<any[]>([]) // 文件列表

/** 获得租赁模式文本 */
const getLeaseModeText = (leaseMode: number) => {
    switch (leaseMode) {
        case 1:
            return '直租'
        case 2:
            return '回租'
        default:
            return '未知'
    }
}

/** 获取担保方式文本 */
const getLienModeText = (lienMode: number) => {
    switch (lienMode) {
        case 1:
            return '提供物质担保'
        case 2:
            return '保证人连带还款责任'
        case 99:
            return '其它'
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

/** 解析附件列表 */
const parseFileList = (filePath: string) => {
    if (!filePath) return []
    try {
        return JSON.parse(filePath)
    } catch (error) {
        console.error('解析附件列表失败', error)
        return []
    }
}

/** 获得数据 */
const getInfo = async () => {
    // 如果是预览模式，直接使用传入的模型信息
    if (props.previewMode && props.modelInfo) {
        detailData.value = props.modelInfo as FinanceLeaseVO
        fileList.value = parseFileList(props.modelInfo.filePath)
        return
    }

    detailLoading.value = true
    try {
        detailData.value = await FinanceLeaseApi.getFinanceLease(props.id || queryId)
        fileList.value = parseFileList(detailData.value.filePath)
    } finally {
        detailLoading.value = false
    }
}
defineExpose({ open: getInfo }) // 提供 open 方法，用于打开弹窗

/** 初始化 **/
onMounted(() => {
    getInfo()
})
</script>
<style scoped>
.mb-10px {
    margin-bottom: 10px;
}
</style>
