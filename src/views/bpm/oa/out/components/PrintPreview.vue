<template>
  <el-dialog v-model="dialogVisible" title="外出申请打印预览" width="900px" :before-close="handleClose">
    <div class="print-content" ref="printRef">
      <!-- 表单标题 -->
      <div class="form-header">
        <h2 class="form-title">外出申请单</h2>
      </div>

      <!-- 表格内容 -->
      <table class="approval-table">
        <tr>
          <td class="label-cell">部门</td>
          <td class="value-cell">{{ deptName || outData.deptName || '获取中...' }}</td>
          <td class="label-cell">申请日期</td>
          <td class="date-cell">
            {{ formatDate(outData.createTime || new Date(), 'YYYY') }}年
            {{ formatDate(outData.createTime || new Date(), 'MM') }}月
            {{ formatDate(outData.createTime || new Date(), 'DD') }}日
          </td>
        </tr>
        <tr>
          <td class="label-cell">申请人</td>
          <td class="value-cell">{{ nickname || outData.nickname || outData.creator || '' }}</td>
          <td class="label-cell">外出类型</td>
          <td class="value-cell">
            <dict-tag :type="DICT_TYPE.BPM_OA_OUT_TYPE" :value="outData.type" />
          </td>
        </tr>
        <tr>
          <td class="label-cell">外出时间</td>
          <td class="time-cell" colspan="3">
            从 {{ formatDetailedTime(outData.startTime) }}
            至 {{ formatDetailedTime(outData.endTime) }}
          </td>
        </tr>
        <tr>
          <td class="label-cell">外出事由</td>
          <td class="value-cell" colspan="3">{{ outData.reason || '' }}</td>
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
import * as OutApi from '@/api/bpm/form/out'
import * as TaskApi from '@/api/bpm/task'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'OutPrintPreview' })

interface ApprovalOpinion {
  name: string
  reason: string
}

