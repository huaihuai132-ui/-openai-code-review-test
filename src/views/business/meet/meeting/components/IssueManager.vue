<template>
  <div class="py-4">
    <div class="mb-4">
      <el-button
        type="primary"
        @click="openIssueSelectDialog"
        :disabled="isMeetingTypeRequired && !props.meetingType"
      >
        <Icon icon="ep:plus" />
        添加会议议题
      </el-button>
      <div
        v-if="isMeetingTypeRequired && !props.meetingType"
        class="text-sm text-red-500 mt-2"
      >
        请先选择会议类型
      </div>
    </div>
    <el-table :data="issues" border style="width: 100%" empty-text="暂无会议议题">
      <el-table-column label="序号" width="150">
        <template #default="{ row, $index }">
          <div class="flex items-center">
            <el-input-number
              v-model="row.tempIndex"
              :min="1"
              :max="issues.length"
              controls-position="right"
              size="small"
              class="mr-2"
              @change="handleIndexChange(row, $index)"
            />
            <el-button type="primary" link @click="moveUp($index)" :disabled="$index === 0">
              <Icon icon="ep:arrow-up" />
            </el-button>
            <el-button type="primary" link @click="moveDown($index)" :disabled="$index === issues.length - 1">
              <Icon icon="ep:arrow-down" />
            </el-button>
          </div>
        </template>
      </el-table-column>
