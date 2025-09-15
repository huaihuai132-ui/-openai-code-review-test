<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    :title="isEdit ? '编辑资产' : '新增资产'" 
    width="80%"
    :before-close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="区域" prop="area">
            <el-select v-model="form.area" placeholder="请选择区域" style="width: 100%">
              <el-option 
                v-for="area in areaOptions" 
                :key="area.value" 
                :label="area.label" 
                :value="area.value" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="街道" prop="street">
            <el-select v-model="form.street" placeholder="请选择街道" style="width: 100%" :disabled="!form.area">
              <el-option 
                v-for="street in streetOptions" 
                :key="street.value" 
                :label="street.label" 
                :value="street.value" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="form.address" placeholder="请输入详细地址" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="资产名称" prop="assetName">
            <el-input v-model="form.assetName" placeholder="请输入资产名称" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="房产面积" prop="buildingArea">
            <el-input-number v-model="form.buildingArea" :min="0" :precision="2" style="width: 100%" />
            <span class="unit">㎡</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="土地面积" prop="landArea">
            <el-input-number v-model="form.landArea" :min="0" :precision="2" style="width: 100%" />
            <span class="unit">㎡</span>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产权证号" prop="propertyNumber">
            <el-input v-model="form.propertyNumber" placeholder="请输入产权证号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否办证过户" prop="isTransferred">
            <el-radio-group v-model="form.isTransferred">
              <el-radio :label="true">已过户</el-radio>
              <el-radio :label="false">未过户</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="使用情况" prop="usage">
            <el-select v-model="form.usage" placeholder="请选择使用情况" style="width: 100%">
              <el-option label="出租" value="出租" />
              <el-option label="自用" value="自用" />
              <el-option label="闲置" value="闲置" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出租方式" prop="rentalMethod">
            <el-select v-model="form.rentalMethod" placeholder="请选择出租方式" style="width: 100%">
              <el-option label="整租" value="整租" />
              <el-option label="分租" value="分租" />
              <el-option label="自用" value="自用" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="租金" prop="rent">
            <el-input-number v-model="form.rent" :min="0" :precision="2" style="width: 100%" />
            <span class="unit">元/月</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="价值(万元)" prop="value">
            <el-input-number v-model="form.value" :min="0" :precision="2" style="width: 100%" />
            <span class="unit">万元</span>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="资产评估时间" prop="assessmentDate">
            <el-date-picker
              v-model="form.assessmentDate"
              type="date"
              placeholder="请选择评估时间"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="办证过程中遇到的问题" prop="transferIssues">
            <el-input 
              v-model="form.transferIssues" 
              type="textarea" 
              :rows="3"
              placeholder="请输入办证过程中遇到的问题（如无问题请填写'无'）" 
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="划拨文件" prop="allocationFile">
            <el-upload
              class="upload-demo"
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="fileList"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持 PDF、DOC、DOCX 格式文件，文件大小不超过 10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref(null)
const loading = ref(false)
const fileList = ref([])

// 区域街道配置数据
const areaOptions = ref([])
const streetOptions = ref([])

// 区域街道配置数据 (完整版本)
const areaStreetConfig = {
  areaStreetConfig: [
    {
      areaCode: '001',
      areaName: '月湖区',
      streets: [
        { streetCode: '001001', streetName: '童家街道' },
        { streetCode: '001002', streetName: '夏埠街道' },
        { streetCode: '001003', streetName: '四青街道' },
        { streetCode: '001004', streetName: '梅园街道' },
        { streetCode: '001005', streetName: '江边街道' },
        { streetCode: '001006', streetName: '交通街道' },
        { streetCode: '001007', streetName: '东湖街道' },
        { streetCode: '001008', streetName: '白露街道' }
      ]
    },
    {
      areaCode: '002',
      areaName: '贵溪市',
      streets: [
        { streetCode: '002001', streetName: '东门街道' },
        { streetCode: '002002', streetName: '雄石街道' },
        { streetCode: '002003', streetName: '花园街道' },
        { streetCode: '002004', streetName: '泗汥镇' },
        { streetCode: '002005', streetName: '河潭镇' },
        { streetCode: '002006', streetName: '周坊镇' },
        { streetCode: '002007', streetName: '鸿塘镇' },
        { streetCode: '002008', streetName: '志光镇' },
        { streetCode: '002009', streetName: '流口镇' },
        { streetCode: '002010', streetName: '罗河镇' },
        { streetCode: '002011', streetName: '金屯镇' },
        { streetCode: '002012', streetName: '塘湾镇' },
        { streetCode: '002013', streetName: '文坊镇' },
        { streetCode: '002014', streetName: '冷水镇' },
        { streetCode: '002015', streetName: '龙虎山镇' },
        { streetCode: '002016', streetName: '上清镇' },
        { streetCode: '002017', streetName: '滨江镇' },
        { streetCode: '002018', streetName: '白田乡' },
        { streetCode: '002019', streetName: '雷溪乡' },
        { streetCode: '002020', streetName: '彭湾乡' },
        { streetCode: '002021', streetName: '樟坪畲族乡' },
        { streetCode: '002022', streetName: '耳口乡' },
        { streetCode: '002023', streetName: '余家乡' },
        { streetCode: '002024', streetName: '塔桥园艺场' },
        { streetCode: '002025', streetName: '河潭垦殖场' },
        { streetCode: '002026', streetName: '西窯林场' },
        { streetCode: '002027', streetName: '双圳林场' },
        { streetCode: '002028', streetName: '耳口林场' },
        { streetCode: '002029', streetName: '冷水林场' },
        { streetCode: '002030', streetName: '三县岭林场' },
        { streetCode: '002031', streetName: '上清林场' }
      ]
    },
    {
      areaCode: '003',
      areaName: '余江区',
      streets: [
        { streetCode: '003001', streetName: '邓埠镇' },
        { streetCode: '003002', streetName: '锦江镇' },
        { streetCode: '003003', streetName: '画桥镇' },
        { streetCode: '003004', streetName: '潢溪镇' },
        { streetCode: '003005', streetName: '中童镇' },
        { streetCode: '003006', streetName: '马荃镇' },
        { streetCode: '003007', streetName: '黄庄乡' },
        { streetCode: '003008', streetName: '春涛乡' },
        { streetCode: '003009', streetName: '平定乡' },
        { streetCode: '003010', streetName: '杨溪乡' },
        { streetCode: '003011', streetName: '洪湖乡' },
        { streetCode: '003012', streetName: '高公寨林场' },
        { streetCode: '003013', streetName: '水产场' },
        { streetCode: '003014', streetName: '大桥良种场' },
        { streetCode: '003015', streetName: '张公桥农场' },
        { streetCode: '003016', streetName: '塘潮源林场' },
        { streetCode: '003017', streetName: '青年农场' },
        { streetCode: '003018', streetName: '刘垦场' }
      ]
    }
  ]
}


