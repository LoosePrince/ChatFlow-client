<template>
  <div class="w-full">
    <!-- 回复预览样式 -->
    <div v-if="replyState.isReplying" class="bg-gray-50 dark:bg-secondary-800 border border-gray-200 dark:border-secondary-600 rounded-lg p-3 mb-3 flex items-start gap-3 relative">
      <div class="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-semibold min-w-0">
        <i class="fas fa-reply text-primary-600 dark:text-primary-400"></i>
        <span>回复 {{ replyState.targetMessage?.userName }}</span>
      </div>
      <div class="flex-1 text-sm text-gray-600 dark:text-secondary-400 leading-tight mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
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
      <button @click="cancelReply" class="bg-transparent border-none text-gray-500 dark:text-secondary-400 cursor-pointer p-1 rounded flex items-center justify-center w-6 h-6 flex-shrink-0 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-secondary-600 hover:text-red-500 dark:hover:text-red-400">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-3">
      <!-- 功能按钮行 -->
      <div class="flex gap-2 justify-start">
        <!-- 图片选择按钮 -->
        <button 
          type="button" 
          @click="$emit('selectImage')" 
          :disabled="!canSendMessage"
          class="w-9 h-9 lg:w-10 lg:h-10 bg-gray-50 dark:bg-secondary-800 text-gray-600 dark:text-secondary-400 border border-gray-300 dark:border-secondary-600 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 flex-shrink-0 text-sm lg:text-base hover:bg-gray-100 dark:hover:bg-secondary-700 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-600 dark:hover:border-primary-400 hover:scale-105 disabled:bg-gray-50 dark:disabled:bg-secondary-800 disabled:text-gray-300 dark:disabled:text-secondary-600 disabled:border-gray-200 dark:disabled:border-secondary-600 disabled:cursor-not-allowed disabled:transform-none"
          title="发送图片"
        >
          <i class="fas fa-image"></i>
        </button>
        
        <!-- 扩展消息类型按钮 -->
        <button 
          type="button" 
          @click="$emit('showMessageTypeSelector')" 
          :disabled="!canSendMessage"
          class="w-9 h-9 lg:w-10 lg:h-10 bg-indigo-500 dark:bg-blue-600 text-white border border-indigo-500 dark:border-blue-600 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 flex-shrink-0 text-sm lg:text-base hover:bg-indigo-600 dark:hover:bg-blue-700 hover:border-indigo-600 dark:hover:border-blue-700 hover:scale-105 disabled:bg-gray-300 dark:disabled:bg-secondary-600 disabled:text-gray-500 dark:disabled:text-secondary-500 disabled:border-gray-300 dark:disabled:border-secondary-600 disabled:cursor-not-allowed disabled:transform-none"
          title="更多消息类型"
        >
          <i class="fas fa-plus"></i>
        </button>
      </div>
      
      <!-- 输入行 -->
      <div class="flex gap-3 items-end flex-1">
        <textarea
          ref="messageInput"
          v-model="messageValue"
          :placeholder="placeholderText"
          :disabled="!canSendMessage"
          class="flex-1 px-4 py-3 border border-gray-300 dark:border-secondary-600 rounded-xl outline-none text-sm leading-5 resize-none font-inherit transition-all duration-300 min-h-11 max-h-36 overflow-y-auto bg-white dark:bg-secondary-800 text-gray-900 dark:text-secondary-100 placeholder-gray-500 dark:placeholder-secondary-400 focus:border-primary-600 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 disabled:bg-gray-50 dark:disabled:bg-secondary-800 disabled:text-gray-500 dark:disabled:text-secondary-500 disabled:cursor-not-allowed scrollbar-hide"
          :maxlength="maxLength"
          rows="1"
          @keydown="handleKeyDown"
          @paste="$emit('paste', $event)"
          @input="adjustHeight"
        ></textarea>
        <button 
          type="submit" 
          :disabled="!canSendMessage" 
          class="w-12 h-12 bg-primary-600 dark:bg-primary-500 text-white border-none rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 flex-shrink-0 relative hover:bg-primary-700 dark:hover:bg-primary-600 hover:scale-105 disabled:bg-gray-300 dark:disabled:bg-secondary-600 disabled:cursor-not-allowed disabled:transform-none"
          :class="{ 'opacity-50': !messageValue.trim() && canSendMessage }"
          :title="sendButtonTitle"
          @mousedown="handleMouseDown"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseLeave"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <i class="fas fa-paper-plane"></i>
          <!-- 快捷键小标 -->
          <span v-if="sendMode" class="absolute -bottom-1.5 -right-2 bg-primary-700 dark:bg-primary-600 text-white text-xs font-semibold px-1 py-0.5 rounded leading-none whitespace-nowrap z-10 border border-white dark:border-secondary-800 shadow-sm">
            {{ sendMode === 1 ? 'Shift + ↵' : '↵' }}
          </span>
        </button>
      </div>
    </form>
  </div>

  <!-- 发送方案选择对话框 -->
  <div v-if="showSendModeDialog" class="fixed inset-0 flex items-center justify-center z-50" @click="closeSendModeDialog">
    <div class="bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl min-w-[500px] max-w-[600px] w-[90%] max-h-[80vh] overflow-hidden animate-fade-in" @click.stop>
      <div class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 text-center">
        <h3 class="m-0 text-xl font-semibold flex items-center justify-center gap-3">
          <i class="fas fa-keyboard"></i>
          选择发送方案
        </h3>
      </div>
      
      <div class="p-8 pt-8 pb-6">
        <p class="text-center text-gray-600 dark:text-secondary-400 mb-6 leading-relaxed">
          请选择您喜欢的发送消息方式，选择后将记住您的偏好：
        </p>
        
        <div class="flex flex-col gap-4">
          <div 
            :class="[
              'flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 relative hover:-translate-y-0.5 hover:shadow-lg',
              currentSendMode === 1 
                ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30' 
                : 'border-gray-200 dark:border-secondary-600 hover:border-primary-600 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            ]"
            @click="selectSendMode(1)"
          >
            <div :class="[
              'w-12 h-12 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0',
              currentSendMode === 1 
                ? 'bg-primary-600 dark:bg-primary-400 text-white' 
                : 'bg-gray-100 dark:bg-secondary-700 text-primary-600 dark:text-primary-400'
            ]">
              <i class="fas fa-level-up-alt"></i>
            </div>
            <div class="flex-1">
              <div class="text-base font-semibold text-gray-900 dark:text-secondary-100 mb-2">方案一（推荐）</div>
              <div class="text-gray-600 dark:text-secondary-400 leading-relaxed text-sm">
                <strong class="text-primary-600 dark:text-primary-400 font-semibold">Shift + Enter</strong> 发送消息<br>
                <strong class="text-primary-600 dark:text-primary-400 font-semibold">Enter</strong> 换行
              </div>
            </div>
            <div class="absolute -top-2 right-4 bg-primary-600 dark:bg-primary-400 text-white px-3 py-1 rounded-xl text-xs font-semibold">
              <span>推荐</span>
            </div>
          </div>
          
          <div 
            :class="[
              'flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 relative hover:-translate-y-0.5 hover:shadow-lg',
              currentSendMode === 2 
                ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30' 
                : 'border-gray-200 dark:border-secondary-600 hover:border-primary-600 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            ]"
            @click="selectSendMode(2)"
          >
            <div :class="[
              'w-12 h-12 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0',
              currentSendMode === 2 
                ? 'bg-primary-600 dark:bg-primary-400 text-white' 
                : 'bg-gray-100 dark:bg-secondary-700 text-primary-600 dark:text-primary-400'
            ]">
              <i class="fas fa-paper-plane"></i>
            </div>
            <div class="flex-1">
              <div class="text-base font-semibold text-gray-900 dark:text-secondary-100 mb-2">方案二</div>
              <div class="text-gray-600 dark:text-secondary-400 leading-relaxed text-sm">
                <strong class="text-primary-600 dark:text-primary-400 font-semibold">Enter</strong> 发送消息<br>
                <strong class="text-primary-600 dark:text-primary-400 font-semibold">Shift + Enter</strong> 换行
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部提醒 -->
      <div class="px-6 pb-6 pt-4 border-t border-gray-200 dark:border-secondary-600 bg-gray-50 dark:bg-secondary-800">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-secondary-400 text-center justify-center">
          <i class="fas fa-lightbulb text-yellow-500 dark:text-yellow-400"></i>
          <span>提示：选择后可通过长按发送按钮重新修改发送方案</span>
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

// 当前选中的发送模式（如果没有选择则默认为1）
const currentSendMode = computed(() => {
  return sendMode.value || 1
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
  // 即使没有文字也可以长按打开发送模式选择
  startLongPress()
}

const handleMouseUp = (event) => {
  cancelLongPress()
  // 如果不是长按，执行正常提交（只有在有文字且可以发送时才提交）
  if (!isLongPressing.value && messageValue.value.trim() && props.canSendMessage) {
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
  // 即使没有文字也可以长按打开发送模式选择
  startLongPress()
}

const handleTouchEnd = (event) => {
  cancelLongPress()
  // 如果不是长按，执行正常提交（只有在有文字且可以发送时才提交）
  if (!isLongPressing.value && messageValue.value.trim() && props.canSendMessage) {
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
/* 自定义滚动条隐藏 */
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.scrollbar-hide::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-hide::-webkit-scrollbar-thumb {
  background: transparent;
}

.scrollbar-hide::-webkit-scrollbar-thumb:hover {
  background: transparent;
}

/* 对话框动画 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* 移动端适配 */
@media (max-width: 768px) {
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