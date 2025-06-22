<!-- 登录页面组件 -->
<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-shape decoration-shape-1"></div>
      <div class="decoration-shape decoration-shape-2"></div>
    </div>

    <!-- 主要内容 -->
    <div class="login-content">
      <!-- 顶部操作栏 -->
      <div class="top-actions">
      <!-- 返回按钮 -->
      <button @click="goBack" class="back-button">
        <i class="fas fa-arrow-left"></i>
        <span>返回首页</span>
      </button>
        
        <!-- 主题切换按钮 -->
        <div class="theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>

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
            <label for="identifier" class="form-label">
              <i class="fas fa-id-card"></i>
              UID 或邮箱
            </label>
            <input
              id="identifier"
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
            <label for="password" class="form-label">
              <i class="fas fa-lock"></i>
              密码
            </label>
            <div class="password-input-wrapper">
              <input
                id="password"
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

          <!-- 其他选项 -->
          <div class="form-footer">
            <p class="switch-text">
              还没有账户？
              <router-link to="/register" class="switch-link">
                立即注册
              </router-link>
            </p>
          </div>
        </form>
      </div>

      <!-- 功能提示 -->
      <div class="login-tips">
        <h3 class="tips-title">
          <i class="fas fa-lightbulb"></i>
          登录提示
        </h3>
        <div class="tips-grid">
          <div class="tip-item">
            <i class="fas fa-user-tag"></i>
            <div>
              <strong>UID登录</strong>
              <p>使用8位16进制UID快速登录</p>
            </div>
          </div>
          <div class="tip-item">
            <i class="fas fa-envelope"></i>
            <div>
              <strong>邮箱登录</strong>
              <p>使用注册时的邮箱地址登录</p>
            </div>
          </div>
          <div class="tip-item">
            <i class="fas fa-shield-alt"></i>
            <div>
              <strong>安全保护</strong>
              <p>所有数据传输都经过加密保护</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

// 路由相关
const router = useRouter()
const route = useRoute()

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
    errors.identifier = '请输入UID或邮箱'
    isValid = false
  } else if (form.identifier.includes('@')) {
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.identifier)) {
      errors.identifier = '请输入有效的邮箱地址'
      isValid = false
    }
  } else {
    // UID格式验证（8位16进制）
    const uidRegex = /^[0-9A-Fa-f]{8}$/
    if (!uidRegex.test(form.identifier)) {
      errors.identifier = 'UID应为8位16进制字符'
      isValid = false
    }
  }
  
  // 验证密码
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度至少为6位'
    isValid = false
  }
  
  return isValid
}

// 处理登录
const handleLogin = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  
  try {
    // 调用登录API
    await authStore.login(form.identifier, form.password)
    
    // 登录成功调试日志
    console.log('登录成功，用户信息:', authStore.user)
    console.log('认证状态:', {
      isAuthenticated: authStore.isAuthenticated,
      isUser: authStore.isUser,
      isAnonymous: authStore.isAnonymous
    })
    
    // 登录成功通知
    notificationStore.success(`欢迎回来，${authStore.user.nickname}！`)
    
    // 跳转到首页显示我的聊天室，或重定向页面
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
    
  } catch (error) {
    console.error('登录失败:', error)
    
    // 重置之前的错误
    errors.identifier = ''
    errors.password = ''
    
    // 根据错误类型设置具体的错误信息到表单字段
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message
      if (errorMessage.includes('密码') || errorMessage.includes('password')) {
        errors.password = errorMessage
      } else if (errorMessage.includes('用户') || errorMessage.includes('不存在') || errorMessage.includes('UID') || errorMessage.includes('邮箱')) {
        errors.identifier = errorMessage
      } else {
        // 通用错误显示在密码字段下方
        errors.password = errorMessage
      }
    } else if (error.response?.status === 401) {
      errors.password = '用户名或密码错误，请检查后重试'
    } else if (error.response?.status === 404) {
      errors.identifier = '用户不存在，请检查UID或邮箱是否正确'
    } else if (error.response?.status === 400) {
      errors.password = '请求参数错误，请检查输入内容'
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      errors.password = '网络连接失败，请检查网络设置'
    } else if (error.code === 'ECONNREFUSED') {
      errors.password = '无法连接到服务器，请稍后重试'
    } else {
      errors.password = '登录失败，请稍后重试'
    }
    
    // 清除密码字段
    form.password = ''
  } finally {
    isLoading.value = false
  }
}

// 切换密码显示
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 返回首页
const goBack = () => {
  router.push({ name: 'Home' })
}

// 页面挂载时检查是否有注册成功消息
onMounted(() => {
  if (route.query.message === 'register_success') {
    notificationStore.success('注册成功！请登录您的账户')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dark .login-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
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

.login-content {
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

.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  margin: 0 auto 40px;
  backdrop-filter: blur(20px);
}

.dark .login-card {
  background: #374151;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-icon {
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

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.dark .login-title {
  color: #f3f4f6;
}

.login-subtitle {
  color: #7f8c8d;
  margin: 0;
}

.dark .login-subtitle {
  color: #d1d5db;
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

.dark .form-label {
  color: #e5e7eb;
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

.dark .form-input {
  background: #4b5563;
  border: 2px solid #6b7280;
  color: #f3f4f6;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.dark .form-input:focus {
  background: #374151;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-input.is-invalid {
  border-color: #e74c3c;
  background: #fdf2f2;
}

.dark .form-input.is-invalid {
  border-color: #ef4444;
  background: #7f1d1d;
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
  align-items: center;
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
}

.dark .checkbox-text {
  color: #e5e7eb;
}

.login-button {
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

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
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

.login-tips {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .login-tips {
  background: rgba(17, 24, 39, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
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
  .login-container {
    padding: 15px;
  }
  
  .login-card {
    padding: 30px 20px;
  }
  
  .login-icon {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .login-tips {
    padding: 20px;
  }
  
  .tips-title {
    font-size: 18px;
  }
}
</style> 