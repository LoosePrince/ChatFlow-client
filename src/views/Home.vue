<!-- 首页组件 -->
<template>
  <div class="h-screen bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-gray-900 dark:to-blue-900">
    <!-- 桌面端左右布局 -->
    <div class="hidden lg:block h-screen relative">
      <!-- 左侧背景图片区域 -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="background-image">
          <div class="flex flex-col justify-between h-full text-left text-white p-8 max-w-lg">
            <!-- Logo和欢迎信息 -->
            <div class="flex-none">
              <div class="flex items-center justify-start gap-5 mb-6">
                <i class="fas fa-comments text-6xl drop-shadow-lg"></i>
                <h1 class="text-5xl font-bold m-0 drop-shadow-lg">ChatFlow</h1>
              </div>
              <p class="text-lg text-white/90 m-0 leading-relaxed">
                欢迎来到 ChatFlow，现代化实时聊天应用
              </p>
            </div>

            <!-- 主题切换和表单切换 -->
            <div class="flex-1 flex flex-col justify-center gap-6">
              <!-- 主题切换按钮 -->
              <div class="flex justify-start">
                <ThemeToggle :show-text="true" />
              </div>

              <!-- 模式切换按钮 -->
              <div class="flex flex-col bg-white/10 rounded-2xl p-2 gap-2 backdrop-blur-md border border-white/20 dark:bg-gray-800/30 dark:border-gray-600/30">
                <button 
                  class="flex items-center gap-3 px-5 py-4 bg-transparent text-white/80 border-none rounded-xl text-base font-medium cursor-pointer transition-all duration-300 text-left justify-start hover:text-white hover:bg-white/10 hover:translate-x-1"
                  :class="{ 'bg-white text-indigo-500 shadow-lg dark:bg-indigo-500 dark:text-white': currentMode === 'login' }"
                  @click="setMode('login')"
                >
                  <i class="fas fa-sign-in-alt"></i>
                  用户登录
                </button>
                <button 
                  class="flex items-center gap-3 px-5 py-4 bg-transparent text-white/80 border-none rounded-xl text-base font-medium cursor-pointer transition-all duration-300 text-left justify-start hover:text-white hover:bg-white/10 hover:translate-x-1"
                  :class="{ 'bg-white text-indigo-500 shadow-lg dark:bg-indigo-500 dark:text-white': currentMode === 'register' }"
                  @click="setMode('register')"
                >
                  <i class="fas fa-user-plus"></i>
                  用户注册
                </button>
                <button 
                  class="flex items-center gap-3 px-5 py-4 bg-transparent text-white/80 border-none rounded-xl text-base font-medium cursor-pointer transition-all duration-300 text-left justify-start hover:text-white hover:bg-white/10 hover:translate-x-1"
                  :class="{ 'bg-white text-indigo-500 shadow-lg dark:bg-indigo-500 dark:text-white': currentMode === 'anonymous' }"
                  @click="setMode('anonymous')"
                >
                  <i class="fas fa-user-secret"></i>
                  匿名体验
                </button>
              </div>
            </div>

            <!-- 底部信息 -->
            <div class="flex-none text-left text-white/80 text-sm">
              <div class="flex items-center gap-4 mb-2">
                <router-link to="/user-agreement" class="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white hover:underline">用户协议</router-link>
                <span class="text-white/50">|</span>
                <router-link to="/privacy-policy" class="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white hover:underline">隐私政策</router-link>
              </div>
              <p class="m-0 text-xs text-white/60">&copy; 2025 ChatFlow. 基于 Vue3 + Node.js 构建</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="absolute top-0 right-0 h-screen bg-white/55 backdrop-blur-xl border-l border-white/20 dark:bg-gray-800/75 dark:border-gray-600/30 flex flex-col" style="width: 480px;">
        <div class="flex-1 flex flex-col p-8 overflow-y-auto">
          <!-- 内容区域 -->
          <div class="flex-1 flex flex-col">
            <!-- 登录表单 -->
            <div v-if="currentMode === 'login'" class="flex-1 flex flex-col justify-center">
              <LoginForm 
                idPrefix="desktop-login-"
                @switchMode="setMode" 
                @loginSuccess="handleLoginSuccess"
              />
            </div>

            <!-- 注册表单 -->
            <div v-else-if="currentMode === 'register'" class="flex-1 flex flex-col justify-center">
              <RegisterForm 
                idPrefix="desktop-register-"
                @switchMode="setMode" 
                @registerSuccess="handleRegisterSuccess"
              />
            </div>

            <!-- 匿名体验 -->
            <div v-else-if="currentMode === 'anonymous'" class="flex-1 flex flex-col justify-center">
              <div class="bg-transparent rounded-none p-0 shadow-none border-none">
                <div class="text-center mb-4">
                  <div class="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xl text-white shadow-lg">
                    <i class="fas fa-user-secret"></i>
                  </div>
                  <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">匿名体验</h2>
                  <p class="text-gray-500 dark:text-gray-300 text-sm m-0">无需注册，快速体验功能</p>
                </div>

                <div class="flex flex-col gap-2 mb-4 p-3 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-lg">
                  <div class="flex items-center gap-2 text-gray-800 dark:text-gray-200 text-xs">
                    <i class="fas fa-clock text-xs text-indigo-500 w-3.5"></i>
                    <span>10分钟后可发言</span>
                  </div>
                  <div class="flex items-center gap-2 text-gray-800 dark:text-gray-200 text-xs">
                    <i class="fas fa-comments text-xs text-indigo-500 w-3.5"></i>
                    <span>可以查看聊天室</span>
                  </div>
                </div>

                <div class="bg-yellow-500/10 border border-yellow-500/30 dark:bg-yellow-400/10 dark:border-yellow-400/20 rounded-lg p-3 mb-4">
                  <div class="flex items-center gap-1.5 font-semibold text-yellow-600 dark:text-yellow-400 mb-1.5 text-xs">
                    <i class="fas fa-info-circle"></i>
                    <span>功能限制说明</span>
                  </div>
                  <ul class="m-0 pl-3.5 text-yellow-700 dark:text-yellow-300 text-xs">
                    <li class="mb-0.5">需要等待10分钟才能发送消息</li>
                    <li class="mb-0.5">无法创建或管理聊天室</li>
                    <li class="mb-0.5">无法上传文件或图片</li>
                    <li class="mb-0.5">无法浏览历史消息</li>
                  </ul>
                </div>

                <button 
                  class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 mb-3 shadow-lg hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  @click="handleAnonymousJoin"
                >
                  <span class="flex items-center justify-center gap-1.5">
                    <i class="fas fa-rocket"></i>
                    开始匿名体验
                  </span>
                </button>

                <div class="text-center text-gray-500 dark:text-gray-300 text-xs">
                  <p class="m-0 leading-relaxed">想要完整功能？请选择左侧的登录或注册选项</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端布局 -->
    <div class="lg:hidden min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-blue-900 p-8 flex flex-col relative">
      <!-- Logo和欢迎信息 -->
      <div class="text-center mb-12 text-gray-800 dark:text-white">
        <div class="flex items-center justify-center gap-4 mb-4">
          <i class="fas fa-comments text-4xl text-indigo-500 drop-shadow-lg dark:text-white dark:drop-shadow-lg"></i>
          <h1 class="text-4xl font-bold m-0 text-gray-800 drop-shadow-sm dark:text-white dark:drop-shadow-lg">ChatFlow</h1>
        </div>
        <p class="text-base text-gray-600 dark:text-white/90 m-0 font-medium">现代化实时聊天应用</p>
      </div>

      <!-- 主题切换按钮 -->
      <div class="absolute top-6 right-6 z-10">
        <ThemeToggle :show-text="false" />
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 flex flex-col justify-center mb-8">
        <!-- 登录表单 -->
        <div v-if="currentMode === 'login'" class="flex-1 flex flex-col justify-center">
          <LoginForm 
            idPrefix="mobile-login-"
            @switchMode="setMode" 
            @loginSuccess="handleLoginSuccess"
          />
        </div>

        <!-- 注册表单 -->
        <div v-else-if="currentMode === 'register'" class="flex-1 flex flex-col justify-center">
          <RegisterForm 
            idPrefix="mobile-register-"
            @switchMode="setMode" 
            @registerSuccess="handleRegisterSuccess"
          />
        </div>

        <!-- 匿名体验 -->
        <div v-else-if="currentMode === 'anonymous'" class="flex-1 flex flex-col justify-center">
          <div class="bg-transparent rounded-none p-0 shadow-none border-none">
            <div class="text-center mb-4">
              <div class="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xl text-white shadow-lg">
                <i class="fas fa-user-secret"></i>
              </div>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-1">匿名体验</h2>
              <p class="text-gray-600 dark:text-white/80 text-sm m-0">无需注册，快速体验功能</p>
            </div>

            <div class="flex flex-col gap-2 mb-4 p-3 bg-indigo-500/10 dark:bg-white/10 rounded-lg">
              <div class="flex items-center gap-2 text-gray-700 dark:text-white/90 text-xs">
                <i class="fas fa-clock text-xs text-indigo-500 w-3.5"></i>
                <span>10分钟后可发言</span>
              </div>
              <div class="flex items-center gap-2 text-gray-700 dark:text-white/90 text-xs">
                <i class="fas fa-comments text-xs text-indigo-500 w-3.5"></i>
                <span>可以查看聊天室</span>
              </div>
            </div>

            <div class="bg-yellow-500/10 border border-yellow-500/30 dark:bg-yellow-400/10 dark:border-yellow-400/20 rounded-lg p-3 mb-4">
              <div class="flex items-center gap-1.5 font-semibold text-yellow-600 dark:text-yellow-400 mb-1.5 text-xs">
                <i class="fas fa-info-circle"></i>
                <span>功能限制说明</span>
              </div>
              <ul class="m-0 pl-3.5 text-yellow-700 dark:text-yellow-300 text-xs">
                <li class="mb-0.5">需要等待10分钟才能发送消息</li>
                <li class="mb-0.5">无法创建或管理聊天室</li>
                <li class="mb-0.5">无法上传文件或图片</li>
                <li class="mb-0.5">无法浏览历史消息</li>
              </ul>
            </div>

            <button 
              class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 mb-3 shadow-lg hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              @click="handleAnonymousJoin"
            >
              <span class="flex items-center justify-center gap-1.5">
                <i class="fas fa-rocket"></i>
                开始体验
              </span>
            </button>

            <div class="text-center">
              <div class="flex justify-center items-center gap-2">
                <a href="#" @click.prevent="setMode('register')" class="text-gray-600 dark:text-white/80 no-underline transition-colors duration-300 hover:text-indigo-500 dark:hover:text-white hover:underline">
                  注册
                </a>
                <span class="text-gray-400 dark:text-white/60">或</span>
                <a href="#" @click.prevent="setMode('login')" class="text-gray-600 dark:text-white/80 no-underline transition-colors duration-300 hover:text-indigo-500 dark:hover:text-white hover:underline">
                  登录
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 移动端底部信息 -->
      <footer class="text-center py-4 text-gray-600 dark:text-white/80 text-xs">
        <div class="flex justify-center items-center gap-2">
          <router-link to="/user-agreement" class="text-gray-600 dark:text-white/70 no-underline transition-colors duration-300 hover:text-indigo-500 dark:hover:text-white hover:underline">用户协议</router-link>
          <span class="text-gray-400 dark:text-white/50">|</span>
          <router-link to="/privacy-policy" class="text-gray-600 dark:text-white/70 no-underline transition-colors duration-300 hover:text-indigo-500 dark:hover:text-white hover:underline">隐私政策</router-link>
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
/* 保留背景图相关的CSS */
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
</style> 