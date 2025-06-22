<template>
  <!-- 消息右键菜单 -->
  <div 
    v-if="visible" 
    class="message-context-menu" 
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <div class="message-context-menu-items">
      <!-- 回复消息 -->
      <div 
        class="message-context-menu-item"
        @click="$emit('reply', targetMessage)"
      >
        <i class="fas fa-reply"></i>
        <span>回复</span>
      </div>
      
      <!-- 删除消息 (仅管理员或创建者可见) -->
      <div 
        v-if="canDelete"
        class="message-context-menu-item danger"
        @click="$emit('delete', targetMessage)"
      >
        <i class="fas fa-trash-alt"></i>
        <span>删除消息</span>
      </div>
    </div>
  </div>

  <!-- 全局点击遮罩，用于关闭右键菜单 -->
  <div 
    v-if="visible" 
    class="message-context-menu-overlay"
    @click="$emit('close')"
  ></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
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
  targetMessage: {
    type: Object,
    default: null
  },
  currentUser: {
    type: Object,
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isCreator: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'reply', 'delete'])

// 计算是否可以删除消息
const canDelete = computed(() => {
  // 管理员或创建者可以删除任何消息
  if (props.isAdmin || props.isCreator) {
    return true
  }
  
  // 消息发送者可以删除自己的消息
  if (props.targetMessage && props.currentUser && 
      props.targetMessage.userUid === props.currentUser.uid) {
    return true
  }
  
  return false
})
</script>

<style scoped>
/* 消息右键菜单样式 */
.message-context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.message-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 150px;
  overflow: hidden;
  animation: messageContextMenuFadeIn 0.15s ease-out;
}

@keyframes messageContextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.message-context-menu-items {
  padding: 8px 0;
}

.message-context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 14px;
  color: #2c3e50;
}

.message-context-menu-item:hover {
  background: #f8f9fa;
}

.message-context-menu-item.danger {
  color: #dc3545;
}

.message-context-menu-item.danger:hover {
  background: #f8d7da;
}

.message-context-menu-item i {
  width: 16px;
  text-align: center;
  font-size: 13px;
}
</style> 