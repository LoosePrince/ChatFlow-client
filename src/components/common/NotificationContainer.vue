<!-- 通知容器组件 -->
<template>
  <div class="fixed top-5 right-5 z-50 pointer-events-none sm:top-5 sm:right-5 sm:left-5">
    <transition-group 
      name="notification" 
      tag="div" 
      class="flex flex-col gap-2.5 max-w-sm sm:max-w-none"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'pointer-events-auto bg-white dark:bg-secondary-800 rounded-lg shadow-lg border-l-4 relative overflow-hidden cursor-pointer transition-all duration-300 min-w-[300px] max-w-sm sm:min-w-0 sm:max-w-none hover:-translate-x-1 hover:shadow-xl',
          pausedNotifications.has(notification.id) ? 'shadow-2xl dark:shadow-2xl' : '',
          getBorderColor(notification.type)
        ]"
        @click="dismiss(notification.id)"
        @mouseenter="pauseTimer(notification.id)"
        @mouseleave="resumeTimer(notification.id)"
      >
        <div class="flex items-start p-4 gap-3">
          <i :class="[getIcon(notification.type), 'text-xl mt-0.5 flex-shrink-0', getIconColor(notification.type)]"></i>
          <div class="flex-1 min-w-0">
            <div v-if="notification.title" class="font-semibold mb-1 text-gray-900 dark:text-secondary-100 text-sm">
              {{ notification.title }}
            </div>
            <div class="text-gray-600 dark:text-secondary-300 text-sm leading-relaxed break-words">
              {{ notification.message }}
            </div>
          </div>
          <button
            @click.stop="dismiss(notification.id)"
            class="bg-transparent border-none text-gray-500 dark:text-secondary-400 cursor-pointer p-1 rounded transition-all duration-200 flex-shrink-0 hover:bg-gray-100 dark:hover:bg-secondary-700 hover:text-gray-700 dark:hover:text-secondary-100"
            aria-label="关闭通知"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div 
          v-if="notification.duration && notification.duration > 0 && !notification.persistent"
          :class="[
            'absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 animate-progress-shrink origin-left transition-opacity duration-200',
            pausedNotifications.has(notification.id) ? 'animate-pause opacity-60' : ''
          ]"
          :style="{ animationDuration: `${notification.duration}ms` }"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification.js'

// 组件名称（用于调试）
defineOptions({
  name: 'NotificationContainer'
})

// 使用Pinia通知store
const notificationStore = useNotificationStore()

// 使用store中的通知数据
const notifications = computed(() => notificationStore.notifications)

// 计时器管理
const timers = ref(new Map()) // 存储每个通知的计时器
const pausedNotifications = ref(new Set()) // 存储被暂停的通知ID
const notificationStartTimes = ref(new Map()) // 存储每个通知的开始时间
const notificationPauseTimes = ref(new Map()) // 存储每个通知的暂停时间

// 获取通知图标
const getIcon = (type) => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[type] || icons.info
}

// 获取图标颜色
const getIconColor = (type) => {
  const colors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }
  return colors[type] || colors.info
}

// 获取边框颜色
const getBorderColor = (type) => {
  const colors = {
    success: 'border-green-500',
    error: 'border-red-500',
    warning: 'border-yellow-500',
    info: 'border-blue-500'
  }
  return colors[type] || colors.info
}

// 添加通知（保留用于向后兼容）
const addNotification = (notification) => {
  return notificationStore.addNotification(notification)
}

// 移除通知
const dismiss = (id) => {
  // 清除计时器
  if (timers.value.has(id)) {
    clearTimeout(timers.value.get(id))
    timers.value.delete(id)
  }
  // 清理相关数据
  pausedNotifications.value.delete(id)
  notificationStartTimes.value.delete(id)
  notificationPauseTimes.value.delete(id)
  
  notificationStore.removeNotification(id)
}

