<template>
  <!-- 消息右键菜单 -->
  <div 
    v-if="visible" 
    class="message-context-menu" 
    :style="{ left: adjustedPosition.x + 'px', top: adjustedPosition.y + 'px' }"
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
import { calculateContextMenuPosition, getEstimatedMenuSize } from '@/utils/menuPosition.js'

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

// 计算菜单项数量
const menuItemCount = computed(() => {
  let count = 1 // 回复消息始终存在
  
  if (canDelete.value) {
    count += 1 // 删除消息
  }
  
  return count
})

// 计算调整后的菜单位置
const adjustedPosition = computed(() => {
  if (!props.visible) {
    return { x: props.x, y: props.y }
  }
  
  // 获取菜单预估尺寸
  const itemCount = menuItemCount.value
  const { width, height } = getEstimatedMenuSize(itemCount, false, false)
  
  // 消息右键菜单使用专门的定位策略
  return calculateContextMenuPosition(props.x, props.y, width, height)
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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 150px;
  overflow: hidden;
  backdrop-filter: blur(8px);
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

.message-context-menu-items {
  padding: 8px 0;
}

.message-context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 13px;
  color: #374151;
}

.message-context-menu-item:hover {
  background: #f3f4f6;
}

.message-context-menu-item.danger {
  color: #ef4444;
}

.message-context-menu-item.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.message-context-menu-item i {
  width: 14px;
  text-align: center;
  font-size: 12px;
}

/* 暗色模式样式 */
.dark .message-context-menu {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.dark .message-context-menu-item {
  color: #f3f4f6;
}

.dark .message-context-menu-item:hover {
  background: #374151;
}

.dark .message-context-menu-item.danger {
  color: #f87171;
}

.dark .message-context-menu-item.danger:hover {
  background: #3f1f1f;
  color: #f87171;
}
</style> 