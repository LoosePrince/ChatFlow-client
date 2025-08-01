<template>
  <!-- 侧边栏右键菜单 -->
  <div 
    v-if="visible" 
    class="fixed bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-600 rounded-lg shadow-lg z-50 min-w-[140px] overflow-hidden backdrop-blur-md animate-context-menu-fade-in origin-top-left" 
    :style="{ left: adjustedPosition.x + 'px', top: adjustedPosition.y + 'px' }"
    @click.stop
  >
    <!-- 房间菜单 -->
    <div v-if="type === 'room'" class="py-1.5">
      <div class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700" @click="$emit('roomSettings')">
        <i class="fas fa-cog w-3.5 text-xs text-center"></i>
        <span>房间设置</span>
      </div>
      <div class="h-px bg-gray-200 dark:bg-secondary-600 my-1"></div>
      <div class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300" @click="$emit('leaveRoom')">
        <i class="fas fa-sign-out-alt w-3.5 text-xs text-center"></i>
        <span>退出房间</span>
      </div>
    </div>

    <!-- 用户菜单 -->
    <div v-else-if="type === 'user'" class="py-1.5">
      <div class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700" @click="$emit('userProfile')">
        <i class="fas fa-user-cog w-3.5 text-xs text-center"></i>
        <span>个人设置</span>
      </div>
      <div class="h-px bg-gray-200 dark:bg-secondary-600 my-1"></div>
      <div class="flex items-center gap-2 px-3.5 py-2 cursor-pointer transition-all duration-150 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700" @click="$emit('currentRoomSettings')">
        <i class="fas fa-cog w-3.5 text-xs text-center"></i>
        <span>设置房间</span>
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
import { computed, watch } from 'vue'
import { calculateMenuPosition, calculateContextMenuPosition, getEstimatedMenuSize, debugMenuPosition } from '@/utils/menuPosition.js'

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
  type: {
    type: String,
    default: 'room', // 'room' 或 'user'
    validator: (value) => ['room', 'user'].includes(value)
  },
  isContextMenu: {
    type: Boolean,
    default: false // 是否为右键菜单
  },
  triggerWidth: {
    type: Number,
    default: 20 // 触发元素宽度（如按钮）
  },
  triggerHeight: {
    type: Number,
    default: 20 // 触发元素高度
  }
})

defineEmits(['close', 'roomSettings', 'leaveRoom', 'userProfile', 'currentRoomSettings'])

// 计算调整后的菜单位置
const adjustedPosition = computed(() => {
  if (!props.visible) {
    return { x: props.x, y: props.y }
  }
  
  // 获取菜单预估尺寸（2个菜单项 + 1个分隔线）
  const { width, height } = getEstimatedMenuSize(2, false, true)
  
  // 根据触发方式选择不同的定位策略
  if (props.isContextMenu) {
    // 右键菜单：鼠标点击位置即为触发点
    return calculateContextMenuPosition(props.x, props.y, width, height)
  } else {
    // 按钮菜单：需要考虑触发元素的尺寸
    return calculateMenuPosition(props.x, props.y, width, height, 8, props.triggerWidth, props.triggerHeight)
  }
})

// 开发环境调试
if (import.meta.env.DEV) {
  watch(adjustedPosition, (newPos) => {
    if (props.visible && newPos) {
      debugMenuPosition(newPos, `侧边栏${props.type}菜单`)
    }
  }, { immediate: true })
}
</script>

<style scoped>
/* 右键菜单动画效果 */
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

/* 移动端优化 */
@media (max-width: 480px) {
  .context-menu {
    min-width: 140px;
  }
  
  /* 移动端触摸反馈 */
  .context-menu-item:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .animate-context-menu-fade-in {
    animation: none;
  }
}
</style> 