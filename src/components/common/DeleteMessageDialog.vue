<template>
  <!-- 删除消息确认弹窗 -->
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="$emit('cancel')">
    <div class="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl min-w-[400px] max-w-lg w-[90%] max-h-[80vh] overflow-hidden animate-delete-dialog-fade-in" @click.stop>
      <div class="p-5 pb-4 border-b border-gray-200 dark:border-secondary-600 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white">
        <h3 class="text-lg font-semibold m-0 flex items-center gap-2.5">
          <i class="fas fa-exclamation-triangle text-xl"></i>
          确认删除消息
        </h3>
      </div>
      
      <div class="p-6">
        <div class="bg-gray-50 dark:bg-secondary-700 rounded-lg p-4 mb-4 border-l-4 border-red-500 dark:border-red-400 relative overflow-hidden transition-all duration-300" :class="{ 'opacity-70 scale-98 bg-red-50 dark:bg-red-900/20 border-l-red-400 dark:border-l-red-300': isPreviewDeleting }">
          <div class="flex items-center gap-3 mb-3">
            <img 
              :src="messageAvatarUrl" 
              :alt="targetMessage?.userName"
              class="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
            >
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-tight">{{ targetMessage?.userName }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 leading-tight">{{ formatTime(targetMessage?.timestamp) }}</div>
            </div>
          </div>
          <div class="bg-white dark:bg-secondary-800 p-3 rounded-lg border border-gray-200 dark:border-secondary-600 text-gray-800 dark:text-gray-100 leading-relaxed text-sm break-words max-h-24 overflow-y-auto">
            <!-- BV视频消息 -->
            <span v-if="targetMessage?.type === 'bilibili'" class="flex items-center gap-2">
              <i class="fab fa-bilibili text-pink-500 text-base"></i>
              <span class="font-mono bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 px-2 py-1 rounded text-xs">{{ targetMessage?.bilibiliId || 'BV视频' }}</span>
            </span>
            <!-- 文件消息 -->
            <span v-else-if="targetMessage?.type === 'file'" class="flex items-center gap-2">
              <i class="fas fa-file text-green-500 text-base"></i>
              <span>{{ targetMessage?.fileName || '文件' }}</span>
            </span>
            <!-- MD文档消息 -->
            <span v-else-if="targetMessage?.type === 'markdown'" class="flex items-center gap-2">
              <i class="fab fa-markdown text-blue-500 text-base"></i>
              <span>{{ targetMessage?.fileName || 'MD文档' }}</span>
            </span>
            <!-- 图片消息 -->
            <span v-else-if="targetMessage?.type === 'image'" class="flex items-center gap-2">
              <i class="fas fa-image text-purple-500 text-base"></i>
              <span>图片消息</span>
            </span>
            <!-- 普通文本消息 -->
            <span v-else>{{ targetMessage?.text }}</span>
          </div>
          
          <!-- 删除预览效果 -->
          <div v-if="isPreviewDeleting" class="absolute inset-0 bg-red-500/90 flex items-center justify-center animate-delete-preview-fade-in">
            <div class="flex flex-col items-center gap-2 text-white text-sm font-medium">
              <i class="fas fa-trash-alt text-2xl animate-delete-icon-pulse"></i>
              <span>正在删除...</span>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2.5 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm border border-yellow-200 dark:border-yellow-800">
          <i class="fas fa-info-circle text-yellow-500 dark:text-yellow-400 text-base"></i>
          删除后此消息将被物理删除，无法恢复，所有用户将无法查看
        </div>
      </div>
      
      <div class="flex gap-3 justify-end p-4 pb-5 bg-gray-50 dark:bg-secondary-900 border-t border-gray-200 dark:border-secondary-600">
        <button @click="$emit('cancel')" class="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-2 min-w-[100px] justify-center bg-gray-500 hover:bg-gray-600 text-white hover:-translate-y-px">
          <i class="fas fa-times"></i>
          取消
        </button>
        <button @click="handleConfirm" class="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-2 min-w-[100px] justify-center bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white hover:-translate-y-px disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none" :disabled="isPreviewDeleting">
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
/* 自定义动画 */
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

.animate-delete-dialog-fade-in {
  animation: deleteDialogFadeIn 0.2s ease-out;
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

.animate-delete-preview-fade-in {
  animation: deletePreviewFadeIn 0.3s ease-in;
}

@keyframes deleteIconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.animate-delete-icon-pulse {
  animation: deleteIconPulse 1s infinite;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .min-w-\[400px\] {
    min-width: auto;
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .p-6 {
    padding: 16px 20px;
  }
  
  .p-4 {
    padding: 16px 20px;
  }
  
  .flex.gap-3 {
    flex-direction: column;
    gap: 8px;
  }
  
  .min-w-\[100px\] {
    width: 100%;
  }
}
</style> 