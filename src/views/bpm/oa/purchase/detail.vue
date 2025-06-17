<template>
    <ContentWrap>
        <el-descriptions :column="1" border>
            <el-descriptions-item label="采购事由">
                {{ detailData.reason }}
            </el-descriptions-item>
            <el-descriptions-item label="采购日期">
                {{ formatDate(detailData.purchaseDate, 'YYYY-MM-DD') }}
            </el-descriptions-item>
            <el-descriptions-item label="物品清单">
                <div v-if="itemList && itemList.length > 0">
                    <el-table :data="itemList" border style="width: 100%">
                        <el-table-column prop="category" label="类别" />
                        <el-table-column prop="name" label="名称" />
                        <el-table-column prop="model" label="型号" />
                        <el-table-column prop="quantity" label="数量" />
                        <el-table-column prop="purpose" label="用途" />
                        <el-table-column prop="estimatedPrice" label="预计金额" />
                    </el-table>
                </div>
                <div v-else>无物品信息</div>
            </el-descriptions-item>
            <el-descriptions-item label="总价">
                {{ detailData.totalPrice }}
            </el-descriptions-item>
            <el-descriptions-item label="附件" v-if="detailData.storagePath">
                <el-link type="primary" :href="detailData.storagePath" target="_blank">查看附件</el-link>
            </el-descriptions-item>
        </el-descriptions>
    </ContentWrap>
</template>
<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import * as PurchaseApi from '@/api/bpm/form/purchase/purchase'

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
const itemList = ref<any[]>([]) // 物品清单
const queryId = query.id as unknown as number // 从 URL 传递过来的 id 编号

/** 解析物品清单JSON */
const parseItemList = (itemListStr: string) => {
    if (!itemListStr) return []
    try {
        return JSON.parse(itemListStr)
    } catch (e) {
        console.error('解析物品清单失败:', e)
        return []
    }
}

/** 获得数据 */
const getInfo = async () => {
    // 如果是预览模式，直接使用传入的模型信息
    if (props.previewMode && props.modelInfo) {
        detailData.value = props.modelInfo
        itemList.value = parseItemList(props.modelInfo.itemList)
        return
    }

    detailLoading.value = true
    try {
        detailData.value = await PurchaseApi.getPurchase(props.id || queryId)
        itemList.value = parseItemList(detailData.value.itemList)
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
