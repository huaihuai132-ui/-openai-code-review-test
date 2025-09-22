<template>
  <el-dialog v-model="dialogVisible" title="请假申请打印预览" width="900px" :before-close="handleClose">
    <div class="print-content" ref="printRef">
      <!-- 表单标题 -->
      <div class="form-header">
        <h2 class="form-title">请假申请单</h2>
      </div>

      <!-- 表格内容 -->
      <table class="approval-table">
        <tr>
          <td class="label-cell">部门</td>
          <td class="value-cell">{{ deptName || leaveData.deptName || '获取中...' }}</td>
          <td class="label-cell">申请日期</td>
          <td class="date-cell">
            {{ formatDate(leaveData.createTime || new Date(), 'YYYY') }}年
            {{ formatDate(leaveData.createTime || new Date(), 'MM') }}月
            {{ formatDate(leaveData.createTime || new Date(), 'DD') }}日
          </td>
        </tr>
        <tr>
          <td class="label-cell">申请人</td>
          <td class="value-cell">{{ nickname || leaveData.nickname || leaveData.creator || '' }}</td>
          <td class="label-cell">剩余年假</td>
          <td class="value-cell">{{ leaveData.leftLeaveDays }} 天</td>
        </tr>
        <tr>
          <td class="label-cell">请假类型</td>
          <td class="value-cell">
            <dict-tag :type="DICT_TYPE.BPM_OA_LEAVE_TYPE" :value="leaveData.type" />
          </td>
          <td class="label-cell">请假天数</td>
          <td class="value-cell">{{ leaveData.duration }} 天</td>
        </tr>
        <tr>
          <td class="label-cell">请假时间</td>
          <td class="time-cell" colspan="3">
            从 {{ formatLeaveDate(leaveData.startTime, 'YYYY') }} 年 {{ formatLeaveDate(leaveData.startTime, 'MM') }} 月 {{ formatLeaveDate(leaveData.startTime, 'DD') }} 日
            至 {{ formatLeaveDate(leaveData.endTime, 'YYYY') }} 年 {{ formatLeaveDate(leaveData.endTime, 'MM') }} 月 {{ formatLeaveDate(leaveData.endTime, 'DD') }} 日
            共 {{ calculateDays(leaveData.startTime, leaveData.endTime) }} 天
          </td>
        </tr>
        <tr>
          <td class="label-cell">请假事由</td>
          <td class="value-cell" colspan="3">{{ leaveData.reason || '' }}</td>
        </tr>
        <!-- 动态生成审批意见行 -->
        <tr v-if="loading">
          <td class="label-cell">审批意见</td>
          <td class="opinion-cell" colspan="3">加载中...</td>
        </tr>
        <tr v-else-if="approvalOpinions.length === 0">
          <td class="label-cell">审批意见</td>
          <td class="opinion-cell" colspan="3">暂无审批意见</td>
        </tr>
        <tr v-else v-for="opinion in approvalOpinions" :key="opinion.name">
          <td class="label-cell">{{ opinion.name }}意见</td>
          <td class="opinion-cell" colspan="3">{{ opinion.reason || '' }}</td>
        </tr>
      </table>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handlePrint">打印</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import * as LeaveApi from '@/api/bpm/form/leave'
import * as TaskApi from '@/api/bpm/task'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'LeavePrintPreview' })

interface ApprovalOpinion {
  name: string
  reason: string
}

