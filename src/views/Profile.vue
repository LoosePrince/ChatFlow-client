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
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import AvatarCropper from '@/components/common/AvatarCropper.vue'
import axios from 'axios'

// 路由相关
const router = useRouter()

// Store实例
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

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
</style> 