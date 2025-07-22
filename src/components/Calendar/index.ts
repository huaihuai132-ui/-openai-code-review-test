import { App } from 'vue';
import CalendarBase from './src/index.vue';
import CalendarComponent from './encapsulation/index.vue';

// 导出基础日历组件
export { CalendarBase };

// 导出封装的日历组件（推荐使用）
export { CalendarComponent };

// 默认导出封装的日历组件
export default CalendarComponent;

// 支持全局安装（可选）
export const install = (app: App) => {
    app.component('CalendarComponent', CalendarComponent);
    app.component('CalendarBase', CalendarBase);
};
