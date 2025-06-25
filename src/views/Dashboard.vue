<!-- 用户仪表板页面 -->
<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <header class="top-navbar" v-if="authStore.isAuthenticated">
      <div class="navbar-content">
        <!-- Logo -->
        <div class="navbar-logo">
          <i class="fas fa-comments"></i>
          <span>ChatFlow</span>
        </div>

        <!-- 用户信息 -->
        <div class="user-info">
          <!-- 主题切换按钮 -->
          <div class="theme-toggle-wrapper">
            <ThemeToggle />
          </div>

          <div class="user-avatar" @click="toggleUserMenu">
            <img 
              :src="userAvatarUrl" 
              :alt="authStore.user.nickname"
              @error="handleAvatarError"
            >
            <div v-if="authStore.isAnonymous" class="anonymous-badge">
              <i class="fas fa-user-secret"></i>
            </div>
            <!-- 手机端菜单指示器 -->
            <div class="mobile-menu-indicator">
              <i class="fas fa-chevron-down" :class="{ 'rotate': showUserMenu }"></i>
            </div>
          </div>
          
          <div class="user-details">
            <div class="user-nickname">{{ authStore.user.nickname }}</div>
            <div class="user-type">
              <span v-if="authStore.isAnonymous" class="type-badge anonymous">
                <i class="fas fa-user-secret"></i>
                匿名用户
              </span>
              <span v-else class="type-badge registered">
                <i class="fas fa-user"></i>
                注册用户
              </span>
            </div>
          </div>

          <!-- 用户菜单 -->
          <div class="user-menu">
            <button 
              class="menu-toggle desktop-only"
              @click="toggleUserMenu"
              :class="{ active: showUserMenu }"
            >
              <i class="fas fa-chevron-down"></i>
            </button>
            
            <div class="menu-dropdown" v-show="showUserMenu">
              <div v-if="authStore.isUser" class="menu-item" @click="goToProfile">
                <i class="fas fa-user-edit"></i>
                <span>个人设置</span>
              </div>
              <div class="menu-item" @click="goToRooms">
                <i class="fas fa-comments"></i>
                <span>进入聊天室</span>
              </div>
              <div class="menu-divider"></div>
              <div class="menu-item logout" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>退出登录</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle decoration-circle-1"></div>
      <div class="decoration-circle decoration-circle-2"></div>
      <div class="decoration-circle decoration-circle-3"></div>
    </div>

    <!-- 主要内容 -->
    <div class="dashboard-content">
      <!-- 欢迎界面 -->
      <div class="welcome-section">
        <div class="welcome-message">
          <h1>欢迎回来，{{ authStore.user.nickname }}！</h1>
          <p v-if="authStore.isAnonymous" class="anonymous-notice">
            <i class="fas fa-info-circle"></i>
            您正在使用匿名模式，功能有限。建议注册账户获得完整体验。
          </p>
          <p v-else class="user-notice">
            <i class="fas fa-star"></i>
            您可以创建或加入聊天室，开始精彩的聊天体验。
          </p>
        </div>

        <div class="quick-actions">
          <button class="action-btn primary" @click="goToRooms">
            <i class="fas fa-comments"></i>
            <span>进入聊天室</span>
          </button>
          
          <button v-if="authStore.isUser" class="action-btn secondary" @click="goToProfile">
            <i class="fas fa-user-edit"></i>
            <span>个人设置</span>
          </button>
          
          <button v-if="authStore.isAnonymous" class="action-btn secondary" @click="handleUserRegister">
            <i class="fas fa-user-plus"></i>
            <span>注册账户</span>
          </button>
        </div>
      </div>

      <!-- 我的聊天室列表 (仅注册用户) -->
      <div v-if="authStore.isUser" class="my-chatrooms-section">
        <div class="section-header">
          <h2>
            <i class="fas fa-home"></i>
            我的聊天室
          </h2>
          <button class="refresh-btn" @click="refreshChatrooms" :disabled="chatroomStore.isLoading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': chatroomStore.isLoading }"></i>
          </button>
        </div>

        <div v-if="chatroomStore.isLoading && (!chatroomStore.userChatrooms || chatroomStore.userChatrooms.length === 0)" class="loading-state">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p>正在加载聊天室...</p>
        </div>

        <div v-else-if="!chatroomStore.userChatrooms || chatroomStore.userChatrooms.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-comments"></i>
          </div>
          <h3>还没有聊天室</h3>
          <p>创建您的第一个聊天室，开始与朋友们聊天吧！</p>
          <button class="action-btn primary" @click="goToRooms">
            <i class="fas fa-plus"></i>
            <span>创建聊天室</span>
          </button>
        </div>

        <div v-else>
          <!-- 我创建的聊天室 -->
          <div v-if="createdChatrooms.length > 0" class="chatrooms-grid">
            <div 
              v-for="chatroom in createdChatrooms" 
              :key="chatroom.roomId"
              class="chatroom-card"
              @click="joinMyChatroom(chatroom)"
            >
              <div class="chatroom-header">
                <div class="chatroom-info">
                  <h3 class="chatroom-name">{{ chatroom.name }}</h3>
                  <div class="chatroom-meta">
                    <span class="room-id">
                      <i class="fas fa-hashtag"></i>
                      {{ chatroom.roomId }}
                    </span>
                    <span class="user-count">
                      <i class="fas fa-users"></i>
                      {{ chatroom.userCount }} 成员
                    </span>
                  </div>
                </div>
                <div class="owner-badge">
                  <i class="fas fa-crown"></i>
                  <span>房主</span>
                </div>
              </div>

              <div class="chatroom-content">
                <div v-if="chatroom.lastMessage" class="last-message">
                  <div class="message-content">
                    <span class="message-text">{{ formatMessageContent(chatroom.lastMessage) }}</span>
                  </div>
                  <div class="message-time">
                    {{ formatTime(chatroom.lastMessage.createdAt) }}
                  </div>
                </div>
                <div v-else class="no-message">
                  <i class="fas fa-comment-slash"></i>
                  <span>暂无消息</span>
                </div>
              </div>

              <div class="chatroom-footer">
                <div class="created-time">
                  <i class="fas fa-calendar-alt"></i>
                  创建于 {{ formatDate(chatroom.createdAt) }}
                </div>
                <div class="join-indicator">
                  <i class="fas fa-sign-in-alt"></i>
                  <span>点击加入</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-comments"></i>
            </div>
            <h3>还没有创建聊天室</h3>
            <p>创建您的第一个聊天室，开始与朋友们聊天吧！</p>
            <button class="action-btn primary" @click="goToRooms">
              <i class="fas fa-plus"></i>
              <span>创建聊天室</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 已加入的聊天室列表 (仅注册用户) -->
      <div v-if="authStore.isUser && joinedChatrooms.length > 0" class="joined-chatrooms-section">
        <div class="section-header">
          <h2>
            <i class="fas fa-users"></i>
            已加入的聊天室
          </h2>
        </div>

        <div class="chatrooms-grid">
          <div 
            v-for="chatroom in joinedChatrooms" 
            :key="chatroom.roomId"
            class="chatroom-card joined-card"
          >
            <div class="chatroom-header">
              <div class="chatroom-info">
                <h3 class="chatroom-name">{{ chatroom.name }}</h3>
                <div class="chatroom-meta">
                  <span class="room-id">
                    <i class="fas fa-hashtag"></i>
                    {{ chatroom.roomId }}
                  </span>
                  <span class="user-count">
                    <i class="fas fa-users"></i>
                    {{ chatroom.userCount }} 成员
                  </span>
                </div>
              </div>
              <div class="member-badge">
                <i class="fas fa-user"></i>
                <span>成员</span>
              </div>
            </div>

            <div class="chatroom-content">
              <div v-if="chatroom.lastMessage" class="last-message">
                <div class="message-content">
                  <span class="message-text">{{ formatMessageContent(chatroom.lastMessage) }}</span>
                </div>
                <div class="message-time">
                  {{ formatTime(chatroom.lastMessage.createdAt) }}
                </div>
              </div>
              <div v-else class="no-message">
                <i class="fas fa-comment-slash"></i>
                <span>暂无消息</span>
              </div>
            </div>

            <div class="chatroom-footer">
              <div class="joined-time">
                <i class="fas fa-calendar-plus"></i>
                加入于 {{ formatDate(chatroom.createdAt) }}
              </div>
              <div class="chatroom-actions">
                <button 
                  class="action-btn small primary" 
                  @click="joinMyChatroom(chatroom)"
                >
                  <i class="fas fa-sign-in-alt"></i>
                  <span>进入</span>
                </button>
                <button 
                  class="action-btn small danger" 
                  @click="leaveChatroom(chatroom)"
                >
                  <i class="fas fa-sign-out-alt"></i>
                  <span>退出</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <footer class="dashboard-footer">
      <p>&copy; 2025 ChatFlow. 基于 Vue3 + Node.js 构建</p>
      <div class="footer-links">
        <router-link to="/user-agreement" class="footer-link">用户协议</router-link>
        <span class="footer-separator">|</span>
        <router-link to="/privacy-policy" class="footer-link">隐私政策</router-link>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useChatroomStore } from '@/stores/chatroom'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const chatroomStore = useChatroomStore()

