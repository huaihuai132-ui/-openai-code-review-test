<template>
    <div class="default-form">
        <div class="info-section">
            <div class="info-group">
                <div class="info-item">
                    <span class="info-label">申请人</span>
                    <el-input :value="data?.startUserNickname || '-'" disabled />
                </div>

                <div class="info-item">
                    <span class="info-label">所属部门</span>
                    <el-input :value="data?.startUserDeptName || '-'" disabled />
                </div>

                <div class="info-item">
                    <span class="info-label">申请时间</span>
                    <el-input :value="formatTime(data?.createTime)" disabled />
                </div>

                <div class="info-item">
                    <span class="info-label">流程名称</span>
                    <el-input :value="data?.processInstanceName || '-'" disabled />
                </div>

                <div class="info-item">
                    <span class="info-label">流程编号</span>
                    <el-input :value="data?.processInstanceId || '-'" disabled />
                </div>

                <div class="info-item">
                    <span class="info-label">当前节点</span>
                    <el-input :value="data?.taskName || '-'" disabled />
                </div>
            </div>
        </div>

        <div class="form-section">
            <div class="section-header">表单内容</div>

            <div v-if="formVariables && Object.keys(formVariables).length > 0" class="form-content">
                <div v-for="(value, key) in formVariables" :key="key" class="form-item">
                    <span class="form-label">{{ formatLabel(key) }}</span>
                    <el-input v-if="!isObject(value)" :value="value" disabled />
                    <div v-else class="object-value">
                        <pre>{{ JSON.stringify(value, null, 2) }}</pre>
                    </div>
                </div>
            </div>

            <div v-else class="empty-form">
                <el-empty description="暂无表单数据" />
            </div>
        </div>

        <div class="timeline-section">
            <div class="section-header">审批记录</div>

            <el-timeline>
                <el-timeline-item v-for="(activity, index) in activities" :key="index" :type="getActivityType(activity)"
                    :color="getActivityColor(activity)" :timestamp="activity.time">
                    {{ activity.content }}
                </el-timeline-item>
            </el-timeline>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatDate } from '@/utils/formatTime';

const props = defineProps<{
    data: any
}>();

// 格式化时间
const formatTime = (time) => {
    if (!time) return '-';
    return formatDate(time, 'YYYY-MM-DD HH:mm:ss');
};

// 表单变量
const formVariables = computed(() => {
    if (!props.data?.formVariables) return {};
    return props.data.formVariables;
});

// 格式化标签
const formatLabel = (key) => {
    if (!key) return '';
    // 将驼峰命名转换为空格分隔的标签
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
};

// 判断是否为对象
const isObject = (value) => {
    return typeof value === 'object' && value !== null;
};

// 模拟审批记录数据
const activities = ref([
    {
        content: '提交申请',
        time: '2023-06-18 10:00:00',
        type: 'primary',
        status: 'submit'
    },
    {
        content: '部门经理审批 - 张三 - 同意',
        time: '2023-06-18 11:30:00',
        type: 'success',
        status: 'approve'
    },
    {
        content: '财务审批 - 李四 - 同意',
        time: '2023-06-18 14:20:00',
        type: 'success',
        status: 'approve'
    },
    {
        content: '总经理审批 - 王五 - 处理中',
        time: '2023-06-18 15:00:00',
        type: 'warning',
        status: 'process'
    }
]);

// 获取活动类型
const getActivityType = (activity) => {
    if (activity.status === 'approve') return 'success';
    if (activity.status === 'reject') return 'danger';
    if (activity.status === 'process') return 'warning';
    if (activity.status === 'submit') return 'primary';
    return 'info';
};

// 获取活动颜色
const getActivityColor = (activity) => {
    if (activity.status === 'approve') return '#67C23A';
    if (activity.status === 'reject') return '#F56C6C';
    if (activity.status === 'process') return '#E6A23C';
    if (activity.status === 'submit') return '#409EFF';
    return '#909399';
};
</script>

<style scoped lang="scss">
.default-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info-section,
.form-section,
.timeline-section {
    background-color: #f5f7fa;
    border-radius: 5px;
    padding: 20px;
}

.section-header {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #303133;
}

.info-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-label {
    color: #606266;
    font-size: 14px;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    color: #606266;
    font-size: 14px;
}

.object-value {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 10px;
    max-height: 200px;
    overflow-y: auto;
}

.object-value pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
}

.empty-form {
    padding: 30px 0;
    display: flex;
    justify-content: center;
}

.timeline-section {
    margin-bottom: 20px;
}
</style>