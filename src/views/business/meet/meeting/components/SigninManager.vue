<template>
  <div>
    <div class="mb-4">
      <el-button type="primary" @click="openAddAttendeeDialog">
        <Icon icon="ep:plus" />
        新增参会人
      </el-button>
    </div>
    
    <el-table :data="meetingAttendees" border>
      <el-table-column prop="userName" label="姓名" width="120" />
      <el-table-column prop="userDepartmentName" label="部门" width="150" />
      <el-table-column prop="position" label="职务" width="150" />
      <el-table-column label="签到状态" width="100">
        <template #default="{ row }">
          <el-tag :type="(row.signed ? 'success' : 'info')">
            {{ row.signed ? '已签到' : '未签到' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            link 
            @click="signAttendance(row)"
            :disabled="row.signed"
          >
            签到
          </el-button>
          <el-button 
            type="danger" 
            link 
            @click="removeAttendee(row)"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 新增参会人弹窗 -->
    <Dialog v-model="addAttendeeDialogVisible" title="新增参会人" width="800px">
      <AttendeeSelect 
        ref="attendeeSelectRef"
        v-model="selectedAttendeeIds"
        :existing-attendees="meetingAttendees"
        @confirm="handleAddAttendees"
        @cancel="addAttendeeDialogVisible = false"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useMessage} from '@/hooks/web/useMessage'
import {Icon} from '@/components/Icon'
import AttendeeSelect from './AttendeeSelect.vue'
import {Dialog} from '@/components/Dialog'

// 定义参会人类型
interface Attendee {
  id?: number
  userId?: number
  userName?: string
  nickname?: string
  name?: string
  username?: string
  userDepartmentName?: string
  department?: string
  deptName?: string
  position?: string
  postName?: string
  signed?: boolean
  [key: string]: any
}

const message = useMessage()
const emit = defineEmits(['addAttendees', 'signAttendance', 'removeAttendee', 'confirmSignin'])

// 新增参会人相关
const addAttendeeDialogVisible = ref(false)
const selectedAttendeeIds = ref<any[]>([])
const attendeeSelectRef = ref<typeof AttendeeSelect>()

const props = defineProps({
  meetingAttendees: {
    type: Array as () => Attendee[],
    default: () => []
  },
  meetingId: {
    type: Number,
    required: true
  }
})

// 签到
const signAttendance = (attendee: Attendee) => {
  attendee.signed = true
  message.success(`${attendee.userName} 签到成功`)
  emit('signAttendance', attendee)
}

// 打开新增参会人弹窗
const openAddAttendeeDialog = () => {
  // 重置选择
  selectedAttendeeIds.value = []
  addAttendeeDialogVisible.value = true
}

// 处理新增参会人确认
const handleAddAttendees = (userList: Attendee[]) => {
  // 直接处理用户列表
  if (userList.length === 0) {
    addAttendeeDialogVisible.value = false
    return
  }
  
  try {
    // 添加新参会人
    const updatedAttendees = [
      ...props.meetingAttendees,
      ...userList.map(attendee => ({
        ...attendee,
        id: attendee.id || attendee.userId, // 确保ID存在
        userId: attendee.userId || attendee.id, // 确保userId存在
        userName: attendee.userName || attendee.nickname || attendee.name || attendee.username, // 兼容不同字段名
        userDepartmentName: attendee.userDepartmentName || attendee.department || attendee.deptName || '-', // 兼容部门字段
        position: attendee.position || attendee.postName || '-', // 兼容职务字段
        signed: attendee.signed !== undefined ? attendee.signed : false // 确保signed属性存在
      }))
    ]
    
    addAttendeeDialogVisible.value = false
    message.success('参会人添加成功')
    emit('addAttendees', updatedAttendees)
  } catch (err) {
    console.error('添加参会人失败:', err)
    message.error('添加参会人失败')
  }
}

// 移除参会人
const removeAttendee = (attendee: Attendee) => {
  const index = props.meetingAttendees.findIndex((a: Attendee) => a.id === attendee.id)
  if (index > -1) {
    message.success('参会人移除成功')
    emit('removeAttendee', index)
  }
}

// 确认签到
const confirmSignin = () => {
  emit('confirmSignin')
}

// 暴露方法给父组件
defineExpose({
  openAddAttendeeDialog,
  confirmSignin
})
</script>

