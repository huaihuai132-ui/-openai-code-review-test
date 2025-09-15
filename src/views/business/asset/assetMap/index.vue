<template>
  <div class="asset-map">
    <div class="map-container">
      <!-- 地图容器 -->
      <div id="map" class="map" v-if="!mapLoadError"></div>

      <!-- 地图加载失败时的备用显示 -->
      <div v-if="mapLoadError" class="map-placeholder">
        <el-empty description="地图加载失败">
          <template #image>
            <el-icon size="60" color="#909399"><Location /></el-icon>
          </template>
          <p>请检查网络连接或联系管理员配置地图API密钥</p>
          <el-button type="primary" @click="initMap">重新加载</el-button>
        </el-empty>
      </div>

      <!-- 资产信息侧边栏 - 固定宽度，不收缩 -->
      <div class="asset-sidebar">
        <div class="sidebar-header">
          <h3>房屋信息</h3>
          <div class="header-controls">
            <el-button type="primary" size="small" @click="refreshMap">刷新地图</el-button>
            <el-button type="info" size="small" @click="showLocationInput = true"
              >定位坐标</el-button
            >
          </div>
        </div>
        <!-- 地图搜索 -->
        <div class="search-panel">
          <el-input
            v-model="searchQuery"
            placeholder="搜索地点/地址（回车或点搜索）"
            clearable
            size="small"
            @keyup.enter="searchPlaces"
          >
            <template #append>
              <el-button :loading="isSearching" type="primary" size="small" @click="searchPlaces"
                >搜索</el-button
              >
            </template>
          </el-input>

          <div v-if="searchResults.length" class="search-results">
            <div
              v-for="poi in searchResults"
              :key="poi.id"
              class="search-result-item"
              @click="goToPoi(poi)"
            >
              <div class="result-row">
                <span class="result-name">{{ poi.name }}</span>
                <el-icon class="result-locate-icon" @click.stop="goToPoi(poi)" title="定位到地图">
                  <Location />
                </el-icon>
              </div>
              <div class="result-address">{{ poi.address }}</div>
            </div>
          </div>
        </div>
        <div class="asset-list">
          <div
            v-for="asset in assetList"
            :key="asset.id"
            class="asset-item"
            @click="selectAsset(asset)"
          >
            <div class="asset-name">{{ asset.assetName }}</div>
            <div class="asset-address">{{ asset.address }}</div>
            <div class="asset-status">
              <el-tag :type="asset.isTransferred ? 'success' : 'warning'" size="small">
                {{ asset.isTransferred ? '已过户' : '未过户' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 资产详情弹窗 -->
    <el-dialog v-model="showAssetDetail" title="房屋详情" width="500px">
      <div v-if="selectedAsset" class="asset-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="房屋名称">{{
            selectedAsset.assetName
          }}</el-descriptions-item>
          <el-descriptions-item label="详细地址">{{ selectedAsset.address }}</el-descriptions-item>
          <el-descriptions-item label="建筑面积"
            >{{ selectedAsset.buildingArea }}㎡</el-descriptions-item
          >
          <el-descriptions-item label="土地面积"
            >{{ selectedAsset.landArea }}㎡</el-descriptions-item
          >
          <el-descriptions-item label="产权证号">{{
            selectedAsset.propertyNumber
          }}</el-descriptions-item>
          <el-descriptions-item label="是否办证过户">
            <el-tag :type="selectedAsset.isTransferred ? 'success' : 'warning'">
              {{ selectedAsset.isTransferred ? '已过户' : '未过户' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="使用情况">{{ selectedAsset.usage }}</el-descriptions-item>
          <el-descriptions-item label="出租方式">{{
            selectedAsset.rentalMethod
          }}</el-descriptions-item>
          <el-descriptions-item label="月租金"
            >¥{{ selectedAsset.rent.toLocaleString() }}</el-descriptions-item
          >
          <el-descriptions-item label="房屋价值"
            >{{ selectedAsset.value }}万元</el-descriptions-item
          >
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 地址资产列表弹窗 -->
    <AddressAssetListDialog
      v-model:visible="showAddressAssetList"
      :address="currentAddress"
      :asset-list="currentAddressAssets"
      @view-detail="handleViewAssetDetail"
      @locate-asset="handleLocateAsset"
    />

    <!-- 坐标定位弹窗 -->
    <el-dialog v-model="showLocationInput" title="手动定位坐标" width="400px">
      <div class="location-input">
        <el-form :model="locationForm" label-width="80px">
          <el-form-item label="经度">
            <el-input v-model="locationForm.lng" placeholder="请输入经度" />
          </el-form-item>
          <el-form-item label="纬度">
            <el-input v-model="locationForm.lat" placeholder="请输入纬度" />
          </el-form-item>
          <el-form-item label="缩放级别">
            <el-input-number v-model="locationForm.zoom" :min="1" :max="20" />
          </el-form-item>
        </el-form>

        <!-- 预设坐标点 -->
        <div class="preset-locations">
          <h4>预设坐标点：</h4>
          <div class="preset-buttons">
            <el-button
              size="small"
              @click="setPresetLocation('鹰潭市中心', '117.069202', '28.260189', 15)"
            >
              鹰潭市中心
            </el-button>
            <el-button
              size="small"
              @click="setPresetLocation('林荫东路区域', '117.069202', '28.260189', 16)"
            >
              林荫东路区域
            </el-button>
            <el-button
              size="small"
              @click="setPresetLocation('环城西路区域', '117.067202', '28.258189', 16)"
            >
              环城西路区域
            </el-button>
            <el-button
              size="small"
              @click="setPresetLocation('岱宝山路区域', '117.073202', '28.264189', 16)"
            >
              岱宝山路区域
            </el-button>
            <el-button
              size="small"
              @click="setPresetLocation('莲花路区域', '117.075202', '28.266189', 16)"
            >
              莲花路区域
            </el-button>
            <el-button
              size="small"
              @click="setPresetLocation('民昇佳苑区域', '117.071202', '28.262189', 16)"
            >
              民昇佳苑区域
            </el-button>
          </div>
        </div>

        <div class="dialog-footer">
          <el-button @click="showLocationInput = false">取消</el-button>
          <el-button type="primary" @click="goToLocation">定位</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location } from '@element-plus/icons-vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import AddressAssetListDialog from './components/AddressAssetListDialog.vue'

// AMap 配置（支持 .env 注入）
const AMAP_KEY = import.meta?.env?.VITE_AMAP_KEY || '247d27bc71d901af6f34cbd6077da5bb'
const AMAP_SECURITY =
  import.meta?.env?.VITE_AMAP_SECURITY_JS_CODE || 'e1205b5f0418c124c017802fbda1b1ab'

// 搜索状态
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const searchMarker = ref(null)

// 清理搜索标记
const clearSearchMarker = () => {
  if (searchMarker.value && map.value) {
    map.value.remove(searchMarker.value)
  }
  searchMarker.value = null
}

// 响应式数据
const map = ref(null)
const showAssetDetail = ref(false)
const selectedAsset = ref(null)
const mapLoadError = ref(false) // 新增：地图加载失败标志

// 地址资产列表弹窗相关数据
const showAddressAssetList = ref(false)
const currentAddress = ref('')
const currentAddressAssets = ref([])
const showLocationInput = ref(false) // 坐标输入弹窗显示状态
const locationForm = ref({
  lng: '117.069202',
  lat: '28.260189',
  zoom: 14,
}) // 坐标表单数据

// 当前地图中心点坐标
const currentMapCenter = ref({
  lng: '117.069202',
  lat: '28.260189',
})

// 标记集合用于 fitView
const markers = ref([])
// 信息窗实例
const infoWindow = ref(null)
const route = useRoute()

// 根据路由参数尝试聚焦到指定位置
const focusFromRoute = () => {
  if (!map.value) return
  const { lng, lat, assetId, id, address, zoom } = route.query || {}

  // 2) 资产ID
  const routeId = id ?? assetId
  if (routeId !== undefined) {
    const idNum = Number(routeId)
    const asset = assetList.value.find((a) => a.id === idNum)
    console.log('------routeId-------', asset)
    selectAsset(asset)
  }
}

// 模拟资产数据 - 江西省鹰潭市房屋信息
const assetList = ref([
  {
    id: 1,
    assetName: '林荫东路南侧C栋9号',
    address: '江西省鹰潭市月湖区林荫东路南侧C栋9号',
    buildingArea: 120,
    landArea: 80,
    propertyNumber: '鹰房权证字第001号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 32000,
    value: 120,
    lng: 117.069202,
    lat: 28.260189,
  },
  {
    id: 2,
    assetName: '林荫东路南侧C栋8号',
    address: '江西省鹰潭市月湖区林荫东路南侧C栋8号',
    buildingArea: 120,
    landArea: 80,
    propertyNumber: '鹰房权证字第002号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 32000,
    value: 120,
    lng: 117.04075,
    lat: 28.240816,
  },
  {
    id: 3,
    assetName: '民昇佳苑21号楼-02＃、01022#、01023#店面',
    address: '江西省鹰潭市月湖区民昇佳苑21号楼',
    buildingArea: 150,
    landArea: 100,
    propertyNumber: '鹰房权证字第003号',
    isTransferred: false,
    usage: '出租',
    rentalMethod: '分租',
    rent: 36000,
    value: 150,
    lng: 117.024051,
    lat: 28.245856,
  },
  {
    id: 4,
    assetName: '环城西路6号-2#店面',
    address: '江西省鹰潭市月湖区环城西路6号',
    buildingArea: 200,
    landArea: 120,
    propertyNumber: '鹰房权证字第004号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 60000,
    value: 200,
    lng: 117.033,
    lat: 28.238392,
  },
  {
    id: 5,
    assetName: '民昇佳苑22号楼-01＃店面',
    address: '江西省鹰潭市月湖区民昇佳苑22号楼',
    buildingArea: 100,
    landArea: 70,
    propertyNumber: '鹰房权证字第005号',
    isTransferred: false,
    usage: '出租',
    rentalMethod: '整租',
    rent: 21000,
    value: 100,
    lng: 117.024051,
    lat: 28.245856,
  },
  {
    id: 6,
    assetName: '岱宝山路9号（1-4层）',
    address: '江西省鹰潭市月湖区岱宝山路9号',
    buildingArea: 400,
    landArea: 200,
    propertyNumber: '鹰房权证字第006号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 60000,
    value: 400,
    lng: 117.073202,
    lat: 28.264189,
  },
  {
    id: 7,
    assetName: '环城西路6号-1#店面',
    address: '江西省鹰潭市月湖区环城西路6号',
    buildingArea: 200,
    landArea: 120,
    propertyNumber: '鹰房权证字第007号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 60000,
    value: 200,
    lng: 117.033,
    lat: 28.238392,
  },
  {
    id: 8,
    assetName: '民昇佳苑22号楼-02＃店面',
    address: '江西省鹰潭市月湖区民昇佳苑22号楼',
    buildingArea: 80,
    landArea: 60,
    propertyNumber: '鹰房权证字第008号',
    isTransferred: false,
    usage: '出租',
    rentalMethod: '整租',
    rent: 13500,
    value: 80,
    lng: 117.024051,
    lat: 28.245856,
  },
  {
    id: 9,
    assetName: '民昇佳苑22号楼-06#店面',
    address: '江西省鹰潭市月湖区民昇佳苑22号楼',
    buildingArea: 70,
    landArea: 50,
    propertyNumber: '鹰房权证字第009号',
    isTransferred: false,
    usage: '出租',
    rentalMethod: '整租',
    rent: 12000,
    value: 70,
    lng: 117.024051,
    lat: 28.245856,
  },
  {
    id: 10,
    assetName: '莲花路菜场南侧',
    address: '江西省鹰潭市月湖区莲花路菜场南侧',
    buildingArea: 180,
    landArea: 120,
    propertyNumber: '鹰房权证字第010号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 55000,
    value: 180,
    lng: 117.025401,
    lat: 28.243409,
  },
  {
    id: 11,
    assetName: '莲花南路十区17-18号一至三楼商业房',
    address: '江西省鹰潭市月湖区莲花南路十区17-18号',
    buildingArea: 300,
    landArea: 200,
    propertyNumber: '鹰房权证字第011号',
    isTransferred: true,
    usage: '出租',
    rentalMethod: '整租',
    rent: 6500,
    value: 300,
    lng: 117.10247,
    lat: 28.266999,
  },
  {
    id: 12,
    assetName: '民欣佳园24号楼-02#店面',
    address: '江西省鹰潭市月湖区民欣佳园24号楼',
    buildingArea: 150,
    landArea: 100,
    propertyNumber: '鹰房权证字第012号',
    isTransferred: false,
    usage: '出租',
    rentalMethod: '整租',
    rent: 36000,
    value: 150,
    lng: 117.013868,
    lat: 28.24095,
  },
])

// 导出资产数据供其他组件使用
const exportAssetData = () => {
  return assetList.value
}

// 更新资产数据
const updateAssetData = (newData) => {
  assetList.value = newData
  // 触发全局事件，通知其他组件数据已更新
  window.dispatchEvent(
    new CustomEvent('assetDataUpdated', {
      detail: { data: assetList.value },
    }),
  )
}

// 监听其他组件的资产数据更新请求
const handleAssetDataUpdate = (event) => {
  const { type, data } = event.detail
  if (type === 'updateAssetBasicInfo') {
    // 更新资产基本信息
    const index = assetList.value.findIndex((asset) => asset.id === data.id)
    if (index !== -1) {
      assetList.value[index] = { ...assetList.value[index], ...data }
      // 如果地图已加载，刷新标记
      if (map.value) {
        refreshMap()
      }
    }
  } else if (type === 'addAssetBasicInfo') {
    // 添加新资产
    const newAsset = { ...data, id: Math.max(...assetList.value.map((a) => a.id)) + 1 }
    assetList.value.push(newAsset)
    // 如果地图已加载，添加新标记
    if (map.value) {
      addAssetMarkers()
    }
  } else if (type === 'deleteAssetBasicInfo') {
    // 删除资产
    const index = assetList.value.findIndex((asset) => asset.id === data.id)
    if (index !== -1) {
      assetList.value.splice(index, 1)
      // 如果地图已加载，刷新标记
      if (map.value) {
        refreshMap()
      }
    }
  }
}

// 初始化地图
const initMap = async () => {
  mapLoadError.value = false // 重置加载失败标志
  try {
    console.log('开始加载高德地图...')

    // 如果开启了JS安全密钥，请在 .env 中配置 VITE_AMAP_SECURITY_JS_CODE，或在此处直接填写
    if (!window._AMapSecurityConfig) {
      window._AMapSecurityConfig = {
        securityJsCode: AMAP_SECURITY,
      }
    } else {
      window._AMapSecurityConfig.securityJsCode = AMAP_SECURITY
    }
    if (!AMAP_SECURITY) {
      console.warn(
        '未检测到 VITE_AMAP_SECURITY_JS_CODE，某些服务（如 PlaceSearch/Geocoder）可能报 INVALID_USER_SCODE',
      )
    }

    const AMap = await AMapLoader.load({
      key: AMAP_KEY, // 从环境变量读取，未配置则用默认
      version: '2.0',
      plugins: [
        'AMap.Geolocation',
        'AMap.Scale',
        'AMap.ToolBar',
        'AMap.Geocoder',
        'AMap.PlaceSearch',
      ],
    })

    console.log('高德地图加载成功:', AMap)

    // 将AMap挂载到window对象上，方便其他地方使用
    window.AMap = AMap

    // 兜底：若 PlaceSearch 未就绪，则按需加载
    if (!AMap.PlaceSearch && AMap.plugin) {
      await new Promise((resolve) => AMap.plugin('AMap.PlaceSearch', resolve))
    }

    // 确保地图容器存在
    const mapContainer = document.getElementById('map')
    if (!mapContainer) {
      throw new Error('地图容器不存在')
    }

    console.log('地图容器尺寸:', mapContainer.offsetWidth, 'x', mapContainer.offsetHeight)

    map.value = new AMap.Map('map', {
      zoom: 15, // 提高缩放级别以获得更精确的显示
      center: [117.069202, 28.260189], // 定位到江西省鹰潭市
      mapStyle: 'amap://styles/normal',
      resizeEnable: true, // 启用自动适应容器尺寸变化
      dragEnable: true, // 启用拖拽
      zoomEnable: true, // 启用缩放
      doubleClickZoom: true, // 启用双击缩放
    })

    console.log('地图实例创建成功:', map.value)

    // 创建信息窗（小弹窗）实例
    try {
      infoWindow.value = new window.AMap.InfoWindow({
        isCustom: false,
        offset: new window.AMap.Pixel(0, -28),
      })
    } catch (iwErr) {
      console.warn('创建信息窗失败:', iwErr)
    }

    // 等待地图渲染完成
    map.value.on('complete', () => {
      console.log('地图渲染完成')

      // 获取并显示当前地图中心点坐标
      const center = map.value.getCenter()
      console.log('当前地图中心点坐标:', center.getLng(), center.getLat())

      // 更新当前坐标显示
      updateCurrentCoordinates()

      // 添加控件
      map.value.addControl(new AMap.Scale())
      map.value.addControl(new AMap.ToolBar())

      // 添加地图点击事件（仅打印日志，不再弹出信息窗/消息提示）
      map.value.on('click', (e) => {
        // 点击空白处关闭信息窗
        try {
          infoWindow.value && infoWindow.value.close()
        } catch {}
        const lng = e.lnglat.getLng()
        const lat = e.lnglat.getLat()
        console.log('地图点击位置坐标:', lng, lat)

        // 如需地址，可保留逆地理编码但不提示消息
        const geocoder = new AMap.Geocoder({ city: '360600' })
        geocoder.getAddress([lng, lat], (status, result) => {
          if (status === 'complete' && result.info === 'OK') {
            const address = result.regeocode.formattedAddress
            console.log('点击位置地址:', address)
          } else {
            console.error('逆地理编码失败:', status, result)
          }
        })
      })

      ElMessage.success('地图加载成功')
      // 添加资产标记
      addAssetMarkers()
      // 若带有 id/assetId 参数，则按参数聚焦
      const hasRouteId = !!(
        route?.query &&
        (route.query.id !== undefined || route.query.assetId !== undefined)
      )
      if (hasRouteId) {
        setTimeout(() => {
          focusFromRoute()
        }, 1200)
      } else {
        recenterToAddress('江西省鹰潭市月湖区', 15)
      }
    })

    // 添加地图移动事件监听
    map.value.on('moveend', () => {
      const center = map.value.getCenter()
      console.log('地图移动结束，当前中心点:', center.getLng(), center.getLat())
      currentMapCenter.value = {
        lng: center.getLng().toFixed(6),
        lat: center.getLat().toFixed(6),
      }
    })

    // 添加缩放事件监听
    map.value.on('zoomend', () => {
      const zoom = map.value.getZoom()
      console.log('地图缩放结束，当前级别:', zoom)
    })
  } catch (error) {
    console.error('地图加载失败:', error)
    ElMessage.error('地图加载失败，请检查网络连接或API配置')
    mapLoadError.value = true // 设置加载失败标志
  }
}

// 添加资产标记
const addAssetMarkers = () => {
  if (!map.value || !window.AMap) {
    console.warn('地图或AMap未加载，无法添加标记')
    return
  }

  try {
    console.log('开始添加资产标记...')

    // 清除现有标记
    map.value.clearMap()
    markers.value = []

    let validMarkersCount = 0

    assetList.value.forEach((asset, index) => {
      try {
        // 验证坐标的有效性
        if (
          !asset.lng ||
          !asset.lat ||
          isNaN(parseFloat(asset.lng)) ||
          isNaN(parseFloat(asset.lat))
        ) {
          console.warn(`资产 ${asset.assetName} 的坐标无效:`, asset.lng, asset.lat)
          return
        }

        const lng = parseFloat(asset.lng)
        const lat = parseFloat(asset.lat)

        // 检查坐标是否在合理范围内（中国境内）
        if (lng < 73 || lng > 135 || lat < 18 || lat > 54) {
          console.warn(`资产 ${asset.assetName} 的坐标超出中国范围:`, lng, lat)
          return
        }

        console.log(`添加资产标记: ${asset.assetName}, 坐标: ${lng}, ${lat}`)

        // 根据资产状态选择不同的标记样式
        const markerIcon = asset.isTransferred ? 'mark_b.png' : 'mark_r.png'

        const marker = new window.AMap.Marker({
          position: [lng, lat],
          title: '',
          anchor: 'bottom-center',
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(32, 32),
            imageSize: new window.AMap.Size(32, 32),
            image: `https://webapi.amap.com/theme/v1.3/markers/n/${markerIcon}`,
          }),
          zIndex: asset.isTransferred ? 100 : 50, // 已过户的资产标记层级更高
        })

        // 添加点击事件 - 先跳转地图再显示弹窗
        marker.on('click', () => {
          if (map.value && asset.lng && asset.lat) {
            const lngNum = parseFloat(asset.lng)
            const latNum = parseFloat(asset.lat)
            if (!isNaN(lngNum) && !isNaN(latNum)) {
              // 首先跳转地图到对应位置
              map.value.setZoomAndCenter(16, [lngNum, latNum], true, 800)
              
              // 显示跳转反馈
              ElMessage({
                message: `正在定位到: ${asset.assetName}`,
                type: 'info',
                duration: 1500
              })
              
              // 检查是否有多个资产在同一地址
              const addressAssets = getAssetsByAddress(asset.address)
              if (addressAssets.length > 1) {
                // 多个资产，延迟显示列表弹窗
                setTimeout(() => {
                  currentAddress.value = asset.address
                  currentAddressAssets.value = addressAssets
                  showAddressAssetList.value = true
                }, 900)
              } else {
                // 单个资产，延迟显示信息窗
                setTimeout(() => {
                  const content = `
                    <div style="min-width:200px;max-width:260px;font-size:12px;line-height:1.4;">
                      <div style="font-weight:600;margin-bottom:6px;color:#303133;">${asset.assetName}</div>
                      <div style="color:#606266;">${asset.address}</div>
                    </div>
                  `
                  try {
                    if (infoWindow.value) {
                      infoWindow.value.setContent(content)
                      infoWindow.value.open(map.value, [lngNum, latNum])
                    }
                  } catch (iwOpenErr) {
                    console.warn('打开信息窗失败:', iwOpenErr)
                  }
                }, 900)
              }
              console.log(`定位到资产: ${asset.assetName}, 坐标: ${lngNum}, ${latNum}`)
            }
          }
        })

        map.value.add(marker)
        markers.value.push(marker)
        validMarkersCount++
      } catch (markerError) {
        console.error(`添加标记失败 ${asset.assetName}:`, markerError)
      }
    })

    // 根据所有标记自动调整视图，右侧为侧边栏预留内边距
    if (markers.value.length > 0) {
      try {
        map.value.setFitView(markers.value, false, [30, 300, 30, 30])
        console.log('地图视图已调整到适合所有标记')
      } catch (fitViewError) {
        console.warn('地图fitView失败:', fitViewError)
      }
    }
  } catch (error) {
    console.error('添加资产标记时出错:', error)
    ElMessage.error('添加资产标记失败')
  }
}

