<template>
  <div 
    class="w-70 bg-white dark:bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out z-20 border-l border-gray-200 dark:border-slate-700"
    :class="{ 'translate-x-full': !show }"
  >
    <!-- 侧边栏头部 -->
    <div class="px-4 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
      <h3 class="m-0 text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
        <i class="fas fa-user-friends text-cyan-600 dark:text-cyan-400"></i>
        成员列表 ({{ totalMemberCount }})
      </h3>
    </div>

    <!-- 成员列表 -->
    <div class="flex-1 overflow-y-auto p-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600">
      <!-- 在线成员 -->
      <div v-if="onlineMembers.length > 0" class="mb-3.5">
        <div class="text-xs font-semibold text-gray-500 dark:text-slate-400 py-1.5 px-2.5 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
          <i class="fas fa-circle text-green-600 text-xs"></i>
          在线 ({{ onlineMembers.length }})
        </div>
        <div 
          v-for="member in onlineMembers" 
          :key="member.uid"
          class="p-2 rounded-md cursor-pointer flex items-center gap-2.5 mb-0.5 transition-all duration-200 border border-transparent hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-200 dark:hover:border-slate-600 hover:-translate-x-0.5 hover:shadow-sm hover:shadow-black/8 dark:hover:shadow-black/30"
          @contextmenu="$emit('showUserContextMenu', $event, member, 'member')"
        >
          <img 
            :src="getAvatarUrl(member.avatarUrl)" 
            :alt="member.nickname"
            class="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600 flex-shrink-0"
          >
          <div class="flex-1 min-w-0">
            <div class="font-medium mb-0.5 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis text-slate-700 dark:text-slate-200 text-sm leading-tight">
              {{ member.nickname }}
              <i v-if="member.isCreator" class="fas fa-crown text-amber-500 text-xs" title="房主"></i>
              <i v-else-if="member.isAdmin" class="fas fa-shield-alt text-blue-500 text-xs" title="管理员"></i>
              <i v-if="member.isMuted" class="fas fa-comment-slash text-red-500 text-xs" title="已被禁言"></i>
            </div>
            <div class="text-xs text-gray-500 dark:text-slate-400 opacity-80 leading-tight">{{ member.uid }}</div>
          </div>
          <div class="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 uppercase tracking-wider bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            在线
          </div>
        </div>
      </div>

      <!-- 离线成员 -->
      <div v-if="offlineMembers.length > 0" class="mb-3.5">
        <div class="text-xs font-semibold text-gray-500 dark:text-slate-400 py-1.5 px-2.5 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
          <i class="fas fa-circle text-gray-500 text-xs"></i>
          离线 ({{ offlineMembers.length }})
        </div>
        <div 
          v-for="member in offlineMembers" 
          :key="member.uid"
          class="p-2 rounded-md cursor-pointer flex items-center gap-2.5 mb-0.5 transition-all duration-200 border border-transparent hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-200 dark:hover:border-slate-600 hover:-translate-x-0.5 hover:shadow-sm hover:shadow-black/8 dark:hover:shadow-black/30"
          @contextmenu="$emit('showUserContextMenu', $event, member, 'member')"
        >
          <img 
            :src="getAvatarUrl(member.avatarUrl)" 
            :alt="member.nickname"
            class="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600 flex-shrink-0"
          >
          <div class="flex-1 min-w-0">
            <div class="font-medium mb-0.5 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis text-slate-700 dark:text-slate-200 text-sm leading-tight">
              {{ member.nickname }}
              <i v-if="member.isCreator" class="fas fa-crown text-amber-500 text-xs" title="房主"></i>
              <i v-else-if="member.isAdmin" class="fas fa-shield-alt text-blue-500 text-xs" title="管理员"></i>
              <i v-if="member.isMuted" class="fas fa-comment-slash text-red-500 text-xs" title="已被禁言"></i>
            </div>
            <div class="text-xs text-gray-500 dark:text-slate-400 opacity-80 leading-tight">{{ member.uid }}</div>
          </div>
          <div class="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 uppercase tracking-wider bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-400">
            离线
          </div>
        </div>
      </div>

      <!-- 已退出成员 -->
      <div v-if="leftMembers.length > 0" class="mb-3.5">
        <div class="text-xs font-semibold text-gray-500 dark:text-slate-400 py-1.5 px-2.5 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
          <i class="fas fa-circle text-red-500 text-xs"></i>
          已退出 ({{ leftMembers.length }})
        </div>
        <div 
          v-for="member in leftMembers" 
          :key="member.uid"
          class="p-2 rounded-md cursor-pointer flex items-center gap-2.5 mb-0.5 transition-all duration-200 border border-transparent hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-200 dark:hover:border-slate-600 hover:-translate-x-0.5 hover:shadow-sm hover:shadow-black/8 dark:hover:shadow-black/30"
          @contextmenu="$emit('showUserContextMenu', $event, member, 'member')"
        >
          <img 
            :src="getAvatarUrl(member.avatarUrl)" 
            :alt="member.nickname"
            class="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600 flex-shrink-0"
          >
          <div class="flex-1 min-w-0">
            <div class="font-medium mb-0.5 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis text-slate-700 dark:text-slate-200 text-sm leading-tight">
              {{ member.nickname }}
            </div>
            <div class="text-xs text-gray-500 dark:text-slate-400 opacity-80 leading-tight">{{ member.uid }}</div>
          </div>
          <div class="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            已退出
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 定义 props
const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  members: {
    type: Array,
    default: () => []
  }
})

// 定义 emits
defineEmits([
  'toggle',
  'showUserContextMenu'
])

// 获取头像URL的工具函数
const getAvatarUrl = (avatarUrl) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  if (!avatarUrl) {
    return `${baseUrl}/avatars/default`
  }
  
  // 如果是完整URL，直接返回
  if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
    return avatarUrl
  }
  
  // 如果已经是 /avatars/ 开头的路径，直接拼接 baseUrl
  if (avatarUrl.startsWith('/avatars/')) {
    return `${baseUrl}${avatarUrl}`
  }
  
  // 其他情况使用 uploads/images 路径
  return `${baseUrl}/uploads/images/${avatarUrl}`
}

// 计算属性
const onlineMembers = computed(() => {
  return props.members.filter(member => member.status === 'online')
})

const offlineMembers = computed(() => {
  return props.members.filter(member => member.status === 'offline')
})

const leftMembers = computed(() => {
  return props.members.filter(member => member.status === 'left')
})

const totalMemberCount = computed(() => {
  return props.members.length
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
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

.dark .scrollbar-thumb-slate-600::-webkit-scrollbar-thumb {
  background-color: #475569;
}

.dark .scrollbar-thumb-slate-600::-webkit-scrollbar-thumb:hover {
  background-color: #64748b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .w-70 {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    z-index: 1000;
  }
}

@media (max-width: 480px) {
  .w-70 {
    width: max(80%, 280px);
  }
}
</style> 