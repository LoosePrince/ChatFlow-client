<!-- 注册页面组件 -->
<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-shape decoration-shape-1"></div>
      <div class="decoration-shape decoration-shape-2"></div>
    </div>

    <!-- 主要内容 -->
    <div class="register-content">
      <!-- 返回按钮 -->
      <button @click="goBack" class="back-button">
        <i class="fas fa-arrow-left"></i>
        <span>返回首页</span>
      </button>

      <!-- 注册表单卡片 -->
      <div class="register-card">
        <!-- 头部 -->
        <div class="register-header">
          <div class="register-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <h2 class="register-title">用户注册</h2>
          <p class="register-subtitle">创建您的聊天室账户</p>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleRegister" class="register-form">
          <!-- 头像上传 -->
          <div class="form-group avatar-group">
            <label class="form-label">
              <i class="fas fa-camera"></i>
              头像 <span class="required">*</span>
            </label>
            <div class="avatar-upload-section">
              <div class="avatar-preview" @click="triggerFileInput">
                <img 
                  v-if="avatarPreview" 
                  :src="avatarPreview" 
                  alt="头像预览"
                  class="avatar-image"
                >
                <div v-else class="avatar-placeholder">
                  <i class="fas fa-plus"></i>
                  <span>点击上传头像</span>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="handleFileSelect"
                class="file-input"
              >
              <div class="avatar-info">
                <p>支持JPG、PNG、WebP格式，将裁切为64x64像素</p>
                <p class="size-limit">选择图片：10MB以内，上传后自动压缩至50KB（这对64x64像素来说完全足够）</p>
              </div>
            </div>
            <div v-if="errors.avatar" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.avatar }}
            </div>
          </div>

          <!-- 头像裁切组件 -->
          <AvatarCropper
            :visible="showCropper"
            :imageSrc="selectedImageSrc"
            @close="handleCropperClose"
            @crop="handleCropResult"
          />

          <!-- 昵称输入 -->
          <div class="form-group">
            <label for="nickname" class="form-label">
              <i class="fas fa-user"></i>
              昵称 <span class="required">*</span>
            </label>
            <input
              id="nickname"
              v-model="form.nickname"
              type="text"
              class="form-input"
              :class="{ 'is-invalid': errors.nickname }"
              placeholder="请输入您的昵称"
              maxlength="20"
              required
            >
            <div v-if="errors.nickname" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.nickname }}
            </div>
          </div>

          <!-- 邮箱输入 -->
          <div class="form-group">
            <label for="email" class="form-label">
              <i class="fas fa-envelope"></i>
              邮箱地址
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ 'is-invalid': errors.email }"
              placeholder="请输入您的邮箱地址（可选）"
            >
            <div v-if="errors.email" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.email }}
            </div>
          </div>

          <!-- 密码输入 -->
          <div class="form-group">
            <label for="password" class="form-label">
              <i class="fas fa-lock"></i>
              密码 <span class="required">*</span>
            </label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'is-invalid': errors.password }"
                placeholder="请设置您的密码"
                required
              >
              <button
                type="button"
                @click="togglePassword"
                class="password-toggle"
              >
              </button>
            </div>
            <div class="password-strength">
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :class="`strength-${passwordStrength.level}`"
                  :style="{ width: `${passwordStrength.percent}%` }"
                ></div>
              </div>
              <span class="strength-text">{{ passwordStrength.text }}</span>
            </div>
            <div v-if="errors.password" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.password }}
            </div>
          </div>

          <!-- 确认密码 -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">
              <i class="fas fa-lock"></i>
              确认密码 <span class="required">*</span>
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              class="form-input"
              :class="{ 'is-invalid': errors.confirmPassword }"
              placeholder="请再次输入密码"
              required
            >
            <div v-if="errors.confirmPassword" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.confirmPassword }}
            </div>
          </div>

          <!-- 服务条款 -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                v-model="form.acceptTerms"
                type="checkbox"
                class="checkbox-input"
                required
              >
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">
                我已阅读并同意<router-link to="/user-agreement" class="terms-link" target="_blank">用户协议</router-link>和<router-link to="/privacy-policy" class="terms-link" target="_blank">隐私政策</router-link>
              </span>
            </label>
          </div>

          <!-- 注册按钮 -->
          <button
            type="submit"
            class="register-button"
            :disabled="isLoading || !form.acceptTerms"
          >
            <span v-if="isLoading" class="button-spinner">
              <i class="fas fa-spinner fa-spin"></i>
              注册中...
            </span>
            <span v-else class="button-text">
              <i class="fas fa-user-plus"></i>
              立即注册
            </span>
          </button>

          <!-- 切换到登录 -->
          <div class="form-footer">
            <p class="switch-text">
              已有账户？
              <router-link to="/login" class="switch-link">
                立即登录
              </router-link>
            </p>
          </div>
        </form>
      </div>

      <!-- 注册提示 -->
      <div class="register-tips">
        <h3 class="tips-title">
          <i class="fas fa-lightbulb"></i>
          注册提示
        </h3>
        <div class="tips-grid">
          <div class="tip-item">
            <i class="fas fa-camera"></i>
            <div>
              <strong>头像上传</strong>
              <p>支持JPG、PNG格式，自动调整为64x64像素</p>
            </div>
          </div>
          <div class="tip-item">
            <i class="fas fa-envelope"></i>
            <div>
              <strong>邮箱可选</strong>
              <p>邮箱地址可选填，用于密码找回和通知</p>
            </div>
          </div>
          <div class="tip-item">
            <i class="fas fa-shield-alt"></i>
            <div>
              <strong>密码安全</strong>
              <p>建议使用强密码，包含数字、字母和特殊字符</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import AvatarCropper from '@/components/common/AvatarCropper.vue'

