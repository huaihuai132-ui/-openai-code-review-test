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
       <el-table-column label="账户名称" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.accountName`" :rules="formRules.accountName" class="mb-0px!">
            <el-input v-model="row.accountName" placeholder="请输入账户名称" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="账户账号" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.accountNum`" :rules="formRules.accountNum" class="mb-0px!">
            <el-input v-model="row.accountNum" placeholder="请输入账户账号" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="账户开户行" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.accountBanklocation`" :rules="formRules.accountBanklocation" class="mb-0px!">
            <el-input v-model="row.accountBanklocation" placeholder="请输入账户开户行" />
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
    <el-button @click="handleAdd" round>+ 添加供应链金融供应商账户</el-button>
  </el-row>
</template>
<script setup lang="ts">
import { SupplychainSupplierApi } from '@/api/business/supplychainsupplier'

const props = defineProps<{
  supplierId: undefined // 供应商id（主表的关联字段）
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  supplierId: [{ required: true, message: '供应商id不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.supplierId,
  async (val) => {
    // 1. 重置表单
    formData.value = []
    // 2. val 非空，则加载数据
    if (!val) {
      return;
    }
    try {
      formLoading.value = true
      formData.value = await SupplychainSupplierApi.getSupplychainSupplierAccountListBySupplierId(val)
    } finally {
      formLoading.value = false
    }
  },
  { immediate: true }
)

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    supplierId: undefined,
    accountName: undefined,
    accountNum: undefined,
    accountBanklocation: undefined,
    deptId: undefined,
  }
  row.supplierId = props.supplierId
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