// 响应式数据
const showUserMenu = ref(false)

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
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const handleAvatarError = (event) => {
  // 头像加载失败时使用默认头像
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  event.target.src = `${baseUrl}/avatars/default`
}

const handleLogout = async () => {
  try {
    authStore.logout()
    notificationStore.success('已退出登录')
    closeUserMenu()
    router.push({ name: 'Home' })
  } catch (error) {
    console.error('退出登录失败:', error)
    notificationStore.error('退出登录失败')
  }
}

const goToProfile = () => {
  router.push({ name: 'Profile' })
  closeUserMenu()
}

const goToRooms = () => {
  router.push({ name: 'RoomSelect' })
  closeUserMenu()
}

// 用户注册
const handleUserRegister = () => {
  router.push({ name: 'Home', query: { mode: 'register' } })
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  const userMenu = event.target.closest('.user-menu')
  const userAvatar = event.target.closest('.user-avatar')
  if (!userMenu && !userAvatar && showUserMenu.value) {
    closeUserMenu()
  }
}

// 聊天室相关方法
const refreshChatrooms = async () => {
  if (!authStore.isUser) {
    notificationStore.warning('请先登录注册用户账户')
    return
  }
  
  try {
    await chatroomStore.fetchUserChatrooms()
    notificationStore.success('聊天室列表已刷新')
  } catch (error) {
    console.error('刷新聊天室列表失败:', error)
    notificationStore.error('刷新失败，请稍后重试')
  }
}