// 表单数据
const form = reactive({
  assetName: '',
  area: '', // 区域代码
  areaName: '', // 区域名称
  street: '', // 街道代码
  streetName: '', // 街道名称
  address: '',
  buildingArea: 0,
  landArea: 0,
  propertyNumber: '',
  isTransferred: false,
  usage: '',
  rentalMethod: '',
  rent: 0,
  value: 0,
  assessmentDate: '', // 资产评估时间
  transferIssues: '',
  allocationFile: ''
})

// 初始化区域数据
onMounted(() => {
  console.log('加载区域街道配置数据:', areaStreetConfig)
  
  areaOptions.value = areaStreetConfig.areaStreetConfig.map(area => ({
    label: area.areaName,
    value: area.areaCode,
    streets: area.streets
  }))
  
  console.log('初始化区域选项:', areaOptions.value)
  
  // 输出每个区域的街道数量
  areaStreetConfig.areaStreetConfig.forEach(area => {
    console.log(`${area.areaName} 街道数量: ${area.streets.length}`)
  })
})

// 监听区域选择变化
watch(() => form.area, (newAreaCode) => {
  console.log('区域选择变化:', newAreaCode)
  
  form.street = '' // 清空街道选择
  form.streetName = ''
  
  if (newAreaCode) {
    const selectedArea = areaStreetConfig.areaStreetConfig.find(area => area.areaCode === newAreaCode)
    console.log('找到的区域:', selectedArea)
    
    if (selectedArea) {
      form.areaName = selectedArea.areaName
      streetOptions.value = selectedArea.streets.map(street => ({
        label: street.streetName,
        value: street.streetCode
      }))
      
      console.log(`${selectedArea.areaName} 街道选项数量: ${streetOptions.value.length}`)
      console.log('街道选项:', streetOptions.value)
    }
  } else {
    streetOptions.value = []
    form.areaName = ''
    console.log('清空街道选项')
  }
})

// 监听街道选择变化
watch(() => form.street, (newStreetCode) => {
  if (newStreetCode) {
    const selectedStreet = streetOptions.value.find(street => street.value === newStreetCode)
    if (selectedStreet) {
      form.streetName = selectedStreet.label
    }
  } else {
    form.streetName = ''
  }
})

// 表单验证规则
const rules = {
  area: [
    { required: true, message: '请选择区域', trigger: 'change' }
  ],
  street: [
    { required: true, message: '请选择街道', trigger: 'change' }
  ],
  assetName: [
    { required: true, message: '请输入资产名称', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ],
  propertyNumber: [
    { required: true, message: '请输入产权证号', trigger: 'blur' }
  ],
  usage: [
    { required: true, message: '请选择使用情况', trigger: 'change' }
  ]
  // rentalMethod 已改为非必填
}

// 监听数据变化，用于编辑模式
watch(() => props.data, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    Object.assign(form, newData)
    if (newData.allocationFile) {
      fileList.value = [{
        name: newData.allocationFile,
        url: '#'
      }]
    }
  }
}, { immediate: true })

// 监听对话框显示状态
watch(() => props.visible, (visible) => {
  if (!visible) {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    assetName: '',
    area: '',
    areaName: '',
    street: '',
    streetName: '',
    address: '',
    buildingArea: 0,
    landArea: 0,
    propertyNumber: '',
    isTransferred: false,
    usage: '',
    rentalMethod: '',
    rent: 0,
    value: 0,
    assessmentDate: '', // 资产评估时间
    transferIssues: '',
    allocationFile: ''
  })
  streetOptions.value = []
  fileList.value = []
  
  nextTick(() => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
  })
}

// 文件上传处理
const handleFileChange = (file) => {
  form.allocationFile = file.name
  fileList.value = [file]
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) {
    ElMessage.error('表单引用错误')
    return
  }
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('submit', { ...form })
    ElMessage.success(props.isEdit ? '编辑成功' : '新增成功')
    handleClose()
  } catch (error) {
    console.error('Form validation error:', error)
    ElMessage.error('请检查表单填写是否正确')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.unit {
  margin-left: 8px;
  color: #666;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload__tip) {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}
</style>
