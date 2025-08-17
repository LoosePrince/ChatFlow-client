<template>
  <div class="flex flex-col">

    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 px-8 text-gray-600 dark:text-gray-400 text-center">
      <div class="text-4xl mb-5 text-indigo-600 dark:text-blue-400 opacity-80">
        <i class="fas fa-spinner animate-spin"></i>
      </div>
      <p>加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="chats.length === 0" class="flex flex-col items-center justify-center py-12 px-8 text-gray-600 dark:text-gray-400 text-center">
      <div class="text-4xl mb-5 text-indigo-600 dark:text-blue-400 opacity-80">
        <i class="fas fa-comment-slash"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">暂无私聊</h3>
      <p class="text-sm max-w-xs">开始与其他用户私聊吧！</p>
    </div>

    <!-- 聊天列表 -->
    <div v-else class="flex-1 overflow-y-auto p-2">
      <div
        v-for="chat in chats"
        :key="chat.chatId"
        class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:-translate-y-0.5 hover:shadow-lg mb-2"
        @click="openPrivateChat(chat.otherUid)"
      >
        <div class="flex items-center gap-3">
          <!-- 头像区域 -->
          <div class="relative">
            <img 
              :src="getAvatar(chat.otherUid)" 
              alt="avatar" 
              class="w-10 h-10 rounded-lg object-cover border-2 border-white dark:border-gray-700 shadow-sm transition-all duration-200"
            />
            <span 
              v-if="chat.unread > 0" 
              class="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1.5 border-2 border-white dark:border-gray-700 shadow-sm"
            >
              {{ chat.unread }}
            </span>
          </div>

          <!-- 聊天信息 -->
          <div class="flex-1 min-w-0 pr-2">
            <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
              {{ getUserDisplayName(chat.otherUid) }}
            </div>
            <div v-if="chat.lastMessage" class="text-xs text-gray-600 dark:text-gray-400 truncate">
              {{ formatContent(chat.lastMessage) }}
            </div>
          </div>

          <!-- 时间 -->
          <div v-if="chat.lastMessage" class="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
            {{ formatTime(chat.lastMessage.createdAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePrivateChatStore } from '@/stores/privateChat'
import { useAuthStore } from '@/stores/auth'
import { useUserInfo } from '@/composables/useUserInfo'

const router = useRouter()
const privateChatStore = usePrivateChatStore()
const authStore = useAuthStore()
const { getUserInfo } = useUserInfo()

const chats = computed(() => privateChatStore.chats)
const isLoading = computed(() => privateChatStore.isLoading)

// 用户信息缓存
const userInfoCache = ref(new Map())

// 获取用户显示名称
const getUserDisplayName = (uid) => {
  if (userInfoCache.value.has(uid)) {
    const userInfo = userInfoCache.value.get(uid)
    return userInfo.nickname || uid
  }
  
  // 异步加载用户信息
  loadUserInfo(uid)
  
  // 返回临时显示名称
  return uid
}

// 加载用户信息
const loadUserInfo = async (uid) => {
  if (userInfoCache.value.has(uid)) {
    return
  }
  
  try {
    const userInfo = await getUserInfo(uid)
    if (userInfo) {
      userInfoCache.value.set(uid, userInfo)
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

// 获取头像
const getAvatar = (uid) => {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  return `${base}/avatars/${uid}`
}

const formatContent = (msg) => {
  if (!msg) return ''
  if (msg.messageType === 'text') return msg.content
  if (msg.messageType === 'image') return '[图片]'
  if (msg.messageType === 'file') return '[文件]'
  return '[消息]'
}

const formatTime = (ts) => {
  const diff = Date.now() - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff/60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff/3600000)}小时前`
  const d = new Date(ts)
  return d.toLocaleDateString('zh-CN', { month:'2-digit', day:'2-digit' })
}

const refresh = () => privateChatStore.fetchChats()

// 打开私聊
const openPrivateChat = async (targetUid) => {
  try {
    // 验证目标用户是否存在
    const userInfo = await getUserInfo(targetUid)
    if (!userInfo) {
      // 用户不存在，提示并刷新列表
      console.error('用户不存在:', targetUid)
      await privateChatStore.fetchChats()
      return
    }
    
    // 记录来源页面信息（从私聊列表页面）
    const sourceInfo = {
      type: 'dashboard',
      page: 'private',
      timestamp: Date.now()
    }
    sessionStorage.setItem('privateChatSource', JSON.stringify(sourceInfo))
    
    router.push({ name: 'PrivateChat', params: { targetUid } })
  } catch (error) {
    console.error('验证用户失败:', error)
    // 验证失败，显示错误提示并刷新列表
    await privateChatStore.fetchChats()
  }
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await privateChatStore.fetchChats()
    
    // 预加载所有用户信息
    const userIds = chats.value.map(chat => chat.otherUid)
    for (const uid of userIds) {
      await loadUserInfo(uid)
    }
  }
})
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #475569;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style> 