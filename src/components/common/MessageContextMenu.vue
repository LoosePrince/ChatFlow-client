<template>
  <!-- 消息右键菜单 -->
  <div 
    v-if="visible" 
    class="fixed bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-xl z-50 min-w-[150px] overflow-hidden backdrop-blur-md animate-context-menu-fade-in"
    :style="{ left: adjustedPosition.x + 'px', top: adjustedPosition.y + 'px' }"
    @click.stop
  >
    <div class="py-2">
      <!-- 回复消息 -->
      <div 
        class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
        @click="$emit('reply', targetMessage)"
      >
        <i class="fas fa-reply w-3.5 text-center text-xs"></i>
        <span>回复</span>
      </div>
      
      <!-- 删除消息 (仅管理员或创建者可见) -->
      <div 
        v-if="canDelete"
        class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300"
        @click="$emit('delete', targetMessage)"
      >
        <i class="fas fa-trash-alt w-3.5 text-center text-xs"></i>
        <span>删除消息</span>
      </div>
      
      <!-- 私聊 (仅对他人消息显示) -->
      <div 
        v-if="!isOwnMessage"
        class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
        @click="$emit('privateChat', targetMessage)"
      >
        <i class="fas fa-envelope w-3.5 text-center text-xs"></i>
        <span>私聊</span>
      </div>
      
      <!-- 拉黑/解除拉黑 (仅对他人消息显示) -->
      <div 
        v-if="!isOwnMessage"
        class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
        @click="$emit('block', targetMessage)"
      >
        <i :class="isBlocked ? 'fas fa-user-check' : 'fas fa-user-slash'" class="w-3.5 text-center text-xs"></i>
        <span>{{ isBlocked ? '解除拉黑' : '拉黑' }}</span>
      </div>
    </div>
  </div>

  <!-- 全局点击遮罩，用于关闭右键菜单 -->
  <div 
    v-if="visible" 
    class="fixed inset-0 z-40"
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
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'reply', 'delete', 'privateChat', 'block'])

// 计算是否是自己的消息
const isOwnMessage = computed(() => {
  return props.targetMessage && props.currentUser && 
         props.targetMessage.userUid === props.currentUser.uid
})

// 计算是否可以删除消息
const canDelete = computed(() => {
  // 管理员或创建者可以删除任何消息
  if (props.isAdmin || props.isCreator) {
    return true
  }
  
  // 消息发送者可以删除自己的消息
  if (isOwnMessage.value) {
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
  
  // 只有对他人的消息才显示私聊和拉黑选项
  if (!isOwnMessage.value) {
    count += 2 // 私聊 + 拉黑/解除拉黑
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
/* 自定义动画 */
@keyframes context-menu-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-context-menu-fade-in {
  animation: context-menu-fade-in 0.15s ease-out;
}
</style> 