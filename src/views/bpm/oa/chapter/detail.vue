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
                <dict-tag type="bpm_oa_chapter_type" :value="detailData.chapterName" />
            </el-descriptions-item>
            <el-descriptions-item label="是否外带">
                <dict-tag type="sys_boolean_string" :value="detailData.isTakeOut" />
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
// 移除未使用的DICT_TYPE导入
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import * as ChapterApi from '@/api/bpm/form/chapter'

defineOptions({ name: 'BpmOAChapterDetail' })

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
const fileNameList = ref<string[]>([]) // 用章文件名称列表
const fileList = ref<any[]>([]) // 文件列表

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

/** 解析附件列表 */
const parseFileList = (storagePath: string) => {
    if (!storagePath) return []
    try {
        return JSON.parse(storagePath)
    } catch (error) {
        console.error('解析附件列表失败', error)
        return []
    }
}

/** 获得数据 */
const getInfo = async () => {
    // 如果是预览模式，直接使用传入的模型信息
    if (props.previewMode && props.modelInfo) {
        detailData.value = props.modelInfo
        fileNameList.value = parseFileNames(props.modelInfo.chapterFileName)
        fileList.value = parseFileList(props.modelInfo.storagePath)
        return
    }

    detailLoading.value = true
    try {
        detailData.value = await ChapterApi.getChapter(props.id || queryId)
        fileNameList.value = parseFileNames(detailData.value.chapterFileName)
        fileList.value = parseFileList(detailData.value.storagePath)
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
 