<template>
  <div class="message-input-container">
    <!-- 回复预览样式 -->
    <div v-if="replyState.isReplying" class="reply-preview">
      <div class="reply-info">
        <i class="fas fa-reply"></i>
        <span>回复 {{ replyState.targetMessage?.userName }}</span>
      </div>
      <div class="reply-content">
        <span v-if="replyState.targetMessage?.type === 'image'">
          <i class="fas fa-image"></i> 图片
        </span>
        <span v-else-if="replyState.targetMessage?.type === 'bilibili'">
          <i class="fab fa-bilibili"></i> B站视频 {{ replyState.targetMessage?.bilibiliId }}
        </span>
        <span v-else-if="replyState.targetMessage?.type === 'markdown'">
          <i class="fab fa-markdown"></i> {{ replyState.targetMessage?.text || 'Markdown内容' }}
        </span>
        <span v-else-if="replyState.targetMessage?.type === 'file'">
          <i class="fas fa-file"></i> {{ replyState.targetMessage?.fileName }}
        </span>
        <span v-else>{{ replyState.targetMessage?.text }}</span>
      </div>
      <button @click="cancelReply" class="reply-cancel">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="message-form">
      <!-- 功能按钮行 -->
      <div class="function-buttons">
        <!-- 图片选择按钮 -->
        <button 
          type="button" 
          @click="$emit('selectImage')" 
          :disabled="!canSendMessage"
          class="image-button"
          title="发送图片"
        >
          <i class="fas fa-image"></i>
        </button>
        
        <!-- 扩展消息类型按钮 -->
        <button 
          type="button" 
          @click="$emit('showMessageTypeSelector')" 
          :disabled="!canSendMessage"
          class="extend-button"
          title="更多消息类型"
        >
          <i class="fas fa-plus"></i>
        </button>
      </div>
      
      <!-- 输入行 -->
      <div class="input-row">
        <textarea
          ref="messageInput"
          v-model="messageValue"
          :placeholder="placeholderText"
          :disabled="!canSendMessage"
          class="message-input"
          :maxlength="maxLength"
          rows="1"
          @keydown="handleKeyDown"
          @paste="$emit('paste', $event)"
          @input="adjustHeight"
        ></textarea>
        <button 
          type="submit" 
          :disabled="!canSendMessage || !messageValue.trim()" 
          class="send-button"
          :title="sendButtonTitle"
          @mousedown="handleMouseDown"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseLeave"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <i class="fas fa-paper-plane"></i>
          <!-- 快捷键小标 -->
          <span v-if="sendMode" class="shortcut-badge">
            {{ sendMode === 1 ? 'Shift + ↵' : '↵' }}
          </span>
        </button>
      </div>
    </form>
  </div>

  <!-- 发送方案选择对话框 -->
  <div v-if="showSendModeDialog" class="send-mode-overlay" @click="closeSendModeDialog">
    <div class="send-mode-dialog" @click.stop>
      <div class="dialog-header">
        <h3>
          <i class="fas fa-keyboard"></i>
          选择发送方案
        </h3>
      </div>
      
      <div class="dialog-content">
        <p class="dialog-description">
          请选择您喜欢的发送消息方式，选择后将记住您的偏好：
        </p>
        
        <div class="send-mode-options">
          <div 
            class="mode-option"
            :class="{ 'recommended': true }"
            @click="selectSendMode(1)"
          >
            <div class="mode-icon">
              <i class="fas fa-level-up-alt"></i>
            </div>
            <div class="mode-info">
              <div class="mode-title">方案一（推荐）</div>
              <div class="mode-description">
                <strong>Shift + Enter</strong> 发送消息<br>
                <strong>Enter</strong> 换行
              </div>
            </div>
            <div class="mode-badge">
              <span>推荐</span>
            </div>
          </div>
          
          <div 
            class="mode-option"
            @click="selectSendMode(2)"
          >
            <div class="mode-icon">
              <i class="fas fa-paper-plane"></i>
            </div>
            <div class="mode-info">
              <div class="mode-title">方案二</div>
              <div class="mode-description">
                <strong>Enter</strong> 发送消息<br>
                <strong>Shift + Enter</strong> 换行
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'

