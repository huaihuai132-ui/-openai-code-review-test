export interface EventItem  {
    // 事件ID（可选，用于唯一标识）
    id?: string;
    // 事件开始时间（可以是时间戳或日期时间字符串）
    start: number | string;
    // 事件结束时间（可以是时间戳或日期时间字符串）
    end?: number | string;
    // 是否全天事件 (0=非全天, 1=全天)
    allDay?: number;
    // 事件描述
    description?: string;
    // 背景颜色（前端自动分配）
    backgroundColor?: string;
    // 边框颜色（可选）
    borderColor?: string;
    // 文字颜色（可选）
    textColor?: string;
    // 是否启用提醒 (0=关闭, 1=启用)
    reminder_enabled?: number;
    // 提前提醒分钟数
    reminder_minutes?: number;
}

// 节假日项定义
export interface HolidayItem {
    // id
    id?: number;
    // 日期，格式为YYYY-MM-DD
    date: string;
    // 描述，如"双休"、"国庆"、"病假"等
    des: string;
    // 类型，用于确定优先级和自动分配颜色
    type?: number;
    // 假期关联码，拥有相同假期关联码的表，会同时被创建和删除
    ref: string;

}