// 选择资产
const selectAsset = (asset) => {
  selectedAsset.value = asset
  console.log('====selectedAsset.value======', selectedAsset.value)
  
  // 首先跳转地图到对应位置
  if (map.value && asset.lng && asset.lat) {
    const lng = parseFloat(asset.lng)
    const lat = parseFloat(asset.lat)

    if (!isNaN(lng) && !isNaN(lat)) {
      // 使用动画效果平滑移动到资产位置
      map.value.setZoomAndCenter(16, [lng, lat], true, 800)
      updateCurrentCoordinates()
      
      // 显示跳转反馈
      ElMessage({
        message: `正在定位到: ${asset.assetName}`,
        type: 'info',
        duration: 1500
      })

      // 检查是否有多个资产在同一地址
      const addressAssets = getAssetsByAddress(asset.address)
      if (addressAssets.length > 1) {
        // 多个资产，延迟显示列表弹窗（等待地图跳转完成）
        setTimeout(() => {
          currentAddress.value = asset.address
          currentAddressAssets.value = addressAssets
          showAddressAssetList.value = true
        }, 900) // 稍微延迟一点，确保地图跳转动画完成
      } else {
        // 单个资产，延迟显示信息窗
        setTimeout(() => {
          const content = `
            <div style="min-width:200px;max-width:260px;font-size:12px;line-height:1.4;">
              <div style="font-weight:600;margin-bottom:6px;color:#303133;">${asset.assetName}</div>
              <div style="color:#606266;">${asset.address}</div>
            </div>
          `
          if (infoWindow.value) {
            infoWindow.value.setContent(content)
            infoWindow.value.open(map.value, [lng, lat])
          }
        }, 900)
      }
    } else {
      console.warn(`资产 ${asset.assetName} 的坐标无效:`, asset.lng, asset.lat)
      ElMessage.warning('该资产坐标无效，无法定位')
    }
  }
}

