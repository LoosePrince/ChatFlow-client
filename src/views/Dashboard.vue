<!-- 用户仪表板页面 -->
<template>
  <div class="dashboard-container">
    <!-- 桌面端顶部导航栏 -->
    <header class="top-navbar desktop-only" v-if="authStore.isAuthenticated">
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

    <!-- 手机端顶部头部（简化版） -->
    <header class="mobile-header mobile-only">
      <div class="mobile-header-content">
        <div class="app-logo">
          <i class="fas fa-comments"></i>
          <span>ChatFlow</span>
        </div>
        <div class="theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <div class="dashboard-content">
      <!-- 桌面端内容 -->
      <div class="desktop-content desktop-only">
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

      <!-- 手机端内容 -->
      <div class="mobile-content mobile-only">
        <!-- 房间标签页 -->
        <div v-if="activeTab === 'rooms'" class="rooms-tab">
          <!-- 房间类型切换 -->
          <div class="room-type-tabs">
            <button 
              class="room-type-btn"
              :class="{ active: activeRoomType === 'created' }"
              @click="activeRoomType = 'created'"
            >
              <i class="fas fa-crown"></i>
              <span>我的房间</span>
            </button>
            <button 
              class="room-type-btn"
              :class="{ active: activeRoomType === 'joined' }"
              @click="activeRoomType = 'joined'"
            >
              <i class="fas fa-users"></i>
              <span>已加入</span>
            </button>
          </div>

          <!-- 房间列表 -->
          <div 
            class="mobile-rooms-content" 
            ref="mobileRoomsContentRef"
            @touchstart="handleTouchStart"
            @touchmove.prevent="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <!-- 下拉刷新指示器 -->
            <div 
              class="pull-to-refresh-indicator"
              :class="{ 
                'is-pulling': currentY - startY > 0,
                'is-refreshing': isRefreshing 
              }"
              :style="{ 
                opacity: Math.min((currentY - startY) / refreshThreshold, 1),
                transform: isRefreshing ? 'rotate(360deg)' : `rotate(${((currentY - startY) / refreshThreshold) * 180}deg)`
              }"
            >
              <i class="fas fa-sync-alt"></i>
            </div>

            <div v-if="authStore.isUser && chatroomStore.isLoading && (!chatroomStore.userChatrooms || chatroomStore.userChatrooms.length === 0)" class="loading-state">
              <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
              </div>
              <p>正在加载聊天室...</p>
            </div>

            <div v-else-if="activeRoomType === 'created'">
              <div v-if="authStore.isAnonymous" class="empty-state">
                <div class="empty-icon">
                  <i class="fas fa-user-secret"></i>
                </div>
                <h3>匿名用户暂无房间</h3>
                <p>注册账户后即可创建和管理聊天室</p>
              </div>
              <div v-else-if="createdChatrooms.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="fas fa-crown"></i>
                </div>
                <h3>还没有创建房间</h3>
                <p>点击下方加号创建您的第一个聊天室</p>
              </div>
              <div v-else class="mobile-rooms-list">
                <div 
                  v-for="chatroom in createdChatrooms" 
                  :key="chatroom.roomId"
                  class="mobile-room-card"
                  @click="joinMyChatroom(chatroom)"
                >
                  <div class="room-card-header">
                    <div class="room-info">
                      <h3 class="room-name">{{ chatroom.name }}</h3>
                      <div class="room-meta">
                        <span class="room-id">#{{ chatroom.roomId }}</span>
                        <span class="user-count">{{ chatroom.userCount }}人</span>
                      </div>
                    </div>
                    <div class="owner-badge">
                      <i class="fas fa-crown"></i>
                    </div>
                  </div>
                  <div v-if="chatroom.lastMessage" class="room-last-message">
                    <span class="message-text">{{ formatMessageContent(chatroom.lastMessage) }}</span>
                    <span class="message-time">{{ formatTime(chatroom.lastMessage.createdAt) }}</span>
                  </div>
                  <div v-else class="room-no-message">
                    <span>暂无消息</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeRoomType === 'joined'">
              <div v-if="authStore.isAnonymous" class="empty-state">
                <div class="empty-icon">
                  <i class="fas fa-user-secret"></i>
                </div>
                <h3>匿名用户暂无房间</h3>
                <p>注册账户后即可加入聊天室</p>
              </div>
              <div v-else-if="joinedChatrooms.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="fas fa-users"></i>
                </div>
                <h3>还没有加入房间</h3>
                <p>点击下方加号加入聊天室</p>
              </div>
              <div v-else class="mobile-rooms-list">
                <div 
                  v-for="chatroom in joinedChatrooms" 
                  :key="chatroom.roomId"
                  class="mobile-room-card"
                  @click="joinMyChatroom(chatroom)"
                >
                  <div class="room-card-header">
                    <div class="room-info">
                      <h3 class="room-name">{{ chatroom.name }}</h3>
                      <div class="room-meta">
                        <span class="room-id">#{{ chatroom.roomId }}</span>
                        <span class="user-count">{{ chatroom.userCount }}人</span>
                      </div>
                    </div>
                    <button 
                      class="leave-room-btn"
                      @click.stop="leaveChatroom(chatroom)"
                    >
                      <i class="fas fa-sign-out-alt"></i>
                    </button>
                  </div>
                  <div v-if="chatroom.lastMessage" class="room-last-message">
                    <span class="message-text">{{ formatMessageContent(chatroom.lastMessage) }}</span>
                    <span class="message-time">{{ formatTime(chatroom.lastMessage.createdAt) }}</span>
                  </div>
                  <div v-else class="room-no-message">
                    <span>暂无消息</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 我的标签页 -->
        <div v-if="activeTab === 'profile'" class="profile-tab">
          <div class="mobile-profile-container">
            <!-- 用户信息头部 -->
            <div class="mobile-user-header">
              <div class="user-avatar-section">
                <img 
                  :src="userAvatarUrl" 
                  :alt="authStore.user.nickname"
                  class="user-avatar-large"
                  @error="handleAvatarError"
                >
                <div v-if="authStore.isAnonymous" class="anonymous-badge">
                  <i class="fas fa-user-secret"></i>
                </div>
              </div>
              <div class="user-info-section">
                <h2 class="user-nickname">{{ authStore.user.nickname }}</h2>
                <div class="user-type-badge">
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
            </div>

            <!-- 统计信息 -->
            <div v-if="authStore.isUser" class="mobile-stats">
              <div class="stat-item">
                <div class="stat-value">{{ createdChatrooms.length }}</div>
                <div class="stat-label">创建房间</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ joinedChatrooms.length }}</div>
                <div class="stat-label">加入房间</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ createdChatrooms.length + joinedChatrooms.length }}</div>
                <div class="stat-label">总房间数</div>
              </div>
            </div>

            <!-- 快速操作 -->
            <div class="mobile-quick-actions">
              <button v-if="authStore.isUser" class="mobile-action-btn" @click="goToProfile">
                <i class="fas fa-user-edit"></i>
                <span>编辑资料</span>
                <i class="fas fa-chevron-right"></i>
              </button>
              
              <button v-if="authStore.isAnonymous" class="mobile-action-btn" @click="handleUserRegister">
                <i class="fas fa-user-plus"></i>
                <span>注册账户</span>
                <i class="fas fa-chevron-right"></i>
              </button>

              <button class="mobile-action-btn" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>退出登录</span>
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <hr class="mobile-divider">

            <!-- 协议链接 -->
            <div class="mobile-legal-links">
              <router-link to="/user-agreement" class="mobile-legal-link">
                <i class="fas fa-file-contract"></i>
                <span>用户协议</span>
                <i class="fas fa-chevron-right"></i>
              </router-link>
              
              <router-link to="/privacy-policy" class="mobile-legal-link">
                <i class="fas fa-shield-alt"></i>
                <span>隐私政策</span>
                <i class="fas fa-chevron-right"></i>
              </router-link>
            </div>

            <!-- 版权和技术信息 -->
            <div class="mobile-footer-info">
              <div class="copyright-info">
                <i class="fas fa-copyright"></i>
                <span>2025 ChatFlow</span>
              </div>
              <div class="tech-info">
                <div class="tech-item">
                  <i class="fab fa-vuejs"></i>
                  <span>Vue3</span>
                </div>
                <div class="tech-separator">+</div>
                <div class="tech-item">
                  <i class="fab fa-node-js"></i>
                  <span>Node.js</span>
                </div>
              </div>
              <div class="version-info">
                <i class="fas fa-code-branch"></i>
                <span>Version 1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 手机端底部导航栏 -->
    <nav class="bottom-navbar mobile-only">
      <button 
        class="nav-item"
        :class="{ active: activeTab === 'rooms' }"
        @click="activeTab = 'rooms'"
      >
        <i class="fas fa-home"></i>
        <span>房间</span>
      </button>
      
      <button 
        class="nav-item add-btn"
        @click="goToRooms"
      >
        <i class="fas fa-plus"></i>
        <span>加号</span>
      </button>
      
      <button 
        class="nav-item"
        :class="{ active: activeTab === 'profile' }"
        @click="activeTab = 'profile'"
      >
        <i class="fas fa-user"></i>
        <span>我的</span>
      </button>
    </nav>

    <!-- 桌面端底部信息 -->
    <footer class="dashboard-footer desktop-only">
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
const activeTab = ref(sessionStorage.getItem('dashboard-active-tab') || 'rooms') // 手机端当前激活的标签：'rooms', 'profile'
const activeRoomType = ref(sessionStorage.getItem('dashboard-room-type') || 'created') // 房间类型：'created', 'joined'

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

