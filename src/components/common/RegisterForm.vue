<!-- 注册表单组件 -->
<template>
  <div class="register-form-container">
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
              <p v-if="avatarFile" class="selected-file">
                <i class="fas fa-check-circle"></i>
                已选择头像文件，提交表单时会上传
              </p>
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

        <!-- 昵称和邮箱输入 -->
        <div class="form-row">
          <div class="form-group half-width">
            <label :for="`${idPrefix}nickname`" class="form-label">
              <i class="fas fa-user"></i>
              昵称 <span class="required">*</span>
            </label>
            <input
              :id="`${idPrefix}nickname`"
              v-model="form.nickname"
              type="text"
              class="form-input"
              :class="{ 'is-invalid': errors.nickname }"
              placeholder="请输入您的昵称"
              maxlength="20"
              required
            >
            <div class="input-hint">2-20个字符，支持中英文数字</div>
            <div v-if="errors.nickname" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.nickname }}
            </div>
          </div>

          <div class="form-group half-width">
            <label :for="`${idPrefix}email`" class="form-label">
              <i class="fas fa-envelope"></i>
              邮箱地址
            </label>
            <input
              :id="`${idPrefix}email`"
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ 'is-invalid': errors.email }"
              placeholder="请输入邮箱（可选）"
            >
            <div class="input-hint">可选，用于找回密码</div>
            <div v-if="errors.email" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.email }}
            </div>
          </div>
        </div>

        <!-- 密码和确认密码输入 -->
        <div class="form-row">
          <div class="form-group half-width">
            <label :for="`${idPrefix}password`" class="form-label">
              <i class="fas fa-lock"></i>
              密码 <span class="required">*</span>
            </label>
            <div class="password-input-wrapper">
              <input
                :id="`${idPrefix}password`"
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
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="input-hint">至少6位，建议包含字母数字</div>
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

          <div class="form-group half-width">
            <label :for="`${idPrefix}confirmPassword`" class="form-label">
              <i class="fas fa-lock"></i>
              确认密码 <span class="required">*</span>
            </label>
            <input
              :id="`${idPrefix}confirmPassword`"
              v-model="form.confirmPassword"
              type="password"
              class="form-input"
              :class="{ 'is-invalid': errors.confirmPassword }"
              placeholder="请再次输入密码"
              required
            >
            <div class="input-hint">再次输入上面的密码</div>
            <div v-if="errors.confirmPassword" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.confirmPassword }}
            </div>
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
              我已阅读并同意<a href="/user-agreement" class="terms-link" target="_blank">用户协议</a>和<a href="/privacy-policy" class="terms-link" target="_blank">隐私政策</a>
            </span>
          </label>
        </div>

        <!-- 注册按钮 -->
        <button
          type="submit"
          class="register-button"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="button-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
          <span v-else class="button-text">
            <i class="fas fa-user-plus"></i>
            立即注册
          </span>
        </button>

        <!-- 切换到登录 -->
        <div class="switch-mode">
          <span class="switch-text">已有账户？</span>
          <button type="button" @click="$emit('switchMode', 'login')" class="switch-link">
            立即登录
          </button>
        </div>

        <!-- 匿名体验 -->
        <div class="anonymous-option">
          <button type="button" @click="$emit('switchMode', 'anonymous')" class="anonymous-link">
            <i class="fas fa-user-secret"></i>
            匿名体验
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import AvatarCropper from '@/components/common/AvatarCropper.vue'

// 定义props
const props = defineProps({
  idPrefix: {
    type: String,
    default: 'register-'
  }
})

// 定义事件
const emit = defineEmits(['switchMode', 'registerSuccess'])

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

// 头像文件状态
const avatarFile = ref(null)

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

// 头像裁切相关
const showCropper = ref(false)
const selectedImageSrc = ref('')

// 计算属性
const isFormValid = computed(() => {
  return avatarFile.value && 
         form.nickname.trim() && 
         form.password && 
         form.confirmPassword && 
         form.acceptTerms &&
         !Object.values(errors).some(error => error)
})

