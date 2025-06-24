/**
 * 计算菜单的安全位置，优先在触发点的四个角显示，确保不会超出屏幕边界且不遮挡触发点
 * @param {number} x - 初始 x 坐标
 * @param {number} y - 初始 y 坐标
 * @param {number} menuWidth - 菜单宽度
 * @param {number} menuHeight - 菜单高度
 * @param {number} offset - 边缘偏移量，默认 8px
 * @param {number} triggerWidth - 触发元素宽度，默认 0
 * @param {number} triggerHeight - 触发元素高度，默认 0
 * @returns {Object} - 包含调整后的 x, y 坐标和选择的位置
 */
export function calculateMenuPosition(x, y, menuWidth, menuHeight, offset = 8, triggerWidth = 0, triggerHeight = 0) {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const scrollX = window.scrollX || window.pageXOffset
  const scrollY = window.scrollY || window.pageYOffset
  
  // 视口边界
  const viewportLeft = scrollX + offset
  const viewportTop = scrollY + offset
  const viewportRight = scrollX + viewportWidth - offset
  const viewportBottom = scrollY + viewportHeight - offset
  
  // 定义四个角的位置策略（按优先级排序：先左后右，先下后上）
  const positions = [
    // 左下角（首选）
    {
      name: 'bottom-left',
      x: x - menuWidth - offset,
      y: y + triggerHeight + offset
    },
    // 右下角
    {
      name: 'bottom-right',
      x: x + triggerWidth + offset,
      y: y + triggerHeight + offset
    },
    // 左上角
    {
      name: 'top-left',
      x: x - menuWidth - offset,
      y: y - menuHeight - offset
    },
    // 右上角
    {
      name: 'top-right',
      x: x + triggerWidth + offset,
      y: y - menuHeight - offset
    },
    // 正左方（如果四角都不合适）
    {
      name: 'left-center',
      x: x - menuWidth - offset,
      y: y - menuHeight / 2
    },
    // 正右方
    {
      name: 'right-center',
      x: x + triggerWidth + offset,
      y: y - menuHeight / 2
    },
    // 正下方
    {
      name: 'bottom-center',
      x: x - menuWidth / 2,
      y: y + triggerHeight + offset
    },
    // 正上方
    {
      name: 'top-center',
      x: x - menuWidth / 2,
      y: y - menuHeight - offset
    }
  ]
  
  // 检查位置是否在视口内
  function isPositionValid(pos) {
    return pos.x >= viewportLeft && 
           pos.x + menuWidth <= viewportRight && 
           pos.y >= viewportTop && 
           pos.y + menuHeight <= viewportBottom
  }
  
  // 尝试找到第一个有效位置
  for (const position of positions) {
    if (isPositionValid(position)) {
      return {
        x: position.x,
        y: position.y,
        position: position.name
      }
    }
  }
  
  // 如果所有预设位置都不合适，进行智能调整
  return adjustPositionToFitViewport(x, y, menuWidth, menuHeight, viewportLeft, viewportTop, viewportRight, viewportBottom, triggerWidth, triggerHeight, offset)
}

/**
 * 当所有预设位置都不合适时，智能调整位置以适应视口
 */
function adjustPositionToFitViewport(x, y, menuWidth, menuHeight, viewportLeft, viewportTop, viewportRight, viewportBottom, triggerWidth, triggerHeight, offset) {
  let adjustedX = x - menuWidth - offset // 默认尝试左侧（优先左边）
  let adjustedY = y + triggerHeight + offset // 默认尝试下方
  
  // 水平位置调整（优先左侧）
  if (adjustedX < viewportLeft) {
    // 左侧不行，尝试右侧
    adjustedX = x + triggerWidth + offset
    if (adjustedX + menuWidth > viewportRight) {
      // 左右都不行，居中显示
      adjustedX = Math.max(viewportLeft, Math.min(x - menuWidth / 2, viewportRight - menuWidth))
    }
  }
  
  // 垂直位置调整
  if (adjustedY + menuHeight > viewportBottom) {
    // 尝试上方
    adjustedY = y - menuHeight - offset
    if (adjustedY < viewportTop) {
      // 上下都不行，尽量避免遮挡触发点
      if (y + triggerHeight / 2 < viewportTop + (viewportBottom - viewportTop) / 2) {
        // 触发点在上半部分，菜单显示在下方
        adjustedY = Math.max(viewportTop, y + triggerHeight + offset)
      } else {
        // 触发点在下半部分，菜单显示在上方
        adjustedY = Math.min(viewportBottom - menuHeight, y - offset)
      }
    }
  }
  
  // 最终边界检查
  adjustedX = Math.max(viewportLeft, Math.min(adjustedX, viewportRight - menuWidth))
  adjustedY = Math.max(viewportTop, Math.min(adjustedY, viewportBottom - menuHeight))
  
  return {
    x: adjustedX,
    y: adjustedY,
    position: 'adjusted'
  }
}

