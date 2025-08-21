<template>
    <ContentWrap>
        <el-descriptions :column="1" border>
            <el-descriptions-item label="用章部门">
                {{ detailData.deptName }}
            </el-descriptions-item>
            <el-descriptions-item label="资金">
                {{ detailData.fund }} 元
            </el-descriptions-item>
            <el-descriptions-item label="用章事由">
                {{ detailData.reason }}
            </el-descriptions-item>
            <el-descriptions-item label="用章日期">
                {{ formatDate(detailData.useDate, 'YYYY-MM-DD') }}
            </el-descriptions-item>
            <el-descriptions-item label="用章文件">
                <div v-if="fileNameList && fileNameList.length > 0">
                    <div v-for="(fileName, index) in fileNameList" :key="index">
                        {{ fileName }}
                    </div>
                </div>
                <span v-else>无</span>
            </el-descriptions-item>
            <el-descriptions-item label="印章类型">
                <dict-tag type="bmp_oa_chapter_type" :value="detailData.chapterName || ''" />
            </el-descriptions-item>
            <el-descriptions-item label="是否外带">
                <dict-tag type="sys_boolean_string" :value="detailData.isTakeOut || '0'" />
            </el-descriptions-item>
            <el-descriptions-item label="附件" v-if="fileIdList && fileIdList.length > 0">
                <BatchFileUpload v-model:fileList="fileIdList" mode="view" directory="chapter" />
            </el-descriptions-item>
            <el-descriptions-item label="附件" v-else>
                <span>无附件</span>
            </el-descriptions-item>
        </el-descriptions>
    </ContentWrap>
</template>
<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import * as ChapterApi from '@/api/bpm/form/chapter'
import { BatchFileUpload } from '@/components/UploadFile'

defineOptions({ name: 'BpmOAChapterDetail' })

const { query } = useRoute() // 查询参数

const props = defineProps({
    id: propTypes.oneOfType([propTypes.number, propTypes.string]).def(undefined),
    previewMode: propTypes.bool.def(false), // 是否为预览模式
    readonly: propTypes.bool.def(false), // 是否为只读模式
    modelInfo: propTypes.object.def({}) // 模型信息
})
const detailLoading = ref(false) // 表单的加载中
const detailData = ref<any>({}) // 详情数据
const queryId = query.id as unknown as number | string // 从 URL 传递过来的 id 编号
const fileNameList = ref<string[]>([]) // 用章文件名称列表
const fileIdList = ref<string[]>([]) // 文件ID列表（使用字符串避免精度丢失）

/** 解析用章文件名称 */
const parseFileNames = (fileNames: string) => {
    if (!fileNames) return []
    try {
        return JSON.parse(fileNames)
    } catch (error) {
        console.error('解析用章文件名称失败', error)
        return []
    }
}

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
        fileNameList.value = parseFileNames(props.modelInfo.chapterFileName)
        fileIdList.value = parseFileIdList(props.modelInfo.fileList)
        return
    }

    detailLoading.value = true
    try {
        detailData.value = await ChapterApi.getChapter(props.id || queryId)
        fileNameList.value = parseFileNames(detailData.value.chapterFileName)
        fileIdList.value = parseFileIdList(detailData.value.fileList)
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