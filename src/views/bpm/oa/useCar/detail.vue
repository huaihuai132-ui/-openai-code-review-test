<template>
  <ContentWrap>
    <el-descriptions :column="1" border>
      <el-descriptions-item label="申请时间">
        {{ formatDate(detailData.createTime, 'YYYY-MM-DD HH:mm:ss') }}
      </el-descriptions-item>
      <el-descriptions-item label="用车时间">
        {{ formatDate(detailData.useTime, 'YYYY-MM-DD HH:mm:ss') }}
      </el-descriptions-item>
      <el-descriptions-item label="车辆选择">
        {{ getCarName(detailData.carNo) }}
      </el-descriptions-item>
      <el-descriptions-item label="用车原因">
        {{ detailData.reason }}
      </el-descriptions-item>
      <el-descriptions-item label="附件" v-if="fileIdList && fileIdList.length > 0">
        <BatchFileUpload v-model:fileList="fileIdList" mode="view" directory="business" />
      </el-descriptions-item>
      <el-descriptions-item label="附件" v-else>
        <span>无附件</span>
      </el-descriptions-item>
    </el-descriptions>
  </ContentWrap>
</template>
<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import * as UseCarApi from '@/api/bpm/form/useCar'
import { BatchFileUpload } from '@/components/UploadFile'

defineOptions({ name: 'BpmOAUseCarDetail' })

const { query } = useRoute() // 查询参数

const props = defineProps({
  id: propTypes.oneOfType([propTypes.number, propTypes.string]).def(undefined)
})
const detailLoading = ref(false) // 表单的加载中
const detailData = ref<any>({}) // 详情数据
const queryId = query.id as unknown as number | string // 从 URL 传递过来的 id 编号
const fileIdList = ref<string[]>([]) // 文件ID列表（使用字符串避免精度丢失）

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

/** 获取车辆名称 */
const getCarName = (carNo: number): string => {
  const carMap: Record<number, string> = {
    1: '电车1',
    2: '油车2'
  }
  return carMap[carNo] || '未知车辆'
}

/** 获得数据 */
const getInfo = async () => {
  detailLoading.value = true
  try {
    const id = props.id || queryId
    detailData.value = await UseCarApi.getUseCar(id)
    // 处理文件列表，如果字段不存在则设为空字符串
    fileIdList.value = parseFileIdList(detailData.value.fileList || '')
  } finally {
    detailLoading.value = false
  }
}
defineExpose({ open: getInfo }) // 提供 open 方法，用于打开弹窗

/** 初始化 **/
onMounted(() => {
  getInfo()
})
</script>