interface Props {
  modelValue: boolean
  leaveData: LeaveApi.LeaveVO
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  leaveData: () => ({
    type: 0,
    reason: '',
    startTime: new Date(),
    endTime: new Date(),
    duration: 0
  })
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const printRef = ref()
const approvalOpinions = ref<ApprovalOpinion[]>([])
const loading = ref(false)
const deptName = ref('') // 部门名称
const nickname = ref('') // 申请人昵称

// 监听对话框显示状态，当显示时获取审批意见
watch(dialogVisible, async (visible) => {
  if (visible) {
    loading.value = true
    try {
      // 获取部门信息
      await getDeptName()
      
      // 如果存在流程实例ID，则获取审批意见
      if (props.leaveData.processInstanceId) {
        await fetchApprovalOpinions(props.leaveData.processInstanceId)
      } else {
        approvalOpinions.value = []
      }
    } finally {
      loading.value = false
    }
  } else {
    // 关闭时重置
    approvalOpinions.value = []
    loading.value = false
    deptName.value = ''
    nickname.value = ''
  }
})

// 获取部门名称
const getDeptName = async () => {
  try {
    let targetUserId = null
    let targetUser = null
    
    // 优先使用传递的用户信息
    if (props.leaveData.userId) {
      // 如果有传递userId，使用该用户ID获取部门信息
      targetUserId = props.leaveData.userId
      targetUser = await UserApi.getUser(targetUserId)
    } else if (props.leaveData.creator) {
      // 如果有creator字段，尝试通过姓名匹配用户
      const userList = await UserApi.getSimpleUserList()
      const matchedUser = userList.find(user => 
        user.nickname === props.leaveData.creator || 
        user.username === props.leaveData.creator
      )
      if (matchedUser) {
        targetUser = matchedUser
        targetUserId = matchedUser.id
      }
    }
    
    // 如果没有找到目标用户，使用当前登录用户
    if (!targetUser) {
      const userStore = useUserStore()
      targetUser = userStore.getUser
      targetUserId = targetUser.id
    }
    
    // 设置用户昵称
    nickname.value = targetUser.nickname || props.leaveData.nickname || props.leaveData.creator || ''
    
    // 获取部门信息
    if (targetUser.deptId) {
      const dept = await DeptApi.getDept(targetUser.deptId)
      deptName.value = dept.name || ''
    } else {
      deptName.value = '未设置部门'
    }
  } catch (error) {
    // 发生错误时，使用传递的数据作为后备
    deptName.value = props.leaveData.deptName || ''
    nickname.value = props.leaveData.nickname || props.leaveData.creator || ''
  }
}

// 获取审批意见
const fetchApprovalOpinions = async (processInstanceId: string) => {
  try {
    // 获取流程实例的任务列表
    const tasks = await TaskApi.getTaskListByProcessInstanceId(processInstanceId)

    // 检查是否是CommonResult包装的数据
    if (tasks && typeof tasks === 'object' && 'data' in tasks) {
      const actualTasks = tasks.data
      return await processTaskList(actualTasks)
    }

    // 直接处理任务列表
    return await processTaskList(tasks)
  } catch (error) {
    approvalOpinions.value = []
  }
}

// 处理任务列表的辅助函数
const processTaskList = async (tasks: any[]) => {
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    approvalOpinions.value = []
    return
  }

  // 过滤掉发起人节点，保留所有审批节点
  const approvalTasks = tasks.filter(task => {
    return task.name !== '发起人'
  })

  // 获取审批人姓名的辅助函数
  const getApproverName = (task: any): string => {
    try {
      // 第一优先级：使用 assigneeUser.nickname（根据实际返回格式）
      if (task.assigneeUser && task.assigneeUser.nickname) {
        return task.assigneeUser.nickname
      }
      
      // 第二优先级：使用 assigneeName 字段
      if (task.assigneeName) {
        return task.assigneeName
      }
      
      // 第三优先级：使用 assignee 字段
      if (task.assignee) {
        return task.assignee
      }
      
      // 默认值
      return '审批人'
    } catch (error) {
      console.warn('获取审批人姓名失败', error)
      return '审批人'
    }
  }

