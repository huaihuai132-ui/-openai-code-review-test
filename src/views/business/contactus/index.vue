<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="128px"
    >
      <el-form-item label="用户ID（可选，如为登录用户）" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID（可选，如为登录用户）"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="联系人姓名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入联系人姓名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入联系电话"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="联系邮箱" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="请输入联系邮箱"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-240px"
        >
          <el-option label="待处理" :value="1" />
          <el-option label="处理中" :value="2" />
          <el-option label="已回复" :value="3" />
          <el-option label="已关闭" :value="4" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="文件编号（用于关联上传的附件）" prop="fileId">
        <el-input
          v-model="queryParams.fileId"
          placeholder="请输入文件编号（用于关联上传的附件）"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <!-- <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item> -->
      <el-form-item label="部门编号" prop="deptId">
        <el-input
          v-model="queryParams.deptId"
          placeholder="请输入部门编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['business:oa-contact-us:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:oa-contact-us:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <!-- <el-button
          type="danger"
          plain
          @click="handleBatchDelete"
          :disabled="selectedIds.length === 0"
          v-hasPermi="['business:oa-contact-us:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
        </el-button> -->
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <!-- <el-table-column label="主键ID" align="center" prop="id" /> -->
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="留言内容" align="center" prop="messageContent" />
      <el-table-column label="联系人姓名" align="center" prop="name" />
      <el-table-column label="联系电话" align="center" prop="phone" />
      <el-table-column label="联系邮箱" align="center" prop="email" />
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormatter" />
      <el-table-column label="文件编号（用于关联上传的附件）" align="center" prop="fileId" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="部门编号" align="center" prop="deptId" />
      <el-table-column label="操作" align="center" min-width="180px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openDetail(scope.row.id)"
          >
            查看
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['business:oa-contact-us:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['business:oa-contact-us:delete']"
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
  <ContactUsForm ref="formRef" @success="getList" />

  <!-- 详情弹窗 -->
  <ContactUsDetail ref="detailRef" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { OaContactUsApi, OaContactUsVO } from 'src/api/business/contactus'
import ContactUsForm from './ContactUsForm.vue'
import ContactUsDetail from './ContactUsDetail.vue'

/** 联系我们 列表 */
defineOptions({ name: 'OaContactUs' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<OaContactUsVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  messageContent: undefined,
  name: undefined,
  phone: undefined,
  email: undefined,
  status: undefined,
  fileId: undefined,
  createTime: [],
  deptId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const selectedIds = ref<number[]>([]) // 选中的ID列表

/** 状态格式化 */
const statusFormatter = (row: OaContactUsVO) => {
  const statusMap = {
    1: '待处理',
    2: '处理中',
    3: '已回复',
    4: '已关闭'
  }
  return statusMap[row.status] || '未知'
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await OaContactUsApi.getOaContactUsPage(queryParams)
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

/** 查看详情操作 */
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
    await OaContactUsApi.deleteOaContactUs(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 处理选择变化 */
const handleSelectionChange = (selection: OaContactUsVO[]) => {
  selectedIds.value = selection.map(item => item.id)
}

/** 批量删除按钮操作 */
const handleBatchDelete = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起批量删除
    await OaContactUsApi.deleteOaContactUsList(selectedIds.value)
    message.success(t('common.delSuccess'))
    // 清空选择
    selectedIds.value = []
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await OaContactUsApi.exportOaContactUs(queryParams)
    download.excel(data, '联系我们.xls')
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
