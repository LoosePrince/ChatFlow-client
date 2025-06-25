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
             <LeftSidebar
         :show="showRoomList"
         :rooms="joinedRooms"
         :currentRoomId="roomId"
         :currentUser="authStore.user"
         @toggle="toggleRoomList"
         @switchRoom="switchRoom"
         @goToRoomSelect="goToRoomSelect"
         @goHome="goHome"
         @confirmLeaveRoom="confirmLeaveRoom"
         @roomSettings="handleRoomSettings"
         @leaveRoom="handleLeaveSpecificRoom"
         @userProfile="handleUserProfile"
         @currentRoomSettings="handleCurrentRoomSettings"
       />

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
            <!-- 用户信息已移动到左侧边栏 -->
          </div>
          <div class="header-right">
            <button @click="toggleMemberList" class="mobile-menu-btn">
              <i class="fas fa-user-friends"></i>
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
                  <i class="fas fa-comment-dots"></i>
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
                    
                    <!-- 非文本消息的时间显示（连续消息中） -->
                    <div v-else-if="message.type !== 'user' && message.type !== 'system' && !message.showHeader" class="message-time-header">
                      <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                    </div>
                    
                    <!-- 回复信息 -->
                    <div v-if="message.replyToMessage" class="reply-message" @click="scrollToMessage(message.replyToMessage.id, true)">
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
                          <span v-else-if="message.replyToMessage.messageType === 'file'">
                            <i class="fas fa-file"></i> {{ message.replyToMessage.fileName }}
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
                        <BilibiliVideo :bvid="message.bilibiliId" />
                      </div>
                      <!-- 文件消息 -->
                      <div v-else-if="message.type === 'file'" class="file-message">
                        <div class="message-type-header file-header">
                          <i class="fas fa-file"></i>
                          <span>文件</span>
                        </div>
                        <div class="file-content">
                          <div class="file-info">
                            <div class="file-icon">
                              <i :class="getFileIcon(message.fileName)"></i>
                            </div>
                            <div class="file-details">
                              <div class="file-name">{{ message.fileName }}</div>
                              <div class="file-size">{{ formatFileSize(message.fileSize) }}</div>
                              <div v-if="message.fileExpired" class="file-status expired">
                                <i class="fas fa-exclamation-triangle"></i>
                                文件已过期
                              </div>
                              <div v-else class="file-status valid">
                                <i class="fas fa-clock"></i>
                                {{ formatFileExpiry(message.fileExpiry) }}
                              </div>
                            </div>
                          </div>
                          <button 
                            v-if="!message.fileExpired"
                            @click="downloadFile(message.fileId, message.fileName)"
                            class="download-btn"
                            title="下载文件"
                          >
                            <i class="fas fa-download"></i>
                          </button>
                        </div>
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
                          @click="handleMarkdownImageClick"
                        ></div>
                      </div>
                      <!-- 文本消息 -->
                      <div v-else class="message-text">
                        {{ message.text }}
                        <span v-if="!message.showHeader && message.type === 'user'" class="message-time-inline">{{ formatTime(message.timestamp) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </TransitionGroup>
              </div> <!-- 关闭 messages-container -->
            </div>
          </div>

          <div class="input-area">
            <!-- 隐藏的文件输入框 -->
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              @change="handleImageSelect"
              style="display: none"
            >
            
            <!-- 隐藏的通用文件输入框 -->
            <input
              ref="fileInput"
              type="file"
              @change="handleFileSelect"
              style="display: none"
              accept="*/*"
              title="选择文件（最大2MB）"
            >
            
            <!-- 新的消息输入组件 -->
            <MessageInput
              ref="messageInputComponent"
              v-model="newMessage"
              :canSendMessage="canSendMessage"
              :replyState="replyState"
              :maxLength="500"
              placeholder="输入消息..."
              @sendMessage="handleSendMessage"
              @cancelReply="cancelReply"
              @selectImage="selectImage"
              @showMessageTypeSelector="showMessageTypeSelector"
              @paste="handlePaste"
            />
            
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
      <RightSidebar
        :show="showMemberList"
        :members="roomMembers"
        @toggle="toggleMemberList"
        @showUserContextMenu="handleShowUserContextMenu"
      />
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

    <!-- 上传进度对话框 -->
    <div v-if="uploadProgress.visible" class="upload-progress-overlay">
      <div class="upload-progress-dialog">
        <div class="upload-progress-header">
          <i :class="uploadProgress.type === 'image' ? 'fas fa-image' : 'fas fa-file'"></i>
          <span>{{ uploadProgress.type === 'image' ? '发送图片' : '发送文件' }}</span>
        </div>
        
        <div class="upload-progress-content">
          <div class="upload-file-name">
            {{ uploadProgress.fileName }}
          </div>
          
          <div class="upload-progress-bar">
            <div class="upload-progress-fill" :style="{ width: uploadProgress.progress + '%' }"></div>
          </div>
          
          <div class="upload-progress-text">
            {{ uploadProgress.progress }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 图片压缩确认对话框 -->
    <ImageCompressionDialog
      :visible="compressionDialog.visible"
      :fileName="compressionDialog.fileName"
      :fileSize="compressionDialog.fileSize"
      @confirm="handleCompressionConfirm"
      @cancel="handleCompressionCancel"
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
import ImageCompressionDialog from '@/components/common/ImageCompressionDialog.vue'
import BilibiliVideo from '@/components/common/BilibiliVideo.vue'
import LeftSidebar from '@/components/common/LeftSidebar.vue'
import RightSidebar from '@/components/common/RightSidebar.vue'
import MessageInput from '@/components/common/MessageInput.vue'
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
const messageInputComponent = ref(null)
const imageInput = ref(null)
const fileInput = ref(null)
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
      showHeader: !isContinuous || (message.type !== 'user' && message.type !== 'system')
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
  isLoading: false
})

// 加载聊天室历史消息 - 重新设计为分页加载
const loadMessages = async (loadMore = false, scrollToMessageId = null) => {
  if (messagesPagination.isLoading || (!loadMore && messagesPagination.currentPage > 0)) {
    return
  }
  
  messagesPagination.isLoading = true
  
  try {
    const params = {
      limit: messagesPagination.pageSize,
      offset: messagesPagination.currentPage * messagesPagination.pageSize
    }
    
    const response = await axios.get(`/api/chatrooms/${roomId.value}/messages`, { params })
    
    const messageData = response.data.data
    const messagesArray = Array.isArray(messageData) ? messageData : messageData.messages || []
    
    // 只过滤掉临时系统消息，保留持久系统消息
    const persistentMessages = messagesArray.filter(msg => 
      msg.messageType !== 'system' || 
      (msg.messageType === 'system' && msg.systemMessageType === 'persistent')
    )
    
    // 检查是否有重复消息（防止重复加载）
    const existingIds = new Set(messages.map(m => m.id))
    const newMessages = persistentMessages.filter(msg => !existingIds.has(msg.id))
    
    const formattedMessages = newMessages.map(msg => ({
      id: msg.id,
      type: msg.messageType === 'system' ? 'system' : 
            msg.messageType === 'image' ? 'image' :
            msg.messageType === 'bilibili' ? 'bilibili' :
            msg.messageType === 'markdown' ? 'markdown' :
            msg.messageType === 'file' ? 'file' : 'user',
      userName: msg.user?.nickname || msg.nickname || '未知用户',
      userUid: msg.userUid || msg.sender_uid,
      userAvatar: msg.user?.avatarUrl || msg.avatar_url || '/avatars/default',
      text: msg.content,
      imageUrl: msg.imageUrl,
      bilibiliId: msg.bilibiliId,
      markdownContent: msg.markdownContent,
      fileId: msg.fileId,
      fileName: msg.fileName,
      fileSize: msg.fileSize,
      fileExpiry: msg.fileExpiry,
      fileExpired: msg.fileExpired,
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
      // 后端已经按时间顺序返回（最早的在前面），所以直接插入
      messages.unshift(...formattedMessages)
    } else {
      // 首次加载，直接替换消息数组
      messages.splice(0, messages.length, ...formattedMessages)
    }
    
    // 更新分页状态
    messagesPagination.hasMore = formattedMessages.length === messagesPagination.pageSize
    messagesPagination.currentPage++
    
    // 首次加载时滚动到底部，加载更多时滚动到指定消息
    await nextTick()
    if (!loadMore) {
      scrollToBottom(false)
    } else if (scrollToMessageId) {
      // 滚动到指定消息（通常是加载前的第一条消息），不显示高亮效果
      scrollToMessage(scrollToMessageId, false)
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
  
  // 记住当前第一条消息的ID，用于加载后定位
  const firstMessageId = messages.length > 0 ? messages[0].id : null
  
  await loadMessages(true, firstMessageId)
}

// 保持滚动位置（加载更多消息后使用）
const maintainScrollPosition = () => {
  if (messageList.value) {
    // 在加载更多历史消息后，我们希望用户保持在他们之前查看的位置
    // 由于我们使用了 flex-direction: column-reverse，滚动位置会自动保持合适的位置
    // 但为了确保稳定性，我们可以稍微调整一下
    const currentScrollTop = messageList.value.scrollTop
    
    // 如果用户在很靠近顶部的位置，给一个小的缓冲区
    if (currentScrollTop < 50) {
      messageList.value.scrollTop = 50
    }
  }
}

// 监听滚动事件，实现上拉加载更多
const handleScroll = () => {
  if (!messageList.value || messagesPagination.isLoading || !messagesPagination.hasMore) {
    return
  }
  
  const { scrollTop, scrollHeight, clientHeight } = messageList.value
  
  // 在 column-reverse 布局中：
  // - scrollTop = 0 时在底部（最新消息）
  // - scrollTop = 负数且接近 -(scrollHeight - clientHeight) 时在顶部（最旧消息）
  const maxNegativeScroll = -(scrollHeight - clientHeight)
  const distanceFromTop = Math.abs(scrollTop - maxNegativeScroll)
  
  // 当距离顶部小于100px时，加载更多历史消息
  if (distanceFromTop < 100) {
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
  
  const { scrollTop } = messageList.value
  // 在 column-reverse 布局中，scrollTop 为 0 或接近 0 时表示在底部（最新消息处）
  return scrollTop < 50
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

// 图片压缩函数
const compressImage = async (file, maxSize = 1024 * 1024, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img
      const ratio = Math.min(1920 / width, 1080 / height) // 最大1920x1080
      
      if (ratio < 1) {
        width *= ratio
        height *= ratio
      }
      
      canvas.width = width
      canvas.height = height
      
      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为blob并检查大小
      canvas.toBlob((blob) => {
        if (blob.size <= maxSize) {
          resolve(blob)
        } else {
          // 如果还是太大，降低质量
          const newQuality = Math.max(0.1, quality - 0.1)
          if (newQuality >= 0.1) {
            canvas.toBlob((newBlob) => {
              resolve(newBlob)
            }, file.type, newQuality)
          } else {
            resolve(blob) // 已经是最低质量了
          }
        }
      }, file.type, quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// 上传进度状态
const uploadProgress = ref({
  visible: false,
  progress: 0,
  fileName: '',
  type: 'image' // 'image' or 'file'
})

// 显示上传进度
const showUploadProgress = (fileName, type = 'image') => {
  uploadProgress.value = {
    visible: true,
    progress: 0,
    fileName,
    type
  }
}

// 隐藏上传进度
const hideUploadProgress = () => {
  uploadProgress.value.visible = false
}

// 图片压缩确认对话框
const showImageCompressionDialog = (file) => {
  compressionDialog.value = {
    visible: true,
    fileName: file.name,
    fileSize: file.size,
    file: file,
    resolve: null
  }
}

// 处理压缩确认对话框事件
const handleCompressionConfirm = async () => {
  const file = compressionDialog.value.file
  compressionDialog.value.visible = false
  
  console.log('开始压缩和发送图片:', file?.name, file?.size)
  console.log('当前认证状态:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    canSendMessage: canSendMessage.value,
    roomId: roomId.value
  })
  
  if (!file) {
    console.error('没有找到要压缩的文件')
    return
  }
  
  // 检查是否可以发送消息
  if (!canSendMessage.value) {
    console.error('当前无法发送消息')
    console.error('详细状态:', {
      isAuthenticated: authStore.isAuthenticated,
      userMuteUntil: authStore.user?.muteUntil,
      currentTime: new Date().toISOString()
    })
    notificationStore.error('当前无法发送消息，请检查网络连接或权限')
    return
  }
  
  try {
    console.log('显示上传进度...')
    showUploadProgress(file.name, 'image')
    uploadProgress.value.progress = 30
    
    console.log('开始压缩图片...')
    const compressedBlob = await compressImage(file)
    let finalFile = new File([compressedBlob], file.name, { type: file.type })
    
    console.log('压缩完成，原始大小:', file.size, '压缩后大小:', finalFile.size)
    uploadProgress.value.progress = 60
    
    // 如果压缩后还是太大，继续尝试更高压缩
    const maxSize = 1024 * 1024
    if (finalFile.size > maxSize) {
      console.log('继续进行更高压缩...')
      const moreCompressed = await compressImage(file, maxSize, 0.3)
      finalFile = new File([moreCompressed], file.name, { type: file.type })
      console.log('二次压缩完成，大小:', finalFile.size)
    }
    
    if (finalFile.size > maxSize) {
      console.error('压缩后文件仍然过大:', finalFile.size)
      hideUploadProgress()
      notificationStore.error('图片压缩后仍然过大，请选择更小的图片')
      return
    }
    
    console.log('开始准备上传...')
    
    // 创建FormData
    const formData = new FormData()
    formData.append('image', finalFile)
    formData.append('roomId', roomId.value)
    formData.append('messageType', 'image')
    
    console.log('FormData准备完毕，文件名:', finalFile.name, '文件大小:', finalFile.size)
    
    // 如果是回复消息，添加回复信息
    if (replyState.value.isReplying && replyState.value.targetMessage) {
      formData.append('replyToMessageId', replyState.value.targetMessage.id)
      console.log('添加回复信息:', replyState.value.targetMessage.id)
    }
    
    // 验证FormData内容
    console.log('FormData内容检查:')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File(${value.name}, ${value.size})` : value)
    }
    
    uploadProgress.value.progress = 80
    
    console.log('开始上传图片到服务器...')
    console.log('请求URL:', `/api/chatrooms/${roomId.value}/messages/image`)
    console.log('请求基础URL:', axios.defaults.baseURL)
    console.log('完整请求URL:', `${axios.defaults.baseURL}/api/chatrooms/${roomId.value}/messages/image`)
    
    // 检查认证头
    console.log('认证头:', axios.defaults.headers.common['Authorization'])
    
    // 发送图片
    const response = await axios.post(`/api/chatrooms/${roomId.value}/messages/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          uploadProgress.value.progress = 80 + (progress * 0.2) // 80-100%
          console.log('上传进度:', uploadProgress.value.progress + '%')
        }
      }
    })
    
    console.log('图片上传成功:', response.data)
    uploadProgress.value.progress = 100
    
    // 图片发送成功，WebSocket会自动广播消息
    cancelReply() // 清除回复状态
    
    setTimeout(() => {
      hideUploadProgress()
    }, 500)
    
    // 等待WebSocket消息到达后滚动到底部
    setTimeout(() => {
      scrollToBottom(false)
    }, 100)
    
  } catch (error) {
    console.error('发送图片失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    hideUploadProgress()
    
    let errorMessage = '发送图片失败'
    if (error.response?.status === 413) {
      errorMessage = '图片太大，无法上传'
    } else if (error.response?.status === 403) {
      errorMessage = '没有权限发送图片'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    notificationStore.error(errorMessage)
  }
}

const handleCompressionCancel = () => {
  compressionDialog.value.visible = false
  if (compressionDialog.value.resolve) {
    compressionDialog.value.resolve(false)
  }
}

// 发送图片消息
const sendImageMessage = async (file, skipSizeCheck = false) => {
  if (!canSendMessage.value) return
  
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    notificationStore.error('只能发送图片文件')
    return
  }

  let finalFile = file
  
  // 检查文件大小（1MB = 1024 * 1024 bytes）
  const maxSize = 1024 * 1024
  if (file.size > maxSize && !skipSizeCheck) {
    // 显示压缩确认对话框
    showImageCompressionDialog(file)
    return // 对话框处理压缩和发送
  }
  
  try {
    if (!uploadProgress.value.visible) {
      showUploadProgress(finalFile.name, 'image')
    }
    
    // 创建FormData
    const formData = new FormData()
    formData.append('image', finalFile)
    formData.append('roomId', roomId.value)
    formData.append('messageType', 'image')
    
    // 如果是回复消息，添加回复信息
    if (replyState.value.isReplying && replyState.value.targetMessage) {
      formData.append('replyToMessageId', replyState.value.targetMessage.id)
    }
    
    uploadProgress.value.progress = 80
    
    // 发送图片
    const response = await axios.post(`/api/chatrooms/${roomId.value}/messages/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          uploadProgress.value.progress = 80 + (progress * 0.2) // 80-100%
        }
      }
    })
    
    uploadProgress.value.progress = 100
    
    // 图片发送成功，WebSocket会自动广播消息
    cancelReply() // 清除回复状态
    
    setTimeout(() => {
      hideUploadProgress()
    }, 500)
    
    // 等待WebSocket消息到达后滚动到底部
    setTimeout(() => {
      scrollToBottom(false)
    }, 100)
    
  } catch (error) {
    console.error('发送图片失败:', error)
    hideUploadProgress()
    
    let errorMessage = '发送图片失败'
    if (error.response?.status === 413) {
      errorMessage = '图片文件过大'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    notificationStore.error(errorMessage)
  }
}

// 处理来自MessageInput组件的发送消息事件
const handleSendMessage = async (messageText) => {
  if (!messageText.trim() || !canSendMessage.value) return
  
  // 设置消息内容
  newMessage.value = messageText
  
  // 调用现有的发送消息逻辑
  await sendMessage()
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

// 图片压缩确认对话框状态
const compressionDialog = ref({
  visible: false,
  fileName: '',
  fileSize: 0,
  file: null,
  resolve: null
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
  } else if (type === 'file') {
    selectFile()
  }
}

// 选择文件
const selectFile = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    console.log('选择文件:', {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
    })
    sendFileMessage(file)
  }
  // 清空input的值，允许重复选择同一文件
  event.target.value = ''
}

// 检查文件是否为图片
const isImageFile = (file) => {
  return file.type && file.type.startsWith('image/')
}

// 发送文件消息
const sendFileMessage = async (file) => {
  console.log('开始发送文件消息:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    canSendMessage: canSendMessage.value,
    isImage: isImageFile(file)
  })
  
  if (!canSendMessage.value) {
    const errorMessage = '当前无法发送文件，请检查权限'
    console.log('无法发送消息，权限检查失败')
    notificationStore.error(errorMessage)
    return
  }
  
  // 如果是图片文件，使用图片发送方式
  if (isImageFile(file)) {
    console.log('检测到图片文件，使用图片发送方式')
    await sendImageMessage(file)
    return
  }
  
  // 检查文件大小（2MB = 2 * 1024 * 1024 bytes）
  const maxSize = 2 * 1024 * 1024
  console.log('检查文件大小:', {
    fileSize: file.size,
    maxSize: maxSize,
    sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
    maxSizeInMB: (maxSize / (1024 * 1024)).toFixed(2),
    isOverLimit: file.size > maxSize
  })
  
  if (file.size > maxSize) {
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2)
    const errorMessage = `文件大小超出限制：${fileSizeInMB}MB，最大允许2MB`
    console.error('文件大小超出限制:', fileSizeInMB + 'MB > 2MB')
    
    // 显示通知
    notificationStore.error(errorMessage)
    
    return
  }
  
  // 如果文件为空或无效
  if (!file || file.size === 0) {
    const errorMessage = '选择的文件无效或为空'
    console.error('文件无效或为空')
    notificationStore.error(errorMessage)
    return
  }
  
  try {
    console.log('开始上传文件...')
    showUploadProgress(file.name, 'file')
    
    // 第一步：上传文件到服务器
    const formData = new FormData()
    formData.append('file', file)
    formData.append('chatroomId', roomId.value)
    
    // 如果是回复消息，添加回复信息
    if (replyState.value.isReplying && replyState.value.targetMessage) {
      formData.append('replyToMessageId', replyState.value.targetMessage.id)
    }
    
    uploadProgress.value.progress = 20
    
    console.log('发送上传请求到服务器...')
    // 上传文件
    const uploadResponse = await axios.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          uploadProgress.value.progress = 20 + (progress * 0.6) // 20-80%
          console.log('上传进度:', uploadProgress.value.progress + '%')
        }
      }
    })
    
    console.log('文件上传响应:', uploadResponse.data)
    const { fileId, fileName, fileSize, expiryTime } = uploadResponse.data.data
    
    uploadProgress.value.progress = 90
    
    console.log('发送文件消息到聊天室...')
    // 第二步：发送文件消息
    const messageResponse = await axios.post(`/api/chatrooms/${roomId.value}/messages/file`, {
      fileId,
      fileName,
      fileSize,
      replyToMessageId: replyState.value.isReplying ? replyState.value.targetMessage.id : undefined
    })
    
    console.log('文件消息发送成功:', messageResponse.data)
    uploadProgress.value.progress = 100
    
    // 文件发送成功，WebSocket会自动广播消息
    cancelReply() // 清除回复状态
    
    setTimeout(() => {
      hideUploadProgress()
    }, 500)
    
    // 等待WebSocket消息到达后滚动到底部
    setTimeout(() => {
      scrollToBottom(false)
    }, 100)
    
  } catch (error) {
    console.error('发送文件失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      fileName: file.name,
      fileSize: file.size
    })
    hideUploadProgress()
    
    let errorMessage = '发送文件失败'
    if (error.response?.status === 413) {
      errorMessage = `文件过大：${(file.size / (1024 * 1024)).toFixed(2)}MB，请选择小于2MB的文件`
    } else if (error.response?.status === 403) {
      errorMessage = '没有权限上传文件'
    } else if (error.response?.status === 400 && error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    console.error('最终错误消息:', errorMessage)
    notificationStore.error(errorMessage)
  }
}

// 获取文件图标
const getFileIcon = (fileName) => {
  if (!fileName) return 'fas fa-file'
  
  const extension = fileName.split('.').pop()?.toLowerCase()
  const iconMap = {
    // 图片
    'jpg': 'fas fa-file-image',
    'jpeg': 'fas fa-file-image',
    'png': 'fas fa-file-image',
    'gif': 'fas fa-file-image',
    'bmp': 'fas fa-file-image',
    'webp': 'fas fa-file-image',
    'svg': 'fas fa-file-image',
    
    // 文档
    'pdf': 'fas fa-file-pdf',
    'doc': 'fas fa-file-word',
    'docx': 'fas fa-file-word',
    'txt': 'fas fa-file-alt',
    'rtf': 'fas fa-file-alt',
    
    // 表格
    'xls': 'fas fa-file-excel',
    'xlsx': 'fas fa-file-excel',
    'csv': 'fas fa-file-csv',
    
    // 演示文稿
    'ppt': 'fas fa-file-powerpoint',
    'pptx': 'fas fa-file-powerpoint',
    
    // 压缩文件
    'zip': 'fas fa-file-archive',
    'rar': 'fas fa-file-archive',
    '7z': 'fas fa-file-archive',
    'tar': 'fas fa-file-archive',
    'gz': 'fas fa-file-archive',
    
    // 音频
    'mp3': 'fas fa-file-audio',
    'wav': 'fas fa-file-audio',
    'flac': 'fas fa-file-audio',
    'aac': 'fas fa-file-audio',
    
    // 视频
    'mp4': 'fas fa-file-video',
    'avi': 'fas fa-file-video',
    'mkv': 'fas fa-file-video',
    'wmv': 'fas fa-file-video',
    'mov': 'fas fa-file-video',
    
    // 代码
    'js': 'fas fa-file-code',
    'html': 'fas fa-file-code',
    'css': 'fas fa-file-code',
    'php': 'fas fa-file-code',
    'py': 'fas fa-file-code',
    'java': 'fas fa-file-code',
    'cpp': 'fas fa-file-code',
    'c': 'fas fa-file-code',
    'vue': 'fas fa-file-code',
    'json': 'fas fa-file-code'
  }
  
  return iconMap[extension] || 'fas fa-file'
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// 格式化文件过期时间
const formatFileExpiry = (expiry) => {
  if (!expiry) return ''
  
  const expiryDate = new Date(expiry)
  const now = new Date()
  const diffMs = expiryDate - now
  
  if (diffMs <= 0) return '已过期'
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  
  if (diffHours > 0) {
    return `${diffHours}小时${diffMinutes % 60}分钟后过期`
  } else {
    return `${diffMinutes}分钟后过期`
  }
}

// 下载文件
const downloadFile = async (fileId, fileName) => {
  try {
    // 使用GET请求下载文件
    const response = await axios.get(`/api/files/download/${fileId}`, {
      responseType: 'blob'
    })
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    // 清理URL对象
    window.URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('下载文件失败:', error)
    if (error.response?.status === 404) {
      notificationStore.error('文件已过期或不存在')
    } else if (error.response?.status === 410) {
      notificationStore.error('文件已过期')
    } else {
      notificationStore.error('下载失败: ' + (error.response?.data?.message || error.message))
    }
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
  // 避免无限循环，如果已经是默认图片则不再重试
  if (event.target.src.includes('avatars/default') || event.target.dataset.errorHandled) {
    event.target.style.display = 'none'
    return
  }
  
  event.target.dataset.errorHandled = 'true'
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  event.target.src = `${baseUrl}/avatars/default`
  event.target.alt = '图片加载失败'
}

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true,
  sanitize: false
})

// 处理markdown中的图片点击事件
const handleMarkdownImageClick = (event) => {
  const img = event.target
  if (img.tagName === 'IMG' && img.classList.contains('markdown-image')) {
    event.preventDefault()
    // 优先使用原始URL，如果没有则使用src
    const imageUrl = img.dataset.originalSrc || img.src
    const imageTitle = img.alt || img.title || '图片预览'
    
    console.log('点击markdown图片:', { imageUrl, imageTitle })
    openImagePreview(imageUrl, imageTitle)
  }
}

// 使用marked库渲染Markdown内容
const renderMarkdown = (content) => {
  if (!content) return ''
  
  try {
    // 配置marked渲染器
    const renderer = new marked.Renderer()
    
    // 自定义图片渲染
    renderer.image = function(href, title, text) {
      // 确保href是字符串
      const imageUrl = typeof href === 'string' ? href : (href?.href || href?.url || '')
      
      if (!imageUrl) {
        return `<span style="color: #dc3545; font-style: italic;">图片链接无效</span>`
      }
      
      // 安全地处理title和alt属性
      const safeTitle = title ? title.replace(/"/g, '&quot;') : ''
      const safeAlt = text ? text.replace(/"/g, '&quot;') : ''
      const titleAttr = safeTitle ? ` title="${safeTitle}"` : ''
      const altAttr = safeAlt ? ` alt="${safeAlt}"` : ''
      
      return `<img src="${imageUrl}" data-original-src="${imageUrl}"${titleAttr}${altAttr} class="markdown-image" style="max-width: 100%; height: auto; cursor: pointer; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">`
    }
    
    return marked(content, { renderer })
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
            messageData.messageType === 'markdown' ? 'markdown' :
            messageData.messageType === 'file' ? 'file' : 'user',
      userName: messageData.user?.nickname || messageData.userName || '未知用户',
      userUid: messageData.userUid || messageData.sender_uid,
      userAvatar: messageData.user?.avatarUrl || messageData.userAvatar || '/avatars/default',
      text: messageData.content,
      imageUrl: messageData.imageUrl,
      bilibiliId: messageData.bilibiliId,
      markdownContent: messageData.markdownContent,
      fileId: messageData.fileId,
      fileName: messageData.fileName,
      fileSize: messageData.fileSize,
      fileExpiry: messageData.fileExpiry,
      fileExpired: messageData.fileExpired,
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

// 处理房间设置
const handleRoomSettings = (room) => {
  // 触发房间名称编辑对话框
  showRoomNameDialog()
}

// 处理用户设置
const handleUserProfile = () => {
  // 跳转到个人设置页面
  router.push({ name: 'Profile' })
}

// 处理当前房间设置
const handleCurrentRoomSettings = () => {
  // 触发房间名称编辑对话框
  showRoomNameDialog()
}

// 处理离开特定房间
const handleLeaveSpecificRoom = (room) => {
  if (room.roomId === roomId.value) {
    // 如果是当前房间，使用现有的确认对话框
    confirmLeaveRoom()
  } else {
    // 如果是其他房间，直接离开
    leaveSpecificRoom(room.roomId)
  }
}

// 离开特定房间
const leaveSpecificRoom = async (targetRoomId) => {
  try {
    await axios.post(`/api/chatrooms/${targetRoomId}/leave`)
    notificationStore.success('已退出房间')
    
    // 刷新房间列表
    await loadJoinedRooms()
  } catch (error) {
    console.error('退出房间失败:', error)
    notificationStore.error('退出失败: ' + (error.response?.data?.message || error.message))
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
    if (messageInputComponent.value) {
      messageInputComponent.value.focus()
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
const scrollToMessage = (messageId, withHighlight = true) => {
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
  if (messageElement && messageList.value) {
    messageElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
    
    // 只在需要时添加高亮效果
    if (withHighlight) {
      messageElement.classList.add('message-highlight')
      setTimeout(() => {
        messageElement.classList.remove('message-highlight')
      }, 2000)
    }
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
  justify-content: flex-end;
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

/* 移动端菜单按钮图标颜色 */
.mobile-menu-btn i {
  color: #1976d2;
}

.header-right .mobile-menu-btn i {
  color: #17a2b8;
}

/* 暗色模式移动端菜单按钮图标 */
.dark .mobile-menu-btn i {
  color: #60a5fa;
}

.dark .header-right .mobile-menu-btn i {
  color: #06b6d4;
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

/* 用户信息样式已移动到 LeftSidebar.vue */







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
  /* Safari 修复 */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

/* 移动端和Safari滚动修复 */
@media (max-width: 768px) {
  .messages-area {
    -webkit-overflow-scrolling: touch;
  }
  
  .message-list {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}

/* 针对iOS Safari的特殊处理 */
@supports (-webkit-appearance: none) and (not (appearance: none)) {
  .message-list {
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
  }
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
  /* Safari 滚动条修复 */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

/* Safari 和 Webkit 浏览器滚动条样式 */
.message-list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

/* 暗色模式滚动条 */
.dark .message-list {
  scrollbar-color: #475569 transparent;
}

.dark .message-list::-webkit-scrollbar-thumb {
  background-color: #475569;
}

.dark .message-list::-webkit-scrollbar-thumb:hover {
  background-color: #64748b;
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
  opacity: 0.7;
  color: #17a2b8;
}

/* 暗色模式空消息图标 */
.dark .empty-messages i {
  color: #06b6d4;
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
  color: #1976d2;
}

.no-more-messages i {
  font-size: 14px;
  color: #6c757d;
}

/* 暗色模式加载和历史消息图标 */
.dark .loading-more .loading-spinner i {
  color: #60a5fa;
}

.dark .no-more-messages i {
  color: #94a3b8;
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
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

/* 暗色模式自己的消息 */
.dark .message-own .message-content {
  background: #334155;
  color: #ffffff;
  border: 1px solid #1e293b;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  gap: 4px;
}


.message-own .user-name {
  color: #1976d2;
}

/* 暗色模式自己消息的用户名 */
.dark .message-own .user-name {
  color: #ffffff;
}

.admin-icon {
  color: #ffc107;
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
  color: #1976d2;
}

/* 暗色模式自己消息的时间 */
.dark .message-own .message-time {
  color: #ffffff;
}

/* 非文本消息的时间头部样式 */
.message-time-header {
  margin-bottom: 4px;
  text-align: right;
}

.message-time-header .message-time {
  font-size: 11px;
  color: #6c757d;
  opacity: 0.8;
}

/* 暗色模式时间头部 */
.dark .message-time-header .message-time {
  color: #94a3b8;
}

/* 自己消息的时间头部 */
.message-own .message-time-header .message-time {
  color: #1976d2;
  opacity: 0.8;
}

/* 暗色模式自己消息的时间头部 */
.dark .message-own .message-time-header .message-time {
  color: #ffffff;
  opacity: 0.8;
}

.message-body {
  width: 100%;
}

.message-text {
  line-height: 1.4;
  color: #2c3e50;
  word-break: break-word;
  white-space: break-spaces;
  flex: 1;
  overflow: hidden;
  text-align: justify;
  font-size: 14px;
}

/* 暗色模式消息文本 */
.dark .message-text {
  color: #f1f5f9;
}

.message-own .message-text {
  color: #1976d2;
}

/* 暗色模式自己消息的文本 */
.dark .message-own .message-text {
  color: #ffffff;
}

.message-time-inline {
  color: #6c757d;
  font-size: 10px;
  opacity: 0.7;
  white-space: nowrap;
  float: right;
  margin-left: 8px;
  line-height: inherit;
}

/* 暗色模式内联时间 */
.dark .message-time-inline {
  color: #94a3b8;
}

.message-own .message-time-inline {
  color: #1976d2;
  opacity: 0.8;
}

/* 暗色模式自己消息的内联时间 */
.dark .message-own .message-time-inline {
  color: #ffffff;
  opacity: 0.8;
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

/* 暗色模式系统图标 */
.dark .system-icon {
  color: #60a5fa;
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
  font-size: 12px;
  color: #6c757d;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-own .reply-message {
  background: rgba(25, 118, 210, 0.1);
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.message-own .reply-user {
  color: #1976d2;
}

.message-own .reply-text {
  color: #1976d2;
  opacity: 0.8;
}

.message-own .reply-line {
  background: #1976d2;
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

/* 提示信息图标颜色 */
.mute-notice i {
  color: #ffc107;
}

.auth-notice i {
  color: #dc3545;
}

/* 暗色模式提示图标 */
.dark .mute-notice i {
  color: #fbbf24;
}

.dark .auth-notice i {
  color: #ef4444;
}

/* 移动端响应式样式 */
@media (max-width: 768px) {
  .chatroom-layout {
    position: relative;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .chatroom-header {
    padding: 12px 15px;
  }
  
  .header-center .user-info {
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
    max-width: calc(100% - 80px);
  }
  
  .input-area {
    padding: 16px;
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



/* 图片消息样式 */
.message-image {
  margin: 4px 0;
}

.image-content {
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
  font-size: 13px;
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



.markdown-header {
  color: #333;
}

.markdown-header span {
  background: rgba(51, 51, 51, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.file-header {
  color: #28a745;
}

.file-header span {
  background: rgba(40, 167, 69, 0.1);
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

/* 暗色模式文件标记 */
.dark .file-header {
  color: #10b981;
}

.dark .file-header span {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

/* 发送者消息中的类型标记样式 */
.message-own .message-type-header {
  color: #1976d2;
}

.message-own .markdown-header {
  color: #1976d2;
}

.message-own .markdown-header span {
  background: rgba(25, 118, 210, 0.2);
  color: #1976d2;
}

.message-own .file-header {
  color: #28a745;
}

.message-own .file-header span {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

/* B站视频消息样式 */
.bilibili-message {
  margin: 8px 0;
}

/* 文件消息样式 */
.file-message {
  max-width: 400px;
  margin: 8px 0;
}

.file-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.file-content:hover {
  background: #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 暗色模式文件内容 */
.dark .file-content {
  background: #334155;
  border: 1px solid #475569;
}

.dark .file-content:hover {
  background: #475569;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  border-radius: 8px;
  color: #1976d2;
  font-size: 18px;
  flex-shrink: 0;
}

/* 暗色模式文件图标 */
.dark .file-icon {
  background: #1e3a8a;
  color: #60a5fa;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  margin-bottom: 2px;
  word-break: break-all;
  line-height: 1.2;
}

/* 暗色模式文件名 */
.dark .file-name {
  color: #f1f5f9;
}

.file-size {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 2px;
}

/* 暗色模式文件大小 */
.dark .file-size {
  color: #94a3b8;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
}

.file-status.valid {
  color: #28a745;
}

.file-status.expired {
  color: #dc3545;
}

/* 暗色模式文件状态 */
.dark .file-status.valid {
  color: #10b981;
}

.dark .file-status.expired {
  color: #ef4444;
}

.download-btn {
  width: 36px;
  height: 36px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-size: 14px;
}

.download-btn:hover {
  background: #218838;
  transform: scale(1.05);
}

/* 暗色模式下载按钮 */
.dark .download-btn {
  background: #10b981;
}

.dark .download-btn:hover {
  background: #059669;
}

/* 消息发送者的文件消息样式 */
.message-own .file-content {
  background: rgba(25, 118, 210, 0.1);
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.message-own .file-content:hover {
  background: rgba(25, 118, 210, 0.15);
}

.message-own .file-icon {
  background: rgba(25, 118, 210, 0.2);
  color: #1976d2;
}

.message-own .file-name {
  color: #1976d2;
}

.message-own .file-size {
  color: #1976d2;
  opacity: 0.7;
}

.message-own .file-status.valid {
  color: #28a745;
}

.message-own .file-status.expired {
  color: #dc3545;
}

.message-own .download-btn {
  background: #28a745;
  color: white;
}

.message-own .download-btn:hover {
  background: #218838;
}

/* Markdown消息样式 */
.markdown-message {
  max-width: 600px;
  margin: 8px 0;
}

.markdown-content {
  line-height: 1.6;
  color: inherit;
  font-size: 14px;
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
  font-size: 1.4em;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.2em;
}

/* 暗色模式标题边框 */
.dark .markdown-content :deep(h1) {
  border-bottom-color: #475569;
}

.markdown-content :deep(h2) {
  font-size: 1.2em;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.2em;
}

/* 暗色模式标题边框 */
.dark .markdown-content :deep(h2) {
  border-bottom-color: #475569;
}

.markdown-content :deep(h3) {
  font-size: 1.1em;
}

.markdown-content :deep(p) {
  margin: 0.6em 0;
}

.markdown-content :deep(code) {
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.85em;
  color: #e83e8c;
}

/* 暗色模式代码 */
.dark .markdown-content :deep(code) {
  background: #374151;
  color: #f472b6;
}

.markdown-content :deep(pre) {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  border-left: 3px solid #333;
  margin: 12px 0;
}

/* 暗色模式代码块 */
.dark .markdown-content :deep(pre) {
  background: #374151;
  border-left-color: #9ca3af;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  color: #2c3e50;
}

/* 暗色模式代码块内容 */
.dark .markdown-content :deep(pre code) {
  color: #e5e7eb;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: #2c3e50;
}

/* 暗色模式粗体 */
.dark .markdown-content :deep(strong) {
  color: #f1f5f9;
}

.markdown-content :deep(em) {
  font-style: italic;
  color: #6c757d;
}

/* 暗色模式斜体 */
.dark .markdown-content :deep(em) {
  color: #94a3b8;
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



/* 移动端删除动画优化 */
@media (max-width: 768px) {
  .message-delete-leave-to {
    transform: translateX(-50%) scale(0.9);
  }
  
  .message-deleting::after {
    animation-duration: 1s;
  }
}

/* 上传进度对话框样式 */
.upload-progress-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(4px);
}

.upload-progress-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  min-width: 350px;
  max-width: 90%;
  overflow: hidden;
  animation: uploadDialogFadeIn 0.3s ease-out;
}

@keyframes uploadDialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.upload-progress-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.upload-progress-header i {
  font-size: 18px;
}

.upload-progress-content {
  padding: 20px;
}

.upload-file-name {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 16px;
  word-break: break-all;
  line-height: 1.4;
}

.upload-progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.upload-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.upload-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progressShimmer 1.5s infinite;
}

@keyframes progressShimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.upload-progress-text {
  text-align: center;
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
}

/* 暗色模式样式 */
.dark .upload-progress-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark .upload-progress-dialog {
  background: #1f2937;
  color: #f1f5f9;
}

.dark .upload-file-name {
  color: #f1f5f9;
}

.dark .upload-progress-bar {
  background: #374151;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .upload-progress-dialog {
    min-width: auto;
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .upload-progress-header,
  .upload-progress-content {
    padding: 16px;
  }

  .message-list {
    padding: 10px;
  }

  .system-message-content {
    display: block;
    text-align: center;
  }

  .message-text {
    font-size: 13px;
  }
}

/* 右键菜单样式已移动到 @/components/common 组件中 */
</style> 