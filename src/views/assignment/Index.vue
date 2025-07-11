<template>
  <div class="calendar-container">
    <h1>日历演示</h1>
    <calendar-component ref="calendarRef"/>
    <div class="control-panel">
      <h3>控制面板</h3>
      <div class="button-group">
        <button @click="addTestEvent">添加测试事件</button>
        <button @click="addAdminHoliday">添加管理员假期</button>
        <button @click="addPersonalHoliday">添加个人假期</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CalendarComponent from '@/components/Calendar/encapsulation/index.vue';
import { EventItem } from '@/components/Calendar/src/types';

// 引用日历组件
const calendarRef = ref();

// 添加测试事件
const addTestEvent = () => {
  const event: EventItem = {
    title: '测试事件',
    start: '2025-07-20T12:00:00',
    end: '2025-07-21T12:00:00',
    allDay: true
  };
  calendarRef.value?.addEvent(event);
};

// 添加管理员假期
const addAdminHoliday = () => {
  const holiday = {
    date: '2025-07-25',
    des: '公司团建'
  };
  calendarRef.value?.addAdminHoliday(holiday);
};

// 添加个人假期
const addPersonalHoliday = () => {
  const holiday = {
    date: '2025-07-28',
    des: '年假'
  };
  calendarRef.value?.addPersonalHoliday(holiday);
};

// 在组件挂载时初始化
onMounted(() => {
  // 可以在这里进行其他初始化操作
});
</script>

<style scoped lang="scss">
.calendar-container {
  padding: 20px;

  h1 {
    margin-bottom: 20px;
    color: #333;
  }

  .control-panel {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;

    h3 {
      margin-bottom: 15px;
      color: #333;
    }

    .button-group {
      display: flex;
      gap: 10px;

      button {
        padding: 8px 16px;
        background-color: #2c3e50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;

        &:hover {
          background-color: #1e2b37;
        }
      }
    }
  }
}
</style>