  // 将任务转换为审批意见格式，根据状态显示不同内容
  const opinions = approvalTasks.map(task => {
    let reason = ''

    if (task.status === 2) {
      // 已完成的任务，获取审批人姓名
      const approverName = getApproverName(task)
      
      if (task.reason && task.reason.trim() !== '') {
        // 有意见时，格式为：审批人姓名 + 意见内容
        reason = `${approverName}：${task.reason}`
      } else {
        // 已完成但没有意见时，格式为：审批人姓名 + 无意见
        reason = `${approverName}：无意见`
      }
    } else {
      // 还未开始或进行中的任务，意见为空白
      reason = ''
    }

    return {
      name: task.name || '审批人',
      reason: reason
    }
  })

  approvalOpinions.value = opinions
}

// 格式化请假时间显示
const formatLeaveDate = (date: Date | string | number | null | undefined, format: string) => {
  // 检查是否为无效的日期值
  if (date === null || date === undefined || date === '' || date === 0) {
    return format === 'YYYY' ? '____' : format === 'MM' ? '__' : '__'
  }

  try {
    // 确保date是有效的Date对象
    const dateObj = new Date(date)

    if (isNaN(dateObj.getTime())) {
      return format === 'YYYY' ? '____' : format === 'MM' ? '__' : '__'
    }

    // 检查是否是1970年（通常表示时间戳为0或接近0）
    if (dateObj.getFullYear() === 1970) {
      return format === 'YYYY' ? '____' : format === 'MM' ? '__' : '__'
    }

    return formatDate(dateObj, format)
  } catch (error) {
    return format === 'YYYY' ? '____' : format === 'MM' ? '__' : '__'
  }
}

// 计算请假天数
const calculateDays = (startTime: Date | string | number | null | undefined, endTime: Date | string | number | null | undefined) => {
  // 检查是否为无效的日期值
  if (startTime === null || startTime === undefined || startTime === '' || startTime === 0 ||
      endTime === null || endTime === undefined || endTime === '' || endTime === 0) {
    return 0
  }

  try {
    const start = new Date(startTime)
    const end = new Date(endTime)

    // 检查日期是否有效
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0
    }

    // 检查是否是1970年（通常表示时间戳为0或接近0）
    if (start.getFullYear() === 1970 || end.getFullYear() === 1970) {
      return 0
    }

    // 计算天数差，至少为1天
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(diffDays, 1) // 至少显示1天
  } catch (error) {
    return 0
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

const handlePrint = () => {
  const printContent = printRef.value
  const printWindow = window.open('', '_blank')

  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>请假申请单</title>
          <style>
            body {
              font-family: "Microsoft YaHei", Arial, sans-serif;
              margin: 20px;
              font-size: 14px;
            }
            .form-header {
              text-align: center;
              margin-bottom: 20px;
            }
            .form-title {
              font-size: 18px;
              font-weight: bold;
              margin: 0;
            }
            .approval-table {
              width: 100%;
              border-collapse: collapse;
              border: 2px solid #000;
            }
            .approval-table td {
              border: 1px solid #000;
              padding: 8px;
              vertical-align: middle;
              min-height: 30px;
            }
            .label-cell {
              background-color: #f5f5f5;
              font-weight: bold;
              text-align: center;
              width: 120px;
            }
            .value-cell {
              padding-left: 10px;
            }
            .date-cell {
              text-align: center;
              width: 200px;
            }
            .time-cell {
              padding: 10px;
              text-align: center;
            }
            .opinion-cell {
              height: 60px;
              vertical-align: top;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }
}
</script>

<style scoped>
.print-content {
  padding: 20px;
  background: white;
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.approval-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000;
}

.approval-table td {
  border: 1px solid #000;
  padding: 8px;
  vertical-align: middle;
  min-height: 30px;
}

.label-cell {
  background-color: #f5f5f5;
  font-weight: bold;
  text-align: center;
  width: 120px;
}

.value-cell {
  padding-left: 10px;
}

.date-cell {
  text-align: center;
  width: 200px;
}

.time-cell {
  padding: 10px;
  text-align: center;
}

.opinion-cell {
  height: 60px;
  vertical-align: top;
}

@media print {
  .print-content {
    padding: 0;
  }
}
</style>