/**
 * 专门用于右键菜单的位置计算，鼠标点击位置即为触发点
 * @param {number} x - 鼠标点击的 x 坐标
 * @param {number} y - 鼠标点击的 y 坐标
 * @param {number} menuWidth - 菜单宽度
 * @param {number} menuHeight - 菜单高度
 * @param {number} offset - 边缘偏移量，默认 4px（右键菜单偏移更小）
 * @returns {Object} - 包含调整后的 x, y 坐标和选择的位置
 */
export function calculateContextMenuPosition(x, y, menuWidth, menuHeight, offset = 4) {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const scrollX = window.scrollX || window.pageXOffset
  const scrollY = window.scrollY || window.pageYOffset
  
  // 视口边界
  const viewportLeft = scrollX + offset
  const viewportTop = scrollY + offset
  const viewportRight = scrollX + viewportWidth - offset
  const viewportBottom = scrollY + viewportHeight - offset
  
  // 右键菜单的四个角位置策略（先左后右，先下后上）
  const positions = [
    // 左下角（鼠标点击点的左下）
    {
      name: 'bottom-left',
      x: x - menuWidth - offset,
      y: y + offset
    },
    // 右下角
    {
      name: 'bottom-right',
      x: x + offset,
      y: y + offset
    },
    // 左上角
    {
      name: 'top-left',
      x: x - menuWidth - offset,
      y: y - menuHeight - offset
    },
    // 右上角
    {
      name: 'top-right',
      x: x + offset,
      y: y - menuHeight - offset
    }
  ]
  
  // 检查位置是否在视口内
  function isPositionValid(pos) {
    return pos.x >= viewportLeft && 
           pos.x + menuWidth <= viewportRight && 
           pos.y >= viewportTop && 
           pos.y + menuHeight <= viewportBottom
  }
  
  // 尝试找到第一个有效位置
  for (const position of positions) {
    if (isPositionValid(position)) {
      return {
        x: position.x,
        y: position.y,
        position: position.name
      }
    }
  }
  
  // 如果四角都不合适，进行调整（优先左下）
  let adjustedX = x - menuWidth - offset // 优先左侧
  let adjustedY = y + offset
  
  // 水平调整（优先左侧）
  if (adjustedX < viewportLeft) {
    // 左侧不行，尝试右侧
    adjustedX = x + offset
    if (adjustedX + menuWidth > viewportRight) {
      adjustedX = viewportRight - menuWidth
    }
  }
  
  // 垂直调整
  if (adjustedY + menuHeight > viewportBottom) {
    adjustedY = y - menuHeight - offset
    if (adjustedY < viewportTop) {
      adjustedY = viewportBottom - menuHeight
    }
  }
  
  // 最终边界检查
  adjustedX = Math.max(viewportLeft, Math.min(adjustedX, viewportRight - menuWidth))
  adjustedY = Math.max(viewportTop, Math.min(adjustedY, viewportBottom - menuHeight))
  
  return {
    x: adjustedX,
    y: adjustedY,
    position: 'adjusted'
  }
}

/**
 * 获取菜单的预估尺寸
 * @param {number} itemCount - 菜单项数量
 * @param {boolean} hasHeader - 是否有头部
 * @param {boolean} hasDivider - 是否有分隔线
 * @returns {Object} - 包含 width, height 的对象
 */
export function getEstimatedMenuSize(itemCount, hasHeader = false, hasDivider = false) {
  const itemHeight = 32 // 每个菜单项的高度（8px padding * 2 + 16px line height）
  const headerHeight = hasHeader ? 56 : 0 // 头部高度
  const dividerHeight = hasDivider ? 9 : 0 // 分隔线高度（1px + 4px margin * 2）
  const padding = 12 // 菜单容器的内边距（6px * 2）
  
  const width = hasHeader ? 200 : 150 // 有头部的菜单更宽
  const height = headerHeight + (itemCount * itemHeight) + dividerHeight + padding
  
  return { width, height }
}

/**
 * 调试函数：在开发环境中打印菜单位置信息
 * @param {Object} result - calculateMenuPosition 或 calculateContextMenuPosition 的返回值
 * @param {string} menuType - 菜单类型
 */
export function debugMenuPosition(result, menuType = 'menu') {
  if (import.meta.env.DEV) {
    console.log(`${menuType} 位置调试信息:`, {
      position: result.position,
      x: result.x,
      y: result.y,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      }
    })
  }
} 