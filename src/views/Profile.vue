<!-- 个人设置页面 -->
<template>
  <div class="profile-container">
    <!-- 顶部导航 -->
    <header class="profile-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          <span>返回</span>
        </button>
        <h1>个人设置</h1>
        <div class="header-spacer"></div>
        
        <!-- 主题切换按钮 -->
        <div class="theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <div class="profile-content">
      <div class="profile-form-container">
        <!-- 用户信息卡片 -->
        <div class="user-info-card">
          <div class="avatar-section">
            <div class="avatar-container">
              <img 
                :src="userAvatarUrl" 
                :alt="formData.nickname"
                class="current-avatar"
                @error="handleAvatarError"
              >
              <div class="avatar-overlay" @click="triggerAvatarUpload">
                <i class="fas fa-camera"></i>
                <span>更换头像</span>
              </div>
            </div>
            <input 
              ref="avatarInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="handleAvatarSelect"
              style="display: none"
            >
          </div>
          
          <div class="user-basic-info">
            <h2>{{ formData.nickname }}</h2>
            <p class="user-uid">UID: {{ authStore.user?.uid }}</p>
            <div class="user-type-badge">
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
        <div class="settings-form">
          <form @submit.prevent="handleSubmit">
            <!-- 昵称设置 -->
            <div class="form-group">
              <label for="nickname" class="form-label">
                <i class="fas fa-user"></i>
                昵称
              </label>
              <input
                id="nickname"
                v-model="formData.nickname"
                type="text"
                class="form-input"
                placeholder="请输入昵称"
                maxlength="20"
                required
              >
              <div class="input-hint">
                <span>{{ formData.nickname.length }}/20</span>
              </div>
            </div>

            <!-- 邮箱设置 -->
            <div class="form-group">
              <label for="email" class="form-label">
                <i class="fas fa-envelope"></i>
                邮箱
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                placeholder="请输入邮箱地址（可选）"
              >
              <div class="input-hint">
                <span>邮箱可用于登录和找回密码</span>
              </div>
            </div>

            <!-- 路由缓存设置 -->
            <div class="form-group">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="form-label">
                    <i class="fas fa-history"></i>
                    自动恢复页面
                  </label>
                  <div class="input-hint">
                    <span>关闭浏览器后重新打开会自动跳转到之前访问的页面</span>
                  </div>
                </div>
                <div class="setting-control">
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
              <div v-if="routeCacheStore.isEnabled" class="cache-status">
                <div class="status-item">
                  <i class="fas fa-info-circle"></i>
                  <span v-if="routeCacheStore.hasCachedRoute">
                    当前缓存：{{ getCachedRouteDisplayName() }}
                  </span>
                  <span v-else>暂无缓存页面</span>
                </div>
                <div class="cache-actions">
                  <button 
                    type="button" 
                    class="clear-cache-btn"
                    @click="clearRouteCache"
                    :disabled="!routeCacheStore.hasCachedRoute"
                  >
                    <i class="fas fa-trash-alt"></i>
                    清除缓存
                  </button>
                </div>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <button 
                type="submit" 
                class="save-btn"
                :disabled="!hasChanges || isLoading"
              >
                <i class="fas fa-save"></i>
                <span v-if="isLoading">保存中...</span>
                <span v-else>保存设置</span>
              </button>
              <button 
                type="button" 
                class="reset-btn"
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
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 2rem;
}

.dark .profile-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.profile-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.dark .profile-header {
  background: rgba(17, 24, 39, 0.3);
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.profile-header h1 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.header-spacer {
  width: 100px;
}

.profile-content {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.profile-form-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.user-info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.dark .user-info-card {
  background: rgba(17, 24, 39, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.current-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 0.9rem;
  gap: 0.5rem;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.user-basic-info {
  flex: 1;
  color: white;
}

.user-basic-info h2 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.user-uid {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin: 0 0 1rem 0;
}

.user-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.settings-form {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
}

.dark .settings-form {
  background: rgba(17, 24, 39, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.dark .form-input {
  background: rgba(55, 65, 81, 0.6);
  border: 1px solid rgba(107, 114, 128, 0.4);
  color: #f3f4f6;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.dark .form-input::placeholder {
  color: rgba(156, 163, 175, 0.8);
}

.form-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.dark .form-input:focus {
  border-color: rgba(139, 92, 246, 0.6);
  background: rgba(55, 65, 81, 0.8);
}

.input-hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.save-btn,
.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background: #4caf50;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.save-btn:disabled {
  background: #666;
  cursor: not-allowed;
  transform: none;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.reset-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .profile-content {
    padding: 0 1rem;
  }
  
  .user-info-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .save-btn,
  .reset-btn {
    width: 100%;
    justify-content: center;
  }
}

/* 路由缓存设置样式 */
.setting-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.setting-info {
  flex: 1;
}

.setting-control {
  flex-shrink: 0;
}

.form-switch {
  position: relative;
  width: 56px;
  height: 28px;
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
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.dark .form-switch-label {
  background: rgba(55, 65, 81, 0.6);
  border: 1px solid rgba(107, 114, 128, 0.4);
}

.form-switch-slider {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark .form-switch-slider {
  background: #f3f4f6;
}

.form-switch-input:checked + .form-switch-label {
  background: #4caf50;
  border-color: #4caf50;
}

.form-switch-input:checked + .form-switch-label .form-switch-slider {
  transform: translateX(28px);
}

.cache-status {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.dark .cache-status {
  background: rgba(17, 24, 39, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.dark .status-item {
  color: #d1d5db;
}

.cache-actions {
  display: flex;
  justify-content: flex-end;
}

.clear-cache-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-cache-btn:hover:not(:disabled) {
  background: rgba(244, 67, 54, 0.3);
  border-color: rgba(244, 67, 54, 0.5);
}

.clear-cache-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .setting-control {
    align-self: flex-end;
  }
  
  .cache-actions {
    justify-content: center;
  }
  
  .clear-cache-btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 