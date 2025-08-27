<template>
  <el-dialog
    v-model="dialogVisible"
    title="采购申请打印预览"
    width="80%"
    :before-close="handleClose"
    append-to-body
  >
    <div id="printContent" class="print-content">
      <div class="print-header">
        <h1>采购申请单</h1>
        <div class="form-info" v-if="purchaseData.id">
          <span>申请编号：{{ purchaseData.id }}</span>
          <span>申请日期：{{ formatDate(purchaseData.createTime) }}</span>
        </div>
      </div>

      <div class="print-body">
        <!-- 基本信息 -->
        <table class="info-table">
          <tr>
            <td class="label">申请人：</td>
            <td class="value">{{ purchaseData.creator || currentUser }}</td>
            <td class="label">申请日期：</td>
            <td class="value">{{ formatDate(purchaseData.purchaseDate) }}</td>
          </tr>
          <tr>
            <td class="label">采购事由：</td>
            <td class="value" colspan="3">{{ purchaseData.reason }}</td>
          </tr>
        </table>

        <!-- 物品清单 -->
        <h3>采购物品清单</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>物品名称</th>
              <th>规格型号</th>
              <th>预计数量</th>
              <th>预计单价(元)</th>
              <th>小计(元)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in purchaseData.itemList" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ item.itemName || item.name }}</td>
              <td>{{ item.specification }}</td>
              <td>{{ item.number || item.quantity }}</td>
              <td>{{ (item.estimatedAmount || item.price)?.toFixed(2) }}</td>
              <td>{{ ((item.number || item.quantity) * (item.estimatedAmount || item.price))?.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 合计金额 -->
        <div class="total-section">
          <div class="total-item">
            <span class="total-label">合计金额：</span>
            <span class="total-value">{{ purchaseData.totalPrice?.toFixed(2) }} 元</span>
          </div>
          <div class="total-item">
            <span class="total-label">大写金额：</span>
            <span class="total-value">{{ convertToChinese(purchaseData.totalPrice) }}</span>
          </div>
        </div>

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
          <div class="signature-item">
            <span>财务审核：</span>
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
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'PurchasePrintPreview' })

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  purchaseData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const userStore = useUserStore()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 获取当前用户信息
const currentUser = computed(() => {
  return userStore.getUser?.nickname || '当前用户'
})

const handleClose = () => {
  dialogVisible.value = false
}

// 数字转中文大写
const convertToChinese = (num) => {
  if (!num || num === 0) return '零元整'

  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿']

  const numStr = Math.floor(num).toString()
  let result = ''

  for (let i = 0; i < numStr.length; i++) {
    const digit = parseInt(numStr[i])
    const unit = units[numStr.length - 1 - i]

    if (digit !== 0) {
      result += digits[digit] + unit
    } else if (result && !result.endsWith('零')) {
      result += '零'
    }
  }

  result += '元整'
  return result || '零元整'
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
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.info-table, .items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.info-table td, .items-table th, .items-table td {
  padding: 8px 12px;
  border: 1px solid #ddd;
}

.info-table .label {
  background-color: #f5f5f5;
  font-weight: bold;
  width: 120px;
}

.items-table th {
  background-color: #f5f5f5;
  font-weight: bold;
  text-align: center;
}

.items-table td {
  text-align: center;
}

.total-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-weight: bold;
  color: #333;
}

.total-value {
  font-weight: bold;
  color: #e74c3c;
  font-size: 16px;
}

.signature-section {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.signature-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.signature-line {
  border-bottom: 1px solid #333;
  width: 150px;
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
