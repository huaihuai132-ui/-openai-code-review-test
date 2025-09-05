<template>
  <el-dialog v-model="dialogVisible" title="出差申请打印预览" width="900px" :before-close="handleClose">
    <div class="print-content" ref="printRef">
      <!-- 表单标题 -->
      <div class="form-header">
        <h2 class="form-title">有限公司出差审批单</h2>
      </div>

      <!-- 表格内容 -->
      <table class="approval-table">
        <tr>
          <td class="label-cell">部门</td>
          <td class="value-cell">{{ travelData.deptName || '' }}</td>
          <td class="label-cell">申请日期</td>
          <td class="date-cell">
            {{ formatDate(travelData.createTime || new Date(), 'YYYY') }}年
            {{ formatDate(travelData.createTime || new Date(), 'MM') }}月
            {{ formatDate(travelData.createTime || new Date(), 'DD') }}日
          </td>
        </tr>
        <tr>
          <td class="label-cell">出差人员</td>
          <td class="value-cell" colspan="2">
            <span v-for="(person, index) in travelData.personList" :key="index">
              {{ person.nickname }}{{ index < travelData.personList.length - 1 ? '、' : '' }}
            </span>
          </td>
          <td class="count-cell">
            共 {{ travelData.personList?.length || 0 }} 人
          </td>
        </tr>
        <tr>
          <td class="label-cell">交通方式</td>
          <td class="traffic-cell" colspan="3">
            <span class="traffic-option" :class="{ active: travelData.trafficType === 1 }">
              火车 {{ travelData.trafficType === 1 ? '☑' : '☐' }}
            </span>
            <span class="traffic-option" :class="{ active: travelData.trafficType === 2 }">
              自带车 {{ travelData.trafficType === 2 ? '☑' : '☐' }}
            </span>
            <span class="traffic-option" :class="{ active: travelData.trafficType === 3 }">
              地方车辆 {{ travelData.trafficType === 3 ? '☑' : '☐' }}
            </span>
            <span class="traffic-option" :class="{ active: travelData.trafficType === 4 }">
              飞机 {{ travelData.trafficType === 4 ? '☑' : '☐' }}
            </span>
          </td>
        </tr>
        <tr v-if="travelData.trafficType === 4">
          <td class="label-cell">乘坐飞机理由</td>
          <td class="value-cell" colspan="3">{{ travelData.airplaneReason || '' }}</td>
        </tr>
        <tr>
          <td class="label-cell">出差时间</td>
          <td class="time-cell" colspan="3">
            从 {{ formatTravelDate(travelData.startTime, 'YYYY') }} 年 {{ formatTravelDate(travelData.startTime, 'MM') }} 月 {{ formatTravelDate(travelData.startTime, 'DD') }} 日
            至 {{ formatTravelDate(travelData.endTime, 'YYYY') }} 年 {{ formatTravelDate(travelData.endTime, 'MM') }} 月 {{ formatTravelDate(travelData.endTime, 'DD') }} 日
            共 {{ calculateDays(travelData.startTime, travelData.endTime) }} 天
          </td>
        </tr>
        <tr>
          <td class="label-cell">出差地点</td>
          <td class="value-cell" colspan="3">{{ travelData.address || '' }}</td>
        </tr>
        <tr>
          <td class="label-cell">出差事由</td>
          <td class="value-cell" colspan="3">{{ travelData.reason || '' }}</td>
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
        <tr>
          <td class="label-cell">备注</td>
          <td class="value-cell" colspan="3">{{ travelData.remark || '' }}</td>
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
import * as TravelApi from '@/api/bpm/form/travel'
import * as TaskApi from '@/api/bpm/task'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'


interface ApprovalOpinion {
  name: string
  reason: string
}

interface Props {
  modelValue: boolean
  travelData: TravelApi.TravelVO
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  travelData: () => ({
    trafficType: 1,
    airplaneReason: '',
    startTime: new Date(),
    endTime: new Date(),
    address: '',
    reason: '',
    remark: '',
    personList: []
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

// 监听对话框显示状态，当显示时获取审批意见
watch(dialogVisible, async (visible) => {
  if (visible) {
    loading.value = true
    try {
      // 如果存在流程实例ID，则获取审批意见
      if (props.travelData.processInstanceId) {
        await fetchApprovalOpinions(props.travelData.processInstanceId)
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
  }
})

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

  // 将任务转换为审批意见格式，根据状态显示不同内容
  const opinions = approvalTasks.map(task => {
    let reason = ''

    if (task.status === 2) {
      // 已完成的任务
      if (task.reason && task.reason.trim() !== '') {
        reason = task.reason // 有意见就显示意见
      } else {
        reason = '无意见' // 已完成但没有意见
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

// 格式化出差时间显示
const formatTravelDate = (date: Date | string | number | null | undefined, format: string) => {
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

// 计算出差天数
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
          <title>出差审批单</title>
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
            .count-cell {
              text-align: center;
              width: 100px;
            }
            .traffic-cell {
              padding: 10px;
            }
            .traffic-option {
              margin-right: 20px;
              font-size: 14px;
            }
            .traffic-option.active {
              font-weight: bold;
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

.count-cell {
  text-align: center;
  width: 100px;
}

.traffic-cell {
  padding: 10px;
}

.traffic-option {
  margin-right: 20px;
  font-size: 14px;
}

.traffic-option.active {
  font-weight: bold;
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
