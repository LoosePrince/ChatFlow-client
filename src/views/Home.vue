<!-- 首页组件 -->
<template>
  <div class="home-container">
    <!-- 桌面端左右布局 -->
    <div class="desktop-layout">
      <!-- 左侧背景图片区域 -->
      <div class="left-section">
        <div class="background-image">
          <div class="overlay">
            <!-- Logo和欢迎信息 -->
            <div class="logo-welcome">
              <div class="logo-container">
                <i class="fas fa-comments logo-icon"></i>
                <h1 class="logo-text">ChatFlow</h1>
              </div>
              <p class="welcome-text">
                欢迎来到 ChatFlow，现代化实时聊天应用
              </p>
            </div>

            <!-- 主题切换和表单切换 -->
            <div class="left-controls">
              <!-- 主题切换按钮 -->
              <div class="theme-toggle-wrapper">
                <ThemeToggle :show-text="true" />
              </div>

              <!-- 模式切换按钮 -->
              <div class="mode-selector">
                <button 
                  class="mode-btn"
                  :class="{ active: currentMode === 'login' }"
                  @click="setMode('login')"
                >
                  <i class="fas fa-sign-in-alt"></i>
                  用户登录
                </button>
                <button 
                  class="mode-btn"
                  :class="{ active: currentMode === 'register' }"
                  @click="setMode('register')"
                >
                  <i class="fas fa-user-plus"></i>
                  用户注册
                </button>
                <button 
                  class="mode-btn"
                  :class="{ active: currentMode === 'anonymous' }"
                  @click="setMode('anonymous')"
                >
                  <i class="fas fa-user-secret"></i>
                  匿名体验
                </button>
              </div>
            </div>

            <!-- 底部信息 -->
            <div class="left-footer">
              <div class="footer-links">
                <router-link to="/user-agreement" class="footer-link">用户协议</router-link>
                <span class="footer-separator">|</span>
                <router-link to="/privacy-policy" class="footer-link">隐私政策</router-link>
              </div>
              <p>&copy; 2025 ChatFlow. 基于 Vue3 + Node.js 构建</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="right-section">
        <div class="form-container">
          <!-- 内容区域 -->
          <div class="content-area">
            <!-- 登录表单 -->
            <div v-if="currentMode === 'login'" class="form-section">
              <LoginForm 
                idPrefix="desktop-login-"
                @switchMode="setMode" 
                @loginSuccess="handleLoginSuccess"
              />
            </div>

            <!-- 注册表单 -->
            <div v-else-if="currentMode === 'register'" class="form-section">
              <RegisterForm 
                idPrefix="desktop-register-"
                @switchMode="setMode" 
                @registerSuccess="handleRegisterSuccess"
              />
            </div>

            <!-- 匿名体验 -->
            <div v-else-if="currentMode === 'anonymous'" class="form-section">
              <div class="anonymous-card">
                <div class="anonymous-header">
                  <div class="anonymous-icon">
                    <i class="fas fa-user-secret"></i>
                  </div>
                  <h2 class="anonymous-title">匿名体验</h2>
                  <p class="anonymous-subtitle">无需注册，快速体验功能</p>
                </div>

                <div class="anonymous-features">
                  <div class="feature-item">
                    <i class="fas fa-clock"></i>
                    <span>10分钟后可发言</span>
                  </div>
                  <div class="feature-item">
                    <i class="fas fa-comments"></i>
                    <span>可以查看聊天室</span>
                  </div>
                </div>

                <div class="anonymous-notice">
                  <div class="notice-header">
                    <i class="fas fa-info-circle"></i>
                    <span>功能限制说明</span>
                  </div>
                  <ul class="limitation-list">
                    <li>需要等待10分钟才能发送消息</li>
                    <li>无法创建或管理聊天室</li>
                    <li>无法上传文件或图片</li>
                    <li>无法浏览历史消息</li>
                  </ul>
                </div>

                <button 
                  class="anonymous-btn"
                  @click="handleAnonymousJoin"
                >
                  <span class="button-text">
                    <i class="fas fa-rocket"></i>
                    开始匿名体验
                  </span>
                </button>

                <div class="anonymous-footer">
                  <p>想要完整功能？请选择左侧的登录或注册选项</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端布局 -->
    <div class="mobile-layout">
      <!-- Logo和欢迎信息 -->
      <div class="mobile-welcome">
        <div class="logo-container">
          <i class="fas fa-comments logo-icon"></i>
          <h1 class="logo-text">ChatFlow</h1>
        </div>
        <p class="welcome-text">现代化实时聊天应用</p>
      </div>

      <!-- 主题切换按钮 -->
      <div class="theme-toggle-wrapper">
        <ThemeToggle :show-text="false" />
      </div>

      <!-- 内容区域 -->
      <div class="mobile-content">
        <!-- 登录表单 -->
        <div v-if="currentMode === 'login'" class="form-section">
          <LoginForm 
            idPrefix="mobile-login-"
            @switchMode="setMode" 
            @loginSuccess="handleLoginSuccess"
          />
        </div>

        <!-- 注册表单 -->
        <div v-else-if="currentMode === 'register'" class="form-section">
          <RegisterForm 
            idPrefix="mobile-register-"
            @switchMode="setMode" 
            @registerSuccess="handleRegisterSuccess"
          />
        </div>

        <!-- 匿名体验 -->
        <div v-else-if="currentMode === 'anonymous'" class="form-section">
          <div class="anonymous-card mobile">
            <div class="anonymous-header">
              <div class="anonymous-icon">
                <i class="fas fa-user-secret"></i>
              </div>
              <h2 class="anonymous-title">匿名体验</h2>
              <p class="anonymous-subtitle">无需注册，快速体验功能</p>
            </div>

            <div class="anonymous-features">
              <div class="feature-item">
                <i class="fas fa-clock"></i>
                <span>10分钟后可发言</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-comments"></i>
                <span>可以查看聊天室</span>
              </div>
            </div>

            <div class="anonymous-notice">
              <div class="notice-header">
                <i class="fas fa-info-circle"></i>
                <span>功能限制说明</span>
              </div>
              <ul class="limitation-list">
                <li>需要等待10分钟才能发送消息</li>
                <li>无法创建或管理聊天室</li>
                <li>无法上传文件或图片</li>
                <li>无法浏览历史消息</li>
              </ul>
            </div>

            <button 
              class="anonymous-btn"
              @click="handleAnonymousJoin"
            >
              <span class="button-text">
                <i class="fas fa-rocket"></i>
                开始体验
              </span>
            </button>

            <div class="anonymous-footer">
              <div class="footer-links">
                <a href="#" @click.prevent="setMode('register')" class="footer-link">
                  注册
                </a>
                <span class="separator">或</span>
                <a href="#" @click.prevent="setMode('login')" class="footer-link">
                  登录
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 移动端底部信息 -->
      <footer class="mobile-footer">
        <div class="footer-links">
          <router-link to="/user-agreement" class="footer-link">用户协议</router-link>
          <span class="footer-separator">|</span>
          <router-link to="/privacy-policy" class="footer-link">隐私政策</router-link>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import LoginForm from '@/components/common/LoginForm.vue'