// 路由相关
const router = useRouter()

// Store实例
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// 响应式数据
const form = reactive({
  avatar: null,
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = reactive({
  avatar: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const showPassword = ref(false)
const avatarPreview = ref('')
const fileInput = ref(null)
const showCropper = ref(false)
const selectedImageSrc = ref('')

// 密码强度计算
const passwordStrength = computed(() => {
  if (!form.password) {
    return { level: 'none', percent: 0, text: '' }
  }
  
  let score = 0
  let feedback = []
  
  // 长度检查
  if (form.password.length >= 8) score += 25
  else feedback.push('至少8位')
  
  // 包含数字
  if (/\d/.test(form.password)) score += 25
  else feedback.push('包含数字')
  
  // 包含小写字母
  if (/[a-z]/.test(form.password)) score += 25
  else feedback.push('包含小写字母')
  
  // 包含大写字母或特殊字符
  if (/[A-Z]/.test(form.password) || /[^A-Za-z0-9]/.test(form.password)) {
    score += 25
  } else {
    feedback.push('包含大写字母或特殊字符')
  }
  
  let level, text
  if (score < 50) {
    level = 'weak'
    text = `弱（建议：${feedback.join('、')}）`
  } else if (score < 75) {
    level = 'medium'
    text = '中等'
  } else {
    level = 'strong'
    text = '强'
  }
  
  return { level, percent: score, text }
})

// 触发文件输入
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    errors.avatar = '请选择 JPG、PNG 或 WebP 格式的图片'
    return
  }
  
  // 验证文件大小（10MB，允许选择较大原图）
  if (file.size > 10 * 1024 * 1024) {
    errors.avatar = '图片大小不能超过10MB'
    return
  }
  
  // 清除错误
  errors.avatar = ''
  
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

// 表单验证
const validateForm = () => {
  let isValid = true
  
  // 重置错误
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  // 验证头像
  if (!form.avatar) {
    errors.avatar = '请上传头像'
    isValid = false
  }
  
  // 验证昵称
  if (!form.nickname.trim()) {
    errors.nickname = '请输入昵称'
    isValid = false
  } else if (form.nickname.length < 2) {
    errors.nickname = '昵称至少2个字符'
    isValid = false
  } else if (form.nickname.length > 20) {
    errors.nickname = '昵称不能超过20个字符'
    isValid = false
  }
  
  // 验证邮箱（可选）
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }
  
  // 验证密码
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度至少为6位'
    isValid = false
  }
  
  // 验证确认密码
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认密码'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }
  
  return isValid
}

// 处理注册
const handleRegister = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  
  try {
    // 准备注册数据
    const registerData = {
      nickname: form.nickname.trim(),
      password: form.password,
      email: form.email.trim() || undefined,
      avatar: form.avatar
    }
    
    // 调用注册API
    await authStore.register(registerData)
    
    // 注册成功通知
    notificationStore.success('注册成功！欢迎加入聊天室')
    
    // 跳转到首页显示我的聊天室
    router.push('/')
    
  } catch (error) {
    console.error('注册失败:', error)
    
    // 重置之前的错误
    Object.keys(errors).forEach(key => {
      errors[key] = ''
    })
    
    // 根据错误类型设置具体的错误信息到表单字段
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message
      if (errorMessage.includes('昵称') || errorMessage.includes('nickname')) {
        errors.nickname = errorMessage
      } else if (errorMessage.includes('邮箱') || errorMessage.includes('email')) {
        errors.email = errorMessage
      } else if (errorMessage.includes('密码') || errorMessage.includes('password')) {
        errors.password = errorMessage
      } else if (errorMessage.includes('头像') || errorMessage.includes('avatar')) {
        errors.avatar = errorMessage
      } else {
        // 通用错误显示在密码字段下方
        errors.password = errorMessage
      }
    } else if (error.response?.status === 409) {
      // 冲突错误，可能是昵称或邮箱重复
      if (form.email) {
        errors.email = '昵称或邮箱已被使用'
      } else {
        errors.nickname = '昵称已被使用'
      }
    } else if (error.response?.status === 400) {
      errors.password = '请检查输入信息是否正确'
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      errors.password = '网络连接失败，请检查网络设置'
    } else if (error.code === 'ECONNREFUSED') {
      errors.password = '无法连接到服务器，请稍后重试'
    } else {
      errors.password = '注册失败，请稍后重试'
    }
  } finally {
    isLoading.value = false
  }
}

