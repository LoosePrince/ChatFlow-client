<template>
  <div v-if="visible" class="message-type-overlay" @click="$emit('close')">
    <div class="message-type-dialog" @click.stop>
      <div class="dialog-header">
        <h3>
          <i class="fas fa-plus-circle"></i>
          选择消息类型
        </h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="dialog-content">
        <div class="message-types">
          <div 
            class="type-option"
            @click="selectType('bilibili')"
          >
            <div class="type-icon bilibili">
              <i class="fab fa-bilibili"></i>
            </div>
            <div class="type-info">
              <div class="type-title">B站视频</div>
              <div class="type-description">分享B站视频，输入BV号</div>
            </div>
            <div class="type-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
          
          <div 
            class="type-option"
            @click="selectType('markdown')"
          >
            <div class="type-icon markdown">
              <i class="fab fa-markdown"></i>
            </div>
            <div class="type-info">
              <div class="type-title">Markdown</div>
              <div class="type-description">发送格式化的Markdown内容</div>
            </div>
            <div class="type-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'select'])

const selectType = (type) => {
  emit('select', type)
  emit('close')
}
</script>

<style scoped>
.message-type-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  backdrop-filter: blur(3px);
}

.message-type-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  min-width: 400px;
  max-width: 500px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
}

.message-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-option {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.type-option:hover {
  border-color: #667eea;
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.type-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  margin-right: 16px;
}

.type-icon.bilibili {
  background: linear-gradient(135deg, #fb7299 0%, #ff6b9d 100%);
}

.type-icon.markdown {
  background: linear-gradient(135deg, #333 0%, #555 100%);
}

.type-info {
  flex: 1;
}

.type-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.type-description {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
}

.type-arrow {
  color: #6c757d;
  font-size: 14px;
  transition: all 0.2s ease;
}

.type-option:hover .type-arrow {
  color: #667eea;
  transform: translateX(4px);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .message-type-dialog {
    margin: 20px;
    width: calc(100% - 40px);
    min-width: auto;
  }
  
  .dialog-header,
  .dialog-content {
    padding: 16px 20px;
  }
  
  .type-option {
    padding: 12px 16px;
  }
  
  .type-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
    margin-right: 12px;
  }
  
  .type-title {
    font-size: 15px;
  }
  
  .type-description {
    font-size: 13px;
  }
}
</style> 