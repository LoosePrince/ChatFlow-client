<template>
  <!-- 右键菜单 -->
  <div 
    v-if="visible" 
    class="context-menu" 
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <div class="context-menu-header">
      <img 
        :src="targetUser?.avatarUrl" 
        :alt="targetUser?.nickname"
        class="context-menu-avatar"
      >
      <div class="context-menu-user-info">
        <div class="context-menu-nickname">{{ targetUser?.nickname }}</div>
        <div class="context-menu-uid">{{ targetUser?.uid }}</div>
      </div>
    </div>
    <div class="context-menu-items">
      <!-- 管理员相关 (只有创建者可以设置管理员，不能对创建者操作) -->
      <div 
        v-if="currentUserIsCreator && !targetUser?.isCreator && !targetUser?.isAdmin"
        class="context-menu-item"
        @click="$emit('setAdmin', targetUser, true)"
      >
        <i class="fas fa-shield-alt"></i>
        <span>设为管理员</span>
      </div>
      <div 
        v-else-if="currentUserIsCreator && !targetUser?.isCreator && targetUser?.isAdmin"
        class="context-menu-item"
        @click="$emit('setAdmin', targetUser, false)"
      >
        <i class="fas fa-shield-alt"></i>
        <span>取消管理员</span>
      </div>
      
      <!-- 禁言相关 (创建者和管理员都可以禁言，不能对创建者操作) -->
      <div 
        v-if="!targetUser?.isCreator && !targetUser?.isMuted"
        class="context-menu-item"
        @click="$emit('showMute', targetUser)"
      >
        <i class="fas fa-microphone-slash"></i>
        <span>禁言用户</span>
      </div>
      <div 
        v-else-if="!targetUser?.isCreator && targetUser?.isMuted"
        class="context-menu-item"
        @click="$emit('unmute', targetUser)"
      >
        <i class="fas fa-microphone"></i>
        <span>取消禁言</span>
      </div>
      
      <!-- 移出用户 (创建者和管理员都可以移出，不能对创建者操作) -->
      <div v-if="!targetUser?.isCreator" class="context-menu-divider"></div>
      <div 
        v-if="!targetUser?.isCreator"
        class="context-menu-item danger"
        @click="$emit('showKick', targetUser)"
      >
        <i class="fas fa-user-times"></i>
        <span>移出房间</span>
      </div>
    </div>
  </div>

  <!-- 全局点击遮罩，用于关闭右键菜单 -->
  <div 
    v-if="visible" 
    class="context-menu-overlay"
    @click="$emit('close')"
  ></div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  targetUser: {
    type: Object,
    default: null
  },
  currentUserIsCreator: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'setAdmin', 'showMute', 'unmute', 'showKick'])
</script>

<style scoped>
/* 右键菜单样式 */
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 200px;
  overflow: hidden;
  animation: contextMenuFadeIn 0.15s ease-out;
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.context-menu-header {
  padding: 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 10px;
}

.context-menu-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.context-menu-user-info {
  flex: 1;
  min-width: 0;
}

.context-menu-nickname {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.2;
}

.context-menu-uid {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.2;
}

.context-menu-items {
  padding: 8px 0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 14px;
  color: #2c3e50;
}

.context-menu-item:hover {
  background: #f8f9fa;
}

.context-menu-item.danger {
  color: #dc3545;
}

.context-menu-item.danger:hover {
  background: #f8d7da;
}

.context-menu-item i {
  width: 16px;
  text-align: center;
  font-size: 13px;
}

.context-menu-divider {
  height: 1px;
  background: #e9ecef;
  margin: 4px 0;
}

/* 暗色模式样式 */
.dark .context-menu {
  background: #1e293b;
  border: 1px solid #475569;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.dark .context-menu-header {
  background: #0f172a;
  border-bottom: 1px solid #475569;
}

.dark .context-menu-nickname {
  color: #f1f5f9;
}

.dark .context-menu-uid {
  color: #94a3b8;
}

.dark .context-menu-item {
  color: #f1f5f9;
}

.dark .context-menu-item:hover {
  background: #334155;
}

.dark .context-menu-item.danger {
  color: #ef4444;
}

.dark .context-menu-item.danger:hover {
  background: #450a0a;
}

.dark .context-menu-divider {
  background: #475569;
}

@media (max-width: 480px) {
  .context-menu {
    min-width: 180px;
  }
}
</style> 