<!--      <el-table-column prop="issueNo" label="议题编号" width="180" />-->
      <el-table-column prop="issueTitle" label="议题标题" min-width="200">
        <template #default="{ row }">
          <span
            class="text-blue-500 cursor-pointer hover:underline"
            @click="openIssueDetail(row.id)"
          >
            {{ row.issueTitle }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="issueType" label="议题类型" width="100">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.MEET_ISSUE_TYPE" :value="row.issueType" />
        </template>
      </el-table-column>
      <el-table-column prop="meetingType" label="上会类型" width="100">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.MEET_TYPE" :value="row.meetingType" />
        </template>
      </el-table-column>
      <el-table-column label="上会状态" align="center" prop="issueStatus" width="120px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.ISSUE_STATUS" :value="scope.row.issueStatus" />
        </template>
      </el-table-column>
      <el-table-column prop="reporter" label="汇报人" width="80">
        <template #default="{ row }">
          {{ getUserName(row.reporterId) }}
        </template>
      </el-table-column>
      <el-table-column prop="relevantDept" label="相关部门" width="150">
        <template #default="{ row }">
          {{ getDeptNames(row.relevantDept) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="议题概述" min-width="300" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" width="100">
        <template #default="{ row }">
          <el-button type="danger" link @click="removeAgenda(row)">
            <Icon icon="ep:delete" />
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 议题选择弹窗 -->
    <Dialog v-model="issueDialogVisible" title="选择会议议题" width="800">
      <div class="px-4 mb-4">
        <el-form :model="queryForm" label-width="80px" class="flex flex-wrap gap-4">
          <el-form-item label="议题名称">
            <el-input
              v-model="queryForm.issueTitle"
              placeholder="请输入议题名称"
              clearable
              class="!w-240px"
              @keyup.enter="loadAvailableAgendaTopics"
            />
          </el-form-item>
          <el-form-item label="会议类型">
            <el-select
              v-if="!props.meetingType"
              v-model="queryForm.meetingType"
              placeholder="请选择会议类型"
              clearable
              class="!w-240px"
            >
              <el-option
                v-for="item in meetingTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-input
              v-else
              :value="lockedMeetingTypeName"
              disabled
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadAvailableAgendaTopics">
              <Icon icon="ep:search" />
              搜索
            </el-button>
            <el-button @click="resetQuery">
              <Icon icon="ep:refresh" />
              重置
            </el-button>
          </el-form-item>
        </el-form>
        <div v-if="props.meetingType" class="text-sm text-gray-500 mb-2">
          当前会议类型已锁定，仅显示匹配的议题
        </div>
      </div>
      <div v-loading="issueLoading" class="px-4">
        <el-table :data="availableIssues" border style="width: 100%" empty-text="暂无可用议题">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="issueNo" label="议题编号" width="120" />
          <el-table-column prop="issueTitle" label="议题标题" min-width="200" />
          <el-table-column prop="issueType" label="议题类型" width="100">
            <template #default="{ row }">
              <dict-tag :type="DICT_TYPE.MEET_ISSUE_TYPE" :value="row.issueType" />
            </template>
          </el-table-column>
          <el-table-column prop="meetingType" label="上会类型" width="100">
            <template #default="{ row }">
              <dict-tag :type="DICT_TYPE.MEET_TYPE" :value="row.meetingType" />
            </template>
          </el-table-column>
          <el-table-column prop="reporter" label="汇报人" width="80">
            <template #default="{ row }">
              {{ getUserName(row.reporterId) }}
            </template>
          </el-table-column>
          <el-table-column prop="relevantDept" label="相关部门" width="150">
            <template #default="{ row }">
              {{ getDeptNames(row.relevantDept) }}
            </template>
          </el-table-column>
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

    <!-- 议题详情弹窗 -->
    <MeetingIssueDetail ref="issueDetailRef" />
  </div>
</template>

<script setup lang="ts">
import type {OaMeetingIssueVO} from '@/api/business/meet/meetingIssue'
import {OaMeetingIssueApi} from '@/api/business/meet/meetingIssue'
import {computed, onMounted, ref, watch} from 'vue'
import {useMessage} from '@/hooks/web/useMessage'
import {DICT_TYPE, getDictLabel, getDictOptions} from '@/utils/dict'
import DictTag from '../../../../../components/DictTag/src/DictTag.vue'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import {handleTree} from '@/utils/tree'
import MeetingIssueDetail from '@/views/business/meet/meetingIssue/MeetingIssueDetail.vue'

interface Props {
  issues: OaMeetingIssueVO[]
  meetingType?: number | string // 添加会议类型属性
  meetingId?: number // 添加会议ID属性
}

const props = defineProps<Props>()
const emit = defineEmits(['update:issues', 'addAttendee'])

const message = useMessage()

// 是否要求必须选择会议类型
const isMeetingTypeRequired = true

const issues = computed({
  get: () => props.issues,
  set: (value) => emit('update:issues', value)
})

const issueDialogVisible = ref(false)
const issueLoading = ref(false)
const availableIssues = ref<OaMeetingIssueVO[]>([])

// 议题详情弹窗相关
const issueDetailRef = ref()

// 查询表单
const queryForm = ref({
  issueTitle: '',
  meetingType: undefined as number | string | undefined
})

// 会议类型选项
const meetingTypeOptions = ref<{ label: string; value: number }[]>([])

// 锁定的会议类型名称
const lockedMeetingTypeName = computed(() => {
  if (props.meetingType !== undefined) {
    return getDictLabel(DICT_TYPE.MEET_TYPE, props.meetingType)
  }
  return ''
})

// 用户列表
const userList = ref<any[]>([])

// 部门列表
const deptList = ref<Tree[]>([])

/** 获取用户列表 */
const getUserList = async () => {
  try {
    const data = await UserApi.getSimpleUserList()
    userList.value = data
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

/** 获取部门树 */
const getDeptList = async () => {
  try {
    const data = await DeptApi.getSimpleDeptList()
    deptList.value = handleTree(data)
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

/** 根据用户ID获取用户昵称 */
const getUserName = (userId: number | undefined) => {
  if (!userId) return ''
  const user = userList.value.find(u => u.id === userId)
  return user ? user.nickname : ''
}

/** 根据部门ID获取部门名称（支持多个部门） */
const getDeptNames = (deptIds: string | string[] | undefined) => {
  if (!deptIds) return '-'

  let ids: string[] = []

  // 统一处理输入为字符串或数组的情况
  if (typeof deptIds === 'string') {
    // 去除两边的方括号并按逗号分割
    ids = deptIds.replace(/[\[\]]/g, '').split(',').map(id => id.trim()).filter(Boolean)
  } else if (Array.isArray(deptIds)) {
    ids = deptIds.map(id => String(id))
  }

  if (ids.length === 0) return '-'

  // 递归查找树中的部门
  const findDeptInTree = (tree: Tree[], id: string): Tree | undefined => {
    for (const node of tree) {
      if (String(node.id) === id) {
        return node
      }
      if (node.children && node.children.length > 0) {
        const found = findDeptInTree(node.children, id)
        if (found) {
          return found
        }
      }
    }
    return undefined
  }

  const deptNames = ids.map(id => {
    const dept = findDeptInTree(deptList.value, id)
    return dept ? dept.name : `未知部门(${id})`
  })

  return deptNames.join(', ')
}

/** 获取会议类型选项 */
const getMeetingTypeOptions = () => {
  const options = getDictOptions(DICT_TYPE.MEET_TYPE)
  meetingTypeOptions.value = options.map(option => ({
    label: option.label,
    value: Number(option.value)
  }))
}

/** 打开议题详情弹窗 */
const openIssueDetail = async (issueId: number) => {
  issueDetailRef.value?.open(issueId)
}

/** 打开议题选择弹窗 */
const openIssueSelectDialog = async () => {
  // 检查是否必须选择会议类型但未选择
  if (isMeetingTypeRequired && !props.meetingType) {
    message.warning('请先选择会议类型')
    return
  }

  issueDialogVisible.value = true
  console.log("--------------"+props.meetingType)
  // 设置会议类型筛选条件
  if (props.meetingType !== undefined) {
    queryForm.value.meetingType = props.meetingType
  }
  await loadAvailableAgendaTopics()
}

/** 加载可用的议题列表 */
const loadAvailableAgendaTopics = async () => {
  issueLoading.value = true
  console.log("meetingId================"+props.meetingId)
  try {
    // 调用API获取未关联会议的已审核议题
    const response = await OaMeetingIssueApi.waitMeeting({
      pageNo: 1,
      pageSize: 100,
      status: 2, // 已审核状态
      issueTitle: queryForm.value.issueTitle,
      meetingType: queryForm.value.meetingType,
      meetingId: props.meetingId, // 添加meetingId参数
      onlyUnEnd:  true
    })
    availableIssues.value = response.list || []
  } catch (error) {
    console.error('加载议题列表失败:', error)
    message.error('加载议题列表失败')
  } finally {
    issueLoading.value = false
  }
}

/** 重置查询条件 */
const resetQuery = () => {
  queryForm.value = {
    issueTitle: '',
    meetingType: props.meetingType !== undefined ? props.meetingType : undefined
  }
  loadAvailableAgendaTopics()
}

/** 检查议题是否已选择 */
const isIssueSelected = (issueId: string | number) => {
  return issues.value.some((item) => item.id === issueId)
}

/** 选择议题 */
const selectAgendaTopic = (topic: OaMeetingIssueVO) => {
  if (!isIssueSelected(topic.id)) {
    // 添加临时索引用于排序
    const newTopic = { ...topic, tempIndex: issues.value.length + 1 }
    issues.value.push(newTopic)

    // 将议题的汇报人添加到参会人员列表中
    if (topic.reporterId) {
      // 通过emit通知父组件添加参会人员
      emit('addAttendee', {
        userId: topic.reporterId,
        userName: getUserName(topic.reporterId),
        userDepartmentId: 0,
        userDepartmentName: ''
      });
    }
  }
  issueDialogVisible.value = false
}

/** 移除会议议题 */
const removeAgenda = (row: OaMeetingIssueVO) => {
  const index = issues.value.findIndex((item) => item.id === row.id)
  if (index > -1) {
    issues.value.splice(index, 1)
    // 重新设置临时索引
    updateTempIndex()
  }
}

/** 上移议题 */
const moveUp = (index: number) => {
  if (index > 0) {
    const temp = issues.value[index]
    issues.value[index] = issues.value[index - 1]
    issues.value[index - 1] = temp
    updateTempIndex()
  }
}

/** 下移议题 */
const moveDown = (index: number) => {
  if (index < issues.value.length - 1) {
    const temp = issues.value[index]
    issues.value[index] = issues.value[index + 1]
    issues.value[index + 1] = temp
    updateTempIndex()
  }
}

/** 更新临时索引 */
const updateTempIndex = () => {
  issues.value.forEach((item, index) => {
    item.tempIndex = index + 1
    // 同时更新meetingOrder字段
    item.meetingOrder = index + 1
  })
}

/** 处理序号变化 */
const handleIndexChange = (row: OaMeetingIssueVO, oldIndex: number) => {
  if (row.tempIndex !== undefined && row.tempIndex !== null) {
    // 确保索引在有效范围内
    row.tempIndex = Math.max(1, Math.min(issues.value.length, row.tempIndex))

    // 计算新位置
    const newIndex = row.tempIndex - 1

    if (newIndex !== oldIndex) {
      // 移除元素
      const [movedItem] = issues.value.splice(oldIndex, 1)
      // 插入到新位置
      issues.value.splice(newIndex, 0, movedItem)
      // 更新临时索引
      updateTempIndex()
    }
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

// 监听议题列表变化，初始化临时索引
watch(
  () => props.issues,
  (newIssues) => {
    if (newIssues && newIssues.length > 0) {
      // 初始化tempIndex字段
      newIssues.forEach((item) => {
        // 如果已经有meetingOrder字段，则使用它作为初始tempIndex
        if (item.meetingOrder !== undefined && item.meetingOrder !== null) {
          // 处理字符串类型的meetingOrder
          const order = typeof item.meetingOrder === 'string' ? parseInt(item.meetingOrder, 10) : item.meetingOrder
          item.tempIndex = isNaN(order) ? newIssues.indexOf(item) + 1 : order
        } else {
          // 如果没有meetingOrder字段，则使用在列表中的位置
          item.tempIndex = newIssues.indexOf(item) + 1
        }
      })

      // 然后根据tempIndex排序
      newIssues.sort((a, b) => {
        const indexA = a.tempIndex || 0
        const indexB = b.tempIndex || 0
        return indexA - indexB
      })

      // 最后重新分配连续的序号
      updateTempIndex()
    }
  },
  { immediate: true }
)

// 组件挂载时加载用户和部门数据
onMounted(async () => {
  await Promise.all([getUserList(), getDeptList()])
  getMeetingTypeOptions()
})
</script>
