<template>
  <div>
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="议题列表" name="issues">
        <el-table :data="meetingIssues" border>
          <el-table-column prop="issueTitle" label="议题标题" min-width="200" />
          <el-table-column prop="issueType" label="议题类型" width="120">
            <template #default="{ row }">
              <dict-tag :type="DICT_TYPE.MEET_ISSUE_TYPE" :value="row.issueType" />
            </template>
          </el-table-column>
          <el-table-column prop="reporterName" label="汇报人" width="120" />
          <el-table-column label="表决进度" width="150">
            <template #default="{ row }">
              <el-progress
                :percentage="calculateVoteProgress(row)"
                :show-text="true"
                :stroke-width="12"
              />
            </template>
          </el-table-column>
          <el-table-column label="最终决议" width="120">
            <template #default="{ row }">
              <el-tag :type="getFinalResolutionType(row)">
                {{ getFinalResolutionText(row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewIssueDetail(row)">
                查看详情
              </el-button>
              <el-button
                type="success"
                link
                @click="openBatchVoteDialog(row)"
              >
                批量表决
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane
        v-for="issue in meetingIssues"
        :key="issue.id"
        :label="`议题：${issue.issueTitle}`"
        :name="`issue-${issue.id}`"
      >
        <div class="mb-4">
          <el-card class="mb-4">
            <template #header>
              <strong>议题信息</strong>
            </template>
            <el-row :gutter="20">
              <el-col :span="6"><strong>议题标题：</strong>{{ issue.issueTitle }}</el-col>
              <el-col :span="6"><strong>议题类型：</strong>
                <dict-tag :type="DICT_TYPE.MEET_ISSUE_TYPE" :value="issue.issueType" />
              </el-col>
              <el-col :span="6"><strong>汇报人：</strong>{{ issue.reporterName }}</el-col>
              <el-col :span="6"><strong>最终决议：</strong>
                <el-tag :type="getFinalResolutionType(issue)">
                  {{ getFinalResolutionText(issue) }}
                </el-tag>
              </el-col>
            </el-row>
          </el-card>

          <el-button type="primary" @click="openBatchVoteDialog(issue)">
            <Icon icon="ep:plus" />
            批量表决
          </el-button>
        </div>

        <el-table :data="meetingAttendees" border>
          <el-table-column prop="userName" label="姓名" width="120" />
          <el-table-column prop="userDepartmentName" label="部门" width="150" />
          <el-table-column prop="position" label="职务" width="150" />
          <el-table-column label="表决状态" width="150">
            <template #default="{ row }">
              <el-tag :type="getVoteStatusType(row, issue)">
                {{ getVoteStatusText(row, issue) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="表决结果" width="150">
            <template #default="{ row }">
              <span v-if="getVoteResult(row, issue)">
                <el-tag :type="getVoteResultType(getVoteResult(row, issue))">
                  {{ getVoteResultText(getVoteResult(row, issue)) }}
                </el-tag>
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="openAttendeeVoteDialog(row, issue)"
              >
                {{ hasVoted(row, issue) ? '查看表决' : '进行表决' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 参会人员对议题表决弹窗 -->
    <Dialog v-model="attendeeVoteDialogVisible" :title="`${currentVotingIssue.issueTitle} - ${currentVotingAttendee.userName}`" width="600px">
      <el-form
        ref="attendeeVoteFormRef"
        :model="attendeeVoteForm"
        :rules="attendeeVoteRules"
        label-width="100px"
      >
        <el-form-item label="议题标题">
          <el-input v-model="currentVotingIssue.issueTitle" disabled />
        </el-form-item>

        <el-form-item label="参会人员">
          <el-input v-model="currentVotingAttendee.userName" disabled />
        </el-form-item>

        <el-form-item label="表决结果" prop="voteResult" required>
          <el-radio-group v-model="attendeeVoteForm.voteResult">
            <el-radio :label="1">同意</el-radio>
            <el-radio :label="2">反对</el-radio>
            <el-radio :label="3">弃权</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="表决意见" prop="voteOpinion">
          <el-input
            v-model="attendeeVoteForm.voteOpinion"
            type="textarea"
            :rows="4"
            placeholder="请输入表决意见"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="attendeeVoteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAttendeeVote" :loading="attendeeVoteLoading">提 交</el-button>
      </template>
    </Dialog>

    <!-- 批量表决弹窗 -->
    <Dialog v-model="batchVoteDialogVisible" :title="`批量表决 - ${currentVotingIssue.issueTitle}`" width="800px">
      <el-alert title="请为以下参会人员进行表决" type="info" show-icon class="mb-4" />

      <!-- 表决统计 -->
      <el-card class="mb-4">
        <template #header>
          <strong>表决统计</strong>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="vote-statistic">
              <el-tag type="success" size="large">同意：{{ voteStatistics.agree }}人</el-tag>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="vote-statistic">
              <el-tag type="danger" size="large">反对：{{ voteStatistics.against }}人</el-tag>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="vote-statistic">
              <el-tag type="info" size="large">弃权：{{ voteStatistics.abstain }}人</el-tag>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="vote-statistic">
              <el-tag :type="getFinalResolutionType(currentVotingIssue)" size="large">
                决议：{{ getFinalResolutionText(currentVotingIssue) }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <el-table :data="unvotedAttendees" max-height="400" border>
        <el-table-column prop="userName" label="姓名" width="120" />
        <el-table-column prop="userDepartmentName" label="部门" width="150" />
        <el-table-column prop="position" label="职务" width="150" />
        <el-table-column label="表决结果" width="200">
          <template #default="{ row }">
            <el-radio-group v-model="batchVoteForm[row.id]" size="small">
              <el-radio-button :label="1" type="success">同意</el-radio-button>
              <el-radio-button :label="2" type="danger">反对</el-radio-button>
              <el-radio-button :label="3" type="info">弃权</el-radio-button>
            </el-radio-group>
          </template>
        </el-table-column>
        <el-table-column label="表决意见" width="200">
          <template #default="{ row }">
            <el-input
              v-model="batchOpinionForm[row.id]"
              size="small"
              placeholder="请输入表决意见"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4">
        <el-button type="primary" @click="addAllToBatchVote">全部同意</el-button>
        <el-button type="danger" @click="addAllToBatchVote(false)">全部反对</el-button>
        <el-button @click="clearBatchVote">清空</el-button>
      </div>

      <template #footer>
        <el-button @click="batchVoteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitBatchVote" :loading="batchVoteLoading">提 交</el-button>
      </template>
    </Dialog>

    <!-- 议题详情弹窗 -->
    <MeetingIssueDetail ref="issueDetailRef" />
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {DICT_TYPE} from '@/utils/dict'
import {Dialog} from '@/components/Dialog'
import {Icon} from '@/components/Icon'
import MeetingIssueDetail from '@/views/business/meet/meetingIssue/MeetingIssueDetail.vue'
import {useMessage} from '@/hooks/web/useMessage'

const message = useMessage()
const emit = defineEmits(['voteSuccess'])

// 表决相关
const activeTab = ref('issues')
const attendeeVoteDialogVisible = ref(false)
const batchVoteDialogVisible = ref(false)
const attendeeVoteFormRef = ref()
const attendeeVoteForm = ref({
  voteResult: undefined as number | undefined,
  voteOpinion: ''
})
const attendeeVoteRules = {
  voteResult: [{ required: true, message: '请选择表决结果', trigger: 'change' }]
}
const batchVoteLoading = ref(false)
const attendeeVoteLoading = ref(false)

// 当前表决的议题和参会人员
const currentVotingIssue = ref<any>({})
const currentVotingAttendee = ref<any>({})

// 批量表决表单
const batchVoteForm = ref<Record<number, number>>({})
const batchOpinionForm = ref<Record<number, string>>({})

// 传入的议题列表和参会人员列表
const props = defineProps({
  meetingIssues: {
    type: Array as () => any[],
    default: () => []
  },
  meetingId: {
    type: Number,
    required: true
  },
  meetingAttendees: {
    type: Array as () => any[],
    default: () => []
  }
})

// 计算未表决的参会人员
const unvotedAttendees = computed(() => {
  return props.meetingAttendees.filter(attendee => !hasVoted(attendee, currentVotingIssue.value))
})

// 计算表决统计
const voteStatistics = computed(() => {
  const statistics = {
    agree: 0,
    against: 0,
    abstain: 0
  }

  props.meetingAttendees.forEach(attendee => {
    const voteResult = getVoteResult(attendee, currentVotingIssue.value)
    if (voteResult) {
      switch (voteResult) {
        case 1: // 同意
          statistics.agree++
          break
        case 2: // 反对
          statistics.against++
          break
        case 3: // 弃权
          statistics.abstain++
          break
      }
    }
  })

  return statistics
})

// 获取投票状态类型
const getVoteStatusType = (attendee: any, issue: any) => {
  if (hasVoted(attendee, issue)) {
    return 'success'
  } else {
    return 'info'
  }
}

// 获取投票状态文本
const getVoteStatusText = (attendee: any, issue: any) => {
  if (hasVoted(attendee, issue)) {
    return '已表决'
  } else {
    return '未表决'
  }
}

// 获取表决结果类型（用于颜色标识）
const getVoteResultType = (voteResult: number) => {
  switch (voteResult) {
    case 1: // 同意
      return 'success'
    case 2: // 反对
      return 'danger'
    case 3: // 弃权
      return 'info'
    default:
      return ''
  }
}

// 检查是否已表决
const hasVoted = (attendee: any, issue: any) => {
  // 这里应该检查该参会人员是否已对这个议题进行表决
  // 在实际应用中，应该从后端获取这些信息
  // 现在我们用一个简单的模拟方式
  return attendee.votedItems && attendee.votedItems.includes(issue.id)
}

// 获取表决结果
const getVoteResult = (attendee: any, issue: any) => {
  // 这里应该返回该参会人员对该议题的表决结果
  // 在实际应用中，应该从后端获取这些信息
  return attendee.voteResults?.[issue.id] || null
}

// 获取表决结果文本
const getVoteResultText = (voteResult: number) => {
  switch (voteResult) {
    case 1: return '同意'
    case 2: return '反对'
    case 3: return '弃权'
    default: return ''
  }
}

// 获取最终决议类型（用于颜色标识）
const getFinalResolutionType = (issue: any) => {
  const statistics = calculateIssueStatistics(issue)
  // 简单多数规则：同意票数大于反对票数则通过
  if (statistics.agree > statistics.against) {
    return 'success' // 通过 - 绿色
  } else if (statistics.agree < statistics.against) {
    return 'danger' // 否决 - 红色
  } else {
    return 'warning' // 平票 - 黄色
  }
}

// 获取最终决议文本
const getFinalResolutionText = (issue: any) => {
  const statistics = calculateIssueStatistics(issue)
  // 简单多数规则：同意票数大于反对票数则通过
  if (statistics.agree > statistics.against) {
    return '通过'
  } else if (statistics.agree < statistics.against) {
    return '否决'
  } else {
    return '平票'
  }
}

// 计算议题统计信息
const calculateIssueStatistics = (issue: any) => {
  const statistics = {
    agree: 0,
    against: 0,
    abstain: 0
  }

  props.meetingAttendees.forEach(attendee => {
    const voteResult = getVoteResult(attendee, issue)
    if (voteResult) {
      switch (voteResult) {
        case 1: // 同意
          statistics.agree++
          break
        case 2: // 反对
          statistics.against++
          break
        case 3: // 弃权
          statistics.abstain++
          break
      }
    }
  })

  return statistics
}

// 计算表决进度
const calculateVoteProgress = (issue: any) => {
  if (!props.meetingAttendees.length) return 0
  const votedCount = props.meetingAttendees.filter(attendee =>
    hasVoted(attendee, issue)
  ).length
  return Math.round((votedCount / props.meetingAttendees.length) * 100)
}

// 查看议题详情
const viewIssueDetail = (issue: any) => {
  issueDetailRef.value?.open(issue.id)
}

// 打开参会人员表决弹窗
const openAttendeeVoteDialog = (attendee: any, issue: any) => {
  currentVotingIssue.value = issue
  currentVotingAttendee.value = attendee

  // 如果已表决，显示已有结果
  const voteResult = getVoteResult(attendee, issue)
  attendeeVoteForm.value = {
    voteResult: voteResult || undefined,
    voteOpinion: attendee.voteOpinions?.[issue.id] || ''
  }

  attendeeVoteDialogVisible.value = true
}

// 打开批量表决弹窗
const openBatchVoteDialog = (issue: any) => {
  currentVotingIssue.value = issue
  batchVoteDialogVisible.value = true

  // 初始化批量表决表单
  unvotedAttendees.value.forEach(attendee => {
    batchVoteForm.value[attendee.id] = 1 // 默认同意
    batchOpinionForm.value[attendee.id] = ''
  })
}

// 全部同意或反对
const addAllToBatchVote = (isAgree = true) => {
  unvotedAttendees.value.forEach(attendee => {
    batchVoteForm.value[attendee.id] = isAgree ? 1 : 2
  })
}

// 清空批量表决
const clearBatchVote = () => {
  unvotedAttendees.value.forEach(attendee => {
    batchVoteForm.value[attendee.id] = 0
    batchOpinionForm.value[attendee.id] = ''
  })
}

// 提交参会人员表决
const submitAttendeeVote = async () => {
  if (!attendeeVoteFormRef.value) return

  try {
    await attendeeVoteFormRef.value.validate()

    attendeeVoteLoading.value = true

    // 更新本地数据
    if (!currentVotingAttendee.value.votedItems) {
      currentVotingAttendee.value.votedItems = []
    }

    if (!currentVotingAttendee.value.voteResults) {
      currentVotingAttendee.value.voteResults = {}
    }

    if (!currentVotingAttendee.value.voteOpinions) {
      currentVotingAttendee.value.voteOpinions = {}
    }

    // 记录表决信息
    if (!currentVotingAttendee.value.votedItems.includes(currentVotingIssue.value.id)) {
      currentVotingAttendee.value.votedItems.push(currentVotingIssue.value.id)
    }

    currentVotingAttendee.value.voteResults[currentVotingIssue.value.id] = attendeeVoteForm.value.voteResult
    currentVotingAttendee.value.voteOpinions[currentVotingIssue.value.id] = attendeeVoteForm.value.voteOpinion

    // 这里应该调用API提交表决结果
    // await OaMeetingApi.submitVote({
    //   meetingId: props.meetingId,
    //   issueId: currentVotingIssue.value.id,
    //   attendeeId: currentVotingAttendee.value.id,
    //   voteResult: attendeeVoteForm.value.voteResult,
    //   voteOpinion: attendeeVoteForm.value.voteOpinion
    // })

    message.success('表决提交成功')
    attendeeVoteDialogVisible.value = false

    // 通知父组件表决成功
    emit('voteSuccess', {
      issue: currentVotingIssue.value,
      attendee: currentVotingAttendee.value,
      voteData: attendeeVoteForm.value
    })
  } catch (err) {
    console.error('提交表决失败:', err)
    message.error('提交表决失败')
  } finally {
    attendeeVoteLoading.value = false
  }
}

// 提交批量表决
const submitBatchVote = async () => {
  try {
    batchVoteLoading.value = true

    // 收集批量表决数据
    const voteDataList = unvotedAttendees.value
      .filter(attendee => batchVoteForm.value[attendee.id])
      .map(attendee => ({
        attendeeId: attendee.id,
        voteResult: batchVoteForm.value[attendee.id],
        voteOpinion: batchOpinionForm.value[attendee.id] || ''
      }))

    if (voteDataList.length === 0) {
      message.warning('请至少为一名参会人员进行表决')
      return
    }

    // 这里应该调用API提交批量表决结果
    // await OaMeetingApi.submitBatchVote({
    //   meetingId: props.meetingId,
    //   issueId: currentVotingIssue.value.id,
    //   voteDataList
    // })

    // 更新本地数据
    voteDataList.forEach(voteData => {
      const attendee = props.meetingAttendees.find(a => a.id === voteData.attendeeId)
      if (attendee) {
        if (!attendee.votedItems) {
          attendee.votedItems = []
        }

        if (!attendee.voteResults) {
          attendee.voteResults = {}
        }

        if (!attendee.voteOpinions) {
          attendee.voteOpinions = {}
        }

        // 记录表决信息
        if (!attendee.votedItems.includes(currentVotingIssue.value.id)) {
          attendee.votedItems.push(currentVotingIssue.value.id)
        }

        attendee.voteResults[currentVotingIssue.value.id] = voteData.voteResult
        attendee.voteOpinions[currentVotingIssue.value.id] = voteData.voteOpinion
      }
    })

    message.success('批量表决提交成功')
    batchVoteDialogVisible.value = false

    // 通知父组件表决成功
    emit('voteSuccess', {
      issue: currentVotingIssue.value,
      voteDataList
    })
  } catch (err) {
    console.error('提交批量表决失败:', err)
    message.error('提交批量表决失败')
  } finally {
    batchVoteLoading.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  viewIssueDetail
})
</script>

<style scoped>
.vote-statistic {
  text-align: center;
  padding: 10px 0;
}
</style>
