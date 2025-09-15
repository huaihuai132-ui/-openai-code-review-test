<template>
  <ContentWrap>
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">发起会议申请</span>
          <el-button @click="goBack" type="primary" link>
            <Icon icon="ep:arrow-left" class="mr-1" />
            返回
          </el-button>
        </div>
      </template>

      <div v-loading="formLoading">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          :disabled="isFormDisabled"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="会议名称" prop="meetName">
                <el-input v-model="formData.meetName" placeholder="请输入会议名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="会议类型" prop="meetType">
                <el-select v-model="formData.meetType" placeholder="请选择会议类型" style="width: 100%">
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.MEET_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="会议日期" prop="meetDate">
                <el-date-picker
                  v-model="formData.meetDate"
                  type="date"
                  value-format="x"
                  placeholder="选择会议日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="会议室" prop="meetRoomId">
                <el-select v-model="formData.meetRoomId" placeholder="请选择会议室" style="width: 100%">
                  <el-option
                    v-for="room in meetingRooms"
                    :key="room.id"
                    :label="room.roomName + ' - ' + room.location"
                    :value="room.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="startTime">
                <el-time-picker
                  v-model="formData.startTime"
                  value-format="x"
                  placeholder="选择开始时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间" prop="endTime">
                <el-time-picker
                  v-model="formData.endTime"
                  value-format="x"
                  placeholder="选择结束时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="会议事由" prop="reason">
                <el-input v-model="formData.reason" placeholder="请输入会议事由" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="会议概述" prop="description">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入会议概述"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="会议附件" prop="fileList">
            <BatchFileUpload
              ref="batchUploadRef"
              v-model:fileList="formData.fileList"
              mode="create"
              file-type="common"
              directory="meeting"
              :max-files="5"
              tip="支持批量上传多个文件，最多5个"
            />
          </el-form-item>

          <el-form-item label="参会人员">
            <div class="mb-4">
              <el-button type="primary" @click="openUserSelectDialog">
                <Icon icon="ep:plus" />
                添加参会人员
              </el-button>
            </div>
            <el-table :data="formData.attendeeList" border style="width: 100%" empty-text="暂无参会人员">
              <el-table-column prop="userName" label="用户名称" width="180" />
              <el-table-column prop="userDepartmentName" label="部门" sortable />
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button type="danger" link @click="removeParticipant(row)">
                    <Icon icon="ep:delete" />
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 用户选择弹窗 -->
            <UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelected" />
          </el-form-item>

          <el-form-item label="会议议题">
            <div class="mb-4">
              <el-button type="primary" @click="openIssueSelectDialog">
                <Icon icon="ep:plus" />
                添加会议议题
              </el-button>
            </div>
            <el-table :data="formData.issueList" border style="width: 100%" empty-text="暂无会议议题">
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
          </el-form-item>
        </el-form>

        <div class="flex justify-center gap-4 mt-6">
          <el-button type="primary" @click="submitForm" :loading="submitLoading">
            提交申请
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </div>
      </div>
    </el-card>
  </ContentWrap>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useMessage} from '@/hooks/web/useMessage'
import {DICT_TYPE, getStrDictOptions} from '@/utils/dict'
import {OaMeetingApi} from 'src/api/business/meet/meeting'
import {OaMeetingRoomApi} from 'src/api/business/meet/meetingRoom'
import {OaMeetingIssueApi} from 'src/api/business/meet/meetingIssue'
import {BatchFileUpload} from '@/components/UploadFile'
import UserSelectForm from '@/components/UserSelectForm/index.vue'
import Dialog from '@/components/Dialog/src/Dialog.vue'
import DictTag from '@/components/DictTag/src/DictTag.vue'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'
import {handleTree} from '@/utils/tree'
import MeetingIssueDetail from '@/views/business/meet/meetingIssue/MeetingIssueDetail.vue'

defineOptions({ name: 'OaMeetingCreate' })

const router = useRouter()
const message = useMessage()

// 表单相关
const formRef = ref()
const formLoading = ref(false)
const submitLoading = ref(false)
const batchUploadRef = ref<typeof BatchFileUpload>()
const userSelectFormRef = ref<typeof UserSelectForm>()
const issueDetailRef = ref<typeof MeetingIssueDetail>()

// 表单数据
const formData = ref({
  meetName: '',
  meetType: undefined,
  meetDate: undefined,
  startTime: undefined,
  endTime: undefined,
  meetRoomId: undefined,
  reason: '',
  description: '',
  fileList: [] as (number | string)[],
  attendeeList: [] as any[],
  issueList: [] as any[]
})

