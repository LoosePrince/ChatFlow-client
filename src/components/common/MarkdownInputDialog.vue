<template>
  <div 
    v-if="visible" 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
    @click="$emit('cancel')"
  >
    <div 
      class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl min-w-[700px] max-w-[900px] w-[90%] max-h-[85vh] overflow-hidden animate-slide-up mx-5"
      @click.stop
    >
      <!-- 对话框头部 -->
      <div class="px-6 py-5 pb-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-br from-gray-800 to-gray-600 dark:from-gray-700 dark:to-gray-500 text-white flex justify-between items-center">
        <h3 class="m-0 text-lg font-semibold flex items-center gap-2.5">
          <i class="fab fa-markdown"></i>
          发送Markdown内容
        </h3>
        <button 
          @click="$emit('cancel')" 
          class="bg-white/20 hover:bg-white/30 text-white border-none rounded-full w-8 h-8 cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- 对话框内容 -->
      <div class="p-6 flex flex-col h-[calc(85vh-200px)]">
        <!-- 标题输入组 -->
        <div class="mb-5">
          <label class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            <i class="fas fa-heading"></i>
            标题
          </label>
          <input
            ref="titleInput"
            v-model="title"
            type="text"
            placeholder="为Markdown内容添加一个标题（可选）"
            class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg text-sm transition-all duration-300 bg-gray-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:border-gray-800 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 focus:shadow-lg focus:shadow-gray-800/10 dark:focus:shadow-blue-400/10"
            maxlength="100"
          >
          <div class="text-right text-xs text-gray-500 dark:text-slate-400 mt-1">{{ title.length }}/100</div>
        </div>
        
        <!-- 编辑器容器 -->
        <div class="flex-1 flex flex-col border-2 border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
          <!-- 编辑器标签页 -->
          <div class="flex bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <button 
              :class="[
                'flex-1 px-4 py-3 border-none bg-transparent text-gray-500 dark:text-slate-400 text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5',
                activeTab === 'edit' 
                  ? 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border-b-2 border-gray-800 dark:border-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-slate-600 hover:text-gray-700 dark:hover:text-slate-300'
              ]"
              @click="activeTab = 'edit'"
            >
              <i class="fas fa-edit"></i>
              编辑
            </button>
            <button 
              :class="[
                'flex-1 px-4 py-3 border-none bg-transparent text-gray-500 dark:text-slate-400 text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5',
                activeTab === 'preview' 
                  ? 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border-b-2 border-gray-800 dark:border-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-slate-600 hover:text-gray-700 dark:hover:text-slate-300'
              ]"
              @click="activeTab = 'preview'"
            >
              <i class="fas fa-eye"></i>
              预览
            </button>
          </div>
          
          <!-- 编辑器内容 -->
          <div class="flex-1 flex flex-col">
            <!-- 编辑模式 -->
            <div v-show="activeTab === 'edit'" class="flex-1 flex flex-col">
              <textarea
                v-model="markdownContent"
                placeholder="在这里输入Markdown内容..."
                class="flex-1 p-4 border-none outline-none font-mono text-sm leading-relaxed resize-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-gray-500 dark:placeholder-slate-400"
                @input="updatePreview"
              ></textarea>
              <div class="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
                <div class="text-xs text-gray-500 dark:text-slate-400">{{ markdownContent.length }}/5000</div>
                <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                  <i class="fas fa-info-circle"></i>
                  支持标准Markdown语法
                </div>
              </div>
            </div>
            
            <!-- 预览模式 -->
            <div v-show="activeTab === 'preview'" class="flex-1 p-4 bg-white dark:bg-slate-800 overflow-y-auto">
              <div v-if="!markdownContent.trim()" class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-slate-400 text-center">
                <i class="fas fa-file-alt text-5xl mb-4 opacity-50"></i>
                <p>请先在编辑模式下输入Markdown内容</p>
              </div>
              <div 
                v-else 
                class="markdown-preview leading-relaxed"
                v-html="previewHtml"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 对话框操作按钮 -->
      <div class="px-6 py-4 pb-5 flex gap-3 justify-end bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
        <button 
          @click="$emit('cancel')" 
          class="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-2 min-w-[100px] justify-center bg-gray-500 hover:bg-gray-600 text-white hover:-translate-y-px"
        >
          <i class="fas fa-times"></i>
          取消
        </button>
        <button 
          @click="handleSubmit" 
          :disabled="!canSubmit"
          :class="[
            'px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-2 min-w-[100px] justify-center',
            canSubmit 
              ? 'bg-gray-800 hover:bg-gray-900 text-white hover:-translate-y-px' 
              : 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed'
          ]"
        >
          <i class="fas fa-spinner fa-spin" v-if="isSubmitting"></i>
          <i class="fas fa-paper-plane" v-else></i>
          {{ isSubmitting ? '发送中...' : '发送内容' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cancel', 'submit'])

// 状态管理
const title = ref('')
const markdownContent = ref('')
const activeTab = ref('edit')
const previewHtml = ref('')
const isSubmitting = ref(false)
const titleInput = ref(null)

// 计算属性
const canSubmit = computed(() => {
  return markdownContent.value.trim().length > 0 && !isSubmitting.value
})

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true,
  sanitize: false // 注意：在生产环境中应该使用DOMPurify等库进行sanitize
})

