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
    try {
        // 使用lunar-javascript库获取农历信息
        const lunar = Lunar.Solar.fromDate(date).getLunar();
        return {
            lunarDay: lunar.getDayInChinese(),
            lunarMonth: lunar.getMonthInChinese() + '月',
            festival: lunar.getFestivals().join(',')
        };
    } catch (error) {
        console.error('获取农历信息失败:', error);
        return {
            lunarDay: '',
            lunarMonth: '',
            festival: ''
        };
    }
};

// 假期颜色循环数组
const holidayColors = [
    '#FF0066', // 红色
    '#FF66B2', // 粉色
    '#E6A23C', // 黄色
];
let holidayColorIndex = 0;

// 获取下一个假期颜色
const getNextHolidayColor = () => {
    const color = holidayColors[holidayColorIndex];
    holidayColorIndex = (holidayColorIndex + 1) % holidayColors.length;
    return color;
};

// 假期颜色映射缓存（避免同一个假期每次获取不同颜色）
const holidayColorCache = new Map<string, string>();

// 事件颜色循环数组
const eventColors = [
    '#409EFF', // 蓝色
    '#67C23A', // 绿色
    '#9933CC', // 紫色
];
let eventColorIndex = 0;

// 获取下一个事件颜色
const getNextEventColor = () => {
    const color = eventColors[eventColorIndex];
    eventColorIndex = (eventColorIndex + 1) % eventColors.length;
    return color;
};