import RegisterForm from '@/components/common/RegisterForm.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// 响应式数据
const currentMode = ref('login') // 'login', 'register', 'anonymous'

// 方法
const setMode = (mode) => {
  currentMode.value = mode
  // 更新URL查询参数
  router.replace({ query: { ...route.query, mode } })
}

const handleLoginSuccess = () => {
  // 登录成功，跳转到仪表板
  router.push({ name: 'Dashboard' })
}

const handleRegisterSuccess = () => {
  // 注册成功，跳转到仪表板
  router.push({ name: 'Dashboard' })
}

const handleAnonymousJoin = () => {
  // 直接跳转到 rooms 页面，由 rooms 页面处理匿名登录逻辑
  router.push({ 
    name: 'RoomSelect',
    query: { mode: 'anonymous' }
  })
}

// 生命周期
onMounted(() => {
  // 如果已经登录，直接跳转到仪表板
  if (authStore.isAuthenticated) {
    router.push({ name: 'Dashboard' })
    return
  }
  
  // 从URL查询参数获取模式
  const mode = route.query.mode
  if (mode && ['login', 'register', 'anonymous'].includes(mode)) {
    currentMode.value = mode
  }
})
</script>

<style scoped>
/* 基础容器 */
.home-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dark .home-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* 桌面端布局 */
.desktop-layout {
  display: block;
  height: 100vh;
  position: relative;
}

