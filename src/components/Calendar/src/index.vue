<template>
    <div id="calendar"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, PropType, watch } from 'vue';
import { Calendar, EventClickArg } from '@fullcalendar/core';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { EventItem, HolidayItem } from './types';
import Lunar from 'lunar-javascript';

let props = defineProps({
    // 语言
    locale: {
        type: String,
        default: 'zh-cn',
    },
    // 视图模式 年月日
    initialView: {
        type: String,
        default: 'dayGridMonth',
    },
    // 每周第一天（0表示周日，1表示周一）
    firstDay: {
        type: Number,
        default: 1, // 默认设置为周一
    },
    // 按钮文字
    buttonText: {
        type: Object,
        default: () => ({
            today: '今天',
            month: '月',
            week: '周',
            day: '日',
            prevYear: '上一年',
            nextYear: '下一年',
            prev: '上个月',
            next: '下个月',
        }),
    },
    // 头部工具栏
    headerToolbar: {
        type: Object,
        default: () => ({
            start: 'title',
            center: '',
            end: 'today prev,next',
        }),
    },
    // 底部工具栏
    footerToolbar: {
        type: Object,
        default: () => ({})
    },
    // 事件源
    events: {
        type: Array as PropType<EventItem[]>,
        default: () => [],
    },
    // 是否显示农历
    showLunar: {
        type: Boolean,
        default: true,
    },
    // 是否显示节假日
    showHoliday: {
        type: Boolean,
        default: true,
    },
    // 节假日列表 - 新的数据结构
    holidays: {
        type: Array as PropType<HolidayItem[]>,
        default: () => [],
    },
})

// 分发事件
let emits = defineEmits(['dateClick', 'eventClick']);

// 日历实例
let calendar = ref<Calendar>();

// 获取农历信息的函数
const getLunarDate = (date: Date) => {
    // 使用lunar-javascript库获取农历信息
    const lunar = Lunar.Solar.fromDate(date).getLunar();
    return {
        lunarDay: lunar.getDayInChinese(),
        lunarMonth: lunar.getMonthInChinese() + '月',
        festival: lunar.getFestivals().join(',')
    };
};

// 获取节假日信息的函数
const getHoliday = (date: Date) => {
    // 格式化日期为YYYY-MM-DD格式
    const dateStr = date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');

    // 查找匹配的节假日
    const holiday = props.holidays.find(h => h.date === dateStr);

    // 如果找到节假日，返回描述和颜色
    if (holiday) {
        return {
            text: holiday.des,
            color: holiday.color || 'red' // 默认使用红色，除非指定了其他颜色
        };
    }

    // 没有找到节假日
    return null;
};

