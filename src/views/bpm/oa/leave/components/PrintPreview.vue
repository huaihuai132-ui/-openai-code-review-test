<template>
  <el-dialog
    v-model="dialogVisible"
    title="请假申请单打印预览"
    width="80%"
    :before-close="handleClose"
    append-to-body
  >
    <div id="printContent" class="print-content">
      <div class="print-header">
        <h1>请假申请单</h1>
        <div class="form-info">
          <span>申请日期：{{ formatDate(leaveData.createTime) }}</span>
        </div>
      </div>

      <div class="print-body">
        <!-- 基本信息 -->
        <table class="info-table">
          <tr>
            <td class="label">申请人：</td>
            <td class="value">{{ leaveData.creator }}</td>
            <td class="label">剩余年假：</td>
            <td class="value">{{ leaveData.leftLeaveDays }} 天</td>
          </tr>
          <tr>
            <td class="label">请假类型：</td>
            <td class="value">
              <dict-tag :type="DICT_TYPE.BPM_OA_LEAVE_TYPE" :value="leaveData.type" />
            </td>
            <td class="label">请假天数：</td>
            <td class="value">{{ leaveData.duration }} 天</td>
          </tr>
          <tr>
            <td class="label">开始时间：</td>
            <td class="value">{{ formatDate(leaveData.startTime, 'YYYY-MM-DD HH:mm') }}</td>
            <td class="label">结束时间：</td>
            <td class="value">{{ formatDate(leaveData.endTime, 'YYYY-MM-DD HH:mm') }}</td>
          </tr>
          <tr>
            <td class="label">请假事由：</td>
            <td class="value" colspan="3">{{ leaveData.reason }}</td>
          </tr>
        </table>

        <!-- 签字确认 -->
        <div class="signature-section">
          <div class="signature-item">
            <span>申请人签字：</span>
            <div class="signature-line"></div>
            <span>日期：</span>
            <div class="signature-line"></div>
          </div>
          <div class="signature-item">
            <span>部门负责人签字：</span>
            <div class="signature-line"></div>
            <span>日期：</span>
            <div class="signature-line"></div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" v-print="'#printContent'">
          <Icon icon="ep:printer" class="mr-5px" />
          打印
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'

defineOptions({ name: 'LeavePrintPreview' })

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  leaveData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.print-content {
  padding: 20px;
  background: white;
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

.print-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #333;
  padding-bottom: 15px;
}

.print-header h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: bold;
}

.form-info {
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
  color: #666;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.info-table td {
  padding: 10px 12px;
  border: 1px solid #ddd;
}

.info-table .label {
  background-color: #f5f5f5;
  font-weight: bold;
  width: 120px;
  text-align: right;
}

.info-table .value {
  width: 300px;
}

.signature-section {
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.signature-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.signature-line {
  border-bottom: 1px solid #333;
  width: 200px;
  height: 20px;
}

@media print {
  .print-content {
    font-size: 12px;
  }

  .signature-section {
    page-break-inside: avoid;
  }
}
</style>
