<!-- 头像裁切组件 -->
<template>
  <div 
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-5" 
    v-if="visible" 
    @click="handleBackdropClick"
  >
    <div class="bg-white dark:bg-secondary-800 rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl" @click.stop>
      <div class="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-secondary-600 bg-gray-50 dark:bg-secondary-900">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 m-0">裁切头像</h3>
        <button 
          class="bg-transparent border-none text-xl text-gray-500 dark:text-gray-400 cursor-pointer p-1 rounded transition-all duration-200 hover:bg-gray-200 dark:hover:bg-secondary-700 hover:text-gray-700 dark:hover:text-gray-200" 
          @click="handleClose"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="p-4 sm:p-5">
        <div class="max-h-80 sm:max-h-96 overflow-hidden rounded-lg border-2 border-gray-200 dark:border-secondary-600">
          <img ref="imageRef" :src="imageSrc" alt="裁切图片" class="max-w-full block" />
        </div>
        
        <div class="mt-4 p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
          <p class="m-0 mb-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <i class="fas fa-info-circle text-blue-500 dark:text-blue-400 w-4"></i>
            拖动调整裁切区域，滚轮缩放图片
          </p>
          <p class="m-0 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <i class="fas fa-cut text-blue-500 dark:text-blue-400 w-4"></i>
            图片将被裁切为 64x64 像素并压缩至50KB
          </p>
        </div>
      </div>
      
      <div class="flex justify-end gap-3 p-4 sm:p-5 border-t border-gray-200 dark:border-secondary-600 bg-gray-50 dark:bg-secondary-900">
        <button 
          class="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white disabled:opacity-60 disabled:cursor-not-allowed" 
          @click="handleClose"
        >
          <i class="fas fa-times"></i>
          取消
        </button>
        <button 
          class="px-5 py-2.5 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-60 disabled:cursor-not-allowed" 
          @click="handleCrop" 
          :disabled="isProcessing"
        >
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
    emit('crop', { file, preview: previewUrl })
    
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