// 监听状态变化并保存到sessionStorage
watch(activeTab, (newValue) => {
  sessionStorage.setItem('dashboard-active-tab', newValue)
})

watch(activeRoomType, (newValue) => {
  sessionStorage.setItem('dashboard-room-type', newValue)
})

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

// 下拉刷新相关变量
const isRefreshing = ref(false)
const startY = ref(0)
const currentY = ref(0)
const maxPullDistance = 100 // 最大下拉距离
const refreshThreshold = 100 // 触发刷新的阈值
const mobileRoomsContentRef = ref(null)

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
  background: #667eea;
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
  background: #60a5fa;
  color: #1f2937;
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

/* 桌面端和手机端显示控制 */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block;
  }

  .bottom-navbar.mobile-only {
    display: flex !important; /* 手机端显示底栏，使用 !important 覆盖 mobile-only 的 block */
  }
}

/* 手机端顶部头部样式 */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  z-index: 100;
  height: 60px;
}

.dark .mobile-header {
  background: #374151;
  border-bottom: 1px solid #4b5563;
}

.mobile-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

.app-logo i {
  font-size: 22px;
}

/* 手机端底部导航栏 */
.bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: none; /* 默认隐藏，只在手机端显示 */
  justify-content: space-around;
  align-items: center;
  height: 70px;
  z-index: 100;
  padding: 8px 0;
}

