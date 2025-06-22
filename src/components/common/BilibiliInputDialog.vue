<template>
  <div v-if="visible" class="bilibili-input-overlay" @click="$emit('cancel')">
    <div class="bilibili-input-dialog" @click.stop>
      <div class="dialog-header">
        <h3>
          <i class="fab fa-bilibili"></i>
          发送B站视频
        </h3>
        <button @click="$emit('cancel')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="dialog-content">
        <div class="input-group">
          <label class="input-label">
            <i class="fas fa-video"></i>
            BV号 <span class="required">*</span>
          </label>
          <input
            ref="bvInput"
            v-model="bvId"
            type="text"
            placeholder="请输入B站视频BV号，如：BV1234567890"
            class="bv-input"
            @input="validateBvId"
            @keyup.enter="handleSubmit"
          >
          <div v-if="bvError" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ bvError }}
          </div>
          <div v-if="isValidBv && bvId" class="success-message">
            <i class="fas fa-check-circle"></i>
            BV号格式正确
          </div>
        </div>
        

        
        <!-- 预览区域 -->
        <div v-if="isValidBv && bvId" class="preview-section">
          <div class="preview-header">
            <i class="fas fa-eye"></i>
            预览
          </div>
          <div class="video-preview">
            <iframe 
              :src="`//player.bilibili.com/player.html?bvid=${bvId}`"
              class="preview-player"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button @click="$emit('cancel')" class="cancel-btn">
          <i class="fas fa-times"></i>
          取消
        </button>
        <button 
          @click="handleSubmit" 
          :disabled="!canSubmit"
          class="submit-btn"
          :class="{ 'loading': isSubmitting }"
        >
          <i class="fas fa-spinner fa-spin" v-if="isSubmitting"></i>
          <i class="fas fa-paper-plane" v-else></i>
          {{ isSubmitting ? '发送中...' : '发送视频' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cancel', 'submit'])

// 状态管理
const bvId = ref('')
const bvError = ref('')
const isSubmitting = ref(false)
const bvInput = ref(null)

// 计算属性
const isValidBv = computed(() => {
  return /^BV[a-zA-Z0-9]{10}$/.test(bvId.value)
})

const canSubmit = computed(() => {
  return isValidBv.value && !isSubmitting.value
})

// 验证BV号
const validateBvId = () => {
  const value = bvId.value.trim()
  
  if (!value) {
    bvError.value = ''
    return
  }
  
  if (!value.startsWith('BV')) {
    bvError.value = 'BV号必须以"BV"开头'
    return
  }
  
  if (value.length !== 12) {
    bvError.value = 'BV号长度应为12位字符'
    return
  }
  
  if (!/^BV[a-zA-Z0-9]{10}$/.test(value)) {
    bvError.value = 'BV号格式不正确，应为BV+10位字母数字'
    return
  }
  
  bvError.value = ''
}

// 处理提交
const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  isSubmitting.value = true
  
  try {
    await emit('submit', {
      bilibiliId: bvId.value.trim()
    })
    
    // 重置表单
    bvId.value = ''
    bvError.value = ''
  } catch (error) {
    console.error('发送B站视频失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 监听显示状态，自动聚焦
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    nextTick(() => {
      bvInput.value?.focus()
    })
  } else {
    // 关闭时重置状态
    bvId.value = ''
    bvError.value = ''
    isSubmitting.value = false
  }
})
</script>

<style scoped>
.bilibili-input-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 150;
  backdrop-filter: blur(3px);
}

.bilibili-input-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  min-width: 500px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: dialogFadeIn 0.3s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #fb7299 0%, #ff6b9d 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.dialog-content {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.required {
  color: #e74c3c;
}

.bv-input,
.description-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px !important;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.bv-input:focus,
.description-input:focus {
  outline: none;
  border-color: #fb7299;
  background: white;
  box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.1);
}

.description-input {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e74c3c;
  font-size: 12px;
  margin-top: 6px;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #27ae60;
  font-size: 12px;
  margin-top: 6px;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.preview-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.video-preview {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.preview-player {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.dialog-actions {
  padding: 16px 24px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.cancel-btn,
.submit-btn {
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

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.submit-btn {
  background: #fb7299;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #e85a8a;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.submit-btn.loading {
  background: #6c757d;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .bilibili-input-dialog {
    margin: 20px;
    width: calc(100% - 40px);
    min-width: auto;
  }
  
  .dialog-header,
  .dialog-content,
  .dialog-actions {
    padding: 16px 20px;
  }
  
  .dialog-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}

/* 暗色模式样式 */
.dark .bilibili-input-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark .bilibili-input-dialog {
  background: #1e293b;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
}

.dark .dialog-header {
  background: linear-gradient(135deg, #fb7299 0%, #f64a83 100%);
  border-bottom: 1px solid #475569;
}

.dark .dialog-content {
  background: #1e293b;
}

.dark .input-label {
  color: #f1f5f9;
}

.dark .bv-input,
.dark .description-input {
  background: #334155;
  border: 2px solid #475569;
  color: #f1f5f9;
}

.dark .bv-input::placeholder,
.dark .description-input::placeholder {
  color: #94a3b8;
}

.dark .bv-input:focus,
.dark .description-input:focus {
  background: #1e293b;
  border-color: #fb7299;
  box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.2);
}

.dark .char-count {
  color: #94a3b8;
}

.dark .preview-section {
  border-top: 1px solid #475569;
}

.dark .preview-header {
  color: #f1f5f9;
}

.dark .video-preview {
  border: 2px solid #475569;
}

.dark .dialog-actions {
  background: #0f172a;
  border-top: 1px solid #475569;
}

.dark .cancel-btn {
  background: #64748b;
}

.dark .cancel-btn:hover {
  background: #475569;
}

.dark .submit-btn {
  background: #fb7299;
}

.dark .submit-btn:hover:not(:disabled) {
  background: #e85a8a;
}

.dark .submit-btn:disabled,
.dark .submit-btn.loading {
  background: #64748b;
}
</style> 