<template>
  <div class="py-4">
    <div class="mb-4">
      <el-button type="primary" @click="openIssueSelectDialog">
        <Icon icon="ep:plus" />
        添加会议议题
      </el-button>
    </div>
    <el-table :data="issues" border style="width: 100%" empty-text="暂无会议议题">
      <el-table-column prop="issueNo" label="议题编号" width="180" />
      <el-table-column prop="issueTitle" label="议题标题" min-width="200" />
      <el-table-column prop="issueType" label="议题类型" width="100" />
      <el-table-column prop="meetingType" label="上会类型" width="100" />
      <el-table-column prop="description" label="议题概述" min-width="300" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="previewAgendaAttachments(row)">
            <Icon icon="ep:view" />
            查看附件
          </el-button>
          <el-button type="danger" link @click="removeAgenda(row)">
            <Icon icon="ep:delete" />
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 议题选择弹窗 -->
    <Dialog v-model="issueDialogVisible" title="选择会议议题" width="800">
      <div v-loading="issueLoading" class="px-4">
        <el-table :data="availableIssues" border style="width: 100%" empty-text="暂无可用议题">
          <el-table-column prop="issueNo" label="议题编号" width="120" />
          <el-table-column prop="issueTitle" label="议题标题" min-width="200" />
          <el-table-column prop="issueType" label="议题类型" width="100" />
          <el-table-column prop="meetingType" label="上会类型" width="100" />
          <el-table-column
            prop="description"
            label="议题概述"
            min-width="300"
            show-overflow-tooltip
          />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="selectAgendaTopic(row)"
                :disabled="isIssueSelected(row.id)"
              >
                <Icon icon="ep:plus" />
                {{ isIssueSelected(row.id) ? '已选择' : '选择' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="issueDialogVisible = false">取 消</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { OaMeetingIssueVO } from '@/api/business/oameetingissue'
import { computed, ref } from 'vue'
import { useMessage } from '@/hooks/web/useMessage'
import { OaMeetingIssueApi } from '@/api/business/oameetingissue'

interface Props {
  issues: OaMeetingIssueVO[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:issues'])

const message = useMessage()

const issues = computed({
  get: () => props.issues,
  set: (value) => emit('update:issues', value)
})

const issueDialogVisible = ref(false)
const issueLoading = ref(false)
const availableIssues = ref<OaMeetingIssueVO[]>([])

/** 打开议题选择弹窗 */
const openIssueSelectDialog = async () => {
  issueDialogVisible.value = true
  await loadAvailableAgendaTopics()
}

/** 加载可用的议题列表 */
const loadAvailableAgendaTopics = async () => {
  issueLoading.value = true
  try {
    // 调用API获取未关联会议的已审核议题
    const response = await OaMeetingIssueApi.getOaMeetingIssuePage({
      pageNo: 1,
      pageSize: 100,
      status: 2 // 已审核状态
    })
    availableIssues.value = response.list || []
  } catch (error) {
    console.error('加载议题列表失败:', error)
    message.error('加载议题列表失败')
  } finally {
    issueLoading.value = false
  }
}

/** 检查议题是否已选择 */
const isIssueSelected = (issueId: string | number) => {
  return issues.value.some((item) => item.id === issueId)
}

/** 选择议题 */
const selectAgendaTopic = (topic: OaMeetingIssueVO) => {
  if (!isIssueSelected(topic.id)) {
    issues.value.push({ ...topic })
  }
  issueDialogVisible.value = false
}

/** 移除会议议题 */
const removeAgenda = (row: OaMeetingIssueVO) => {
  const index = issues.value.findIndex((item) => item.id === row.id)
  if (index > -1) {
    issues.value.splice(index, 1)
  }
}

/** 预览议题附件 */
const previewAgendaAttachments = (row: OaMeetingIssueVO) => {
  const fileList = JSON.parse(row.fileList)
  if (fileList && fileList.length > 0) {
    message.info(`议题 "${row.issueTitle}" 共有 ${row.fileList.length} 个附件`)
  } else {
    message.info('该议题暂无附件')
  }
}
</script>