interface Props {
  modelValue: boolean
  outData: OutApi.OutVO
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  outData: () => ({
    id: 0,
    type: 0,
    reason: '',
    startTime: '',
    endTime: '',
    day: 0,
    status: 0,
    processInstanceId: '',
    createTime: '',
    fileList: '',
    sequenceCode: ''
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
      if (props.outData.processInstanceId) {
        await fetchApprovalOpinions(props.outData.processInstanceId)
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

// 获取部门名称和申请人信息
const getDeptName = async () => {
  try {
    let targetUserId = null
    let targetUser = null
    
    // 第一优先级：使用表单返回的userId（这是表单实际的申请人ID）
    if (props.outData.userId) {
      targetUserId = props.outData.userId
      targetUser = await UserApi.getUser(targetUserId)
    } 
    // 第二优先级：如果有createUser字段，使用该用户ID
    else if (props.outData.createUser) {
      targetUserId = props.outData.createUser
      targetUser = await UserApi.getUser(targetUserId)
    }
    // 第三优先级：如果有creator字段，尝试通过姓名匹配用户
    else if (props.outData.creator) {
      const userList = await UserApi.getSimpleUserList()
      const matchedUser = userList.find(user => 
        user.nickname === props.outData.creator || 
        user.username === props.outData.creator
      )
      if (matchedUser) {
        targetUser = matchedUser
        targetUserId = matchedUser.id
      }
    }
    
    // 如果仍然没有找到目标用户，使用当前登录用户（这种情况不应该发生在查看模式）
    if (!targetUser) {
      const userStore = useUserStore()
      targetUser = userStore.getUser
      targetUserId = targetUser.id
    }
    
    // 设置用户昵称
    nickname.value = targetUser.nickname || targetUser.username || props.outData.nickname || props.outData.creator || ''
    
    // 获取部门信息
    if (targetUser.deptId) {
      const dept = await DeptApi.getDept(targetUser.deptId)
      deptName.value = dept.name || ''
    } else {
      deptName.value = '未设置部门'
    }
  } catch (error) {
    console.error('获取申请人信息失败：', error)
    // 发生错误时，使用传递的数据作为后备
    deptName.value = props.outData.deptName || ''
    nickname.value = props.outData.nickname || props.outData.creator || ''
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

  // 将任务转换为审批意见格式，根据状态显示不同内容
  const opinions = approvalTasks.map((task) => {
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

// 格式化外出时间显示
const formatOutDate = (date: Date | string | number | null | undefined, format: string) => {
  // 检查是否为无效的日期值
  if (date === null || date === undefined || date === '' || date === 0) {
    return format === 'YYYY' ? '____' : format === 'MM' ? '__' : '__'
  }

  try {
    // 确保 date 是有效的 Date 对象
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

// 格式化详细时间显示（年月日时分 + 上下午）
const formatDetailedTime = (date: Date | string | number | null | undefined) => {
  // 检查是否为无效的日期值
  if (date === null || date === undefined || date === '' || date === 0) {
    return '____年__月__日 上午__:__'
  }

  try {
    // 处理时间戳（毫秒或秒）
    let timestamp = Number(date)
    
    // 如果是秒级时间戳，转换为毫秒
    if (timestamp.toString().length === 10) {
      timestamp = timestamp * 1000
    }
    
    const dateObj = new Date(timestamp)

    if (isNaN(dateObj.getTime())) {
      return '____年__月__日 上午__:__'
    }

    // 检查是否是1970年（通常表示时间戳为0或接近0）
    if (dateObj.getFullYear() === 1970) {
      return '____年__月__日 上午__:__'
    }

    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const hours = dateObj.getHours()
    const minutes = String(dateObj.getMinutes()).padStart(2, '0')
    
    // 判断上下午
    const period = hours < 12 ? '上午' : '下午'
    
    // 转换为12小时制
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const formattedHours = String(displayHours).padStart(2, '0')
    
    return `${year}年${month}月${day}日 ${period}${formattedHours}:${minutes}`
  } catch (error) {
    return '____年__月__日 上午__:__'
  }
}

// 计算外出天数
const calculateDays = (startTime: Date | string | number | null | undefined, endTime: Date | string | number | null | undefined) => {
  // 检查是否为无效的日期值
  if (startTime === null || startTime === undefined || startTime === '' || startTime === 0 ||
      endTime === null || endTime === undefined || endTime === '' || endTime === 0) {
    return 0
  }

  try {
    // 处理时间戳（毫秒或秒）
    let startTimestamp = Number(startTime)
    let endTimestamp = Number(endTime)
    
    // 如果是秒级时间戳，转换为毫秒
    if (startTimestamp.toString().length === 10) {
      startTimestamp = startTimestamp * 1000
    }
    if (endTimestamp.toString().length === 10) {
      endTimestamp = endTimestamp * 1000
    }
    
    const start = new Date(startTimestamp)
    const end = new Date(endTimestamp)

    // 检查日期是否有效
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0
    }

    // 检查是否是1970年（通常表示时间戳为0或接近0）
    if (start.getFullYear() === 1970 || end.getFullYear() === 1970) {
      return 0
    }

    // 计算天数差
    const diffTime = Math.abs(endTimestamp - startTimestamp)
    if (diffTime === 0) {
      return 0
    }
    
    // 计算小时数
    const hours = diffTime / (60 * 60 * 1000)
    if (hours < 4) {
      return 0.5
    }
    
    // 大于等于4小时，向上取整算一天
    const oneDay = 24 * 60 * 60 * 1000 // 一天的毫秒数
    return Math.ceil(diffTime / oneDay)
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
          <title>外出申请单</title>
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
              padding: 8px;
              text-align: center;
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
              text-align: center;
              padding: 10px;
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
  padding: 8px;
  text-align: center;
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
  text-align: center;
  padding: 10px;
}

@media print {
  .print-content {
    padding: 0;
  }
}
</style>
