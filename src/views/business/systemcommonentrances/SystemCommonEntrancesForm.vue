<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="128px"
      v-loading="formLoading"
    >
      <el-form-item label="选择菜单" prop="menuId">
        <el-cascader
          v-model="formData.menuId"
          :options="menuTree"
          :props="cascaderProps"
          placeholder="请选择菜单"
          clearable
          @change="handleMenuChange"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="入口名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入入口名称" />
      </el-form-item>
      <el-form-item label="图标标识" prop="icon">
        <IconSelect v-model="formData.icon" clearable @change="handleIconChange" />
      </el-form-item>
      <el-form-item label="跳转链接" prop="url">
        <el-input v-model="formData.url" placeholder="请输入跳转链接" />
      </el-form-item>
      <el-form-item label="显示颜色" prop="color">
        <el-color-picker v-model="formData.color" />
      </el-form-item>
      <el-form-item label="权限标识" prop="permission">
        <el-input v-model="formData.permission" placeholder="请输入权限标识" />
      </el-form-item>
      <el-form-item label="默认排序，值越小越靠前" prop="defaultOrder">
        <el-input v-model="formData.defaultOrder" placeholder="请输入默认排序，值越小越靠前" />
      </el-form-item>
      <!-- <el-form-item label="部门编号" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入部门编号" />
      </el-form-item> -->
      <el-form-item label="显示端" prop="platform">
        <el-select v-model="formData.platform" placeholder="请选择显示端" style="width: 100%">
          <el-option label="WEB" value="WEB" />
          <el-option label="APP" value="APP" />
          <el-option label="ALL（都显示）" value="ALL" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否为所有人添加" prop="isForAll">
        <el-switch 
          v-model="formData.isForAll" 
          active-text="是" 
          inactive-text="否"
          :active-value="true"
          :inactive-value="false"
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
import { SystemCommonEntrancesApi, SystemCommonEntrancesVO } from '@/api/business/systemcommonentrances'
import * as MenuApi from '@/api/system/menu'
import { handleTree } from '@/utils/tree'

/** 系统常用入口（全局配置） 表单 */
defineOptions({ name: 'SystemCommonEntrancesForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  menuId: undefined,
  name: undefined,
  icon: undefined,
  url: undefined,
  color: '#FFFFFF',
  permission: undefined,
  defaultOrder: 1,
  deptId: undefined,
  platform: 'ALL',
  isForAll: false,
})

