<!-- 首页组件 -->
<template>
  <div class="home-container">
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
          <div class="user-avatar">
            <img 
              :src="userAvatarUrl" 
              :alt="authStore.user.nickname"
              @error="handleAvatarError"
            >
            <div v-if="authStore.isAnonymous" class="anonymous-badge">
              <i class="fas fa-user-secret"></i>
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

                  <!-- 主题切换按钮 -->
        <div class="theme-toggle-wrapper">
          <ThemeToggle />
        </div>

          <!-- 用户菜单 -->
          <div class="user-menu">
            <button 
              class="menu-toggle"
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
    <div class="home-content" :class="{ 'with-navbar': authStore.isAuthenticated }">
      <!-- 已登录用户的欢迎界面 -->
      <div v-if="authStore.isAuthenticated" class="authenticated-welcome">
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

      <!-- 未登录用户的选择界面 -->
      <div v-else class="guest-welcome">
        <!-- 主题切换按钮（未登录状态） -->
        <div class="guest-theme-toggle">
          <ThemeToggle :show-text="true" />
        </div>

        <!-- Logo和欢迎信息 -->
        <div class="welcome-section">
          <div class="logo-container">
            <i class="fas fa-comments logo-icon"></i>
            <h1 class="logo-text">ChatFlow</h1>
          </div>
          <p class="welcome-text">
            欢迎来到 ChatFlow，现代化实时聊天应用
          </p>
        </div>

        <!-- 功能选择卡片 -->
        <div class="options-section">
          <div class="option-card" @click="handleAnonymousJoin">
            <div class="option-icon">
              <i class="fas fa-user-secret"></i>
            </div>
            <h3 class="option-title">匿名加入</h3>
            <p class="option-description">
              无需注册，快速体验 ChatFlow 功能
            </p>
            <div class="option-badge">
              <i class="fas fa-clock"></i>
              <span>10分钟后可发言</span>
            </div>
          </div>

          <div class="option-card" @click="handleUserLogin">
            <div class="option-icon">
              <i class="fas fa-user"></i>
            </div>
            <h3 class="option-title">用户登录</h3>
            <p class="option-description">
              已有账户？立即登录享受完整功能
            </p>
            <div class="option-badge">
              <i class="fas fa-star"></i>
              <span>完整功能</span>
            </div>
          </div>

          <div class="option-card" @click="handleUserRegister">
            <div class="option-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <h3 class="option-title">用户注册</h3>
            <p class="option-description">
              创建新账户，定制您的专属聊天体验
            </p>
            <div class="option-badge">
              <i class="fas fa-gift"></i>
              <span>免费注册</span>
            </div>
          </div>
        </div>

        <!-- 特性介绍 -->
        <div class="features-section">
          <h2 class="features-title">产品特性</h2>
          <div class="features-grid">
            <div class="feature-item">
              <i class="fas fa-bolt feature-icon"></i>
              <h4>实时通信</h4>
              <p>消息实时推送，沟通零延迟</p>
            </div>
            <div class="feature-item">
              <i class="fas fa-shield-alt feature-icon"></i>
              <h4>安全可靠</h4>
              <p>多重安全保护，信息传输加密</p>
            </div>
            <div class="feature-item">
              <i class="fas fa-users feature-icon"></i>
              <h4>多用户模式</h4>
              <p>支持匿名、注册用户和管理员</p>
            </div>
            <div class="feature-item">
              <i class="fas fa-mobile-alt feature-icon"></i>
              <h4>响应式设计</h4>
              <p>完美适配各种设备和屏幕</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <footer class="home-footer">
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

// 匿名加入
const handleAnonymousJoin = () => {
  router.push({ 
    name: 'RoomSelect', 
    query: { mode: 'anonymous' } 
  })
}

// 用户登录
const handleUserLogin = () => {
  router.push({ name: 'Login' })
}

// 用户注册
const handleUserRegister = () => {
  router.push({ name: 'Register' })
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  const userMenu = event.target.closest('.user-menu')
  if (!userMenu && showUserMenu.value) {
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
  console.log('loadUserChatrooms 被调用')
  console.log('当前认证状态:', {
    isAuthenticated: authStore.isAuthenticated,
    isUser: authStore.isUser,
    isAnonymous: authStore.isAnonymous,
    user: authStore.user
  })
  
  if (authStore.isUser) {
    console.log('开始加载用户聊天室列表...')
    try {
      await chatroomStore.fetchUserChatrooms()
      console.log('聊天室列表加载成功:', chatroomStore.userChatrooms)
    } catch (error) {
      console.error('加载聊天室列表失败:', error)
      // 显示错误提示
      notificationStore.error('加载聊天室列表失败，请刷新页面重试')
    }
  } else {
    console.log('非注册用户，跳过聊天室列表加载')
    console.log('用户类型:', authStore.user?.type)
  }
}

// 监听认证状态变化
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated, oldValue) => {
    console.log('认证状态变化:', { isAuthenticated, oldValue, isUser: authStore.isUser })
    
    if (isAuthenticated && authStore.isUser && !oldValue) {
      console.log('用户刚登录，准备加载聊天室列表')
      // 用户刚登录时，延迟加载聊天室列表确保DOM已更新
      await nextTick()
      await loadUserChatrooms()
    } else if (!isAuthenticated && oldValue) {
      console.log('用户退出登录，清空聊天室列表')
      // 用户退出登录时，清空聊天室列表
      if (chatroomStore.userChatrooms) {
        chatroomStore.userChatrooms.length = 0
      }
    }
  }
)

