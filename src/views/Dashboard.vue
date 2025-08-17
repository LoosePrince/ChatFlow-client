<!-- 用户仪表板页面 -->
<template>
  <div class="dashboard-container">
          <!-- 桌面端左侧边栏 -->
      <aside class="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:z-20 lg:bg-white lg:border-r lg:border-secondary-200 dark:bg-gray-800 dark:lg:border-dark-700" v-if="authStore.isAuthenticated">
        <!-- Logo区域 -->
        <div class="flex items-center justify-center gap-3 px-4 py-3 border-b border-secondary-200 dark:border-dark-700">
          <i class="fas fa-comments text-xl text-primary-600 dark:text-primary-400"></i>
          <span class="text-lg font-bold text-primary-600 dark:text-primary-400">ChatFlow</span>
        </div>

        <!-- 标签页导航 -->
        <nav class="flex-1 px-3 py-3 space-y-1">
          <button 
            class="flex w-full items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all duration-300 rounded-lg mx-1"
            :class="{ 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400': activeTab === 'rooms' }"
            @click="router.push({ name: 'DashboardRooms' })"
          >
            <i class="fas fa-home w-4 text-center"></i>
            <span>房间</span>
          </button>
          
          <button 
            class="flex w-full items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all duration-300 rounded-lg mx-1"
            :class="{ 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400': activeTab === 'domain' }"
            @click="router.push({ name: 'DashboardDomain' })"
          >
            <i class="fas fa-globe w-4 text-center"></i>
            <span>领域</span>
          </button>
          
          <button 
            class="flex w-full items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all duration-300 rounded-lg mx-1"
            :class="{ 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400': activeTab === 'private' }"
            @click="router.push({ name: 'DashboardPrivate' })"
          >
            <i class="fas fa-envelope w-4 text-center"></i>
            <span>私聊</span>
          </button>
          
          <button 
            class="flex w-full items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all duration-300 rounded-lg mx-1"
            :class="{ 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400': activeTab === 'profile' }"
            @click="router.push({ name: 'DashboardProfile' })"
          >
            <i class="fas fa-user w-4 text-center"></i>
            <span>我的</span>
          </button>
        </nav>

        <!-- 底部用户信息 -->
        <div class="flex items-center gap-2 px-3 py-2 border-t border-secondary-200 dark:border-dark-700 mx-1 my-1 rounded-lg hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all duration-300 cursor-pointer" @click="router.push({ name: 'DashboardProfile' })">
          <div class="relative">
            <img 
              :src="userAvatarUrl" 
              :alt="authStore.user.nickname"
              class="w-8 h-8 rounded-full object-cover border-2 border-primary-600 dark:border-primary-400 hover:scale-105 transition-transform duration-200"
              @error="handleAvatarError"
            >
            <div v-if="authStore.isAnonymous" class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-danger-500 rounded-full flex items-center justify-center text-xs text-white border border-white">
              <i class="fas fa-user-secret text-xs"></i>
            </div>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-secondary-900 dark:text-secondary-100 truncate">{{ authStore.user.nickname }}</div>
          </div>

          <!-- 主题切换按钮 -->
          <div class="flex items-center justify-center" @click.stop>
            <ThemeToggle />
          </div>
        </div>
      </aside>

    <!-- 手机端顶部头部 -->
    <header class="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-secondary-200 dark:border-dark-700 z-50 h-20">
      <div class="flex items-center justify-between h-full px-4">
        <div class="flex items-center gap-2 text-xl font-bold text-primary-600 dark:text-primary-400">
          <i class="fas fa-comments text-2xl"></i>
          <span>ChatFlow</span>
        </div>
        <div class="flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <div class="flex-1 lg:ml-60 flex flex-col relative z-0 h-screen overflow-y-auto">
      <!-- 桌面端内容 -->
      <div class="hidden lg:block p-5 h-full dark:bg-gray-900 overflow-y-auto">
        <div class="w-full max-w-4xl mx-auto">
          <router-view />
        </div>
      </div>

      <!-- 手机端内容 -->
      <div class="lg:hidden min-h-screen w-full bg-secondary-50 dark:bg-gray-900 overflow-x-hidden">
        <router-view />
      </div>
    </div>

    <!-- 手机端底部导航栏 -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-secondary-200 dark:border-dark-700 flex justify-around items-center h-18 z-50 py-2">
      <button 
        class="flex flex-col items-center gap-1 p-2 bg-none border-none text-secondary-600 dark:text-secondary-400 cursor-pointer transition-all duration-300 rounded-xl min-w-15"
        :class="{ 'text-primary-600 dark:text-primary-400': activeTab === 'rooms' }"
        @click="router.push({ name: 'DashboardRooms' })"
      >
        <i class="fas fa-home text-xl"></i>
        <span class="text-xs font-medium">房间</span>
      </button>

      <button 
        class="flex flex-col items-center gap-1 p-2 bg-none border-none text-secondary-600 dark:text-secondary-400 cursor-pointer transition-all duration-300 rounded-xl min-w-15"
        :class="{ 'text-primary-600 dark:text-primary-400': activeTab === 'domain' }"
        @click="router.push({ name: 'DashboardDomain' })"
      >
        <i class="fas fa-globe text-xl"></i>
        <span class="text-xs font-medium">领域</span>
      </button>
      
      <button 
        class="w-12 h-12 bg-primary-600 dark:bg-primary-500 text-white border-none rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
        @click="goToRooms"
      >
        <i class="fas fa-plus text-xl"></i>
      </button>

      <button 
        class="flex flex-col items-center gap-1 p-2 bg-none border-none text-secondary-600 dark:text-secondary-400 cursor-pointer transition-all duration-300 rounded-xl min-w-15"
        :class="{ 'text-primary-600 dark:text-primary-400': activeTab === 'private' }"
        @click="router.push({ name: 'DashboardPrivate' })"
      >
        <i class="fas fa-envelope text-xl"></i>
        <span class="text-xs font-medium">私聊</span>
      </button>
      
      <button 
        class="flex flex-col items-center gap-1 p-2 bg-none border-none text-secondary-600 dark:text-secondary-400 cursor-pointer transition-all duration-300 rounded-xl min-w-15"
        :class="{ 'text-primary-600 dark:text-primary-400': activeTab === 'profile' }"
        @click="router.push({ name: 'DashboardProfile' })"
      >
        <i class="fas fa-user text-xl"></i>
        <span class="text-xs font-medium">我的</span>
      </button>
    </nav>


  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/common/ThemeToggle.vue'


