<!-- 房间页面组件 -->
<template>
  <div>
    <!-- 桌面端内容 -->
    <div class="hidden lg:block p-5 h-full overflow-y-auto">
      <div class="w-full max-w-4xl mx-auto">
        <!-- 匿名用户欢迎界面 -->
        <div v-if="authStore.isAnonymous" class="text-center max-w-2xl mx-auto mb-12 p-8 bg-white dark:bg-gray-800 rounded-xl border border-secondary-200 dark:border-dark-700 shadow-sm">
          <div class="mb-10">
            <h1 class="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-5">欢迎回来，{{ authStore.user.nickname }}！</h1>
            <div class="flex items-center justify-center gap-2 text-base text-secondary-700 dark:text-secondary-300 mb-10 px-6 py-4 bg-secondary-50 dark:bg-secondary-700 rounded-lg border border-secondary-200 dark:border-secondary-600">
              <i class="fas fa-info-circle"></i>
              您正在使用匿名模式，功能有限。建议注册账户获得完整体验。
            </div>
          </div>

          <div class="flex flex-wrap gap-4 justify-center">
            <button class="flex items-center gap-2 px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300" @click="goToRooms">
              <i class="fas fa-comments"></i>
              <span>进入聊天室</span>
            </button>
            
            <button class="flex items-center gap-2 px-6 py-3 bg-secondary-100 dark:bg-secondary-600 text-secondary-700 dark:text-secondary-300 font-semibold rounded-lg border border-secondary-300 dark:border-secondary-500 hover:bg-secondary-200 dark:hover:bg-secondary-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300" @click="handleUserRegister">
              <i class="fas fa-user-plus"></i>
              <span>注册账户</span>
            </button>
          </div>
        </div>

        <!-- 聊天室列表 (仅注册用户) -->
        <div v-if="authStore.isUser" class="bg-white dark:bg-gray-800 rounded-xl p-8 border border-secondary-200 dark:border-dark-700 shadow-sm">
          <div class="flex justify-between items-center mb-8 pb-4 border-b border-secondary-200 dark:border-dark-700">
            <h2 class="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
              <i class="fas fa-home"></i>
              我的聊天室
            </h2>
            <div class="flex items-center gap-3">
              <button class="flex items-center gap-2 px-4 py-2 bg-success-600 dark:bg-success-500 text-white font-medium rounded-lg hover:bg-success-700 dark:hover:bg-success-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300" @click="goToRooms">
                <i class="fas fa-plus"></i>
                <span>加入房间</span>
              </button>
              <button class="w-10 h-10 bg-primary-600 dark:bg-primary-500 border-none rounded-lg text-white cursor-pointer transition-all duration-300 hover:bg-primary-700 dark:hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center" @click="refreshChatrooms" :disabled="chatroomStore.isLoading">
                <i class="fas fa-sync-alt" :class="{ 'animate-spin': chatroomStore.isLoading }"></i>
              </button>
            </div>
          </div>

          <div v-if="chatroomStore.isLoading && (!chatroomStore.userChatrooms || chatroomStore.userChatrooms.length === 0)" class="text-center py-12 text-secondary-700 dark:text-secondary-300">
            <div class="text-3xl mb-4 text-secondary-700 dark:text-secondary-300">
              <i class="fas fa-spinner animate-spin"></i>
            </div>
            <p>正在加载聊天室...</p>
          </div>

          <div v-else-if="!chatroomStore.userChatrooms || chatroomStore.userChatrooms.length === 0" class="text-center py-12 text-secondary-700 dark:text-secondary-300">
            <div class="text-6xl mb-4 text-primary-600 dark:text-primary-400 opacity-60">
              <i class="fas fa-comments"></i>
            </div>
            <h3 class="text-2xl mb-2">还没有聊天室</h3>
            <p class="opacity-80 mb-8">创建您的第一个聊天室，开始与朋友们聊天吧！</p>
            <button class="flex items-center gap-2 px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300" @click="goToRooms">
              <i class="fas fa-plus"></i>
              <span>创建聊天室</span>
            </button>
          </div>

          <div v-else class="space-y-4">
            <!-- 聊天室列表 -->
            <div 
              v-for="chatroom in chatroomStore.userChatrooms" 
              :key="chatroom.roomId"
              class="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-4 border border-secondary-200 dark:border-secondary-600 cursor-pointer transition-all duration-300 hover:bg-secondary-100 dark:hover:bg-secondary-600 hover:-translate-y-0.5 hover:shadow-lg"
              @click="joinMyChatroom(chatroom)"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-1 leading-tight">
                    {{ chatroom.name }} (ID: {{ chatroom.roomId }})
                  </h3>
                  <div class="flex gap-4 text-sm">
                    <span class="text-secondary-600 dark:text-secondary-400 flex items-center gap-1">
                      <i class="fas fa-hashtag"></i>
                      {{ chatroom.roomId }}
                    </span>
                    <span class="text-secondary-600 dark:text-secondary-400 flex items-center gap-1">
                      <i class="fas fa-users"></i>
                      {{ chatroom.userCount }} 成员
                    </span>
                  </div>
                </div>
                <div v-if="chatroom.joinType === 'created'" class="bg-gradient-to-r from-warning-400 to-warning-500 text-secondary-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap">
                  <i class="fas fa-crown"></i>
                  <span>房主</span>
                </div>
                <div v-else class="bg-gradient-to-r from-success-400 to-success-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap">
                  <i class="fas fa-user"></i>
                  <span>成员</span>
                </div>
              </div>

              <div class="mb-2">
                <div v-if="chatroom.lastMessage" class="flex justify-between items-center gap-4 bg-secondary-200 dark:bg-secondary-600 rounded-md p-2 border border-secondary-300 dark:border-secondary-500">
                  <span class="flex-1 text-secondary-800 dark:text-secondary-200 text-sm leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">{{ formatMessageContent(chatroom.lastMessage) }}</span>
                  <span class="text-secondary-500 dark:text-secondary-400 text-xs whitespace-nowrap">{{ formatTime(chatroom.lastMessage.createdAt) }}</span>
                </div>
                <div v-else class="text-secondary-500 dark:text-secondary-400 text-sm text-center py-2">
                  <span>暂无消息</span>
                </div>
              </div>

              <div class="flex justify-between items-center pt-2 border-t border-secondary-200 dark:border-secondary-600">
                <div class="text-secondary-600 dark:text-secondary-400 text-xs flex items-center gap-1">
                  <i class="fas fa-calendar-alt"></i>
                  {{ chatroom.joinType === 'created' ? '创建于' : '加入于' }} {{ formatDate(chatroom.createdAt) }}
                </div>
                <div v-if="chatroom.joinType === 'joined'" class="flex gap-2">
                  <button 
                    class="flex items-center gap-1 px-4 py-2 bg-danger-500 text-white text-sm font-medium rounded-md hover:bg-danger-600 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300" 
                    @click.stop="leaveChatroom(chatroom)"
                  >
                    <i class="fas fa-sign-out-alt"></i>
                    <span>退出</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 匿名用户提示 -->
        <div v-if="authStore.isAnonymous" class="bg-white dark:bg-gray-800 rounded-xl p-8 border border-secondary-200 dark:border-dark-700 shadow-sm">
          <div class="flex justify-between items-center mb-8 pb-4 border-b border-secondary-200 dark:border-dark-700">
            <h2 class="text-2xl font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
              <i class="fas fa-home"></i>
              我的聊天室
            </h2>
          </div>
          <div class="text-center py-12 text-secondary-700 dark:text-secondary-300">
            <div class="text-6xl mb-4 text-danger-500 opacity-60">
              <i class="fas fa-user-secret"></i>
            </div>
            <h3 class="text-2xl mb-2">匿名用户暂无房间</h3>
            <p class="opacity-80 mb-8">注册账户后即可创建和管理聊天室</p>
            <button class="flex items-center gap-2 px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300" @click="handleUserRegister">
              <i class="fas fa-user-plus"></i>
              <span>注册账户</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 手机端内容 -->
    <div class="lg:hidden pt-20 pb-20 min-h-screen w-full bg-secondary-50 dark:bg-gray-900 overflow-x-hidden">
      <!-- 房间列表 -->
      <div 
        class="p-3 relative min-h-50 will-change-transform touch-pan-y" 
        ref="mobileRoomsContentRef"
        @touchstart="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 下拉刷新指示器 -->
        <div 
          class="absolute top-[-50px] left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg flex items-center justify-center pointer-events-none transition-all duration-200 will-change-transform"
          :class="{ 
            'opacity-100': currentY - startY > 0,
            'opacity-0': currentY - startY <= 0
          }"
          :style="{ 
            opacity: Math.min((currentY - startY) / refreshThreshold, 1)
          }"
        >
          <i 
            class="fas fa-sync-alt text-xl text-primary-600 dark:text-primary-400 transition-transform duration-200"
            :style="{ 
              transform: isRefreshing ? 'rotate(360deg)' : `rotate(${((currentY - startY) / refreshThreshold) * 180}deg)`
            }"
          ></i>
        </div>
        
        <!-- 下拉刷新文字提示 -->
        <div 
          class="absolute top-[-5px] left-1/2 transform -translate-x-1/2 text-sm text-secondary-600 dark:text-secondary-400 font-medium text-center pointer-events-none transition-opacity duration-200 will-change-opacity whitespace-nowrap"
          :class="{ 
            'opacity-100': currentY - startY > 0,
            'opacity-0': currentY - startY <= 0
          }"
          :style="{ 
            opacity: Math.min((currentY - startY) / refreshThreshold, 1)
          }"
        >
          <span v-if="!isRefreshing && currentY - startY > 0">
            {{ currentY - startY > refreshThreshold ? '松开刷新' : '继续下拉' }}
          </span>
          <span v-else-if="isRefreshing">正在刷新...</span>
        </div>

        <div v-if="authStore.isUser && chatroomStore.isLoading && (!chatroomStore.userChatrooms || chatroomStore.userChatrooms.length === 0)" class="py-12 px-4 text-center text-secondary-600 dark:text-secondary-400">
          <div class="text-3xl mb-4 text-primary-600 dark:text-primary-400">
            <i class="fas fa-spinner animate-spin"></i>
          </div>
          <p>正在加载聊天室...</p>
        </div>

        <div v-else-if="authStore.isAnonymous" class="py-12 px-4 text-center text-secondary-600 dark:text-secondary-400">
          <div class="text-6xl mb-4 text-danger-500 opacity-60">
            <i class="fas fa-user-secret"></i>
          </div>
          <h3 class="text-xl mb-2 text-secondary-900 dark:text-secondary-100 font-semibold">匿名用户暂无房间</h3>
          <p class="text-sm text-secondary-600 dark:text-secondary-400">注册账户后即可创建和管理聊天室</p>
        </div>

        <div v-else-if="sortedUserChatrooms.length === 0" class="py-12 px-4 text-center text-secondary-600 dark:text-secondary-400">
          <div class="text-6xl mb-4 text-primary-600 dark:text-primary-400 opacity-60">
            <i class="fas fa-comments"></i>
          </div>
          <h3 class="text-xl mb-2 text-secondary-900 dark:text-secondary-100 font-semibold">还没有聊天室</h3>
          <p class="text-sm text-secondary-600 dark:text-secondary-400">点击下方加号创建或加入聊天室</p>
        </div>

        <div v-else class="space-y-2">
          <div 
            v-for="chatroom in sortedUserChatrooms" 
            :key="chatroom.roomId"
            class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-secondary-200 dark:border-dark-700 cursor-pointer transition-all duration-300 active:scale-98 active:bg-secondary-50 dark:active:bg-secondary-700"
            @click="joinMyChatroom(chatroom)"
          >
            <div class="flex items-center gap-3">
              <!-- 房间图标和状态 -->
              <div class="relative">
                <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <i class="fas fa-comments text-primary-600 dark:text-primary-400"></i>
                </div>
                <div v-if="chatroom.joinType === 'created'" class="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-warning-400 to-warning-500 rounded-full flex items-center justify-center">
                  <i class="fas fa-crown text-xs text-secondary-900"></i>
                </div>
              </div>

              <!-- 房间信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-secondary-900 dark:text-secondary-100 truncate">
                    {{ chatroom.name }} ({{ chatroom.roomId }})
                  </h3>
                  <span v-if="chatroom.joinType === 'created'" class="text-xs px-1.5 py-0.5 bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 rounded-full">
                    房主
                  </span>
                </div>
                <div class="flex items-center gap-3 text-xs text-secondary-500 dark:text-secondary-400">
                  <span class="flex items-center gap-1">
                    <i class="fas fa-hashtag"></i>
                    {{ chatroom.roomId }}
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="fas fa-users"></i>
                    {{ chatroom.userCount }}
                  </span>
                  <span v-if="chatroom.lastMessage" class="flex items-center gap-1">
                    <i class="fas fa-clock"></i>
                    {{ formatTime(chatroom.lastMessage.createdAt) }}
                  </span>
                </div>
              </div>

              <!-- 退出按钮（仅加入的房间） -->
              <button 
                v-if="chatroom.joinType === 'joined'"
                class="w-8 h-8 bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400 border-none rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-95"
                @click.stop="leaveChatroom(chatroom)"
              >
                <i class="fas fa-sign-out-alt text-sm"></i>
              </button>
            </div>

            <!-- 最后消息预览 -->
            <div v-if="chatroom.lastMessage" class="mt-2 pt-2 border-t border-secondary-100 dark:border-secondary-700">
              <div class="flex items-center gap-2">
                <span class="flex-1 text-xs text-secondary-600 dark:text-secondary-400 truncate">{{ formatMessageContent(chatroom.lastMessage) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useChatroomStore } from '@/stores/chatroom'
import { io } from 'socket.io-client'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const chatroomStore = useChatroomStore()

// WebSocket 连接
const socket = ref(null)

// 合并并排序的聊天室列表（按最后消息时间排序，新的在上）
const sortedUserChatrooms = computed(() => {
  if (!chatroomStore.userChatrooms) return []
  
  return [...chatroomStore.userChatrooms].sort((a, b) => {
    // 优先按最后消息时间排序
    const aTime = a.lastMessage?.createdAt || a.createdAt
    const bTime = b.lastMessage?.createdAt || b.createdAt
    
    if (aTime && bTime) {
      return new Date(bTime) - new Date(aTime)
    }
    
    // 如果没有最后消息，按创建时间排序
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt)
    }
    
    return 0
  })
})

