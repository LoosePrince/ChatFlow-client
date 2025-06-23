<template>
  <div id="app" class="min-h-screen">
    <!-- 全局加载状态 -->
    <Transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-content">
          <div class="spinner-border loading-spinner-main" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
          <p class="mt-3 text-light">{{ loadingText }}</p>
        </div>
      </div>
    </Transition>

    <!-- 主路由视图 -->
    <RouterView v-slot="{ Component, route }">
      <Transition 
        :name="route.meta.transition || 'fade'"
        mode="out-in"
        appear
      >
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>

    <!-- 全局通知组件 -->
    <NotificationContainer />

    <!-- 全局模态框容器 -->
    <div id="modal-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useThemeStore } from '@/stores/theme'
import NotificationContainer from '@/components/common/NotificationContainer.vue'

// 响应式数据
const isLoading = ref(true)
const loadingText = ref('正在初始化应用...')

// Store实例
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()

// 应用初始化
onMounted(async () => {
  try {
    loadingText.value = '正在初始化主题...'
    
    // 初始化主题
    themeStore.initializeTheme()
    
    loadingText.value = '正在检查用户状态...'
    
    // 初始化认证状态
    await authStore.initialize()
    
    loadingText.value = '应用初始化完成'
    
    // 延迟隐藏加载状态，提供更好的用户体验
    setTimeout(() => {
      isLoading.value = false
    }, 800)
    
  } catch (error) {
    console.error('应用初始化失败:', error)
    notificationStore.error('应用初始化失败，请刷新页面重试')
    isLoading.value = false
  }
})

// 提供全局方法
provide('showNotification', notificationStore.addNotification)
provide('hideNotification', notificationStore.removeNotification)
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: background 0.3s ease;
}

/* 夜间模式加载覆盖层 */
.dark .loading-overlay {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.loading-content {
  text-align: center;
  color: white;
}

/* 夜间模式加载内容 */
.dark .loading-content {
  color: #f1f5f9;
}

.loading-content p {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

/* 夜间模式加载文字 */
.dark .loading-content p {
  color: #f1f5f9;
}

/* 主加载图标样式 */
.loading-spinner-main {
  color: #ffffff;
  width: 3rem;
  height: 3rem;
}

/* 夜间模式主加载图标 */
.dark .loading-spinner-main {
  color: #60a5fa;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>

<style>
/* 全局暗色模式样式 */
#app {
  @apply bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200;
}

/* 主题切换相关样式 */
.theme-toggle-wrapper {
  @apply flex items-center justify-center;
}

.guest-theme-toggle {
  @apply absolute top-4 right-4 z-10;
}

.top-actions {
  @apply flex items-center justify-between mb-8;
}

/* 自定义滚动条样式 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.dark .custom-scrollbar {
  scrollbar-color: #6b7280 #374151;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  transition: background 0.3s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: #374151;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style> 