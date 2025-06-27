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
  background: #f8fafc;
  padding-bottom: 1rem;
}

.dark .profile-container {
  background: #1e293b;
}

.profile-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark .profile-header {
  background: #0f172a;
  border-bottom: 1px solid #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #1976d2;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: #f1f5f9;
}

.dark .back-btn {
  color: #60a5fa;
}

.dark .back-btn:hover {
  background: #1e293b;
}

.profile-header h1 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.dark .profile-header h1 {
  color: #f1f5f9;
}

.header-spacer {
  width: 100px;
}

.profile-content {
  max-width: 800px;
  margin: 1.5rem auto;
  padding: 0 1rem;
}

.profile-form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-info-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark .user-info-card {
  background: #0f172a;
  border: 1px solid #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
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
  transition: opacity 0.2s ease;
  color: white;
  font-size: 0.8rem;
  gap: 0.25rem;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.user-basic-info {
  flex: 1;
  color: #1f2937;
}

.dark .user-basic-info {
  color: #f1f5f9;
}

.user-basic-info h2 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.user-uid {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 0.75rem 0;
}

.dark .user-uid {
  color: #9ca3af;
}

.user-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.dark .user-type-badge {
  background: rgba(34, 197, 94, 0.2);
  color: #10b981;
  border-color: rgba(34, 197, 94, 0.3);
}

.settings-form {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark .settings-form {
  background: #0f172a;
  border: 1px solid #334155;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.dark .form-label {
  color: #f1f5f9;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #1f2937;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.dark .form-input {
  background: #1e293b;
  border: 1px solid #475569;
  color: #f1f5f9;
}

.form-input::placeholder {
  color: #9ca3af;
}

.dark .form-input::placeholder {
  color: #6b7280;
}

.form-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.dark .form-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.input-hint {
  margin-top: 0.375rem;
  font-size: 0.8rem;
  color: #6b7280;
  text-align: right;
}

.dark .input-hint {
  color: #9ca3af;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.save-btn,
.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn {
  background: #059669;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #047857;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.reset-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.reset-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dark .reset-btn {
  background: #374151;
  color: #9ca3af;
  border-color: #4b5563;
}

.dark .reset-btn:hover:not(:disabled) {
  background: #4b5563;
  color: #f1f5f9;
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

.cache-status {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.dark .cache-status {
  background: #1e293b;
  border: 1px solid #334155;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
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
  padding: 0.5rem 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #dc2626;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-cache-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.clear-cache-btn:disabled {
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
    padding: 1rem;
  }
  
  .avatar-container {
    width: 64px;
    height: 64px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .save-btn,
  .reset-btn {
    width: 100%;
    justify-content: center;
  }
  
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

@media (max-width: 480px) {
  .profile-header {
    padding: 0.75rem 0;
  }
  
  .profile-header h1 {
    font-size: 1.25rem;
  }
  
  .back-btn {
    font-size: 0.9rem;
    padding: 0.375rem 0.75rem;
  }
  
  .user-basic-info h2 {
    font-size: 1.25rem;
  }
  
  .settings-form {
    padding: 1rem;
  }
}
</style> 