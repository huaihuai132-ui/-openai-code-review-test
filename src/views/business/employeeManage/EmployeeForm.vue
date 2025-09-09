<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="800px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户账号" prop="username">
            <el-input v-model="formData.username" placeholder="请输入用户账号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户昵称" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="工号" prop="workerCode">
            <el-input-number
              v-model="formData.workerCode"
              :min="1"
              :max="99999"
              placeholder="请输入工号"
              class="!w-full"
            />
            <el-button
              type="primary"
              link
              @click="generateWorkerCode"
              :loading="generateLoading"
              class="ml-2"
            >
              自动生成
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职级" prop="rank">
            <el-input v-model="formData.rank" placeholder="请输入职级" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="部门" prop="deptId">
            <el-tree-select
              v-model="formData.deptId"
              :data="deptTree"
              :props="{ value: 'id', label: 'name', children: 'children' }"
              node-key="id"
              placeholder="请选择部门"
              check-strictly
              class="w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="岗位" prop="postIds">
            <el-select
              v-model="formData.postIds"
              multiple
              placeholder="请选择岗位"
              class="w-full"
            >
              <el-option
                v-for="post in postList"
                :key="post.id"
                :label="post.name"
                :value="post.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="formData.mobile" placeholder="请输入手机号码" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="用户性别" prop="sex">
            <el-select v-model="formData.sex" placeholder="请选择性别" class="w-full">
              <el-option label="男" :value="1" />
              <el-option label="女" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="帐号状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :label="0">在职</el-radio>
              <el-radio :label="1">离职</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="办公电话" prop="officePhone">
            <el-input v-model="formData.officePhone" placeholder="请输入办公电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="办公室房号" prop="officeNumber">
            <el-input v-model="formData.officeNumber" placeholder="请输入办公室房号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="formType === 'create'">
        <el-col :span="24">
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              placeholder="请输入备注"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { EmployeeApi, EmployeeVO } from '@/api/business/employee'
import * as DeptApi from '@/api/system/dept'
import * as PostApi from '@/api/system/post'
import { handleTree } from '@/utils/tree'

defineOptions({ name: 'EmployeeForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const generateLoading = ref(false) // 生成工号的加载中
const deptTree = ref<Tree[]>([]) // 部门树
const postList = ref<PostApi.PostVO[]>([]) // 岗位列表

const formData = ref<EmployeeVO>({
  id: undefined,
  username: '',
  nickname: '',
  workerCode: 0,
  rank: '',
  deptId: undefined,
  postIds: [],
  email: '',
  mobile: '',
  sex: undefined,
  avatar: '',
  status: 0,
  officePhone: '',
  officeNumber: '',
  password: '',
  remark: ''
})

const formRules = computed(() => ({
  username: [{ required: true, message: '用户账号不能为空', trigger: 'blur' }],
  nickname: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  workerCode: [{ required: true, message: '工号不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '帐号状态不能为空', trigger: 'change' }],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  mobile: [
    { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  password: formType.value === 'create' ? [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须介于 6 和 20 之间', trigger: 'blur' }
  ] : [
    { min: 6, max: 20, message: '密码长度必须介于 6 和 20 之间', trigger: 'blur' }
  ]
}))

const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '添加员工' : '修改员工'
  formType.value = type
  resetForm()

  // 加载部门和岗位数据
  await loadDeptAndPostData()

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await EmployeeApi.getEmployee(id)
    } finally {
      formLoading.value = false
    }
  }
}

/** 加载部门和岗位数据 */
const loadDeptAndPostData = async () => {
  try {
    const [deptData, postData] = await Promise.all([
      DeptApi.getSimpleDeptList(),
      PostApi.getSimplePostList()
    ])
    deptTree.value = handleTree(deptData)
    postList.value = postData
  } catch (error) {
    console.error('加载部门和岗位数据失败:', error)
  }
}

/** 生成工号 */
const generateWorkerCode = async () => {
  generateLoading.value = true
  try {
    const workerCode = await EmployeeApi.generateWorkerCode()
    formData.value.workerCode = workerCode
  } catch (error) {
    message.error('生成工号失败')
  } finally {
    generateLoading.value = false
  }
}

/** 提交表单 */
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as EmployeeVO
    if (formType.value === 'create') {
      await EmployeeApi.createEmployee(data)
      message.success(t('common.createSuccess'))
    } else {
      await EmployeeApi.updateEmployee(data)
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
    username: '',
    nickname: '',
    workerCode: 0,
    rank: '',
    deptId: undefined,
    postIds: [],
    email: '',
    mobile: '',
    sex: undefined,
    avatar: '',
    status: 0,
    officePhone: '',
    officeNumber: '',
    password: '',
    remark: ''
  }
  formRef.value?.resetFields()
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 定义 emit */
const emit = defineEmits<{
  success: []
}>()
</script>
