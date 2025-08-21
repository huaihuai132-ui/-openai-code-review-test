<template>
  <div class="agenda-manager">
    <div class="tab-header">
      <el-button type="primary" @click="openIssueSelectDialog">
        <Icon icon="ep:plus" />
        添加会议议题
      </el-button>
    </div>
    <el-table :data="issues" border style="width: 100%" empty-text="暂无会议议题">
      <el-table-column prop="topicCode" label="议题编号" width="120" />
      <el-table-column prop="topicTitle" label="议题标题" min-width="200" />
      <el-table-column prop="topicType" label="议题类型" width="100" />
      <el-table-column prop="meetingType" label="上会类型" width="100" />
      <el-table-column
        prop="topicSummary"
        label="议题概述"
        min-width="300"
        show-overflow-tooltip
      />
      <el-table-column label="操作" width="120" fixed="right">
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
    <Dialog v-model="agendaDialogVisible" title="选择会议议题" width="800">
      <div v-loading="agendaLoading" class="agenda-select-dialog">
        <el-table :data="availableAgendaTopics" border style="width: 100%" empty-text="暂无可用议题">
          <el-table-column prop="topicCode" label="议题编号" width="120" />
          <el-table-column prop="topicTitle" label="议题标题" min-width="200" />
          <el-table-column prop="topicType" label="议题类型" width="100" />
          <el-table-column prop="meetingType" label="上会类型" width="100" />
          <el-table-column
            prop="topicSummary"
            label="议题概述"
            min-width="300"
            show-overflow-tooltip
          />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="selectAgendaTopic(row)">
                <Icon icon="ep:plus" />
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="agendaDialogVisible = false">取 消</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Issue } from './types'
import { computed, ref } from 'vue'
import { useMessage } from '@/hooks/web/useMessage'

interface Props {
  issues: Issue[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:issues'])

const message = useMessage()

const issues = computed({
  get: () => props.issues,
  set: (value) => emit('update:issues', value)
})

const agendaDialogVisible = ref(false)
const agendaLoading = ref(false)
const availableAgendaTopics = ref<Issue[]>([])

/** 打开议题选择弹窗 */
const openIssueSelectDialog = async () => {
  agendaDialogVisible.value = true
  await loadAvailableAgendaTopics()
}

/** 加载可用的议题列表 */
const loadAvailableAgendaTopics = async () => {
  agendaLoading.value = true
  try {
    // 这里需要根据实际情况调用API获取未关联会议的已审核议题
    // 模拟数据，实际项目中应调用真实API
    const mockTopics: Issue[] = [
      {
        id: 1,
        topicCode: 'TOPIC-2024-001',
        topicTitle: '年度预算审议',
        topicType: '财务类',
        meetingType: '董事会',
        topicSummary: '审议公司2024年度预算方案，包括收入、支出、投资等各项预算指标',
        attachments: [
          { id: 1, name: '2024年度预算报告.pdf', url: '/files/budget-2024.pdf' },
          { id: 2, name: '预算明细表.xlsx', url: '/files/budget-details.xlsx' }
        ]
      },
      {
        id: 2,
        topicCode: 'TOPIC-2024-002',
        topicTitle: '新产品研发计划',
        topicType: '技术类',
        meetingType: '技术委员会',
        topicSummary: '讨论2024年新产品研发方向和技术路线，包括AI产品线扩展计划',
        attachments: [{ id: 3, name: '产品路线图.pdf', url: '/files/product-roadmap.pdf' }]
      }
    ]
    availableAgendaTopics.value = mockTopics
  } catch (error) {
    console.error('加载议题列表失败:', error)
    message.error('加载议题列表失败')
  } finally {
    agendaLoading.value = false
  }
}

/** 选择议题 */
const selectAgendaTopic = (topic: Issue) => {
  if (!issues.value.find((item) => item.id === topic.id)) {
    issues.value.push({ ...topic })
  }
  agendaDialogVisible.value = false
}

/** 移除会议议题 */
const removeAgenda = (row: Issue) => {
  const index = issues.value.findIndex((item) => item.id === row.id)
  if (index > -1) {
    issues.value.splice(index, 1)
  }
}

/** 预览议题附件 */
const previewAgendaAttachments = (row: Issue) => {
  if (row.attachments && row.attachments.length > 0) {
    message.info(`议题 "${row.topicTitle}" 共有 ${row.attachments.length} 个附件`)
  } else {
    message.info('该议题暂无附件')
  }
}
</script>

<style scoped>
.agenda-manager {
  padding: 16px 0;
}

.tab-header {
  margin-bottom: 16px;
}

.agenda-select-dialog {
  padding: 0 16px;
}
</style>