// 组件属性
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  canSendMessage: {
    type: Boolean,
    default: true
  },
  replyState: {
    type: Object,
    default: () => ({
      isReplying: false,
      targetMessage: null
    })
  },
  maxLength: {
    type: Number,
    default: 500
  },
  placeholder: {
    type: String,
    default: '输入消息...'
  }
})

// 组件事件
const emit = defineEmits([
  'update:modelValue',
  'sendMessage',
  'cancelReply',
  'selectImage',
  'showMessageTypeSelector',
  'paste'
])

// 组件状态
const messageInput = ref(null)
const showSendModeDialog = ref(false)
const sendMode = ref(null) // 1: Shift+Enter发送, 2: Enter发送

// 长按相关状态
const longPressTimer = ref(null)
const isLongPressing = ref(false)
const LONG_PRESS_DELAY = 500 // 500ms长按触发

// 计算属性
const messageValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const placeholderText = computed(() => {
  if (!props.canSendMessage) return '无法发送消息...'
  return props.placeholder
})

const sendButtonTitle = computed(() => {
  if (!sendMode.value) return '发送消息'
  
  return sendMode.value === 1 
    ? 'Shift + Enter 发送消息' 
    : 'Enter 发送消息'
})

// 本地存储键名
const SEND_MODE_KEY = 'chatroom-send-mode'

// 生命周期
onMounted(() => {
  loadSendMode()
  adjustHeight()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
  }
})

// 监听消息值变化，自动调整高度
watch(() => props.modelValue, () => {
  nextTick(() => {
    adjustHeight()
  })
})

// 方法
const loadSendMode = () => {
  const saved = localStorage.getItem(SEND_MODE_KEY)
  if (saved) {
    sendMode.value = parseInt(saved)
  }
}

const saveSendMode = (mode) => {
  localStorage.setItem(SEND_MODE_KEY, mode.toString())
  sendMode.value = mode
}

const handleKeyDown = (event) => {
  // 根据选择的方案处理按键
  if (sendMode.value === 1) {
    // 方案1: Shift + Enter 发送，Enter 换行
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    } else if (event.key === 'Enter') {
      // 允许换行，不阻止默认行为
      setTimeout(() => adjustHeight(), 0)
    }
  } else if (sendMode.value === 2) {
    // 方案2: Enter 发送，Shift + Enter 换行
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    } else if (event.key === 'Enter' && event.shiftKey) {
      // 允许换行，不阻止默认行为
      setTimeout(() => adjustHeight(), 0)
    }
  } else {
    // 如果还没有选择发送方案，首次Enter显示选择对话框
    if (event.key === 'Enter') {
      event.preventDefault()
      showSendModeDialog.value = true
      return
    }
  }
}

const handleSubmit = () => {
  if (!props.canSendMessage || !messageValue.value.trim()) return
  emit('sendMessage', messageValue.value.trim())
}

const adjustHeight = () => {
  if (!messageInput.value) return
  
  // 重置高度以获取正确的scrollHeight
  messageInput.value.style.height = 'auto'
  
  // 计算新的高度（最小1行，最大6行）
  const lineHeight = 20 // 每行的高度
  const minHeight = lineHeight + 24 // 1行 + padding
  const maxHeight = lineHeight * 6 + 24 // 6行 + padding
  
  const scrollHeight = messageInput.value.scrollHeight
  const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
  
  messageInput.value.style.height = newHeight + 'px'
}

const selectSendMode = (mode) => {
  saveSendMode(mode)
  showSendModeDialog.value = false
  
  // 聚焦输入框
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.focus()
    }
  })
}

const closeSendModeDialog = () => {
  showSendModeDialog.value = false
}

const cancelReply = () => {
  emit('cancelReply')
}

// 对外暴露的方法
const focus = () => {
  if (messageInput.value) {
    messageInput.value.focus()
  }
}

const blur = () => {
  if (messageInput.value) {
    messageInput.value.blur()
  }
}

// 长按事件处理
const startLongPress = () => {
  isLongPressing.value = false
  longPressTimer.value = setTimeout(() => {
    isLongPressing.value = true
    showSendModeDialog.value = true
  }, LONG_PRESS_DELAY)
}

