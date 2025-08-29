<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
<!--      <el-form-item label="会议发起人ID" prop="userId">-->
<!--        <el-input-->
<!--          v-model="queryParams.userId"-->
<!--          placeholder="请输入会议发起人ID"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--          class="!w-240px"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item label="会议名称" prop="meetName">
        <el-input
          v-model="queryParams.meetName"
          placeholder="请输入会议名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="会议类型" prop="meetType">
        <el-select
          v-model="queryParams.meetType"
          placeholder="请选择会议类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.MEET_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="会议日期" prop="meetDate">
        <el-date-picker
          v-model="queryParams.meetDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['business:oa-meeting:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:oa-meeting:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
<!--      <el-table-column label="会议ID" align="center" prop="id" />-->
<!--      <el-table-column label="会议发起人ID" align="center" prop="userId" />-->
      <el-table-column label="会议名称" align="center" prop="meetName" />
      <el-table-column label="会议类型" align="center" prop="meetType">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.MEET_TYPE" :value="scope.row.meetType" />
        </template>
      </el-table-column>
      <el-table-column label="会议日期" align="center" prop="meetDate" width="180px">
        <template #default="scope">
          {{ formatDate(scope.row.meetDate, 'YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime" :formatter="dateFormatter" width="180px" />
      <el-table-column label="结束时间" align="center" prop="endTime" :formatter="dateFormatter" width="180px" />
<!--      <el-table-column label="会议室ID" align="center" prop="meetRoomId" />-->
      <el-table-column label="会议事由" align="center" prop="reason" />
      <el-table-column label="会议概述" align="center" prop="description" />
      <el-table-column label="会议状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.MEET_STATUS" :value="scope.row.status || 0" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
<!--      <el-table-column label="文件id列表" align="center" prop="fileList" />-->
<!--      <el-table-column label="文件序列编码" align="center" prop="sequenceCode" />-->
      <el-table-column label="操作" align="center" min-width="180px">
        <template #default="scope">
          <el-button
            link
            type="info"
            @click="openDetail(scope.row.id)"
            v-hasPermi="['business:oa-meeting:query']"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:oa-meeting:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="warning"
            @click="sendApprove(scope.row.id)"
            v-hasPermi="['business:oa-meeting:sendApprove']"
            :disabled="sendApproveLoading[scope.row.id]"
            :loading="sendApproveLoading[scope.row.id]"
          >
            送审
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:oa-meeting:delete']"
          >
            删除
          </el-button>

        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <OaMeetingForm ref="formRef" @success="getList" />
  <!-- 详情弹窗 -->
  <OaMeetingDetail ref="detailRef" />
</template>

<script setup lang="ts">
import {DICT_TYPE, getStrDictOptions} from '@/utils/dict'
import {dateFormatter, formatDate} from '@/utils/formatTime'
import download from '@/utils/download'
import {OaMeetingApi, OaMeetingVO} from '@/api/business/oameeting'
import OaMeetingForm from './OaMeetingForm.vue'
import OaMeetingDetail from './OaMeetingDetail.vue'

/** 会议 列表 */
defineOptions({ name: 'OaMeeting' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<OaMeetingVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  meetName: undefined,
  meetType: undefined,
  meetDate: [],
  startTime: [],
  endTime: [],
  meetRoomId: undefined,
  reason: undefined,
  description: undefined,
  status: undefined,
  createTime: [],
  fileList: undefined,
  sequenceCode: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const sendApproveLoading = ref<Record<number, boolean>>({}) // 送审的加载中状态

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await OaMeetingApi.getOaMeetingPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 详情操作 */
const detailRef = ref()
const openDetail = (id: number) => {
  detailRef.value.open(id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await OaMeetingApi.deleteOaMeeting(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 送审按钮操作 */
const sendApprove = async (id: number) => {
  try {
    // 送审的二次确认
    await message.sendApproveConfirm()
    // 发起送审
    sendApproveLoading.value[id] = true
    await OaMeetingApi.updateOaMeeting({
      id,
      needApproval: true
    } as unknown as OaMeetingVO)
    message.success(t('common.sendApproveSuccess'))
    // 刷新列表
    await getList()
  } catch {
  } finally {
    sendApproveLoading.value[id] = false
  }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await OaMeetingApi.exportOaMeeting(queryParams)
    download.excel(data, '会议.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
