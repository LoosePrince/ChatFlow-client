<!-- 个人资料页面组件 -->
<template>
  <div>
    <!-- 桌面端内容 -->
    <div class="hidden lg:block p-5 h-full overflow-y-auto">
      <div class="w-full max-w-6xl mx-auto">
        <div class="grid grid-cols-5 gap-6">
          <!-- 左侧：用户信息卡片 -->
          <div class="col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-secondary-200 dark:border-dark-700 shadow-sm sticky top-5">
              <!-- 用户头像和基本信息 -->
              <div class="text-center mb-6">
                <div class="relative inline-block">
                  <img 
                    :src="userAvatarUrl" 
                    :alt="authStore.user.nickname"
                    class="w-24 h-24 rounded-full object-cover border-4 border-primary-600 dark:border-primary-400 mx-auto mb-4"
                    @error="handleAvatarError"
                  >
                  <div v-if="authStore.isAnonymous" class="absolute -bottom-1 -right-1 w-6 h-6 bg-danger-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-white">
                    <i class="fas fa-user-secret"></i>
                  </div>
                </div>
                <h3 class="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">{{ authStore.user.nickname }}</h3>
                <div class="flex justify-center">
                  <span v-if="authStore.isAnonymous" class="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded-full font-medium">
                    <i class="fas fa-user-secret"></i>
                    匿名用户
                  </span>
                  <span v-else class="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded-full font-medium">
                    <i class="fas fa-user"></i>
                    注册用户
                  </span>
                </div>
              </div>

              <!-- 统计信息 -->
              <div v-if="authStore.isUser" class="mb-6">
                <h4 class="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 text-center">房间统计</h4>
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                    <span class="text-sm text-secondary-600 dark:text-secondary-400">创建房间</span>
                    <span class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ createdChatrooms.length }}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                    <span class="text-sm text-secondary-600 dark:text-secondary-400">加入房间</span>
                    <span class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ joinedChatrooms.length }}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                    <span class="text-sm font-medium text-primary-700 dark:text-primary-300">总房间数</span>
                    <span class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ createdChatrooms.length + joinedChatrooms.length }}</span>
                  </div>
                </div>
              </div>

              <!-- 快速操作 -->
              <div class="space-y-3">
                <button v-if="authStore.isUser" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300" @click="goToProfile">
                  <i class="fas fa-user-edit"></i>
                  <span>编辑资料</span>
                </button>
                
                <button v-if="authStore.isAnonymous" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300" @click="handleUserRegister">
                  <i class="fas fa-user-plus"></i>
                  <span>注册账户</span>
                </button>

                <button class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary-100 dark:bg-secondary-600 text-secondary-700 dark:text-secondary-300 font-medium rounded-lg border border-secondary-300 dark:border-secondary-500 hover:bg-secondary-200 dark:hover:bg-secondary-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300" @click="handleLogout">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧：详细信息 -->
          <div class="col-span-3">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-secondary-200 dark:border-dark-700 shadow-sm">
              <div class="flex justify-between items-center mb-6 pb-4 border-b border-secondary-200 dark:border-dark-700">
                <h2 class="text-xl font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                  <i class="fas fa-info-circle"></i>
                  详细信息
                </h2>
              </div>

              <!-- 协议链接 -->
              <div class="mb-6">
                <h4 class="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">相关协议</h4>
                <div class="grid grid-cols-2 gap-4">
                  <router-link to="/user-agreement" class="flex items-center gap-3 p-4 bg-secondary-50 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 font-medium rounded-lg border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                    <i class="fas fa-file-contract text-primary-600 dark:text-primary-400"></i>
                    <span>用户协议</span>
                  </router-link>
                  
                  <router-link to="/privacy-policy" class="flex items-center gap-3 p-4 bg-secondary-50 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 font-medium rounded-lg border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                    <i class="fas fa-shield-alt text-primary-600 dark:text-primary-400"></i>
                    <span>隐私政策</span>
                  </router-link>
                </div>
              </div>

              <!-- 版权和技术信息 -->
              <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div class="text-center">
                  <div class="flex items-center justify-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    <i class="fas fa-copyright text-indigo-600 dark:text-blue-400"></i>
                    <span>2025 ChatFlow</span>
                  </div>
                  <div class="flex items-center justify-center gap-3 mb-2">
                    <div class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      <i class="fab fa-vuejs text-green-500"></i>
                      <span>Vue3</span>
                    </div>
                    <div class="text-gray-400 font-semibold text-sm">+</div>
                    <div class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      <i class="fab fa-node-js text-green-600"></i>
                      <span>Node.js</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <i class="fas fa-code-branch text-indigo-600 dark:text-blue-400"></i>
                    <span>Version 1.1.2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 手机端内容 -->
    <div class="lg:hidden pt-20 pb-20 min-h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <div class="p-3">
        <!-- 用户信息头部 -->
        <div class="dark:bg-gray-800 rounded-xl p-3 flex items-center gap-3 mb-3 border border-gray-200 dark:border-gray-700">
          <div class="relative">
            <img 
              :src="userAvatarUrl" 
              :alt="authStore.user.nickname"
              class="w-12 h-12 rounded-full object-cover border-2 border-indigo-600 dark:border-blue-400"
              @error="handleAvatarError"
            >
            <div v-if="authStore.isAnonymous" class="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-xs text-white border border-white">
              <i class="fas fa-user-secret text-xs"></i>
            </div>
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ authStore.user.nickname }}</h2>
            <div class="flex gap-2">
              <span v-if="authStore.isAnonymous" class="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-medium">
                <i class="fas fa-user-secret"></i>
                匿名用户
              </span>
              <span v-else class="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                <i class="fas fa-user"></i>
                注册用户
              </span>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div v-if="authStore.isUser" class="grid grid-cols-3 gap-3 dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 mb-3">
          <div class="text-center">
            <div class="text-xl font-bold text-indigo-600 dark:text-blue-400 mb-0.5">{{ createdChatrooms.length }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400 font-medium">创建房间</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-indigo-600 dark:text-blue-400 mb-0.5">{{ joinedChatrooms.length }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400 font-medium">加入房间</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-indigo-600 dark:text-blue-400 mb-0.5">{{ createdChatrooms.length + joinedChatrooms.length }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400 font-medium">总房间数</div>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="space-y-1.5 mb-3">
          <button v-if="authStore.isUser" class="flex items-center justify-between w-full p-3 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-300 text-sm text-gray-900 dark:text-gray-100 active:scale-98 active:bg-gray-50 dark:active:bg-gray-700" @click="goToProfile">
            <div class="flex items-center gap-3">
              <i class="fas fa-user-edit text-indigo-600 dark:text-blue-400"></i>
              <span>编辑资料</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          </button>
          
          <button v-if="authStore.isAnonymous" class="flex items-center justify-between w-full p-3 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-300 text-sm text-gray-900 dark:text-gray-100 active:scale-98 active:bg-gray-50 dark:active:bg-gray-700" @click="handleUserRegister">
            <div class="flex items-center gap-3">
              <i class="fas fa-user-plus text-indigo-600 dark:text-blue-400"></i>
              <span>注册账户</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          </button>

          <button class="flex items-center justify-between w-full p-3 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-300 text-sm text-gray-900 dark:text-gray-100 active:scale-98 active:bg-gray-50 dark:active:bg-gray-700" @click="handleLogout">
            <div class="flex items-center gap-3">
              <i class="fas fa-sign-out-alt text-indigo-600 dark:text-blue-400"></i>
              <span>退出登录</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          </button>
        </div>

        <hr class="my-3 border-gray-300 dark:border-gray-600">

        <!-- 协议链接 -->
        <div class="space-y-1.5 mb-3">
          <router-link to="/user-agreement" class="flex items-center justify-between w-full p-2.5 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 text-decoration-none transition-all duration-300 text-sm active:scale-98 active:bg-gray-50 dark:active:bg-gray-700">
            <div class="flex items-center gap-3">
              <i class="fas fa-file-contract text-indigo-600 dark:text-blue-400 text-sm"></i>
              <span>用户协议</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          </router-link>
          
          <router-link to="/privacy-policy" class="flex items-center justify-between w-full p-2.5 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 text-decoration-none transition-all duration-300 text-sm active:scale-98 active:bg-gray-50 dark:active:bg-gray-700">
            <div class="flex items-center gap-3">
              <i class="fas fa-shield-alt text-indigo-600 dark:text-blue-400 text-sm"></i>
              <span>隐私政策</span>
            </div>
            <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          </router-link>
        </div>

        <!-- 版权和技术信息 -->
        <div class="p-3 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div class="flex items-center justify-center gap-2 mb-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
            <i class="fas fa-copyright text-indigo-600 dark:text-blue-400 text-sm"></i>
            <span>2025 ChatFlow</span>
          </div>
          <div class="flex items-center justify-center gap-2 mb-2">
            <div class="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 font-medium">
              <i class="fab fa-vuejs text-sm text-green-500"></i>
              <span>Vue3</span>
            </div>
            <div class="text-gray-400 font-semibold text-xs">+</div>
            <div class="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 font-medium">
              <i class="fab fa-node-js text-sm text-green-600"></i>
              <span>Node.js</span>
            </div>
          </div>
          <div class="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <i class="fas fa-code-branch text-indigo-600 dark:text-blue-400 text-xs"></i>
            <span>Version 1.1.2</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useChatroomStore } from '@/stores/chatroom'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const chatroomStore = useChatroomStore()

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

// 我创建的聊天室
const createdChatrooms = computed(() => {
  if (!chatroomStore.userChatrooms) return []
  return chatroomStore.userChatrooms.filter(chatroom => chatroom.joinType === 'created')
})

// 我加入的聊天室
const joinedChatrooms = computed(() => {
  if (!chatroomStore.userChatrooms) return []
  return chatroomStore.userChatrooms.filter(chatroom => chatroom.joinType === 'joined')
})

// 方法
const handleAvatarError = (event) => {
  // 头像加载失败时使用默认头像
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  event.target.src = `${baseUrl}/avatars/default`
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    notificationStore.success('已退出登录')
    // 使用replace而不是push，避免浏览器历史记录问题
    router.replace({ name: 'Home' })
  } catch (error) {
    console.error('退出登录失败:', error)
    notificationStore.error('退出登录失败')
  }
}

const goToProfile = () => {
  router.push({ name: 'Profile' })
}

const handleUserRegister = () => {
  router.push({ name: 'Home', query: { mode: 'register' } })
}
</script> 