// 菜单树数据
const menuTree = ref<any[]>([])
// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: false
}
const formRules = reactive({
  name: [{ required: true, message: '入口名称不能为空', trigger: 'blur' }],
  icon: [{ required: true, message: '图标标识（如：ep:box）不能为空', trigger: 'change' }],
  url: [{ required: true, message: '跳转链接不能为空', trigger: 'blur' }],
  color: [{ required: true, message: '显示颜色（如：#F56C6C）不能为空', trigger: 'blur' }],
  permission: [{ required: false, message: '权限标识不能为空', trigger: 'blur' }],
  defaultOrder: [{ required: true, message: '默认排序，值越小越靠前不能为空', trigger: 'blur' }],
  platform: [{ required: true, message: '显示端：WEB、APP、ALL（都显示）不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 获取菜单树数据 */
const getMenuTree = async () => {
  try {
    const res = await MenuApi.getMenuList({})
    // 递归过滤掉path为null的菜单项
    const filterMenus = (menus: any[]): any[] => {
      return menus.filter(menu => menu.path !== null && menu.path !== undefined && menu.path !== '').map(menu => {
        if (menu.children && menu.children.length > 0) {
          menu.children = filterMenus(menu.children)
        }
        return menu
      })
    }
    const filteredMenus = filterMenus(res)
    menuTree.value = handleTree(filteredMenus)
  } catch (error) {
    console.error('获取菜单数据失败:', error)
  }
}

/** 菜单选择变化处理 */
const handleMenuChange = async (menuId: number) => {
  if (menuId) {
    // 根据选中的菜单ID查找菜单信息并构建完整路径
    const findMenuWithPath = (menus: any[], id: number, parentPath: string = ''): { menu: any, fullPath: string } | null => {
      for (const menu of menus) {
        // 构建当前菜单的完整路径
        let currentPath = parentPath
        if (menu.path) {
          // 如果父路径存在且不以/结尾，添加/
          if (parentPath && !parentPath.endsWith('/')) {
            currentPath += '/'
          }
          // 添加当前菜单路径（去掉开头的/避免重复）
          const menuPath = menu.path.startsWith('/') ? menu.path.substring(1) : menu.path
          currentPath += menuPath
        }
        
        if (menu.id === id) {
          return { menu, fullPath: currentPath.startsWith('/') ? currentPath : '/' + currentPath }
        }
        
        if (menu.children && menu.children.length > 0) {
          const found = findMenuWithPath(menu.children, id, currentPath)
          if (found) return found
        }
      }
      return null
    }
    
    const result = findMenuWithPath(menuTree.value, menuId)
    if (result) {
      const { menu: selectedMenu, fullPath } = result
      // 自动填充表单数据
      formData.value.name = selectedMenu.name
      formData.value.icon = selectedMenu.icon
      formData.value.url = fullPath
      
      // 前端处理权限标识赋值
      try {
        // 先获取选中菜单的信息
        const systemCommonEntrances = await SystemCommonEntrancesApi.getSystemCommonEntrances(menuId)
        console.log('获取到的菜单信息:', systemCommonEntrances)
        
        // 从全局菜单数据中筛选子菜单
        const findChildMenus = (menus) => {
          return menus.filter(menu => menu.parentId === menuId)
        }
        
        // 获取所有菜单数据
        const allMenus = await MenuApi.getMenuList({})
        
        // 筛选出子菜单
        const childMenus = findChildMenus(allMenus)
        console.log('筛选出的子菜单数据:', childMenus)
        
        // 先查询子类，如果有子类则选择子类的第一个permission进行赋值
        if (childMenus && childMenus.length > 0) {
          const firstChildMenu = childMenus[0]
          if (firstChildMenu.permission) {
            formData.value.permission = firstChildMenu.permission
            console.log('从第一个子菜单获取的权限标识:', firstChildMenu.permission)
          } else {
            // 如果第一个子菜单没有权限标识，则赋空值
            formData.value.permission = ''
            console.log('第一个子菜单无权限标识，赋空值')
          }
        } else {
          // 如果没有子类，且选中的菜单的permission为空值，则赋空值
          if (!systemCommonEntrances.permission) {
            formData.value.permission = ''
            console.log('选中菜单无权限标识，赋空值')
          } else {
            // 如果选中的菜单有权限标识，则使用它
            formData.value.permission = systemCommonEntrances.permission
            console.log('从选中菜单获取的权限标识:', systemCommonEntrances.permission)
          }
        }
      } catch (error) {
        console.error('获取权限标识失败:', error)
        // 如果接口调用失败，赋空值
        formData.value.permission = ''
        console.log('接口调用失败，赋空值')
      }
      
      console.log('选中菜单:', selectedMenu.name, '完整路径:', fullPath)
    }
  }
}

/**
 * 处理图标选择变化事件
 * 当用户选择图标时触发表单验证，清除错误提示
 */
const handleIconChange = () => {
  // 手动触发图标字段的验证，清除错误提示
  formRef.value?.validateField('icon')
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  
  // 获取菜单数据
  await getMenuTree()
  
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const response = await SystemCommonEntrancesApi.getSystemCommonEntrances(id)
      
      // 检查响应数据结构 - 后端返回的是 CommonResult 结构
      const data = response.data || response
      
      if (data && data.id !== null && data.id !== undefined) {
        // 手动赋值每个字段，确保数据正确绑定
        formData.value.id = data.id
        formData.value.menuId = data.menuId
        formData.value.name = data.name
        formData.value.icon = data.icon
        formData.value.url = data.url
        formData.value.color = data.color || '#FFFFFF'
        formData.value.permission = data.permission
        formData.value.defaultOrder = data.defaultOrder || 1
        formData.value.deptId = data.deptId
        formData.value.platform = data.platform || 'ALL'
        formData.value.isForAll = data.isForAll || false
        
        message.success('数据加载成功')
      } else {
        message.error('获取数据失败，记录可能不存在')
      }
    } catch (error) {
      console.error('API调用失败:', error)
      message.error('获取数据失败: ' + (error.message || '未知错误'))
    } finally {
      formLoading.value = false
    }
  } else {
    // 新增时才重置表单
    resetForm()
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
    const data = formData.value as unknown as SystemCommonEntrancesVO
    if (formType.value === 'create') {
      await SystemCommonEntrancesApi.createSystemCommonEntrances(data)
      message.success(t('common.createSuccess'))
    } else {
      await SystemCommonEntrancesApi.updateSystemCommonEntrances(data)
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
    menuId: undefined,
    name: undefined,
    icon: undefined,
    url: undefined,
    color: '#FFFFFF',
    permission: undefined,
    defaultOrder: 1,
    deptId: undefined,
    platform: 'ALL',
    isForAll: false,
  }
  formRef.value?.resetFields()
}
</script>