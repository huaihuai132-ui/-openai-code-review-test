<template>
    <ContentWrap>
        <el-descriptions :column="1" border>
            <el-descriptions-item label="议题标题">
                {{ detailData.issueTitle }}
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">
                {{ formatToDateTime(detailData.createTime, 'YYYY-MM-DD HH:mm:ss') || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="议题类型"> 
                <dict-tag :type="DICT_TYPE.MEET_ISSUE_TYPE" :value="detailData.issueType" />
            </el-descriptions-item>
            <el-descriptions-item label="上会类型">
                <dict-tag :type="DICT_TYPE.MEET_TYPE" :value="detailData.meetingType" />
            </el-descriptions-item>

            <el-descriptions-item label="议题概述">
                {{ detailData.description || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="议题详细内容">
                {{ detailData.issueContent || '无' }}
            </el-descriptions-item>

            <el-descriptions-item label="议题附件" v-if="detailData.issueAttachment && detailData.issueAttachment.length > 0">
                <div v-for="attachment in detailData.issueAttachment" :key="attachment.id" class="mb-2">
                    <el-link type="primary" :href="attachment.url" target="_blank">{{ attachment.name }}</el-link>
                </div>
            </el-descriptions-item>
            <el-descriptions-item label="议题附件" v-else>
                无附件
            </el-descriptions-item>
        </el-descriptions>
    </ContentWrap>
</template>
<script lang="ts" setup> 
import { formatToDateTime } from '@/utils/dateUtil'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict' 
import { propTypes } from '@/utils/propTypes'
import { OaMeetingIssueApi } from 'src/api/business/oameetingissue/index.ts'
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

defineOptions({ name: 'OaMeetingIssueDetail' })

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

/** 获得数据 */
const getInfo = async () => {
    // 如果是预览模式，直接使用传入的模型信息
    if (props.previewMode && props.modelInfo) {
        detailData.value = props.modelInfo
        return
    }

    detailLoading.value = true
    try {
        detailData.value = await OaMeetingIssueApi.getOaMeetingIssue(props.id || queryId)
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