// 切换密码显示
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 关闭裁切器
const handleCropperClose = () => {
  showCropper.value = false
  selectedImageSrc.value = ''
}

// 处理裁切结果
const handleCropResult = ({ file, previewUrl }) => {
  form.avatar = file
  avatarPreview.value = previewUrl
  errors.avatar = ''
}

// 返回首页
const goBack = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
}

.decoration-shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.decoration-shape-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 4s;
}

.register-content {
  width: 100%;
  max-width: 1200px;
  position: relative;
  z-index: 1;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-5px);
}

.register-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  margin: 0 auto 40px;
  backdrop-filter: blur(20px);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 32px;
  color: white;
}

.register-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.register-subtitle {
  color: #7f8c8d;
  margin: 0;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.required {
  color: #e74c3c;
}

.avatar-group {
  margin-bottom: 30px;
}

.avatar-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border: 3px dashed #e1e8ed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.avatar-preview:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  text-align: center;
  color: #7f8c8d;
}

.avatar-placeholder i {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

.file-input {
  display: none;
}

.avatar-info {
  text-align: center;
}

.avatar-info p {
  margin: 0;
  font-size: 12px;
  color: #7f8c8d;
}

.avatar-info .size-limit {
  color: #dc3545;
  font-weight: 500;
  margin-top: 2px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.is-invalid {
  border-color: #e74c3c;
  background: #fdf2f2;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #667eea;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e1e8ed;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-weak {
  background: #e74c3c;
}

.strength-medium {
  background: #f39c12;
}

.strength-strong {
  background: #27ae60;
}

.strength-text {
  font-size: 12px;
  color: #7f8c8d;
  min-width: 100px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e74c3c;
  font-size: 12px;
  margin-top: 6px;
}

.checkbox-group {
  margin-bottom: 30px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #e1e8ed;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-input:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-text {
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.4;
}

.terms-link {
  color: #667eea;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-spinner,
.button-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.form-footer {
  text-align: center;
  margin-top: 30px;
}

.switch-text {
  color: #7f8c8d;
  margin: 0;
}

.switch-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.switch-link:hover {
  color: #764ba2;
}

.register-tips {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.tips-grid {
  display: grid;
  gap: 15px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  color: white;
}

.tip-item i {
  font-size: 20px;
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.8);
}

.tip-item strong {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
}

.tip-item p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: 15px;
  }
  
  .register-card {
    padding: 30px 20px;
  }
  
  .register-icon {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
  
  .register-title {
    font-size: 24px;
  }
  
  .avatar-preview {
    width: 100px;
    height: 100px;
  }
  
  .register-tips {
    padding: 20px;
  }
  
  .tips-title {
    font-size: 18px;
  }
}
</style> 