.dark .bottom-navbar {
  background: #374151;
  border-top: 1px solid #4b5563;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  min-width: 60px;
}

.nav-item.active {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.nav-item.add-btn {
  background: #667eea;
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  padding: 0;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item.add-btn:hover {
  background: #5a67d8;
  transform: scale(1.05);
}

.nav-item i {
  font-size: 20px;
}

.nav-item span {
  font-size: 12px;
  font-weight: 500;
}

.nav-item.add-btn span {
  display: none;
}

.dark .nav-item {
  color: #9ca3af;
}

.dark .nav-item.active {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.dark .nav-item.add-btn {
  background: #60a5fa;
  color: #1f2937;
}

.dark .nav-item.add-btn:hover {
  background: #3b82f6;
}

/* 手机端内容区域 */
.mobile-content {
  padding: 60px 0 70px 0;
  min-height: 100vh;
  width: 100%;
  background: #f8fafc;
  overflow-x: hidden; /* 防止横向滚动 */
}

.dark .mobile-content {
  background: #1f2937;
}

/* 房间标签页样式 */
.rooms-tab {
  height: 100%;
}

.room-type-tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  z-index: 10;
}

.dark .room-type-tabs {
  background: #374151;
  border-bottom: 1px solid #4b5563;
}

.room-type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: none;
  border: none;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.room-type-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.dark .room-type-btn {
  color: #9ca3af;
}

.dark .room-type-btn.active {
  color: #60a5fa;
  border-bottom-color: #60a5fa;
}

/* 移动端房间列表容器 */
.mobile-rooms-content {
  padding: 16px;
  position: relative;
  min-height: 200px;
  will-change: transform;
  touch-action: pan-y;
}

/* 下拉刷新指示器 */
.pull-to-refresh-indicator {
  position: absolute;
  top: -40px;
  left: calc(50% - 20px);
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transition: transform 0.2s ease;
  will-change: transform, opacity;
}

.dark .pull-to-refresh-indicator {
  background: rgba(55, 65, 81, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.pull-to-refresh-indicator i {
  font-size: 20px;
  color: #667eea;
  transition: transform 0.2s ease;
}

.dark .pull-to-refresh-indicator i {
  color: #60a5fa;
}

.pull-to-refresh-indicator.is-pulling i {
  transform: rotate(180deg);
}

.pull-to-refresh-indicator.is-refreshing i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 手机端空状态样式 */
.mobile-content .loading-state,
.mobile-content .empty-state {
  padding: 48px 16px;
  text-align: center;
  color: #6b7280;
}

.dark .mobile-content .loading-state,
.dark .mobile-content .empty-state {
  color: #9ca3af;
}

.mobile-content .loading-spinner {
  font-size: 32px;
  margin-bottom: 16px;
  color: #667eea;
}

.dark .mobile-content .loading-spinner {
  color: #60a5fa;
}

.mobile-content .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #667eea;
  opacity: 0.6;
}

.dark .mobile-content .empty-icon {
  color: #60a5fa;
}

.mobile-content .empty-state h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #1f2937;
  font-weight: 600;
}

.dark .mobile-content .empty-state h3 {
  color: #f9fafb;
}

.mobile-content .empty-state p {
  font-size: 14px;
  margin-bottom: 0;
  color: #6b7280;
  line-height: 1.5;
}

.dark .mobile-content .empty-state p {
  color: #9ca3af;
}

.mobile-rooms-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-room-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-room-card:active {
  transform: scale(0.98);
  background: #f8fafc;
}

.dark .mobile-room-card {
  background: #374151;
  border: 1px solid #4b5563;
}

.dark .mobile-room-card:active {
  background: #4b5563;
}

.room-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.room-info {
  flex: 1;
}

.room-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.dark .room-name {
  color: #f9fafb;
}

.room-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.dark .room-meta {
  color: #9ca3af;
}

.room-id, .user-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.owner-badge {
  width: 24px;
  height: 24px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #1a202c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.leave-room-btn {
  width: 32px;
  height: 32px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.leave-room-btn:active {
  background: #fecaca;
  transform: scale(0.95);
}

.dark .leave-room-btn {
  background: #451a1a;
  color: #f87171;
}

.dark .leave-room-btn:active {
  background: #7f1d1d;
}

.room-last-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.message-text {
  flex: 1;
  font-size: 14px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .message-text {
  color: #d1d5db;
}

.message-time {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

.dark .message-time {
  color: #6b7280;
}

.room-no-message {
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  padding: 8px 0;
}

.dark .room-no-message {
  color: #6b7280;
}

/* 个人资料标签页样式 */
.profile-tab {
  height: 100%;
}

.mobile-profile-container {
  padding: 16px;
}

.mobile-user-header {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.dark .mobile-user-header {
  background: #374151;
  border: 1px solid #4b5563;
}

.user-avatar-section {
  position: relative;
}

.user-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #667eea;
}

.user-info-section {
  flex: 1;
}

.user-nickname {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.dark .user-nickname {
  color: #f9fafb;
}

.user-type-badge .type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.type-badge.anonymous {
  background: #fef3f2;
  color: #b91c1c;
}

.type-badge.registered {
  background: #f0fdf4;
  color: #166534;
}

.dark .type-badge.anonymous {
  background: #7f1d1d;
  color: #fca5a5;
}

.dark .type-badge.registered {
  background: #14532d;
  color: #86efac;
}

.mobile-quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.mobile-divider {
  margin: 16px 0;
  border: none;
  border-top: 1px solid #a5a5a5;
}

.mobile-action-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  color: #1f2937;
}

.mobile-action-btn:active {
  background: #f8fafc;
  transform: scale(0.98);
}

.dark .mobile-action-btn {
  background: #374151;
  border: 1px solid #4b5563;
  color: #f9fafb;
}

.dark .mobile-action-btn:active {
  background: #4b5563;
}

.mobile-action-btn i:first-child {
  color: #667eea;
  margin-right: 12px;
}

.mobile-action-btn i:last-child {
  color: #9ca3af;
  font-size: 14px;
}

.dark .mobile-action-btn i:first-child {
  color: #60a5fa;
}

.dark .mobile-action-btn i:last-child {
  color: #6b7280;
}

.mobile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.dark .mobile-stats {
  background: #374151;
  border: 1px solid #4b5563;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.dark .stat-value {
  color: #60a5fa;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.dark .stat-label {
  color: #9ca3af;
}

/* 协议链接样式 */
.mobile-legal-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.mobile-legal-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #1f2937;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 14px;
}

.mobile-legal-link:active {
  background: #f8fafc;
  transform: scale(0.98);
}

.dark .mobile-legal-link {
  background: #374151;
  border: 1px solid #4b5563;
  color: #f9fafb;
}

.dark .mobile-legal-link:active {
  background: #4b5563;
}

.mobile-legal-link i:first-child {
  color: #667eea;
  margin-right: 12px;
  font-size: 16px;
}

.mobile-legal-link i:last-child {
  color: #9ca3af;
  font-size: 12px;
}

.dark .mobile-legal-link i:first-child {
  color: #60a5fa;
}

.dark .mobile-legal-link i:last-child {
  color: #6b7280;
}

/* 版权和技术信息样式 */
.mobile-footer-info {
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.dark .mobile-footer-info {
  background: #374151;
  border: 1px solid #4b5563;
}

.copyright-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.dark .copyright-info {
  color: #9ca3af;
}

.copyright-info i {
  color: #667eea;
  font-size: 16px;
}

.dark .copyright-info i {
  color: #60a5fa;
}

.tech-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.dark .tech-item {
  color: #d1d5db;
}

.tech-item i {
  font-size: 16px;
}

.tech-item i.fab.fa-vuejs {
  color: #4fc08d;
}

.tech-item i.fab.fa-node-js {
  color: #68a063;
}

.tech-separator {
  color: #9ca3af;
  font-weight: 600;
  font-size: 12px;
}

.dark .tech-separator {
  color: #6b7280;
}

.version-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.dark .version-info {
  color: #6b7280;
}

.version-info i {
  color: #667eea;
  font-size: 14px;
}

.dark .version-info i {
  color: #60a5fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 移动端背景简化 */
  .dashboard-container {
    background: #f8fafc;
    background-attachment: scroll;
  }

  .dark .dashboard-container {
    background: #1f2937;
    background-attachment: scroll;
  }

  /* 主要内容区域优化 */
  .dashboard-content {
    padding: 0;
  }

  /* 移除装饰元素 */
  .background-decoration {
    display: none;
  }
}

.theme-toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 手机端主题切换优化 */
@media (max-width: 768px) {
  .mobile-header .theme-toggle-wrapper {
    margin-right: 0;
  }
}
</style> 