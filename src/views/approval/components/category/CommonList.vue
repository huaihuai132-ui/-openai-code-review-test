<template>
    <div class="approval-category">
        <div class="search-container">
            <!-- 搜索工作栏 -->
            <div class="search-row">
                <el-form ref="queryFormRef" :inline="true">
                    <el-form-item :label="searchLabel" prop="createTime">
                        <el-date-picker v-model="queryParams.createTime"
                            :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]" class="!w-240px"
                            end-placeholder="结束日期" start-placeholder="开始日期" type="daterange"
                            value-format="YYYY-MM-DD HH:mm:ss" />
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="handleQuery">
                            <Icon class="mr-5px" icon="ep:search" />
                            搜索
                        </el-button>
                        <el-button @click="resetQuery">
                            <Icon class="mr-5px" icon="ep:refresh" />
                            重置
                        </el-button>
                    </el-form-item>
                </el-form>

                <!-- 分类标签筛选 - 仅在指定分类中显示 -->
                <div v-if="showCategoryTags" class="category-tags">
                    <div v-for="tag in categoryTags" :key="tag.value"
                        :class="['category-tag', { 'category-tag-selected': isTagSelected(tag.value) }, tag.colorClass]"
                        @click="toggleCategoryFilter(tag.value)">
                        {{ tag.label }}
                        <i v-if="isTagSelected(tag.value)" class="el-icon-check tag-check-icon"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="card-container">
            <div class="card-list">
                <div class="card-item" v-for="(item, index) in filteredData" :key="index"
                    @click="handleCardClick(item)">
                    <div class="card-header">
                        <span>{{ getProcessName(item) }}</span>
                        <span v-if="category === 'apply'" class="status-badge" :class="getStatusClass(item)">{{
                            getStatusText(item) }}</span>
                        <span v-else-if="isNew(item)" class="badge">新</span>
                    </div>

                    <div class="card-detail">
                        <!-- 公共字段 -->
                        <div class="user-info" v-if="['waiting', 'done', 'copy'].includes(category)">
                            <el-avatar :size="40" :src="getAvatar(item)" />
                            <div class="user-meta">
                                <div class="user-name">{{ getUserName(item) }}</div>
                                <div class="user-dept" v-if="getDeptName(item)">{{ getDeptName(item) }}</div>
                            </div>
                        </div>

                        <!-- 流程名称 - 不在抄送我的中显示，因为已在卡片头部显示 -->
                        <div class="detail-item" v-if="category !== 'copy'">
                            <span class="label">流程名称：</span>
                            <span class="value">{{ getProcessInstanceName(item) }}</span>
                        </div>

                        <!-- 流程分类 -->
                        <div class="detail-item" v-if="item.categoryName">
                            <span class="label">流程分类：</span>
                            <span class="value">{{ item.categoryName }}</span>
                        </div>

                        <!-- 申请/发起时间 -->
                        <div class="detail-item">
                            <span class="label">{{ getTimeLabel() }}：</span>
                            <span class="value">{{ formatTime(getTimeValue(item)) }}</span>
                        </div>

                        <!-- 待审批特有字段 -->
                        <div class="detail-item" v-if="category === 'waiting'">
                            <span class="label">到达时间：</span>
                            <span class="value">{{ getTimeDiff(item.createTime) }}</span>
                        </div>

                        <!-- 已审批特有字段 -->
                        <div class="detail-item" v-if="category === 'done'">
                            <span class="label">审批结果：</span>
                            <span class="value" :class="getResultClass(item)"> {{ item.reason === "" ? '待审批' :
                                item.reason || '待审批' }}</span>
                        </div>

                        <!-- 我申请的特有字段 -->
                        <div class="detail-item" v-if="category === 'apply'">
                            <span class="label">当前节点：</span>
                            <div class="value">
                                <!-- 审批中状态 -->
                                <template v-if="item.status === 1 && item.tasks?.length > 0">
                                    <!-- 单人审批 -->
                                    <template v-if="item.tasks.length === 1">
                                        <span>
                                            <span class="approver-name">{{ item.tasks[0].assigneeUser?.nickname
                                            }}</span>
                                            ({{ item.tasks[0].name }}) 审批中
                                        </span>
                                    </template>
                                    <!-- 多人审批 -->
                                    <template v-else>
                                        <span>
                                            <span class="approver-name">{{ item.tasks[0].assigneeUser?.nickname
                                            }}</span>
                                            等 {{ item.tasks.length }} 人 ({{ item.tasks[0].name }})审批中
                                        </span>
                                    </template>
                                </template>
                                <!-- 非审批中状态 -->
                                <template v-else>
                                    <dict-tag :type="'bpm_process_instance_status'" :value="item.status" />
                                </template>
                            </div>
                        </div>

                        <!-- 抄送我的特有字段 -->
                        <div class="detail-item" v-if="category === 'copy'">
                            <div class="copy-info">
                                <span class="label">抄送人：</span>
                                <div class="copy-user">
                                    <el-avatar :size="24" :src="getCopyUserAvatar(item)" />
                                    <span>{{ getCopyUserName(item) }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="detail-item" v-if="category === 'copy' && item.processInstanceName">
                            <span class="label">流程名称：</span>
                            <span class="value">{{ item.processInstanceName }}</span>
                        </div>

                        <div class="detail-item" v-if="category === 'copy'">
                            <span class="label">抄送节点：</span>
                            <span class="value">{{ item.activityName || '-' }}</span>
                        </div>

                        <div class="detail-item" v-if="category === 'copy' && item.reason">
                            <span class="label">抄送意见：</span>
                            <span class="value">{{ item.reason }}</span>
                        </div>

                        <div class="detail-item" v-if="category === 'copy' && item.processInstance">
                            <span class="label">流程状态：</span>
                            <span class="value">
                                <dict-tag :type="'bpm_process_instance_status'" :value="item.processInstance.status" />
                            </span>
                        </div>
                    </div>
                </div>

                <div v-if="filteredData.length === 0" class="empty-container">
                    <el-empty :description="getEmptyText()" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { formatDate } from '@/utils/formatTime';
import { getLastReadTime } from '@/utils/cache';
import { getDictLabel } from '@/utils/dict';
import defaultAvatar from '@/assets/imgs/avatar.gif';
import { getSimpleDeptList } from '@/api/system/dept';
import { CategoryApi } from '@/api/bpm/category';

const props = defineProps<{
    data: any[];
    category: 'waiting' | 'done' | 'apply' | 'copy';
    showCategoryTags?: boolean;
}>();

const emit = defineEmits(['select-card', 'search']);

// 查询参数
const queryParams = reactive({
    createTime: [],
    categoryFilter: [] as string[]
});

const queryFormRef = ref();
const deptMap = ref<Map<number, string>>(new Map());
const categoryTags = ref<Array<{ label: string, value: string, colorClass: string }>>([]);

// 初始化时加载部门信息和分类信息
const loadInitialData = async () => {
    try {
        // 加载部门信息
        const deptList = await getSimpleDeptList();
        deptList.forEach(dept => {
            if (dept.id) {
                deptMap.value.set(dept.id, dept.name);
            }
        });

        // 加载流程分类
        const categories = await CategoryApi.getCategorySimpleList();
        categoryTags.value = categories.map((cat, index) => {
            // 为标签分配不同的颜色
            const colorClasses = ['tag-default', 'tag-success', 'tag-warning', 'tag-danger', 'tag-info'];
            const colorClass = colorClasses[index % colorClasses.length];
            return {
                label: cat.name,
                value: cat.code,
                colorClass
            };
        });
    } catch (error) {
        console.error('加载初始数据失败', error);
    }
};

// 判断标签是否被选中
const isTagSelected = (value: string) => {
    return queryParams.categoryFilter.includes(value);
};

// 切换分类筛选
const toggleCategoryFilter = (value: string) => {
    const index = queryParams.categoryFilter.indexOf(value);
    if (index > -1) {
        queryParams.categoryFilter.splice(index, 1);
    } else {
        queryParams.categoryFilter.push(value);
    }
    handleQuery();
};

// 过滤后的数据
const filteredData = computed(() => {
    if (!props.data) return [];

    let result = [...props.data];

    // 按创建时间筛选
    if (queryParams.createTime && queryParams.createTime.length === 2) {
        const startTime = new Date(queryParams.createTime[0]).getTime();
        const endTime = new Date(queryParams.createTime[1]).getTime();

        result = result.filter(item => {
            const itemTime = new Date(getTimeValue(item)).getTime();
            return itemTime >= startTime && itemTime <= endTime;
        });
    }

    // 按分类筛选
    if (queryParams.categoryFilter.length > 0) {
        result = result.filter(item => {
            let categoryCode;

            // 根据不同的分类获取categoryCode
            if (props.category === 'copy') {
                // 抄送分类：直接从item.category获取
                categoryCode = item.category;
            } else {
                // 其他分类：从多个可能的位置获取
                categoryCode = item.category ||
                    (item.processDefinition ? item.processDefinition.category : null) ||
                    (item.processInstance ? item.processInstance.category : null);
            }

            return queryParams.categoryFilter.includes(categoryCode);
        });
    }

    return result;
});

// 获取部门名称
const getDeptName = (item) => {
    let deptId;
    if (props.category === 'copy') {
        deptId = item.startUser?.deptId;
    } else {
        deptId = item.processInstance?.startUser?.deptId;
    }

    if (!deptId) return '';
    return deptMap.value.get(deptId) || '未知部门';
};

// 获取流程名称
const getProcessName = (item) => {
    if (props.category === 'copy') {
        return item.processDefinitionName || '流程抄送';
    } else if (props.category === 'apply') {
        return item.name || '我的申请';
    } else {
        return item.processInstance?.name || item.processDefinitionName || getDefaultTitle();
    }
};

// 获取流程实例名称
const getProcessInstanceName = (item) => {
    if (props.category === 'copy') {
        return item.processInstanceName || '-';
    } else if (props.category === 'apply') {
        return item.name || '-';
    } else {
        return item.processInstance?.name || item.processInstanceName || '-';
    }
};

// 获取用户头像
const getAvatar = (item) => {
    if (props.category === 'copy') {
        return item.startUser?.avatar || defaultAvatar;
    } else {
        return item.processInstance?.startUser?.avatar || defaultAvatar;
    }
};

// 获取用户名称
const getUserName = (item) => {
    if (props.category === 'copy') {
        return item.startUser?.nickname || '-';
    } else {
        return item.processInstance?.startUser?.nickname || '-';
    }
};

// 获取抄送人头像
const getCopyUserAvatar = (item) => {
    return item.createUser?.avatar || item.startUser?.avatar || defaultAvatar;
};

// 获取抄送人名称
const getCopyUserName = (item) => {
    return item.createUser?.nickname || item.startUser?.nickname || '系统';
};

// 获取时间标签
const getTimeLabel = () => {
    switch (props.category) {
        case 'waiting': return '申请时间';
        case 'done': return '审批时间';
        case 'apply': return '申请时间';
        case 'copy': return '抄送时间';
        default: return '时间';
    }
};

// 获取时间值
const getTimeValue = (item) => {
    switch (props.category) {
        case 'waiting': return item.processInstance?.createTime || item.createTime;
        case 'done': return item.createTime;
        case 'apply': return item.startTime;
        case 'copy': return item.createTime;
        default: return item.createTime;
    }
};

// 计算时间差值
const getTimeDiff = (time: string) => {
    if (!time) return '-';

    const now = new Date().getTime();
    const timestamp = new Date(time).getTime();
    const diff = now - timestamp;

    // 超过15天显示"很久以前"
    if (diff > 15 * 24 * 60 * 60 * 1000) {
        return '很久以前';
    }

    // 计算天数
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    if (days > 0) {
        return `${days}天前`;
    }

    // 计算小时
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours > 0) {
        return `${hours}小时前`;
    }

    // 计算分钟
    const minutes = Math.floor(diff / (60 * 1000));
    if (minutes > 0) {
        return `${minutes}分钟前`;
    }

    // 小于1分钟
    return '刚刚';
};

