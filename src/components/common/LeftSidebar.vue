<template>
  <div 
    class="w-280 bg-white dark:bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out z-20 shadow-sm border-r border-gray-200 dark:border-slate-700"
    :class="{ '-translate-x-full': !show }"
  >
    <!-- 侧边栏头部 -->
    <div class="px-4 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800 min-h-14">
      <h3 class="m-0 text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
        <i class="fas fa-home text-green-600 dark:text-emerald-500 text-sm"></i>
        房间列表
      </h3>
    </div>

    <!-- 房间列表 -->
    <div class="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600">
      <div 
        v-for="room in rooms" 
        :key="room.roomId"
        :class="[
          'p-3 rounded-lg cursor-pointer flex justify-between items-center mb-0.5 transition-all duration-200 border border-transparent select-none',
          room.roomId === currentRoomId 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/40' 
            : 'hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-200 dark:hover:border-slate-600'
        ]"
        @click="handleRoomClick(room)"
        @contextmenu="handleRoomContextMenu($event, room)"
      >
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
            {{ room.name }}
          </div>
          <div class="text-xs opacity-60 font-mono">
            {{ room.roomId }}
          </div>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <span 
            v-if="room.unreadCount > 0" 
            class="bg-red-500 text-white rounded-lg px-1.5 py-0.5 text-xs font-semibold min-w-4 text-center leading-tight"
          >
            {{ room.unreadCount }}
          </span>
          <i 
            :class="[
              'w-1.5 h-1.5 rounded-full inline-block flex-shrink-0',
              room.connected 
                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' 
                : 'bg-gray-500'
            ]"
          ></i>
          <button 
            class="bg-transparent border-none text-gray-500 dark:text-gray-400 cursor-pointer p-1 rounded opacity-0 transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200 text-xs flex items-center justify-center w-5 h-5 group-hover:opacity-100"
            :class="{ 'opacity-100 text-white/80 hover:bg-white/20 hover:text-white': room.roomId === currentRoomId }"
            @click.stop="handleRoomMenuClick($event, room)"
            :title="'房间菜单'"
          >
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 侧边栏底部 -->
    <div class="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex flex-col gap-2.5">
      <button 
        @click="$emit('goToRoomSelect')" 
        class="w-full py-2.5 px-3 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-500/30"
      >
        <i class="fas fa-plus"></i>
        <span>添加房间</span>
      </button>
      <button 
        @click="$emit('goHome')" 
        class="w-full py-2.5 px-3 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white hover:-translate-y-px"
      >
        <i class="fas fa-home"></i>
        <span>返回首页</span>
      </button>
      
      <!-- 用户信息和主题切换 -->
      <div class="flex gap-2.5 items-center">
        <ThemeToggle />
        <div 
          class="flex-1 flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:-translate-y-px hover:shadow-md hover:shadow-black/10 dark:hover:shadow-black/30 select-none group"
          @click="handleUserInfoClick"
          @contextmenu="handleUserInfoContextMenu"
        >
          <img 
            :src="userAvatarUrl" 
            :alt="currentUser?.nickname"
            class="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600 flex-shrink-0"
          >
          <div class="flex-1 min-w-0">
            <span class="block font-semibold text-sm text-slate-700 dark:text-slate-200 leading-tight mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
              {{ currentUser?.nickname }}
            </span>
            <span class="block text-xs text-gray-500 dark:text-slate-400 font-mono leading-none whitespace-nowrap overflow-hidden text-ellipsis">
              {{ currentUser?.uid }}
            </span>
          </div>
          <button 
            class="bg-transparent border-none text-gray-500 dark:text-gray-400 cursor-pointer p-1 rounded opacity-70 transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200 text-xs flex items-center justify-center w-5 h-5 flex-shrink-0 group-hover:opacity-100" 
            @click.stop="handleUserMenuClick" 
            title="用户菜单"
          >
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
/* 自定义滚动条样式 */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-track-transparent {
  scrollbar-color: transparent transparent;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
}

.dark .scrollbar-thumb-slate-600::-webkit-scrollbar-thumb {
  background-color: #475569;
}

.w-280 {
  width: 280px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .w-280 {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 280px;
  }
  
  .user-details .user-name,
  .user-details .user-uid {
    font-size: 11px;
  }
  
  .user-menu-btn {
    opacity: 1 !important;
  }
  
  .room-menu-btn {
    opacity: 1 !important;
  }
}

@media (max-width: 480px) {
  .w-280 {
    width: max(80%, 280px);
  }
}
</style> 