// 密码强度计算
const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return { level: 0, percent: 0, text: '请输入密码' }
  
  let score = 0
  let feedback = []
  
  // 长度检查
  if (password.length >= 8) {
    score += 25
    feedback.push('长度充足')
  } else if (password.length >= 6) {
    score += 15
    feedback.push('长度一般')
  }
  
  // 数字检查
  if (/\d/.test(password)) {
    score += 20
    feedback.push('包含数字')
  }
  
  // 小写字母检查
  if (/[a-z]/.test(password)) {
    score += 20
    feedback.push('包含小写')
  }
  
  // 大写字母检查
  if (/[A-Z]/.test(password)) {
    score += 20
    feedback.push('包含大写')
  }
  
  // 特殊字符检查
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 15
    feedback.push('包含特殊字符')
  }
  
  let level, text
  if (score < 30) {
    level = 1
    text = '弱'
  } else if (score < 60) {
    level = 2
    text = '中等'
  } else if (score < 80) {
    level = 3
    text = '强'
  } else {
    level = 4
    text = '很强'
  }
  
  return {
    level,
    percent: Math.min(score, 100),
    text: `${text} (${feedback.join(', ')})`
  }
})

// 监听表单变化进行验证
watch(() => form.nickname, (newVal) => {
  if (newVal && newVal.trim()) {
    if (newVal.trim().length < 2) {
      errors.nickname = '昵称至少需要2个字符'
    } else if (newVal.trim().length > 20) {
      errors.nickname = '昵称不能超过20个字符'
    } else {
      errors.nickname = ''
    }
  } else {
    errors.nickname = ''
  }
})

watch(() => form.email, (newVal) => {
  if (newVal && newVal.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newVal.trim())) {
      errors.email = '请输入有效的邮箱地址'
    } else {
      errors.email = ''
    }
  } else {
    errors.email = ''
  }
})

watch(() => form.password, (newVal) => {
  if (newVal) {
    if (newVal.length < 6) {
      errors.password = '密码长度至少为6位'
    } else {
      errors.password = ''
    }
  } else {
    errors.password = ''
  }
  
  // 重新验证确认密码
  if (form.confirmPassword) {
    if (form.confirmPassword !== newVal) {
      errors.confirmPassword = '两次输入的密码不一致'
    } else {
      errors.confirmPassword = ''
    }
  }
})

watch(() => form.confirmPassword, (newVal) => {
  if (newVal) {
    if (newVal !== form.password) {
      errors.confirmPassword = '两次输入的密码不一致'
    } else {
      errors.confirmPassword = ''
    }
  } else {
    errors.confirmPassword = ''
  }
})

// 方法
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 文件大小检查（10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    errors.avatar = '文件大小不能超过10MB'
    return
  }
  
  // 文件类型检查
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    errors.avatar = '只支持JPG、PNG、WebP格式的图片'
    return
  }
  
  // 保存文件引用
  avatarFile.value = file
  
  // 读取文件并显示裁切器
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImageSrc.value = e.target.result
    showCropper.value = true
  }
  reader.readAsDataURL(file)
  
  // 清空错误信息
  errors.avatar = ''
}

