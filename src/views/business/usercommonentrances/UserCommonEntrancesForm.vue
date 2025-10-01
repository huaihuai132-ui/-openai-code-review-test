<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="用户" prop="userId" v-if="!presetUserId">
        <el-select
          v-model="formData.userId"
          placeholder="请选择用户"
          clearable
          filterable
          style="width: 100%"
          @change="handleUserChange"
        >
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.username ? `${user.nickname} (${user.username})` : user.nickname"
            :value="user.id"
          >
            <div class="flex items-center justify-between">
              <span>{{ user.nickname }}</span>
              <span class="text-gray-400 text-sm" v-if="user.username">{{ user.username }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <!-- 当预设用户ID时，显示用户信息但不可编辑 -->
      <el-form-item label="用户" v-if="presetUserId">
        <el-input 
          :value="presetUserName" 
          disabled 
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="系统常用入口" prop="entranceId">
        <el-select 
          v-model="formData.entranceId" 
          placeholder="请选择系统常用入口" 
          clearable 
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="entrance in entranceOptions"
            :key="entrance.id"
            :label="entrance.name"
            :value="entrance.id"
          >
            <template #default>
              <div class="flex items-center">
                <Icon :icon="entrance.icon" class="mr-2" v-if="entrance.icon" />
                <span>{{ entrance.name }}</span>
                <span class="text-gray-400 ml-2" v-if="entrance.url">({{ entrance.url }})</span>
              </div>
            </template>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户自定义排序，值越小越靠前" prop="customOrder">
        <el-input-number v-model="formData.customOrder" placeholder="请输入用户自定义排序，值越小越靠前" style="width: 100%" />
      </el-form-item>
      <el-form-item label="是否隐藏该入口" prop="hidden">
        <el-select v-model="formData.hidden" placeholder="请选择入口状态" clearable class="!w-240px">
          <el-option v-for="dict in getStrDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)" :key="dict.value"
            :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门编号" prop="deptId" v-if="!presetDeptId">
        <el-cascader
          v-model="formData.deptId"
          :options="deptOptions"
          :props="deptCascaderProps"
          placeholder="请选择部门"
          clearable
          filterable
          style="width: 100%"
        />
      </el-form-item>
      <!-- 当预设部门ID时，显示部门信息但不可编辑 -->
      <el-form-item label="部门编号" v-if="presetDeptId">
        <el-input 
          :value="presetDeptName" 
          disabled 
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserCommonEntrancesApi, UserCommonEntrancesVO } from '@/api/business/usercommonentrances'
import { SystemCommonEntrancesApi, SystemCommonEntrancesVO } from '@/api/business/systemcommonentrances'
import { getSimpleUserList, UserVO } from '@/api/system/user'
import { getSimpleDeptList, DeptVO } from '@/api/system/dept'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'

/** 用户常用入口维护表（个性化配置） 表单 */
defineOptions({ name: 'UserCommonEntrancesForm' })

// 定义props
interface Props {
  presetUserId?: number // 预设的用户ID
  presetUserName?: string // 预设的用户名称
  presetDeptId?: number // 预设的部门ID
  presetDeptName?: string // 预设的部门名称
}

const props = withDefaults(defineProps<Props>(), {
  presetUserId: undefined,
  presetUserName: '',
  presetDeptId: undefined,
  presetDeptName: ''
})

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改

// 表单数据
const formData = ref({
  id: undefined,
  userId: undefined,
  entranceId: undefined,
  customOrder: undefined,
  hidden: 'false', // 默认不隐藏
  deptId: undefined,
})

// 表单验证规则
const formRules = reactive({
  userId: [{ required: true, message: '用户不能为空', trigger: 'blur' }],
  entranceId: [{ required: true, message: '系统常用入口不能为空', trigger: 'blur' }],
  customOrder: [{ required: true, message: '用户自定义排序，值越小越靠前不能为空', trigger: 'blur' }],
  hidden: [{ required: true, message: '是否隐藏该入口不能为空', trigger: 'blur' }],
})

const formRef = ref() // 表单 Ref

// 系统常用入口选项
const entranceOptions = ref<SystemCommonEntrancesVO[]>([])

// 用户选项
const userOptions = ref([])

// 部门选项和级联配置
const deptOptions = ref([])
const deptCascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  emitPath: false,
  checkStrictly: true
}

// 获取系统常用入口列表
const getEntranceList = async () => {
  try {
    const data = await SystemCommonEntrancesApi.getSystemCommonEntrancesPage({ pageNo: 1, pageSize: 100 })
    console.log('系统常用入口数据:', data.list)
    entranceOptions.value = data.list
  } catch (error) {
    console.error('获取系统常用入口列表失败:', error)
  }
}

// 获取用户列表
const getUserList = async () => {
  try {
    const users = await getSimpleUserList()
    console.log('用户数据:', users)
    userOptions.value = users
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 获取部门列表
const getDeptList = async () => {
  try {
    const depts = await getSimpleDeptList()
    
    // 构建部门树形结构
    const deptMap = new Map()
    depts.forEach(dept => {
      deptMap.set(dept.id, { ...dept, children: [] })
    })
    
    const buildTree = (parentId = 0) => {
      return Array.from(deptMap.values())
        .filter(dept => dept.parentId === parentId)
        .map(dept => ({
          ...dept,
          children: buildTree(dept.id)
        }))
    }
    
    deptOptions.value = buildTree()
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

// 处理用户选择变化，自动带入部门ID
const handleUserChange = (userId: number) => {
  if (userId) {
    const selectedUser = userOptions.value.find(user => user.id === userId)
    if (selectedUser && selectedUser.deptId) {
      formData.value.deptId = selectedUser.deptId
    }
  } else {
    // 清空用户时，也清空部门ID
    formData.value.deptId = undefined
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  
  // 如果有预设用户ID，则设置到表单数据中
  if (props.presetUserId) {
    formData.value.userId = props.presetUserId
  }
  
  // 如果有预设部门ID，则设置到表单数据中
  if (props.presetDeptId) {
    formData.value.deptId = props.presetDeptId
  }
  
  // 加载基础数据
  await Promise.all([
    getEntranceList(),
    getUserList(),
    getDeptList()
  ])
  
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await UserCommonEntrancesApi.getUserCommonEntrances(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as UserCommonEntrancesVO
    if (formType.value === 'create') {
      await UserCommonEntrancesApi.createUserCommonEntrances(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserCommonEntrancesApi.updateUserCommonEntrances(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    userId: undefined,
    entranceId: undefined,
    customOrder: undefined,
    hidden: 'false', // 默认不隐藏
    deptId: undefined,
  }
  formRef.value?.resetFields()
}
</script>