<template>
  <!-- 踢人确认弹窗 -->
  <div v-if="visible" class="confirm-dialog-overlay" @click="$emit('cancel')">
    <div class="confirm-dialog kick-dialog" @click.stop>
      <div class="dialog-header">
        <h3>移出用户</h3>
      </div>
      <div class="dialog-content">
        <div class="kick-user-info">
          <img 
            :src="targetUser?.avatarUrl" 
            :alt="targetUser?.nickname"
            class="kick-user-avatar"
          >
          <div class="kick-user-details">
            <div class="kick-user-name">{{ targetUser?.nickname }}</div>
            <div class="kick-user-uid">{{ targetUser?.uid }}</div>
          </div>
        </div>
        <div class="kick-warning">
          <div class="warning-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="warning-text">
            <p>确定要移出此用户吗？</p>
            <p class="warning-note">被移出的用户将离开聊天室，但可以重新加入。</p>
          </div>
        </div>
      </div>
      <div class="dialog-actions">
        <button @click="$emit('cancel')" class="cancel-button">取消</button>
        <button @click="$emit('confirm')" class="confirm-button danger">
          确认移出
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  targetUser: {
    type: Object,
    default: null
  }
})

defineEmits(['cancel', 'confirm'])
</script>

<style scoped>
/* 确认对话框 */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: overlayFadeIn 0.2s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: dialogSlideIn 0.3s ease-out;
}

.kick-dialog {
  max-width: 450px;
}

.dialog-header {
  padding: 20px 20px 0;
  text-align: center;
}

.dialog-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.dialog-content {
  padding: 20px;
}

.kick-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.kick-user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.kick-user-details {
  flex: 1;
}

.kick-user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 4px;
}

.kick-user-uid {
  font-size: 14px;
  color: #6c757d;
}

.kick-warning {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.warning-icon {
  color: #ffc107;
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-text {
  flex: 1;
}

.warning-text p {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 15px;
}

.warning-text p:last-child {
  margin-bottom: 0;
}

.warning-note {
  font-size: 13px !important;
  color: #6c757d !important;
  line-height: 1.4;
}

.dialog-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-button,
.confirm-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-button {
  background: #f8f9fa;
  color: #6c757d;
}

.cancel-button:hover {
  background: #e9ecef;
  color: #495057;
}

.confirm-button {
  background: #1976d2;
  color: white;
}

.confirm-button:hover {
  background: #1565c0;
}

.confirm-button.danger {
  background: #dc3545;
}

.confirm-button.danger:hover {
  background: #c82333;
}

@media (max-width: 480px) {
  .kick-dialog {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .kick-warning {
    flex-direction: column;
    gap: 8px;
  }
  
  .warning-icon {
    align-self: center;
  }
}

/* 暗色模式样式 */
.dark .confirm-dialog-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark .confirm-dialog {
  background: #1e293b;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dark .dialog-header h3 {
  color: #f1f5f9;
}

.dark .kick-user-info {
  background: #334155;
}

.dark .kick-user-name {
  color: #f1f5f9;
}

.dark .kick-user-uid {
  color: #94a3b8;
}

.dark .warning-text p {
  color: #f1f5f9;
}

.dark .warning-note {
  color: #94a3b8 !important;
}

.dark .warning-icon {
  color: #f59e0b;
}

.dark .cancel-button {
  background: #64748b;
  color: #f1f5f9;
}

.dark .cancel-button:hover {
  background: #475569;
}

.dark .confirm-button {
  background: #3b82f6;
}

.dark .confirm-button:hover {
  background: #2563eb;
}

.dark .confirm-button.danger {
  background: #ef4444;
}

.dark .confirm-button.danger:hover {
  background: #dc2626;
}
</style> 