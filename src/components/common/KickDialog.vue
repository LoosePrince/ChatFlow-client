<template>
  <!-- 踢人确认弹窗 -->
  <div 
    v-if="visible" 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
    @click="$emit('cancel')"
  >
    <div 
      class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-[90%] max-h-[80vh] overflow-hidden animate-slide-up mx-5"
      @click.stop
    >
      <!-- 对话框头部 -->
      <div class="px-5 pt-5 text-center">
        <h3 class="text-lg font-medium text-slate-700 dark:text-slate-200 m-0">
          移出用户
        </h3>
      </div>

      <!-- 对话框内容 -->
      <div class="p-5">
        <!-- 用户信息 -->
        <div class="flex items-center gap-3 mb-5 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <img 
            :src="targetUser?.avatarUrl" 
            :alt="targetUser?.nickname"
            class="w-12 h-12 rounded-full object-cover"
          >
          <div class="flex-1">
            <div class="font-semibold text-slate-700 dark:text-slate-200 text-base mb-1">
              {{ targetUser?.nickname }}
            </div>
            <div class="text-sm text-slate-500 dark:text-slate-400">
              {{ targetUser?.uid }}
            </div>
          </div>
        </div>

        <!-- 警告信息 -->
        <div class="flex gap-3 items-start warning-container">
          <div class="text-amber-500 dark:text-amber-400 text-2xl flex-shrink-0 mt-0.5 warning-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="flex-1">
            <p class="text-slate-700 dark:text-slate-200 text-sm mb-2">
              确定要移出此用户吗？
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-0">
              被移出的用户将离开聊天室，但可以重新加入。
            </p>
          </div>
        </div>
      </div>

      <!-- 对话框操作按钮 -->
      <div class="px-5 pb-5 flex gap-3 justify-center">
        <button 
          @click="$emit('cancel')" 
          class="px-5 py-2.5 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-200 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200"
        >
          取消
        </button>
        <button 
          @click="$emit('confirm')" 
          class="px-5 py-2.5 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-200 bg-red-500 hover:bg-red-600 text-white"
        >
          确认移出
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  targetUser: {
    type: Object,
    default: null
  }
})

defineEmits(['cancel', 'confirm'])
</script>

<style scoped>
/* 自定义动画 */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
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

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .warning-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .warning-icon {
    align-self: center;
  }
}
</style> 