// 根据地址获取资产列表
const getAssetsByAddress = (address) => {
  return assetList.value.filter(asset => asset.address === address)
}

// 定位到特定资产
const locateToAsset = (asset) => {
  // 如果地图存在，精确定位到该资产
  if (map.value && asset.lng && asset.lat) {
    const lng = parseFloat(asset.lng)
    const lat = parseFloat(asset.lat)

    if (!isNaN(lng) && !isNaN(lat)) {
      // 使用动画效果平滑移动到资产位置
      map.value.setZoomAndCenter(16, [lng, lat], true, 800)
      updateCurrentCoordinates()

      // 打开与标记点击一致的信息窗
      try {
        const content = `
          <div style="min-width:200px;max-width:260px;font-size:12px;line-height:1.4;">
            <div style="font-weight:600;margin-bottom:6px;color:#303133;">${asset.assetName}</div>
            <div style="color:#606266;">${asset.address}</div>
          </div>
        `
        if (infoWindow.value) {
          infoWindow.value.setContent(content)
          setTimeout(() => infoWindow.value && infoWindow.value.open(map.value, [lng, lat]), 200)
        }
      } catch {}

      // // 延迟显示当前地图状态
      // setTimeout(() => {
      //   const center = map.value.getCenter()
      //   const zoom = map.value.getZoom()
      //   console.log(
      //     `当前地图状态: 中心点=${center.getLng().toFixed(6)}, ${center.getLat().toFixed(6)}, 缩放级别=${zoom}`,
      //   )
      // }, 1000)
    } else {
      console.warn(`资产 ${asset.assetName} 的坐标无效:`, asset.lng, asset.lat)
      ElMessage.warning('该资产坐标无效，无法定位')
    }
  }
}

