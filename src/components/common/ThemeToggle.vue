<!-- 主题切换组件 -->
<template>
  <div class="relative" ref="toggleRef">
    <!-- 当前主题按钮 -->
    <button 
      class="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 hover:transform hover:scale-105 hover:shadow-md"
      @click="handleToggle"
      @mouseenter="isMobile ? null : handleMouseEnter"
      @mouseleave="isMobile ? null : startHideTimer"
      :title="currentConfig.description"
    >
      <i :class="currentConfig.icon"></i>
      <span v-if="showText" class="text-sm font-medium">{{ currentConfig.name }}</span>
    </button>

    <!-- 主题选项面板 -->
    <Transition name="theme-options">
      <div 
        v-show="showOptions"
        ref="optionsRef"
        class="absolute w-72 bg-white rounded-xl shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-600"
        :style="optionsStyle"
        @mouseenter="isMobile ? null : clearHideTimer"
        @mouseleave="isMobile ? null : startHideTimer"
      >
        <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <i class="fas fa-palette text-primary-500"></i>
          <span class="font-medium text-gray-900 dark:text-gray-100">主题设置</span>
        </div>
        
        <div class="p-2">
          <button
            v-for="themeMode in themeOptions"
            :key="themeMode"
            class="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            :class="{ 
              'bg-primary-50 dark:bg-primary-900 dark:bg-opacity-30': themeStore.mode === themeMode,
              'current': themeStore.currentTheme === themeMode || 
                      (themeMode === 'auto' && themeStore.mode === 'auto')
            }"
            @click="selectTheme(themeMode)"
          >
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700">
              <i :class="[themeStore.getThemeConfig(themeMode).icon, 'text-gray-600 dark:text-gray-400', { 'text-primary-500': themeStore.currentTheme === themeMode || (themeMode === 'auto' && themeStore.mode === 'auto') }]"></i>
            </div>
            <div class="flex-1 text-left">
              <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {{ themeStore.getThemeConfig(themeMode).name }}
                <span v-if="themeMode === 'auto' && themeStore.mode === 'auto'" class="text-xs text-gray-500 dark:text-gray-400">
                  ({{ themeStore.systemPrefersDark ? '深色' : '浅色' }})
                </span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ themeStore.getThemeConfig(themeMode).description }}
              </div>
            </div>
            <div v-if="themeStore.mode === themeMode" class="text-primary-500">
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
let hoverShowTime = null // 记录悬停显示的时间
const HOVER_PROTECTION_TIME = 1000 // 悬停保护时间1秒

// 响应式屏幕宽度
const screenWidth = ref(window.innerWidth)

// 检测是否为移动设备
const isMobile = computed(() => {
  // 检测屏幕宽度
  if (screenWidth.value <= 768) return true
  
  // 检测触摸设备
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // 检测用户代理
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword))
  
  return isTouchDevice && (screenWidth.value <= 1024 || isMobileUA)
})

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
    // 手机端直接关闭，桌面端检查悬停保护时间
    if (isMobile.value) {
      hideOptions()
    } else {
      // 检查是否在悬停保护时间内
      const now = Date.now()
      if (hoverShowTime && (now - hoverShowTime) < HOVER_PROTECTION_TIME) {
        // 在保护时间内，不关闭面板
        return
      }
      hideOptions()
    }
  } else {
    showOptions.value = true
    hoverShowTime = null // 点击显示时清除悬停时间
    await calculatePosition()
  }
}

const handleMouseEnter = async () => {
  // 移动设备不响应悬停事件
  if (isMobile.value) return
  
  if (!showOptions.value) {
    // 只有在面板未显示时才记录悬停时间
    hoverShowTime = Date.now()
  }
  showOptions.value = true
  await calculatePosition()
}

const selectTheme = (theme) => {
  themeStore.setMode(theme)
  hideOptions()
}

const startHideTimer = () => {
  // 移动设备不使用悬停隐藏
  if (isMobile.value) return
  
  clearHideTimer()
  hideTimer = setTimeout(() => {
    showOptions.value = false
  }, 300)
}

const clearHideTimer = () => {
  // 移动设备不使用悬停定时器
  if (isMobile.value) return
  
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

const hideOptions = () => {
  clearHideTimer()
  showOptions.value = false
  hoverShowTime = null // 隐藏时清除悬停时间
}

// 点击外部关闭
const handleClickOutside = (event) => {
  if (toggleRef.value && !toggleRef.value.contains(event.target)) {
    hideOptions()
  }
}

// 监听窗口大小变化
const handleResize = () => {
  // 更新屏幕宽度
  screenWidth.value = window.innerWidth
  
  if (showOptions.value) {
    calculatePosition()
  }
  
  // 如果切换到移动设备模式，关闭悬停相关的定时器和面板
  if (isMobile.value && showOptions.value && hoverShowTime) {
    hideOptions()
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

<style scoped>
/* 动画 */
.theme-options-enter-active,
.theme-options-leave-active {
  transition: all 0.2s ease;
  transform-origin: top right;
}

.theme-options-enter-from,
.theme-options-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.theme-options-enter-to,
.theme-options-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .theme-options {
    width: 16rem; /* 移动端稍微缩小宽度 */
  }
  
  .option-item {
    padding-top: 1rem;
    padding-bottom: 1rem; /* 增大点击区域 */
  }
  
  /* 禁用移动端悬停效果 */
  .theme-btn:hover {
    transform: none;
    scale: 1;
    box-shadow: none;
  }
  
  .option-item:hover {
    background-color: transparent;
  }
  
  .dark .option-item:hover {
    background-color: transparent;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .theme-options-enter-active,
  .theme-options-leave-active {
    transition: none;
  }
  
  .theme-btn {
    transition: none;
  }
  
  .option-item {
    transition: none;
  }
}
</style> 