// 下拉刷新相关变量
const isRefreshing = ref(false)
const startY = ref(0)
const currentY = ref(0)
const maxPullDistance = 100 // 最大下拉距离
const refreshThreshold = 100 // 触发刷新的阈值
const mobileRoomsContentRef = ref(null)

// 连接WebSocket
const connectWebSocket = () => {
  if (!authStore.token) {
    console.error('无法连接WebSocket：缺少认证令牌')
    return
  }
  
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
  
  socket.value = io(socketUrl, {
    auth: {
      token: authStore.token
    },
    transports: ['websocket', 'polling']
  })
  
  // 连接成功
  socket.value.on('connect', () => {
    console.log('RoomsPage WebSocket连接成功')
  })
  
  // 房间名称更新事件
  socket.value.on('room-name-updated', (data) => {
    console.log('房间名称已更新:', data)
    
    // 使用store的实时更新方法
    chatroomStore.updateRoomNameRealtime(data.roomId, data.newName)
    
    // 显示通知
    if (data.updatedBy !== authStore.user?.uid) {
      notificationStore.info(`房间名称已更改为: ${data.newName}`)
    }
  })
  
  // 连接错误
  socket.value.on('connect_error', (error) => {
    console.error('RoomsPage WebSocket连接失败:', error)
  })
}

