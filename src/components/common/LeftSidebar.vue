<template>
  <div class="sidebar left-sidebar" :class="{ 'sidebar-hidden': !show }">
    <div class="sidebar-header">
      <h3>
        <i class="fas fa-home"></i>
        房间列表
      </h3>
      <button @click="$emit('toggle')" class="sidebar-toggle">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="room-list">
      <div 
        v-for="room in rooms" 
        :key="room.roomId"
        :class="['room-item', { 'room-active': room.roomId === currentRoomId }]"
        @click="handleRoomClick(room)"
        @contextmenu="handleRoomContextMenu($event, room)"
      >
        <div class="room-info">
          <div class="room-name">{{ room.name }}</div>
          <div class="room-id">{{ room.roomId }}</div>
        </div>
        <div class="room-status">
          <span v-if="room.unreadCount > 0" class="unread-badge">{{ room.unreadCount }}</span>
          <i :class="['connection-dot', room.connected ? 'connected' : 'disconnected']"></i>
          <button 
            class="room-menu-btn" 
            @click.stop="handleRoomMenuClick($event, room)"
            :title="'房间菜单'"
          >
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="sidebar-footer">
      <button @click="$emit('goToRoomSelect')" class="join-chat-button">
        <i class="fas fa-plus"></i>
        <span>添加房间</span>
      </button>
      <button @click="$emit('goHome')" class="home-button">
        <i class="fas fa-home"></i>
        <span>返回首页</span>
      </button>
      <!-- 用户信息和主题切换 -->
      <div class="footer-action-buttons">
        <ThemeToggle />
        <div 
          class="user-info-section"
          @click="handleUserInfoClick"
          @contextmenu="handleUserInfoContextMenu"
        >
          <img 
            :src="userAvatarUrl" 
            :alt="currentUser?.nickname"
            class="user-avatar"
          >
          <div class="user-details">
            <span class="user-name">{{ currentUser?.nickname }}</span>
            <span class="user-uid">{{ currentUser?.uid }}</span>
          </div>
          <button class="user-menu-btn" @click.stop="handleUserMenuClick" title="用户菜单">
            <i class="fas fa-ellipsis-h"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 侧边栏右键菜单 -->
    <SidebarContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :type="contextMenu.type"
      :isContextMenu="contextMenu.isContextMenu"
      :triggerWidth="contextMenu.triggerWidth"
      :triggerHeight="contextMenu.triggerHeight"
      @close="closeContextMenu"
      @roomSettings="handleRoomSettings"
      @leaveRoom="handleLeaveRoom"
      @userProfile="handleUserProfile"
      @currentRoomSettings="handleCurrentRoomSettings"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import SidebarContextMenu from './SidebarContextMenu.vue'

// 定义 props
const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  rooms: {
    type: Array,
    default: () => []
  },
  currentRoomId: {
    type: String,
    default: ''
  },
  currentUser: {
    type: Object,
    default: () => null
  }
})

// 定义 emits
const emit = defineEmits([
  'toggle',
  'switchRoom',
  'goToRoomSelect',
  'goHome',
  'confirmLeaveRoom',
  'roomSettings',
  'leaveRoom',
  'userProfile',
  'currentRoomSettings'
])

// 右键菜单状态
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  type: 'room', // 'room' 或 'user'
  targetRoom: null,
  isContextMenu: false, // 是否为右键菜单
  triggerWidth: 0, // 触发元素宽度
  triggerHeight: 0 // 触发元素高度
})

// 计算用户头像URL
const userAvatarUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  if (!props.currentUser?.avatarUrl) {
    return `${baseUrl}/avatars/default`
  }
  
  // 如果是完整URL，直接返回
  if (props.currentUser.avatarUrl.startsWith('http') || props.currentUser.avatarUrl.startsWith('data:')) {
    return props.currentUser.avatarUrl
  }
  
  // 使用新的固定头像URL格式
  return `${baseUrl}${props.currentUser.avatarUrl}`
})

// 点击房间项
const handleRoomClick = (room) => {
  emit('switchRoom', room.roomId)
}

// 右键菜单
const handleRoomContextMenu = (event, room) => {
  event.preventDefault()
  
  contextMenu.type = 'room'
  contextMenu.targetRoom = room
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.isContextMenu = true
  contextMenu.triggerWidth = 0
  contextMenu.triggerHeight = 0
  contextMenu.visible = true
}

// 三个点按钮菜单
const handleRoomMenuClick = (event, room) => {
  event.preventDefault()
  
  const rect = event.target.getBoundingClientRect()
  contextMenu.type = 'room'
  contextMenu.targetRoom = room
  contextMenu.x = rect.left
  contextMenu.y = rect.top
  contextMenu.isContextMenu = false
  contextMenu.triggerWidth = rect.width
  contextMenu.triggerHeight = rect.height
  contextMenu.visible = true
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenu.visible = false
  contextMenu.targetRoom = null
  contextMenu.type = 'room'
  contextMenu.isContextMenu = false
  contextMenu.triggerWidth = 0
  contextMenu.triggerHeight = 0
}

// 房间设置
const handleRoomSettings = () => {
  emit('roomSettings', contextMenu.targetRoom)
  closeContextMenu()
}

// 退出房间
const handleLeaveRoom = () => {
  emit('leaveRoom', contextMenu.targetRoom)
  closeContextMenu()
}

