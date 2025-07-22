<template>
    <div>
        <MCalendar :events="events" :holidays="mergedHolidays" :showLunar="true" :showHoliday="true"
            @dateClick="handleDateClick" @eventClick="handleEventClick" />

        <!-- 日期详情弹框 -->
        <el-dialog v-model="dateDialogVisible" :title="`${selectedDate} 详情`" width="600px" destroy-on-close>
            <div v-if="selectedDateInfo">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="公历日期">{{ selectedDateInfo.solarDate }}</el-descriptions-item>
                    <el-descriptions-item label="农历日期">{{ selectedDateInfo.lunarDate }}</el-descriptions-item>
                    <el-descriptions-item label="星期">{{ selectedDateInfo.weekDay }}</el-descriptions-item>
                    <el-descriptions-item label="假日信息">
                        <el-tag v-if="selectedDateInfo.holiday" :type="getTagType(selectedDateInfo.holiday.type)"
                            effect="light">
                            {{ selectedDateInfo.holiday.des }}
                        </el-tag>
                        <span v-else>无</span>
                    </el-descriptions-item>
                </el-descriptions>

                <el-divider>当日事件</el-divider>

                <div v-if="selectedDateEvents.length > 0">
                    <el-card v-for="event in selectedDateEvents" :key="event.id" class="event-card" shadow="hover">
                        <div class="event-item">
                            <div class="event-header">
                                <span class="event-title">{{ event.description }}</span>
                                <div class="event-actions">
                                    <el-button type="primary" size="small" @click="editEvent(event)">编辑</el-button>
                                    <el-button type="danger" size="small" @click="deleteEvent(event)">删除</el-button>
                                </div>
                            </div>
                            <div class="event-details">
                                <p><strong>开始时间:</strong> {{ formatEventTime(event.start, event.allDay) }}</p>
                                <p v-if="event.end"><strong>结束时间:</strong> {{ formatEventTime(event.end, event.allDay)
                                    }}</p>
                                <p><strong>全天事件:</strong> {{ event.allDay === 1 ? '是' : '否' }}</p>
                                <p v-if="event.description"><strong>描述:</strong> {{ event.description }}</p>
                                <p><strong>事件提醒:</strong> {{ event.reminder_enabled === 1 ? '已启用' : '未启用' }}</p>
                                <p v-if="event.reminder_enabled === 1"><strong>提前提醒:</strong> {{ event.reminder_minutes
                                    || 30 }} 分钟前</p>
                            </div>
                        </div>
                    </el-card>
                </div>
                <el-empty v-else description="当日无事件" />

                <div class="dialog-footer">
                    <el-button type="primary" @click="addNewEvent">添加新事件</el-button>
                </div>
            </div>
        </el-dialog>

        <!-- 事件详情/编辑弹框 -->
        <el-dialog v-model="eventDialogVisible" :title="isEditMode ? '编辑事件' : '新建事件'" width="500px" destroy-on-close>
            <el-form :model="eventForm" :rules="eventRules" ref="eventFormRef" label-width="100px">
                <el-form-item label="事件描述" prop="description">
                    <el-input v-model="eventForm.description" placeholder="请输入事件" />
                </el-form-item>
                <el-form-item label="全天事件">
                    <el-switch v-model="eventForm.allDay" @change="handleAllDayChange" :active-value="1"
                        :inactive-value="0" />
                </el-form-item>

                <el-form-item label="开始时间" prop="start">
                    <el-date-picker v-model="eventForm.start" :type="eventForm.allDay === 1 ? 'date' : 'datetime'"
                        :placeholder="eventForm.allDay === 1 ? '选择开始日期' : '选择开始时间'"
                        :format="eventForm.allDay === 1 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                        :value-format="eventForm.allDay === 1 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                        style="width: 100%" />
                </el-form-item>

                <el-form-item label="结束时间" prop="end">
                    <el-date-picker v-model="eventForm.end" :type="eventForm.allDay === 1 ? 'date' : 'datetime'"
                        :placeholder="eventForm.allDay === 1 ? '选择结束日期' : '选择结束时间'"
                        :format="eventForm.allDay === 1 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                        :value-format="eventForm.allDay === 1 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                        style="width: 100%" />
                </el-form-item>

                <el-form-item label="事件提醒">
                    <el-switch v-model="eventForm.reminder_enabled" active-text="启用提醒" inactive-text="关闭提醒"
                        :active-value="1" :inactive-value="0" />
                </el-form-item>

                <el-form-item label="提前提醒" v-if="eventForm.reminder_enabled">
                    <el-input-number v-model="eventForm.reminder_minutes" :min="1" :max="10080" :step="5"
                        style="width: 200px" />
                    <span style="margin-left: 8px; color: #666;">分钟前</span>
                </el-form-item>

            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="eventDialogVisible = false">取消</el-button>
                    <el-button v-if="isEditMode" type="danger" @click="deleteCurrentEvent">删除事件</el-button>
                    <el-button type="primary" @click="saveEvent">{{ isEditMode ? '保存' : '创建' }}</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 查看事件弹窗 -->
        <el-dialog v-model="viewEventDialogVisible" title="查看事件" width="500px" destroy-on-close>
            <el-form :model="viewEventForm" label-width="100px">
                <el-form-item label="事件描述">
                    <el-input v-model="viewEventForm.description" disabled />
                </el-form-item>
                <el-form-item label="全天事件">
                    <el-switch v-model="viewEventForm.allDay" :active-value="1" :inactive-value="0" disabled />
                </el-form-item>
                <el-form-item label="开始时间">
                    <el-date-picker v-model="viewEventForm.start"
                        :type="viewEventForm.allDay === 1 ? 'date' : 'datetime'"
                        :placeholder="viewEventForm.allDay === 1 ? '选择开始日期' : '选择开始时间'"
                        :format="viewEventForm.allDay === 1 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                        :value-format="viewEventForm.allDay === 1 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                        style="width: 100%" disabled />
                </el-form-item>
                <el-form-item label="结束时间">
                    <el-date-picker v-model="viewEventForm.end" :type="viewEventForm.allDay === 1 ? 'date' : 'datetime'"
                        :placeholder="viewEventForm.allDay === 1 ? '选择结束日期' : '选择结束时间'"
                        :format="viewEventForm.allDay === 1 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                        :value-format="viewEventForm.allDay === 1 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                        style="width: 100%" disabled />
                </el-form-item>
                <el-form-item label="事件提醒">
                    <el-switch v-model="viewEventForm.reminder_enabled" :active-value="1" :inactive-value="0"
                        disabled />
                </el-form-item>
                <el-form-item label="提前提醒" v-if="viewEventForm.reminder_enabled">
                    <el-input-number v-model="viewEventForm.reminder_minutes" :min="1" :max="10080" :step="5"
                        style="width: 200px" disabled />
                    <span style="margin-left: 8px; color: #666;">分钟前</span>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="viewEventDialogVisible = false">关闭</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineExpose, reactive } from 'vue';
import { EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import { EventItem, HolidayItem } from '@/components/Calendar/src/types';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { getEvents, createEvent, updateEvent, deleteEvent as deleteEventApi } from '@/api/todo/events';
import { getHolidays, BackendHolidayItem } from '@/api/todo/holiday';
import MCalendar from '@/components/Calendar/src/index.vue';
import Holidays from 'date-holidays';
import Lunar from 'lunar-javascript';

// 使用Holidays库
const hd = new Holidays();

// 根据假期类型获取Tag类型
const getTagType = (type?: number) => {
    switch (type) {
        case 2: // 法定节日
            return 'danger';  // 红色
        case 0: // 管理员设置的公共假期
            return 'success'; // 绿色
        case 1: // 个人假期
            return 'primary'; // 蓝色
        default:
            return 'warning'; // 黄色
    }
};

// 事件数据
let events = ref<EventItem[]>([]);

// API 相关方法
const fetchEventsFromApi = async () => {
    try {
        return await getEvents();
    } catch (error) {
        console.error('获取事件列表失败:', error);
        ElMessage.error('获取事件列表失败');
        return [];
    }
};

const saveEventToApi = async (eventData: EventItem) => {
    try {
        return await createEvent(eventData);
    } catch (error) {
        console.error('保存事件失败:', error);
        ElMessage.error('保存事件失败');
        throw error;
    }
};

const updateEventToApi = async (eventData: EventItem) => {
    try {
        if (!eventData.id) {
            throw new Error('事件ID不能为空');
        }
        return await updateEvent(eventData);
    } catch (error) {
        console.error('更新事件失败:', error);
        ElMessage.error('更新事件失败');
        throw error;
    }
};

const deleteEventFromApi = async (eventId: string) => {
    try {
        return await deleteEventApi(eventId);
    } catch (error) {
        console.error('删除事件失败:', error);
        ElMessage.error('删除事件失败');
        throw error;
    }
};

// 弹框相关数据
const dateDialogVisible = ref(false);
const eventDialogVisible = ref(false);
const isEditMode = ref(false);
const selectedDate = ref('');
const selectedDateInfo = ref<any>(null);
const selectedDateEvents = ref<EventItem[]>([]);
const currentEditEvent = ref<EventItem | null>(null);
const eventFormRef = ref<FormInstance>();
const viewEventDialogVisible = ref(false);
const viewEventForm = reactive({
    start: '',
    end: '',
    allDay: 0,
    description: '',
    reminder_enabled: 0,
    reminder_minutes: 30
});

// 事件表单数据
const eventForm = reactive({
    start: '',
    end: '',
    allDay: 0,
    description: '',
    reminder_enabled: 0,
    reminder_minutes: 30
});

// 表单验证规则
const eventRules: FormRules = {
    description: [
        { required: true, message: '请输入事件描述', trigger: 'blur' }
    ],
    start: [
        { required: true, message: '请选择开始时间', trigger: 'change' }
    ],
    end: [
        { required: false, message: '请选择结束时间', trigger: 'change' }
    ]
};



// 国家法定节假日（包含双休日）
const nationalHolidays = ref<HolidayItem[]>([]);

// 后端假期数据（包含管理员假期和个人假期）
const backendHolidays = ref<HolidayItem[]>([]);

// 合并所有假期，并按优先级处理重复日期
const mergedHolidays = computed(() => {
    const holidayMap = new Map<string, HolidayItem>();

    // 按优先级顺序添加假期，后添加的会覆盖先添加的
    // 1. 先添加国家法定节假日和双休日（优先级最低）
    nationalHolidays.value.forEach(holiday => {
        holidayMap.set(holiday.date, holiday);
    });

    // 2. 按type排序后端假期数据，确保type值小的优先级更高
    const sortedBackendHolidays = [...backendHolidays.value].sort((a, b) => {
        // 如果type不存在，默认为最低优先级
        const typeA = typeof a.type === 'number' ? a.type : 999;
        const typeB = typeof b.type === 'number' ? b.type : 999;
        return typeA - typeB;
    });

    // 按优先级添加后端假期数据
    sortedBackendHolidays.forEach(holiday => {
        // 如果已经存在同一天的假期，只有当新假期的type值更小时才替换
        const existingHoliday = holidayMap.get(holiday.date);
        if (!existingHoliday ||
            (typeof holiday.type === 'number' &&
                typeof existingHoliday.type === 'number' &&
                holiday.type < existingHoliday.type)) {
            holidayMap.set(holiday.date, holiday);
        }
    });

    // 转换回数组
    return Array.from(holidayMap.values());
});

// 使用date-holidays获取国家法定节假日
const fetchNationalHolidays = async () => {
    try {
        // 创建中国节假日实例
        hd.init('CN');

        // 获取当前年份的所有节假日
        const currentYear = new Date().getFullYear();
        const holidayList = hd.getHolidays(currentYear);

        // 处理节假日数据
        const formattedHolidays: HolidayItem[] = holidayList.map(holiday => {
            // 处理日期格式，date-holidays返回的是Date对象
            const dateObj = new Date(holiday.date);
            const dateStr = dateObj.getFullYear() + '-' +
                String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
                String(dateObj.getDate()).padStart(2, '0');

            return {
                date: dateStr,
                des: holiday.name,
                type: 2,
                ref: 'system'
            };
        });

        // 添加周末（双休日）
        const weekends = getWeekendsOfYear(currentYear);
        weekends.forEach(weekend => {
            // 检查该日期是否已经是节假日
            if (!formattedHolidays.some(h => h.date === weekend)) {
                formattedHolidays.push({
                    date: weekend,
                    des: '双休',
                    type: 2,
                    ref: 'system'
                });
            }
        });

        // 添加农历节日（如果不是法定节假日或周末）
        const lunarFestivals = getLunarFestivals(currentYear);
        lunarFestivals.forEach(festival => {
            // 检查该日期是否已经是节假日
            if (!formattedHolidays.some(h => h.date === festival.date)) {
                formattedHolidays.push({
                    date: festival.date,
                    des: festival.name,
                    type: 2,
                    ref: festival.ref
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
                        // 跳过重复节日
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

// 从后端获取假期数据（管理员假期和个人假期）
const fetchBackendHolidays = async () => {
    try {
        const holidays = await getHolidays();

        // 处理后端返回的假期数据
        const formattedHolidays: HolidayItem[] = holidays.map((holiday: BackendHolidayItem) => {
            // 检查日期格式，处理可能的数组格式 [year, month, day]
            let dateStr = '';
            if (holiday.date) {
                if (Array.isArray(holiday.date) && holiday.date.length === 3) {
                    // 处理数组格式 [year, month, day]
                    const year = holiday.date[0];
                    const month = String(holiday.date[1]).padStart(2, '0');
                    const day = String(holiday.date[2]).padStart(2, '0');
                    dateStr = `${year}-${month}-${day}`;
                } else if (typeof holiday.date === 'string') {
                    // 如果已经是字符串格式
                    dateStr = holiday.date;
                } else if (typeof holiday.date === 'number') {
                    // 如果是时间戳格式
                    const date = new Date(holiday.date);
                    dateStr = formatDateToYYYYMMDD(date);
                }
            }

            return {
                id: holiday.id,
                date: dateStr,
                des: holiday.des,
                type: holiday.type || 0,
                ref: holiday.ref
            };
        }).filter(holiday => holiday.date); // 过滤掉没有有效日期的假期

        backendHolidays.value = formattedHolidays;
    } catch (error) {
        console.error('获取后端假期数据失败:', error);
        backendHolidays.value = [];
    }
};

// 获取农历节日（使用lunar-javascript库获取准确的农历节日）
const getLunarFestivals = (year: number): { date: string, name: string, ref: string }[] => {
    try {
        const festivals: { date: string, name: string, ref: string }[] = [];

        // 春节（农历正月初一）
        const chunjie = Lunar.Lunar.fromYmd(year, 1, 1).getSolar();
        festivals.push({
            date: `${chunjie.getYear()}-${String(chunjie.getMonth()).padStart(2, '0')}-${String(chunjie.getDay()).padStart(2, '0')}`,
            name: '春节',
            ref: 'system'
        });

        // 元宵节（农历正月十五）
        const yuanxiao = Lunar.Lunar.fromYmd(year, 1, 15).getSolar();
        festivals.push({
            date: `${yuanxiao.getYear()}-${String(yuanxiao.getMonth()).padStart(2, '0')}-${String(yuanxiao.getDay()).padStart(2, '0')}`,
            name: '元宵节',
            ref: 'system'
        });

        // 端午节（农历五月初五）
        const duanwu = Lunar.Lunar.fromYmd(year, 5, 5).getSolar();
        festivals.push({
            date: `${duanwu.getYear()}-${String(duanwu.getMonth()).padStart(2, '0')}-${String(duanwu.getDay()).padStart(2, '0')}`,
            name: '端午节',
            ref: 'system'
        });

        // 中秋节（农历八月十五）
        const zhongqiu = Lunar.Lunar.fromYmd(year, 8, 15).getSolar();
        festivals.push({
            date: `${zhongqiu.getYear()}-${String(zhongqiu.getMonth()).padStart(2, '0')}-${String(zhongqiu.getDay()).padStart(2, '0')}`,
            name: '中秋节',
            ref: 'system'
        });

        // 清明节（使用节气计算）
        // const qingming = Lunar.Solar.fromYmd(year, 4, 5); // 清明节一般在4月4日或5日
        // festivals.push({
        //     date: `${qingming.getYear()}-${String(qingming.getMonth()).padStart(2, '0')}-${String(qingming.getDay()).padStart(2, '0')}`,
        //     name: '清明节',
        //     ref: 'system'
        // });

        // 儿童节（公历6月1日）
        festivals.push({
            date: `${year}-06-01`,
            name: '儿童节',
            ref: 'system'
        });

        // 劳动节（公历5月1日）
        festivals.push({
            date: `${year}-05-01`,
            name: '劳动节',
            ref: 'system'
        });

        // 国庆节（公历10月1日）
        festivals.push({
            date: `${year}-10-01`,
            name: '国庆节',
            ref: 'system'
        });

        return festivals;
    } catch (error) {
        console.error('获取农历节日失败:', error);
        // 如果出错，返回空数组
        return [];
    }
};

// 获取农历信息
const getLunarInfo = (date: Date) => {
    try {
        const lunar = Lunar.Solar.fromDate(date).getLunar();
        return {
            lunarDay: lunar.getDayInChinese(),
            lunarMonth: lunar.getMonthInChinese() + '月',
            festival: lunar.getFestivals().join(','),
            fullLunar: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
        };
    } catch (error) {
        console.error('获取农历信息失败:', error);
        return {
            lunarDay: '',
            lunarMonth: '',
            festival: '',
            fullLunar: ''
        };
    }
};

// 获取星期信息
const getWeekDay = (date: Date) => {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekDays[date.getDay()];
};

// 获取一年中所有的周末（周六和周日）
const getWeekendsOfYear = (year: number): string[] => {
    const weekends: string[] = [];
    const startDate = new Date(year, 0, 1); // 1月1日
    const endDate = new Date(year, 11, 31); // 12月31日

    // 遍历这一年的每一天
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const day = currentDate.getDay();
        // 如果是周六(6)或周日(0)
        if (day === 0 || day === 6) {
            const dateStr = currentDate.getFullYear() + '-' +
                String(currentDate.getMonth() + 1).padStart(2, '0') + '-' +
                String(currentDate.getDate()).padStart(2, '0');
            weekends.push(dateStr);
        }
        // 增加一天
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return weekends;
};

// 格式化事件时间显示
const formatEventTime = (timeStr: string | number, isAllDay?: number | boolean) => {
    if (!timeStr) return '';

    const date = typeof timeStr === 'number' ? new Date(timeStr) : new Date(timeStr);

    if (isAllDay === 1 || isAllDay === true) {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } else {
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// 处理日期点击事件
const handleDateClick = (info: DateClickArg) => {
    const clickedDate = new Date(info.dateStr);
    selectedDate.value = info.dateStr;

    // 获取农历信息
    const lunarInfo = getLunarInfo(clickedDate);

    // 获取假日信息
    const holiday = mergedHolidays.value.find(h => h.date === info.dateStr);

    // 获取当日事件（包括跨天事件）
    const dayEvents = events.value.filter(event => {
        // 将时间戳转换为Date对象
        const eventStart = typeof event.start === 'number'
            ? new Date(event.start)
            : new Date(event.start);

        const eventEnd = event.end
            ? (typeof event.end === 'number'
                ? new Date(event.end)
                : new Date(event.end))
            : new Date(event.start);

        // 检查点击的日期是否在事件的时间范围内
        const clickedDateStart = new Date(clickedDate);
        clickedDateStart.setHours(0, 0, 0, 0);

        const clickedDateEnd = new Date(clickedDate);
        clickedDateEnd.setHours(23, 59, 59, 999);

        // 事件开始时间 <= 点击日期结束时间 && 事件结束时间 >= 点击日期开始时间
        return eventStart <= clickedDateEnd && eventEnd >= clickedDateStart;
    });

    selectedDateInfo.value = {
        solarDate: info.dateStr,
        lunarDate: lunarInfo.fullLunar,
        weekDay: getWeekDay(clickedDate),
        holiday: holiday || null
    };

    selectedDateEvents.value = dayEvents;
    dateDialogVisible.value = true;
};

// 处理事件点击事件
const handleEventClick = (info: EventClickArg) => {
    console.log('handleEventClick called', info);

    // 尝试通过多种方式找到对应的事件
    let event: EventItem | undefined;

    // 1. 先尝试通过ID查找
    if (info.event.id) {
        event = events.value.find(e => e.id === info.event.id);
    }

    // 2. 如果没找到，尝试通过开始时间匹配
    if (!event && info.event.startStr) {
        const startStr = info.event.startStr;
        event = events.value.find(e => {
            if (typeof e.start === 'number') {
                // 如果是时间戳，转换为ISO字符串进行比较
                const dateStr = new Date(e.start).toISOString();
                return dateStr === startStr;
            } else {
                // 如果是字符串，直接比较
                return e.start === startStr;
            }
        });
    }

    // 3. 如果还没找到，尝试通过标题/描述匹配
    if (!event && info.event.title) {
        event = events.value.find(e => e.description === info.event.title);
    }

    console.log('Found event:', event);

    if (event) {
        // 直接打开查看事件弹窗
        viewEvent(event);

        // 然后再打开日期详情
        const dateStr = typeof event.start === 'number'
            ? formatDateToYYYYMMDD(new Date(event.start))
            : event.start.split(' ')[0];

        console.log('Opening date dialog for:', dateStr);
        handleDateClick({ dateStr } as DateClickArg);
    } else {
        console.error('Event not found in events array');
        ElMessage.warning('无法找到事件详情');
    }
};

// 刷新日期事件列表
const refreshDateEvents = () => {
    if (dateDialogVisible.value && selectedDate.value) {
        const clickedDate = new Date(selectedDate.value);
        const dayEvents = events.value.filter(evt => {
            // 将时间戳转换为Date对象
            const eventStart = typeof evt.start === 'number'
                ? new Date(evt.start)
                : new Date(evt.start);

            const eventEnd = evt.end
                ? (typeof evt.end === 'number'
                    ? new Date(evt.end)
                    : new Date(evt.end))
                : new Date(evt.start);

            const clickedDateStart = new Date(clickedDate);
            clickedDateStart.setHours(0, 0, 0, 0);

            const clickedDateEnd = new Date(clickedDate);
            clickedDateEnd.setHours(23, 59, 59, 999);

            return eventStart <= clickedDateEnd && eventEnd >= clickedDateStart;
        });
        selectedDateEvents.value = dayEvents;
    }
};

// 加载事件列表
const loadEvents = async () => {
    try {
        const eventsData = await fetchEventsFromApi();
        events.value = eventsData;
    } catch (error) {
        console.error('加载事件列表失败:', error);
    }
};

// 初始化日历
const initCalendar = async () => {
    // 并行加载国家节假日、后端假期数据和事件数据
    await Promise.all([
        fetchNationalHolidays(),
        fetchBackendHolidays(),
        loadEvents()
    ]);
};

// 重置事件表单
const resetEventForm = () => {
    eventForm.start = '';
    eventForm.end = '';
    eventForm.allDay = 0;
    eventForm.description = '';
    eventForm.reminder_enabled = 0;
    eventForm.reminder_minutes = 30;
};

// 添加新事件
const addNewEvent = () => {
    resetEventForm();
    isEditMode.value = false;

    // 如果是从日期点击进来的，设置默认日期
    if (selectedDate.value) {
        if (eventForm.allDay === 1) {
            eventForm.start = selectedDate.value;
            eventForm.end = selectedDate.value;
        } else {
            eventForm.start = selectedDate.value + ' 09:00';
            eventForm.end = selectedDate.value + ' 10:00';
        }
    }

    eventDialogVisible.value = true;
};

// 编辑事件
const editEvent = (event: EventItem) => {
    resetEventForm();
    isEditMode.value = true;
    currentEditEvent.value = event;

    eventForm.allDay = event.allDay ? 1 : 0;
    eventForm.description = event.description || '';
    eventForm.reminder_enabled = event.reminder_enabled || 0;
    eventForm.reminder_minutes = event.reminder_minutes || 30;

    // 将时间戳转换为字符串格式（如果需要）
    let startDate: Date;
    let endDate: Date | null = null;

    // 处理开始时间
    if (typeof event.start === 'number') {
        startDate = new Date(event.start);
    } else {
        startDate = new Date(event.start);
    }

    // 处理结束时间
    if (event.end) {
        if (typeof event.end === 'number') {
            endDate = new Date(event.end);
        } else {
            endDate = new Date(event.end);
        }
    }

    // 根据是否为全天事件处理时间格式
    if (event.allDay) {
        // 全天事件只显示日期
        eventForm.start = formatDateToYYYYMMDD(startDate);
        eventForm.end = endDate ? formatDateToYYYYMMDD(endDate) : formatDateToYYYYMMDD(startDate);
    } else {
        // 非全天事件显示完整时间
        eventForm.start = formatDateToYYYYMMDDHHMM(startDate);
        eventForm.end = endDate ? formatDateToYYYYMMDDHHMM(endDate) : '';
    }

    eventDialogVisible.value = true;
};

// 格式化日期为YYYY-MM-DD格式
const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 格式化日期为YYYY-MM-DD HH:MM格式
const formatDateToYYYYMMDDHHMM = (date: Date): string => {
    const dateStr = formatDateToYYYYMMDD(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
};

// 处理全天事件切换
const handleAllDayChange = (value: number) => {
    if (value === 1) {
        // 切换到全天事件，只保留日期部分
        if (eventForm.start) {
            eventForm.start = eventForm.start.split(' ')[0];
        }
        if (eventForm.end) {
            eventForm.end = eventForm.end.split(' ')[0];
        }
    } else {
        // 切换到非全天事件，添加默认时间
        if (eventForm.start) {
            if (!eventForm.start.includes(' ')) {
                eventForm.start += ' 09:00';
            }
        }
        if (eventForm.end) {
            if (!eventForm.end.includes(' ')) {
                eventForm.end += ' 10:00';
            }
        } else if (eventForm.start) {
            // 如果没有结束时间，设置为开始时间后1小时
            const startDate = new Date(eventForm.start);
            if (!isNaN(startDate.getTime())) {
                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 加1小时
                eventForm.end = endDate.toISOString().slice(0, 16);
            }
        }
    }
};

// 生成唯一ID
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 保存事件
const saveEvent = async () => {
    if (!eventFormRef.value) return;

    try {
        await eventFormRef.value.validate();

        // 格式化时间，确保传递给后端的时间格式正确
        let startTime = eventForm.start;
        let endTime = eventForm.end || '';

        // 确保时间格式正确
        if (eventForm.allDay === 1) {
            // 全天事件，添加时间部分
            startTime = startTime + ' 00:00:00';
            endTime = endTime ? endTime + ' 23:59:59' : '';
        } else {
            // 非全天事件，确保时间格式完整
            if (startTime && !startTime.includes(':')) {
                startTime = startTime + ' 00:00:00';
            }
            if (endTime && !endTime.includes(':')) {
                endTime = endTime + ' 00:00:00';
            }
        }

        // 将时间字符串转换为时间戳
        const startTimestamp = startTime ? new Date(startTime).getTime() : 0;
        const endTimestamp = endTime ? new Date(endTime).getTime() : undefined;

        const eventData: EventItem = {
            start: startTimestamp,
            end: endTimestamp,
            allDay: eventForm.allDay,
            description: eventForm.description,
            reminder_enabled: eventForm.reminder_enabled,
            reminder_minutes: eventForm.reminder_minutes
        };

        if (isEditMode.value && currentEditEvent.value) {
            // 编辑模式：更新现有事件
            eventData.id = currentEditEvent.value.id;

            try {
                const result = await updateEventToApi(eventData);
                // 处理后端返回的结果
                if (result) {
                    // 更新成功，重新加载事件列表
                    await loadEvents();
                    ElMessage.success('事件更新成功');
                    eventDialogVisible.value = false;

                    // 如果是从日期详情页面打开的，刷新日期详情
                    if (dateDialogVisible.value) {
                        refreshDateEvents();
                    }
                } else {
                    ElMessage.error('事件更新失败');
                }
            } catch (error) {
                ElMessage.error('事件更新失败');
            }
        } else {
            // 新建模式：添加新事件
            try {
                const result = await saveEventToApi(eventData);
                // 处理后端返回的结果
                if (result) {
                    // 保存成功，重新加载事件列表
                    await loadEvents();
                    ElMessage.success('事件创建成功');
                    eventDialogVisible.value = false;

                    // 如果是从日期详情页面打开的，刷新日期详情
                    if (dateDialogVisible.value) {
                        refreshDateEvents();
                    }
                } else {
                    ElMessage.error('事件创建失败');
                }
            } catch (error) {
                ElMessage.error('事件创建失败');
            }
        }
    } catch (error) {
        console.error('表单验证失败:', error);
    }
};

// 删除当前编辑的事件
const deleteCurrentEvent = async () => {
    if (!currentEditEvent.value) return;

    await deleteEvent(currentEditEvent.value);
    eventDialogVisible.value = false;
};

// 删除事件
const deleteEvent = async (event: EventItem) => {
    try {
        await ElMessageBox.confirm('确定要删除这个事件吗？', '确认删除', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
        });

        // 调用后端删除接口
        if (event.id) {
            try {
                const result = await deleteEventFromApi(event.id);
                if (result) {
                    // 删除成功，重新加载事件列表
                    await loadEvents();
                    ElMessage.success('事件删除成功');

                    // 如果是从日期详情页面删除的，刷新日期详情
                    if (dateDialogVisible.value) {
                        refreshDateEvents();
                    }
                } else {
                    ElMessage.error('事件删除失败');
                }
            } catch (error) {
                ElMessage.error('事件删除失败');
            }
        } else {
            ElMessage.error('事件ID不能为空');
        }
    } catch (error) {
        // 用户取消删除或其他错误
    }
};

// 添加事件（保留原有方法以兼容）
const addEvent = async (event: EventItem) => {
    // 确保allDay属性是数字类型
    const eventToSave: EventItem = {
        ...event,
        allDay: typeof event.allDay === 'boolean' ? (event.allDay ? 1 : 0) : event.allDay
    };

    try {
        // 后端不保存颜色信息，颜色由前端自动分配
        const result = await saveEventToApi(eventToSave);

        // 处理后端返回的结果
        if (result) {
            // 重新加载事件列表
            await loadEvents();
            ElMessage.success('事件添加成功');
        } else {
            ElMessage.error('事件添加失败');
        }
    } catch (error) {
        ElMessage.error('事件添加失败');
    }
};

// 重新加载后端假期数据
const reloadBackendHolidays = async () => {
    await fetchBackendHolidays();
};

// 查看事件（只读弹窗）
const viewEvent = (event: EventItem) => {
    console.log('viewEvent called with:', event);

    viewEventForm.allDay = event.allDay ? 1 : 0;
    viewEventForm.description = event.description || '';
    viewEventForm.reminder_enabled = event.reminder_enabled || 0;
    viewEventForm.reminder_minutes = event.reminder_minutes || 30;

    let startDate: Date;
    let endDate: Date | null = null;

    // 处理开始时间
    if (typeof event.start === 'number') {
        startDate = new Date(event.start);
    } else {
        startDate = new Date(event.start);
    }

    // 处理结束时间
    if (event.end) {
        if (typeof event.end === 'number') {
            endDate = new Date(event.end);
        } else {
            endDate = new Date(event.end);
        }
    }

    // 根据是否为全天事件处理时间格式
    if (event.allDay) {
        // 全天事件只显示日期
        viewEventForm.start = formatDateToYYYYMMDD(startDate);
        viewEventForm.end = endDate ? formatDateToYYYYMMDD(endDate) : formatDateToYYYYMMDD(startDate);
    } else {
        // 非全天事件显示完整时间
        viewEventForm.start = formatDateToYYYYMMDDHHMM(startDate);
        viewEventForm.end = endDate ? formatDateToYYYYMMDDHHMM(endDate) : '';
    }

    console.log('Opening view dialog with form data:', viewEventForm);
    viewEventDialogVisible.value = true;
    console.log('viewEventDialogVisible set to:', viewEventDialogVisible.value);
};

// 在组件挂载时初始化
onMounted(() => {
    initCalendar();
});

// 暴露给外部的方法和属性
defineExpose({
    events,
    addEvent,
    initCalendar,
    loadEvents,
    reloadBackendHolidays
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

// 弹框样式
.event-card {
    margin-bottom: 12px;

    .event-item {
        .event-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .event-title {
                font-weight: bold;
                font-size: 16px;
                color: #303133;
            }

            .event-actions {
                display: flex;
                gap: 8px;
            }
        }

        .event-details {
            color: #606266;
            font-size: 14px;

            p {
                margin: 4px 0;
            }
        }
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
}

// 日期详情弹框样式
:deep(.el-descriptions) {
    margin-bottom: 20px;
}

:deep(.el-divider) {
    margin: 20px 0;
}

:deep(.el-empty) {
    padding: 40px 0;
}
</style>
