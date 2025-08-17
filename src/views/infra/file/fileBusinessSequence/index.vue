<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="序列业务名" prop="sequenceFile">
        <el-select v-model="queryParams.sequenceCode" filterable clearable placeholder="请选择序列业务名" class="!w-240px">
          <el-option v-for="opt in codeFileOptions" :key="opt.code" :label="opt.file" :value="opt.code" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['infra:file-business-sequence:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['infra:file-business-sequence:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <!-- 分组列表 -->
    <div v-loading="loading">
      <div v-for="group in groupedList" :key="group.sequenceCode" class="mb-20px">
        <div class="flex items-center justify-between mb-10px">
          <div class="flex items-center">
            <div class="text-16px font-600">序列业务名：{{ group.sequenceBusiness }}</div>
            <el-button type="primary" size="small" link class="ml-6px" @click="openEditBusinessDialog(group)">
              <Icon icon="ep:edit" />
            </el-button>
          </div>
          <div>
            <el-button type="primary" size="small" plain @click="openForm('create', undefined, { sequenceCode: group.sequenceCode, sequenceBusiness: group.sequenceBusiness })" v-hasPermi="['infra:file-business-sequence:create']">
              <Icon icon="ep:plus" class="mr-5px" /> 在该分组下新增
            </el-button>
            <el-button type="danger" size="small" plain @click="handleBatchDelete(group.items)" v-hasPermi="['infra:file-business-sequence:delete']">
              <Icon icon="ep:delete" class="mr-5px" /> 删除该分组全部
            </el-button>
          </div>
        </div>
        <el-table :data="group.items" :stripe="true" :show-overflow-tooltip="true" class="mb-10px">
          <!-- <el-table-column label="主键ID" align="center" prop="id" width="100" /> -->
          <!-- <el-table-column label="序列业务名" align="center" prop="sequenceBusiness" /> -->
          <el-table-column label="序列文件名" align="center" prop="sequenceFile" />
          <el-table-column label="序列值" align="center" prop="sequenceValue" />
          <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" width="180px" />
          <el-table-column label="操作" align="center" min-width="160px">
            <template #default="scope">
              <el-button link type="primary" @click="openForm('update', scope.row.id)" v-hasPermi="['infra:file-business-sequence:update']">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['infra:file-business-sequence:delete']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <FileBusinessSequenceForm ref="formRef" :business-options="codeFileOptions.map(o => o.file)" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { FileBusinessSequenceApi, FileBusinessSequenceVO } from '@/api/infra/file/fileBusinessSequence'
import FileBusinessSequenceForm from './FileBusinessSequenceForm.vue'
import { ElMessageBox } from 'element-plus'

/** 文件业务序列 列表 */
defineOptions({ name: 'FileBusinessSequence' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const groupedList = ref<{ sequenceCode: string; sequenceBusiness: string; items: FileBusinessSequenceVO[] }[]>([]) // 分组后的数据
const codeFileOptions = ref<{ code: string; file: string }[]>([])
const queryParams = reactive({
  sequenceCode: undefined as string | undefined, // 下拉选中项，传给后端
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const sequenceCode = queryParams.sequenceCode
    const data = sequenceCode
      ? ((await FileBusinessSequenceApi.getFileBusinessSequenceGroupListByCode(sequenceCode)) as FileBusinessSequenceVO[][])
      : ((await FileBusinessSequenceApi.getFileBusinessSequenceGroupList({})) as FileBusinessSequenceVO[][])
    groupedList.value = (data || [])
      .filter((arr) => arr && arr.length)
      .map((arr) => ({ sequenceCode: arr[0].sequenceCode, sequenceBusiness: arr[0].sequenceBusiness, items: arr }))
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = async (type: string, id?: number, preset?: Partial<FileBusinessSequenceVO>) => {
  // 确保表单下拉有数据：若首次打开且尚未加载映射，则先加载
  if (type === 'create' && codeFileOptions.value.length === 0) {
    await loadCodeFileOptions()
  }
  formRef.value.open(type, id, preset)
}

/** 删除（分组全部） */
const handleBatchDelete = async (items: FileBusinessSequenceVO[]) => {
  if (!items || items.length === 0) return
  try {
    await message.delConfirm(`确认删除该分组的 ${items.length} 条记录吗？`)
    const ids = items.map((i) => i.id)
    await FileBusinessSequenceApi.deleteFileBusinessSequenceList(ids)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

/** 删除（组内单条，若组内还有其它数据，则提示是否删除整组） */
const handleDelete = async (
  row: FileBusinessSequenceVO,
) => {
  try {
    await FileBusinessSequenceApi.deleteFileBusinessSequence(row.id)
    message.success(t('common.delSuccess'))
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
    const data = await FileBusinessSequenceApi.exportFileBusinessSequence(queryParams)
    download.excel(data, '文件业务序列.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}


/** 分组业务名修改对话 */
async function openEditBusinessDialog(group: { sequenceCode: string; sequenceBusiness: string }) {
  try {
    const { value } = await ElMessageBox.prompt('请输入新的序列业务名', '修改分组业务名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: group.sequenceBusiness,
      inputPlaceholder: '新的序列业务名'
    })
    if (!value || value === group.sequenceBusiness) return
    await FileBusinessSequenceApi.updateBusinessBySequenceCode(group.sequenceCode, value)
    message.success('修改成功')
    await loadCodeFileOptions()
    await getList()
  } catch {}
}

/** 初始化 **/
const loadCodeFileOptions = async () => {
  const mapping = await FileBusinessSequenceApi.getCodeFileMapping()
  const arr = Array.isArray(mapping) ? mapping : (Array.isArray(mapping?.data) ? mapping.data : [])
  codeFileOptions.value = (arr || [])
    .map((e: any) => {
      // 形态 A：{ key: 'code', value: 'business' }
      if (e && (e.key !== undefined || e.value !== undefined)) {
        return { code: e.key, file: e.value }
      }
      // 形态 B：{ [code]: business } —— List<Map> 序列化结果
      const entries = Object.entries(e || {})
      if (entries.length > 0) {
        const [k, v] = entries[0] as [string, any]
        return { code: k, file: String(v) }
      }
      // 形态 C：{ code, business } / { sequenceCode, sequenceBusiness }
      return { code: e?.code || e?.sequenceCode, file: e?.business || e?.sequenceBusiness }
    })
    .filter((opt: any) => !!opt?.code && !!opt?.file)
  // 供表单使用的全局业务名选项（简单共享）
  ;(window as any).__FILE_BIZ_OPTIONS__ = codeFileOptions.value.map((o) => ({ code: o.code, business: o.file }))
}

onMounted(() => {
  loadCodeFileOptions()
  getList()
})
</script>
