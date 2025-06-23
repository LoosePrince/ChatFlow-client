<template>
  <div v-if="visible" class="compression-dialog-overlay">
    <div class="compression-dialog">
      <div class="compression-dialog-header">
        <i class="fas fa-compress-alt"></i>
        <span>图片压缩确认</span>
      </div>
      
      <div class="compression-dialog-content">
        <div class="file-info">
          <div class="file-icon">
            <i class="fas fa-image"></i>
          </div>
          <div class="file-details">
            <div class="file-name">{{ fileName }}</div>
            <div class="file-size">{{ fileSizeInMB }}MB</div>
          </div>
        </div>
        
        <div class="compression-message">
          <p>图片大小超过了1MB限制，需要压缩后才能发送。</p>
          <p>压缩后图片质量可能会有所降低，但仍能保持较好的视觉效果。</p>
        </div>
        
        <div class="compression-options">
          <div class="option-item">
            <i class="fas fa-check-circle text-success"></i>
            <span>自动调整分辨率至1920x1080以内</span>
          </div>
          <div class="option-item">
            <i class="fas fa-check-circle text-success"></i>
            <span>智能压缩质量以控制文件大小</span>
          </div>
          <div class="option-item">
            <i class="fas fa-check-circle text-success"></i>
            <span>保持图片原始格式和比例</span>
          </div>
        </div>
      </div>
      
      <div class="compression-dialog-actions">
        <button class="btn btn-secondary" @click="handleCancel">
          <i class="fas fa-times"></i>
          取消发送
        </button>
        <button class="btn btn-primary" @click="handleConfirm">
          <i class="fas fa-compress-alt"></i>
          压缩并发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['confirm', 'cancel'])

// 计算属性
const fileSizeInMB = computed(() => {
  return (props.fileSize / (1024 * 1024)).toFixed(2)
})

// 事件处理
const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.compression-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(4px);
}

.compression-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  min-width: 480px;
  max-width: 90%;
  overflow: hidden;
  animation: dialogFadeIn 0.3s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.compression-dialog-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.compression-dialog-header i {
  font-size: 18px;
}

.compression-dialog-content {
  padding: 24px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.file-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  word-break: break-all;
}

.file-size {
  color: #6c757d;
  font-size: 14px;
}

.compression-message {
  margin-bottom: 20px;
  line-height: 1.6;
}

.compression-message p {
  margin: 0 0 8px 0;
  color: #495057;
}

.compression-options {
  margin-bottom: 20px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #495057;
}

.text-success {
  color: #28a745 !important;
}

.compression-dialog-actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  background: #f8f9fa;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 暗色模式样式 */
.dark .compression-dialog-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark .compression-dialog {
  background: #1f2937;
  color: #f1f5f9;
}

.dark .file-info {
  background: #374151;
}

.dark .file-name {
  color: #f1f5f9;
}

.dark .file-size {
  color: #9ca3af;
}

.dark .compression-message p {
  color: #d1d5db;
}

.dark .option-item {
  color: #d1d5db;
}

.dark .compression-dialog-actions {
  background: #374151;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .compression-dialog {
    min-width: auto;
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .compression-dialog-content {
    padding: 20px;
  }
  
  .compression-dialog-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 