<template>
  <!-- 侧边栏右键菜单 -->
  <div 
    v-if="visible" 
    class="context-menu" 
    :style="{ left: adjustedPosition.x + 'px', top: adjustedPosition.y + 'px' }"
    @click.stop
  >
    <!-- 房间菜单 -->
    <div v-if="type === 'room'" class="context-menu-items">
      <div class="context-menu-item" @click="$emit('roomSettings')">
        <i class="fas fa-cog"></i>
        <span>房间设置</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item danger" @click="$emit('leaveRoom')">
        <i class="fas fa-sign-out-alt"></i>
        <span>退出房间</span>
      </div>
    </div>

    <!-- 用户菜单 -->
    <div v-else-if="type === 'user'" class="context-menu-items">
      <div class="context-menu-item" @click="$emit('userProfile')">
        <i class="fas fa-user-cog"></i>
        <span>个人设置</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="$emit('currentRoomSettings')">
        <i class="fas fa-cog"></i>
        <span>设置房间</span>
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
/* 右键菜单通用样式 */
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 140px;
  overflow: hidden;
  backdrop-filter: blur(8px);
  animation: contextMenuFadeIn 0.15s ease-out;
  transform-origin: top left; /* 确保动画从正确的位置开始 */
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

.context-menu-items {
  padding: 6px 0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 13px;
  color: #374151;
}

.context-menu-item:hover {
  background: #f3f4f6;
}

.context-menu-item.danger {
  color: #ef4444;
}

.context-menu-item.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.context-menu-item i {
  width: 14px;
  font-size: 12px;
  text-align: center;
}

.context-menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}

/* 暗色模式样式 */
.dark .context-menu {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.dark .context-menu-item {
  color: #f3f4f6;
}

.dark .context-menu-item:hover {
  background: #374151;
}

.dark .context-menu-item.danger {
  color: #f87171;
}

.dark .context-menu-item.danger:hover {
  background: #3f1f1f;
  color: #f87171;
}

.dark .context-menu-divider {
  background: #374151;
}

@media (max-width: 480px) {
  .context-menu {
    min-width: 140px;
  }
}
</style> 