// 监听用户类型变化（从匿名切换到注册用户）
watch(
  () => authStore.isUser,
  async (isUser, oldValue) => {
    if (isUser && !oldValue) {
      await nextTick()
      await loadUserChatrooms()
    }
  }
)

// 监听路由变化，处理从登录页面返回的情况
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    // 如果是从登录或注册页面返回到首页，且用户已登录，刷新数据
    if (newPath === '/' && (oldPath?.includes('/login') || oldPath?.includes('/register'))) {
      if (authStore.isUser) {
        console.log('从登录页面返回，刷新聊天室数据')
        await nextTick()
        await loadUserChatrooms()
      }
    }
  }
)

// 生命周期
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  // 等待认证状态初始化完成（如果还未完成）
  if (!authStore.isInitialized) {
    console.log('等待认证状态初始化...')
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
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dark .home-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

/* 顶部导航栏样式 */
.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10;
  padding: 0 20px;
}

.dark .top-navbar {
  background: rgba(31, 41, 55, 0.95);
  border-bottom: 1px solid rgba(75, 85, 99, 0.2);
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
  background: #f0f0f0;
  transform: rotate(180deg);
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

/* 主要内容样式 */
.home-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
}

.home-content.with-navbar {
  padding-top: 110px; /* 为顶部导航栏留出空间 */
}

/* 已登录用户界面 */
.authenticated-welcome {
  text-align: center;
  max-width: 600px;
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
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

/* 未登录用户界面 */
.guest-welcome {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2rem;
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

.welcome-section {
  text-align: center;
  margin-bottom: 60px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 60px;
  color: white;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.logo-text {
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.welcome-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  max-width: 500px;
  margin: 0 auto;
}

.options-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 80px;
  max-width: 1000px;
  width: 100%;
}

.option-card {
  background: white;
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.dark .option-card {
  background: #374151;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.option-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.option-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
}

.option-card:hover::before {
  transform: scaleX(1);
}

.option-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  transition: transform 0.3s ease;
}

.option-card:hover .option-icon {
  transform: scale(1.1);
}

.option-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
}

.dark .option-title {
  color: #f3f4f6;
}

.option-description {
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 20px;
  line-height: 1.5;
}

.dark .option-description {
  color: #d1d5db;
}

.option-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8f9fa;
  color: #667eea;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.features-section {
  text-align: center;
  max-width: 800px;
  width: 100%;
}

.features-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 40px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 30px;
}

.feature-item {
  text-align: center;
  color: white;
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.feature-item h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.feature-item p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin: 0;
}

.home-footer {
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  padding: 20px;
  font-size: 14px;
}

.dark .home-footer {
  background: rgba(0, 0, 0, 0.4);
  color: rgba(255, 255, 255, 0.9);
}

.home-footer p {
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
  .navbar-content {
    padding: 0 15px;
  }
  
  .user-details {
    display: none;
  }
  
  .logo-text {
    font-size: 36px;
  }
  
  .logo-icon {
    font-size: 48px;
  }
  
  .options-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

/* 我的聊天室样式 */
.my-chatrooms-section {
  margin-top: 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .my-chatrooms-section {
  background: rgba(17, 24, 39, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 10px;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: white;
}

.dark .loading-state, .dark .empty-state {
  color: #f1f5f9;
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: white;
}

.dark .loading-spinner {
  color: #f1f5f9;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
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
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.chatroom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.2);
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
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.chatroom-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.room-id, .user-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.8rem;
}

.message-content {
  margin-bottom: 0.5rem;
}

.message-text {
  color: white;
  font-size: 0.9rem;
  line-height: 1.4;
}

.message-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.no-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  height: 3rem;
}

.chatroom-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.created-time {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.join-indicator {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chatroom-card:hover .join-indicator {
  opacity: 1;
}

/* 已加入的聊天室样式 */
.joined-chatrooms-section {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .joined-chatrooms-section {
  background: rgba(17, 24, 39, 0.2);
  border: 1px solid rgba(75, 85, 99, 0.2);
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
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
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

@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .home-content.with-navbar {
    padding-top: 90px;
  }
  
  .welcome-message h1 {
    font-size: 28px;
  }

  .my-chatrooms-section {
    margin-top: 2rem;
    padding: 1.5rem;
  }

  .chatrooms-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .chatroom-card {
    padding: 1rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .section-header h2 {
    font-size: 1.3rem;
  }
}
</style> 