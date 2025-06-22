import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  // 状态
  const notifications = ref([])
  const nextId = ref(1)
  
  // 添加通知
  const addNotification = (notification) => {
    const id = nextId.value++
    const newNotification = {
      id,
      type: notification.type || 'info', // success, error, warning, info
      title: notification.title || '',
      message: notification.message || '',
      duration: notification.duration !== undefined ? notification.duration : 5000, // 默认5秒
      persistent: notification.persistent || false, // 是否持久显示
      actions: notification.actions || [], // 自定义操作按钮
      timestamp: Date.now()
    }
    
    notifications.value.push(newNotification)
    
    // 如果不是持久通知且有持续时间，则自动移除
    if (!newNotification.persistent && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }
  
  // 移除通知
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  // 清除所有通知
  const clearAllNotifications = () => {
    notifications.value = []
  }
  
  // 清除指定类型的通知
  const clearNotificationsByType = (type) => {
    notifications.value = notifications.value.filter(n => n.type !== type)
  }
  
  // 快捷方法
  const success = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    })
  }
  
  const error = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: options.duration !== undefined ? options.duration : 8000, // 错误消息显示更久
      ...options
    })
  }
  
  const warning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    })
  }
  
  const info = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    })
  }
  
  // 显示加载状态通知
  const loading = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      persistent: true,
      ...options
    })
  }
  
  // 更新通知内容
  const updateNotification = (id, updates) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      Object.assign(notification, updates)
    }
  }
  
  // 检查是否存在指定类型的通知
  const hasNotificationType = (type) => {
    return notifications.value.some(n => n.type === type)
  }
  
  // 获取指定类型的通知数量
  const getNotificationCount = (type) => {
    if (type) {
      return notifications.value.filter(n => n.type === type).length
    }
    return notifications.value.length
  }
  
  return {
    // 状态
    notifications,
    
    // 方法
    addNotification,
    removeNotification,
    clearAllNotifications,
    clearNotificationsByType,
    updateNotification,
    
    // 快捷方法
    success,
    error,
    warning,
    info,
    loading,
    
    // 工具方法
    hasNotificationType,
    getNotificationCount
  }
}) 