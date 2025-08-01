<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" @click="$emit('cancel')">
    <div class="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl min-w-[500px] max-w-2xl w-[90%] max-h-[80vh] overflow-hidden animate-dialog-fade-in" @click.stop>
      <div class="flex justify-between items-center p-5 pb-4 border-b border-gray-200 dark:border-secondary-600 bg-gradient-to-br from-pink-400 to-pink-500 dark:from-pink-500 dark:to-pink-600 text-white">
        <h3 class="text-lg font-semibold m-0 flex items-center gap-2.5">
          <i class="fab fa-bilibili"></i>
          发送B站视频
        </h3>
        <button @click="$emit('cancel')" class="bg-white/20 hover:bg-white/30 text-white border-none rounded-full w-8 h-8 cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="p-6 max-h-[60vh] overflow-y-auto">
        <div class="mb-5">
          <label class="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
            <i class="fas fa-video"></i>
            BV号 <span class="text-red-500">*</span>
          </label>
          <input
            ref="bvInput"
            v-model="bvId"
            type="text"
            placeholder="请输入B站视频BV号，如：BV1234567890"
            class="w-full px-4 py-3 border-2 border-gray-200 dark:border-secondary-600 rounded-lg text-sm transition-all duration-300 bg-gray-50 dark:bg-secondary-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-pink-400 dark:focus:border-pink-500 focus:bg-white dark:focus:bg-secondary-800 focus:ring-3 focus:ring-pink-100 dark:focus:ring-pink-900/20"
            @input="validateBvId"
            @keyup.enter="handleSubmit"
          >
          <div v-if="bvError" class="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
            <i class="fas fa-exclamation-circle"></i>
            {{ bvError }}
          </div>
          <div v-if="isValidBv && bvId" class="flex items-center gap-1.5 text-green-600 text-xs mt-1.5">
            <i class="fas fa-check-circle"></i>
            BV号格式正确
          </div>
        </div>
        
        <!-- 预览区域 -->
        <div v-if="isValidBv && bvId" class="mt-6 pt-5 border-t border-gray-200 dark:border-secondary-600">
          <div class="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            <i class="fas fa-eye"></i>
            预览
          </div>
          <div class="border-2 border-gray-200 dark:border-secondary-600 rounded-lg overflow-hidden aspect-video">
            <iframe 
              :src="`//player.bilibili.com/player.html?bvid=${bvId}&autoplay=0&muted=1`"
              class="w-full h-full border-none block"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
      
      <div class="flex gap-3 justify-end p-4 pb-5 bg-gray-50 dark:bg-secondary-900 border-t border-gray-200 dark:border-secondary-600">
        <button @click="$emit('cancel')" class="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-2 min-w-[100px] justify-center bg-gray-500 hover:bg-gray-600 text-white hover:-translate-y-px">
          <i class="fas fa-times"></i>
          取消
        </button>
        <button 
          @click="handleSubmit" 
          :disabled="!canSubmit"
          class="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-2 min-w-[100px] justify-center bg-pink-500 hover:bg-pink-600 dark:bg-pink-500 dark:hover:bg-pink-600 text-white hover:-translate-y-px disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
          :class="{ 'bg-gray-500 dark:bg-gray-600': isSubmitting }"
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
/* 自定义动画 */
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

.animate-dialog-fade-in {
  animation: dialogFadeIn 0.3s ease-out;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .min-w-\[500px\] {
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