<template>
  <div v-if="visible" class="fixed inset-0 bg-black/90 flex flex-col z-50 backdrop-blur-sm cursor-pointer" @click="handleOverlayClick">
    <div class="flex flex-col h-screen cursor-default" @click.stop>
      <!-- 顶部工具栏 -->
      <div class="flex flex-wrap justify-between items-center p-4 bg-black/70 text-white flex-shrink-0">
        <div class="flex items-center">
          <span class="text-base font-medium">{{ imageTitle || '图片预览' }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button @click="zoomOut" class="toolbar-btn" title="缩小">
            <i class="fas fa-search-minus"></i>
          </button>
          <span class="text-gray-300 text-sm min-w-[50px] text-center">{{ Math.round(scale * 100) }}%</span>
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
      <div class="flex-1 flex items-center justify-center relative overflow-hidden w-screen cursor-move" ref="imageContainer">
        <img 
          ref="imageElement"
          :src="imageUrl" 
          :alt="imageTitle || '图片预览'"
          class="preview-image max-w-none max-h-none select-none cursor-move"
          :style="imageStyle"
          @load="handleImageLoad"
          @error="handleImageError"
          @wheel="handleWheel"
          @mousedown="handleMouseDown"
          @touchstart="handleTouchStart"
          @dragstart="preventDefault"
        >
        
        <!-- 加载状态 -->
        <div v-if="loading" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <div class="text-3xl mb-4">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div class="text-base">加载中...</div>
        </div>

        <!-- 错误状态 -->
        <div v-if="error" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <div class="text-5xl text-yellow-500 mb-4">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="text-base">图片加载失败</div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div v-if="showInfo" class="flex justify-center gap-6 p-3 bg-black/70 text-white flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-gray-300 text-sm">尺寸:</span>
          <span class="text-white text-sm font-medium">{{ imageSize }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-300 text-sm">缩放:</span>
          <span class="text-white text-sm font-medium">{{ Math.round(scale * 100) }}%</span>
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

// 触摸状态
const isTouching = ref(false)
const initialDistance = ref(0)
const initialScale = ref(1)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartTranslateX = ref(0)
const touchStartTranslateY = ref(0)
const lastTouchTime = ref(0)

// DOM引用
const imageElement = ref(null)
const imageContainer = ref(null)

// 计算属性
const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value}) rotate(${rotation.value}deg)`,
  transformOrigin: 'center center',
  transition: (isDragging.value || isTouching.value) ? 'none' : 'transform 0.3s ease'
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
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
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

// 触摸事件处理
const handleTouchStart = (e) => {
  e.preventDefault()
  const touches = e.touches
  
  if (touches.length === 1) {
    // 单指拖动
    isTouching.value = true
    const touch = touches[0]
    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY
    touchStartTranslateX.value = translateX.value
    touchStartTranslateY.value = translateY.value
    
    // 检测双击
    const currentTime = Date.now()
    if (currentTime - lastTouchTime.value < 300) {
      // 双击缩放
      if (scale.value > 1) {
        resetTransform()
      } else {
        scale.value = 2
      }
    }
    lastTouchTime.value = currentTime
    
  } else if (touches.length === 2) {
    // 双指缩放
    isTouching.value = true
    initialDistance.value = getDistance(touches[0], touches[1])
    initialScale.value = scale.value
    
    // 设置缩放中心点
    const centerX = (touches[0].clientX + touches[1].clientX) / 2
    const centerY = (touches[0].clientY + touches[1].clientY) / 2
    touchStartX.value = centerX
    touchStartY.value = centerY
  }
}

const handleTouchMove = (e) => {
  if (!isTouching.value) return
  e.preventDefault()
  
  const touches = e.touches
  
  if (touches.length === 1) {
    // 单指拖动
    const touch = touches[0]
    const deltaX = touch.clientX - touchStartX.value
    const deltaY = touch.clientY - touchStartY.value
    
    translateX.value = touchStartTranslateX.value + deltaX
    translateY.value = touchStartTranslateY.value + deltaY
    
  } else if (touches.length === 2) {
    // 双指缩放
    const currentDistance = getDistance(touches[0], touches[1])
    const scaleRatio = currentDistance / initialDistance.value
    const newScale = Math.min(Math.max(initialScale.value * scaleRatio, 0.1), 5)
    scale.value = newScale
  }
}

const handleTouchEnd = (e) => {
  if (e.touches.length === 0) {
    isTouching.value = false
  }
}

// 计算两点间距离
const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
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
/* 工具栏按钮样式 */
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

/* 图片样式 */
.preview-image {
  max-width: none;
  max-height: none;
  user-select: none;
  cursor: move;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .toolbar-btn {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .preview-image {
    cursor: default;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
}

/* 触摸设备优化 */
@media (pointer: coarse) {
  .toolbar-btn {
    width: 40px;
    height: 40px;
  }
  
  .preview-image {
    touch-action: none;
    -webkit-user-drag: none;
    -webkit-touch-callout: none;
  }
}

/* 暗色模式样式 */
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
</style> 