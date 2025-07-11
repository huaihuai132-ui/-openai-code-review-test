export interface EventItem  {
    // 事件标题
    title: string;
    // 事件开始时间
    start: string;
    // 事件结束时间
    end: string;
    // 是否全天事件
    allDay?: boolean;
    // 背景颜色
    backgroundColor?: string;
    // 边框颜色
    borderColor?: string;
    // 文本颜色
    textColor?: string;
    // 自定义类名
    className?: string | string[];
    // 自定义数据
    extendedProps?: Record<string, any>;
}

// 节假日项定义
export interface HolidayItem {
    // 日期，格式为YYYY-MM-DD
    date: string;
    // 描述，如"双休"、"国庆"、"病假"等
    des: string;
    // 类型，用于确定优先级
    type?: 'national' | 'admin' | 'personal';
    // 颜色，可选，用于自定义显示颜色
    color?: string;
}