// 渲染日历的方法
let renderCalendar = () => {
    let el = document.getElementById('calendar');
    if (!el) return;
    calendar.value = new Calendar(el, {
        // 语言
        locale: props.locale,
        // 自动高度
        height: 'auto',
        // 每周第一天（1表示周一）
        firstDay: props.firstDay,
        // 设置周末为周六和周日
        weekends: true,
        // 自定义日期单元格样式
        dayCellClassNames: (arg) => {
            const day = arg.date.getDay();
            // 周六和周日添加特殊样式
            if (day === 0 || day === 6) {
                return ['weekend-day'];
            }
            return [];
        },
        // 日历插件
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: props.initialView,
        buttonText: props.buttonText,
        headerToolbar: props.headerToolbar,
        footerToolbar: props.footerToolbar,
        eventSources: [
            {
                // 渲染日历的事件
                events(e, callback) {
                    if (props.events.length > 0) {
                        callback(props.events);
                    } else {
                        callback([])
                    }
                }
            }
        ],
        // 点击日历上的某一天
        dateClick: (info: DateClickArg) => {
            emits('dateClick', info);
        },
        eventClick: (info: EventClickArg) => {
            emits('eventClick', info);
        },
        // 自定义日期单元格渲染
        dayCellDidMount: (arg) => {
            // 只有在启用相关功能时才添加农历和节假日信息
            if (props.showLunar || props.showHoliday) {
                const date = arg.date;
                const dayEl = arg.el;

                // 创建一个容器来放置额外信息
                const infoContainer = document.createElement('div');
                infoContainer.className = 'fc-daygrid-day-lunar-info';
                infoContainer.style.fontSize = '10px';
                infoContainer.style.lineHeight = '1.2';
                infoContainer.style.color = '#666';
                infoContainer.style.textAlign = 'center';
                infoContainer.style.padding = '2px 0';

                let infoText = '';
                let hasHoliday = false;
                let holidayColor = '';
                let holidayText = '';

                // 添加节假日信息（优先级更高）
                if (props.showHoliday) {
                    const holiday = getHoliday(date);
                    if (holiday) {
                        hasHoliday = true;
                        holidayColor = holiday.color;
                        holidayText = holiday.text;

                        // 将日期数字变为对应颜色
                        const dateNum = dayEl.querySelector('.fc-daygrid-day-number');
                        if (dateNum) {
                            dateNum.style.color = holidayColor;
                            dateNum.style.fontWeight = 'bold';
                        }
                    }
                }

                // 检查是否是周末
                const day = date.getDay();
                if (day === 0 || day === 6) {
                    // 如果是周末，添加周末标记
                    const weekendText = day === 0 ? '周日' : '周六';
                    const weekendColor = '#FF6666'; // 红色

                    // 将日期数字变为红色
                    const dateNum = dayEl.querySelector('.fc-daygrid-day-number');
                    if (dateNum && !hasHoliday) {
                        dateNum.style.color = weekendColor;
                        dateNum.style.fontWeight = 'bold';
                    }

                    // 如果没有其他节假日，添加周末标记
                    if (!hasHoliday) {
                        hasHoliday = true;
                        holidayColor = weekendColor;
                        holidayText = `双休`;
                    }
                }

                // 添加农历信息
                if (props.showLunar) {
                    const lunar = getLunarDate(date);
                    // 只显示农历日期
                    infoText += lunar.lunarDay;

                    // 如果没有节假日信息，且有农历节日，则显示农历节日
                    if (!hasHoliday && lunar.festival) {
                        infoText += ` <span style="color: #e63946;">${lunar.festival}</span>`;
                    }
                }

                // 添加节假日描述（如果有）
                if (hasHoliday) {
                    if (infoText) infoText += ' ';
                    infoText += `<span style="color: ${holidayColor};">${holidayText}</span>`;
                }

                infoContainer.innerHTML = infoText;

                // 将信息添加到日期单元格中
                const cellContent = dayEl.querySelector('.fc-daygrid-day-top');
                if (cellContent && infoText) {
                    cellContent.after(infoContainer);
                }
            }
        }
    })
    calendar.value.render();
}

// 刷新日历事件的方法
const refreshEvents = () => {
    if (calendar.value) {
        calendar.value.getEventSources().forEach(eventSource => {
            eventSource.refetch();
        });
    }
};

onMounted(() => {
    renderCalendar();
})

// 监听父组件传递的事件源
watch(() => props.events, () => {
    // 如果日历已经初始化，只需要刷新事件
    if (calendar.value) {
        refreshEvents();
    } else {
        // 如果日历未初始化，重新渲染整个日历
        renderCalendar();
    }
}, { deep: true });

// 监听农历、节假日显示配置和节假日列表的变化
watch([() => props.showLunar, () => props.showHoliday, () => props.holidays], () => {
    // 重新渲染日历以应用新的配置
    if (calendar.value) {
        calendar.value.destroy();
        renderCalendar();
    }
}, { deep: true });

// 暴露刷新方法给父组件
defineExpose({
    refreshEvents
});
</script>

<style scoped lang="scss">
:deep(.weekend-day) {
    background-color: rgba(255, 240, 240, 0.3);
}
</style>