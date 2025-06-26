<!-- 登录表单组件 -->
<template>
  <div class="login-form-container">
    <!-- 登录表单卡片 -->
    <div class="login-card">
      <!-- 头部 -->
      <div class="login-header">
        <div class="login-icon">
          <i class="fas fa-sign-in-alt"></i>
        </div>
        <h2 class="login-title">用户登录</h2>
        <p class="login-subtitle">欢迎回来，请登录您的账户</p>
      </div>

      <!-- 表单 -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- UID/邮箱输入 -->
        <div class="form-group">
          <label :for="`${idPrefix}identifier`" class="form-label">
            <i class="fas fa-id-card"></i>
            UID 或邮箱
          </label>
          <input
            :id="`${idPrefix}identifier`"
            v-model="form.identifier"
            type="text"
            class="form-input"
            :class="{ 'is-invalid': errors.identifier }"
            placeholder="请输入您的UID或邮箱地址"
            required
          >
          <div v-if="errors.identifier" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errors.identifier }}
          </div>
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label :for="`${idPrefix}password`" class="form-label">
            <i class="fas fa-lock"></i>
            密码
          </label>
          <div class="password-input-wrapper">
            <input
              :id="`${idPrefix}password`"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'is-invalid': errors.password }"
              placeholder="请输入您的密码"
              required
            >
            <button
              type="button"
              @click="togglePassword"
              class="password-toggle"
              :title="showPassword ? '隐藏密码' : '显示密码'"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div v-if="errors.password" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errors.password }}
          </div>
        </div>

        <!-- 记住我选项 -->
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="form.rememberMe"
              type="checkbox"
              class="checkbox-input"
            >
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">记住我（7天内免登录）</span>
          </label>
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          class="login-button"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="button-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
          <span v-else class="button-text">
            <i class="fas fa-sign-in-alt"></i>
            立即登录
          </span>
        </button>

        <!-- 切换到注册 -->
        <div class="switch-mode">
          <span class="switch-text">还没有账户？</span>
          <button type="button" @click="$emit('switchMode', 'register')" class="switch-link">
            立即注册
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

// 定义props
const props = defineProps({
  idPrefix: {
    type: String,
    default: 'login-'
  }
})

// 定义事件
const emit = defineEmits(['switchMode', 'loginSuccess'])

// 路由相关
const router = useRouter()

// Store实例
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// 响应式数据
const form = reactive({
  identifier: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  identifier: '',
  password: ''
})

const isLoading = ref(false)
const showPassword = ref(false)

// 表单验证
const validateForm = () => {
  let isValid = true
  
  // 重置错误
  errors.identifier = ''
  errors.password = ''
  
  // 验证标识符
  if (!form.identifier.trim()) {
    errors.identifier = '请输入UID或邮箱地址'
    isValid = false
  } else if (form.identifier.length < 3) {
    errors.identifier = 'UID或邮箱长度至少为3位'
    isValid = false
  }
  
  // 验证密码
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 4) {
    errors.password = '密码长度至少为4位'
    isValid = false
  }
  
  return isValid
}

// 密码显示切换
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 处理登录
const handleLogin = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await authStore.login(
      form.identifier.trim(),
      form.password
    )
    
    if (result.success) {
      notificationStore.success('登录成功！')
      
      // 触发登录成功事件
      emit('loginSuccess')
      
      // 跳转到仪表板
      router.push({ name: 'Dashboard' })
    } else {
      notificationStore.error(result.message || '登录失败')
    }
  } catch (error) {
    console.error('登录过程中发生错误:', error)
    
    // 处理不同类型的错误
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        errors.password = '密码错误'
      } else if (status === 404) {
        errors.identifier = '用户不存在'
      } else if (status === 429) {
        notificationStore.error('请求过于频繁，请稍后再试')
      } else {
        notificationStore.error(data.message || '登录失败，请稍后重试')
      }
    } else if (error.code === 'NETWORK_ERROR') {
      notificationStore.error('网络连接失败，请检查网络设置')
    } else {
      notificationStore.error('登录失败，请稍后重试')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-form-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.login-card {
  background: transparent;
  backdrop-filter: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;
  transition: none;
}

.dark .login-card {
  background: transparent;
  border: none;
  box-shadow: none;
}

.login-card:hover {
  transform: none;
  box-shadow: none;
}

.dark .login-card:hover {
  box-shadow: none;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.login-icon {
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

.dark .login-icon {
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5);
}

.login-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.dark .login-title {
  color: #f3f4f6;
}

.login-subtitle {
  color: #7f8c8d;
  font-size: 13px;
  margin: 0;
}

.dark .login-subtitle {
  color: #d1d5db;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.checkbox-group {
  flex-direction: row !important;
  align-items: center;
  gap: 0 !important;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #2c3e50;
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

.login-button {
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

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
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

.switch-mode {
  text-align: center;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  text-align: center;
  margin-top: 12px;
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

.dark .switch-text {
  color: rgba(255, 255, 255, 0.7);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    padding: 0;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    border: none;
  }
  
  .dark .login-card {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  
  .login-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .login-title {
    font-size: 18px;
    color: #2c3e50;
  }
  
  .dark .login-title {
    color: white;
  }
  
  .login-subtitle {
    color: #64748b;
  }
  
  .dark .login-subtitle {
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
}
</style> 