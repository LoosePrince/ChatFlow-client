<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" @click="$emit('close')">
    <div class="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl min-w-[400px] max-w-[500px] w-[90%] max-h-[80vh] overflow-hidden animate-fade-in" @click.stop>
      <div class="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-blue-500 dark:to-indigo-600 text-white px-6 py-5 pb-4 border-b border-gray-200 dark:border-secondary-600 flex justify-between items-center">
        <h3 class="m-0 text-lg font-semibold flex items-center gap-2.5">
          <i class="fas fa-plus-circle"></i>
          选择消息类型
        </h3>
        <button @click="$emit('close')" class="bg-white/20 hover:bg-white/30 text-white border-none rounded-full w-8 h-8 cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="p-6">
        <div class="flex flex-col gap-3">
          <div 
            class="flex items-center p-4 px-5 border-2 border-gray-200 dark:border-secondary-600 rounded-xl cursor-pointer transition-all duration-300 bg-gray-50 dark:bg-secondary-700 hover:border-indigo-500 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-secondary-800 hover:-translate-y-0.5 hover:shadow-lg"
            @click="selectType('bilibili')"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white mr-4 bg-gradient-to-br from-pink-500 to-pink-600">
              <i class="fab fa-bilibili"></i>
            </div>
            <div class="flex-1">
              <div class="text-base font-semibold text-gray-900 dark:text-secondary-100 mb-1">B站视频</div>
              <div class="text-sm text-gray-600 dark:text-secondary-400 leading-relaxed">分享B站视频，输入BV号</div>
            </div>
            <div class="text-gray-500 dark:text-secondary-400 text-sm transition-all duration-200 group-hover:text-indigo-500 dark:group-hover:text-blue-500 group-hover:translate-x-1">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
          
          <div 
            class="flex items-center p-4 px-5 border-2 border-gray-200 dark:border-secondary-600 rounded-xl cursor-pointer transition-all duration-300 bg-gray-50 dark:bg-secondary-700 hover:border-indigo-500 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-secondary-800 hover:-translate-y-0.5 hover:shadow-lg"
            @click="selectType('markdown')"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white mr-4 bg-gradient-to-br from-gray-700 to-gray-600">
              <i class="fab fa-markdown"></i>
            </div>
            <div class="flex-1">
              <div class="text-base font-semibold text-gray-900 dark:text-secondary-100 mb-1">Markdown</div>
              <div class="text-sm text-gray-600 dark:text-secondary-400 leading-relaxed">发送格式化的Markdown内容</div>
            </div>
            <div class="text-gray-500 dark:text-secondary-400 text-sm transition-all duration-200 group-hover:text-indigo-500 dark:group-hover:text-blue-500 group-hover:translate-x-1">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
          
          <div 
            class="flex items-center p-4 px-5 border-2 border-gray-200 dark:border-secondary-600 rounded-xl cursor-pointer transition-all duration-300 bg-gray-50 dark:bg-secondary-700 hover:border-indigo-500 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-secondary-800 hover:-translate-y-0.5 hover:shadow-lg"
            @click="selectType('file')"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white mr-4 bg-gradient-to-br from-green-500 to-teal-500">
              <i class="fas fa-file-upload"></i>
            </div>
            <div class="flex-1">
              <div class="text-base font-semibold text-gray-900 dark:text-secondary-100 mb-1">文件</div>
              <div class="text-sm text-gray-600 dark:text-secondary-400 leading-relaxed">发送文件，最大2MB，保存30分钟（图片自动转为图片消息）</div>
            </div>
            <div class="text-gray-500 dark:text-secondary-400 text-sm transition-all duration-200 group-hover:text-indigo-500 dark:group-hover:text-blue-500 group-hover:translate-x-1">
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