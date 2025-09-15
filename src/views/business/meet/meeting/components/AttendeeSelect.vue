<template>
  <div class="attendee-select">
    <el-transfer
      v-model="selectedAttendees"
      :data="allUsers"
      :titles="['待选择', '已选择']"
      :button-texts="['移除', '添加']"
      filterable
      :filter-method="filterMethod"
      filter-placeholder="请输入用户名称"
      @change="handleChange"
    >
      <template #default="{ option }">
        <span>{{ option.nickname }}</span>
        <span v-if="option.deptName" style="color: #8492a6; font-size: 12px; margin-left: 8px">
          ({{ option.deptName }})
        </span>
      </template>
    </el-transfer>
    
    <div class="footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="confirm" :loading="loading">确 定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import * as UserApi from '@/api/system/user'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  existingAttendees: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// 所有用户列表
const allUsers = ref<any[]>([])
// 已选择的参会人
const selectedAttendees = ref<any[]>([])
// 加载状态
const loading = ref(false)

// 过滤方法
const filterMethod = (query: string, item: any) => {
  return item.nickname.toLowerCase().includes(query.toLowerCase())
}

// 处理选择变更
const handleChange = (value: any[], movedKeys: any[], direction: string) => {
  emit('update:modelValue', value)
}

// 取消操作
const cancel = () => {
  emit('cancel')
}

// 确认操作
const confirm = () => {
  const selectedUsers = allUsers.value.filter(user => 
    selectedAttendees.value.includes(user.id)
  )
  emit('confirm', selectedUsers)
}

// 获取所有用户
const getAllUsers = async () => {
  try {
    loading.value = true
    const data = await UserApi.getSimpleUserList()
    // 过滤掉已存在的参会人
    const existingIds = props.existingAttendees.map((attendee: any) => attendee.id)
    allUsers.value = data
      .filter(user => !existingIds.includes(user.id))
      .map(user => ({
        ...user,
        key: user.id,
        nickname: user.nickname || user.name || user.username,
        deptName: user.deptName || '-'
      }))
    
    // 设置已选择的参会人
    selectedAttendees.value = props.modelValue.slice()
  } catch (err) {
    console.error('获取用户列表失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getAllUsers()
})
</script>

<style scoped>
.attendee-select {
  padding: 20px;
}

.footer {
  margin-top: 20px;
  text-align: right;
}
</style>
