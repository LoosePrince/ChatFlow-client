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
          { 'notification-dismissible': notification.dismissible }
        ]"
        @click="notification.dismissible && dismiss(notification.id)"
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
            v-if="notification.dismissible"
            @click.stop="dismiss(notification.id)"
            class="notification-close"
            aria-label="关闭通知"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div 
          v-if="notification.autoHide && notification.duration"
          class="notification-progress"
          :style="{ animationDuration: `${notification.duration}ms` }"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 组件名称（用于调试）
defineOptions({
  name: 'NotificationContainer'
})

// 响应式数据
const notifications = ref([])

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

// 添加通知
const addNotification = (notification) => {
  const id = Date.now() + Math.random()
  const newNotification = {
    id,
    type: 'info',
    dismissible: true,
    autoHide: true,
    duration: 5000,
    ...notification
  }

  notifications.value.push(newNotification)

  // 自动隐藏
  if (newNotification.autoHide && newNotification.duration) {
    setTimeout(() => {
      dismiss(id)
    }, newNotification.duration)
  }

  return id
}

// 移除通知
const dismiss = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 清空所有通知
const clearAll = () => {
  notifications.value = []
}

// 暴露给模板的函数
defineExpose({
  addNotification,
  clearAll
})

// 生命周期钩子
onMounted(() => {
  // 全局事件监听
  window.addEventListener('show-notification', (event) => {
    addNotification(event.detail)
  })
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