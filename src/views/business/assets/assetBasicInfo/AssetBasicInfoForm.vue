<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="资产编码" prop="assetCode">
        <el-input v-model="formData.assetCode" placeholder="请输入资产编码" />
      </el-form-item>
      <el-form-item label="资产名称" prop="assetName">
        <el-input v-model="formData.assetName" placeholder="请输入资产名称" />
      </el-form-item>
      <el-form-item label="地址12位编码，只用到9位，2省 4市 6区县 9街道 " prop="addressCode">
        <el-input v-model="formData.addressCode" placeholder="请输入地址12位编码，只用到9位，2省 4市 6区县 9街道 " />
      </el-form-item>
      <el-form-item label="详细地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入详细地址" />
      </el-form-item>
      <el-form-item label="原产权单位" prop="originalOwnershipUnit">
        <el-input v-model="formData.originalOwnershipUnit" placeholder="请输入原产权单位" />
      </el-form-item>
      <el-form-item label="移交单位" prop="transferUnit">
        <el-input v-model="formData.transferUnit" placeholder="请输入移交单位" />
      </el-form-item>
      <el-form-item label="建筑面积(平方米)" prop="buildingArea">
        <el-input v-model="formData.buildingArea" placeholder="请输入建筑面积(平方米)" />
      </el-form-item>
      <el-form-item label="土地面积(平方米)" prop="landArea">
        <el-input v-model="formData.landArea" placeholder="请输入土地面积(平方米)" />
      </el-form-item>
      <el-form-item label="产权证号" prop="propertyNumber">
        <el-input v-model="formData.propertyNumber" placeholder="请输入产权证号" />
      </el-form-item>
      <el-form-item label="是否办证过户: 0-未过户, 1-已过户，字典键business_assets_is_transferred" prop="isTransferred">
        <el-input v-model="formData.isTransferred" placeholder="请输入是否办证过户: 0-未过户, 1-已过户，字典键business_assets_is_transferred" />
      </el-form-item>
      <el-form-item label="产权证到期时间" prop="transferredDate">
        <el-date-picker
          v-model="formData.transferredDate"
          type="date"
          value-format="x"
          placeholder="选择产权证到期时间"
        />
      </el-form-item>
      <el-form-item label="办证过程中遇到的问题" prop="transferIssues">
        <el-input v-model="formData.transferIssues" placeholder="请输入办证过程中遇到的问题" />
      </el-form-item>
      <el-form-item label="使用情况：0-闲置,1-出租,2-自用，字典键business_assets_usage" prop="usage">
        <el-input v-model="formData.usage" placeholder="请输入使用情况：0-闲置,1-出租,2-自用，字典键business_assets_usage" />
      </el-form-item>
      <el-form-item label="出租方式：0-整租,1-分租,2-自用，字典键business_assets_rental_method" prop="rentalMethod">
        <el-input v-model="formData.rentalMethod" placeholder="请输入出租方式：0-整租,1-分租,2-自用，字典键business_assets_rental_method" />
      </el-form-item>
      <el-form-item label="资产价值(万元)" prop="assetValue">
        <el-input v-model="formData.assetValue" placeholder="请输入资产价值(万元)" />
      </el-form-item>
      <el-form-item label="资产类型: 0-经营性资产, 1-非经营性资产，字典键business_assets_type" prop="assetType">
        <el-select v-model="formData.assetType" placeholder="请选择资产类型: 0-经营性资产, 1-非经营性资产，字典键business_assets_type">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="划拨文件id列表" prop="filePath">
        <el-input v-model="formData.filePath" placeholder="请输入划拨文件id列表" />
      </el-form-item>
      <el-form-item label="文件序列编码" prop="sequenceCode">
        <el-input v-model="formData.sequenceCode" placeholder="请输入文件序列编码" />
      </el-form-item>
      <el-form-item label="经度坐标" prop="longitude">
        <el-input v-model="formData.longitude" placeholder="请输入经度坐标" />
      </el-form-item>
      <el-form-item label="纬度坐标" prop="latitude">
        <el-input v-model="formData.latitude" placeholder="请输入纬度坐标" />
      </el-form-item>
      <el-form-item label="资产状态: 0-停用, 1-正常，字典键business_assets_status" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { AssetBasicInfoApi, AssetBasicInfoVO } from 'src/api/business/asset/assetBasicInfo'

/** 资产基本信息 表单 */
defineOptions({ name: 'AssetBasicInfoForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  assetCode: undefined,
  assetName: undefined,
  addressCode: undefined,
  address: undefined,
  originalOwnershipUnit: undefined,
  transferUnit: undefined,
  buildingArea: undefined,
  landArea: undefined,
  propertyNumber: undefined,
  isTransferred: undefined,
  transferredDate: undefined,
  transferIssues: undefined,
  usage: undefined,
  rentalMethod: undefined,
  assetValue: undefined,
  assetType: undefined,
  filePath: undefined,
  sequenceCode: undefined,
  longitude: undefined,
  latitude: undefined,
  status: undefined,
})
const formRules = reactive({
  assetCode: [{ required: true, message: '资产编码不能为空', trigger: 'blur' }],
  assetName: [{ required: true, message: '资产名称不能为空', trigger: 'blur' }],
  addressCode: [{ required: true, message: '地址12位编码，只用到9位，2省 4市 6区县 9街道 不能为空', trigger: 'blur' }],
  address: [{ required: true, message: '详细地址不能为空', trigger: 'blur' }],
  filePath: [{ required: true, message: '划拨文件id列表不能为空', trigger: 'blur' }],
  sequenceCode: [{ required: true, message: '文件序列编码不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await AssetBasicInfoApi.getAssetBasicInfo(id)
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
    const data = formData.value as unknown as AssetBasicInfoVO
    if (formType.value === 'create') {
      await AssetBasicInfoApi.createAssetBasicInfo(data)
      message.success(t('common.createSuccess'))
    } else {
      await AssetBasicInfoApi.updateAssetBasicInfo(data)
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
    assetCode: undefined,
    assetName: undefined,
    addressCode: undefined,
    address: undefined,
    originalOwnershipUnit: undefined,
    transferUnit: undefined,
    buildingArea: undefined,
    landArea: undefined,
    propertyNumber: undefined,
    isTransferred: undefined,
    transferredDate: undefined,
    transferIssues: undefined,
    usage: undefined,
    rentalMethod: undefined,
    assetValue: undefined,
    assetType: undefined,
    filePath: undefined,
    sequenceCode: undefined,
    longitude: undefined,
    latitude: undefined,
    status: undefined,
  }
  formRef.value?.resetFields()
}
</script>
