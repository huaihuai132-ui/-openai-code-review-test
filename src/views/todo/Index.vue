<template>
  <div class="simple-calendar-example">
    <h2>简单日历示例</h2>
    <p>这是一个最简单的日历组件使用示例</p>

    <!-- 直接使用日历组件 -->
    <CalendarComponent ref="calendarRef" />

    <!-- 简单的操作按钮 -->
    <div class="actions" style="margin-top: 20px;">
      <el-button type="primary" @click="addSampleEvent">添加示例事件</el-button>
      <el-button @click="reloadData">重新加载数据</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CalendarComponent from '@/components/Calendar'
import { EventItem } from '@/components/Calendar/src/types'

const calendarRef = ref()

// 添加示例事件
const addSampleEvent = () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const event: EventItem = {
    start: today.toISOString().split('T')[0] + ' 14:00',
    end: today.toISOString().split('T')[0] + ' 15:00',
    description: '这是一个通过代码添加的示例事件',
  }

  calendarRef.value?.addEvent(event)
}

// 重新加载数据
const reloadData = () => {
  calendarRef.value?.loadEvents()
  calendarRef.value?.reloadBackendHolidays()
}
</script>

<style scoped>
.simple-calendar-example {
  padding: 20px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
