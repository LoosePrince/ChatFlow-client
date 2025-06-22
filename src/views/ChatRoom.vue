<template>
  <div class="chatroom-container" @contextmenu.prevent="handleRightClick">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>正在加载聊天室...</p>
    </div>

    <!-- 聊天室内容 -->
    <div v-else class="chatroom-layout">
      <!-- 左侧房间列表 (桌面端) -->
      <div class="sidebar left-sidebar" :class="{ 'sidebar-hidden': !showRoomList }">
        <div class="sidebar-header">
          <h3>
            <i class="fas fa-comments"></i>
            加入的房间
          </h3>
          <button @click="toggleRoomList" class="sidebar-toggle">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="room-list">
          <div 
            v-for="room in joinedRooms" 
            :key="room.roomId"
            :class="['room-item', { 'room-active': room.roomId === roomId }]"
            @click="switchRoom(room.roomId)"
          >
            <div class="room-info">
              <div class="room-name">{{ room.name }}</div>
              <div class="room-id">{{ room.roomId }}</div>
            </div>
            <div class="room-status">
              <span v-if="room.unreadCount > 0" class="unread-badge">{{ room.unreadCount }}</span>
              <i :class="['connection-dot', room.connected ? 'connected' : 'disconnected']"></i>
            </div>
          </div>
        </div>
        <div class="sidebar-footer">
          <button @click="goToRoomSelect" class="join-chat-button">
            <i class="fas fa-plus"></i>
            添加聊天室
          </button>
          <button @click="goHome" class="home-button">
            <i class="fas fa-home"></i>
            返回首页
          </button>
        </div>
      </div>

      <!-- 主聊天区域 -->
      <div class="main-content">
        <!-- 顶部导航栏 -->
        <div class="chatroom-header">
          <div class="header-left">
            <button @click="toggleRoomList" class="mobile-menu-btn">
              <i class="fas fa-bars"></i>
            </button>
            <div class="room-info">
              <h1 
                class="room-name"
                :class="{ 'editable': isCreator }"
                @click="isCreator ? showRoomNameDialog() : null"
              >
                {{ roomName }}
              </h1>
              <span class="room-id">ID: {{ roomId }}</span>
              <span v-if="roomInfo?.hasPassword" class="room-password-indicator">
                <i class="fas fa-lock"></i>
              </span>
            </div>
          </div>
          <div class="header-center">
            <span class="user-info">
              <img 
                :src="userAvatarUrl" 
                :alt="authStore.user?.nickname"
                class="user-avatar"
              >
              <span class="user-name">{{ authStore.user?.nickname }}</span>
              <span class="user-uid">{{ authStore.user?.uid }}</span>
            </span>
          </div>
          <div class="header-right">
            <button @click="toggleMemberList" class="mobile-menu-btn">
              <i class="fas fa-users"></i>
            </button>
            <button @click="confirmLeaveRoom" class="leave-button">
              <i class="fas fa-sign-out-alt"></i>
              <span class="leave-text">退出房间</span>
            </button>
          </div>
        </div>

        <!-- 聊天内容区域 -->
        <div class="chatroom-content">
          <!-- 临时通知区域 -->
          <div v-if="temporaryNotifications.length > 0" class="temporary-notifications">
            <div 
              v-for="notification in temporaryNotifications"
              :key="notification.id"
              :class="['temp-notification', `notification-${notification.type}`]"
            >
              <i :class="getNotificationIcon(notification.type)"></i>
              <span>{{ notification.message }}</span>
            </div>
          </div>
          
          <div class="messages-area">
            <div class="message-list" ref="messageList" @scroll="handleScroll">
              <div class="messages-container">
                <!-- 加载更多指示器 -->
                <div v-if="messagesPagination.isLoading && messagesPagination.currentPage > 1" class="loading-more">
                  <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                  </div>
                  <span>加载更多消息...</span>
                </div>
                
                <!-- 没有更多消息提示 -->
                <div v-if="!messagesPagination.hasMore && messages.length > 0" class="no-more-messages">
                  <i class="fas fa-history"></i>
                  <span>已显示所有历史消息</span>
                </div>
                
                <div v-if="messages.length === 0 && !messagesPagination.isLoading" class="empty-messages">
                  <i class="fas fa-comments"></i>
                  <p>暂无消息，开始聊天吧！</p>
                </div>
              
              <TransitionGroup 
                name="message-delete" 
                tag="div" 
                class="messages-transition-group"
              >
                <div 
                  v-for="message in processedMessages" 
                  :key="message.id"
                  :data-message-id="message.id"
                  :class="[
                    'message', 
                    `message-${message.type}`,
                    { 
                      'message-own': message.isOwn,
                      'message-first-in-group': message.isFirstInGroup,
                      'message-last-in-group': message.isLastInGroup,
                      'message-continuous': !message.isFirstInGroup,
                      'message-deleting': message.isDeleting
                    }
                  ]"
                  @contextmenu="message.type !== 'system' ? handleShowMessageContextMenu($event, message) : null"
                >
                <!-- 系统消息 -->
                <div v-if="message.type === 'system'" class="system-message">
                  <div class="system-message-content">
                    <div class="system-icon">
                      <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="system-text">{{ message.text }}</div>
                    <div class="system-time">{{ formatTime(message.timestamp) }}</div>
                  </div>
                </div>
                
                <!-- 用户消息 -->
                <div v-else class="message-wrapper">
                  <!-- 头像区域 -->
                  <div class="message-avatar" :class="{ 'avatar-placeholder': !message.showAvatar }">
                    <img 
                      v-if="message.showAvatar"
                      :src="getAvatarUrl(message.userAvatar)" 
                      :alt="message.userName"
                      class="avatar-img"
                      @contextmenu="handleShowUserContextMenu($event, {
                        uid: message.userUid,
                        nickname: message.userName,
                        avatarUrl: message.userAvatar,
                        isAdmin: message.isAdmin
                      }, 'message')"
                    >
                  </div>
                  
                  <!-- 消息内容 -->
                  <div class="message-content">
                    <!-- 消息头部（用户名和时间） -->
                    <div v-if="message.showHeader" class="message-header">
                      <span class="user-name">
                        {{ message.userName }}
                        <i v-if="message.isAdmin" class="fas fa-shield-alt admin-icon" title="管理员"></i>
                      </span>
                      <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                    </div>
                    
                    <!-- 回复信息 -->
                    <div v-if="message.replyToMessage" class="reply-message" @click="scrollToMessage(message.replyToMessage.id)">
                      <div class="reply-line"></div>
                      <div class="reply-content">
                        <div class="reply-user">{{ message.replyToMessage.user.nickname }}</div>
                        <div class="reply-text">
                          <span v-if="message.replyToMessage.messageType === 'image'">
                            <i class="fas fa-image"></i> 图片
                          </span>
                          <span v-else-if="message.replyToMessage.messageType === 'bilibili'">
                            <i class="fab fa-bilibili"></i> B站视频 {{ message.replyToMessage.bilibiliId }}
                          </span>
                          <span v-else-if="message.replyToMessage.messageType === 'markdown'">
                            <i class="fab fa-markdown"></i> {{ message.replyToMessage.content || 'Markdown内容' }}
                          </span>
                          <span v-else>{{ message.replyToMessage.content }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 消息文本和时间 -->
                    <div class="message-body">
                      <!-- 图片消息 -->
                      <div v-if="message.type === 'image'" class="message-image">
                        <img 
                          :src="getImageUrl(message.imageUrl)" 
                          :alt="message.text || '图片'"
                          class="image-content"
                          @click="openImagePreview(message.imageUrl, `${message.userName}发送的图片`)"
                          @error="handleImageError"
                        >
                        <div v-if="message.text" class="image-caption">{{ message.text }}</div>
                      </div>
                      <!-- B站视频消息 -->
                      <div v-else-if="message.type === 'bilibili'" class="bilibili-message">
                        <div class="message-type-header bilibili-header">
                          <i class="fab fa-bilibili"></i>
                          <span>{{ message.bilibiliId }}</span>
                        </div>
                        <iframe 
                          :src="`//player.bilibili.com/player.html?bvid=${message.bilibiliId}&autoplay=0`"
                          class="bilibili-player"
                          frameborder="0"
                          allowfullscreen
                        ></iframe>
                      </div>
                      <!-- Markdown消息 -->
                      <div v-else-if="message.type === 'markdown'" class="markdown-message">
                        <div class="message-text">{{ message.text }}</div>
                        <div class="message-type-header markdown-header">
                          <i class="fab fa-markdown"></i>
                          <span>Markdown</span>
                        </div>
                        <div 
                          class="markdown-content"
                          v-html="renderMarkdown(message.markdownContent)"
                        ></div>
                      </div>
                      <!-- 文本消息 -->
                      <div v-else class="message-text">{{ message.text }}</div>
                      <div v-if="!message.showHeader" class="message-time-inline">{{ formatTime(message.timestamp) }}</div>
                    </div>
                  </div>
                </div>
                </div>
              </TransitionGroup>
              </div> <!-- 关闭 messages-container -->
            </div>
          </div>

          <div class="input-area">
            <!-- 回复状态显示 -->
            <div v-if="replyState.isReplying" class="reply-preview">
              <div class="reply-info">
                <i class="fas fa-reply"></i>
                <span>回复 {{ replyState.targetMessage?.userName }}</span>
              </div>
              <div class="reply-content">
                <span v-if="replyState.targetMessage?.type === 'image'">
                  <i class="fas fa-image"></i> 图片
                </span>
                <span v-else-if="replyState.targetMessage?.type === 'bilibili'">
                  <i class="fab fa-bilibili"></i> B站视频 {{ replyState.targetMessage?.bilibiliId }}
                </span>
                <span v-else-if="replyState.targetMessage?.type === 'markdown'">
                  <i class="fab fa-markdown"></i> {{ replyState.targetMessage?.text || 'Markdown内容' }}
                </span>
                <span v-else>{{ replyState.targetMessage?.text }}</span>
              </div>
              <button @click="cancelReply" class="reply-cancel">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <form @submit.prevent="sendMessage" class="message-form">
              <!-- 功能按钮行 -->
              <div class="function-buttons">
                <!-- 图片选择按钮 -->
                <button 
                  type="button" 
                  @click="selectImage" 
                  :disabled="!canSendMessage"
                  class="image-button"
                  title="发送图片"
                >
                  <i class="fas fa-image"></i>
                </button>
                
                <!-- 扩展消息类型按钮 -->
                <button 
                  type="button" 
                  @click="showMessageTypeSelector" 
                  :disabled="!canSendMessage"
                  class="extend-button"
                  title="更多消息类型"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              
              <!-- 输入行 -->
              <div class="input-row">
                <!-- 隐藏的文件输入框 -->
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/*"
                  @change="handleImageSelect"
                  style="display: none"
                >
                
                <input
                  ref="messageInput"
                  v-model="newMessage"
                  type="text"
                  placeholder="输入消息..."
                  :disabled="!canSendMessage"
                  class="message-input"
                  maxlength="500"
                  @paste="handlePaste"
                >
                <button 
                  type="submit" 
                  :disabled="!canSendMessage || !newMessage.trim()" 
                  class="send-button"
                >
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
            
            <div v-if="!canSendMessage && muteTimeRemaining > 0" class="mute-notice">
              <i class="fas fa-clock"></i>
              您已被禁言，还需等待 {{ formatMuteTime(muteTimeRemaining) }} 后才能发言
            </div>
            
            <div v-if="!authStore.isAuthenticated" class="auth-notice">
              <i class="fas fa-user-slash"></i>
              请先登录后才能发言
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧成员列表 (桌面端) -->
      <div class="sidebar right-sidebar" :class="{ 'sidebar-hidden': !showMemberList }">
        <div class="sidebar-header">
          <h3>
            <i class="fas fa-users"></i>
            成员列表 ({{ totalMemberCount }})
          </h3>
          <div class="button-container">
            <ThemeToggle />
            <button @click="toggleMemberList" class="sidebar-toggle">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="member-list">
          <!-- 在线成员 -->
          <div v-if="onlineMembers.length > 0" class="member-section">
            <div class="section-title">
              <i class="fas fa-circle online-dot"></i>
              在线 ({{ onlineMembers.length }})
            </div>
            <div 
              v-for="member in onlineMembers" 
              :key="member.uid"
              class="member-item"
              @contextmenu="handleShowUserContextMenu($event, member, 'member')"
            >
              <img 
                :src="getAvatarUrl(member.avatarUrl)" 
                :alt="member.nickname"
                class="member-avatar"
              >
              <div class="member-info">
                <div class="member-name">
                  {{ member.nickname }}
                  <i v-if="member.isCreator" class="fas fa-crown creator-icon" title="房主"></i>
                  <i v-else-if="member.isAdmin" class="fas fa-shield-alt admin-icon" title="管理员"></i>
                  <i v-if="member.isMuted" class="fas fa-microphone-slash muted-icon" title="已被禁言"></i>
                </div>
                <div class="member-uid">{{ member.uid }}</div>
              </div>
              <div class="member-status online">在线</div>
            </div>
          </div>

          <!-- 离线成员 -->
          <div v-if="offlineMembers.length > 0" class="member-section">
            <div class="section-title">
              <i class="fas fa-circle offline-dot"></i>
              离线 ({{ offlineMembers.length }})
            </div>
            <div 
              v-for="member in offlineMembers" 
              :key="member.uid"
              class="member-item"
              @contextmenu="handleShowUserContextMenu($event, member, 'member')"
            >
              <img 
                :src="getAvatarUrl(member.avatarUrl)" 
                :alt="member.nickname"
                class="member-avatar"
              >
              <div class="member-info">
                <div class="member-name">
                  {{ member.nickname }}
                  <i v-if="member.isCreator" class="fas fa-crown creator-icon" title="房主"></i>
                  <i v-else-if="member.isAdmin" class="fas fa-shield-alt admin-icon" title="管理员"></i>
                  <i v-if="member.isMuted" class="fas fa-microphone-slash muted-icon" title="已被禁言"></i>
                </div>
                <div class="member-uid">{{ member.uid }}</div>
              </div>
              <div class="member-status offline">离线</div>
            </div>
          </div>

          <!-- 已退出成员 -->
          <div v-if="leftMembers.length > 0" class="member-section">
            <div class="section-title">
              <i class="fas fa-circle left-dot"></i>
              已退出 ({{ leftMembers.length }})
            </div>
            <div 
              v-for="member in leftMembers" 
              :key="member.uid"
              class="member-item"
              @contextmenu="handleShowUserContextMenu($event, member, 'member')"
            >
              <img 
                :src="getAvatarUrl(member.avatarUrl)" 
                :alt="member.nickname"
                class="member-avatar"
              >
              <div class="member-info">
                <div class="member-name">{{ member.nickname }}</div>
                <div class="member-uid">{{ member.uid }}</div>
              </div>
              <div class="member-status left">已退出</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端遮罩层 -->
    <div 
      v-if="(showRoomList || showMemberList) && isMobile" 
      class="mobile-overlay"
      @click="closeMobileSidebars"
    ></div>

    <!-- 退出确认对话框 -->
    <div v-if="showLeaveConfirm" class="confirm-dialog-overlay" @click="cancelLeave">
      <div class="confirm-dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ isCreator ? '解散房间' : '退出房间' }}</h3>
        </div>
        <div class="dialog-content">
          <p v-if="isCreator">
            <i class="fas fa-exclamation-triangle warning-icon"></i>
            您是房主，退出房间将会解散整个房间，所有成员都将被移除。此操作不可撤销！
          </p>
          <p v-else>
            确定要退出房间"{{ roomName }}"吗？
          </p>
        </div>
        <div class="dialog-actions">
          <button @click="cancelLeave" class="cancel-button">取消</button>
          <button @click="confirmLeave" class="confirm-button" :class="{ 'danger': isCreator }">
            {{ isCreator ? '确认解散' : '确认退出' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 右键菜单组件 -->
          <ContextMenu
        :visible="contextMenu.visible"
        :x="contextMenu.x"
        :y="contextMenu.y"
        :targetUser="contextMenuUser"
        :currentUserIsCreator="isCreator"
        @close="closeContextMenu"
        @setAdmin="setUserAdmin"
        @showMute="showMuteDialog"
        @unmute="unmuteUser"
        @showKick="showKickDialog"
      />

    <!-- 消息右键菜单组件 -->
    <MessageContextMenu
      :visible="messageContextMenu.visible"
      :x="messageContextMenu.x"
      :y="messageContextMenu.y"
      :targetMessage="messageContextMenu.targetMessage"
      :currentUser="authStore.user"
      :isAdmin="currentUserIsAdmin"
      :isCreator="isCreator"
      @close="closeMessageContextMenu"
      @reply="handleReplyMessage"
      @delete="handleDeleteMessage"
    />

    <!-- 禁言弹窗组件 -->
    <MuteDialog 
      :visible="muteDialog.visible"
      :targetUser="muteDialogUser"
      @cancel="cancelMute"
      @confirm="confirmMute"
    />

    <!-- 踢人确认弹窗组件 -->
    <KickDialog 
      :visible="kickDialog.visible"
      :targetUser="kickDialogUser"
      @cancel="cancelKick"
      @confirm="confirmKickUser"
    />

    <!-- 删除消息确认弹窗 -->
    <DeleteMessageDialog
      :visible="deleteMessageDialog.visible"
      :targetMessage="deleteMessageDialog.targetMessage"
      @confirm="confirmDeleteMessage"
      @cancel="cancelDeleteMessage"
    />

    <!-- 图片预览组件 -->
    <ImagePreview
      :visible="imagePreview.visible"
      :imageUrl="imagePreview.imageUrl"
      :imageTitle="imagePreview.title"
      @close="closeImagePreview"
    />

    <!-- 消息类型选择器 -->
    <MessageTypeSelector
      :visible="messageTypeDialog.visible"
      @close="closeMessageTypeSelector"
      @select="handleMessageTypeSelect"
    />

    <!-- B站视频输入对话框 -->
    <BilibiliInputDialog
      :visible="bilibiliDialog.visible"
      @cancel="closeBilibiliDialog"
      @submit="handleBilibiliSubmit"
    />

    <!-- Markdown输入对话框 -->
    <MarkdownInputDialog
      :visible="markdownDialog.visible"
      @cancel="closeMarkdownDialog"
      @submit="handleMarkdownSubmit"
    />

    <!-- 房间名称编辑弹窗 -->
    <RoomNameEditDialog
      :visible="roomNameDialog.visible"
      :current-name="roomName"
      @cancel="closeRoomNameDialog"
      @submit="handleRoomNameUpdate"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, useNotificationStore, useChatroomStore } from '@/stores'
import axios from 'axios'
import { io } from 'socket.io-client'
import { getWebSocketCorsConfig } from '@/config/cors.js'
import ContextMenu from '@/components/common/ContextMenu.vue'
import MessageContextMenu from '@/components/common/MessageContextMenu.vue'
import DeleteMessageDialog from '@/components/common/DeleteMessageDialog.vue'
import MuteDialog from '@/components/common/MuteDialog.vue'
import KickDialog from '@/components/common/KickDialog.vue'
import ImagePreview from '@/components/common/ImagePreview.vue'
import MessageTypeSelector from '@/components/common/MessageTypeSelector.vue'
import BilibiliInputDialog from '@/components/common/BilibiliInputDialog.vue'
import MarkdownInputDialog from '@/components/common/MarkdownInputDialog.vue'
import RoomNameEditDialog from '@/components/common/RoomNameEditDialog.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import { useContextMenu } from '@/composables/useContextMenu.js'
import { marked } from 'marked'

// 定义组件名称（在 <script setup> 中可选）
defineOptions({
  name: 'ChatRoom'
})

    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    const chatroomStore = useChatroomStore()
    const roomId = computed(() => route.params.roomId)
    const roomInfo = ref(null)
    const newMessage = ref('')
    const messageList = ref(null)
    const messageInput = ref(null)
    const imageInput = ref(null)
    const isLoading = ref(true)
    const isJoining = ref(false)
    const messages = reactive([])
    const socket = ref(null)
    const onlineUsers = ref([])
    const temporaryNotifications = ref([])
    const currentTime = ref(Date.now()) // 添加响应式时间变量
    
    // 新增状态
    const showRoomList = ref(true) // 桌面端默认显示
    const showMemberList = ref(true) // 桌面端默认显示
    const showLeaveConfirm = ref(false)
    const isMobile = ref(false)
    const joinedRooms = ref([])
    const roomMembers = ref([])
    
    // 删除消息确认弹窗状态
    const deleteMessageDialog = ref({
      visible: false,
      targetMessage: null
    })
    
    // 回复状态
    const replyState = ref({
      isReplying: false,
      targetMessage: null
    })

// 使用右键菜单功能
const {
  contextMenu,
  messageContextMenu,
  muteDialog,
  kickDialog,
  showUserContextMenu,
  closeContextMenu,
  showMessageContextMenu,
  closeMessageContextMenu,
  showMuteDialog,
  cancelMute,
  showKickDialog,
  cancelKick,
  handleRightClick
} = useContextMenu()
    
    // 计算属性
    const roomName = computed(() => roomInfo.value?.name || '聊天室')

// 右键菜单用户数据（需要包含头像URL和最新状态）
const contextMenuUser = computed(() => {
  if (!contextMenu.value.targetUser) return null
  
  // 从成员列表中找到最新的用户信息
  const memberInfo = roomMembers.value.find(m => m.uid === contextMenu.value.targetUser.uid)
  
  return {
    ...contextMenu.value.targetUser,
    ...memberInfo, // 合并最新的成员信息
    avatarUrl: getAvatarUrl(contextMenu.value.targetUser.avatarUrl || memberInfo?.avatarUrl)
  }
})

// 禁言弹窗用户数据（需要包含头像URL）
const muteDialogUser = computed(() => {
  if (!muteDialog.value.targetUser) return null
  return {
    ...muteDialog.value.targetUser,
    avatarUrl: getAvatarUrl(muteDialog.value.targetUser.avatarUrl)
  }
})

// 踢人弹窗用户数据（需要包含头像URL）
const kickDialogUser = computed(() => {
  if (!kickDialog.value.targetUser) return null
  return {
    ...kickDialog.value.targetUser,
    avatarUrl: getAvatarUrl(kickDialog.value.targetUser.avatarUrl)
  }
})
    
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
    
    const canSendMessage = computed(() => {
      if (!authStore.isAuthenticated) return false
  
  // 检查用户的禁言状态（包括注册用户和匿名用户）
        if (authStore.user?.muteUntil) {
          const muteUntil = new Date(authStore.user.muteUntil)
          const now = new Date()
          return now >= muteUntil
        }
  
      return true
    })
    
    // 计算禁言剩余时间
    const muteTimeRemaining = computed(() => {
  if (!authStore.user?.muteUntil) return 0
      
      const muteUntil = new Date(authStore.user.muteUntil)
      const now = new Date(currentTime.value) // 使用响应式时间变量
      const remaining = muteUntil - now
      
      return Math.max(0, remaining)
    })
    
    // 格式化禁言剩余时间
    const formatMuteTime = (milliseconds) => {
      if (milliseconds <= 0) return ''
      
      const totalSeconds = Math.ceil(milliseconds / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      
      if (hours > 0) {
        return `${hours}小时${minutes}分钟${seconds}秒`
      } else if (minutes > 0) {
        return `${minutes}分钟${seconds}秒`
      } else {
        return `${seconds}秒`
      }
    }
    
    // 新增计算属性
    const isCreator = computed(() => {
      return roomInfo.value?.creatorUid === authStore.user?.uid
    })

    const currentUserIsAdmin = computed(() => {
      const currentMember = roomMembers.value.find(member => member.uid === authStore.user?.uid)
      return currentMember?.isAdmin || false
    })
    
    const onlineMembers = computed(() => {
      return roomMembers.value.filter(member => member.status === 'online')
    })
    
    const offlineMembers = computed(() => {
      return roomMembers.value.filter(member => member.status === 'offline')
    })
    
    const leftMembers = computed(() => {
      return roomMembers.value.filter(member => member.status === 'left')
    })
    
    const totalMemberCount = computed(() => {
      return roomMembers.value.length
    })
    
    // 处理连续消息的计算属性
    const processedMessages = computed(() => {
      return messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null
        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null
        
        // 系统消息不参与连续消息处理
        if (message.type === 'system') {
          return {
            ...message,
            isFirstInGroup: true,
            isLastInGroup: true,
            showAvatar: false,
            showHeader: false
          }
        }
        
        // 判断是否与前一条消息是同一用户的连续消息
        const isContinuous = prevMessage && 
          prevMessage.type !== 'system' &&
          prevMessage.userUid === message.userUid &&
          message.timestamp - prevMessage.timestamp < 300000 // 5分钟内算连续消息
        
        // 判断是否与后一条消息是同一用户的连续消息
        const isNextContinuous = nextMessage && 
          nextMessage.type !== 'system' &&
          nextMessage.userUid === message.userUid &&
          nextMessage.timestamp - message.timestamp < 300000 // 5分钟内算连续消息
        
        return {
          ...message,
          isFirstInGroup: !isContinuous,
          isLastInGroup: !isNextContinuous,
          showAvatar: !isContinuous,
          showHeader: !isContinuous
        }
      })
    })
    
    // 验证聊天室是否存在
    const validateChatroom = async () => {
      try {
        const response = await axios.get(`/api/chatrooms/${roomId.value}`)
        roomInfo.value = response.data.data
        return true
      } catch (error) {
        console.error('聊天室验证失败:', error)
        if (error.response?.status === 404) {
          notificationStore.error('聊天室不存在或已被关闭')
        } else {
          notificationStore.error('无法连接到聊天室')
        }
        return false
      }
    }
    
    // 消息分页状态
    const messagesPagination = reactive({
      currentPage: 0,
      pageSize: 30,
      hasMore: true,
      isLoading: false,
      oldestMessageId: null
    })
    
    // 加载聊天室历史消息 - 重新设计为分页加载
    const loadMessages = async (loadMore = false) => {
      if (messagesPagination.isLoading || (!loadMore && messagesPagination.currentPage > 0)) {
        return
      }
      
      messagesPagination.isLoading = true
      
      try {
        const params = {
          limit: messagesPagination.pageSize,
          page: messagesPagination.currentPage
        }
        
        // 如果是加载更多，使用最旧消息的ID作为参考点
        if (loadMore && messagesPagination.oldestMessageId) {
          params.before = messagesPagination.oldestMessageId
        }
        
        const response = await axios.get(`/api/chatrooms/${roomId.value}/messages`, { params })
        
        const messageData = response.data.data
        const messagesArray = Array.isArray(messageData) ? messageData : messageData.messages || []
        
        // 只过滤掉临时系统消息，保留持久系统消息
        const persistentMessages = messagesArray.filter(msg => 
          msg.messageType !== 'system' || 
          (msg.messageType === 'system' && msg.systemMessageType === 'persistent')
        )
        
        const formattedMessages = persistentMessages.map(msg => ({
          id: msg.id,
          type: msg.messageType === 'system' ? 'system' : 
                msg.messageType === 'image' ? 'image' :
                msg.messageType === 'bilibili' ? 'bilibili' :
                msg.messageType === 'markdown' ? 'markdown' : 'user',
          userName: msg.user?.nickname || msg.nickname || '未知用户',
          userUid: msg.userUid || msg.sender_uid,
          userAvatar: msg.user?.avatarUrl || msg.avatar_url || '/avatars/default',
          text: msg.content,
          imageUrl: msg.imageUrl,
          bilibiliId: msg.bilibiliId,
          markdownContent: msg.markdownContent,
          timestamp: msg.createdAt,
          isOwn: (msg.userUid || msg.sender_uid) === authStore.user?.uid,
          isAdmin: msg.user?.isAdmin || false,
          systemMessageType: msg.systemMessageType,
          visibilityScope: msg.visibilityScope,
          visibleToUsers: msg.visibleToUsers,
          replyToMessageId: msg.replyToMessageId,
          replyToMessage: msg.replyToMessage
        }))
        
        if (loadMore) {
          // 加载更多时，将新消息插入到数组开头（保持时间顺序）
          messages.unshift(...formattedMessages.reverse())
        } else {
          // 首次加载，直接替换消息数组
          messages.splice(0, messages.length, ...formattedMessages)
        }
        
        // 更新分页状态
        messagesPagination.hasMore = formattedMessages.length === messagesPagination.pageSize
        messagesPagination.currentPage++
        
        // 更新最旧消息ID
        if (messages.length > 0) {
          messagesPagination.oldestMessageId = messages[0].id
        }
        
        // 首次加载时滚动到底部，加载更多时保持当前位置
        await nextTick()
        if (!loadMore) {
          scrollToBottom()
        } else {
          // 加载更多后，保持滚动位置相对稳定
          maintainScrollPosition()
        }
        
      } catch (error) {
        console.error('加载消息失败:', error)
        notificationStore.error('加载聊天记录失败')
      } finally {
        messagesPagination.isLoading = false
      }
    }
    
    // 加载更多历史消息
    const loadMoreMessages = async () => {
      if (!messagesPagination.hasMore || messagesPagination.isLoading) {
        return
      }
      
      await loadMessages(true)
    }
    
    // 保持滚动位置（加载更多消息后使用）
    const maintainScrollPosition = () => {
      if (messageList.value) {
        // 滚动到距离底部一定距离的位置，避免跳动
        const scrollHeight = messageList.value.scrollHeight
        const clientHeight = messageList.value.clientHeight
        const newScrollTop = scrollHeight - clientHeight - 100 // 保持100px的缓冲
        messageList.value.scrollTop = Math.max(0, newScrollTop)
      }
    }
    
    // 监听滚动事件，实现上拉加载更多
    const handleScroll = () => {
      if (!messageList.value || messagesPagination.isLoading || !messagesPagination.hasMore) {
        return
      }
      
      const { scrollTop } = messageList.value
      
      // 当滚动到顶部附近时，加载更多历史消息
      if (scrollTop < 100) {
        loadMoreMessages()
      }
    }
    
    // 滚动到底部
    const scrollToBottom = (smooth = true) => {
      if (messageList.value) {
        const scrollOptions = {
          top: messageList.value.scrollHeight,
          behavior: smooth ? 'smooth' : 'instant'
        }
        messageList.value.scrollTo(scrollOptions)
      }
    }
    
    // 检查是否在底部附近
    const isNearBottom = () => {
      if (!messageList.value) return true
      
      const { scrollTop, scrollHeight, clientHeight } = messageList.value
      return scrollHeight - scrollTop - clientHeight < 50
    }
    
    // 选择图片
    const selectImage = () => {
      if (imageInput.value) {
        imageInput.value.click()
      }
    }
    
    // 处理图片选择
    const handleImageSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        sendImageMessage(file)
      }
      // 清空input的值，允许重复选择同一文件
      event.target.value = ''
    }
    
    // 处理粘贴事件
    const handlePaste = (event) => {
      const items = event.clipboardData?.items
      if (!items) return
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) {
            sendImageMessage(file)
          }
          break
        }
      }
    }
    
    // 发送图片消息
    const sendImageMessage = async (file) => {
      if (!canSendMessage.value) return
      
      // 检查文件大小（1MB = 1024 * 1024 bytes）
      const maxSize = 1024 * 1024
      if (file.size > maxSize) {
        notificationStore.error('图片大小不能超过1MB')
        return
      }
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        notificationStore.error('只能发送图片文件')
        return
      }
      
      try {
        // 创建FormData
        const formData = new FormData()
        formData.append('image', file)
        formData.append('roomId', roomId.value)
        formData.append('messageType', 'image')
        
        // 如果是回复消息，添加回复信息
        if (replyState.value.isReplying && replyState.value.targetMessage) {
          formData.append('replyToMessageId', replyState.value.targetMessage.id)
        }
        
        // 发送图片
        const response = await axios.post(`/api/chatrooms/${roomId.value}/messages/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        // 图片发送成功，WebSocket会自动广播消息，不需要手动添加到消息列表
        cancelReply() // 清除回复状态
        
        // 等待WebSocket消息到达后滚动到底部
        setTimeout(() => {
          scrollToBottom(false)
        }, 100)
        
      } catch (error) {
        console.error('发送图片失败:', error)
        notificationStore.error('发送图片失败: ' + (error.response?.data?.message || error.message))
      }
    }
    
    // 发送消息
    const sendMessage = async () => {
      if (!newMessage.value.trim() || !canSendMessage.value) return
      
      // 准备消息数据
      const messageData = {
        roomId: roomId.value,
        content: newMessage.value.trim(),
        messageType: 'text'
      }
      
      // 如果是回复消息，添加回复信息
      if (replyState.value.isReplying && replyState.value.targetMessage) {
        messageData.replyToMessageId = replyState.value.targetMessage.id
      }
      
      if (socket.value && socket.value.connected) {
        // 使用WebSocket发送消息
        socket.value.emit('send-message', messageData)
        
        newMessage.value = ''
        cancelReply() // 清除回复状态
      } else {
        // 如果WebSocket未连接，使用HTTP API作为备选
        try {
          const httpData = {
            content: newMessage.value.trim(),
            messageType: 'text'
          }
          
          // 如果是回复消息，添加回复信息
          if (replyState.value.isReplying && replyState.value.targetMessage) {
            httpData.replyToMessageId = replyState.value.targetMessage.id
          }
          
          const response = await axios.post(`/api/chatrooms/${roomId.value}/messages`, httpData)
          
          const msg = response.data.data
          
          // 处理用户消息和持久系统消息
          if (msg.messageType !== 'system' || msg.systemMessageType === 'persistent') {
            messages.push({
              id: msg.id,
              type: msg.messageType === 'system' ? 'system' : 'user',
              userName: msg.user?.nickname || authStore.user?.nickname || '未知用户',
              userUid: msg.userUid || msg.sender_uid,
              userAvatar: msg.user?.avatarUrl || authStore.user?.avatarUrl || '/avatars/default',
              text: msg.content,
              timestamp: msg.createdAt,
              isOwn: true,
              isAdmin: msg.user?.isAdmin || false,
              systemMessageType: msg.systemMessageType,
              visibilityScope: msg.visibilityScope,
              visibleToUsers: msg.visibleToUsers,
              replyToMessageId: msg.replyToMessageId,
              replyToMessage: msg.replyToMessage
            })
          }
          
          newMessage.value = ''
          cancelReply() // 清除回复状态
          await nextTick()
          scrollToBottom(false) // 发送消息后立即滚动到底部，不使用平滑滚动
          
        } catch (error) {
          console.error('发送消息失败:', error)
          notificationStore.error('发送消息失败: ' + (error.response?.data?.message || error.message))
        }
      }
    }
    
    // 获取头像URL
    const getAvatarUrl = (avatarPath) => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      
      if (!avatarPath) {
        return `${baseUrl}/avatars/default`
      }
      
      // 如果是完整URL，直接返回
      if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
        return avatarPath
      }
      
      // 使用新的固定头像URL格式
      return `${baseUrl}${avatarPath}`
    }
    
    // 获取图片URL
    const getImageUrl = (imagePath) => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      
      if (!imagePath) {
        return ''
      }
      
      // 如果是完整URL，直接返回
      if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath
      }
      
      // 拼接完整URL
      return `${baseUrl}${imagePath}`
    }
    
    // 图片预览状态
    const imagePreview = ref({
      visible: false,
      imageUrl: '',
      title: ''
    })

    // 扩展消息类型对话框状态
    const messageTypeDialog = ref({
      visible: false
    })

    const bilibiliDialog = ref({
      visible: false
    })

    const markdownDialog = ref({
      visible: false
    })

    // 房间名称编辑弹窗状态
    const roomNameDialog = ref({
      visible: false
    })
    
    // 打开图片预览
    const openImagePreview = (imageUrl, title = '') => {
      imagePreview.value = {
        visible: true,
        imageUrl: getImageUrl(imageUrl),
        title: title || '图片预览'
      }
    }
    
    // 关闭图片预览
    const closeImagePreview = () => {
      imagePreview.value = {
        visible: false,
        imageUrl: '',
        title: ''
      }
    }

    // 显示消息类型选择器
    const showMessageTypeSelector = () => {
      messageTypeDialog.value.visible = true
    }

    // 关闭消息类型选择器
    const closeMessageTypeSelector = () => {
      messageTypeDialog.value.visible = false
    }

    // 处理消息类型选择
    const handleMessageTypeSelect = (type) => {
      if (type === 'bilibili') {
        bilibiliDialog.value.visible = true
      } else if (type === 'markdown') {
        markdownDialog.value.visible = true
      }
    }

    // B站视频对话框处理
    const closeBilibiliDialog = () => {
      bilibiliDialog.value.visible = false
    }

    const handleBilibiliSubmit = async (data) => {
      try {
        const response = await axios.post(`/api/chatrooms/${roomId.value}/messages/bilibili`, {
          bilibiliId: data.bilibiliId,
          replyToMessageId: replyState.value.isReplying ? replyState.value.targetMessage.id : undefined
        })

        cancelReply() // 清除回复状态
        bilibiliDialog.value.visible = false
        
        // 等待WebSocket消息到达后滚动到底部
        setTimeout(() => {
          scrollToBottom(false)
        }, 100)

      } catch (error) {
        console.error('发送B站视频失败:', error)
        notificationStore.error('发送B站视频失败: ' + (error.response?.data?.message || error.message))
      }
    }

    // Markdown对话框处理
    const closeMarkdownDialog = () => {
      markdownDialog.value.visible = false
    }

    const handleMarkdownSubmit = async (data) => {
      try {
        const response = await axios.post(`/api/chatrooms/${roomId.value}/messages/markdown`, {
          markdownContent: data.markdownContent,
          title: data.title,
          replyToMessageId: replyState.value.isReplying ? replyState.value.targetMessage.id : undefined
        })

        cancelReply() // 清除回复状态
        markdownDialog.value.visible = false
        
        // 等待WebSocket消息到达后滚动到底部
        setTimeout(() => {
          scrollToBottom(false)
        }, 100)

      } catch (error) {
        console.error('发送Markdown内容失败:', error)
        notificationStore.error('发送Markdown内容失败: ' + (error.response?.data?.message || error.message))
      }
    }

    // 房间名称编辑相关方法
    const showRoomNameDialog = () => {
      if (!isCreator.value) {
        notificationStore.error('只有房间创建者可以修改房间名称')
        return
      }
      roomNameDialog.value.visible = true
    }

    const closeRoomNameDialog = () => {
      roomNameDialog.value.visible = false
    }

    const handleRoomNameUpdate = async (newName) => {
      try {
        await chatroomStore.updateRoomName(roomId.value, newName)
        
        // 更新本地房间信息
        if (roomInfo.value) {
          roomInfo.value.name = newName
        }
        
        notificationStore.success('房间名称修改成功')
        closeRoomNameDialog()
        
        // 通过WebSocket通知其他用户房间名称已更改
        if (socket.value && socket.value.connected) {
          socket.value.emit('room-name-updated', {
            roomId: roomId.value,
            newName: newName
          })
        }
        
      } catch (error) {
        console.error('修改房间名称失败:', error)
        notificationStore.error('修改房间名称失败: ' + (error.response?.data?.message || error.message))
      }
    }
    
    // 处理图片加载错误
    const handleImageError = (event) => {
      event.target.src = '/avatars/default'
      event.target.alt = '图片加载失败'
    }

    // 配置marked选项
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false
    })

    // 使用marked库渲染Markdown内容
    const renderMarkdown = (content) => {
      if (!content) return ''
      
      try {
        return marked(content)
      } catch (error) {
        console.error('Markdown解析错误:', error)
        return '<p style="color: red;">Markdown解析错误</p>'
      }
    }
    
    // 添加临时通知
    const addTemporaryNotification = (message, type = 'info') => {
      const notification = {
        id: Date.now() + Math.random(),
        message,
        type,
        timestamp: new Date()
      }
      
      temporaryNotifications.value.push(notification)
      
      // 3秒后自动移除
      setTimeout(() => {
        const index = temporaryNotifications.value.findIndex(n => n.id === notification.id)
        if (index > -1) {
          temporaryNotifications.value.splice(index, 1)
        }
      }, 3000)
      
      // 最多保留5条通知
      if (temporaryNotifications.value.length > 5) {
        temporaryNotifications.value.shift()
      }
    }
    
    // 获取通知图标
    const getNotificationIcon = (type) => {
      const icons = {
        join: 'fas fa-user-plus',
        leave: 'fas fa-user-minus',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle'
      }
      return icons[type] || icons.info
    }
    
    // 格式化时间
    const formatTime = (timestamp) => {
      // 确保timestamp是数字类型
      const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
      const date = new Date(time)
      
      // 检查是否是有效日期
      if (isNaN(date.getTime())) {
        return '时间错误'
      }
      
      const now = new Date()
      const diff = now - date
      
      // 如果是今天的消息，显示时间
      if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }
      
      // 如果是昨天或更早，显示日期和时间
      return date.toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // 连接WebSocket
    const connectWebSocket = () => {
      console.log('准备连接WebSocket，token:', authStore.token)
      if (!authStore.token) {
        console.error('无法连接WebSocket：缺少认证令牌')
        return
      }
      
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
      const corsConfig = getWebSocketCorsConfig()
      
      socket.value = io(socketUrl, {
        auth: {
          token: authStore.token
        },
        transports: ['websocket', 'polling'],
        // 应用CORS配置
        withCredentials: corsConfig.credentials,
        extraHeaders: {
          'Origin': window.location.origin
        }
      })
      
      // 连接成功
      socket.value.on('connect', () => {
        console.log('WebSocket连接成功')
        addTemporaryNotification('已连接到实时聊天', 'info')
        // 加入聊天室
        socket.value.emit('join-room', { roomId: roomId.value })
      })
      
      // 连接错误
      socket.value.on('connect_error', (error) => {
        console.error('WebSocket连接失败:', error)
        addTemporaryNotification('实时连接失败，消息可能延迟', 'error')
      })
      
      // 断开连接
      socket.value.on('disconnect', (reason) => {
        console.log('WebSocket连接断开:', reason)
        if (reason !== 'io client disconnect') {
          addTemporaryNotification('连接已断开，正在重连...', 'warning')
        }
      })
      
      // 重连成功
      socket.value.on('reconnect', () => {
        console.log('WebSocket重连成功')
        addTemporaryNotification('重连成功', 'info')
      })
      
      // 加入房间成功
      socket.value.on('room-joined', (data) => {
        console.log('成功加入房间:', data)
        onlineUsers.value = data.onlineUsers || []
        addTemporaryNotification(`已加入聊天室，当前在线 ${data.onlineUsers?.length || 0} 人`, 'info')
        
        // 重新加载成员列表
        loadRoomMembers()
      })

      // 房间名称更新
      socket.value.on('room-name-updated', (data) => {
        console.log('房间名称已更新:', data)
        
        // 更新本地房间信息
        if (roomInfo.value) {
          roomInfo.value.name = data.newName
        }
        
        // 显示通知
        if (data.updatedBy !== authStore.user?.uid) {
          addTemporaryNotification(`房间名称已更改为: ${data.newName}`, 'info')
        }
      })
      
      // 新消息
      socket.value.on('new-message', (messageData) => {
        console.log('收到新消息:', messageData)
        
        // 如果是临时系统消息，通过临时通知显示
        if (messageData.messageType === 'system' && messageData.systemMessageType === 'temporary') {
          addTemporaryNotification(messageData.content, 'info')
          return
        }
        
        // 处理用户消息和持久系统消息
        const newMessage = {
          id: messageData.id,
          type: messageData.messageType === 'system' ? 'system' : 
                messageData.messageType === 'image' ? 'image' :
                messageData.messageType === 'bilibili' ? 'bilibili' :
                messageData.messageType === 'markdown' ? 'markdown' : 'user',
          userName: messageData.user?.nickname || messageData.userName || '未知用户',
          userUid: messageData.userUid || messageData.sender_uid,
          userAvatar: messageData.user?.avatarUrl || messageData.userAvatar || '/avatars/default',
          text: messageData.content,
          imageUrl: messageData.imageUrl,
          bilibiliId: messageData.bilibiliId,
          markdownContent: messageData.markdownContent,
          timestamp: messageData.createdAt,
          isOwn: messageData.userUid === authStore.user?.uid,
          isAdmin: messageData.user?.isAdmin || false,
          systemMessageType: messageData.systemMessageType,
          visibilityScope: messageData.visibilityScope,
          visibleToUsers: messageData.visibleToUsers,
          replyToMessageId: messageData.replyToMessageId,
          replyToMessage: messageData.replyToMessage
        }
        
        // 记录用户是否在底部附近
        const wasNearBottom = isNearBottom()
        
        messages.push(newMessage)
        
        nextTick(() => {
          // 只有在用户在底部附近或者是自己发送的消息时才自动滚动到底部
          if (wasNearBottom || newMessage.isOwn) {
            scrollToBottom()
          }
        })
      })
      
      // 用户加入/离开
      socket.value.on('user-joined', (data) => {
        console.log('用户加入:', data)
        onlineUsers.value = data.onlineUsers || []
        
        // 显示临时通知而不是聊天消息
        if (data.user && data.user.uid !== authStore.user?.uid) {
          addTemporaryNotification(`${data.user.nickname} 加入了聊天室`, 'join')
        }
        
        // 重新加载成员列表
        loadRoomMembers()
      })
      
      socket.value.on('user-left', (data) => {
        console.log('用户离开:', data)
        onlineUsers.value = data.onlineUsers || []
        
        // 显示临时通知而不是聊天消息
        if (data.user && data.user.uid !== authStore.user?.uid) {
          addTemporaryNotification(`${data.user.nickname} 离开了聊天室`, 'leave')
        }
        
        // 重新加载成员列表
        loadRoomMembers()
      })
      
      // 在线用户列表更新
      socket.value.on('online-users', (data) => {
        onlineUsers.value = data.users || []
      })
      
      // 聊天室被解散
      socket.value.on('room-dissolved', (data) => {
        console.log('聊天室被解散:', data)
        addTemporaryNotification(data.message, 'warning')
        
        // 3秒后自动跳转到首页
        setTimeout(() => {
          notificationStore.error('聊天室已被解散，正在返回首页...')
          router.push({ name: 'Home' })
        }, 3000)
      })
  
  // 用户被踢出
  socket.value.on('user-kicked', (data) => {
    console.log('用户被踢出事件:', data)
    
    if (data.kickedUid === authStore.user?.uid) {
      // 当前用户被踢出
      addTemporaryNotification('您已被移出聊天室', 'warning')
      setTimeout(() => {
        notificationStore.error('您已被移出聊天室')
        router.push({ name: 'RoomSelect' })
      }, 2000)
    } else {
      // 其他用户被踢出，直接显示离开消息，避免重复
      const kickedUser = data.kickedUser || { nickname: '用户' }
      addTemporaryNotification(`${kickedUser.nickname} 离开了聊天室`, 'leave')
      
      // 更新在线用户列表
      onlineUsers.value = onlineUsers.value.filter(user => user.uid !== data.kickedUid)
      
      // 重新加载成员列表
      loadRoomMembers()
    }
  })
  
        // 用户被禁言/解除禁言
      socket.value.on('user-muted', (data) => {
        console.log('用户禁言状态变化:', data)
        
        if (data.targetUid === authStore.user?.uid) {
          // 当前用户被禁言或解除禁言
          if (data.isMuted) {
            authStore.user.muteUntil = data.muteUntil
            addTemporaryNotification(`您已被禁言，${data.duration}分钟后可以发言`, 'warning')
          } else {
            authStore.user.muteUntil = null
            addTemporaryNotification('您的禁言已被解除', 'info')
          }
        }
        
        // 更新成员列表中的禁言状态
        const member = roomMembers.value.find(m => m.uid === data.targetUid)
        if (member) {
          member.isMuted = data.isMuted
          member.muteUntil = data.isMuted ? data.muteUntil : null
        }
      })

      // 消息被删除
      socket.value.on('message-deleted', (data) => {
        console.log('消息被删除:', data)
        
        // 找到要删除的消息
        const messageIndex = messages.findIndex(msg => msg.id === data.messageId)
        if (messageIndex > -1) {
          const message = messages[messageIndex]
          
          // 先添加删除动画状态
          message.isDeleting = true
          
          // 延迟删除，让动画播放完成
          setTimeout(() => {
            const currentIndex = messages.findIndex(msg => msg.id === data.messageId)
            if (currentIndex > -1) {
              messages.splice(currentIndex, 1)
            }
          }, 300) // 动画持续时间
          
          // 如果删除的不是当前用户的消息，显示通知
          if (data.deletedBy !== authStore.user?.uid) {
            addTemporaryNotification('有消息被删除', 'info')
          }
        }
      })
    }
    
    // 断开WebSocket连接
    const disconnectWebSocket = () => {
      if (socket.value) {
        socket.value.disconnect()
        socket.value = null
      }
    }
    
    // 离开房间
    const leaveRoom = () => {
      disconnectWebSocket()
      router.push({ name: 'Home' })
    }
    
    // 初始化聊天室
    const initializeChatroom = async () => {
      isLoading.value = true
      
      try {
        // 等待认证状态初始化完成
        if (!authStore.isInitialized) {
          await authStore.initialize()
        }
        
        // 检查用户是否已登录
        if (!authStore.isAuthenticated) {
          notificationStore.error('请先登录')
          router.push({ name: 'Home' })
          return
        }
        
        // 验证聊天室是否存在
        const isValid = await validateChatroom()
        if (!isValid) {
          router.push({ name: 'RoomSelect' })
          return
        }
        
        // 加载历史消息
        await loadMessages()
        
        notificationStore.success(`成功加入聊天室"${roomInfo.value.name}"`)
        
        // 连接WebSocket
        connectWebSocket()
        
      } catch (error) {
        console.error('初始化聊天室失败:', error)
        notificationStore.error('初始化聊天室失败')
        router.push({ name: 'RoomSelect' })
      } finally {
        isLoading.value = false
      }
    }
    
    // 禁言倒计时定时器
    const muteTimer = ref(null)
    
    // 启动禁言倒计时
    const startMuteTimer = () => {
      if (muteTimer.value) {
        clearInterval(muteTimer.value)
      }
      
  if (muteTimeRemaining.value > 0) {
        muteTimer.value = setInterval(() => {
          // 更新当前时间，触发计算属性重新计算
          currentTime.value = Date.now()
          
          // 如果禁言时间结束则清除定时器
          if (muteTimeRemaining.value <= 0) {
            clearInterval(muteTimer.value)
            muteTimer.value = null
            addTemporaryNotification('禁言时间已结束，现在可以发言了！', 'info')
          }
        }, 1000)
      }
    }
    
    // 监听认证状态变化，重新启动倒计时
    watch(
  () => authStore.user?.muteUntil,
      () => {
        startMuteTimer()
      },
      { immediate: false }
    )
    
    // 监听在线用户变化，更新成员列表状态
    watch(
      () => onlineUsers.value,
      (newOnlineUsers) => {
        if (roomMembers.value.length > 0) {
          roomMembers.value = roomMembers.value.map(member => ({
            ...member,
            status: member.uid === authStore.user?.uid ? 'online' : 
                   newOnlineUsers.some(u => u.uid === member.uid) ? 'online' : 
                   member.status === 'left' ? 'left' : 'offline'
          }))
        }
      },
      { deep: true }
    )
    
    // 生命周期 (已合并到后面的onMounted中)
    
    onUnmounted(() => {
      disconnectWebSocket()
      if (muteTimer.value) {
        clearInterval(muteTimer.value)
      }
    })
    
    // 新增方法
    // 检测移动端
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
      if (isMobile.value) {
        showRoomList.value = false
        showMemberList.value = false
      } else {
        showRoomList.value = true
        showMemberList.value = true
      }
    }
    
    // 切换房间列表显示
    const toggleRoomList = () => {
      showRoomList.value = !showRoomList.value
    }
    
    // 切换成员列表显示
    const toggleMemberList = () => {
      showMemberList.value = !showMemberList.value
    }
    
    // 关闭移动端侧边栏
    const closeMobileSidebars = () => {
      if (isMobile.value) {
        showRoomList.value = false
        showMemberList.value = false
      }
    }
    
    // 返回首页
    const goHome = () => {
      router.push({ name: 'Home' })
    }
    
    // 跳转到加入聊天页面
    const goToRoomSelect = () => {
      router.push({ name: 'RoomSelect' })
    }
    
    // 切换房间
    const switchRoom = (newRoomId) => {
      if (newRoomId !== roomId.value) {
        router.push({ name: 'ChatRoom', params: { roomId: newRoomId } })
      }
    }
    
    // 确认退出房间
    const confirmLeaveRoom = () => {
      showLeaveConfirm.value = true
    }
    
    // 取消退出
    const cancelLeave = () => {
      showLeaveConfirm.value = false
    }
    
    // 确认退出/解散
    const confirmLeave = async () => {
      showLeaveConfirm.value = false
      
      try {
        if (isCreator.value) {
          // 房主解散房间
          await axios.delete(`/api/chatrooms/${roomId.value}`)
          notificationStore.success('房间已解散')
        } else {
          // 普通用户退出房间
          await axios.post(`/api/chatrooms/${roomId.value}/leave`)
          notificationStore.success('已退出房间')
        }
        
        // 断开WebSocket连接
        disconnectWebSocket()
        
        // 跳转到首页
        router.push({ name: 'Home' })
        
      } catch (error) {
        console.error('退出房间失败:', error)
        notificationStore.error('操作失败: ' + (error.response?.data?.message || error.message))
      }
    }
    
    // 加载已加入的房间列表
    const loadJoinedRooms = async () => {
      try {
        if (authStore.isUser) {
          // 注册用户：获取创建的房间列表
          const response = await axios.get('/api/chatrooms/my/rooms')
          const userRooms = response.data.data || []
          
          joinedRooms.value = userRooms.map(room => ({
            roomId: room.roomId,
            name: room.name,
            connected: true,
            unreadCount: 0
          }))
        } else {
          // 匿名用户：只显示当前房间
          joinedRooms.value = [
            {
              roomId: roomId.value,
              name: roomName.value,
              connected: true,
              unreadCount: 0
            }
          ]
        }
        
        // 确保当前房间在列表中
        const currentRoomExists = joinedRooms.value.some(room => room.roomId === roomId.value)
        if (!currentRoomExists) {
          joinedRooms.value.unshift({
            roomId: roomId.value,
            name: roomName.value,
            connected: true,
            unreadCount: 0
          })
        }
      } catch (error) {
        console.error('加载房间列表失败:', error)
        // 备选方案：至少显示当前房间
        joinedRooms.value = [
          {
            roomId: roomId.value,
            name: roomName.value,
            connected: true,
            unreadCount: 0
          }
        ]
      }
    }
    
    // 加载房间成员列表
    const loadRoomMembers = async () => {
      try {
        console.log('正在加载房间成员列表，房间ID:', roomId.value)
        const response = await axios.get(`/api/chatrooms/${roomId.value}/members`)
        const members = response.data.data || []
        console.log('获取到的成员列表:', members)
        
        // 更新成员状态，当前用户设为在线
        roomMembers.value = members.map(member => {
          let status = member.status || 'offline'
          
          // 当前用户设为在线
          if (member.uid === authStore.user?.uid) {
            status = 'online'
          }
          // 检查是否在WebSocket在线用户列表中
          else if (onlineUsers.value.some(u => u.uid === member.uid)) {
            status = 'online'
          }
      
      // 检查禁言状态
      let isMuted = false
      let muteUntil = null
      if (member.muteUntil) {
        const muteEndTime = new Date(member.muteUntil)
        const now = new Date()
        isMuted = now < muteEndTime
        muteUntil = isMuted ? member.muteUntil : null
      }
          
          return {
            ...member,
        status,
        isMuted,
        muteUntil
          }
        })
        
        // 如果当前用户不在成员列表中，添加当前用户
        const currentUserExists = roomMembers.value.some(member => member.uid === authStore.user?.uid)
        console.log('当前用户是否在成员列表中:', currentUserExists, '当前用户:', authStore.user?.uid)
        
        if (!currentUserExists && authStore.user) {
          console.log('添加当前用户到成员列表')
      
      // 检查当前用户的禁言状态
      let isMuted = false
      let muteUntil = null
      if (authStore.user.muteUntil) {
        const muteEndTime = new Date(authStore.user.muteUntil)
        const now = new Date()
        isMuted = now < muteEndTime
        muteUntil = isMuted ? authStore.user.muteUntil : null
      }
      
          roomMembers.value.unshift({
            uid: authStore.user.uid,
            nickname: authStore.user.nickname,
            avatarUrl: authStore.user.avatarUrl,
            type: authStore.user.type,
            status: 'online',
            isCreator: isCreator.value,
            isAdmin: false, // 需要从后端获取
        isMuted,
        muteUntil,
            joinTime: new Date().toISOString(),
            lastActiveTime: new Date().toISOString()
          })
        }
        
        console.log('最终成员列表:', roomMembers.value)
        
      } catch (error) {
        console.error('加载成员列表失败:', error)
        // 使用当前用户作为备选
        if (authStore.user) {
      // 检查当前用户的禁言状态
      let isMuted = false
      let muteUntil = null
      if (authStore.user.muteUntil) {
        const muteEndTime = new Date(authStore.user.muteUntil)
        const now = new Date()
        isMuted = now < muteEndTime
        muteUntil = isMuted ? authStore.user.muteUntil : null
      }
      
          roomMembers.value = [{
            uid: authStore.user.uid,
            nickname: authStore.user.nickname,
            avatarUrl: authStore.user.avatarUrl,
            type: authStore.user.type,
            status: 'online',
            isCreator: isCreator.value,
            isAdmin: false,
        isMuted,
        muteUntil,
            joinTime: new Date().toISOString(),
            lastActiveTime: new Date().toISOString()
          }]
        }
      }
    }
    
    // 监听窗口大小变化
    const handleResize = () => {
      checkMobile()
    }
    
// 用户管理函数需要适配新的事件格式
const handleShowUserContextMenu = (event, user, sourceType = 'member') => {
  // 只有创建者或管理员才能显示管理菜单
  if (!isCreator.value && !currentUserIsAdmin.value) return
  
  // 不能对自己使用右键菜单
  if (user.uid === authStore.user?.uid) return
  
  // 不能对创建者使用右键菜单
  if (user.isCreator) return
  
  // 管理员不能对其他管理员使用右键菜单（除非自己是创建者）
  if (!isCreator.value && user.isAdmin) return
  
  showUserContextMenu(event, user, sourceType)
}

// 处理显示消息右键菜单
const handleShowMessageContextMenu = (event, message) => {
  showMessageContextMenu(event, message)
}

// 处理回复消息
const handleReplyMessage = (message) => {
  closeMessageContextMenu()
  
  // 设置回复状态
  replyState.value = {
    isReplying: true,
    targetMessage: message
  }
  
  // 聚焦到输入框
  nextTick(() => {
    const inputElement = document.querySelector('.message-input')
    if (inputElement) {
      inputElement.focus()
    }
  })
}

// 取消回复
const cancelReply = () => {
  replyState.value = {
    isReplying: false,
    targetMessage: null
  }
}

// 滚动到指定消息
const scrollToMessage = (messageId) => {
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
  if (messageElement && messageList.value) {
    messageElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
    
    // 添加高亮效果
    messageElement.classList.add('message-highlight')
    setTimeout(() => {
      messageElement.classList.remove('message-highlight')
    }, 2000)
  }
}

// 处理删除消息
const handleDeleteMessage = (message) => {
  closeMessageContextMenu()
  
  // 显示删除确认弹窗
  deleteMessageDialog.value = {
    visible: true,
    targetMessage: message
  }
}

// 确认删除消息
const confirmDeleteMessage = async () => {
  if (!deleteMessageDialog.value.targetMessage) return
  
  try {
    await axios.delete(`/api/chatrooms/${roomId.value}/messages/${deleteMessageDialog.value.targetMessage.id}`)
    
    // 从本地消息列表中移除
    const index = messages.findIndex(m => m.id === deleteMessageDialog.value.targetMessage.id)
    if (index > -1) {
      messages.splice(index, 1)
    }
    
    notificationStore.success('消息已删除')
    cancelDeleteMessage()
  } catch (error) {
    console.error('删除消息失败:', error)
    notificationStore.error('删除失败: ' + (error.response?.data?.message || error.message))
  }
}

// 取消删除消息
const cancelDeleteMessage = () => {
  deleteMessageDialog.value = {
    visible: false,
    targetMessage: null
  }
}

// 确认禁言
const confirmMute = async (duration) => {
  if (!muteDialog.value.targetUser) return
  
  try {
    await axios.post(`/api/chatrooms/${roomId.value}/mute`, {
      targetUid: muteDialog.value.targetUser.uid,
      duration: duration
    })
    
    notificationStore.success(`已禁言用户 ${muteDialog.value.targetUser.nickname}`)
    
    // 更新成员状态
    const member = roomMembers.value.find(m => m.uid === muteDialog.value.targetUser.uid)
    if (member) {
      member.isMuted = true
      member.muteUntil = new Date(Date.now() + duration * 1000)
    }
    
    cancelMute()
  } catch (error) {
    console.error('禁言用户失败:', error)
    notificationStore.error('禁言失败: ' + (error.response?.data?.message || error.message))
  }
}

// 取消禁言
const unmuteUser = async (user) => {
  closeContextMenu()
  
  try {
    await axios.post(`/api/chatrooms/${roomId.value}/unmute`, {
      targetUid: user.uid
    })
    
    notificationStore.success(`已取消禁言用户 ${user.nickname}`)
    
    // 更新成员状态
    const member = roomMembers.value.find(m => m.uid === user.uid)
    if (member) {
      member.isMuted = false
      member.muteUntil = null
    }
  } catch (error) {
    console.error('取消禁言失败:', error)
    notificationStore.error('取消禁言失败: ' + (error.response?.data?.message || error.message))
  }
}

// 设置/取消管理员
const setUserAdmin = async (user, isAdmin) => {
  closeContextMenu()
  
  try {
    await axios.post(`/api/chatrooms/${roomId.value}/admin`, {
      targetUid: user.uid,
      isAdmin
    })
    
    notificationStore.success(`已${isAdmin ? '设置' : '取消'}用户 ${user.nickname} 的管理员权限`)
    
    // 更新成员状态
    const member = roomMembers.value.find(m => m.uid === user.uid)
    if (member) {
      member.isAdmin = isAdmin
    }
  } catch (error) {
    console.error('设置管理员失败:', error)
    notificationStore.error('操作失败: ' + (error.response?.data?.message || error.message))
  }
}

// 确认踢出用户
const confirmKickUser = async () => {
  if (!kickDialog.value.targetUser) return
  
  try {
    await axios.post(`/api/chatrooms/${roomId.value}/kick`, {
      targetUid: kickDialog.value.targetUser.uid
    })
    
    notificationStore.success(`已移出用户 ${kickDialog.value.targetUser.nickname}`)
    
    // 从成员列表中移除（会通过WebSocket user-left事件自动更新）
    
    cancelKick()
  } catch (error) {
    console.error('踢出用户失败:', error)
    notificationStore.error('踢出失败: ' + (error.response?.data?.message || error.message))
  }
    }
    
    // 生命周期
    onMounted(async () => {
      window.addEventListener('resize', handleResize)
      checkMobile()
      await initializeChatroom()
      await loadJoinedRooms()
      await loadRoomMembers()
      startMuteTimer()
    })
    
    // 在组件卸载时移除事件监听
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      disconnectWebSocket()
      if (muteTimer.value) {
        clearInterval(muteTimer.value)
      }
    })
    
// 在 <script setup> 中，所有顶层定义的变量和函数都会自动暴露给模板
</script>

<style scoped>
/* 基础样式 */
.chatroom-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

/* 暗色模式基础样式 */
.dark .chatroom-container {
  background: #1e293b;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f8f9fa;
}

/* 暗色模式加载状态 */
.dark .loading-container {
  background: #1e293b;
}

.loading-container .loading-spinner {
  font-size: 2rem;
  color: #1976d2;
  margin-bottom: 1rem;
}

/* 暗色模式加载图标 */
.dark .loading-container .loading-spinner {
  color: #60a5fa;
}

.loading-container p {
  color: #6c757d;
  font-size: 1.1rem;
}

/* 暗色模式加载文字 */
.dark .loading-container p {
  color: #cbd5e1;
}

/* 布局 */
.chatroom-layout {
  height: 100vh;
  display: flex;
  background: #f8f9fa;
  overflow: hidden;
}

/* 暗色模式布局 */
.dark .chatroom-layout {
  background: #1e293b;
}

/* 侧边栏通用样式 */
.sidebar {
  width: 280px;
  background: white;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 20;
}

/* 暗色模式侧边栏 */
.dark .sidebar {
  background: #0f172a;
}

.left-sidebar {
  border-right: 1px solid #e9ecef;
}

/* 暗色模式左侧边栏 */
.dark .left-sidebar {
  border-right: 1px solid #475569;
}

.right-sidebar {
  border-left: 1px solid #e9ecef;
}

.right-sidebar .button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

/* 暗色模式右侧边栏 */
.dark .right-sidebar {
  border-left: 1px solid #475569;
}

.sidebar-hidden {
  transform: translateX(-100%);
}

.right-sidebar.sidebar-hidden {
  transform: translateX(100%);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

/* 暗色模式侧边栏头部 */
.dark .sidebar-header {
  border-bottom: 1px solid #475569;
  background: #1e293b;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 暗色模式侧边栏标题 */
.dark .sidebar-header h3 {
  color: #f1f5f9;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: none;
}

.sidebar-toggle:hover {
  background: #e9ecef;
  color: #2c3e50;
}

/* 暗色模式侧边栏切换按钮 */
.dark .sidebar-toggle {
  color: #94a3b8;
}

.dark .sidebar-toggle:hover {
  background: #334155;
  color: #f1f5f9;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 顶部导航栏 */
.chatroom-header {
  background: white;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

/* 暗色模式顶部导航栏 */
.dark .chatroom-header {
  background: #0f172a;
  border-bottom: 1px solid #475569;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: #6c757d;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.mobile-menu-btn:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

/* 暗色模式移动端菜单按钮 */
.dark .mobile-menu-btn {
  color: #94a3b8;
}

.dark .mobile-menu-btn:hover {
  background: #1e293b;
  color: #f1f5f9;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-info h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.room-info .room-name.editable {
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.room-info .room-name.editable:hover {
  text-decoration: underline;
  text-decoration-color: var(--primary-color);
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

/* 暗色模式房间信息标题 */
.dark .room-info h1 {
  color: #f1f5f9;
}

.room-id,
.room-info .room-id {
  color: #6c757d;
  font-size: 14px;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

/* 暗色模式房间ID */
.dark .room-id,
.dark .room-info .room-id {
  color: #94a3b8;
  background: #1e293b;
}

.room-info .room-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

/* 暗色模式房间名称 */
.dark .room-info .room-name {
  color: #f1f5f9;
}

.room-password-indicator {
  color: #ffc107;
  font-size: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 暗色模式用户信息 */
.dark .user-info {
  background: #1e293b;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  margin-right: 3px;
}

/* 暗色模式用户名 */
.dark .user-name {
  color: #f1f5f9;
}

.user-uid {
  font-size: 12px;
  color: #6c757d;
}

/* 暗色模式用户ID */
.dark .user-uid {
  color: #94a3b8;
}

.leave-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s ease;
}

.leave-button:hover {
  background: #c82333;
}

.leave-text {
  display: inline;
}

/* 房间列表样式 */
.room-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.room-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.room-item:hover {
  background: #f8f9fa;
}

/* 暗色模式房间项悬停 */
.dark .room-item:hover {
  background: #334155;
}

.room-active {
  background: #e3f2fd;
}

/* 暗色模式活跃房间 */
.dark .room-active {
  background: #19233c;
}

.room-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-badge {
  background: #dc3545;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.connection-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.connection-dot.connected {
  color: #28a745;
}

.connection-dot.disconnected {
  color: #6c757d;
}

.sidebar-footer {
  padding: 15px;
  border-top: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 暗色模式侧边栏底部 */
.dark .sidebar-footer {
  border-top: 1px solid #475569;
}

.join-chat-button,
.home-button {
  width: 100%;
  border: none;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  transition: background 0.2s ease;
}

.join-chat-button {
  border: 1px solid #28a745;
  color: #28a745;
  background: transparent;
}

.join-chat-button:hover {
  border-color: #218838;
  color: #218838;
}

/* 暗色模式加入聊天按钮 */
.dark .join-chat-button {
  border: 1px solid #10b981;
  color: #10b981;
}

.dark .join-chat-button:hover {
  border-color: #059669;
  color: #059669;
  background: rgba(16, 185, 129, 0.1);
}

.home-button {
  background: #1976d2;
  color: white;
}

.home-button:hover {
  background: #1565c0;
}

/* 暗色模式首页按钮 */
.dark .home-button {
  background: #3b82f6;
}

.dark .home-button:hover {
  background: #2563eb;
}

/* 成员列表样式 */
.member-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.member-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 10px;
  padding: 0 8px;
}

/* 暗色模式章节标题 */
.dark .section-title {
  color: #94a3b8;
}

.online-dot {
  color: #28a745;
  font-size: 10px;
}

/* 暗色模式在线状态点 */
.dark .online-dot {
  color: #10b981;
}

.offline-dot {
  color: #ffc107;
  font-size: 10px;
}

/* 暗色模式离线状态点 */
.dark .offline-dot {
  color: #f59e0b;
}

.left-dot {
  color: #6c757d;
  font-size: 10px;
}

/* 暗色模式离开状态点 */
.dark .left-dot {
  color: #6b7280;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 10px 8px;
  border-radius: 6px;
  transition: background 0.2s ease;
  margin-bottom: 4px;
}

.member-item:hover {
  background: #f8f9fa;
}

/* 暗色模式成员项悬停 */
.dark .member-item:hover {
  background: #334155;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 暗色模式成员名称 */
.dark .member-name {
  color: #f1f5f9;
}

.member-uid {
  font-size: 11px;
  color: #6c757d;
}

/* 暗色模式成员UID */
.dark .member-uid {
  color: #94a3b8;
}

.creator-icon {
  color: #ffd700;
  font-size: 12px;
}

/* 暗色模式创建者图标 */
.dark .creator-icon {
  color: #fbbf24;
}

.admin-icon {
  color: #1976d2;
  font-size: 12px;
}

/* 暗色模式管理员图标 */
.dark .admin-icon {
  color: #60a5fa;
}

.muted-icon {
  color: #dc3545;
  font-size: 12px;
  margin-left: 4px;
}

/* 暗色模式禁言图标 */
.dark .muted-icon {
  color: #ef4444;
}

.member-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.member-status.online {
  background: #d4edda;
  color: #155724;
}

.member-status.offline {
  background: #fff3cd;
  color: #856404;
}

.member-status.left {
  background: #f8d7da;
  color: #721c24;
}

/* 移动端遮罩层 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 15;
  display: none;
}

/* 确认对话框 */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 暗色模式对话框遮罩 */
.dark .confirm-dialog-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

/* 暗色模式确认对话框 */
.dark .confirm-dialog {
  background: #1e293b;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dialog-header {
  padding: 20px 20px 0;
  text-align: center;
}

.dialog-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

/* 暗色模式对话框标题 */
.dark .dialog-header h3 {
  color: #f1f5f9;
}

.dialog-content {
  padding: 20px;
  text-align: center;
}

.dialog-content p {
  margin: 0;
  color: #6c757d;
  line-height: 1.5;
}

/* 暗色模式对话框内容 */
.dark .dialog-content p {
  color: #cbd5e1;
}

.warning-icon {
  color: #ffc107;
  margin-right: 8px;
  font-size: 16px;
}

.dialog-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-button,
.confirm-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-button {
  background: #f8f9fa;
  color: #6c757d;
}

.cancel-button:hover {
  background: #e9ecef;
  color: #495057;
}

/* 暗色模式取消按钮 */
.dark .cancel-button {
  background: #334155;
  color: #cbd5e1;
}

.dark .cancel-button:hover {
  background: #475569;
  color: #f1f5f9;
}

.confirm-button {
  background: #1976d2;
  color: white;
}

.confirm-button:hover {
  background: #1565c0;
}

/* 暗色模式确认按钮 */
.dark .confirm-button {
  background: #3b82f6;
}

.dark .confirm-button:hover {
  background: #2563eb;
}

.confirm-button.danger {
  background: #dc3545;
}

.confirm-button.danger:hover {
  background: #c82333;
}

/* 暗色模式危险按钮 */
.dark .confirm-button.danger {
  background: #ef4444;
}

.dark .confirm-button.danger:hover {
  background: #dc2626;
}

/* 聊天内容区域 */
.chatroom-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  min-height: 0;
}

/* 临时通知样式 */
.temporary-notifications {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 300px;
}

.temp-notification {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #2196f3;
  font-size: 14px;
  color: #2c3e50;
  animation: slideInRight 0.3s ease-out;
  transition: all 0.3s ease;
}

.temp-notification:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.notification-join {
  border-left-color: #4caf50;
}

.notification-join i {
  color: #4caf50;
}

.notification-leave {
  border-left-color: #ff9800;
}

.notification-leave i {
  color: #ff9800;
}

.notification-info {
  border-left-color: #2196f3;
}

.notification-info i {
  color: #2196f3;
}

.notification-warning {
  border-left-color: #ff9800;
}

.notification-warning i {
  color: #ff9800;
}

.notification-error {
  border-left-color: #f44336;
}

.notification-error i {
  color: #f44336;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.messages-area {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.message-list {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column-reverse;
}

.messages-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  justify-content: flex-end;
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #6c757d;
}

/* 暗色模式空消息 */
.dark .empty-messages {
  color: #94a3b8;
}

.empty-messages i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* 加载指示器样式 */
.loading-more,
.no-more-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 16px;
}

/* 暗色模式加载指示器 */
.dark .loading-more,
.dark .no-more-messages {
  color: #94a3b8;
}

.no-more-messages {
  color: #999;
  font-size: 13px;
  padding: 12px;
  opacity: 0.8;
}

.loading-more .loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-more .loading-spinner i {
  font-size: 16px;
}

.no-more-messages i {
  font-size: 14px;
}

/* 消息样式 */
.message {
  padding: 5px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.message:hover {
  background: rgba(25, 118, 210, 0.1);
}

.message-continuous {
  margin-bottom: 4px;
}

.message-first-in-group {
  margin-bottom: 2px;
}

.message-last-in-group {
  margin-bottom: 16px;
}

.message-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-own .message-wrapper {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  width: 40px;
  display: flex;
  justify-content: center;
}

.message-markdown .message-content .markdown-message{
  min-width: 100px;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  word-wrap: break-word;
  position: relative;
}

/* 暗色模式消息内容 */
.dark .message-content {
  background: #334155;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  color: #f1f5f9;
}

.message-continuous .message-content {
  padding: 8px 16px;
  margin-top: 2px;
}

.message-own .message-content {
  background: #1976d2;
  color: white;
}

/* 暗色模式自己的消息 */
.dark .message-own .message-content {
  background: #3b82f6;
}

.message-content::before {
  content: '';
  position: absolute;
  top: 12px;
  left: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-right-color: white;
}

/* 暗色模式消息箭头 */
.dark .message-content::before {
  border-right-color: #334155;
}

.message-own .message-content::before {
  left: auto;
  right: -8px;
  border-left-color: #1976d2;
  border-right-color: transparent;
}

/* 暗色模式自己消息的箭头 */
.dark .message-own .message-content::before {
  border-left-color: #3b82f6;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}


.message-own .user-name {
  color: #e3f2fd;
}

.admin-icon {
  color: #ffc107;
  margin-left: 4px;
  font-size: 10px;
}

.message-time {
  color: #6c757d;
  font-size: 11px;
}

/* 暗色模式消息时间 */
.dark .message-time {
  color: #94a3b8;
}

.message-own .message-time {
  color: #bbdefb;
}

.message-body {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-text {
  line-height: 1.4;
  color: #2c3e50;
  word-break: break-word;
  flex: 1;
}

/* 暗色模式消息文本 */
.dark .message-text {
  color: #f1f5f9;
}

.message-own .message-text {
  color: white;
}

.message-time-inline {
  color: #6c757d;
  font-size: 10px;
  opacity: 0.7;
  white-space: nowrap;
  align-self: flex-end;
  margin-bottom: 2px;
}

/* 暗色模式内联时间 */
.dark .message-time-inline {
  color: #94a3b8;
}

.message-own .message-time-inline {
  color: rgba(255, 255, 255, 0.7);
}

/* 系统消息样式 */
.system-message {
  display: flex;
  justify-content: center;
}

.system-message-content {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  color: #1976d2;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 13px;
  max-width: 80%;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
  border: 1px solid rgba(25, 118, 210, 0.2);
  position: relative;
  overflow: hidden;
}

.system-message-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, #b2d0ee, #d258e7, #b2d0ee);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.system-icon {
  color: #1976d2;
  font-size: 14px;
  opacity: 0.8;
}

.system-text {
  flex: 1;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
}

.system-time {
  color: #666;
  font-size: 11px;
  font-weight: 400;
  opacity: 0.7;
  margin-left: 8px;
  white-space: nowrap;
}

/* 消息高亮效果 */
.message-highlight {
  background: rgba(25, 118, 210, 0.1);
}

/* 回复消息样式 */
.reply-message {
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(25, 118, 210, 0.05);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.reply-message:hover {
  background: rgba(25, 118, 210, 0.1);
}

.reply-line {
  width: 2px;
  background: #1976d2;
  border-radius: 1px;
  margin-top: 2px;
  flex-shrink: 0;
  align-self: stretch;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-user {
  font-size: 12px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 2px;
  line-height: 1.2;
}

.reply-text {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-own .reply-message {
  background: rgba(255, 255, 255, 0.2);
}

.message-own .reply-user {
  color: rgba(255, 255, 255, 0.9);
}

.message-own .reply-text {
  color: rgba(255, 255, 255, 0.7);
}

.message-own .reply-line {
  background: rgba(255, 255, 255, 0.8);
}

/* 输入区域 */
.input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid #e9ecef;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

/* 暗色模式输入区域 */
.dark .input-area {
  background: #0f172a;
  border-top: 1px solid #475569;
}

/* 回复预览样式 */
.reply-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
}

/* 暗色模式回复预览 */
.dark .reply-preview {
  background: #1e293b;
  border: 1px solid #475569;
}

.reply-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #1976d2;
  font-weight: 600;
  min-width: 0;
}

/* 暗色模式回复信息 */
.dark .reply-info {
  color: #60a5fa;
}

.reply-info i {
  font-size: 14px;
}

.reply-content {
  flex: 1;
  font-size: 13px;
  color: #6c757d;
  line-height: 1.3;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 暗色模式回复内容 */
.dark .reply-content {
  color: #94a3b8;
}

.reply-cancel {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.reply-cancel:hover {
  background: #e9ecef;
  color: #dc3545;
}

/* 暗色模式回复取消按钮 */
.dark .reply-cancel {
  color: #94a3b8;
}

.dark .reply-cancel:hover {
  background: #475569;
  color: #ef4444;
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.function-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.message-input:focus {
  border-color: #1976d2;
}

/* 暗色模式消息输入框 */
.dark .message-input {
  background: #334155;
  border: 1px solid #475569;
  color: #f1f5f9;
}

.dark .message-input:focus {
  border-color: #60a5fa;
}

.dark .message-input::placeholder {
  color: #94a3b8;
}

.message-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

/* 暗色模式禁用状态 */
.dark .message-input:disabled {
  background: #1e293b;
  color: #64748b;
}

.send-button {
  width: 48px;
  height: 48px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-button:hover:not(:disabled) {
  background: #1565c0;
  transform: scale(1.05);
}

/* 暗色模式发送按钮悬停 */
.dark .send-button:hover:not(:disabled) {
  background: #2563eb;
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 暗色模式发送按钮禁用 */
.dark .send-button:disabled {
  background: #64748b;
}

.mute-notice,
.auth-notice {
  margin-top: 12px;
  padding: 12px 16px;
  background: #fff3cd;
  color: #856404;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* 暗色模式禁言提示 */
.dark .mute-notice {
  background: #451a03;
  color: #fbbf24;
}

.auth-notice {
  background: #f8d7da;
  color: #721c24;
}

/* 暗色模式认证提示 */
.dark .auth-notice {
  background: #450a0a;
  color: #fca5a5;
}

/* 移动端响应式样式 */
@media (max-width: 768px) {
  .chatroom-layout {
    position: relative;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 30;
    width: 280px;
  }
  
  .left-sidebar {
    left: 0;
  }
  
  .right-sidebar {
    right: 0;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .mobile-menu-btn,
  .sidebar-toggle {
    display: flex;
  }
  
  .chatroom-header {
    padding: 12px 15px;
  }
  
  .header-center .user-info {
    display: none;
  }
  
  .leave-text {
    display: none;
  }
  
  .room-info h1 {
    font-size: 18px;
  }
  
  .room-info {
    gap: 8px;
  }
  
  .confirm-dialog {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .input-area {
    padding: 16px;
  }
  
  .function-buttons {
    margin-bottom: 4px;
  }
  
  .image-button,
  .extend-button {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }
  
  .temporary-notifications {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .temp-notification {
    padding: 10px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
  }
  
  .chatroom-header {
    padding: 10px 12px;
  }
  
  .room-info h1 {
    font-size: 16px;
  }
  
  .room-id {
    font-size: 12px;
  }
  
  .header-left,
  .header-right {
    gap: 8px;
  }
}

/* 图片按钮样式 */
.image-button {
  width: 36px;
  height: 36px;
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #ddd;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-size: 14px;
}

.image-button:hover:not(:disabled) {
  background: #e9ecef;
  color: #1976d2;
  border-color: #1976d2;
  transform: scale(1.05);
}

/* 暗色模式图片按钮悬停 */
.dark .image-button:hover:not(:disabled) {
  background: #475569;
  color: #60a5fa;
  border-color: #60a5fa;
}

.image-button:disabled {
  background: #f8f9fa;
  color: #ccc;
  border-color: #e9ecef;
  cursor: not-allowed;
  transform: none;
}

/* 暗色模式图片按钮禁用 */
.dark .image-button:disabled {
  background: #1e293b;
  color: #64748b;
  border-color: #475569;
}

/* 扩展按钮样式 */
.extend-button {
  width: 36px;
  height: 36px;
  background: #667eea;
  color: white;
  border: 1px solid #667eea;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-size: 14px;
}

.extend-button:hover:not(:disabled) {
  background: #5a67d8;
  border-color: #5a67d8;
  transform: scale(1.05);
}

/* 暗色模式扩展按钮悬停 */
.dark .extend-button:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.extend-button:disabled {
  background: #ccc;
  color: #666;
  border-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 暗色模式扩展按钮禁用 */
.dark .extend-button:disabled {
  background: #64748b;
  color: #475569;
  border-color: #64748b;
}

/* 图片消息样式 */
.message-image {
  margin: 4px 0;
}

.image-content {
  max-width: min(500px, 100%);
  max-height: 500px;
  height: auto;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-content:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-caption {
  margin-top: 8px;
  font-size: 14px;
  color: inherit;
  line-height: 1.4;
}

/* 消息类型标记样式 */
.message-type-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-bottom: 6px;
  opacity: 0.7;
  font-weight: 500;
}

.message-type-header i {
  font-size: 14px;
}

.bilibili-header {
  color: #fb7299;
}

.bilibili-header span {
  font-family: 'Monaco', 'Consolas', monospace;
  background: rgba(251, 114, 153, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.markdown-header {
  color: #333;
}

.markdown-header span {
  background: rgba(51, 51, 51, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

/* 暗色模式Markdown标记 */
.dark .markdown-header {
  color: #e2e8f0;
}

.dark .markdown-header span {
  background: rgba(226, 232, 240, 0.2);
  color: #e2e8f0;
}

/* 发送者消息中的类型标记样式 */
.message-own .message-type-header {
  color: rgba(255, 255, 255, 0.9);
}

.message-own .bilibili-header {
  color: rgba(255, 255, 255, 0.9);
}

.message-own .bilibili-header span {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.message-own .markdown-header {
  color: rgba(255, 255, 255, 0.9);
}

.message-own .markdown-header span {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* B站视频消息样式 */
.bilibili-message {
  max-width: 500px;
  margin: 8px 0;
}

.bilibili-player {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
  display: block;
  aspect-ratio: 16/9;
}

/* Markdown消息样式 */
.markdown-message {
  max-width: 600px;
  margin: 8px 0;
}

.markdown-content {
  line-height: 1.6;
  color: inherit;
}

/* Markdown内容样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 0.8em 0 0.4em 0;
  color: inherit;
}

.markdown-content :deep(h1) {
  font-size: 1.6em;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.2em;
}

.markdown-content :deep(h2) {
  font-size: 1.4em;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.2em;
}

.markdown-content :deep(h3) {
  font-size: 1.2em;
}

.markdown-content :deep(p) {
  margin: 0.6em 0;
}

.markdown-content :deep(code) {
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
  color: #e83e8c;
}

.markdown-content :deep(pre) {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  border-left: 3px solid #333;
  margin: 12px 0;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  color: #2c3e50;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: #2c3e50;
}

.markdown-content :deep(em) {
  font-style: italic;
  color: #6c757d;
}

.markdown-content :deep(a) {
  color: #007bff;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

/* 消息删除动画样式 */
.messages-transition-group {
  position: relative;
}

/* 消息删除动画 */
.message-delete-leave-active {
  transition: all 0.3s ease-out;
  transform-origin: left center;
}

.message-delete-leave-to {
  opacity: 0;
  transform: translateX(-100%) scale(0.8);
  max-height: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

/* 消息删除中的状态样式 */
.message-deleting {
  opacity: 0.5;
  transform: scale(0.98);
  transition: all 0.3s ease;
  position: relative;
}

.message-deleting::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: shimmer 1.5s infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 消息移动动画（当其他消息被删除时） */
.message-delete-move {
  transition: transform 0.3s ease;
}

/* 系统消息删除动画特殊处理 */
.message-system.message-delete-leave-active {
  transition: all 0.25s ease-out;
}

.message-system.message-delete-leave-to {
  opacity: 0;
  transform: scale(0.9);
  max-height: 0;
  padding: 0;
  margin: 0;
}

/* 删除动画的淡入效果优化 */
.message-delete-enter-active {
  transition: all 0.3s ease-in;
}

.message-delete-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.message-delete-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* 桌面端保持横向布局 */
@media (min-width: 769px) {
  .message-form {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }
  
  .function-buttons {
    gap: 8px;
  }
  
  .input-row {
    flex: 1;
  }
  
  .image-button,
  .extend-button {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}

/* 移动端删除动画优化 */
@media (max-width: 768px) {
  .message-delete-leave-to {
    transform: translateX(-50%) scale(0.9);
  }
  
  .message-deleting::after {
    animation-duration: 1s;
  }
}

/* 右键菜单样式已移动到 @/components/common 组件中 */
</style> 