/* 左侧背景区域 */
.left-section {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.background-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(26, 26, 46, 0.3), rgba(22, 33, 62, 0.4)),
              url('/bg.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 5%;
}

.dark .background-image {
  background: linear-gradient(rgba(26, 26, 46, 0.5), rgba(22, 33, 62, 0.6)),
              url('/bg.jpg');
  background-size: cover;
  background-position: center;
}

.overlay {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  text-align: left;
  color: white;
  padding: 2rem;
  max-width: 500px;
}

.logo-welcome {
  flex: 0 0 auto;
}

.overlay .logo-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  margin-bottom: 24px;
}

.overlay .logo-icon {
  font-size: 60px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.overlay .logo-text {
  font-size: 48px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.overlay .welcome-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.6;
}

.left-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
}

.left-controls .theme-toggle-wrapper {
  display: flex;
  justify-content: flex-start;
}

.left-controls .mode-selector {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 8px;
  gap: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .left-controls .mode-selector {
  background: rgba(31, 41, 55, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.left-controls .mode-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  justify-content: flex-start;
}

.left-controls .mode-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.left-controls .mode-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.dark .left-controls .mode-btn.active {
  background: #667eea;
  color: white;
}

.left-footer {
  flex: 0 0 auto;
  text-align: left;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.left-footer .footer-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.left-footer .footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.left-footer .footer-link:hover {
  color: white;
  text-decoration: underline;
}

.left-footer .footer-separator {
  color: rgba(255, 255, 255, 0.5);
}

.left-footer p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* 右侧表单区域 */
.right-section {
  position: absolute;
  top: 0;
  right: 0;
  width: 480px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.dark .right-section {
  background: rgba(31, 41, 55, 0.75);
  border-left: 1px solid rgba(75, 85, 99, 0.3);
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  overflow-y: auto;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 匿名卡片样式 */
.anonymous-card {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;
}

.anonymous-header {
  text-align: center;
  margin-bottom: 16px;
}

.anonymous-icon {
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

.anonymous-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.dark .anonymous-title {
  color: #f3f4f6;
}

.anonymous-subtitle {
  color: #7f8c8d;
  font-size: 13px;
  margin: 0;
}

.dark .anonymous-subtitle {
  color: #d1d5db;
}

.anonymous-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
}

.dark .anonymous-features {
  background: rgba(102, 126, 234, 0.1);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
  font-size: 12px;
}

.dark .feature-item {
  color: #e5e7eb;
}

.feature-item i {
  font-size: 12px;
  color: #667eea;
  width: 14px;
}

.anonymous-notice {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.dark .anonymous-notice {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.2);
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #f59e0b;
  margin-bottom: 6px;
  font-size: 12px;
}

.limitation-list {
  margin: 0;
  padding-left: 14px;
  color: #d97706;
  font-size: 11px;
}

.dark .limitation-list {
  color: #fbbf24;
}

.limitation-list li {
  margin-bottom: 2px;
}

.anonymous-btn {
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
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.anonymous-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.anonymous-btn:disabled {
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

.anonymous-footer {
  text-align: center;
  color: #7f8c8d;
  font-size: 12px;
}

.dark .anonymous-footer {
  color: #d1d5db;
}

.anonymous-footer p {
  margin: 0;
  line-height: 1.4;
}

/* 移动端布局 */
.mobile-layout {
  display: none;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 1.5rem;
  flex-direction: column;
  position: relative;
}

.dark .mobile-layout {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.mobile-welcome {
  text-align: center;
  margin-bottom: 3rem;
  color: #2c3e50;
}

.dark .mobile-welcome {
  color: white;
}

.mobile-welcome .logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 16px;
}

.mobile-welcome .logo-icon {
  font-size: 42px;
  color: #667eea;
  text-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.dark .mobile-welcome .logo-icon {
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.mobile-welcome .logo-text {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
  text-shadow: 0 2px 8px rgba(44, 62, 80, 0.1);
}

.dark .mobile-welcome .logo-text {
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.mobile-welcome .welcome-text {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.dark .mobile-welcome .welcome-text {
  color: rgba(255, 255, 255, 0.9);
}

.mobile-layout .theme-toggle-wrapper {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
}

.mobile-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 2rem;
}

.mobile-footer {
  text-align: center;
  padding: 1rem 0;
  color: #64748b;
  font-size: 12px;
}

.dark .mobile-footer {
  color: rgba(255, 255, 255, 0.8);
}

.mobile-footer .footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.mobile-footer .footer-link {
  color: #64748b;
  text-decoration: none;
  transition: color 0.3s ease;
}

.dark .mobile-footer .footer-link {
  color: rgba(255, 255, 255, 0.7);
}

.mobile-footer .footer-link:hover {
  color: #667eea;
  text-decoration: underline;
}

.dark .mobile-footer .footer-link:hover {
  color: white;
  text-decoration: underline;
}

.mobile-footer .footer-separator {
  color: #94a3b8;
}

.dark .mobile-footer .footer-separator {
  color: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .right-section {
    width: 45%;
    min-width: 400px;
  }
  
  .form-container {
    padding: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .right-section {
    width: 50%;
    min-width: 380px;
  }
  
  .overlay {
    padding-left: 3%;
  }
  
  .overlay .logo-text {
    font-size: 40px;
  }
  
  .overlay .logo-icon {
    font-size: 50px;
  }
}

@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }
  
  .mobile-layout {
    display: flex;
  }
}

@media (max-width: 480px) {
  .mobile-layout {
    padding: 1.5rem 1rem;
  }
  
  .mobile-welcome .logo-text {
    font-size: 32px;
  }
  
  .mobile-welcome .logo-icon {
    font-size: 38px;
  }
  
  .mobile-welcome {
    margin-bottom: 2rem;
  }
}

.mobile-footer .footer-separator {
  color: rgba(255, 255, 255, 0.5);
}

.anonymous-card.mobile {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;
}

.anonymous-card.mobile .anonymous-title {
  color: #2c3e50;
}

.dark .anonymous-card.mobile .anonymous-title {
  color: white;
}

.anonymous-card.mobile .anonymous-subtitle {
  color: #64748b;
}

.dark .anonymous-card.mobile .anonymous-subtitle {
  color: rgba(255, 255, 255, 0.8);
}

.anonymous-card.mobile .anonymous-features {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.dark .anonymous-card.mobile .anonymous-features {
  background: rgba(255, 255, 255, 0.1);
}

.anonymous-card.mobile .feature-item {
  color: #374151;
}

.dark .anonymous-card.mobile .feature-item {
  color: rgba(255, 255, 255, 0.9);
}

.anonymous-card.mobile .footer-links .footer-link {
  color: #64748b;
}

.dark .anonymous-card.mobile .footer-links .footer-link {
  color: rgba(255, 255, 255, 0.8);
}

.anonymous-card.mobile .footer-links .separator {
  color: #94a3b8;
}

.dark .anonymous-card.mobile .footer-links .separator {
  color: rgba(255, 255, 255, 0.6);
}
</style> 