const cancelLongPress = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

const handleMouseDown = (event) => {
  event.preventDefault()
  startLongPress()
}

const handleMouseUp = (event) => {
  cancelLongPress()
  // 如果不是长按，执行正常提交
  if (!isLongPressing.value) {
    handleSubmit()
  }
  isLongPressing.value = false
}

const handleMouseLeave = () => {
  cancelLongPress()
  isLongPressing.value = false
}

const handleTouchStart = (event) => {
  event.preventDefault()
  startLongPress()
}

const handleTouchEnd = (event) => {
  cancelLongPress()
  // 如果不是长按，执行正常提交
  if (!isLongPressing.value) {
    handleSubmit()
  }
  isLongPressing.value = false
}

// 暴露方法给父组件
defineExpose({
  focus,
  blur
})
</script>

<style scoped>
.message-input-container {
  width: 100%;
}

/* 回复预览样式 */
.reply-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
}

/* 暗色模式回复预览 */
.dark .reply-preview {
  background: #1e293b;
  border: 1px solid #475569;
}

.reply-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #1976d2;
  font-weight: 600;
  min-width: 0;
}

/* 暗色模式回复信息 */
.dark .reply-info {
  color: #60a5fa;
}

.reply-info i {
  font-size: 14px;
  color: #1976d2;
}

/* 暗色模式回复图标 */
.dark .reply-info i {
  color: #60a5fa;
}