// 搜索标签
const searchLabel = computed(() => {
    return getTimeLabel();
});

// 获取默认标题
const getDefaultTitle = () => {
    switch (props.category) {
        case 'waiting': return '待审批';
        case 'done': return '已审批';
        case 'apply': return '我的申请';
        case 'copy': return '抄送我的';
        default: return '流程';
    }
};

// 获取空数据文本
const getEmptyText = () => {
    switch (props.category) {
        case 'waiting': return '暂无待审批数据';
        case 'done': return '暂无已审批数据';
        case 'apply': return '暂无申请数据';
        case 'copy': return '暂无抄送数据';
        default: return '暂无数据';
    }
};

// 处理卡片点击
const handleCardClick = (item) => {
    emit('select-card', item);
};

// 格式化时间
const formatTime = (time) => {
    if (!time) return '-';
    return formatDate(time, 'YYYY-MM-DD HH:mm:ss');
};

// 判断是否为新数据
const isNew = (item) => {
    const lastReadTime = getLastReadTime(`approval_${props.category}_last_read`);
    return item.createTime > lastReadTime;
};

// 获取审批结果样式类
const getResultClass = (item) => {
    if (item.result === 'approve') return 'result-approve';
    if (item.result === 'reject') return 'result-reject';
    if (item.result === 'cancel') return 'result-cancel';
    return '';
};

