<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="110px"
    >
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="入口名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入入口名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="图标标识" prop="icon">
        <el-input
          v-model="queryParams.icon"
          placeholder="请输入图标标识"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="跳转链接" prop="url">
        <el-input
          v-model="queryParams.url"
          placeholder="请输入跳转链接"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="显示颜色" prop="color">
        <el-input
          v-model="queryParams.color"
          placeholder="请输入显示颜色"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="排序" prop="order">
        <el-input
          v-model="queryParams.order"
          placeholder="请输入排序"
          clearable
          @keyup.enter="handleQuery"
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
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入部门名称"
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
          v-hasPermi="['business:common-system-entrances:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['business:common-system-entrances:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 分组列表 -->
  <ContentWrap>
    <div v-loading="loading">


      <!-- 用户分组 -->
      <div v-for="group in groupedList" :key="group.userId">
        <!-- 分组头部 -->
        <div
          @click="toggleGroup(group.userId)"
          style="display: flex; align-items: center; padding: 12px 16px; background-color: #f5f7fa; border-radius: 4px; margin-bottom: 16px; cursor: pointer;"
        >
          <Icon
            :icon="expandedGroups.has(group.userId) ? 'ep:arrow-down' : 'ep:arrow-right'"
            style="margin-right: 8px;"
          />
          <span style="font-weight: 500; margin-right: 12px;">{{ group.username ? '用户名称: ' + group.username : '用户ID: ' + group.userId }}</span>
          <span style="font-weight: 500; margin-right: 12px;">{{ group.deptname ? '部门名称: ' + group.deptname : '部门ID: ' + group.deptId }}</span>
          <el-tag size="small">{{ group.items.length }} 个入口</el-tag>
        </div>

        <!-- 分组内容 -->
        <el-collapse-transition>
          <div v-show="expandedGroups.has(group.userId)">
            <!-- 新增入口卡片 -->
            <el-row :gutter="16" style="margin-bottom: 16px;">
              <el-col :span="6">
                <el-card
                  shadow="hover"
                  style="height: 120px; cursor: pointer; border: 2px dashed #dcdfe6;"
                  @click="openForm('create', undefined, group.userId)"
                  v-hasPermi="['business:common-system-entrances:create']"
                >
                  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #909399;">
                    <Icon icon="ep:plus" style="font-size: 24px; margin-bottom: 8px;" />
                    <span>新增入口</span>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 入口卡片网格 -->
            <el-row :gutter="16">
              <el-col :span="6" v-for="item in group.items" :key="item.id" style="margin-bottom: 16px;">
                <el-card shadow="hover" style="height: 120px;">
                  <div style="display: flex; flex-direction: column; height: 100%;">
                    <!-- 卡片头部 -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <div style="display: flex; align-items: center;">
                        <div
                          style="width: 20px; height: 20px; border-radius: 4px; margin-right: 8px;"
                          :style="{ backgroundColor: item.color || '#409eff' }"
                        ></div>
                        <span style="font-weight: 500; font-size: 14px;">{{ item.name }}</span>
                      </div>
                      <el-dropdown trigger="click">
                        <Icon icon="ep:more" style="cursor: pointer; color: #909399;" />
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item
                              @click="openForm('update', item.id)"
                              v-hasPermi="['business:common-system-entrances:update']"
                            >
                              <Icon icon="ep:edit" style="margin-right: 4px;" />编辑
                            </el-dropdown-item>
                            <el-dropdown-item
                              @click="handleDelete(item.id)"
                              v-hasPermi="['business:common-system-entrances:delete']"
                            >
                              <Icon icon="ep:delete" style="margin-right: 4px;" />删除
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>

                    <!-- 卡片内容 -->
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                      <div>
                        <div style="font-size: 12px; color: #909399; margin-bottom: 4px;">图标: {{ item.icon }}</div>
                        <div style="font-size: 12px; color: #909399; margin-bottom: 4px;">排序: {{ item.order }}</div>
                      </div>
                      <div style="font-size: 12px; color: #606266; word-break: break-all;">{{ item.url }}</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-collapse-transition>
      </div>

      <!-- 空状态 -->
      <div v-if="groupedList.length === 0 && !loading">
        <el-empty description="暂无数据">
          <p>当前没有常用系统入口数据</p>
          <p>请检查：</p>
          <ul style="text-align: left; display: inline-block;">
            <li>是否有权限访问该页面</li>
            <li>后端API是否正常返回数据</li>
            <li>数据库中是否有相关记录</li>
          </ul>
          <el-button
            type="primary"
            @click="getList"
            style="margin-top: 16px;"
          >
            重新加载
          </el-button>
        </el-empty>
      </div>

      <!-- 加载状态提示 -->
      <div v-if="loading" style="text-align: center; padding: 40px;">
        <el-icon class="is-loading" style="font-size: 24px; margin-bottom: 16px;">
          <Loading />
        </el-icon>
        <p>正在加载数据...</p>
      </div>
    </div>

    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <CommonSystemEntrancesForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { Loading } from '@element-plus/icons-vue'
import { CommonSystemEntrancesApi, CommonSystemEntrancesVO } from 'src/api/business/commonSystemEntrances'
import CommonSystemEntrancesForm from './CommonSystemEntrancesForm.vue'

/** 常用系统入口 列表 */
defineOptions({ name: 'CommonSystemEntrances' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<CommonSystemEntrancesVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const expandedGroups = ref(new Set<number>()) // 展开的分组
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  userId: undefined,
  name: undefined,
  icon: undefined,
  url: undefined,
  color: undefined,
  order: undefined,
  createTime: [],
  deptId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// 分组数据计算属性
const groupedList = computed(() => {
  const groups = new Map<number, CommonSystemEntrancesVO[]>()

  // 按userId分组
  list.value.forEach(item => {
    if (!groups.has(item.userId)) {
      groups.set(item.userId, [])
    }
    groups.get(item.userId)!.push(item)
  })

  // 转换为数组格式，并按order排序每组内的数据
  const result = Array.from(groups.entries())
    .map(([userId, items]) => {
      const group = {
        userId,
        username: items[0]?.userName,
        deptId: items[0]?.deptId,
        deptname: items[0]?.deptName,
        items: items.sort((a, b) => a.order - b.order)
      }
      return group
    })
    .sort((a, b) => a.userId - b.userId) // 按userId排序分组

  return result
})

/** 切换分组展开状态 */
const toggleGroup = (userId: number) => {
  if (expandedGroups.value.has(userId)) {
    expandedGroups.value.delete(userId)
  } else {
    expandedGroups.value.add(userId)
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CommonSystemEntrancesApi.getCommonSystemEntrancesPage(queryParams)
    list.value = data.list
    total.value = data.total
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
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
const openForm = (type: string, id?: number, presetUserId?: number) => {
  formRef.value.open(type, id, presetUserId)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CommonSystemEntrancesApi.deleteCommonSystemEntrances(id)
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
    const data = await CommonSystemEntrancesApi.exportCommonSystemEntrances(queryParams)
    download.excel(data, '常用系统入口.xls')
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
