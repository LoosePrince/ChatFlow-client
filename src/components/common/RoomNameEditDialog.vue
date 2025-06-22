<template>
  <div v-if="visible" class="room-name-edit-overlay" @click="$emit('cancel')">
    <div class="room-name-edit-dialog" @click.stop>
      <div class="dialog-header">
        <h3>
          <i class="fas fa-edit"></i>
          修改聊天室名称
        </h3>
        <button @click="$emit('cancel')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="dialog-content">
        <div class="input-group">
          <label class="input-label">
            <i class="fas fa-tag"></i>
            聊天室名称
          </label>
          <input
            ref="nameInput"
            v-model="newRoomName"
            type="text"
            placeholder="请输入新的聊天室名称"
            class="room-name-input"
            maxlength="50"
            @keydown.enter="handleSubmit"
          >
          <div class="char-count">{{ newRoomName.length }}/50</div>
        </div>
        
        <div class="tips">
          <i class="fas fa-info-circle"></i>
          <span>只有聊天室创建者可以修改名称</span>
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
          <i class="fas fa-check" v-else></i>
          {{ isSubmitting ? '修改中...' : '确认修改' }}
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
  },
  currentName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['cancel', 'submit'])

// 状态管理
const newRoomName = ref('')
const isSubmitting = ref(false)
const nameInput = ref(null)

// 计算属性
const canSubmit = computed(() => {
  return newRoomName.value.trim().length > 0 && 
         newRoomName.value.trim().length <= 50 && 
         newRoomName.value.trim() !== props.currentName &&
         !isSubmitting.value
})

// 处理提交
const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  isSubmitting.value = true
  
  try {
    await emit('submit', newRoomName.value.trim())
    
    // 重置表单
    newRoomName.value = ''
  } catch (error) {
    console.error('修改聊天室名称失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 监听显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    // 初始化当前名称
    newRoomName.value = props.currentName
    nextTick(() => {
      nameInput.value?.focus()
      nameInput.value?.select()
    })
  } else {
    // 关闭时重置状态
    newRoomName.value = ''
    isSubmitting.value = false
  }
})
</script>

<style scoped>
.room-name-edit-overlay {
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

.room-name-edit-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: dialogSlideIn 0.3s ease-out;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-header h3 i {
  color: #1976d2;
}

.close-btn {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #2c3e50;
  background: #f8f9fa;
}

.dialog-content {
  padding: 24px;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.input-label i {
  color: #1976d2;
}

.room-name-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px !important;
  background: white;
  font-size: 14px;
  color: #2c3e50;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.room-name-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #6c757d;
  margin-top: 6px;
}

.tips {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
  color: #6c757d;
}

.tips i {
  color: #1976d2;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 20px;
}

.cancel-btn {
  padding: 10px 20px;
  border: none;
  background: #f8f9fa;
  color: #6c757d;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cancel-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.submit-btn {
  padding: 10px 20px;
  border: none;
  background: #1976d2;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.submit-btn:hover:not(:disabled) {
  background: #1565c0;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn.loading {
  pointer-events: none;
}

@media (max-width: 480px) {
  .room-name-edit-dialog {
    margin: 20px;
    width: calc(100% - 40px);
  }
}

/* 暗色模式样式 */
.dark .room-name-edit-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark .room-name-edit-dialog {
  background: #1e293b;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dark .dialog-header {
  border-bottom: 1px solid #475569;
}

.dark .dialog-header h3 {
  color: #f1f5f9;
}

.dark .dialog-header h3 i {
  color: #60a5fa;
}

.dark .close-btn {
  color: #94a3b8;
}

.dark .close-btn:hover {
  color: #f1f5f9;
  background: #334155;
}

.dark .input-label {
  color: #f1f5f9;
}

.dark .input-label i {
  color: #60a5fa;
}

.dark .room-name-input {
  border: 2px solid #475569;
  background: #334155;
  color: #f1f5f9;
}

.dark .room-name-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.dark .char-count {
  color: #94a3b8;
}

.dark .tips {
  background: #334155;
  color: #94a3b8;
}

.dark .tips i {
  color: #60a5fa;
}

.dark .cancel-btn {
  background: #64748b;
  color: #f1f5f9;
}

.dark .cancel-btn:hover {
  background: #475569;
}

.dark .submit-btn {
  background: #3b82f6;
}

.dark .submit-btn:hover:not(:disabled) {
  background: #2563eb;
}
</style> 