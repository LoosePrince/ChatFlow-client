<template>
  <!-- 右键菜单 -->
  <div 
    v-if="visible" 
    class="fixed bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-600 rounded-lg shadow-xl z-50 min-w-[200px] overflow-hidden backdrop-blur-md animate-context-menu-fade-in" 
    :style="{ left: adjustedPosition.x + 'px', top: adjustedPosition.y + 'px' }"
    @click.stop
  >
    <div class="p-3 bg-gray-50 dark:bg-secondary-900 border-b border-gray-200 dark:border-secondary-600 flex items-center gap-2.5">
      <img 
        :src="targetUser?.avatarUrl" 
        :alt="targetUser?.nickname"
        class="w-8 h-8 rounded-full object-cover"
      >
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-tight">{{ targetUser?.nickname }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 leading-tight">{{ targetUser?.uid }}</div>
      </div>
    </div>
    <div class="py-2">
      <!-- 管理员相关 (只有创建者可以设置管理员，不能对创建者操作) -->
      <div 
        v-if="currentUserIsCreator && !targetUser?.isCreator && !targetUser?.isAdmin"
        class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
        @click="$emit('setAdmin', targetUser, true)"
      >
        <i class="fas fa-shield-alt w-3.5 text-center text-xs"></i>
        <span>设为管理员</span>
      </div>
      <div 
        v-else-if="currentUserIsCreator && !targetUser?.isCreator && targetUser?.isAdmin"
        class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
        @click="$emit('setAdmin', targetUser, false)"
      >
        <i class="fas fa-shield-alt w-3.5 text-center text-xs"></i>
        <span>取消管理员</span>
      </div>
      
      <!-- 禁言相关 (创建者和管理员都可以禁言，不能对创建者操作) -->
      <div 
        v-if="!targetUser?.isCreator && !targetUser?.isMuted"
        class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
        @click="$emit('showMute', targetUser)"
      >
        <i class="fas fa-comment-slash w-3.5 text-center text-xs"></i>
        <span>禁言用户</span>
      </div>
      <div 
        v-else-if="!targetUser?.isCreator && targetUser?.isMuted"
        class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
        @click="$emit('unmute', targetUser)"
      >
        <i class="fas fa-microphone w-3.5 text-center text-xs"></i>
        <span>取消禁言</span>
      </div>
      
      <!-- 移出用户 (创建者和管理员都可以移出，不能对创建者操作) -->
      <div v-if="!targetUser?.isCreator" class="h-px bg-gray-200 dark:bg-secondary-600 my-1"></div>
      <div 
        v-if="!targetUser?.isCreator"
        class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300"
        @click="$emit('showKick', targetUser)"
      >
        <i class="fas fa-user-times w-3.5 text-center text-xs"></i>
        <span>移出房间</span>
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

// 计算菜单项数量
const menuItemCount = computed(() => {
  if (!props.targetUser || props.targetUser.isCreator) {
    return 0 // 创建者没有操作菜单
  }
  
  let count = 0
  
  // 管理员相关操作（只有创建者可见）
  if (props.currentUserIsCreator) {
    count += 1 // 设为管理员/取消管理员
  }
  
  // 禁言操作
  count += 1 // 禁言/取消禁言
  
  // 移出房间
  count += 1 // 移出用户
  
  return count
})

// 计算调整后的菜单位置
const adjustedPosition = computed(() => {
  if (!props.visible) {
    return { x: props.x, y: props.y }
  }
  
  // 获取菜单预估尺寸（包含头部、菜单项数量、分隔线）
  const itemCount = menuItemCount.value
  const hasDivider = itemCount > 1 // 如果有多个操作，会有分隔线
  const { width, height } = getEstimatedMenuSize(itemCount, true, hasDivider)
  
  // 用户右键菜单使用专门的定位策略
  return calculateContextMenuPosition(props.x, props.y, width, height)
})
</script>

<style scoped>
/* 自定义动画 */
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

.animate-context-menu-fade-in {
  animation: contextMenuFadeIn 0.15s ease-out;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .min-w-\[200px\] {
    min-width: 180px;
  }
}
</style> 