// 处理从地址资产列表弹窗查看详情
const handleViewAssetDetail = (asset) => {
  selectedAsset.value = asset
  showAssetDetail.value = true
}

// 处理从地址资产列表弹窗定位资产
const handleLocateAsset = (asset) => {
  locateToAsset(asset)
  ElMessage.success(`已定位到资产: ${asset.assetName}`)
}

// 刷新地图
const refreshMap = () => {
  if (map.value) {
    try {
      console.log('开始刷新地图...')

      // 清除现有标记
      map.value.clearMap()
      markers.value = []

      // 重新添加资产标记
      addAssetMarkers()

      // 强制重新计算地图尺寸
      setTimeout(() => {
        try {
          map.value.resize()
          console.log('地图尺寸已重新调整')
        } catch (resizeError) {
          console.warn('地图resize失败:', resizeError)
        }
      }, 100)

      // 确保地图视图正确显示所有标记
      setTimeout(() => {
        if (markers.value.length > 0) {
          try {
            map.value.setFitView(markers.value, false, [30, 300, 30, 30])
            console.log('地图视图已调整到适合所有标记')
          } catch (fitViewError) {
            console.warn('地图fitView失败:', fitViewError)
          }
        }
      }, 200)

      // 显示刷新成功信息
      ElMessage.success('地图已刷新')

      // 在控制台输出当前地图状态
      setTimeout(() => {
        try {
          const center = map.value.getCenter()
          const zoom = map.value.getZoom()
          console.log(
            `地图刷新完成，当前状态: 中心点=${center.getLng().toFixed(6)}, ${center.getLat().toFixed(6)}, 缩放级别=${zoom}`,
          )
        } catch (statusError) {
          console.warn('获取地图状态失败:', statusError)
        }
      }, 300)
    } catch (error) {
      console.error('刷新地图时出错:', error)
      ElMessage.error('刷新地图失败，请重试')
    }
  } else {
    ElMessage.warning('地图未加载，无法刷新')
  }
}

