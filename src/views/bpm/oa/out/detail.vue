<template>
    <ContentWrap title="外出申请详情" v-loading="detailLoading">
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
            <el-descriptions-item label="外出天数">
                {{ detailData.day }} 天
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">
                {{ formatDate(detailData.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="审批状态">
                <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="detailData.status" />
            </el-descriptions-item>
        </el-descriptions>
    </ContentWrap>
</template>

<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import * as OutApi from '@/api/bpm/form/out'
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'

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
    createTime: ''
})

/** 获得详情 */
const getInfo = async () => {
    detailLoading.value = true
    try {
        detailData.value = await OutApi.getOut(props.id || queryId)
    } finally {
        detailLoading.value = false
    }
}

/** 初始化 */
onMounted(async () => {
    await getInfo()
})
</script>
