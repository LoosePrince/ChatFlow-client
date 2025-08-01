<!-- 个人设置页面 -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-4">
    <!-- 顶部导航 -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 sticky top-0 z-50 shadow-sm">
      <div class="max-w-4xl mx-auto flex items-center justify-between px-4">
        <button class="flex items-center gap-2 bg-transparent border-none text-blue-600 dark:text-blue-400 text-base cursor-pointer px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          <span>返回</span>
        </button>
        <h1 class="text-gray-800 dark:text-gray-100 text-2xl font-semibold m-0">个人设置</h1>
        <div class="w-24"></div>
        
        <!-- 主题切换按钮 -->
        <div class="flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <div class="max-w-4xl mx-auto mt-6 px-4">
      <div class="flex flex-col gap-6">
        <!-- 用户信息卡片 -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex items-center gap-6 shadow-sm">
          <div class="flex-shrink-0">
            <div class="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105">
              <img 
                :src="userAvatarUrl" 
                :alt="formData.nickname"
                class="w-full h-full object-cover"
                @error="handleAvatarError"
              >
              <div class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 transition-opacity duration-200 text-white text-sm gap-1 hover:opacity-100" @click="triggerAvatarUpload">
                <i class="fas fa-camera"></i>
                <span>更换头像</span>
              </div>
            </div>
            <input 
              ref="avatarInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="handleAvatarSelect"
              class="hidden"
            >
          </div>
          
          <div class="flex-1 text-gray-800 dark:text-gray-100">
            <h2 class="text-2xl font-semibold m-0 mb-2">{{ formData.nickname }}</h2>
            <p class="text-gray-500 dark:text-gray-400 text-sm m-0 mb-3">UID: {{ authStore.user?.uid }}</p>
            <div class="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-md text-sm font-medium border border-green-200 dark:border-green-800">
              <i class="fas fa-user"></i>
              <span>注册用户</span>
            </div>
          </div>
        </div>

        <!-- 头像裁切组件 -->
        <AvatarCropper
          :visible="showCropper"
          :imageSrc="selectedImageSrc"
          @close="handleCropperClose"
          @crop="handleCropResult"
        />

        <!-- 设置表单 -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <form @submit.prevent="handleSubmit">
            <!-- 昵称设置 -->
            <div class="mb-6">
              <label for="nickname" class="flex items-center gap-2 text-gray-700 dark:text-gray-100 text-sm font-medium mb-2">
                <i class="fas fa-user"></i>
                昵称
              </label>
              <input
                id="nickname"
                v-model="formData.nickname"
                type="text"
                class="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-3 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="请输入昵称"
                maxlength="20"
                required
              >
              <div class="mt-1.5 text-right text-xs text-gray-500 dark:text-gray-400">
                <span>{{ formData.nickname.length }}/20</span>
              </div>
            </div>

            <!-- 邮箱设置 -->
            <div class="mb-6">
              <label for="email" class="flex items-center gap-2 text-gray-700 dark:text-gray-100 text-sm font-medium mb-2">
                <i class="fas fa-envelope"></i>
                邮箱
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-3 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="请输入邮箱地址（可选）"
              >
              <div class="mt-1.5 text-right text-xs text-gray-500 dark:text-gray-400">
                <span>邮箱可用于登录和找回密码</span>
              </div>
            </div>

            <!-- 路由缓存设置 -->
            <div class="mb-6">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <label class="flex items-center gap-2 text-gray-700 dark:text-gray-100 text-sm font-medium mb-2">
                    <i class="fas fa-history"></i>
                    自动恢复页面
                  </label>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    <span>关闭浏览器后重新打开会自动跳转到之前访问的页面</span>
                  </div>
                </div>
                                 <div class="flex-shrink-0">
                   <div class="form-switch">
                     <input 
                       id="routeCache" 
                       type="checkbox" 
                       class="form-switch-input"
                       :checked="routeCacheStore.isEnabled"
                       @change="handleRouteCacheToggle"
                     >
                     <label for="routeCache" class="form-switch-label">
                       <span class="form-switch-slider"></span>
                     </label>
                   </div>
                 </div>
              </div>
              
              <!-- 缓存状态显示 -->
              <div v-if="routeCacheStore.isEnabled" class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm mb-2">
                  <i class="fas fa-info-circle"></i>
                  <span v-if="routeCacheStore.hasCachedRoute">
                    当前缓存：{{ getCachedRouteDisplayName() }}
                  </span>
                  <span v-else>暂无缓存页面</span>
                </div>
                <div class="flex justify-end">
                  <button 
                    type="button" 
                    class="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-xs cursor-pointer transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="clearRouteCache"
                    :disabled="!routeCacheStore.hasCachedRoute"
                  >
                    <i class="fas fa-trash-alt"></i>
                    清除缓存
                  </button>
                </div>
              </div>
            </div>

            <!-- 私聊模式设置 -->
            <div class="mb-6">
              <PrivateChatSettings />
            </div>

            <!-- 提交按钮 -->
            <div class="flex gap-3 justify-end mt-6">
              <button 
                type="submit" 
                class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                :disabled="!hasChanges || isLoading"
              >
                <i class="fas fa-save"></i>
                <span v-if="isLoading">保存中...</span>
                <span v-else>保存设置</span>
              </button>
              <button 
                type="button" 
                class="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="resetForm"
                :disabled="!hasChanges"
              >
                <i class="fas fa-undo"></i>
                <span>重置</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useNotificationStore } from '@/stores'