// 定位到指定坐标
const goToLocation = () => {
  if (!map.value) return

  const lng = parseFloat(locationForm.value.lng)
  const lat = parseFloat(locationForm.value.lat)
  const zoom = parseInt(locationForm.value.zoom)

  if (isNaN(lng) || isNaN(lat) || isNaN(zoom)) {
    ElMessage.error('请输入有效的经度、纬度和缩放级别')
    return
  }

  // 验证坐标范围
  if (lng < 73 || lng > 135 || lat < 18 || lat > 54) {
    ElMessage.warning('坐标超出中国范围，请检查输入')
    return
  }

  // 使用动画效果平滑移动到目标位置
  map.value.setZoomAndCenter(zoom, [lng, lat], true, 1000)

  showLocationInput.value = false

  // 显示定位成功信息
  ElMessage.success(`已定位到坐标: ${lng.toFixed(6)}, ${lat.toFixed(6)}`)

  // 在控制台输出详细信息
  console.log(`地图定位到: 经度=${lng}, 纬度=${lat}, 缩放级别=${zoom}`)

  // 延迟显示当前地图中心点信息
  setTimeout(() => {
    const center = map.value.getCenter()
    const currentZoom = map.value.getZoom()
    console.log(
      `当前地图中心点: ${center.getLng().toFixed(6)}, ${center.getLat().toFixed(6)}, 缩放级别: ${currentZoom}`,
    )
  }, 1200)
}