.reply-content {
  flex: 1;
  font-size: 13px;
  color: #6c757d;
  line-height: 1.3;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 暗色模式回复内容 */
.dark .reply-content {
  color: #94a3b8;
}

.reply-cancel {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.reply-cancel:hover {
  background: #e9ecef;
  color: #dc3545;
}

/* 暗色模式回复取消按钮 */
.dark .reply-cancel {
  color: #94a3b8;
}

.dark .reply-cancel:hover {
  background: #475569;
  color: #ef4444;
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.function-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.input-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  line-height: 20px;
  resize: none;
  font-family: inherit;
  transition: all 0.3s ease;
  min-height: 44px;
  max-height: 144px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.message-input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

/* 暗色模式消息输入框 */
.dark .message-input {
  background: #334155;
  border: 1px solid #475569;
  color: #f1f5f9;
}

.dark .message-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.1);
}

.dark .message-input::placeholder {
  color: #94a3b8;
}

.message-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

/* 暗色模式禁用状态 */
.dark .message-input:disabled {
  background: #1e293b;
  color: #64748b;
}

/* 自定义滚动条 */
.message-input::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.message-input::-webkit-scrollbar-track {
  background: transparent;
}

.message-input::-webkit-scrollbar-thumb {
  background: transparent;
}

.message-input::-webkit-scrollbar-thumb:hover {
  background: transparent;
}

/* 暗色模式滚动条 */
.dark .message-input::-webkit-scrollbar-thumb {
  background: transparent;
}

.dark .message-input::-webkit-scrollbar-thumb:hover {
  background: transparent;
}

.send-button {
  width: 48px;
  height: 48px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
}

.send-button:hover:not(:disabled) {
  background: #1565c0;
  transform: scale(1.05);
}

/* 暗色模式发送按钮悬停 */
.dark .send-button:hover:not(:disabled) {
  background: #2563eb;
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 暗色模式发送按钮禁用 */
.dark .send-button:disabled {
  background: #64748b;
}

/* 图片按钮样式 */
.image-button {
  width: 36px;
  height: 36px;
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #ddd;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-size: 14px;
}

.image-button:hover:not(:disabled) {
  background: #e9ecef;
  color: #1976d2;
  border-color: #1976d2;
  transform: scale(1.05);
}

/* 暗色模式图片按钮 */
.dark .image-button {
  background: #334155;
  color: #94a3b8;
  border: 1px solid #475569;
}

.dark .image-button:hover:not(:disabled) {
  background: #475569;
  color: #60a5fa;
  border-color: #60a5fa;
}

.image-button:disabled {
  background: #f8f9fa;
  color: #ccc;
  border-color: #e9ecef;
  cursor: not-allowed;
  transform: none;
}

/* 暗色模式图片按钮禁用 */
.dark .image-button:disabled {
  background: #1e293b;
  color: #64748b;
  border-color: #475569;
}

/* 扩展按钮样式 */
.extend-button {
  width: 36px;
  height: 36px;
  background: #667eea;
  color: white;
  border: 1px solid #667eea;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-size: 14px;
}

.extend-button:hover:not(:disabled) {
  background: #5a67d8;
  border-color: #5a67d8;
  transform: scale(1.05);
}

/* 暗色模式扩展按钮悬停 */
.dark .extend-button:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.extend-button:disabled {
  background: #ccc;
  color: #666;
  border-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 暗色模式扩展按钮禁用 */
.dark .extend-button:disabled {
  background: #64748b;
  color: #475569;
  border-color: #64748b;
}

/* 发送方案选择对话框 */
.send-mode-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background: rgba(0, 0, 0, 0.5); */
  display: flex;
  align-items: center;
  justify-content: center;
  /* z-index: 1000; */
  /* backdrop-filter: blur(4px); */
}

.send-mode-dialog {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

/* 暗色模式发送方案对话框 */
.dark .send-mode-dialog {
  background: #1e293b;
}

.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  text-align: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.dialog-content {
  padding: 32px 24px 24px;
}

.dialog-description {
  text-align: center;
  color: #6c757d;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* 暗色模式对话框描述 */
.dark .dialog-description {
  color: #94a3b8;
}

.send-mode-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.mode-option:hover {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
}

.mode-option.recommended {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

.mode-option.recommended:hover {
  background: rgba(25, 118, 210, 0.1);
}

/* 暗色模式方案选项 */
.dark .mode-option {
  border-color: #475569;
  background: transparent;
}

.dark .mode-option:hover {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.dark .mode-option.recommended {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.mode-icon {
  width: 48px;
  height: 48px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
  font-size: 20px;
  flex-shrink: 0;
}

.mode-option.recommended .mode-icon {
  background: #1976d2;
  color: white;
}

/* 暗色模式方案图标 */
.dark .mode-icon {
  background: #334155;
  color: #60a5fa;
}

.dark .mode-option.recommended .mode-icon {
  background: #60a5fa;
  color: white;
}

.mode-info {
  flex: 1;
}

.mode-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

/* 暗色模式方案标题 */
.dark .mode-title {
  color: #f1f5f9;
}

.mode-description {
  color: #6c757d;
  line-height: 1.4;
  font-size: 14px;
}

/* 暗色模式方案描述 */
.dark .mode-description {
  color: #94a3b8;
}

.mode-description strong {
  color: #1976d2;
  font-weight: 600;
}

/* 暗色模式方案描述强调 */
.dark .mode-description strong {
  color: #60a5fa;
}

.mode-badge {
  position: absolute;
  top: -8px;
  right: 16px;
  background: #1976d2;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* 暗色模式推荐徽章 */
.dark .mode-badge {
  background: #60a5fa;
  color: white;
}

/* 快捷键小标样式 */
.shortcut-badge {
  position: absolute;
  bottom: -6px;
  right: -8px;
  background: #1565c0;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 4px;
  line-height: 1;
  white-space: nowrap;
  z-index: 1;
  border: 1px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* 暗色模式快捷键小标 */
.dark .shortcut-badge {
  background: #2563eb;
  border: 1px solid #1e293b;
}

/* 桌面端保持横向布局 */
@media (min-width: 769px) {
  .message-form {
    flex-direction: row;
    align-items: flex-end;
    gap: 12px;
  }
  
  .function-buttons {
    gap: 8px;
  }
  
  .input-row {
    flex: 1;
  }
  
  .image-button,
  .extend-button {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .function-buttons {
    margin-bottom: 4px;
  }
  
  .image-button,
  .extend-button {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }
  
  .send-mode-dialog {
    min-width: auto;
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .dialog-content {
    padding: 24px 20px 20px;
  }
  
  .send-mode-options {
    gap: 12px;
  }
  
  .mode-option {
    padding: 16px;
  }
  
  .mode-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .mode-option {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .mode-badge {
    top: 8px;
    right: 8px;
  }
}
</style> 