<template>
  <div class="py-4">
    <div class="mb-4">
      <el-button type="primary" @click="openUserSelectDialog">
        <Icon icon="ep:plus" />
        添加参会人员
      </el-button>
    </div>
    <el-table :data="attendees" border style="width: 100%" empty-text="暂无参会人员">
      <el-table-column prop="userInfo.nickname" label="用户名称" width="180" />
      <el-table-column prop="userInfo.deptName" label="部门" sortable />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" link @click="removeParticipant(row)">
            <Icon icon="ep:delete" />
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 用户选择弹窗 -->
    <UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelected" />
  </div>
</template>

<script setup lang="ts">
import UserSelectForm from '@/components/UserSelectForm/index.vue'
import { computed, ref } from 'vue'
import { OaMeetingAttendeeVO } from '@/api/business/oameetingattendee'
import { AttendeeWithUserInfo } from './types';

interface Props {
  attendees: AttendeeWithUserInfo[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:attendees'])

const attendees = computed({
  get: () => props.attendees,
  set: (value) => emit('update:attendees', value)
})

const userSelectFormRef = ref()

/** 打开用户选择弹窗 */
const openUserSelectDialog = () => {
  userSelectFormRef.value?.open(0, attendees.value)
}

/** 处理用户选择确认 */
const handleUserSelected = (_id: any, userList: any[]) => {
  attendees.value = userList.map((item) => ({
    userId: item.id,
    userInfo: {
      id: item.id,
      nickname: item.nickname,
      deptName: item.deptName
    }
  }))
}

/** 移除参会人员 */
const removeParticipant = (row: OaMeetingAttendeeVO) => {
  const index = attendees.value.findIndex((item) => item.id === row.id)
  if (index > -1) {
    attendees.value.splice(index, 1)
  }
}
</script>