// 表单验证规则
const formRules = reactive({
  meetName: [{ required: true, message: '会议名称不能为空', trigger: 'blur' }],
  meetType: [{ required: true, message: '会议类型不能为空', trigger: 'change' }],
  meetDate: [{ required: true, message: '会议日期不能为空', trigger: 'change' }],
  meetRoomId: [{ required: true, message: '请选择会议室', trigger: 'change' }],
  startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
  endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
  reason: [{ required: true, message: '会议事由不能为空', trigger: 'blur' }]
})

// 会议室列表
const meetingRooms = ref<any[]>([])

// 议题相关
const issueDialogVisible = ref(false)
const issueLoading = ref(false)
const availableIssues = ref<any[]>([])
const queryForm = ref({
  issueTitle: '',
  meetingType: undefined as number | string | undefined
})
const meetingTypeOptions = ref<{ label: string; value: number }[]>([])

// 用户和部门数据
const userList = ref<any[]>([])
const deptList = ref<Tree[]>([])

// 是否禁用表单（提交后）
const isFormDisabled = ref(false)

/** 返回上一页 */
const goBack = () => {
  router.back()
}

/** 获取会议室列表 */
const getMeetingRooms = async () => {
  try {
    const data = await OaMeetingRoomApi.getOaMeetingRoomPage({
      pageNo: 1,
      pageSize: 100,
      meetingRoomStatus: 1
    })
    meetingRooms.value = data.list || []
  } catch (error) {
    console.error('获取会议室列表失败:', error)
    message.error('获取会议室列表失败')
  }
}

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
  const options = getStrDictOptions(DICT_TYPE.MEET_TYPE)
  meetingTypeOptions.value = options.map(option => ({
    label: option.label,
    value: Number(option.value)
  }))
}

/** 打开用户选择弹窗 */
const openUserSelectDialog = () => {
  userSelectFormRef.value?.open(0, formData.value.attendeeList)
}

/** 处理用户选择确认 */
const handleUserSelected = (_id: any, userList: any[]) => {
  formData.value.attendeeList = [...userList]
}

/** 移除参会人员 */
const removeParticipant = (row: any) => {
  const index = formData.value.attendeeList.findIndex((item) => item.id === row.id)
  if (index > -1) {
    formData.value.attendeeList.splice(index, 1)
  }
}

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
      status: 2, // 已审核状态
      issueTitle: queryForm.value.issueTitle,
      meetingType: queryForm.value.meetingType
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
    meetingType: undefined
  }
  loadAvailableAgendaTopics()
}

/** 检查议题是否已选择 */
const isIssueSelected = (issueId: string | number) => {
  return formData.value.issueList.some((item) => item.id === issueId)
}

/** 选择议题 */
const selectAgendaTopic = (topic: any) => {
  if (!isIssueSelected(topic.id)) {
    formData.value.issueList.push({ ...topic })
  }
  issueDialogVisible.value = false
}

/** 移除会议议题 */
const removeAgenda = (row: any) => {
  const index = formData.value.issueList.findIndex((item) => item.id === row.id)
  if (index > -1) {
    formData.value.issueList.splice(index, 1)
  }
}

/** 打开议题详情弹窗 */
const openIssueDetail = async (issueId: number) => {
  issueDetailRef.value?.open(issueId)
}

/** 提交表单 */
const submitForm = async () => {
  if (!formRef.value) return

  try {
    // 验证表单
    await formRef.value.validate()

    // 验证文件上传
    const hasFiles = formData.value.fileList && formData.value.fileList.length > 0
    if (hasFiles && batchUploadRef.value) {
      const fileValidation = batchUploadRef.value.validateFiles?.()
      if (fileValidation && !fileValidation.valid) {
        message.error(fileValidation.message)
        return
      }
    }

    // 设置提交状态
    submitLoading.value = true
    isFormDisabled.value = true

    // 准备提交数据
    const submitData = {
      ...formData.value,
      // 将文件列表转换为逗号分隔的字符串
      fileList: formData.value.fileList.join(',')
    }

    // 提交数据
    await OaMeetingApi.createOaMeeting(submitData)
    message.success('会议申请提交成功')

    // 标记文件为已保存
    if (hasFiles && batchUploadRef.value) {
      batchUploadRef.value.markFilesAsSaved?.()
    }

    // 返回上一页
    goBack()
  } catch (error) {
    console.error('提交失败:', error)
    message.error('提交失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

/** 初始化数据 */
onMounted(async () => {
  formLoading.value = true
  try {
    // 并行加载所需数据
    await Promise.all([
      getMeetingRooms(),
      getUserList(),
      getDeptList()
    ])

    // 获取会议类型选项
    getMeetingTypeOptions()
  } catch (error) {
    console.error('初始化数据失败:', error)
    message.error('初始化数据失败')
  } finally {
    formLoading.value = false
  }
})
</script>

<style scoped>
:deep(.el-card__header) {
  border-bottom: 1px solid var(--el-border-color);
  padding: 15px 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