// 更新预览
const updatePreview = () => {
  if (markdownContent.value.trim()) {
    try {
      previewHtml.value = marked(markdownContent.value)
    } catch (error) {
      console.error('Markdown解析错误:', error)
      previewHtml.value = '<p style="color: red;">Markdown解析错误</p>'
    }
  } else {
    previewHtml.value = ''
  }
}

// 处理提交
const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  isSubmitting.value = true
  
  try {
    await emit('submit', {
      title: title.value.trim(),
      markdownContent: markdownContent.value.trim()
    })
    
    // 重置表单
    title.value = ''
    markdownContent.value = ''
    previewHtml.value = ''
    activeTab.value = 'edit'
  } catch (error) {
    console.error('发送Markdown内容失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 监听显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    nextTick(() => {
      titleInput.value?.focus()
    })
  } else {
    // 关闭时重置状态
    title.value = ''
    markdownContent.value = ''
    previewHtml.value = ''
    activeTab.value = 'edit'
    isSubmitting.value = false
  }
})

// 监听内容变化，自动更新预览
watch(() => markdownContent.value, () => {
  updatePreview()
})
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
  animation: fade-in 0.3s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* Markdown预览样式 */
.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  margin: 1em 0 0.5em 0;
  color: #2c3e50;
}

.markdown-preview :deep(h1) {
  font-size: 1.8em;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.3em;
}

.markdown-preview :deep(p) {
  margin: 0.8em 0;
}

.markdown-preview :deep(code) {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}

.markdown-preview :deep(pre) {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  border-left: 4px solid #333;
}

.markdown-preview :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #e9ecef;
  padding-left: 16px;
  margin: 16px 0;
  color: #6c757d;
  font-style: italic;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  padding-left: 2em;
}

.markdown-preview :deep(li) {
  margin: 0.5em 0;
}

.markdown-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid #e9ecef;
  padding: 8px 12px;
  text-align: left;
}

.markdown-preview :deep(th) {
  background: #f8f9fa;
  font-weight: 600;
}

/* 暗色模式Markdown预览样式 */
.dark .markdown-preview :deep(h1),
.dark .markdown-preview :deep(h2),
.dark .markdown-preview :deep(h3),
.dark .markdown-preview :deep(h4),
.dark .markdown-preview :deep(h5),
.dark .markdown-preview :deep(h6) {
  color: #f1f5f9;
}

.dark .markdown-preview :deep(h1) {
  border-bottom: 2px solid #475569;
}

.dark .markdown-preview :deep(h2) {
  border-bottom: 1px solid #475569;
}

.dark .markdown-preview :deep(p) {
  color: #e2e8f0;
}

.dark .markdown-preview :deep(code) {
  background: #0f172a;
  color: #f472b6;
}

.dark .markdown-preview :deep(pre) {
  background: #0f172a;
  border-left: 4px solid #94a3b8;
}

.dark .markdown-preview :deep(blockquote) {
  border-left: 4px solid #475569;
  color: #94a3b8;
}

.dark .markdown-preview :deep(th),
.dark .markdown-preview :deep(td) {
  border: 1px solid #475569;
  color: #f1f5f9;
}

.dark .markdown-preview :deep(th) {
  background: #334155;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .min-w-\[700px\] {
    margin: 10px;
    width: calc(100% - 20px);
    min-width: auto;
    max-height: 95vh;
  }
  
  .px-6 {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .py-5 {
    padding-top: 16px;
    padding-bottom: 16px;
  }
  
  .pb-4 {
    padding-bottom: 16px;
  }
  
  .p-6 {
    padding: 16px 20px;
  }
  
  .pb-5 {
    padding-bottom: 20px;
  }
  
  .h-\[calc\(85vh-200px\)\] {
    height: calc(95vh - 180px);
  }
  
  .flex.gap-3.justify-end {
    flex-direction: column;
    gap: 8px;
  }
  
  .min-w-\[100px\] {
    width: 100%;
  }
  
  .text-sm {
    font-size: 16px; /* 防止iOS缩放 */
  }
}
</style> 