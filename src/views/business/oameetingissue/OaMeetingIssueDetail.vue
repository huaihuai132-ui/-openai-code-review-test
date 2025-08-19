<template>
  <Dialog title="议题详情" v-model="dialogVisible" width="700px">
    <div v-loading="loading" class="py-10">
      <el-descriptions :column="2" border :size="'small'">
        <el-descriptions-item label="议题编号" :span="2">
          {{ formData.issueNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="议题标题" :span="2">
          {{ formData.issueTitle || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="议题类型">
          <dict-tag :type="DICT_TYPE.MEET_ISSUE_TYPE" :value="formData.issueType" />
        </el-descriptions-item>
        <el-descriptions-item label="上会类型">
          <dict-tag :type="DICT_TYPE.MEET_TYPE" :value="formData.meetingType" />
        </el-descriptions-item>
        <el-descriptions-item label="议题状态">
          <dict-tag :type="DICT_TYPE.ISSUE_STATUS" :value="formData.issueStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <dict-tag :type="DICT_TYPE.ISSUE_AUDIT_STATUS" :value="formData.status" />
        </el-descriptions-item>
        <el-descriptions-item label="议题概述" :span="2">
          <div class="whitespace-pre-wrap">
            {{ formData.description || '-' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="议题详细内容" :span="2">
          <div class="whitespace-pre-wrap break-all">
            {{ formData.issueContent || '-' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="议题附件" :span="2">
          <div v-if="fileList.length > 0" class="flex flex-wrap gap-2">
            <el-link
              v-for="file in fileList"
              :key="file.id"
              :href="file.url"
              target="_blank"
              type="primary"
              :underline="false"
              class="inline-flex items-center bg-blue-50 px-2 py-1 rounded"
            >
              <el-icon class="mr-1"><Document /></el-icon>
              {{ file.name }}
            </el-link>
          </div>
          <span v-else>-</span>
        </el-descriptions-item> 
        <el-descriptions-item label="创建时间"> 
          {{ (formData as any).createTime ? formatDate((formData as any).createTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ (formData as any).userName || '-' }}
        </el-descriptions-item>
        <!-- <el-descriptions-item label="更新时间">
          {{ formData.updateTime ? dateFormatter(formData.updateTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="更新人">
          {{ formData.updateBy || '-' }}
        </el-descriptions-item> -->
      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import DictTag from '@/components/DictTag/src/DictTag.vue'
import { OaMeetingIssueApi, OaMeetingIssueVO, FileAttachmentVO } from '@/api/business/oameetingissue/index.ts'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { Document } from '@element-plus/icons-vue'

/** 会议议题 详情 */
defineOptions({ name: 'OaMeetingIssueDetail' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const loading = ref(false) // 数据加载状态
const formData = ref<Partial<OaMeetingIssueVO>>({}) // 表单数据
const fileList = ref<Array<{ id: number; name: string; url: string }>>([]) // 附件列表

/** 打开详情弹窗 */
const open = async (id: number) => {
  loading.value = true
  try {
    const data = await OaMeetingIssueApi.getOaMeetingIssue(id)
    formData.value = data
    
    // 处理附件列表
    if (data.fileList && data.fileList.length > 0) {
      // 这里假设需要调用文件API获取附件详情
      // 实际实现可能需要根据后端接口调整
      fileList.value = data.fileList.map((fileId, index) => ({
        id: fileId,
        name: `附件${index + 1}`,
        url: `/api/file/download?id=${fileId}` // 假设的下载URL，需要根据实际情况调整
      }))
    } else {
      fileList.value = []
    }
    
    dialogVisible.value = true
  } catch (error) {
    message.error('获取详情失败')
    console.error('获取议题详情失败:', error)
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>
<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>