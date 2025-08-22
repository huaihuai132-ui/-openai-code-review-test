<template>
  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <!-- <el-table-column label="请假表单主键" align="center" prop="id" /> -->
       <el-table-column label="请假类型" align="center">
        <template #default="scope">
          <span>{{ scope.row.type === '4' ? '年假' : scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="请假原因" align="center" prop="reason" />
      <el-table-column
        label="开始时间"
        align="center"
        prop="startTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="结束时间"
        align="center"
        prop="endTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="请假天数" align="center" prop="day" />
      <el-table-column label="请假结果" align="center">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status || 0" />
        </template>
      </el-table-column>
      <el-table-column label="流程实例的编号" align="center" prop="processInstanceId" />
      <!-- <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      /> -->
    </el-table>
  </ContentWrap>
</template>
<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { OaAnnualLeaveApi } from '@/api/business/oaannualleave'
import { DICT_TYPE } from '@/utils/dict'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const props = defineProps<{
  userId?: number // 申请人的用户编号（主表的关联字段）
}>()
const loading = ref(false) // 列表的加载中
const list = ref([]) // 列表的数据

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    list.value = await OaAnnualLeaveApi.getOaFormLeaveListByUserId(props.userId)
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