// 事件颜色映射缓存
const eventColorCache = new Map<string, string>();

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
        // 为每个假期分配固定的颜色（基于日期+描述的组合）
        const cacheKey = `${holiday.date}-${holiday.des}`;
        let color = holidayColorCache.get(cacheKey);

        if (!color) {
            color = getNextHolidayColor();
            holidayColorCache.set(cacheKey, color);
        }

        return {
            text: holiday.des,
            color: color
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
                        // 处理事件数据，确保跨天事件正确显示并自动分配颜色
                        const processedEvents = props.events.map(event => {
                            const processedEvent = { ...event };

                            // 为每个事件分配固定的颜色（基于事件的唯一标识）
                            const cacheKey = event.id || `${event.start}-${event.description}`;
                            let eventColor = eventColorCache.get(cacheKey);

                            if (!eventColor) {
                                eventColor = getNextEventColor();
                                eventColorCache.set(cacheKey, eventColor);
                            }

                            processedEvent.backgroundColor = eventColor;

                            // 将数字类型的allDay转换为布尔值，以适配FullCalendar
                            if (typeof processedEvent.allDay === 'number') {
                                processedEvent.allDay = processedEvent.allDay === 1;
                            }

                            // 处理时间戳格式的开始和结束时间
                            if (typeof processedEvent.start === 'number') {
                                processedEvent.start = new Date(processedEvent.start).toISOString();
                            }
                            
                            if (typeof processedEvent.end === 'number') {
                                processedEvent.end = new Date(processedEvent.end).toISOString();
                            }

                            // 确保事件有标题显示
                            if (processedEvent.description) {
                                processedEvent.title = processedEvent.description;
                            }

                            if (processedEvent.end) {
                                if (processedEvent.allDay) {
                                    // 全天事件：确保结束日期包含完整的一天
                                    const startDate = new Date(processedEvent.start);
                                    const endDate = new Date(processedEvent.end);

                                    // 如果是跨天的全天事件，结束日期需要+1天
                                    if (startDate.toDateString() !== endDate.toDateString()) {
                                        const adjustedEndDate = new Date(endDate);
                                        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
                                        processedEvent.end = adjustedEndDate.toISOString().split('T')[0];
                                    }
                                } else {
                                    // 非全天事件：处理跨天时间事件
                                    const startDate = new Date(processedEvent.start);
                                    const endDate = new Date(processedEvent.end);

                                    // 如果是跨天事件，确保结束时间包含完整的最后一天
                                    if (startDate.toDateString() !== endDate.toDateString()) {
                                        // 如果结束时间不是午夜（00:00），则延长到第二天午夜
                                        if (endDate.getHours() !== 0 || endDate.getMinutes() !== 0 || endDate.getSeconds() !== 0) {
                                            const adjustedEndDate = new Date(endDate);
                                            adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
                                            adjustedEndDate.setHours(0, 0, 0, 0);
                                            processedEvent.end = adjustedEndDate.toISOString();
                                        }
                                    }
                                }
                            }

                            return processedEvent;
                        });

                        callback(processedEvents);
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
            console.log('Calendar: eventClick triggered', info);
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
                infoContainer.style.fontSize = '14px'; // 农历和节日字体大小
                infoContainer.style.lineHeight = '1.3';
                infoContainer.style.color = '#666';
                infoContainer.style.textAlign = 'center';
                infoContainer.style.padding = '3px 0';

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
                    // 格式化日期为YYYY-MM-DD格式
                    const dateStr = date.getFullYear() + '-' +
                        String(date.getMonth() + 1).padStart(2, '0') + '-' +
                        String(date.getDate()).padStart(2, '0');

                    // 先尝试从假期数据中获取周末信息
                    const holidayInfo = getHoliday(date);
                    let weekendColor;

                    if (holidayInfo) {
                        // 如果在假期数据中找到了周末信息，使用其颜色
                        weekendColor = holidayInfo.color;
                    } else {
                        // 如果没有在假期数据中找到，为这个周末分配一个颜色
                        const cacheKey = `${dateStr}-双休`;
                        weekendColor = holidayColorCache.get(cacheKey);
                        if (!weekendColor) {
                            weekendColor = getNextHolidayColor();
                            holidayColorCache.set(cacheKey, weekendColor);
                        }
                    }

                    // 将日期数字变为对应颜色
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
                    if (lunar.lunarDay) {
                        infoText += lunar.lunarDay;
                    }

                    // 如果没有节假日信息，且有农历节日，则显示农历节日
                    if (!hasHoliday && lunar.festival) {
                        if (infoText) infoText += ' ';
                        infoText += `<span style="color: #e63946;">${lunar.festival}</span>`;
                    }
                }

                // 添加节假日描述（如果有）
                if (hasHoliday) {
                    if (infoText) infoText += ' ';
                    infoText += `<span style="color: ${holidayColor};">${holidayText}</span>`;
                }

                // 即使没有内容，也添加一个空的容器以保持布局一致
                infoContainer.innerHTML = infoText || '&nbsp;';

                // 将信息添加到日期单元格中
                const cellContent = dayEl.querySelector('.fc-daygrid-day-top');
                if (cellContent) {
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
    // 重置颜色索引和缓存
    holidayColorIndex = 0;
    eventColorIndex = 0;
    holidayColorCache.clear();
    eventColorCache.clear();
    renderCalendar();
})

// 监听父组件传递的事件源
watch(() => props.events, () => {
    // 重置事件颜色索引和缓存
    eventColorIndex = 0;
    eventColorCache.clear();

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
    // 重置颜色索引和缓存
    holidayColorIndex = 0;
    eventColorIndex = 0;
    holidayColorCache.clear();
    eventColorCache.clear();

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

// 农历信息样式
:deep(.fc-daygrid-day-lunar-info) {
    font-size: 14px !important;
    line-height: 1.3 !important;
    color: #666 !important;
    text-align: center !important;
    padding: 3px 0 !important;
    margin-top: 3px !important;
    min-height: 18px !important;
    display: block !important;
    width: 100% !important;
}

// 确保日期单元格有足够的高度显示农历信息
:deep(.fc-daygrid-day) {
    min-height: 90px !important;
}

// 日期数字样式
:deep(.fc-daygrid-day-number) {
    font-size: 18px !important;
    font-weight: bold !important;
    padding: 6px !important;
}
</style>