// 获取状态文本
const getStatusText = (item) => {
    if (item.status === 'finish') return '已完成';
    if (item.status === 'process') return '处理中';
    if (item.status === 'reject') return '已驳回';
    if (item.status === 'cancel') return '已取消';

    // 尝试从字典中获取
    const statusLabel = getDictLabel('bpm_process_instance_status', item.status);
    if (statusLabel) return statusLabel;

    return '未知';
};

// 获取状态样式类
const getStatusClass = (item) => {
    if (item.status === 'finish') return 'status-finish';
    if (item.status === 'process') return 'status-process';
    if (item.status === 'reject') return 'status-reject';
    if (item.status === 'cancel') return 'status-cancel';
    return '';
};

// 搜索
const handleQuery = () => {
    emit('search', queryParams);
};

// 重置
const resetQuery = () => {
    queryFormRef.value?.resetFields();
    queryParams.createTime = [];
    queryParams.categoryFilter = [];
    handleQuery();
};

// 初始化时加载数据
loadInitialData();
</script>

<style scoped lang="scss">
.approval-category {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.search-container {
    padding: 16px 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.search-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.category-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: auto;
}

.category-tag {
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    border: 1px solid #e4e7ed;
    background-color: #f5f7fa;
    color: #909399;
    user-select: none;
}

.category-tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-tag-selected {
    background-color: #ecf5ff;
    color: #409EFF;
    border-color: #d9ecff;
}

.tag-success {
    background-color: #f0f9eb;
    color: #67c23a;
    border-color: #e1f3d8;
}

.tag-success.category-tag-selected {
    background-color: #67c23a;
    color: white;
}

.tag-warning {
    background-color: #fdf6ec;
    color: #e6a23c;
    border-color: #faecd8;
}

.tag-warning.category-tag-selected {
    background-color: #e6a23c;
    color: white;
}

.tag-danger {
    background-color: #fef0f0;
    color: #f56c6c;
    border-color: #fde2e2;
}

.tag-danger.category-tag-selected {
    background-color: #f56c6c;
    color: white;
}

.tag-info {
    background-color: #f4f4f5;
    color: #909399;
    border-color: #e9e9eb;
}

.tag-info.category-tag-selected {
    background-color: #909399;
    color: white;
}

.tag-check-icon {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 10px;
}

.card-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 15px 0;
}

