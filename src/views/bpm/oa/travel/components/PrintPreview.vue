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
        <tr>
          <td class="label-cell">分管领导意见</td>
          <td class="opinion-cell" colspan="3">{{ approvalOpinions.managerOpinion || '' }}</td>
        </tr>
        <tr>
          <td class="label-cell">主要负责人意见</td>
          <td class="opinion-cell" colspan="3">{{ approvalOpinions.leaderOpinion || '' }}</td>
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

interface Props {
  modelValue: boolean
  travelData: TravelApi.TravelVO
  approvalOpinionsInput?: {
    managerOpinion: string
    leaderOpinion: string
  }
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
  }),
  approvalOpinionsInput: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const printRef = ref()
const approvalOpinions = ref({
  managerOpinion: '', // 分管领导审批意见
  leaderOpinion: '' // 主要负责人审批意见
})

// 监听对话框显示状态，当显示时获取审批意见
watch(dialogVisible, async (visible) => {
  if (visible) {
    // 如果外部传入了审批意见，则直接使用
    if (props.approvalOpinionsInput) {
      approvalOpinions.value = { ...props.approvalOpinionsInput }
    }
    // 否则，如果存在流程实例ID，则尝试获取
    else if (props.travelData.processInstanceId) {
      await fetchApprovalOpinions(props.travelData.processInstanceId)
    }
  } else {
    // 关闭时重置
    approvalOpinions.value = { managerOpinion: '', leaderOpinion: '' }
  }
})

// 获取审批意见
const fetchApprovalOpinions = async (processInstanceId: string) => {
  try {
    // 获取流程实例的任务列表
    const tasks = await TaskApi.getTaskListByProcessInstanceId(processInstanceId)

    if (tasks && tasks.length > 0) {
      // 查找分管领导的审批意见
      const managerTask = tasks.find(task =>
        task.taskDefinitionKey === 'supervisor_approval' ||
        task.name?.includes('分管领导')
      )
      if (managerTask && managerTask.reason) {
        approvalOpinions.value.managerOpinion = managerTask.reason
      }

      // 查找主要负责人的审批意见
      const leaderTask = tasks.find(task =>
        task.taskDefinitionKey === 'main_responsible_approval' ||
        task.name?.includes('主要负责人') ||
        task.name?.includes('董事长')
      )
      if (leaderTask && leaderTask.reason) {
        approvalOpinions.value.leaderOpinion = leaderTask.reason
      }
    }
  } catch (error) {
    console.error('获取审批意见失败:', error)
  }
}

// 格式化出差时间显示
const formatTravelDate = (date: Date | string | null | undefined, format: string) => {
  if (!date) return '年' // 返回默认值避免显示undefined
  
  try {
    // 确保date是有效的Date对象
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return '年' // 无效日期返回默认值
    }
    return formatDate(dateObj, format)
  } catch (error) {
    console.error('格式化日期失败:', error)
    return '年'
  }
}

// 计算出差天数
const calculateDays = (startTime: Date | string | null | undefined, endTime: Date | string | null | undefined) => {
  if (!startTime || !endTime) return 0
  
  try {
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    // 检查日期是否有效
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0
    }
    
    // 计算天数差，至少为1天
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(diffDays, 1) // 至少显示1天
  } catch (error) {
    console.error('计算天数失败:', error)
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