// 用户信息相关方法
const handleUserInfoClick = () => {
  // 点击用户信息区域，可以添加默认行为（如跳转个人设置）
  emit('userProfile')
}

const handleUserInfoContextMenu = (event) => {
  event.preventDefault()
  
  contextMenu.type = 'user'
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.isContextMenu = true
  contextMenu.triggerWidth = 0
  contextMenu.triggerHeight = 0
  contextMenu.visible = true
}

const handleUserMenuClick = (event) => {
  event.preventDefault()
  
  const rect = event.target.getBoundingClientRect()
  contextMenu.type = 'user'
  contextMenu.x = rect.left
  contextMenu.y = rect.top
  contextMenu.isContextMenu = false
  contextMenu.triggerWidth = rect.width
  contextMenu.triggerHeight = rect.height
  contextMenu.visible = true
}

const handleUserProfile = () => {
  emit('userProfile')
  closeContextMenu()
}

const handleCurrentRoomSettings = () => {
  emit('currentRoomSettings')
  closeContextMenu()
}

// 点击其他地方关闭菜单
const handleClickOutside = (event) => {
  if (contextMenu.visible) {
    closeContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 侧边栏通用样式 */
.sidebar {
  width: 260px;
  background: white;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 20;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 暗色模式侧边栏 */
.dark .sidebar {
  background: #0f172a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.left-sidebar {
  border-right: 1px solid #e9ecef;
}

/* 暗色模式左侧边栏 */
.dark .left-sidebar {
  border-right: 1px solid #475569;
}

.sidebar-hidden {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 16px 18px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  min-height: 56px;
}

/* 暗色模式侧边栏头部 */
.dark .sidebar-header {
  border-bottom: 1px solid #475569;
  background: #1e293b;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 暗色模式侧边栏标题 */
.dark .sidebar-header h3 {
  color: #f1f5f9;
}

/* 房间列表图标 */
.left-sidebar .sidebar-header h3 i {
  color: #28a745;
  font-size: 14px;
}

/* 暗色模式侧边栏图标 */
.dark .left-sidebar .sidebar-header h3 i {
  color: #10b981;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: none;
  font-size: 14px;
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

/* 房间列表样式 */
.room-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 12px;
  scrollbar-width: thin;
}

.room-list::-webkit-scrollbar {
  width: 4px;
}

.room-list::-webkit-scrollbar-track {
  background: transparent;
}

.room-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.dark .room-list::-webkit-scrollbar-thumb {
  background: #374151;
}

.room-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  position: relative;
  user-select: none;
}

.room-item:hover {
  background: #f8f9fa;
  border-color: #e9ecef;
}

.room-item:hover .room-menu-btn {
  opacity: 1;
}

.room-item.room-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.room-item.room-active .room-id {
  opacity: 0.9;
}

/* 暗色模式房间项 */
.dark .room-item:hover {
  background: #1e293b;
  border-color: #475569;
}

.dark .room-item.room-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.room-id {
  font-size: 11px;
  opacity: 0.6;
  font-family: monospace;
}

.room-status {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.unread-badge {
  background: #dc3545;
  color: white;
  border-radius: 8px;
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
  line-height: 1.4;
}

.connection-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.connection-dot.connected {
  background: #10b981;
  box-shadow: 0 0 4px rgba(16, 185, 129, 0.5);
}

.connection-dot.disconnected {
  background: #6b7280;
}

/* 房间菜单按钮 */
.room-menu-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s ease;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.room-menu-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

.room-item.room-active .room-menu-btn {
  color: rgba(255, 255, 255, 0.8);
  opacity: 1;
}

.room-item.room-active .room-menu-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.dark .room-menu-btn {
  color: #9ca3af;
}

.dark .room-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f3f4f6;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 16px 18px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 暗色模式侧边栏底部 */
.dark .sidebar-footer {
  border-top: 1px solid #475569;
  background: #1e293b;
}

.join-chat-button,
.home-button {
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.join-chat-button {
  background: #667eea;
  color: white;
}

.join-chat-button:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.home-button {
  background: #6b7280;
  color: white;
}

.home-button:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

/* 底部操作按钮 */
.footer-action-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 用户信息区域样式 */
.user-info-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
}

.user-info-section:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark .user-info-section {
  background: #334155;
  border: 1px solid #475569;
}

.dark .user-info-section:hover {
  background: #475569;
  border-color: #64748b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
  flex-shrink: 0;
}

.dark .user-avatar {
  border-color: #475569;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: #2c3e50;
  line-height: 1.2;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .user-name {
  color: #f1f5f9;
}

.user-uid {
  display: block;
  font-size: 11px;
  color: #6c757d;
  font-family: monospace;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .user-uid {
  color: #94a3b8;
}

.user-menu-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: all 0.2s ease;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.user-menu-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
  opacity: 1;
}

.user-info-section:hover .user-menu-btn {
  opacity: 1;
}

.dark .user-menu-btn {
  color: #9ca3af;
}

.dark .user-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f3f4f6;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 1000;
    width: 280px;
  }
  
  .sidebar-toggle {
    display: block;
  }
  
  .user-details .user-name,
  .user-details .user-uid {
    font-size: 11px;
  }
  
  .user-menu-btn {
    opacity: 1;
  }
  
  .room-menu-btn {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: max(80%, 280px);
  }
}
</style> 