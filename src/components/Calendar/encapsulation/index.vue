<template>
    <m-calendar :events="events" :holidays="mergedHolidays" @dateClick="handleDateClick" @eventClick="handleEventClick"/>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineExpose } from 'vue';
import { EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import { EventItem, HolidayItem } from '@/components/Calendar/src/types';
import Holidays from 'date-holidays';
import Lunar from 'lunar-javascript';

// 事件颜色循环数组
const eventColors = [
    '#FFCC00', // 黄色
    '#3388FF', // 蓝色
    '#9933CC'  // 紫色
];
let eventColorIndex = 0;

// 获取下一个事件颜色并递增索引
const getNextEventColor = () => {
    const color = eventColors[eventColorIndex];
    eventColorIndex = (eventColorIndex + 1) % eventColors.length;
    return color;
};

// 事件数据
let events = ref<EventItem[]>([]);

// 节假日颜色循环数组
const holidayColors = [
    '#FF0066', // 红色
    '#FF9933', // 橙色
    '#FF66B2', // 粉色
];
let colorIndex = 0;

// 获取下一个颜色并递增索引
const getNextColor = () => {
    const color = holidayColors[colorIndex];
    colorIndex = (colorIndex + 1) % holidayColors.length;
    return color;
};

// 国家法定节假日
const nationalHolidays = ref<HolidayItem[]>([]);

// 管理员自定义假期
const adminHolidays = ref<HolidayItem[]>([]);

// 个人假期
const personalHolidays = ref<HolidayItem[]>([]);

// 合并所有假期，并按优先级处理重复日期
const mergedHolidays = computed(() => {
    const holidayMap = new Map<string, HolidayItem>();

    // 按优先级顺序添加假期，后添加的会覆盖先添加的
    // 1. 先添加国家法定节假日（优先级最低）
    nationalHolidays.value.forEach(holiday => {
        holidayMap.set(holiday.date, holiday);
    });

    // 2. 再添加管理员自定义假期（中等优先级）
    adminHolidays.value.forEach(holiday => {
        holidayMap.set(holiday.date, holiday);
    });

    // 3. 最后添加个人假期（最高优先级）
    personalHolidays.value.forEach(holiday => {
        holidayMap.set(holiday.date, holiday);
    });

    // 转换回数组
    return Array.from(holidayMap.values());
});

// 使用date-holidays获取国家法定节假日
const fetchNationalHolidays = () => {
    try {
        // 创建中国节假日实例
        const holidays = new Holidays('CN');

        // 获取当前年份的所有节假日
        const currentYear = new Date().getFullYear();
        const holidayList = holidays.getHolidays(currentYear);

        // 处理节假日数据
        const formattedHolidays: HolidayItem[] = holidayList.map(holiday => {
            // 处理日期格式，date-holidays返回的是Date对象
            const dateObj = new Date(holiday.date);
            const dateStr = dateObj.getFullYear() + '-' +
                String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
                String(dateObj.getDate()).padStart(2, '0');

            // 获取下一个颜色
            const color = getNextColor();

            return {
                date: dateStr,
                des: holiday.name,
                type: 'national',
                color: color
            };
        });

        // 不再自动添加周末标记，让FullCalendar自己处理周末的显示

        // 添加农历节日（如果不是法定节假日或周末）
        const lunarFestivals = getLunarFestivals(currentYear);
        lunarFestivals.forEach(festival => {
            // 检查该日期是否已经是节假日
            if (!formattedHolidays.some(h => h.date === festival.date)) {
                // 获取下一个颜色
                const color = getNextColor();

                formattedHolidays.push({
                    date: festival.date,
                    des: festival.name,
                    type: 'national',
                    color: color
                });
            } else {
                // 如果已经存在同一天的节假日，检查是否是相同节日的不同表达方式（如清明节）
                const existingHoliday = formattedHolidays.find(h => h.date === festival.date);
                if (existingHoliday) {
                    // 检查节日名称是否相似（如"清明节"和"清明"）
                    const existingName = existingHoliday.des.toLowerCase();
                    const newName = festival.name.toLowerCase();

                    // 如果节日名称相似，不添加重复节日
                    if (existingName.includes(newName) || newName.includes(existingName)) {
                        console.log(`跳过重复节日: ${festival.date} - ${festival.name} (已有 ${existingHoliday.des})`);
                    } else {
                        // 如果是不同节日，合并描述
                        existingHoliday.des = `${existingHoliday.des}/${festival.name}`;
                    }
                }
            }
        });

        nationalHolidays.value = formattedHolidays;
    } catch (error) {
        console.error('获取节假日数据失败:', error);
        nationalHolidays.value = [];
    }
};

// 获取指定年份的所有周末日期
const getWeekendsForYear = (year: number) => {
    const weekends: { date: string, type: string }[] = [];
    const startDate = new Date(year, 0, 1); // 1月1日
    const endDate = new Date(year, 11, 31); // 12月31日

    // 遍历该年的每一天
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const day = currentDate.getDay();

        // 0是周日，6是周六 - 这些是真正的周末
        if (day === 0) {
            weekends.push({
                date: currentDate.toISOString().split('T')[0],
                type: 'sunday' // 周日
            });
        } else if (day === 6) {
            weekends.push({
                date: currentDate.toISOString().split('T')[0],
                type: 'saturday' // 周六
            });
        }

        // 增加一天
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return weekends;
};

// 获取农历节日（使用lunar-javascript库获取准确的农历节日）
const getLunarFestivals = (year: number): { date: string, name: string }[] => {
    try {
        const festivals: { date: string, name: string }[] = [];

        // 春节（农历正月初一）
        const chunjie = Lunar.Lunar.fromYmd(year, 1, 1).getSolar();
        festivals.push({
            date: `${chunjie.getYear()}-${String(chunjie.getMonth()).padStart(2, '0')}-${String(chunjie.getDay()).padStart(2, '0')}`,
            name: '春节'
        });

        // 元宵节（农历正月十五）
        const yuanxiao = Lunar.Lunar.fromYmd(year, 1, 15).getSolar();
        festivals.push({
            date: `${yuanxiao.getYear()}-${String(yuanxiao.getMonth()).padStart(2, '0')}-${String(yuanxiao.getDay()).padStart(2, '0')}`,
            name: '元宵节'
        });

        // 端午节（农历五月初五）
        const duanwu = Lunar.Lunar.fromYmd(year, 5, 5).getSolar();
        festivals.push({
            date: `${duanwu.getYear()}-${String(duanwu.getMonth()).padStart(2, '0')}-${String(duanwu.getDay()).padStart(2, '0')}`,
            name: '端午节'
        });

        // 中秋节（农历八月十五）
        const zhongqiu = Lunar.Lunar.fromYmd(year, 8, 15).getSolar();
        festivals.push({
            date: `${zhongqiu.getYear()}-${String(zhongqiu.getMonth()).padStart(2, '0')}-${String(zhongqiu.getDay()).padStart(2, '0')}`,
            name: '中秋节'
        });

        // 清明节（使用节气计算）
        // const qingming = Lunar.Solar.fromYmd(year, 4, 5); // 清明节一般在4月4日或5日
        // festivals.push({
        //     date: `${qingming.getYear()}-${String(qingming.getMonth()).padStart(2, '0')}-${String(qingming.getDay()).padStart(2, '0')}`,
        //     name: '清明节'
        // });

        // 儿童节（公历6月1日）
        festivals.push({
            date: `${year}-06-01`,
            name: '儿童节'
        });

        // 劳动节（公历5月1日）
        festivals.push({
            date: `${year}-05-01`,
            name: '劳动节'
        });

        // 国庆节（公历10月1日）
        festivals.push({
            date: `${year}-10-01`,
            name: '国庆节'
        });

        return festivals;
    } catch (error) {
        console.error('获取农历节日失败:', error);
        // 如果出错，返回空数组
        return [];
    }
};

// 处理日期点击事件
const handleDateClick = (info: DateClickArg) => {
    // 使用点击的日期创建新事件
    const newEvent = {
        title: '新事件',
        start: info.dateStr, // 使用点击的日期
        end: new Date(new Date(info.dateStr).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 结束日期+1天
        allDay: true,
        backgroundColor: getNextEventColor(), // 添加颜色
    };

    // 添加新事件到数组
    events.value.push(newEvent);
    console.log('添加新事件:', newEvent);
    console.log('当前所有事件:', events.value);
};

// 处理事件点击事件
const handleEventClick = (info: EventClickArg) => {
    console.log('点击事件:', info.event.title);
    console.log('事件开始时间:', info.event.startStr);
    console.log('事件结束时间:', info.event.endStr);

    // 可以在这里添加编辑或删除事件的逻辑
    if (confirm(`是否删除事件 "${info.event.title}"?`)) {
        // 删除事件
        events.value = events.value.filter(event =>
            !(event.title === info.event.title &&
                event.start === info.event.startStr &&
                event.end === info.event.endStr)
        );
    }
};

// 初始化日历
const initCalendar = () => {
    fetchNationalHolidays();
};

// 添加事件
const addEvent = (event: EventItem) => {
    if (!event.backgroundColor) {
        event.backgroundColor = getNextEventColor();
    }
    events.value.push(event);
};

// 添加管理员假期
const addAdminHoliday = (holiday: Omit<HolidayItem, 'type' | 'color'>) => {
    adminHolidays.value.push({
        ...holiday,
        type: 'admin',
        color: getNextColor()
    });
};

// 添加个人假期
const addPersonalHoliday = (holiday: Omit<HolidayItem, 'type' | 'color'>) => {
    personalHolidays.value.push({
        ...holiday,
        type: 'personal',
        color: getNextColor()
    });
};

// 在组件挂载时初始化
onMounted(() => {
    initCalendar();
});

// 暴露给外部的方法和属性
defineExpose({
    events,
    addEvent,
    addAdminHoliday,
    addPersonalHoliday,
    initCalendar
});
</script>

<style scoped lang="scss">
:deep(.fc) {
    --fc-border-color: #ddd;
    --fc-today-bg-color: rgba(255, 220, 40, 0.15);
    --fc-button-bg-color: #2c3e50;
    --fc-button-border-color: #2c3e50;
    --fc-button-hover-bg-color: #1e2b37;
    --fc-button-hover-border-color: #1e2b37;
}

:deep(.fc-toolbar-title) {
    font-size: 1.5em !important;
    font-weight: bold;
}

:deep(.fc-button) {
    padding: 8px 12px !important;
    font-size: 1em !important;
}

:deep(.fc-col-header) {
    background-color: #f5f5f5;
}

:deep(.fc-day-today) {
    background-color: var(--fc-today-bg-color) !important;
}

:deep(.fc-daygrid-day-number) {
    font-size: 1.2em;
    font-weight: bold;
    padding: 8px !important;
}

:deep(.fc-daygrid-day) {
    min-height: 100px;
}
</style>