.card-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 25px 30px;
    width: 100%;
    max-width: 1200px;
    padding: 10px;
}

.card-item {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    padding: 16px 25px;
    margin-bottom: 0;
    height: fit-content;

    /* 参差感效果 - 使偶数列卡片向下偏移 */
    &:nth-child(even) {
        transform: translateY(15px);
    }

    /* 参差感效果 - 使每隔4个的卡片有不同的内边距和边框 */
    &:nth-child(4n+1) {
        padding-bottom: 25px;
        border-left: 3px solid #67c23a;
    }

    &:nth-child(4n+2) {
        padding-top: 25px;
        border-right: 3px solid #e6a23c;
    }

    &:nth-child(4n+3) {
        border-bottom: 3px solid #409EFF;
    }

    &:nth-child(4n+4) {
        border-top: 3px solid #f56c6c;
    }

    /* 添加渐变顶边 - 仅在悬停时显示 */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(to right, #409EFF, #67c23a);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover {
        transform: translateY(-5px) scale(1.01) !important;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        z-index: 1;

        &::before {
            opacity: 1;
        }
    }
}

.card-header {
    font-weight: bold;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px dashed #ebeef5;
    font-size: 15px;
}

.card-detail {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.user-info {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    padding: 6px;
    background-color: #f8f9fa;
    border-radius: 6px;
}

.user-meta {
    margin-left: 10px;
    flex: 1;
    overflow: hidden;
}

.user-name {
    font-weight: 500;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-dept {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.detail-item {
    margin-bottom: 8px;
    display: flex;
    flex-wrap: wrap;
}

.label {
    color: #606266;
    margin-right: 8px;
    min-width: 70px;
    font-weight: 500;
    font-size: 13px;
}

.value {
    color: #303133;
    flex: 1;
    word-break: break-all;
    font-size: 13px;
}

.badge {
    background-color: #FFB800;
    color: white;
    border-radius: 10px;
    padding: 2px 10px;
    font-size: 12px;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.6;
    }

    100% {
        opacity: 1;
    }
}

.status-badge {
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 12px;
    color: white;
}

.status-finish {
    background-color: #67C23A;
}

.status-process {
    background-color: #409EFF;
}

.status-reject {
    background-color: #F56C6C;
}

.status-cancel {
    background-color: #909399;
}

.result-approve {
    color: #67C23A;
}

.result-reject {
    color: #F56C6C;
}

.result-cancel {
    color: #909399;
}

.empty-container {
    padding: 40px 0;
    display: flex;
    justify-content: center;
}

.copy-info {
    display: flex;
    align-items: center;
    width: 100%;
}

.copy-user {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 5px;
}

.approver-name {
    color: #409EFF;
    font-weight: 500;
}

@media (max-width: 768px) {
    .search-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .category-tags {
        margin-left: 0;
        margin-top: 10px;
    }

    .card-list {
        grid-template-columns: 1fr;
        width: 100%;
    }

    .card-item:nth-child(even) {
        transform: none;
    }
}
</style>