import { useRouteCacheStore } from '@/stores/routeCache'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import AvatarCropper from '@/components/common/AvatarCropper.vue'
import PrivateChatSettings from '@/components/common/PrivateChatSettings.vue'
import axios from 'axios'

// 路由相关
const router = useRouter()

// Store实例
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const routeCacheStore = useRouteCacheStore()

// 响应式数据
const isLoading = ref(false)
const avatarInput = ref(null)
const showCropper = ref(false)
const selectedImageSrc = ref('')

// 表单数据
const formData = reactive({
  nickname: '',
  email: ''
})

const originalData = reactive({
  nickname: '',
  email: ''
})

// 计算属性
const userAvatarUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  if (!authStore.user?.avatarUrl) {
    return `${baseUrl}/avatars/default`
  }
  
  if (authStore.user.avatarUrl.startsWith('http') || authStore.user.avatarUrl.startsWith('data:')) {
    return authStore.user.avatarUrl
  }
  
  return `${baseUrl}${authStore.user.avatarUrl}`
})

const hasChanges = computed(() => {
  return formData.nickname !== originalData.nickname ||
         formData.email !== originalData.email
})

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 处理头像错误
const handleAvatarError = (event) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  event.target.src = `${baseUrl}/avatars/default`
}

// 初始化表单
const initializeForm = () => {
  if (authStore.user) {
    formData.nickname = authStore.user.nickname || ''
    formData.email = authStore.user.email || ''
    
    originalData.nickname = authStore.user.nickname || ''
    originalData.email = authStore.user.email || ''
  }
}

// 重置表单
const resetForm = () => {
  formData.nickname = originalData.nickname
  formData.email = originalData.email
}

// 提交表单
const handleSubmit = async () => {
  if (!hasChanges.value) {
    notificationStore.info('没有需要保存的更改')
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await axios.put('/api/auth/profile', {
      nickname: formData.nickname,
      email: formData.email
    })
    
    if (response.data.success) {
      // 更新本地用户信息
      authStore.updateUser({
        ...authStore.user,
        nickname: formData.nickname,
        email: formData.email
      })
      
      // 更新原始数据
      originalData.nickname = formData.nickname
      originalData.email = formData.email
      
      notificationStore.success('个人信息更新成功')
    }
  } catch (error) {
    console.error('更新个人信息失败:', error)
    notificationStore.error('更新失败: ' + (error.response?.data?.message || error.message))
  } finally {
    isLoading.value = false
  }
}

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

