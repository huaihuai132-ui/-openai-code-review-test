<template>
  <el-dialog v-model="dialogVisible" title="采购申请打印预览" width="900px" :before-close="handleClose">
    <div class="print-content" ref="printRef">
      <!-- 表单标题 -->
      <div class="form-header">
        <h2 class="form-title">采购申请单</h2>
      </div>

      <!-- 表格内容 -->
      <table class="approval-table">
        <tr>
          <td class="label-cell">申请部门</td>
          <td class="value-cell">{{ purchaseData.deptName || '' }}</td>
          <td class="label-cell">申请人</td>
          <td class="value-cell">{{ purchaseData.creator || currentUser }}</td>
          <td class="label-cell">申请日期</td>
          <td class="date-cell">
            {{ formatDate(purchaseData.createTime || new Date(), 'YYYY') }}年
            {{ formatDate(purchaseData.createTime || new Date(), 'MM') }}月
            {{ formatDate(purchaseData.createTime || new Date(), 'DD') }}日
          </td>
        </tr>
        <tr>
          <td class="label-cell">采购部门</td>
          <td class="value-cell" colspan="5">
            <span class="dept-option" :class="{ active: purchaseData.purchaseDeptType === 1 }">
              行政办公室 {{ purchaseData.purchaseDeptType === 1 ? '☑' : '☐' }}
            </span>
            <span class="dept-option" :class="{ active: purchaseData.purchaseDeptType === 2 }">
              申请部门自行采购 {{ purchaseData.purchaseDeptType === 2 ? '☑' : '☐' }}
            </span>
          </td>
        </tr>

      </table>

      <!-- 物品清单表格 -->
      <table class="items-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>名称</th>
            <th>规格型号</th>
            <th>数量</th>
            <th>推荐品牌</th>
            <th>估计单价</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in purchaseData.itemList" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.itemName || item.name }}</td>
            <td>{{ item.specification }}</td>
            <td>{{ item.number || item.quantity }}</td>
            <td>{{ item.usage || '' }}</td>
            <td>{{ (item.estimatedAmount || item.price)?.toFixed(2) }}</td>
          </tr>
          <!-- 填充空行到至少5行 -->
          <tr v-for="i in Math.max(0, 5 - (purchaseData.itemList?.length || 0))" :key="`empty-${i}`">
            <td>{{ (purchaseData.itemList?.length || 0) + i }}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr class="total-row">
            <td colspan="5" class="total-label">合计</td>
            <td class="total-value">{{ purchaseData.totalPrice?.toFixed(2) || '0.00' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 采购原因 -->
      <table class="approval-table">
        <tr>
          <td class="label-cell">采购原因</td>
          <td class="reason-cell" colspan="5">{{ purchaseData.reason || '' }}</td>
        </tr>
        <!-- 动态生成审批意见行 -->
        <tr v-if="loading">
          <td class="label-cell">审批意见</td>
          <td class="opinion-cell" colspan="5">加载中...</td>
        </tr>
        <tr v-else-if="approvalOpinions.length === 0">
          <td class="label-cell">审批意见</td>
          <td class="opinion-cell" colspan="5">暂无审批意见</td>
        </tr>
        <tr v-else v-for="opinion in approvalOpinions" :key="opinion.name">
          <td class="label-cell">{{ opinion.name }}意见</td>
          <td class="opinion-cell" colspan="5">{{ opinion.reason || '' }}</td>
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
import * as TaskApi from '@/api/bpm/task'
import { formatDate } from '@/utils/formatTime'
import { useUserStore } from '@/store/modules/user'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'

defineOptions({ name: 'PurchasePrintPreview' })

interface ApprovalOpinion {
  name: string
  reason: string
}

interface Props {
  modelValue: boolean
  purchaseData: any
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  purchaseData: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const userStore = useUserStore()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const printRef = ref()
const approvalOpinions = ref<ApprovalOpinion[]>([])
const loading = ref(false)

// 获取当前用户信息
const currentUser = computed(() => {
  return userStore.getUser?.nickname || '当前用户'
})

// 获取采购部门类型的显示文本
const purchaseDeptTypeLabel = computed(() => {
  if (props.purchaseData.purchaseDeptType) {
    return getDictLabel(DICT_TYPE.PURCHASE_DEPT_TYPE, props.purchaseData.purchaseDeptType)
  }
  return ''
})

// 监听对话框显示状态，当显示时获取审批意见
watch(dialogVisible, async (visible) => {
  if (visible) {
    loading.value = true
    try {
      // 如果存在流程实例ID，则获取审批意见
      if (props.purchaseData.processInstanceId) {
        await fetchApprovalOpinions(props.purchaseData.processInstanceId)
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
          <title>采购申请单</title>
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
            .approval-table, .items-table {
              width: 100%;
              border-collapse: collapse;
              border: 2px solid #000;
              margin-bottom: 10px;
            }
            .approval-table td, .items-table th, .items-table td {
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
            .dept-option {
              margin-right: 20px;
              font-size: 14px;
            }
            .dept-option.active {
              font-weight: bold;
            }
            .items-table th {
              background-color: #f5f5f5;
              font-weight: bold;
              text-align: center;
            }
            .items-table td {
              text-align: center;
            }
            .total-row {
              font-weight: bold;
            }
            .total-label {
              text-align: center;
              background-color: #f5f5f5;
            }
            .total-value {
              text-align: center;
              font-weight: bold;
            }
            .reason-cell, .opinion-cell {
              height: 60px;
              vertical-align: top;
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

.approval-table, .items-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000;
  margin-bottom: 10px;
}

.approval-table td, .items-table th, .items-table td {
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

.dept-option {
  margin-right: 20px;
  font-size: 14px;
}

.dept-option.active {
  font-weight: bold;
}

.items-table th {
  background-color: #f5f5f5;
  font-weight: bold;
  text-align: center;
}

.items-table td {
  text-align: center;
}

.total-row {
  font-weight: bold;
}

.total-label {
  text-align: center;
  background-color: #f5f5f5;
}

.total-value {
  text-align: center;
  font-weight: bold;
}

.reason-cell, .opinion-cell {
  height: 60px;
  vertical-align: top;
  padding: 10px;
}

@media print {
  .print-content {
    padding: 0;
  }
}
</style>
