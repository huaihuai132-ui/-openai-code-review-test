<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-loading="formLoading"
    label-width="0px"
    :inline-message="true"
  >
    <el-table :data="formData" class="-mt-10px">
      <el-table-column label="序号" type="index" width="100" />
       <el-table-column label="请假类型" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.type`" :rules="formRules.type" class="mb-0px!">
            <el-select v-model="row.type" placeholder="请选择请假类型">
                <el-option label="年假" value="4" />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="请假原因" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.reason`" :rules="formRules.reason" class="mb-0px!">
            <el-input v-model="row.reason" placeholder="请输入请假原因" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.startTime`" :rules="formRules.startTime" class="mb-0px!">
            <el-date-picker
              v-model="row.startTime"
              type="date"
              value-format="x"
              placeholder="选择开始时间"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.endTime`" :rules="formRules.endTime" class="mb-0px!">
            <el-date-picker
              v-model="row.endTime"
              type="date"
              value-format="x"
              placeholder="选择结束时间"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="请假天数" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.day`" :rules="formRules.day" class="mb-0px!">
            <el-input v-model="row.day" placeholder="请输入请假天数" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="请假结果" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.status`" :rules="formRules.status" class="mb-0px!">
            <el-select v-model="row.status" placeholder="请选择请假结果">
              <el-option
                v-for="dict in getDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)"
                :key="dict.value"
                :label="dict.label"
               :value="parseInt(dict.value)"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="流程实例的编号" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.processInstanceId`" :rules="formRules.processInstanceId" class="mb-0px!">
            <el-input v-model="row.processInstanceId" placeholder="请输入流程实例的编号" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="60">
        <template #default="{ $index }">
          <el-button @click="handleDelete($index)" link>—</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
  <el-row justify="center" class="mt-3">
    <el-button @click="handleAdd" round>+ 添加OA 请假申请表单</el-button>
  </el-row>
</template>
<script setup lang="ts">
import { OaAnnualLeaveApi } from '@/api/business/oaannualleave'
import { DICT_TYPE } from '@/utils/dict'
import { getDictOptions } from '@/utils/dict'

const props = defineProps<{
  userId: undefined // 申请人的用户编号（主表的关联字段）
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  userId: [{ required: true, message: '申请人的用户编号不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '请假类型不能为空', trigger: 'change' }],
  reason: [{ required: true, message: '请假原因不能为空', trigger: 'blur' }],
  startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
  endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.userId,
  async (val) => {
    // 1. 重置表单
    formData.value = []
    // 2. val 非空，则加载数据
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      formData.value = await OaAnnualLeaveApi.getOaFormLeaveListByUserId(val)
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)

/** 计算两个日期之间的天数差 */
const calculateDays = (startTime, endTime) => {
  if (!startTime || !endTime) return ''
  
  // 将时间戳转换为毫秒
  const start = new Date(parseInt(startTime))
  const end = new Date(parseInt(endTime))
  
  // 计算天数差（向上取整，包含开始和结束当天）
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  
  return diffDays > 0 ? diffDays.toString() : ''
}

/** 监听每一行的开始时间和结束时间变化，自动计算请假天数 */
watch(
  () => formData.value,
  (rows) => {
    if (!rows || rows.length === 0) return
    
    rows.forEach(row => {
      if (row.startTime && row.endTime) {
        row.day = calculateDays(row.startTime, row.endTime)
      }
    })
  },
  { deep: true }
)

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    userId: undefined,
    type: undefined,
    reason: undefined,
    startTime: undefined,
    endTime: undefined,
    day: undefined,
    status: undefined,
    processInstanceId: undefined,
  }
  row.userId = props.userId
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index) => {
  formData.value.splice(index, 1)
}

/** 表单校验 */
const validate = () => {
  return formRef.value.validate()
}

/** 表单值 */
const getData = () => {
  return formData.value
}

defineExpose({ validate, getData })
</script>