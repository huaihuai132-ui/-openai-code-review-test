<template>
    <ContentWrap title="融资租赁申请">
        <div class="tip-container">
            <el-alert
                title="提示"
                type="info"
                :closable="false"
                show-icon
                description="融资租赁业务申请请前往融资租赁业务菜单操作"
            />
        </div>
    </ContentWrap>
</template>
<script lang="ts" setup>
defineOptions({ name: 'BpmOAFinanceLeaseCreate' })
</script>
<style scoped>
.tip-container {
    padding: 40px;
    text-align: center;
}

.tip-container :deep(.el-alert) {
    text-align: center;
}

.tip-container :deep(.el-alert__content) {
    text-align: center;
}

.tip-container :deep(.el-alert__description) {
    text-align: center;
}
</style>