// 预设坐标点
const setPresetLocation = (name, lng, lat, zoom) => {
  const lngNum = parseFloat(lng)
  const latNum = parseFloat(lat)
  const zoomNum = parseInt(zoom)

  // 验证坐标有效性
  if (isNaN(lngNum) || isNaN(latNum) || isNaN(zoomNum)) {
    ElMessage.error('预设坐标数据无效')
    return
  }

  // 验证坐标范围
  if (lngNum < 73 || lngNum > 135 || latNum < 18 || latNum > 54) {
    ElMessage.warning('预设坐标超出中国范围')
    return
  }

  locationForm.value.lng = lng
  locationForm.value.lat = lat
  locationForm.value.zoom = zoom

  console.log(`预设位置已设置: ${name}, 坐标: ${lngNum}, ${latNum}, 缩放: ${zoomNum}`)
  ElMessage.success(`已设置"${name}"的坐标和缩放级别`)
}

// 更新当前地图中心点坐标显示
const updateCurrentCoordinates = () => {
  if (map.value) {
    const center = map.value.getCenter()
    currentMapCenter.value = {
      lng: center.getLng().toFixed(6),
      lat: center.getLat().toFixed(6),
    }
  }
}

// 根据地址重定位（例如：江西省鹰潭市月湖区）
const recenterToAddress = (address, zoom = 15) => {
  if (!map.value || !window.AMap) return
  const geocoder = new window.AMap.Geocoder({ city: '360600' })
  geocoder.getLocation(address, (status, result) => {
    if (
      status === 'complete' &&
      result.info === 'OK' &&
      result.geocodes &&
      result.geocodes.length
    ) {
      const loc = result.geocodes[0].location
      map.value.setZoomAndCenter(zoom, [loc.lng, loc.lat], true, 800)
      updateCurrentCoordinates()
      ElMessage.success(`已根据地址重定位: ${address}`)
    } else {
      ElMessage.warning(`无法根据地址定位: ${address}`)
    }
  })
}

