<template>
  <div class="basic-meeting-form">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="会议名称" prop="meetName">
          <el-input v-model="formData.meetName" placeholder="请输入会议名称" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="会议类型" prop="meetType">
          <el-select v-model="formData.meetType" placeholder="请选择会议类型" style="width: 100%">
            <el-option
              v-for="dict in getStrDictOptions(DICT_TYPE.MEET_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="会议日期" prop="meetDate">
          <el-date-picker
            v-model="formData.meetDate"
            type="date"
            value-format="x"
            placeholder="选择会议日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            type="datetime"
            value-format="x"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            type="datetime"
            value-format="x"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="会议室" prop="meetRoomId">
          <el-select v-model="formData.meetRoomId" placeholder="请选择会议室" style="width: 100%">
            <el-option
              v-for="room in meetingRooms"
              :key="room.id"
              :label="room.roomName + ' - ' + room.location"
              :value="room.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="会议事由" prop="reason">
          <el-input v-model="formData.reason" placeholder="请输入会议事由" />
        </el-form-item>
      </el-col>
      <!-- 会议状态字段在新增和编辑时都隐藏，仅在详情页面显示 -->
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="会议概述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入会议概述"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import type { MeetingFormData, MeetingRoom } from './types'
import { computed } from 'vue'

interface Props {
  formData: MeetingFormData
  meetingRooms: MeetingRoom[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:formData'])

// 同步数据变化
const formData = computed({
  get: () => props.formData,
  set: (value) => emit('update:formData', value)
})
</script>

<style scoped>
.basic-meeting-form {
  width: 100%;
}
</style>
