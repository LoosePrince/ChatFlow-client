import { ref, onMounted, onUnmounted } from 'vue'

export function useContextMenu() {
  // 右键菜单状态
  const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    targetUser: null,
    sourceType: 'member' // 'member' 或 'message'
  })

  // 消息右键菜单状态
  const messageContextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    targetMessage: null
  })

  // 禁言弹窗状态
  const muteDialog = ref({
    visible: false,
    targetUser: null
  })

  // 踢人弹窗状态
  const kickDialog = ref({
    visible: false,
    targetUser: null
  })

  // 显示用户右键菜单
  const showUserContextMenu = (event, user, sourceType = 'member') => {
    event.preventDefault()
    event.stopPropagation()
    
    // 设置菜单位置
    let x = event.clientX
    let y = event.clientY
    
    // 确保菜单不会超出屏幕边界
    const menuWidth = 200
    const menuHeight = 250
    
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10
    }
    
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10
    }
    
    contextMenu.value = {
      visible: true,
      x,
      y,
      targetUser: user,
      sourceType
    }
  }

  // 关闭右键菜单
  const closeContextMenu = () => {
    contextMenu.value.visible = false
    contextMenu.value.targetUser = null
  }

  // 显示消息右键菜单
  const showMessageContextMenu = (event, message) => {
    event.preventDefault()
    event.stopPropagation()
    
    // 设置菜单位置
    let x = event.clientX
    let y = event.clientY
    
    // 确保菜单不会超出屏幕边界
    const menuWidth = 150
    const menuHeight = 100
    
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10
    }
    
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10
    }
    
    // 关闭用户菜单
    closeContextMenu()
    
    messageContextMenu.value = {
      visible: true,
      x,
      y,
      targetMessage: message
    }
  }

  // 关闭消息右键菜单
  const closeMessageContextMenu = () => {
    messageContextMenu.value.visible = false
    messageContextMenu.value.targetMessage = null
  }

  // 显示禁言对话框
  const showMuteDialog = (user) => {
    closeContextMenu()
    muteDialog.value = {
      visible: true,
      targetUser: user
    }
  }

  // 取消禁言对话框
  const cancelMute = () => {
    muteDialog.value.visible = false
    muteDialog.value.targetUser = null
  }

  // 显示踢人对话框
  const showKickDialog = (user) => {
    closeContextMenu()
    kickDialog.value = {
      visible: true,
      targetUser: user
    }
  }

  // 取消踢人对话框
  const cancelKick = () => {
    kickDialog.value.visible = false
    kickDialog.value.targetUser = null
  }

  // 处理全局右键点击事件
  const handleRightClick = (event) => {
    // 阻止默认右键菜单显示
    event.preventDefault()
    // 关闭现有的右键菜单
    closeContextMenu()
    closeMessageContextMenu()
  }

  // 监听键盘事件（ESC键关闭菜单）
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeContextMenu()
      closeMessageContextMenu()
      if (muteDialog.value.visible) {
        cancelMute()
      }
      if (kickDialog.value.visible) {
        cancelKick()
      }
    }
  }

  // 生命周期：添加事件监听
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  // 生命周期：移除事件监听
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    contextMenu,
    messageContextMenu,
    muteDialog,
    kickDialog,
    showUserContextMenu,
    closeContextMenu,
    showMessageContextMenu,
    closeMessageContextMenu,
    showMuteDialog,
    cancelMute,
    showKickDialog,
    cancelKick,
    handleRightClick
  }
} 