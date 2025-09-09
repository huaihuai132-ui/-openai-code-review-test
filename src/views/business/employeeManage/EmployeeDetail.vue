<template>
  <Dialog title="员工详情" v-model="dialogVisible" width="800px">
    <el-descriptions :column="2" border v-loading="loading">
      <el-descriptions-item label="头像">
        <div class="flex items-center">
          <img
            v-if="employee.avatar"
            :src="employee.avatar"
            alt="头像"
            class="h-16 w-16 rounded-full mr-4"
          />
          <el-avatar v-else :size="64" class="mr-4">
            {{ employee.nickname?.charAt(0) }}
          </el-avatar>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="工号">
        <el-tag type="primary" size="large">
          {{ formatWorkerCode(employee.workerCode) }}
        </el-tag>
      </el-descriptions-item>
      
      <el-descriptions-item label="用户账号">
        {{ employee.username }}
      </el-descriptions-item>
      <el-descriptions-item label="用户昵称">
        {{ employee.nickname }}
      </el-descriptions-item>
      
      <el-descriptions-item label="职级">
        {{ employee.rank || '未设置' }}
      </el-descriptions-item>
      <el-descriptions-item label="部门">
        {{ employee.deptName || '未分配' }}
      </el-descriptions-item>
      
      <el-descriptions-item label="岗位" :span="2">
        <el-tag
          v-for="post in employeePosts"
          :key="post.id"
          class="mr-2"
          type="info"
        >
          {{ post.name }}
        </el-tag>
        <span v-if="!employeePosts.length" class="text-gray-400">未分配岗位</span>
      </el-descriptions-item>
      
      <el-descriptions-item label="邮箱">
        <el-link v-if="employee.email" :href="`mailto:${employee.email}`" type="primary">
          {{ employee.email }}
        </el-link>
        <span v-else class="text-gray-400">未设置</span>
      </el-descriptions-item>
      <el-descriptions-item label="手机号码">
        <el-link v-if="employee.mobile" :href="`tel:${employee.mobile}`" type="primary">
          {{ employee.mobile }}
        </el-link>
        <span v-else class="text-gray-400">未设置</span>
      </el-descriptions-item>
      
      <el-descriptions-item label="性别">
        <el-tag :type="employee.sex === 1 ? 'primary' : 'danger'" v-if="employee.sex">
          {{ formatGender(employee.sex) }}
        </el-tag>
        <span v-else class="text-gray-400">未设置</span>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="employee.status" />
      </el-descriptions-item>
      
      <el-descriptions-item label="办公电话">
        <el-link v-if="employee.officePhone" :href="`tel:${employee.officePhone}`" type="primary">
          {{ employee.officePhone }}
        </el-link>
        <span v-else class="text-gray-400">未设置</span>
      </el-descriptions-item>
      <el-descriptions-item label="办公室房号">
        {{ employee.officeNumber || '未设置' }}
      </el-descriptions-item>
      
      <el-descriptions-item label="创建时间">
        {{ formatDate(employee.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ formatDate(employee.updateTime) }}
      </el-descriptions-item>
      
      <el-descriptions-item label="备注" :span="2">
        <div class="max-w-full break-words">
          {{ employee.remark || '无备注' }}
        </div>
      </el-descriptions-item>
    </el-descriptions>
    
    <template #footer>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { EmployeeApi, EmployeeVO, EmployeeUtils } from '@/api/business/employee'
import * as PostApi from '@/api/system/post'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'

defineOptions({ name: 'EmployeeDetail' })

const dialogVisible = ref(false) // 弹窗的是否展示
const loading = ref(false) // 加载中

const employee = ref<EmployeeVO>({
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
  remark: '',
  createTime: undefined,
  updateTime: undefined,
  deptName: ''
})

const employeePosts = ref<PostApi.PostVO[]>([]) // 员工的岗位信息

/** 打开弹窗 */
const open = async (id: number) => {
  dialogVisible.value = true
  loading.value = true
  
  try {
    // 获取员工详情
    employee.value = await EmployeeApi.getEmployee(id)
    
    // 获取岗位信息
    if (employee.value.postIds && employee.value.postIds.length > 0) {
      const allPosts = await PostApi.getSimplePostList()
      employeePosts.value = allPosts.filter(post => 
        employee.value.postIds?.includes(post.id!)
      )
    } else {
      employeePosts.value = []
    }
  } catch (error) {
    console.error('获取员工详情失败:', error)
  } finally {
    loading.value = false
  }
}

/** 格式化工号 */
const formatWorkerCode = (workerCode: number) => {
  return EmployeeUtils.formatWorkerCode(workerCode)
}

/** 格式化性别 */
const formatGender = (sex?: number) => {
  return EmployeeUtils.formatGender(sex)
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>

<style scoped>
:deep(.el-descriptions__body) {
  background-color: #fafafa;
}

:deep(.el-descriptions-item__label) {
  font-weight: 600;
  color: #606266;
  background-color: #f5f7fa;
}

:deep(.el-descriptions-item__content) {
  color: #303133;
}
</style>
