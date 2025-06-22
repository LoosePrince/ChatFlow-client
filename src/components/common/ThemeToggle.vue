<!-- 主题切换组件 -->
<template>
  <div class="theme-toggle" ref="toggleRef">
    <!-- 当前主题按钮 -->
    <button 
      class="theme-btn"
      @click="handleToggle"
      @mouseenter="showOptions = true"
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
        class="theme-options"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
let hideTimer = null

// 主题选项
const themeOptions = ['light', 'dark', 'auto']

// 当前主题配置
const currentConfig = computed(() => {
  return themeStore.getThemeConfig(themeStore.mode)
})

// 方法
const handleToggle = () => {
  if (showOptions.value) {
    hideOptions()
  } else {
    showOptions.value = true
  }
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

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
  @apply absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50;
  @apply dark:bg-gray-800 dark:border-gray-600;
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