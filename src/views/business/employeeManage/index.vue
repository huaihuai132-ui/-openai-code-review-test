<template>
  <div class="employee-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <Icon icon="ep:user" class="title-icon" />
            员工管理
          </h1>
          <p class="page-subtitle">管理企业员工信息，包括基本资料、部门岗位等</p>
        </div>
        <div class="header-right">
          <div class="stats-cards">
            <div class="stat-card">
              <div class="stat-number">{{ employeeStats.totalEmployees }}</div>
              <div class="stat-label">总员工数</div>
            </div>
            <div class="stat-card active">
              <div class="stat-number">{{ employeeStats.activeEmployees }}</div>
              <div class="stat-label">在职员工</div>
            </div>
            <div class="stat-card inactive">
              <div class="stat-number">{{ employeeStats.inactiveEmployees }}</div>
              <div class="stat-label">离职员工</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <div class="search-container">
        <!-- 主搜索框 -->
        <div class="main-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索员工姓名、工号、手机号..."
            size="large"
            clearable
            @input="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <Icon icon="ep:search" />
            </template>
          </el-input>
        </div>

        <!-- 筛选器 -->
        <div class="filters">
          <el-select
            v-model="queryParams.status"
            placeholder="员工状态"
            clearable
            @change="handleQuery"
            class="filter-select"
          >
            <el-option label="全部状态" value="" />
            <el-option label="在职" :value="0" />
            <el-option label="离职" :value="1" />
          </el-select>

          <el-tree-select
            v-model="queryParams.deptId"
            :data="deptTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            placeholder="选择部门"
            clearable
            check-strictly
            @change="handleQuery"
            class="filter-select"
          />

          <el-button @click="showAdvancedSearch = !showAdvancedSearch" class="filter-btn">
            <Icon icon="ep:operation" class="mr-1" />
            高级筛选
          </el-button>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <el-button
            type="primary"
            size="large"
            @click="openForm('create')"
            v-hasPermi="['business:employee:create']"
            class="action-btn primary"
          >
            <Icon icon="ep:plus" class="mr-2" />
            添加员工
          </el-button>

          <el-dropdown @command="handleBatchAction" class="batch-dropdown">
            <el-button size="large" :disabled="!selectedIds.length" class="action-btn">
              批量操作
              <Icon icon="ep:arrow-down" class="ml-1" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="export">
                  <Icon icon="ep:download" class="mr-2" />
                  导出选中
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>
                  <Icon icon="ep:delete" class="mr-2" />
                  批量删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 高级搜索面板 -->
      <el-collapse-transition>
        <div v-show="showAdvancedSearch" class="advanced-search">
          <el-form :model="queryParams" :inline="true" class="advanced-form">
            <el-form-item label="工号">
              <el-input-number
                v-model="queryParams.workerCode"
                placeholder="请输入工号"
                :controls="false"
                class="form-input"
              />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input
                v-model="queryParams.mobile"
                placeholder="请输入手机号码"
                class="form-input"
              />
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="queryParams.createTime"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="form-input"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">搜索</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>
    </div>

    <!-- 选择提示栏 -->
    <div v-if="selectedIds.length > 0" class="selection-bar">
      <div class="selection-info">
        <Icon icon="ep:select" class="selection-icon" />
        已选择 <strong>{{ selectedIds.length }}</strong> 个员工
      </div>
      <div class="selection-actions">
        <el-button size="small" @click="clearSelection">取消选择</el-button>
        <el-button type="danger" size="small" @click="handleBatchDelete">
          <Icon icon="ep:delete" class="mr-1" />
          删除选中
        </el-button>
      </div>
    </div>

    <!-- 员工列表 -->
    <div class="employee-list" v-loading="loading">
      <!-- 视图切换 -->
      <div class="view-controls">
        <div class="view-tabs">
          <button
            :class="['view-tab', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
          >
            <Icon icon="ep:grid" />
            卡片视图
          </button>
          <button
            :class="['view-tab', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            <Icon icon="ep:list" />
            列表视图
          </button>
        </div>
        <div class="list-info">
          共 {{ total }} 个员工
        </div>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'grid'" class="grid-view">
        <div class="employee-grid">
          <div
            v-for="employee in list"
            :key="employee.id"
            class="employee-card"
            :class="{ 'selected': selectedIds.includes(employee.id!) }"
          >
            <!-- 卡片头部 -->
            <div class="card-header">
              <el-checkbox
                :model-value="selectedIds.includes(employee.id!)"
                @change="toggleSelection(employee)"
                class="card-checkbox"
              />
              <el-dropdown @command="(cmd) => handleCardAction(cmd, employee)" trigger="click">
                <el-button text class="card-menu">
                  <Icon icon="ep:more" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                    <el-dropdown-item command="edit">编辑信息</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除员工</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <!-- 员工头像和基本信息 -->
            <div class="card-body" @click="openDetail(employee.id)">
              <div class="employee-avatar">
                <img
                  v-if="employee.avatar"
                  :src="employee.avatar"
                  alt="头像"
                  class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  {{ employee.nickname?.charAt(0)?.toUpperCase() }}
                </div>
                <div class="status-indicator" :class="employee.status === 0 ? 'active' : 'inactive'"></div>
              </div>

              <div class="employee-info">
                <h3 class="employee-name">{{ employee.nickname }}</h3>
                <p class="employee-title">{{ employee.rank || '暂无职级' }}</p>
                <div class="employee-details">
                  <div class="detail-item">
                    <Icon icon="ep:postcard" />
                    <span>{{ formatWorkerCode(employee.workerCode) }}</span>
                  </div>
                  <div class="detail-item" v-if="employee.deptName">
                    <Icon icon="ep:office-building" />
                    <span>{{ employee.deptName }}</span>
                  </div>
                  <div class="detail-item" v-if="employee.mobile">
                    <Icon icon="ep:phone" />
                    <span>{{ employee.mobile }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 卡片底部操作 -->
            <div class="card-footer">
              <el-button
                text
                type="primary"
                @click="openDetail(employee.id)"
                v-hasPermi="['business:employee:query']"
              >
                <Icon icon="ep:view" class="mr-1" />
                详情
              </el-button>
              <el-button
                text
                type="success"
                @click="openForm('update', employee.id)"
                v-hasPermi="['business:employee:update']"
              >
                <Icon icon="ep:edit" class="mr-1" />
                编辑
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="list-view">
        <div class="employee-table">
          <div class="table-header">
            <div class="header-cell checkbox-cell">
              <el-checkbox
                :indeterminate="selectedIds.length > 0 && selectedIds.length < list.length"
                :model-value="selectedIds.length === list.length && list.length > 0"
                @change="handleSelectAll"
              />
            </div>
            <div class="header-cell">员工信息</div>
            <div class="header-cell">部门职级</div>
            <div class="header-cell">联系方式</div>
            <div class="header-cell">状态</div>
            <div class="header-cell">操作</div>
          </div>

          <div class="table-body">
            <div
              v-for="employee in list"
              :key="employee.id"
              class="table-row"
              :class="{ 'selected': selectedIds.includes(employee.id!) }"
            >
              <div class="table-cell checkbox-cell">
                <el-checkbox
                  :model-value="selectedIds.includes(employee.id!)"
                  @change="toggleSelection(employee)"
                />
              </div>

              <div class="table-cell employee-cell">
                <div class="employee-basic">
                  <img
                    v-if="employee.avatar"
                    :src="employee.avatar"
                    alt="头像"
                    class="table-avatar"
                  />
                  <div v-else class="table-avatar-placeholder">
                    {{ employee.nickname?.charAt(0)?.toUpperCase() }}
                  </div>
                  <div class="basic-info">
                    <div class="name">{{ employee.nickname }}</div>
                    <div class="username">{{ employee.username }}</div>
                    <div class="worker-code">工号: {{ formatWorkerCode(employee.workerCode) }}</div>
                  </div>
                </div>
              </div>

              <div class="table-cell">
                <div class="dept-info">
                  <div class="dept-name">{{ employee.deptName || '未分配部门' }}</div>
                  <div class="rank">{{ employee.rank || '暂无职级' }}</div>
                </div>
              </div>

              <div class="table-cell">
                <div class="contact-info">
                  <div v-if="employee.mobile" class="contact-item">
                    <Icon icon="ep:phone" />
                    {{ employee.mobile }}
                  </div>
                  <div v-if="employee.email" class="contact-item">
                    <Icon icon="ep:message" />
                    {{ employee.email }}
                  </div>
                </div>
              </div>

              <div class="table-cell">
                <el-switch
                  v-model="employee.status"
                  :active-value="0"
                  :inactive-value="1"
                  active-text="在职"
                  inactive-text="离职"
                  @change="handleStatusChange(employee)"
                  v-hasPermi="['business:employee:update']"
                />
              </div>

              <div class="table-cell actions-cell">
                <el-button
                  text
                  type="primary"
                  @click="openDetail(employee.id)"
                  v-hasPermi="['business:employee:query']"
                >
                  详情
                </el-button>
                <el-button
                  text
                  type="success"
                  @click="openForm('update', employee.id)"
                  v-hasPermi="['business:employee:update']"
                >
                  编辑
                </el-button>
                <el-button
                  text
                  type="danger"
                  @click="handleDelete(employee.id)"
                  v-hasPermi="['business:employee:delete']"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && list.length === 0" class="empty-state">
        <div class="empty-content">
          <Icon icon="ep:user" class="empty-icon" />
          <h3>暂无员工数据</h3>
          <p>还没有添加任何员工，点击下方按钮开始添加</p>
          <el-button type="primary" @click="openForm('create')">
            <Icon icon="ep:plus" class="mr-2" />
            添加第一个员工
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <Pagination
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
  </div>

  <!-- 表单弹窗：添加/修改 -->
  <EmployeeForm ref="formRef" @success="getList" />

  <!-- 详情弹窗 -->
  <EmployeeDetail ref="detailRef" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'
import download from '@/utils/download'
import { EmployeeApi, EmployeeVO, EmployeePageReqVO, EmployeeUtils } from '@/api/business/employee'
import EmployeeForm from './EmployeeForm.vue'
import EmployeeDetail from './EmployeeDetail.vue'
import * as DeptApi from '@/api/system/dept'
import { handleTree } from '@/utils/tree'

defineOptions({ name: 'BusinessEmployee' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<EmployeeVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive<EmployeePageReqVO>({
  pageNo: 1,
  pageSize: 10,
  nickname: undefined,
  workerCode: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  createTime: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const deptTree = ref<Tree[]>([]) // 部门树
const selectedIds = ref<number[]>([]) // 选中的员工ID列表
const searchKeyword = ref('') // 搜索关键词
const showAdvancedSearch = ref(false) // 显示高级搜索
const viewMode = ref<'grid' | 'list'>('grid') // 视图模式
const employeeStats = ref({
  totalEmployees: 0,
  activeEmployees: 0,
  inactiveEmployees: 0
}) // 员工统计

const formRef = ref() // 表单 Ref
const detailRef = ref() // 详情 Ref

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await EmployeeApi.getEmployeePage(queryParams)
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
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 详情操作 */
const openDetail = (id: number) => {
  detailRef.value.open(id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await EmployeeApi.deleteEmployee(id)
    message.success(t('common.delSuccess'))
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
    const data = await EmployeeApi.exportEmployee(queryParams)
    download.excel(data, '员工.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 格式化工号 */
const formatWorkerCode = (workerCode: number) => {
  return EmployeeUtils.formatWorkerCode(workerCode)
}



/** 修改员工状态 */
const handleStatusChange = async (row: EmployeeVO) => {
  try {
    // 修改状态的二次确认
    const text = row.status === 0 ? '启用' : '停用'
    await message.confirm('确认要"' + text + '""' + row.nickname + '"员工吗?')
    // 发起修改状态
    await EmployeeApi.updateEmployee({ id: row.id, status: row.status } as EmployeeVO)
    message.success('修改状态成功')
    // 刷新列表
    await getList()
  } catch {
    // 取消后，进行恢复按钮
    row.status = row.status === 0 ? 1 : 0
  }
}

/** 批量删除按钮操作 */
const handleBatchDelete = async () => {
  try {
    if (selectedIds.value.length === 0) {
      message.warning('请选择要删除的员工')
      return
    }
    // 删除的二次确认
    await message.delConfirm(`确认删除选中的 ${selectedIds.value.length} 个员工吗？`)
    // 发起批量删除
    await Promise.all(selectedIds.value.map(id => EmployeeApi.deleteEmployee(id)))
    message.success(t('common.delSuccess'))
    selectedIds.value = []
    // 刷新列表
    await getList()
  } catch {}
}

/** 切换员工选择状态 */
const toggleSelection = (employee: EmployeeVO) => {
  const id = employee.id!
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

/** 清除选择 */
const clearSelection = () => {
  selectedIds.value = []
}

/** 搜索处理 */
const handleSearch = debounce(() => {
  if (searchKeyword.value) {
    queryParams.nickname = searchKeyword.value
    queryParams.mobile = searchKeyword.value
    queryParams.workerCode = isNaN(Number(searchKeyword.value)) ? undefined : Number(searchKeyword.value)
  } else {
    queryParams.nickname = undefined
    queryParams.mobile = undefined
    queryParams.workerCode = undefined
  }
  handleQuery()
}, 300)

/** 批量操作处理 */
const handleBatchAction = (command: string) => {
  switch (command) {
    case 'export':
      handleExport()
      break
    case 'delete':
      handleBatchDelete()
      break
  }
}

/** 卡片操作处理 */
const handleCardAction = (command: string, employee: EmployeeVO) => {
  switch (command) {
    case 'detail':
      openDetail(employee.id)
      break
    case 'edit':
      openForm('update', employee.id)
      break
    case 'delete':
      handleDelete(employee.id)
      break
  }
}

/** 全选处理 */
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedIds.value = list.value.map(item => item.id!).filter(id => id !== undefined)
  } else {
    selectedIds.value = []
  }
}

/** 获取员工统计 */
const getEmployeeStats = async () => {
  try {
    const stats = await EmployeeApi.getEmployeeStatistics()
    employeeStats.value = stats
  } catch (error) {
    console.error('获取员工统计失败:', error)
  }
}

// 防抖函数
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/** 初始化 **/
onMounted(async () => {
  await Promise.all([
    getList(),
    getEmployeeStats(),
    loadDeptTree()
  ])
})

/** 加载部门树 */
const loadDeptTree = async () => {
  try {
    const deptData = await DeptApi.getSimpleDeptList()
    deptTree.value = handleTree(deptData)
  } catch (error) {
    console.error('加载部门树失败:', error)
  }
}
</script>

<style scoped lang="scss">
.employee-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
}

// 页面头部
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 24px;
  margin-bottom: 24px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  .page-title {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;

    .title-icon {
      margin-right: 12px;
      font-size: 36px;
    }
  }

  .page-subtitle {
    font-size: 16px;
    opacity: 0.9;
    margin: 0;
  }
}

.stats-cards {
  display: flex;
  gap: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  min-width: 120px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &.active {
    background: rgba(76, 175, 80, 0.2);
  }

  &.inactive {
    background: rgba(244, 67, 54, 0.2);
  }

  .stat-number {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 14px;
    opacity: 0.9;
  }
}

// 搜索区域
.search-section {
  max-width: 1200px;
  margin: 0 auto 24px;
  padding: 0 24px;
}

.search-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.main-search {
  flex: 1;
  min-width: 300px;

  .search-input {
    .el-input__wrapper {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;

  .filter-select {
    width: 160px;
  }

  .filter-btn {
    border-radius: 8px;
  }
}

.actions {
  display: flex;
  gap: 12px;

  .action-btn {
    border-radius: 8px;
    font-weight: 500;

    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
    }
  }
}

.advanced-search {
  margin-top: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;

  .form-input {
    width: 200px;
  }
}

// 选择提示栏
.selection-bar {
  max-width: 1200px;
  margin: 0 auto 16px;
  padding: 0 24px;

  > div {
    background: #e3f2fd;
    border: 1px solid #2196f3;
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .selection-info {
    display: flex;
    align-items: center;
    color: #1976d2;
    font-weight: 500;

    .selection-icon {
      margin-right: 8px;
    }
  }

  .selection-actions {
    display: flex;
    gap: 8px;
  }
}

// 员工列表
.employee-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .view-tabs {
    display: flex;
    background: white;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .view-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    color: #666;

    &.active {
      background: #667eea;
      color: white;
    }
  }

  .list-info {
    color: #666;
    font-size: 14px;
  }
}

// 网格视图
.grid-view {
  .employee-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

.employee-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }

  &.selected {
    border-color: #667eea;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 0;

  .card-checkbox {
    .el-checkbox {
      --el-checkbox-checked-bg-color: #667eea;
      --el-checkbox-checked-border-color: #667eea;
    }
  }

  .card-menu {
    color: #999;

    &:hover {
      color: #667eea;
    }
  }
}

.card-body {
  padding: 16px 20px;
  cursor: pointer;

  .employee-avatar {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 16px;

    .avatar-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #f0f0f0;
    }

    .avatar-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: 600;
    }

    .status-indicator {
      position: absolute;
      bottom: 4px;
      right: calc(50% - 46px);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;

      &.active {
        background: #4caf50;
      }

      &.inactive {
        background: #f44336;
      }
    }
  }

  .employee-info {
    text-align: center;

    .employee-name {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .employee-title {
      color: #666;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .employee-details {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .detail-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #666;
        font-size: 13px;

        svg {
          width: 14px;
          height: 14px;
          color: #999;
        }
      }
    }
  }
}

.card-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 20px 20px;
  border-top: 1px solid #f0f0f0;
}

// 列表视图
.list-view {
  .employee-table {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .table-header {
    display: grid;
    grid-template-columns: 50px 2fr 1.5fr 1.5fr 120px 150px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;

    .header-cell {
      padding: 16px 12px;
      font-weight: 600;
      color: #495057;
      font-size: 14px;

      &.checkbox-cell {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .table-body {
    .table-row {
      display: grid;
      grid-template-columns: 50px 2fr 1.5fr 1.5fr 120px 150px;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;

      &:hover {
        background: #f8f9fa;
      }

      &.selected {
        background: #e3f2fd;
      }

      .table-cell {
        padding: 16px 12px;
        display: flex;
        align-items: center;

        &.checkbox-cell {
          justify-content: center;
        }

        &.actions-cell {
          gap: 8px;
        }
      }
    }
  }

  .employee-basic {
    display: flex;
    align-items: center;
    gap: 12px;

    .table-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .table-avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 16px;
    }

    .basic-info {
      .name {
        font-weight: 600;
        color: #333;
        margin-bottom: 2px;
      }

      .username {
        color: #666;
        font-size: 13px;
        margin-bottom: 2px;
      }

      .worker-code {
        color: #999;
        font-size: 12px;
      }
    }
  }

  .dept-info {
    .dept-name {
      font-weight: 500;
      color: #333;
      margin-bottom: 2px;
    }

    .rank {
      color: #666;
      font-size: 13px;
    }
  }

  .contact-info {
    .contact-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
      font-size: 13px;
      margin-bottom: 4px;

      svg {
        width: 12px;
        height: 12px;
        color: #999;
      }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .empty-content {
    text-align: center;

    .empty-icon {
      font-size: 64px;
      color: #ddd;
      margin-bottom: 16px;
    }

    h3 {
      color: #666;
      margin-bottom: 8px;
    }

    p {
      color: #999;
      margin-bottom: 24px;
    }
  }
}

// 分页
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-bottom: 32px;
}

// 响应式设计
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .search-container {
    flex-direction: column;
    align-items: stretch;
  }

  .main-search {
    min-width: auto;
  }

  .filters, .actions {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px 16px;
  }

  .search-section, .employee-list {
    padding: 0 16px;
  }

  .employee-grid {
    grid-template-columns: 1fr;
  }

  .stats-cards {
    flex-direction: column;
    width: 100%;
  }

  .stat-card {
    min-width: auto;
  }

  .table-header, .table-row {
    grid-template-columns: 1fr;

    .table-cell {
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
