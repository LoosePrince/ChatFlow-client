<template>
  <div v-if="visible" class="markdown-input-overlay" @click="$emit('cancel')">
    <div class="markdown-input-dialog" @click.stop>
      <div class="dialog-header">
        <h3>
          <i class="fab fa-markdown"></i>
          发送Markdown内容
        </h3>
        <button @click="$emit('cancel')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="dialog-content">
        <div class="input-group">
          <label class="input-label">
            <i class="fas fa-heading"></i>
            标题
          </label>
          <input
            ref="titleInput"
            v-model="title"
            type="text"
            placeholder="为Markdown内容添加一个标题（可选）"
            class="title-input"
            maxlength="100"
          >
          <div class="char-count">{{ title.length }}/100</div>
        </div>
        
        <div class="editor-container">
          <div class="editor-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'edit' }]"
              @click="activeTab = 'edit'"
            >
              <i class="fas fa-edit"></i>
              编辑
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'preview' }]"
              @click="activeTab = 'preview'"
            >
              <i class="fas fa-eye"></i>
              预览
            </button>
          </div>
          
          <div class="editor-content">
            <!-- 编辑模式 -->
            <div v-show="activeTab === 'edit'" class="edit-panel">
              <textarea
                v-model="markdownContent"
                placeholder="在这里输入Markdown内容..."
                class="markdown-textarea"
                @input="updatePreview"
              ></textarea>
              <div class="editor-footer">
                <div class="char-count">{{ markdownContent.length }}/5000</div>
                <div class="markdown-tips">
                  <i class="fas fa-info-circle"></i>
                  支持标准Markdown语法
                </div>
              </div>
            </div>
            
            <!-- 预览模式 -->
            <div v-show="activeTab === 'preview'" class="preview-panel">
              <div v-if="!markdownContent.trim()" class="empty-preview">
                <i class="fas fa-file-alt"></i>
                <p>请先在编辑模式下输入Markdown内容</p>
              </div>
              <div 
                v-else 
                class="markdown-preview"
                v-html="previewHtml"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button @click="$emit('cancel')" class="cancel-btn">
          <i class="fas fa-times"></i>
          取消
        </button>
        <button 
          @click="handleSubmit" 
          :disabled="!canSubmit"
          class="submit-btn"
          :class="{ 'loading': isSubmitting }"
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
.markdown-input-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 150;
  backdrop-filter: blur(3px);
}

.markdown-input-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  min-width: 700px;
  max-width: 900px;
  width: 90%;
  max-height: 85vh;
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
  background: linear-gradient(135deg, #333 0%, #555 100%);
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
  display: flex;
  flex-direction: column;
  height: calc(85vh - 200px);
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.title-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px !important;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.title-input:focus {
  outline: none;
  border-color: #333;
  background: white;
  box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.1);
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab-btn.active {
  background: white;
  color: #333;
  border-bottom: 2px solid #333;
}

.tab-btn:hover {
  background: rgba(51, 51, 51, 0.05);
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.edit-panel,
.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.markdown-textarea {
  flex: 1;
  padding: 16px;
  border: none;
  outline: none;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: white;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.markdown-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6c757d;
}

.preview-panel {
  padding: 16px;
  background: white;
  overflow-y: auto;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  text-align: center;
}

.empty-preview i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.markdown-preview {
  line-height: 1.6;
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

.dialog-actions {
  padding: 16px 24px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  justify-content: center;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.submit-btn {
  background: #333;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #222;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.submit-btn.loading {
  background: #6c757d;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .markdown-input-dialog {
    margin: 10px;
    width: calc(100% - 20px);
    min-width: auto;
    max-height: 95vh;
  }
  
  .dialog-header,
  .dialog-content,
  .dialog-actions {
    padding: 16px 20px;
  }
  
  .dialog-content {
    height: calc(95vh - 180px);
  }
  
  .dialog-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
  
  .markdown-textarea {
    font-size: 16px; /* 防止iOS缩放 */
  }
}

/* 暗色模式样式 */
.dark .markdown-input-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark .markdown-input-dialog {
  background: #1e293b;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
}

.dark .dialog-header {
  background: linear-gradient(135deg, #333 0%, #444 100%);
  border-bottom: 1px solid #475569;
}

.dark .close-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.dark .close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dark .dialog-content {
  background: #1e293b;
}

.dark .input-label {
  color: #f1f5f9;
}

.dark .title-input,
.dark .markdown-textarea {
  background: #334155;
  border: 2px solid #475569;
  color: #f1f5f9;
}

.dark .title-input::placeholder,
.dark .markdown-textarea::placeholder {
  color: #94a3b8;
}

.dark .title-input:focus {
  background: #1e293b;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.dark .markdown-textarea:focus {
  background: #1e293b;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.dark .char-count {
  color: #94a3b8;
}

.dark .editor-container {
  border: 2px solid #475569;
}

.dark .editor-tabs {
  background: #334155;
  border-bottom: 1px solid #475569;
}

.dark .tab-btn {
  background: transparent;
  color: #94a3b8;
}

.dark .tab-btn.active {
  background: #1e293b;
  color: #f1f5f9;
  border-bottom: 2px solid #60a5fa;
}

.dark .tab-btn:hover {
  background: rgba(96, 165, 250, 0.1);
  color: #f1f5f9;
}

.dark .editor-footer {
  background: #334155;
  border-top: 1px solid #475569;
}

.dark .markdown-tips {
  color: #94a3b8;
}

.dark .preview-panel {
  background: #1e293b;
}

.dark .empty-preview {
  color: #94a3b8;
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

.dark .dialog-actions {
  background: #0f172a;
  border-top: 1px solid #475569;
}

.dark .cancel-btn {
  background: #64748b;
}

.dark .cancel-btn:hover {
  background: #475569;
}

.dark .submit-btn {
  background: #333;
}

.dark .submit-btn:hover:not(:disabled) {
  background: #222;
}

.dark .submit-btn:disabled,
.dark .submit-btn.loading {
  background: #64748b;
}
</style> 