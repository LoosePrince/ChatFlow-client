<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div class="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl min-w-[480px] max-w-[90%] overflow-hidden animate-compression-dialog-fade-in">
      <div class="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white p-4 flex items-center gap-2.5 font-semibold">
        <i class="fas fa-compress-alt text-lg"></i>
        <span>图片压缩确认</span>
      </div>
      
      <div class="p-6">
        <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg mb-5">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
            <i class="fas fa-image"></i>
          </div>
          <div class="flex-1">
            <div class="font-semibold text-gray-800 dark:text-gray-100 mb-1 break-all">{{ fileName }}</div>
            <div class="text-gray-500 dark:text-gray-400 text-sm">{{ fileSizeInMB }}MB</div>
          </div>
        </div>
        
        <div class="mb-5 leading-relaxed">
          <p class="m-0 mb-2 text-gray-700 dark:text-gray-300">图片大小超过了1MB限制，需要压缩后才能发送。</p>
          <p class="m-0 text-gray-700 dark:text-gray-300">压缩后图片质量可能会有所降低，但仍能保持较好的视觉效果。</p>
        </div>
        
        <div class="mb-5">
          <div class="flex items-center gap-2.5 mb-2 text-sm text-gray-700 dark:text-gray-300">
            <i class="fas fa-check-circle text-green-500"></i>
            <span>自动调整分辨率至1920x1080以内</span>
          </div>
          <div class="flex items-center gap-2.5 mb-2 text-sm text-gray-700 dark:text-gray-300">
            <i class="fas fa-check-circle text-green-500"></i>
            <span>智能压缩质量以控制文件大小</span>
          </div>
          <div class="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
            <i class="fas fa-check-circle text-green-500"></i>
            <span>保持图片原始格式和比例</span>
          </div>
        </div>
      </div>
      
      <div class="flex gap-3 p-4 bg-gray-50 dark:bg-secondary-700 justify-end">
        <button class="px-5 py-2.5 border-none rounded-md font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 bg-gray-500 hover:bg-gray-600 text-white hover:-translate-y-px" @click="handleCancel">
          <i class="fas fa-times"></i>
          取消发送
        </button>
        <button class="px-5 py-2.5 border-none rounded-md font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-500/30" @click="handleConfirm">
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
/* 自定义动画 */
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

.animate-compression-dialog-fade-in {
  animation: dialogFadeIn 0.3s ease-out;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .min-w-\[480px\] {
    min-width: auto;
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .p-6 {
    padding: 20px;
  }
  
  .p-4 {
    padding: 16px 20px;
  }
  
  .flex.gap-3 {
    flex-direction: column;
    gap: 8px;
  }
  
  .px-5 {
    width: 100%;
    justify-content: center;
  }
}
</style> 