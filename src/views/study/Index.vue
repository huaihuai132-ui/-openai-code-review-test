<template>
  <div>
    <h3>地区选择组件测试</h3>
    <RegionDropdown>
      <RegionFullGroup
        v-model="selectedRegion"
        @change="handleRegionChange"
      />
    </RegionDropdown>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RegionFullGroup, RegionDropdown } from 'v-region'

// 定义选中的地区数据
const selectedRegion = ref({
  province: '',
  city: '',
  area: '',
  town: ''
})

// 监听地区选择变化
const handleRegionChange = (data) => {
  console.log('地区选择发生变化：')
  console.log('完整数据：', data)
  console.log('selectedRegion：', selectedRegion.value)
}

</script>
