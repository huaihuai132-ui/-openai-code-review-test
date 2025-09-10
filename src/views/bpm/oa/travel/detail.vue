<template>
  <div v-loading="detailLoading">
    <div class="mb-10px text-right">
      <el-button type="info" @click="showPrintPreview" v-if="detailData.id">
        <Icon icon="ep:view" class="mr-5px" />
        打印预览
      </el-button>
    </div>
    <el-descriptions :column="2" border>
      <el-descriptions-item label="申请编号">{{ detailData.id }}</el-descriptions-item>
      <el-descriptions-item label="申请人">{{ detailData.nickname }}</el-descriptions-item>
      <el-descriptions-item label="申请部门">{{ detailData.deptName }}</el-descriptions-item>
      <el-descriptions-item label="交通方式">
        <dict-tag :type="DICT_TYPE.TRAVEL_TRAFFIC_TYPE" :value="detailData.trafficType" />
      </el-descriptions-item>
      <el-descriptions-item v-if="detailData.trafficType === 4" label="乘坐飞机原因" :span="2">{{ detailData.airplaneReason }}</el-descriptions-item>
      <el-descriptions-item label="出差时间">{{ formatDate(detailData.startTime) }}</el-descriptions-item>
      <el-descriptions-item label="归来时间">{{ formatDate(detailData.endTime) }}</el-descriptions-item>
      <el-descriptions-item label="出差地点">{{ detailData.address }}</el-descriptions-item>
      <el-descriptions-item label="出差事由">{{ detailData.reason }}</el-descriptions-item>
      <el-descriptions-item v-if="detailData.remark" label="备注" :span="2">{{ detailData.remark }}</el-descriptions-item>
      <el-descriptions-item label="申请时间">{{ formatDate(detailData.createTime) }}</el-descriptions-item>
      <el-descriptions-item label="审批状态">
        <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="detailData.status" />
      </el-descriptions-item>
      <el-descriptions-item label="附件" v-if="fileIdList && fileIdList.length > 0">
        <BatchFileUpload v-model:fileList="fileIdList" mode="view" directory="business" />
      </el-descriptions-item>
      <el-descriptions-item label="附件" v-else>
        <span>无附件</span>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 出差人员列表 -->
    <el-divider content-position="left">出差人员</el-divider>
    <el-table :data="detailData.personList" border style="width: 100%">
      <el-table-column prop="nickname" label="姓名" />
      <el-table-column prop="deptName" label="部门" width="200">
        <template #default="{ row }">
          {{ row.userId ? (row.deptName || '加载中...') : '外部人员' }}
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- 打印预览弹窗 -->
  <PrintPreview v-model="printPreviewVisible" :travel-data="detailData" />
</template>

<script lang="ts" setup>
import * as TravelApi from '@/api/bpm/form/travel'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'

import { BatchFileUpload } from '@/components/UploadFile'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import PrintPreview from './components/PrintPreview.vue'

defineOptions({ name: 'BpmOATravelDetail' })

const props = defineProps({
  id: propTypes.oneOfType([propTypes.number, propTypes.string]).def(undefined),
  previewMode: propTypes.bool.def(false), // 是否为预览模式
  readonly: propTypes.bool.def(false), // 是否为只读模式
  modelInfo: propTypes.object.def({}) // 模型信息
})

const { query } = useRoute() // 查询参数
const queryId = query.id as unknown as number | string // 从 URL 传递过来的 id 编号

const detailLoading = ref(false) // 表单的加载中
const detailData = ref<TravelApi.TravelVO>({
  id: 0,
  status: 0,
  trafficType: 1,
  airplaneReason: '',
  startTime: undefined,
  endTime: undefined,
  address: '',
  reason: '',
  remark: '',
  fileList: '',
  sequenceCode: '',
  personList: [],
  createTime: undefined,
  nickname: '',
  deptName: '',
  processInstanceId: ''
})
const fileIdList = ref<string[]>([]) // 文件ID列表（使用字符串避免精度丢失）
const printPreviewVisible = ref(false) // 打印预览弹窗显示状态

/** 解析文件ID列表 */
const parseFileIdList = (fileList: string): string[] => {
  if (!fileList) {
    return []
  }
  try {
    // 直接返回字符串数组，避免数字精度丢失
    return fileList.split(',').map(id => id.trim()).filter(id => id.length > 0)
  } catch (error) {
    console.error('解析文件ID列表失败', error)
    return []
  }
}



/** 获得详情 */
const getInfo = async () => {
  detailLoading.value = true
  try {
    detailData.value = await TravelApi.getTravelApi(props.id || queryId)
    // 处理文件列表，如果字段不存在则设为空字符串
    fileIdList.value = parseFileIdList(detailData.value.fileList || '')
    
    // 获取出差人员的部门信息
    await enrichPersonListWithDeptInfo()
  } finally {
    detailLoading.value = false
  }
}

/** 丰富人员列表的部门信息 */
const enrichPersonListWithDeptInfo = async () => {
  if (!detailData.value.personList || detailData.value.personList.length === 0) {
    return
  }

  try {
    // 获取所有的部门信息列表
    const deptList = await DeptApi.getSimpleDeptList()
    
    // 为每个有userId的人员获取部门信息
    for (const person of detailData.value.personList) {
      if (person.userId) {
        try {
          // 获取用户信息
          const userInfo = await UserApi.getUser(person.userId)
          if (userInfo && userInfo.deptId) {
            // 根据部门ID找到部门名称
            const dept = deptList.find(dept => dept.id === userInfo.deptId)
            person.deptName = dept ? dept.name : '未知部门'
          } else {
            person.deptName = '无部门'
          }
        } catch (error) {
          console.error(`获取用户 ${person.userId} 信息失败:`, error)
          person.deptName = '获取失败'
        }
      }
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
    // 如果获取部门列表失败，为所有人员设置默认值
    detailData.value.personList.forEach(person => {
      if (person.userId && !person.deptName) {
        person.deptName = '部门信息获取失败'
      }
    })
  }
}

/** 显示打印预览 */
const showPrintPreview = () => {
  printPreviewVisible.value = true
}

/** 初始化 */
onMounted(async () => {
  await getInfo()
})
</script>

<style scoped>
.el-descriptions-item {
  vertical-align: top;
}
</style>