// 清空所有通知
const clearAll = () => {
  // 清除所有计时器
  timers.value.forEach((timer) => clearTimeout(timer))
  timers.value.clear()
  pausedNotifications.value.clear()
  notificationStartTimes.value.clear()
  notificationPauseTimes.value.clear()
  
  notificationStore.clearAllNotifications()
}

// 鼠标悬停时暂停计时器
const pauseTimer = (id) => {
  if (timers.value.has(id) && !pausedNotifications.value.has(id)) {
    clearTimeout(timers.value.get(id))
    pausedNotifications.value.add(id)
    notificationPauseTimes.value.set(id, Date.now())
  }
}

// 鼠标离开时恢复计时器
const resumeTimer = (id) => {
  if (pausedNotifications.value.has(id)) {
    pausedNotifications.value.delete(id)
    
    // 找到对应的通知
    const notification = notifications.value.find(n => n.id === id)
    if (notification && notification.duration > 0) {
      // 计算剩余时间
      const startTime = notificationStartTimes.value.get(id)
      const pauseTime = notificationPauseTimes.value.get(id)
      
      if (startTime && pauseTime) {
        const elapsedTime = pauseTime - startTime
        const remainingTime = Math.max(0, notification.duration - elapsedTime)
        
        if (remainingTime > 0) {
          // 更新开始时间，以便下次暂停计算正确
          notificationStartTimes.value.set(id, Date.now() - elapsedTime)
          
          const timer = setTimeout(() => {
            dismiss(id)
          }, remainingTime)
          
          timers.value.set(id, timer)
        } else {
          // 时间已到，立即关闭
          dismiss(id)
        }
      } else {
        // 没有记录的时间信息，重新开始完整计时
        const timer = setTimeout(() => {
          dismiss(id)
        }, notification.duration)
        
        timers.value.set(id, timer)
        notificationStartTimes.value.set(id, Date.now())
      }
      
      notificationPauseTimes.value.delete(id)
    }
  }
}

// 为新通知启动计时器
const startTimerForNotification = (notification) => {
  if (notification.duration > 0 && !notification.persistent) {
    const timer = setTimeout(() => {
      dismiss(notification.id)
    }, notification.duration)
    
    timers.value.set(notification.id, timer)
    notificationStartTimes.value.set(notification.id, Date.now())
  }
}

// 暴露给模板的函数
defineExpose({
  addNotification,
  clearAll
})

// 监听通知变化，为新通知启动计时器
watch(
  () => notifications.value,
  (newNotifications, oldNotifications) => {
    if (!oldNotifications) {
      // 首次加载，为所有通知启动计时器
      newNotifications.forEach(startTimerForNotification)
    } else {
      // 找出新增的通知
      const oldIds = new Set(oldNotifications.map(n => n.id))
      const newNotificationsList = newNotifications.filter(n => !oldIds.has(n.id))
      
      // 为新通知启动计时器
      newNotificationsList.forEach(startTimerForNotification)
      
             // 清理已删除通知的计时器
       const currentIds = new Set(newNotifications.map(n => n.id))
       timers.value.forEach((timer, id) => {
         if (!currentIds.has(id)) {
           clearTimeout(timer)
           timers.value.delete(id)
           pausedNotifications.value.delete(id)
           notificationStartTimes.value.delete(id)
           notificationPauseTimes.value.delete(id)
         }
       })
    }
  },
  { immediate: true, deep: true }
)

// 生命周期钩子
onMounted(() => {
  // 全局事件监听
  window.addEventListener('show-notification', (event) => {
    addNotification(event.detail)
  })
})

onUnmounted(() => {
  // 清理所有计时器
  timers.value.forEach((timer) => clearTimeout(timer))
  timers.value.clear()
  pausedNotifications.value.clear()
  notificationStartTimes.value.clear()
  notificationPauseTimes.value.clear()
})
</script>

<style scoped>
/* 进度条动画 */
@keyframes progress-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.animate-progress-shrink {
  animation: progress-shrink linear;
}

.animate-pause {
  animation-play-state: paused;
}

/* 通知动画效果 */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style> 