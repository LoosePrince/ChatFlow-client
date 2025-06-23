<!-- 主题切换组件 -->
<template>
  <div class="theme-toggle" ref="toggleRef">
    <!-- 当前主题按钮 -->
    <button 
      class="theme-btn"
      @click="handleToggle"
      @mouseenter="handleMouseEnter"
      @mouseleave="startHideTimer"
      :title="currentConfig.description"
    >
      <i :class="currentConfig.icon"></i>
      <span v-if="showText" class="theme-text">{{ currentConfig.name }}</span>
    </button>

    <!-- 主题选项面板 -->
    <Transition name="theme-options">
      <div 
        v-show="showOptions"
        ref="optionsRef"
        class="theme-options"
        :style="optionsStyle"
        @mouseenter="clearHideTimer"
        @mouseleave="startHideTimer"
      >
        <div class="options-header">
          <i class="fas fa-palette"></i>
          <span>主题设置</span>
        </div>
        
        <div class="options-list">
          <button
            v-for="themeMode in themeOptions"
            :key="themeMode"
            class="option-item"
            :class="{ 
              active: themeStore.mode === themeMode,
              current: themeStore.currentTheme === themeMode || 
                      (themeMode === 'auto' && themeStore.mode === 'auto')
            }"
            @click="selectTheme(themeMode)"
          >
            <div class="option-icon">
              <i :class="themeStore.getThemeConfig(themeMode).icon"></i>
            </div>
            <div class="option-content">
              <div class="option-name">
                {{ themeStore.getThemeConfig(themeMode).name }}
                <span v-if="themeMode === 'auto' && themeStore.mode === 'auto'" class="auto-indicator">
                  ({{ themeStore.systemPrefersDark ? '深色' : '浅色' }})
                </span>
              </div>
              <div class="option-description">
                {{ themeStore.getThemeConfig(themeMode).description }}
              </div>
            </div>
            <div v-if="themeStore.mode === themeMode" class="option-check">
              <i class="fas fa-check"></i>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'

// Props
defineProps({
  showText: {
    type: Boolean,
    default: false
  }
})

// Store实例
const themeStore = useThemeStore()

// 响应式数据
const showOptions = ref(false)
const toggleRef = ref(null)
const optionsRef = ref(null)
const optionsStyle = ref({})
let hideTimer = null

// 主题选项
const themeOptions = ['light', 'dark', 'auto']

// 当前主题配置
const currentConfig = computed(() => {
  return themeStore.getThemeConfig(themeStore.mode)
})

// 计算弹窗位置
const calculatePosition = async () => {
  await nextTick()
  
  if (!toggleRef.value || !optionsRef.value) return
  
  const toggleRect = toggleRef.value.getBoundingClientRect()
  const optionsRect = optionsRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // 默认位置：按钮下方，右对齐
  let top = toggleRect.height + 8
  let left = 'auto'
  let right = 0
  let bottom = 'auto'
  
  // 检查右边界
  if (toggleRect.right - optionsRect.width < 0) {
    // 如果右对齐会超出左边界，改为左对齐
    left = 0
    right = 'auto'
  }
  
  // 检查下边界
  if (toggleRect.bottom + optionsRect.height + 8 > viewportHeight) {
    // 如果下方空间不足，显示在按钮上方
    top = 'auto'
    bottom = toggleRect.height + 8
  }
  
  // 检查上边界（当显示在上方时）
  if (bottom !== 'auto' && toggleRect.top - optionsRect.height - 8 < 0) {
    // 如果上方空间也不足，优先显示在下方，允许滚动
    top = toggleRect.height + 8
    bottom = 'auto'
  }
  
  optionsStyle.value = {
    position: 'absolute',
    top: typeof top === 'number' ? `${top}px` : top,
    left: typeof left === 'number' ? `${left}px` : left,
    right: typeof right === 'number' ? `${right}px` : right,
    bottom: typeof bottom === 'number' ? `${bottom}px` : bottom,
    zIndex: 50
  }
}

// 方法
const handleToggle = async () => {
  if (showOptions.value) {
    hideOptions()
  } else {
    showOptions.value = true
    await calculatePosition()
  }
}

const handleMouseEnter = async () => {
  showOptions.value = true
  await calculatePosition()
}

const selectTheme = (theme) => {
  themeStore.setMode(theme)
  hideOptions()
}

const startHideTimer = () => {
  clearHideTimer()
  hideTimer = setTimeout(() => {
    showOptions.value = false
  }, 300)
}

const clearHideTimer = () => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

const hideOptions = () => {
  clearHideTimer()
  showOptions.value = false
}

// 点击外部关闭
const handleClickOutside = (event) => {
  if (toggleRef.value && !toggleRef.value.contains(event.target)) {
    hideOptions()
  }
}

// 监听窗口大小变化
const handleResize = () => {
  if (showOptions.value) {
    calculatePosition()
  }
}

// 监听showOptions变化，在显示时重新计算位置
watch(showOptions, async (newValue) => {
  if (newValue) {
    await calculatePosition()
  }
})

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize)
  clearHideTimer()
})
</script>

<style scoped lang="postcss">
.theme-toggle {
  @apply relative;
}

.theme-btn {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200;
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700;
  @apply dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50;
}

.theme-btn:hover {
  @apply transform scale-105 shadow-md;
}

.theme-text {
  @apply text-sm font-medium;
}

.theme-options {
  @apply absolute w-72 bg-white rounded-xl shadow-lg border border-gray-200;
  @apply dark:bg-gray-800 dark:border-gray-600;
  /* 位置将由JavaScript动态控制 */
}

.options-header {
  @apply flex items-center gap-2 px-4 py-3 border-b border-gray-200;
  @apply dark:border-gray-600;
}

.options-header i {
  @apply text-primary-500;
}

.options-header span {
  @apply font-medium text-gray-900 dark:text-gray-100;
}

.options-list {
  @apply p-2;
}

.option-item {
  @apply w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200;
  @apply hover:bg-gray-50 dark:hover:bg-gray-700;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50;
}

.option-item.active {
  @apply bg-primary-50 dark:bg-primary-900 dark:bg-opacity-30;
}

.option-item.current .option-icon i {
  @apply text-primary-500;
}

.option-icon {
  @apply flex items-center justify-center w-8 h-8 rounded-full;
  @apply bg-gray-100 dark:bg-gray-700;
}

.option-icon i {
  @apply text-gray-600 dark:text-gray-400;
}

.option-content {
  @apply flex-1 text-left;
}

.option-name {
  @apply font-medium text-gray-900 dark:text-gray-100 text-sm;
}

.auto-indicator {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.option-description {
  @apply text-xs text-gray-500 dark:text-gray-400 mt-1;
}

.option-check {
  @apply text-primary-500;
}

/* 动画 */
.theme-options-enter-active,
.theme-options-leave-active {
  @apply transition-all duration-200;
  transform-origin: top right;
}

.theme-options-enter-from,
.theme-options-leave-to {
  @apply opacity-0 scale-95;
}

.theme-options-enter-to,
.theme-options-leave-from {
  @apply opacity-100 scale-100;
}
</style> 