// 地理编码状态与缓存
const isGeocoding = ref(false)
const geocodeProgress = ref({ completed: 0, total: 0 })
const geocodeCache = new Map()

// 使用高德地理编码查询地址 -> 坐标（带缓存）
const geocodeAddress = (address) => {
  return new Promise((resolve, reject) => {
    if (!window.AMap) {
      reject(new Error('AMap 未加载'))
      return
    }
    if (geocodeCache.has(address)) {
      resolve(geocodeCache.get(address))
      return
    }
    const geocoder = new window.AMap.Geocoder({ city: '360600' })
    geocoder.getLocation(address, (status, result) => {
      console.log('Geocoder 返回:', status, result)
      if (
        status === 'complete' &&
        result.info === 'OK' &&
        result.geocodes &&
        result.geocodes.length
      ) {
        const loc = result.geocodes[0].location
        const coord = { lng: loc.lng, lat: loc.lat }
        geocodeCache.set(address, coord)
        resolve(coord)
      } else {
        reject(new Error(`地理编码失败: ${result?.info || status}`))
      }
    })
  })
}


// 执行地点搜索（使用 PlaceSearch）
const searchPlaces = () => {
  if (!window.AMap || !searchQuery.value.trim()) return
  if (!window.AMap.PlaceSearch && window.AMap.plugin) {
    window.AMap.plugin('AMap.PlaceSearch', () => {})
  }
  isSearching.value = true
  const placeSearch = new window.AMap.PlaceSearch({
    city: '360600',
    citylimit: true,
    pageSize: 10,
    pageIndex: 1,
  })
  placeSearch.search(searchQuery.value.trim(), (status, result) => {
    isSearching.value = false
    console.log('PlaceSearch 返回:', status, result)
    if (status === 'complete' && result.info === 'OK' && result.poiList && result.poiList.pois) {
      searchResults.value = result.poiList.pois.map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address || `${p.pname || ''}${p.cityname || ''}${p.adname || ''}`,
        location: p.location ? { lng: p.location.lng, lat: p.location.lat } : null,
      }))
      if (!searchResults.value.length) {
        ElMessage.warning('未找到相关地点')
      }
    } else {
      searchResults.value = []
      const info = result?.info || status
      ElMessage.error(`搜索失败: ${info}`)
    }
  })
}

// 跳转到 POI
const goToPoi = (poi) => {
  if (!poi.location || !map.value) return
  map.value.setZoomAndCenter(17, [poi.location.lng, poi.location.lat], true, 600)
  updateCurrentCoordinates()

  // 放置临时高亮标记
  try {
    clearSearchMarker()
    const icon = new window.AMap.Icon({
      size: new window.AMap.Size(32, 32),
      imageSize: new window.AMap.Size(32, 32),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_g.png',
    })
    searchMarker.value = new window.AMap.Marker({
      position: [poi.location.lng, poi.location.lat],
      title: '',
      anchor: 'bottom-center',
      icon,
      zIndex: 200,
    })
    map.value.add(searchMarker.value)
    // 不再创建或打开信息窗，仅跳转定位
  } catch (e) {
    // 忽略临时标记异常
  }
}