const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 响应式数据 - 根据当前路由确定激活的标签
const activeTab = computed(() => {
  const routeName = route.name
  if (routeName === 'DashboardRooms') return 'rooms'
  if (routeName === 'DashboardDomain') return 'domain'
  if (routeName === 'DashboardPrivate') return 'private'
  if (routeName === 'DashboardProfile') return 'profile'
  return 'rooms'
})



// 计算属性
const userAvatarUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  if (!authStore.user?.avatarUrl) {
    return `${baseUrl}/avatars/default`
  }
  
  // 如果是完整URL，直接返回
  if (authStore.user.avatarUrl.startsWith('http') || authStore.user.avatarUrl.startsWith('data:')) {
    return authStore.user.avatarUrl
  }
  
  // 使用新的固定头像URL格式
  return `${baseUrl}${authStore.user.avatarUrl}`
})



// 方法

const handleAvatarError = (event) => {
  // 头像加载失败时使用默认头像
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  event.target.src = `${baseUrl}/avatars/default`
}

const goToRooms = () => {
  router.push({ name: 'RoomSelect' })
}

// 生命周期
onMounted(async () => {
  // 检查是否已登录
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Home' })
    return
  }
  
  // 等待认证状态初始化完成（如果还未完成）
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  // 如果直接访问dashboard根路径，重定向到rooms页面
  if (route.name === 'Dashboard' || route.name === 'DashboardDefault') {
    router.replace({ name: 'DashboardRooms' })
  }
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
  display: flex;
}

.dark .dashboard-container {
  background: #171717;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 移动端背景简化 */
  .dashboard-container {
    background: #fafafa;
    flex-direction: column;
  }

  .dark .dashboard-container {
    background: #0a0a0a;
  }
}
</style> 