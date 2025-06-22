<template>
  <div v-if="visible" class="image-preview-overlay" @click="handleOverlayClick">
    <div class="image-preview-container" @click.stop>
      <!-- 顶部工具栏 -->
      <div class="image-preview-toolbar">
        <div class="toolbar-left">
          <span class="image-info">{{ imageTitle || '图片预览' }}</span>
        </div>
        <div class="toolbar-right">
          <button @click="zoomOut" class="toolbar-btn" title="缩小">
            <i class="fas fa-search-minus"></i>
          </button>
          <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
          <button @click="zoomIn" class="toolbar-btn" title="放大">
            <i class="fas fa-search-plus"></i>
          </button>
          <button @click="rotateLeft" class="toolbar-btn" title="向左旋转">
            <i class="fas fa-undo"></i>
          </button>
          <button @click="rotateRight" class="toolbar-btn" title="向右旋转">
            <i class="fas fa-redo"></i>
          </button>
          <button @click="resetTransform" class="toolbar-btn" title="重置">
            <i class="fas fa-sync-alt"></i>
          </button>
          <button @click="closePreview" class="toolbar-btn close-btn" title="关闭">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- 图片容器 -->
      <div class="image-preview-content" ref="imageContainer">
        <img 
          ref="imageElement"
          :src="imageUrl" 
          :alt="imageTitle || '图片预览'"
          class="preview-image"
          :style="imageStyle"
          @load="handleImageLoad"
          @error="handleImageError"
          @wheel="handleWheel"
          @mousedown="handleMouseDown"
          @dragstart="preventDefault"
        >
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div class="loading-text">加载中...</div>
        </div>

        <!-- 错误状态 -->
        <div v-if="error" class="error-overlay">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="error-text">图片加载失败</div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div v-if="showInfo" class="image-preview-info">
        <div class="info-item">
          <span class="info-label">尺寸:</span>
          <span class="info-value">{{ imageSize }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">缩放:</span>
          <span class="info-value">{{ Math.round(scale * 100) }}%</span>
        </div>
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
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageTitle: {
    type: String,
    default: ''
  },
  showInfo: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

// 状态管理
const loading = ref(true)
const error = ref(false)
const scale = ref(1)
const rotation = ref(0)
const translateX = ref(0)
const translateY = ref(0)
const imageWidth = ref(0)
const imageHeight = ref(0)

// 拖拽状态
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartTranslateX = ref(0)
const dragStartTranslateY = ref(0)

// DOM引用
const imageElement = ref(null)
const imageContainer = ref(null)

// 计算属性
const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value}) rotate(${rotation.value}deg)`,
  transformOrigin: 'center center',
  transition: isDragging.value ? 'none' : 'transform 0.3s ease'
}))

const imageSize = computed(() => {
  if (imageWidth.value && imageHeight.value) {
    return `${imageWidth.value} × ${imageHeight.value}`
  }
  return '未知'
})

// 监听可见性变化
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    resetTransform()
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.overflow = ''
  }
})

// 监听图片URL变化
watch(() => props.imageUrl, () => {
  if (props.imageUrl) {
    loading.value = true
    error.value = false
    resetTransform()
  }
})

// 图片加载完成
const handleImageLoad = () => {
  loading.value = false
  error.value = false
  
  if (imageElement.value) {
    imageWidth.value = imageElement.value.naturalWidth
    imageHeight.value = imageElement.value.naturalHeight
    
    // 自适应缩放
    nextTick(() => {
      fitToContainer()
    })
  }
}

// 图片加载错误
const handleImageError = () => {
  loading.value = false
  error.value = true
}

// 自适应容器
const fitToContainer = () => {
  if (!imageContainer.value || !imageElement.value) return
  
  const containerRect = imageContainer.value.getBoundingClientRect()
  const containerWidth = containerRect.width - 40 // 留边距
  const containerHeight = containerRect.height - 40
  
  const imageRatio = imageWidth.value / imageHeight.value
  const containerRatio = containerWidth / containerHeight
  
  let newScale = 1
  if (imageRatio > containerRatio) {
    // 图片更宽，以宽度为准
    newScale = Math.min(containerWidth / imageWidth.value, 1)
  } else {
    // 图片更高，以高度为准
    newScale = Math.min(containerHeight / imageHeight.value, 1)
  }
  
  scale.value = newScale
  translateX.value = 0
  translateY.value = 0
}

// 缩放操作
const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 5)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.1)
}

// 旋转操作
const rotateLeft = () => {
  rotation.value -= 90
}

const rotateRight = () => {
  rotation.value += 90
}

// 重置变换
const resetTransform = () => {
  scale.value = 1
  rotation.value = 0
  translateX.value = 0
  translateY.value = 0
  nextTick(() => {
    if (imageWidth.value && imageHeight.value) {
      fitToContainer()
    }
  })
}

// 滚轮缩放
const handleWheel = (e) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.min(Math.max(scale.value * delta, 0.1), 5)
  scale.value = newScale
}

// 鼠标拖拽
const handleMouseDown = (e) => {
  e.preventDefault()
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragStartTranslateX.value = translateX.value
  dragStartTranslateY.value = translateY.value
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return
  
  const deltaX = e.clientX - dragStartX.value
  const deltaY = e.clientY - dragStartY.value
  
  translateX.value = dragStartTranslateX.value + deltaX
  translateY.value = dragStartTranslateY.value + deltaY
}

const handleMouseUp = () => {
  isDragging.value = false
}

// 键盘操作
const handleKeydown = (e) => {
  switch (e.key) {
    case 'Escape':
      closePreview()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case 'r':
    case 'R':
      resetTransform()
      break
    case 'ArrowLeft':
      rotateLeft()
      break
    case 'ArrowRight':
      rotateRight()
      break
  }
}

// 关闭预览
const closePreview = () => {
  emit('close')
}

// 点击遮罩关闭
const handleOverlayClick = () => {
  closePreview()
}

// 阻止默认事件
const preventDefault = (e) => {
  e.preventDefault()
}
</script>

<style scoped>
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  z-index: 200;
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  cursor: default;
}

.image-preview-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.image-info {
  font-size: 16px;
  font-weight: 500;
}

.toolbar-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.close-btn:hover {
  background: rgba(220, 53, 69, 0.8);
}

.zoom-info {
  color: #ccc;
  font-size: 14px;
  min-width: 50px;
  text-align: center;
}

.image-preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  width: 100vw;
  cursor: move;
}

.preview-image {
  max-width: none;
  max-height: none;
  user-select: none;
  cursor: move;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

.loading-spinner {
  font-size: 32px;
  margin-bottom: 16px;
}

.loading-text,
.error-text {
  font-size: 16px;
}

.error-icon {
  font-size: 48px;
  color: #ffc107;
  margin-bottom: 16px;
}

.image-preview-info {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  flex-shrink: 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  color: #ccc;
  font-size: 14px;
}

.info-value {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .image-preview-toolbar {
    padding: 12px 16px;
  }
  
  .toolbar-btn {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .image-info {
    font-size: 14px;
  }
  
  .zoom-info {
    font-size: 12px;
    min-width: 40px;
  }
  
  .image-preview-content {
    cursor: default;
  }
  
  .preview-image {
    cursor: default;
  }
  
  .image-preview-info {
    padding: 8px 16px;
    gap: 16px;
  }
  
  .info-label,
  .info-value {
    font-size: 12px;
  }
}

/* 触摸设备优化 */
@media (pointer: coarse) {
  .toolbar-btn {
    width: 40px;
    height: 40px;
  }
}

/* 暗色模式样式 */
.dark .image-preview-overlay {
  background: rgba(0, 0, 0, 0.95);
}

.dark .image-preview-toolbar {
  background: rgba(15, 23, 42, 0.9);
}

.dark .image-info {
  color: #f1f5f9;
}

.dark .toolbar-btn {
  background: rgba(100, 116, 139, 0.3);
  color: #f1f5f9;
}

.dark .toolbar-btn:hover {
  background: rgba(100, 116, 139, 0.5);
}

.dark .close-btn:hover {
  background: rgba(239, 68, 68, 0.8);
}

.dark .zoom-info {
  color: #cbd5e1;
}

.dark .loading-overlay,
.dark .error-overlay {
  color: #f1f5f9;
}

.dark .error-icon {
  color: #f59e0b;
}

.dark .image-preview-info {
  background: rgba(15, 23, 42, 0.9);
  color: #f1f5f9;
}

.dark .info-label {
  color: #cbd5e1;
}

.dark .info-value {
  color: #f1f5f9;
}
</style> 