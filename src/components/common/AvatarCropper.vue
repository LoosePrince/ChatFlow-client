<!-- 头像裁切组件 -->
<template>
  <div class="avatar-cropper-modal" v-if="visible" @click="handleBackdropClick">
    <div class="cropper-container" @click.stop>
      <div class="cropper-header">
        <h3>裁切头像</h3>
        <button class="close-btn" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="cropper-body">
        <div class="cropper-wrapper">
          <img ref="imageRef" :src="imageSrc" alt="裁切图片" />
        </div>
        
        <div class="cropper-info">
          <p><i class="fas fa-info-circle"></i> 拖动调整裁切区域，滚轮缩放图片</p>
          <p><i class="fas fa-cut"></i> 图片将被裁切为 64x64 像素并压缩至50KB</p>
        </div>
      </div>
      
      <div class="cropper-footer">
        <button class="btn btn-secondary" @click="handleClose">
          <i class="fas fa-times"></i>
          取消
        </button>
        <button class="btn btn-primary" @click="handleCrop" :disabled="isProcessing">
          <i class="fas fa-check" v-if="!isProcessing"></i>
          <i class="fas fa-spinner fa-spin" v-else></i>
          {{ isProcessing ? '处理中...' : '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  imageSrc: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'crop'])

// 响应式数据
const imageRef = ref(null)
const cropper = ref(null)
const isProcessing = ref(false)

// Cropper配置
const cropperOptions = {
  aspectRatio: 1, // 1:1 正方形
  viewMode: 1, // 限制裁切框不超出图片范围
  dragMode: 'move', // 拖拽模式
  autoCrop: true, // 自动生成裁切框
  autoCropArea: 0.8, // 自动裁切区域占比
  responsive: true, // 响应式
  checkOrientation: false, // 不检查方向
  guides: true, // 显示网格线
  center: true, // 显示中心点
  highlight: true, // 高亮裁切区域
  cropBoxMovable: true, // 裁切框可移动
  cropBoxResizable: true, // 裁切框可调整大小
  toggleDragModeOnDblclick: false, // 双击不切换拖拽模式
  minContainerWidth: 300,
  minContainerHeight: 300,
  minCanvasWidth: 0,
  minCanvasHeight: 0,
  minCropBoxWidth: 50,
  minCropBoxHeight: 50
}

// 初始化裁切器
const initCropper = () => {
  if (cropper.value) {
    cropper.value.destroy()
  }
  
  if (imageRef.value && props.visible) {
    cropper.value = new Cropper(imageRef.value, cropperOptions)
  }
}

// 销毁裁切器
const destroyCropper = () => {
  if (cropper.value) {
    cropper.value.destroy()
    cropper.value = null
  }
}

// 处理背景点击
const handleBackdropClick = () => {
  handleClose()
}

// 关闭模态框
const handleClose = () => {
  destroyCropper()
  emit('close')
}

// 处理裁切
const handleCrop = async () => {
  if (!cropper.value) return
  
  isProcessing.value = true
  
  try {
    // 获取裁切后的canvas
    const canvas = cropper.value.getCroppedCanvas({
      width: 64,
      height: 64,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    })
    
    // 转换为Blob（使用JPEG格式和较低质量以控制文件大小）
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png', 0.9)
    })
    
    // 创建File对象
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    
    // 创建预览URL
    const previewUrl = canvas.toDataURL('image/jpeg', 0.7)
    
    // 发送裁切结果
    emit('crop', { file, previewUrl })
    
    // 关闭模态框
    handleClose()
    
  } catch (error) {
    console.error('裁切失败:', error)
    alert('裁切失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 等待DOM更新后初始化裁切器
    setTimeout(initCropper, 100)
  } else {
    destroyCropper()
  }
})

// 监听imageSrc变化
watch(() => props.imageSrc, () => {
  if (props.visible) {
    setTimeout(initCropper, 100)
  }
})

// 组件卸载时清理
onUnmounted(() => {
  destroyCropper()
})
</script>

<style scoped>
.avatar-cropper-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.cropper-container {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.cropper-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.cropper-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.cropper-body {
  padding: 20px;
}

.cropper-wrapper {
  max-height: 400px;
  overflow: hidden;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}

.cropper-wrapper img {
  max-width: 100%;
  display: block;
}

.cropper-info {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.cropper-info p {
  margin: 0;
  margin-bottom: 8px;
  font-size: 14px;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cropper-info p:last-child {
  margin-bottom: 0;
}

.cropper-info i {
  color: #007bff;
  width: 16px;
}

.cropper-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .avatar-cropper-modal {
    padding: 10px;
  }
  
  .cropper-container {
    max-height: 95vh;
  }
  
  .cropper-header,
  .cropper-body,
  .cropper-footer {
    padding: 15px;
  }
  
  .cropper-wrapper {
    max-height: 300px;
  }
}
</style> 