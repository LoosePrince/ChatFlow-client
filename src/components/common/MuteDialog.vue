<template>
  <!-- 禁言时间选择弹窗 -->
  <div v-if="visible" class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" @click="$emit('cancel')">
    <div class="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl max-w-[480px] w-[90%] max-h-[80vh] overflow-hidden animate-slide-in" @click.stop>
      <div class="px-5 pt-5 text-center">
        <h3 class="m-0 text-gray-900 dark:text-secondary-100 text-lg">禁言用户</h3>
      </div>
      <div class="p-5 text-center">
        <div class="flex items-center gap-3 mb-5 p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg">
          <img 
            :src="targetUser?.avatarUrl" 
            :alt="targetUser?.nickname"
            class="w-12 h-12 rounded-full object-cover"
          >
          <div class="flex-1">
            <div class="font-semibold text-gray-900 dark:text-secondary-100 text-base mb-1">{{ targetUser?.nickname }}</div>
            <div class="text-sm text-gray-600 dark:text-secondary-400">{{ targetUser?.uid }}</div>
          </div>
        </div>
        <div class="mute-time-selection">
          <p class="m-0 mb-3 text-gray-900 dark:text-secondary-100 font-medium">选择禁言时长：</p>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-2">
            <label 
              v-for="option in muteTimeOptions" 
              :key="option.value"
              class="flex items-center gap-2 p-2 px-3 border border-gray-200 dark:border-secondary-600 rounded-md cursor-pointer transition-all duration-200 bg-white dark:bg-secondary-700 hover:border-primary-600 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              <input 
                type="radio" 
                :value="option.value" 
                v-model="selectedTime"
                name="muteTime"
                class="m-0"
              >
              <span class="text-sm text-gray-900 dark:text-secondary-100">{{ option.label }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="px-5 pb-5 flex gap-3 justify-center">
        <button @click="$emit('cancel')" class="px-5 py-2.5 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-200 bg-gray-100 dark:bg-secondary-600 text-gray-600 dark:text-secondary-100 hover:bg-gray-200 dark:hover:bg-secondary-500 hover:text-gray-700 dark:hover:text-white">
          取消
        </button>
        <button @click="$emit('confirm', selectedTime)" class="px-5 py-2.5 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-200 bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700">
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
/* 动画效果 */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-in {
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
  animation: fade-in 0.2s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* 单选按钮选中状态样式 */
.mute-time-selection input[type="radio"]:checked + span {
  color: #1976d2;
  font-weight: 500;
}

.dark .mute-time-selection input[type="radio"]:checked + span {
  color: #60a5fa;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .mute-time-selection .grid {
    grid-template-columns: 1fr;
  }
  
  .mute-dialog {
    margin: 20px;
    width: calc(100% - 40px);
  }
}
</style> 