const joinMyChatroom = async (chatroom) => {
  try {
    // 作为房主加入，无需密码
    await chatroomStore.joinChatroom(chatroom.roomId)
    notificationStore.success(`成功加入聊天室：${chatroom.name}`)
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

// 加载用户聊天室列表
const loadUserChatrooms = async () => {
  if (authStore.isUser) {
    try {
      await chatroomStore.fetchUserChatrooms()
    } catch (error) {
      console.error('加载聊天室列表失败:', error)
      notificationStore.error('加载聊天室列表失败，请刷新页面重试')
    }
  }
}

// 生命周期
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  // 检查是否已登录
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Home' })
    return
  }
  
  // 等待认证状态初始化完成（如果还未完成）
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }
  
  // 认证初始化完成后，加载聊天室数据
  if (authStore.isUser) {
    await loadUserChatrooms()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(rgba(26, 26, 46, 0.3), rgba(22, 33, 62, 0.4)),
              url('/bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dark .dashboard-container {
  background: linear-gradient(rgba(26, 26, 46, 0.5), rgba(22, 33, 62, 0.6)),
              url('/bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 顶部导航栏样式 */
.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 10;
  padding: 0 20px;
}

.dark .top-navbar {
  background: rgba(31, 41, 55, 0.85);
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.navbar-logo i {
  font-size: 28px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.user-avatar {
  position: relative;
  width: 45px;
  height: 45px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #667eea;
}

.anonymous-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: #ff6b6b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  border: 2px solid white;
}

/* 手机端菜单指示器 */
.mobile-menu-indicator {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: rgba(102, 126, 234);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 8px;
  border: 2px solid white;
  transition: transform 0.3s ease;
}

.mobile-menu-indicator i.rotate {
  transform: rotate(180deg);
}

.dark .mobile-menu-indicator {
  background: rgba(255, 255, 255);
  color: #1a1a2e;
  border: 2px solid #374151;
}

/* 桌面端隐藏手机端指示器 */
@media (min-width: 769px) {
  .mobile-menu-indicator {
    display: none;
  }
}

/* 手机端隐藏桌面端菜单按钮 */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-nickname {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
}

.dark .user-nickname {
  color: #f3f4f6;
}

.type-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.type-badge.anonymous {
  background: #ffe8e8;
  color: #ff6b6b;
}

.type-badge.registered {
  background: #e8f5e8;
  color: #4caf50;
}

.user-menu {
  position: relative;
}

.menu-toggle {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: #667eea;
  transition: all 0.3s ease;
}

.menu-toggle:hover,
.menu-toggle.active {
  background: rgba(102, 126, 234, 0.1);
  transform: rotate(180deg);
}

.dark .menu-toggle:hover,
.dark .menu-toggle.active {
  background: #f0f0f0;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .menu-dropdown {
  background: #374151;
  border: 1px solid rgba(75, 85, 99, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #2c3e50;
}

.menu-item:hover {
  background: #f8f9fa;
}

.dark .menu-item {
  color: #e5e7eb;
}

.dark .menu-item:hover {
  background: #4b5563;
}

.menu-item.logout {
  color: #e74c3c;
}

.menu-item.logout:hover {
  background: #ffeaea;
}

.menu-divider {
  height: 1px;
  background: #eee;
  margin: 4px 0;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.decoration-circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: -100px;
  animation-delay: 0s;
}

.decoration-circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: -75px;
  animation-delay: 2s;
}

.decoration-circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 主要内容样式 */
.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 110px 20px 40px;
  position: relative;
  z-index: 1;
}

.welcome-section {
  text-align: center;
  max-width: 600px;
  margin-bottom: 3rem;
}

.welcome-message h1 {
  font-size: 36px;
  color: white;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.anonymous-notice,
.user-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .anonymous-notice,
.dark .user-notice {
  background: rgba(31, 41, 55, 0.4);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.action-btn.primary {
  background: white;
  color: #667eea;
}

.action-btn.primary:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* 我的聊天室样式 */
.my-chatrooms-section {
  margin-top: 3rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 100%;
  max-width: 1200px;
}

.dark .my-chatrooms-section {
  background: rgba(31, 41, 55, 0.4);
  border: 1px solid rgba(75, 85, 99, 0.4);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark .section-header h2 {
  color: white;
}

.refresh-btn {
  background: rgba(102, 126, 234, 0.8);
  border: none;
  border-radius: 10px;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.dark .refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 1);
  transform: translateY(-2px);
}

.dark .refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #2c3e50;
}

.dark .loading-state, .dark .empty-state {
  color: white;
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.dark .loading-spinner {
  color: white;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
  color: #667eea;
}

.dark .empty-icon {
  color: rgba(255, 255, 255, 0.6);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  opacity: 0.8;
  margin-bottom: 2rem;
}

.chatrooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.chatroom-card {
  background: rgba(255, 255, 255, 0.2);
  /* backdrop-filter: blur(15px); */
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.chatroom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

.dark .chatroom-card {
  background: rgba(31, 41, 55, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.4);
}

.dark .chatroom-card:hover {
  background: rgba(31, 41, 55, 0.4);
  border-color: rgba(75, 85, 99, 0.5);
}

.chatroom-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.chatroom-info {
  flex: 1;
}

.chatroom-name {
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.dark .chatroom-name {
  color: white;
}

.chatroom-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.room-id, .user-count {
  color: rgba(44, 62, 80, 0.7);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.dark .room-id, .dark .user-count {
  color: rgba(255, 255, 255, 0.8);
}

.owner-badge {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #1a202c;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
}

.chatroom-content {
  margin-bottom: 1rem;
  min-height: 3rem;
}

.last-message {
  background: rgba(102, 126, 234, 0.1);
  /* backdrop-filter: blur(10px); */
  border-radius: 10px;
  padding: 0.8rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.dark .last-message {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.message-content {
  margin-bottom: 0.5rem;
}

.message-text {
  color: #2c3e50;
  font-size: 0.9rem;
  line-height: 1.4;
}

.dark .message-text {
  color: white;
}

.message-time {
  color: rgba(44, 62, 80, 0.6);
  font-size: 0.75rem;
}

.dark .message-time {
  color: rgba(255, 255, 255, 0.6);
}

.no-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgba(44, 62, 80, 0.5);
  font-size: 0.9rem;
  height: 3rem;
}

.dark .no-message {
  color: rgba(255, 255, 255, 0.5);
}

.chatroom-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
}

.dark .chatroom-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.created-time {
  color: rgba(44, 62, 80, 0.7);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.dark .created-time {
  color: rgba(255, 255, 255, 0.7);
}

.join-indicator {
  color: rgba(44, 62, 80, 0.8);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dark .join-indicator {
  color: rgba(255, 255, 255, 0.8);
}

.chatroom-card:hover .join-indicator {
  opacity: 1;
}

/* 已加入的聊天室样式 */
.joined-chatrooms-section {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  width: 100%;
  max-width: 1200px;
}

.dark .joined-chatrooms-section {
  background: rgba(31, 41, 55, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.joined-card {
  border-left: 4px solid #4CAF50;
}

.member-badge {
  background: linear-gradient(45deg, #4CAF50, #66BB6A);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
}

.joined-time {
  color: rgba(44, 62, 80, 0.7);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.dark .joined-time {
  color: rgba(255, 255, 255, 0.7);
}

.chatroom-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn.small {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn.small.primary {
  background: #2196F3;
  color: white;
}

.action-btn.small.primary:hover {
  background: #1976D2;
  transform: translateY(-1px);
}

.action-btn.small.danger {
  background: #f44336;
  color: white;
}

.action-btn.small.danger:hover {
  background: #d32f2f;
  transform: translateY(-1px);
}

.dashboard-footer {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  padding: 20px;
  font-size: 14px;
}

.dark .dashboard-footer {
  background: rgba(31, 41, 55, 0.3);
  border-top: 1px solid rgba(75, 85, 99, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.dashboard-footer p {
  margin: 0;
}

.footer-links {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: white;
  text-decoration: underline;
}

.footer-separator {
  color: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 移动端移除背景图片，使用主题色 */
  .dashboard-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-attachment: scroll;
  }

  .dark .dashboard-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    background-attachment: scroll;
  }

  /* 移动端导航栏 */
  .top-navbar {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .dark .top-navbar {
    background: rgba(31, 41, 55, 0.95);
    border-bottom: 1px solid rgba(75, 85, 99, 0.2);
  }

  .menu-dropdown {
    position: fixed;
    top: 65px;
    right: 65px;
  }

  .navbar-content {
    padding: 0 15px;
  }
  
  .user-info {
    flex-direction: row-reverse;
    gap: 10px;
  }
  
  .user-details {
    display: none;
  }
  
  .theme-toggle-wrapper {
    order: 1;
  }
  
  .user-avatar {
    order: 2;
  }
  
  .user-menu {
    order: 3;
  }
  
  .welcome-message h1 {
    font-size: 28px;
    color: white;
  }

  /* 移动端通知区域 */
  .anonymous-notice,
  .user-notice {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: none;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #2c3e50;
  }

  .dark .anonymous-notice,
  .dark .user-notice {
    background: rgba(31, 41, 55, 0.9);
    border: 1px solid rgba(75, 85, 99, 0.3);
    color: #f3f4f6;
  }

  /* 移动端聊天室区域 */
  .my-chatrooms-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: none;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .dark .my-chatrooms-section {
    background: rgba(31, 41, 55, 0.9);
    border: 1px solid rgba(75, 85, 99, 0.3);
  }

  .joined-chatrooms-section {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: none;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .dark .joined-chatrooms-section {
    background: rgba(31, 41, 55, 0.9);
    border: 1px solid rgba(75, 85, 99, 0.3);
  }

  .chatrooms-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  /* 移动端聊天室卡片 */
  .chatroom-card {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: none;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .dark .chatroom-card {
    background: rgba(31, 41, 55, 0.95);
    border: 1px solid rgba(75, 85, 99, 0.4);
  }

  .chatroom-card:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
  }

  .dark .chatroom-card:hover {
    background: rgba(31, 41, 55, 1);
  }

  /* 移动端消息区域 */
  .last-message {
    background: rgba(102, 126, 234, 0.15);
    backdrop-filter: none;
    border: 1px solid rgba(102, 126, 234, 0.3);
  }

  .dark .last-message {
    background: rgba(31, 41, 55, 0.8);
    border: 1px solid rgba(75, 85, 99, 0.3);
  }

  /* 移动端页脚 */
  .dashboard-footer {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: none;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    color: #2c3e50;
  }

  .dark .dashboard-footer {
    background: rgba(31, 41, 55, 0.9);
    border-top: 1px solid rgba(75, 85, 99, 0.3);
    color: #f3f4f6;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .section-header h2 {
    font-size: 1.3rem;
    color: #2c3e50 !important;
  }

  .dark .section-header h2 {
    color: #f3f4f6 !important;
  }

  /* 移动端页脚链接 */
  .footer-link {
    color: #667eea;
  }

  .dark .footer-link {
    color: #60a5fa;
  }

  .footer-separator {
    color: #7f8c8d;
  }

  .dark .footer-separator {
    color: #94a3b8;
  }
}
</style> 