// 断开WebSocket连接
const disconnectWebSocket = () => {
  if (socket.value) {
    socket.value.disconnect()
    socket.value = null
  }
}

// 方法
const handleUserRegister = () => {
  router.push({ name: 'Home', query: { mode: 'register' } })
}

const goToRooms = () => {
  router.push({ name: 'RoomSelect' })
}

const refreshChatrooms = async () => {
  if (!authStore.isUser) {
    notificationStore.warning('请先登录注册用户账户')
    return
  }
  
  try {
    await chatroomStore.fetchUserChatrooms()
  } catch (error) {
    console.error('刷新聊天室列表失败:', error)
    notificationStore.error('刷新失败，请稍后重试')
  }
}

const joinMyChatroom = async (chatroom) => {
  try {
    // 作为房主加入，无需密码
    await chatroomStore.joinChatroom(chatroom.roomId)
    router.push(`/chat/${chatroom.roomId}`)
  } catch (error) {
    notificationStore.error(`加入聊天室失败：${error.message}`)
  }
}

// 退出聊天室
const leaveChatroom = async (chatroom) => {
  try {
    // 显示确认对话框
    if (!confirm(`确定要退出聊天室"${chatroom.name}"吗？退出后您将无法再看到该聊天室的消息。`)) {
      return
    }

    // 调用退出聊天室API
    const response = await axios.post(`/api/chatrooms/${chatroom.roomId}/leave`)
    
    if (response.data.success) {
      // 从本地列表中移除
      const index = chatroomStore.userChatrooms.findIndex(c => c.roomId === chatroom.roomId)
      if (index !== -1) {
        chatroomStore.userChatrooms.splice(index, 1)
      }
      
      notificationStore.success(`已退出聊天室：${chatroom.name}`)
    }
  } catch (error) {
    console.error('退出聊天室失败:', error)
    notificationStore.error(`退出聊天室失败：${error.response?.data?.message || error.message}`)
  }
}