// 处理头像选择
const handleAvatarSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    notificationStore.error('请选择 JPG、PNG 或 WebP 格式的图片')
    return
  }
  
  // 验证文件大小（10MB，允许选择较大原图）
  if (file.size > 10 * 1024 * 1024) {
    notificationStore.error('图片大小不能超过10MB')
    return
  }
  
  // 读取文件并显示裁切器
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImageSrc.value = e.target.result
    showCropper.value = true
  }
  reader.readAsDataURL(file)
  
  // 清空文件输入，允许重复选择同一文件
  event.target.value = ''
}

// 关闭裁切器
const handleCropperClose = () => {
  showCropper.value = false
  selectedImageSrc.value = ''
}

// 处理裁切结果并上传
const handleCropResult = async ({ file }) => {
  try {
    // 上传头像
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await axios.post('/api/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.success) {
      // 更新本地用户头像
      authStore.updateUser({
        ...authStore.user,
        avatarUrl: response.data.data.avatarUrl
      })
      
      notificationStore.success('头像更新成功')
    }
  } catch (error) {
    console.error('上传头像失败:', error)
    notificationStore.error('上传失败: ' + (error.response?.data?.message || error.message))
  }
}

// 路由缓存相关方法
const handleRouteCacheToggle = (event) => {
  const enabled = event.target.checked
  routeCacheStore.toggleCache(enabled)
  
  if (enabled) {
    notificationStore.success('自动恢复页面已启用')
  } else {
    notificationStore.info('自动恢复页面已禁用')
  }
}

const getCachedRouteDisplayName = () => {
  const route = routeCacheStore.lastCachedRoute
  if (!route) return '无'
  
  const routeNameMap = {
    'Home': '首页',
    'ChatRoom': '聊天室',
    'RoomSelect': '选择房间',
    'Profile': '个人设置',
    'RouteCacheDemo': '路由缓存演示'
  }
  
  const displayName = routeNameMap[route.name] || route.name || route.path
  
  // 如果是聊天室，显示房间ID
  if (route.name === 'ChatRoom' && route.params?.roomId) {
    return `${displayName} (${route.params.roomId})`
  }
  
  return displayName
}

const clearRouteCache = () => {
  routeCacheStore.clearCache()
  notificationStore.success('路由缓存已清除')
}

// 生命周期钩子
onMounted(async () => {
  // 等待认证状态初始化
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }
  
  // 检查用户是否已登录且为注册用户
  if (!authStore.isAuthenticated || !authStore.isUser) {
    notificationStore.error('请先登录注册用户账户')
    router.push({ name: 'Home' })
    return
  }
  
  initializeForm()
})
</script>

<style scoped>
/* 开关组件样式 */
.form-switch {
  position: relative;
  width: 48px;
  height: 24px;
}

.form-switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.form-switch-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #d1d5db;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.dark .form-switch-label {
  background: #4b5563;
}

.form-switch-slider {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-switch-input:checked + .form-switch-label {
  background: #059669;
}

.form-switch-input:checked + .form-switch-label .form-switch-slider {
  transform: translateX(24px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .max-w-4xl {
    max-width: 100%;
  }
  
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .flex.items-center.gap-6 {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1rem;
  }
  
  .w-20.h-20 {
    width: 4rem;
    height: 4rem;
  }
  
  .flex.gap-3.justify-end {
    flex-direction: column;
  }
  
  .flex.items-start.justify-between.gap-4 {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .flex-shrink-0 {
    align-self: flex-end;
  }
  
  .flex.justify-end {
    justify-content: center;
  }
  
  .flex.items-center.gap-2.px-3.py-2 {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .py-4 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
  
  .text-2xl {
    font-size: 1.25rem;
  }
  
  .text-base {
    font-size: 0.9rem;
  }
  
  .px-4.py-2 {
    padding-left: 0.375rem;
    padding-right: 0.75rem;
  }
  
  .text-2xl.font-semibold {
    font-size: 1.25rem;
  }
  
  .p-6 {
    padding: 1rem;
  }
}
</style> 