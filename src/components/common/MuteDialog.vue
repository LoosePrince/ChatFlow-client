<template>
  <!-- 禁言时间选择弹窗 -->
  <div v-if="visible" class="confirm-dialog-overlay" @click="$emit('cancel')">
    <div class="confirm-dialog mute-dialog" @click.stop>
      <div class="dialog-header">
        <h3>禁言用户</h3>
      </div>
      <div class="dialog-content">
        <div class="mute-user-info">
          <img 
            :src="targetUser?.avatarUrl" 
            :alt="targetUser?.nickname"
            class="mute-user-avatar"
          >
          <div class="mute-user-details">
            <div class="mute-user-name">{{ targetUser?.nickname }}</div>
            <div class="mute-user-uid">{{ targetUser?.uid }}</div>
          </div>
        </div>
        <div class="mute-time-selection">
          <p>选择禁言时长：</p>
          <div class="mute-time-options">
            <label 
              v-for="option in muteTimeOptions" 
              :key="option.value"
              class="mute-time-option"
            >
              <input 
                type="radio" 
                :value="option.value" 
                v-model="selectedTime"
                name="muteTime"
              >
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="dialog-actions">
        <button @click="$emit('cancel')" class="cancel-button">取消</button>
        <button @click="$emit('confirm', selectedTime)" class="confirm-button danger">
          确认禁言
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// 禁言时间选项
const muteTimeOptions = [
  { label: '5分钟', value: 300 },
  { label: '10分钟', value: 600 },
  { label: '30分钟', value: 1800 },
  { label: '1小时', value: 3600 },
  { label: '6小时', value: 21600 },
  { label: '24小时', value: 86400 },
  { label: '7天', value: 604800 },
  { label: '30天', value: 2592000 }
]

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  targetUser: {
    type: Object,
    default: null
  }
})

const selectedTime = ref(300) // 默认5分钟

// 当弹窗显示时重置选中时间
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    selectedTime.value = 300
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.mute-dialog {
  max-width: 480px;
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
  text-align: center;
}

.mute-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.mute-user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.mute-user-details {
  flex: 1;
}

.mute-user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 4px;
}

.mute-user-uid {
  font-size: 14px;
  color: #6c757d;
}

.mute-time-selection p {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-weight: 500;
}

.mute-time-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.mute-time-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mute-time-option:hover {
  border-color: #1976d2;
  background: #f3f8ff;
}

.mute-time-option input[type="radio"] {
  margin: 0;
}

.mute-time-option input[type="radio"]:checked + span {
  color: #1976d2;
  font-weight: 500;
}

.mute-time-option span {
  font-size: 14px;
  color: #2c3e50;
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
  .mute-time-options {
    grid-template-columns: 1fr;
  }
  
  .mute-dialog {
    margin: 20px;
    width: calc(100% - 40px);
  }
}
</style> 