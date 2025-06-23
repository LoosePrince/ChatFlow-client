<!-- 通知容器组件 -->
<template>
  <div class="notification-container">
    <transition-group 
      name="notification" 
      tag="div" 
      class="notifications-wrapper"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'notification',
          `notification-${notification.type}`,
          'notification-dismissible',
          { 'notification-paused': pausedNotifications.has(notification.id) }
        ]"
        @click="dismiss(notification.id)"
        @mouseenter="pauseTimer(notification.id)"
        @mouseleave="resumeTimer(notification.id)"
      >
        <div class="notification-content">
          <i :class="getIcon(notification.type)" class="notification-icon"></i>
          <div class="notification-message">
            <div class="notification-title" v-if="notification.title">
              {{ notification.title }}
            </div>
            <div class="notification-text">
              {{ notification.message }}
            </div>
          </div>
          <button
            @click.stop="dismiss(notification.id)"
            class="notification-close"
            aria-label="关闭通知"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div 
          v-if="notification.duration && notification.duration > 0 && !notification.persistent"
          :class="[
            'notification-progress',
            { 'notification-progress-paused': pausedNotifications.has(notification.id) }
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
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 999;
  pointer-events: none;
}

.notifications-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.notification {
  pointer-events: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  min-width: 300px;
  max-width: 400px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.notification-success {
  border-left-color: #28a745;
}

.notification-error {
  border-left-color: #dc3545;
}

.notification-warning {
  border-left-color: #ffc107;
}

.notification-info {
  border-left-color: #17a2b8;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.notification-icon {
  font-size: 20px;
  margin-top: 2px;
  flex-shrink: 0;
}

.notification-success .notification-icon {
  color: #28a745;
}

.notification-error .notification-icon {
  color: #dc3545;
}

.notification-warning .notification-icon {
  color: #ffc107;
}

.notification-info .notification-icon {
  color: #17a2b8;
}

.notification-message {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #212529;
  font-size: 14px;
}

.notification-text {
  color: #6c757d;
  font-size: 13px;
  line-height: 1.4;
  word-wrap: break-word;
}

.notification-close {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: #f8f9fa;
  color: #495057;
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #007bff, #0056b3);
  animation: progress-shrink linear;
  transform-origin: left;
  transition: opacity 0.2s ease;
}

.notification-progress-paused {
  animation-play-state: paused;
  opacity: 0.6;
}

.notification-paused {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.dark .notification-paused {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
}

@keyframes progress-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* 动画效果 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .notifications-wrapper {
    max-width: none;
  }
  
  .notification {
    min-width: auto;
    max-width: none;
  }
}

/* 暗色模式样式 */
.dark .notification {
  background: #1e293b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.dark .notification:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
}

.dark .notification-title {
  color: #f1f5f9;
}

.dark .notification-text {
  color: #cbd5e1;
}

.dark .notification-close {
  color: #94a3b8;
}

.dark .notification-close:hover {
  background: #334155;
  color: #f1f5f9;
}
</style> 