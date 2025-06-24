<template>
  <div class="sidebar right-sidebar" :class="{ 'sidebar-hidden': !show }">
    <div class="sidebar-header">
      <h3>
        <i class="fas fa-user-friends"></i>
        成员列表 ({{ totalMemberCount }})
      </h3>
      <div class="button-container">
        <button @click="$emit('toggle')" class="sidebar-toggle">
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
          @contextmenu="$emit('showUserContextMenu', $event, member, 'member')"
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
              <i v-if="member.isMuted" class="fas fa-comment-slash muted-icon" title="已被禁言"></i>
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
          @contextmenu="$emit('showUserContextMenu', $event, member, 'member')"
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
              <i v-if="member.isMuted" class="fas fa-comment-slash muted-icon" title="已被禁言"></i>
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
          @contextmenu="$emit('showUserContextMenu', $event, member, 'member')"
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
  transform: translateX(100%);
}

.sidebar-header {
  padding: 16px 18px;
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
  font-size: 14px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

/* 暗色模式侧边栏标题 */
.dark .sidebar-header h3 {
  color: #f1f5f9;
}

/* 成员列表图标 */
.right-sidebar .sidebar-header h3 i {
  color: #17a2b8;
}

/* 暗色模式侧边栏图标 */
.dark .right-sidebar .sidebar-header h3 i {
  color: #06b6d4;
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

/* 成员列表样式 */
.member-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  /* 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.member-list::-webkit-scrollbar {
  width: 4px;
}

.member-list::-webkit-scrollbar-track {
  background: transparent;
}

.member-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

.member-list::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

/* 暗色模式滚动条 */
.dark .member-list {
  scrollbar-color: #475569 transparent;
}

.dark .member-list::-webkit-scrollbar-thumb {
  background-color: #475569;
}

.dark .member-list::-webkit-scrollbar-thumb:hover {
  background-color: #64748b;
}

.member-section {
  margin-bottom: 14px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 暗色模式section标题 */
.dark .section-title {
  color: #94a3b8;
}

.online-dot {
  color: #28a745;
  font-size: 6px;
}

.offline-dot {
  color: #6c757d;
  font-size: 6px;
}

.left-dot {
  color: #dc3545;
  font-size: 6px;
}

.member-item {
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.member-item:hover {
  background: #f8f9fa;
  border-color: #e9ecef;
  transform: translateX(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

/* 暗色模式成员项 */
.dark .member-item:hover {
  background: #1e293b;
  border-color: #475569;
  transform: translateX(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
  flex-shrink: 0;
}

/* 暗色模式头像 */
.dark .member-avatar {
  border-color: #475569;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-weight: 500;
  margin-bottom: 1px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #2c3e50;
  font-size: 13px;
  line-height: 1.3;
}

/* 暗色模式成员名称 */
.dark .member-name {
  color: #f1f5f9;
}

.member-uid {
  font-size: 11px;
  color: #6c757d;
  opacity: 0.8;
  line-height: 1.2;
}

/* 暗色模式成员UID */
.dark .member-uid {
  color: #94a3b8;
}

.member-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.member-status.online {
  background: #d4edda;
  color: #155724;
}

.member-status.offline {
  background: #e2e3e5;
  color: #6c757d;
}

.member-status.left {
  background: #f8d7da;
  color: #721c24;
}

/* 暗色模式成员状态 */
.dark .member-status.online {
  background: #1e3a2e;
  color: #10b981;
}

.dark .member-status.offline {
  background: #374151;
  color: #9ca3af;
}

.dark .member-status.left {
  background: #3c1618;
  color: #ef4444;
}

/* 图标样式 */
.creator-icon {
  color: #ffc107;
  font-size: 11px;
}

.admin-icon {
  color: #007bff;
  font-size: 11px;
}

.muted-icon {
  color: #dc3545;
  font-size: 11px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    z-index: 1000;
  }
  
  .sidebar-toggle {
    display: block;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: max(80%, 280px);
  }
}
</style> 