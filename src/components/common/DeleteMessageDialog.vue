<template>
  <!-- 删除消息确认弹窗 -->
  <div v-if="visible" class="delete-dialog-overlay" @click="$emit('cancel')">
    <div class="delete-dialog" @click.stop>
      <div class="delete-dialog-header">
        <h3>
          <i class="fas fa-exclamation-triangle"></i>
          确认删除消息
        </h3>
      </div>
      
      <div class="delete-dialog-content">
        <div class="message-preview" :class="{ 'preview-deleting': isPreviewDeleting }">
          <div class="message-info">
            <img 
              :src="messageAvatarUrl" 
              :alt="targetMessage?.userName"
              class="message-avatar"
            >
            <div class="message-details">
              <div class="message-user">{{ targetMessage?.userName }}</div>
              <div class="message-time">{{ formatTime(targetMessage?.timestamp) }}</div>
            </div>
          </div>
          <div class="message-content">
            <span v-if="targetMessage?.type === 'image'">
              <i class="fas fa-image"></i> 图片消息
            </span>
            <span v-else>{{ targetMessage?.text }}</span>
          </div>
          
          <!-- 删除预览效果 -->
          <div v-if="isPreviewDeleting" class="delete-preview-overlay">
            <div class="delete-animation">
              <i class="fas fa-trash-alt"></i>
              <span>正在删除...</span>
            </div>
          </div>
        </div>
        
        <div class="warning-text">
          <i class="fas fa-info-circle"></i>
          删除后此消息将被物理删除，无法恢复，所有用户将无法查看
        </div>
      </div>
      
      <div class="delete-dialog-actions">
        <button @click="$emit('cancel')" class="cancel-button">
          <i class="fas fa-times"></i>
          取消
        </button>
        <button @click="handleConfirm" class="confirm-button" :disabled="isPreviewDeleting">
          <i class="fas fa-spinner fa-spin" v-if="isPreviewDeleting"></i>
          <i class="fas fa-trash-alt" v-else></i>
          {{ isPreviewDeleting ? '删除中...' : '确认删除' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  targetMessage: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['confirm', 'cancel'])

// 删除预览状态
const isPreviewDeleting = ref(false)

// 处理确认删除
const handleConfirm = async () => {
  if (isPreviewDeleting.value) return
  
  isPreviewDeleting.value = true
  
  // 显示删除动画
  setTimeout(() => {
    emit('confirm')
    isPreviewDeleting.value = false
  }, 800) // 动画持续时间
}

// 获取头像URL
const messageAvatarUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  if (!props.targetMessage?.userAvatar) {
    return `${baseUrl}/avatars/default`
  }
  
  if (props.targetMessage.userAvatar.startsWith('http') || props.targetMessage.userAvatar.startsWith('data:')) {
    return props.targetMessage.userAvatar
  }
  
  return `${baseUrl}${props.targetMessage.userAvatar}`
})

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // 一分钟内
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 一小时内
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }
  
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  }
  
  // 其他
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* 弹窗遮罩 */
.delete-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(3px);
}

.delete-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  min-width: 400px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: deleteDialogFadeIn 0.2s ease-out;
}

@keyframes deleteDialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 弹窗头部 */
.delete-dialog-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
}

.delete-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.delete-dialog-header i {
  font-size: 20px;
}

/* 弹窗内容 */
.delete-dialog-content {
  padding: 20px 24px;
}

.message-preview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid #dc3545;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.message-preview.preview-deleting {
  opacity: 0.7;
  transform: scale(0.98);
  background: #ffebee;
  border-left-color: #f44336;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-details {
  flex: 1;
  min-width: 0;
}

.message-user {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.2;
}

.message-time {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.2;
}

.message-content {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  color: #2c3e50;
  line-height: 1.4;
  font-size: 14px;
  word-wrap: break-word;
  max-height: 100px;
  overflow-y: auto;
}

.warning-text {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #856404;
  background: #fff3cd;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #ffeaa7;
}

.warning-text i {
  color: #f39c12;
  font-size: 16px;
}

/* 删除预览覆盖层 */
.delete-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(244, 67, 54, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: deletePreviewFadeIn 0.3s ease-in;
}

.delete-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.delete-animation i {
  font-size: 24px;
  animation: deleteIconPulse 1s infinite;
}

@keyframes deletePreviewFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes deleteIconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* 弹窗按钮 */
.delete-dialog-actions {
  padding: 16px 24px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.cancel-button,
.confirm-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  justify-content: center;
}

.cancel-button {
  background: #6c757d;
  color: white;
}

.cancel-button:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.confirm-button {
  background: #dc3545;
  color: white;
}

.confirm-button:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

.confirm-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .delete-dialog {
    margin: 20px;
    width: calc(100% - 40px);
    min-width: auto;
  }
  
  .delete-dialog-header,
  .delete-dialog-content,
  .delete-dialog-actions {
    padding: 16px 20px;
  }
  
  .delete-dialog-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .cancel-button,
  .confirm-button {
    width: 100%;
  }
}

/* 暗色模式样式 */
.dark .delete-dialog-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark .delete-dialog {
  background: #1e293b;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
}

.dark .delete-dialog-header {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-bottom: 1px solid #475569;
}

.dark .delete-dialog-content {
  background: #1e293b;
  border-bottom: 1px solid #475569;
}

.dark .message-preview {
  background: #334155;
  border: 1px solid #475569;
  border-left: 4px solid #60a5fa;
}

.dark .message-preview.preview-deleting {
  background: #450a0a;
  border-left-color: #ef4444;
}

.dark .message-user {
  color: #f1f5f9;
}

.dark .message-time {
  color: #94a3b8;
}

.dark .message-content {
  background: #1e293b;
  border: 1px solid #475569;
  color: #f1f5f9;
}

.dark .warning-text {
  color: #fbbf24;
  background: #451a03;
  border: 1px solid #92400e;
}

.dark .warning-text i {
  color: #f59e0b;
}

.dark .delete-dialog-actions {
  background: #0f172a;
  border-top: 1px solid #475569;
}

.dark .cancel-button {
  background: #64748b;
}

.dark .cancel-button:hover {
  background: #475569;
}

.dark .confirm-button {
  background: #ef4444;
}

.dark .confirm-button:hover:not(:disabled) {
  background: #dc2626;
}

.dark .confirm-button:disabled {
  background: #64748b;
}
</style> 