// 生命周期
onMounted(() => {
  initMap()
  // 添加窗口resize监听器
  window.addEventListener('resize', handleWindowResize)
  // 添加资产数据更新监听器
  window.addEventListener('assetDataUpdateRequest', handleAssetDataUpdate)
  // 立即广播一次当前资产数据，确保其他页面同步到最新前缀
  window.dispatchEvent(
    new CustomEvent('assetDataUpdated', {
      detail: { data: assetList.value },
    }),
  )
})

onUnmounted(() => {
  if (map.value) {
    map.value.destroy()
  }
  // 移除窗口resize监听器
  window.removeEventListener('resize', handleWindowResize)
  // 移除资产数据更新监听器
  window.removeEventListener('assetDataUpdateRequest', handleAssetDataUpdate)
})

// 添加窗口resize监听器
const handleWindowResize = () => {
  if (map.value) {
    try {
      // 延迟执行resize，确保DOM更新完成
      setTimeout(() => {
        try {
          map.value.resize()
          console.log('窗口大小改变，地图已重新调整')

          // 更新坐标显示
          updateCurrentCoordinates()

          // 重新调整视图以适应所有标记
          if (markers.value.length > 0) {
            try {
              map.value.setFitView(markers.value, false, [30, 300, 30, 30])
              console.log('窗口大小改变后，地图视图已重新调整')
            } catch (fitViewError) {
              console.warn('窗口大小改变后fitView失败:', fitViewError)
            }
          }
        } catch (resizeError) {
          console.error('窗口大小改变时地图resize失败:', resizeError)
        }
      }, 100)
    } catch (error) {
      console.error('处理窗口大小改变时出错:', error)
    }
  }
}
</script>

<style scoped>
.asset-map {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.map-header h2 {
  margin: 0;
  color: #303133;
}

.map-container {
  flex: 1;
  position: relative;
  display: flex;
  min-height: 0; /* 重要：确保flex子元素能够正确收缩 */
  overflow: hidden; /* 防止内容溢出 */
}

.map {
  flex: 1; /* 地图占据剩余空间 */
  height: 100%;
  min-height: 810px; /* 设置最小高度确保地图可见 */
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin: 10px;
  position: relative; /* 确保定位正确 */
  overflow: hidden; /* 防止地图内容溢出 */
  transition: all 0.3s ease; /* 添加平滑过渡动画 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 添加轻微阴影 */
}

/* 确保地图容器内的canvas元素正确显示 */
.map :deep(canvas) {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: 4px; /* 确保canvas也有圆角 */
}

.map-placeholder {
  flex: 1; /* 占位符也占据剩余空间 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  margin: 10px;
  min-height: 400px; /* 与地图容器保持一致 */
  transition: all 0.3s ease; /* 添加过渡动画 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 添加轻微阴影 */
}

.map-placeholder .el-empty {
  text-align: center;
}

.map-placeholder p {
  color: #909399;
  margin: 10px 0;
}

.asset-sidebar {
  width: 280px; /* 固定宽度，更窄 */
  background: #fff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：确保flex子元素能够正确收缩 */
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
  flex-shrink: 0; /* 防止侧边栏被压缩 */
  position: relative; /* 确保定位正确 */
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.header-controls {
  display: flex;
  gap: 10px; /* 控制按钮之间的间距 */
}

.current-coordinates {
  margin-top: 10px;
  text-align: center;
}

.current-coordinates .el-tag {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  padding: 2px 6px;
}

.search-panel {
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
}
.search-panel .el-input {
  width: 100%;
}
.search-results {
  margin-top: 8px;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.search-result-item {
  padding: 8px 10px;
  border-bottom: 1px solid #f2f6fc;
  cursor: pointer;
}
.search-result-item:last-child {
  border-bottom: none;
}
.result-name {
  font-size: 13px;
  color: #303133;
}
.result-address {
  font-size: 12px;
  color: #909399;
}

.asset-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.asset-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.asset-item:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.asset-name {
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
  font-size: 14px;
}

.asset-address {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.4;
}

.asset-status {
  display: flex;
  justify-content: flex-end;
}

.asset-detail {
  padding: 10px 0;
}

.location-input {
  padding: 10px 0;
}

.preset-locations {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
}

.preset-locations h4 {
  margin-bottom: 10px;
  color: #303133;
  font-size: 14px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .asset-sidebar {
    width: 260px; /* 中等屏幕下稍微缩小侧边栏 */
  }
}

@media (max-width: 768px) {
  .map-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .asset-sidebar {
    width: 100%;
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    z-index: 1000;
  }

  .map,
  .map-placeholder {
    margin: 5px; /* 移动端减少边距 */
    min-height: 300px; /* 移动端减少最小高度 */
  }
}

@media (max-width: 680px) {
  .map-header {
    padding: 12px 16px;
  }

  .map-header h2 {
    font-size: 18px;
  }

  .map,
  .map-placeholder {
    margin: 3px;
    min-height: 250px;
  }
}
</style>