// 格式化工具函数
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatMessageContent = (message) => {
  if (!message) return ''
  
  if (message.messageType === 'system') {
    return `[系统] ${message.content}`
  }
  
  // 限制消息长度
  const maxLength = 50
  if (message.content.length > maxLength) {
    return message.content.substring(0, maxLength) + '...'
  }
  
  return message.content
}

// 下拉刷新相关方法
const handleTouchStart = (e) => {
  if (mobileRoomsContentRef.value.scrollTop > 0) return
  startY.value = e.touches[0].clientY
  currentY.value = startY.value
}

const handleTouchMove = (e) => {
  if (mobileRoomsContentRef.value.scrollTop > 0) return
  
  currentY.value = e.touches[0].clientY
  const pullDistance = currentY.value - startY.value
  
  if (pullDistance > 0 && !isRefreshing.value) {
    e.preventDefault()
    const distance = Math.min(pullDistance * 0.5, maxPullDistance)
    mobileRoomsContentRef.value.style.transform = `translateY(${distance}px)`
  }
}

const handleTouchEnd = async () => {
  if (mobileRoomsContentRef.value.scrollTop > 0) return
  
  const pullDistance = currentY.value - startY.value
  
  if (pullDistance > refreshThreshold && !isRefreshing.value) {
    // 触发刷新
    isRefreshing.value = true
    mobileRoomsContentRef.value.style.transform = `translateY(${refreshThreshold}px)`
    
    try {
      await refreshChatrooms()
    } finally {
      // 重置状态
      isRefreshing.value = false
      mobileRoomsContentRef.value.style.transition = 'transform 0.3s ease'
      mobileRoomsContentRef.value.style.transform = 'translateY(0)'
      setTimeout(() => {
        mobileRoomsContentRef.value.style.transition = ''
      }, 300)
    }
  } else {
    // 未达到刷新阈值，回弹
    mobileRoomsContentRef.value.style.transition = 'transform 0.3s ease'
    mobileRoomsContentRef.value.style.transform = 'translateY(0)'
    setTimeout(() => {
      mobileRoomsContentRef.value.style.transition = ''
    }, 300)
  }
  
  startY.value = 0
  currentY.value = 0
}

// 生命周期
onMounted(async () => {
  // 等待认证状态初始化完成
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }
  
  // 如果是注册用户，加载聊天室列表
  if (authStore.isUser) {
    await chatroomStore.fetchUserChatrooms()
  }
  
  // 连接WebSocket
  connectWebSocket()
})

onUnmounted(() => {
  disconnectWebSocket()
})
</script> 