const handleCropperClose = () => {
  showCropper.value = false
  selectedImageSrc.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleCropResult = (croppedData) => {
  form.avatar = croppedData
  avatarPreview.value = croppedData.preview
  avatarFile.value = croppedData.file
  showCropper.value = false
  selectedImageSrc.value = ''
  errors.avatar = ''
}

// 表单验证
const validateForm = () => {
  let isValid = true
  
  // 重置错误
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  // 验证头像
  if (!avatarFile.value) {
    errors.avatar = '请选择头像文件'
    isValid = false
  }
  
  // 验证昵称
  if (!form.nickname.trim()) {
    errors.nickname = '请输入昵称'
    isValid = false
  } else if (form.nickname.trim().length < 2) {
    errors.nickname = '昵称至少需要2个字符'
    isValid = false
  } else if (form.nickname.trim().length > 20) {
    errors.nickname = '昵称不能超过20个字符'
    isValid = false
  }
  
  // 验证邮箱（如果填写了）
  if (form.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email.trim())) {
      errors.email = '请输入有效的邮箱地址'
      isValid = false
    }
  }
  
  // 验证密码
  if (!form.password) {
    errors.password = '请设置密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度至少为6位'
    isValid = false
  }
  
  // 验证确认密码
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认密码'
    isValid = false
  } else if (form.confirmPassword !== form.password) {
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
  
  if (!form.acceptTerms) {
    notificationStore.error('请先阅读并同意用户协议和隐私政策')
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await authStore.register({
      avatar: avatarFile.value,
      nickname: form.nickname.trim(),
      email: form.email.trim() || undefined,
      password: form.password
    })
    
    if (result.success) {
      notificationStore.success('注册成功！')
      
      // 触发注册成功事件
      emit('registerSuccess')
      
      // 跳转到仪表板
      router.push({ name: 'Dashboard' })
    } else {
      notificationStore.error(result.message || '注册失败')
    }
  } catch (error) {
    console.error('注册过程中发生错误:', error)
    
    // 处理不同类型的错误
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 409) {
        if (data.field === 'nickname') {
          errors.nickname = '该昵称已被使用'
        } else if (data.field === 'email') {
          errors.email = '该邮箱已被注册'
        } else {
          notificationStore.error(data.message || '用户已存在')
        }
      } else if (status === 413) {
        errors.avatar = '头像文件过大'
      } else if (status === 429) {
        notificationStore.error('请求过于频繁，请稍后再试')
      } else {
        notificationStore.error(data.message || '注册失败，请稍后重试')
      }
    } else if (error.code === 'NETWORK_ERROR') {
      notificationStore.error('网络连接失败，请检查网络设置')
    } else {
      notificationStore.error('注册失败，请稍后重试')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-form-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.register-card {
  background: transparent;
  backdrop-filter: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;
  transition: none;
}

.dark .register-card {
  background: transparent;
  border: none;
  box-shadow: none;
}

.register-card:hover {
  transform: none;
  box-shadow: none;
}

.dark .register-card:hover {
  box-shadow: none;
}

.register-header {
  text-align: center;
  margin-bottom: 16px;
}

.register-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.dark .register-icon {
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5);
}

.register-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.dark .register-title {
  color: #f3f4f6;
}

.register-subtitle {
  color: #7f8c8d;
  font-size: 13px;
  margin: 0;
}

.dark .register-subtitle {
  color: #d1d5db;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.form-row .form-group.half-width {
  flex: 1;
  min-width: 0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.dark .form-label {
  color: #e5e7eb;
}

.form-label i {
  font-size: 11px;
}

.required {
  color: #e74c3c;
  font-size: 11px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  color: #2c3e50;
}

.dark .form-input {
  background: rgba(55, 65, 81, 0.8);
  border-color: rgba(107, 114, 128, 0.4);
  color: #f3f4f6;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  background: rgba(255, 255, 255, 0.95);
}

.dark .form-input:focus {
  border-color: #667eea;
  background: rgba(55, 65, 81, 0.9);
}

.form-input.is-invalid {
  border-color: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: color 0.3s ease;
  font-size: 12px;
}

.password-toggle:hover {
  color: #667eea;
}

.password-strength {
  margin-top: 4px;
}

.strength-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 3px;
}

.dark .strength-bar {
  background: rgba(107, 114, 128, 0.4);
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-1 { background: #e74c3c; }
.strength-2 { background: #f39c12; }
.strength-3 { background: #f1c40f; }
.strength-4 { background: #27ae60; }

.strength-text {
  font-size: 10px;
  color: #7f8c8d;
}

.dark .strength-text {
  color: #d1d5db;
}

.avatar-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border: 2px dashed rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
}

.dark .avatar-preview {
  background: rgba(55, 65, 81, 0.3);
  border-color: rgba(107, 114, 128, 0.4);
}

.avatar-preview:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.dark .avatar-preview:hover {
  background: rgba(102, 126, 234, 0.2);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #7f8c8d;
  text-align: center;
}

.dark .avatar-placeholder {
  color: #d1d5db;
}

.avatar-placeholder i {
  font-size: 16px;
}

.avatar-placeholder span {
  font-size: 10px;
}

.file-input {
  display: none;
}

.avatar-info {
  text-align: center;
  color: #7f8c8d;
  font-size: 10px;
  line-height: 1.3;
}

.dark .avatar-info {
  color: #d1d5db;
}

.size-limit {
  margin-top: 2px;
  font-size: 9px;
  opacity: 0.8;
}

.checkbox-group {
  flex-direction: row !important;
  align-items: flex-start !important;
  gap: 0 !important;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-size: 11px;
  color: #2c3e50;
  line-height: 1.4;
}

.dark .checkbox-label {
  color: #e5e7eb;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 3px;
  position: relative;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  margin-top: 1px;
}

.dark .checkbox-custom {
  background: rgba(55, 65, 81, 0.8);
  border-color: rgba(107, 114, 128, 0.4);
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
  font-size: 10px;
  font-weight: bold;
}

.terms-link {
  color: #667eea;
  text-decoration: none;
  font-size: 11px;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.register-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-spinner,
.button-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.button-text i {
  font-size: 12px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e74c3c;
  font-size: 11px;
  margin-top: 2px;
}

.error-message i {
  font-size: 10px;
}

.input-hint {
  font-size: 10px;
  color: #7f8c8d;
  margin-top: 3px;
  line-height: 1.3;
}

.dark .input-hint {
  color: #9ca3af;
}

.switch-mode {
  display: none;
}

.switch-text {
  font-size: 13px;
  color: #7f8c8d;
}

.dark .switch-text {
  color: #d1d5db;
}

.switch-link {
  background: none;
  border: none;
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s ease;
  padding: 2px 4px;
  border-radius: 4px;
}

.switch-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.anonymous-option {
  display: none;
}

.anonymous-link {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  margin: 0 auto;
}

.anonymous-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-card {
    padding: 0;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    border: none;
  }
  
  .dark .register-card {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  
  .register-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .register-title {
    font-size: 18px;
    color: #2c3e50;
  }
  
  .dark .register-title {
    color: white;
  }
  
  .register-subtitle {
    color: #64748b;
  }
  
  .dark .register-subtitle {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .form-label {
    color: #374151;
  }
  
  .dark .form-label {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .form-input {
    background: white;
    border: 1px solid #d1d5db;
    color: #2c3e50;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .dark .form-input {
    background: rgba(255, 255, 255, 0.9);
    border: none;
    color: #2c3e50;
  }
  
  .form-input:focus {
    background: white;
    border: 1px solid #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
  
  .dark .form-input:focus {
    background: white;
    border: none;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
  }
  
  .checkbox-label {
    color: #374151;
  }
  
  .dark .checkbox-label {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .checkbox-custom {
    background: white;
    border: 1px solid #d1d5db;
  }
  
  .dark .checkbox-custom {
    background: rgba(255, 255, 255, 0.9);
    border: none;
  }
  
  .terms-link {
    color: #667eea;
    font-weight: 600;
  }
  
  .dark .terms-link {
    color: white;
    font-weight: 600;
  }
  
  .avatar-preview {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
  }
  
  .dark .avatar-preview {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  .avatar-info {
    color: #64748b;
  }
  
  .dark .avatar-info {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .selected-file {
    color: #10b981;
    font-weight: 500;
    margin-top: 4px;
  }
  
  .dark .selected-file {
    color: #34d399;
  }
  
  .selected-file i {
    margin-right: 6px;
  }
  
  .input-hint {
    color: #64748b;
  }
  
  .dark .input-hint {
    color: rgba(255, 255, 255, 0.7);
  }

  .switch-mode {
    text-align: center;
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .switch-text {
    color: #64748b;
  }
  
  .dark .switch-text {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .switch-link {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 6px 12px;
    border-radius: 6px;
  }
  
  .dark .switch-link {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    padding: 6px 12px;
    border-radius: 6px;
  }
  
  .switch-link:hover {
    background: rgba(102, 126, 234, 0.2);
    color: #667eea;
  }
  
  .dark .switch-link:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
  
  .anonymous-option {
    display: block;
    text-align: center;
    margin-top: 12px;
  }
  
  .anonymous-link {
    color: #64748b;
  }
  
  .dark .anonymous-link {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .anonymous-link:hover {
    color: #374151;
    background: rgba(0, 0, 0, 0.05);
  }
  
  .dark .anonymous-link:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
  
  /* 移动端使用垂直布局 */
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .form-row .form-group.half-width {
    flex: none;
    width: 100%;
  }
}
</style> 