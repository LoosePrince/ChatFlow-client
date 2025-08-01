<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-slate-800 overflow-hidden" @contextmenu.prevent="handleRightClick">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-slate-800">
      <div class="text-3xl text-blue-600 dark:text-blue-400 mb-4">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p class="text-gray-600 dark:text-slate-300 text-lg">正在加载聊天室...</p>
    </div>

    <!-- 聊天室内容 -->
    <div v-else class="flex h-full relative overflow-hidden" :class="{ 'justify-center': isPrivateChat }">
      <!-- 左侧房间列表 (桌面端) - 私聊模式不显示 -->
             <LeftSidebar
         v-if="!isPrivateChat"
         :show="showRoomList"
         :rooms="joinedRooms"
         :currentRoomId="roomId"
         :currentUser="authStore.user"
         @toggle="toggleRoomList"
         @switchRoom="switchRoom"
         @goToRoomSelect="goToRoomSelect"
         @goHome="goHome"
         @confirmLeaveRoom="confirmLeaveRoom"
         @roomSettings="handleRoomSettings"
         @leaveRoom="handleLeaveSpecificRoom"
         @userProfile="handleUserProfile"
         @currentRoomSettings="handleCurrentRoomSettings"
       />

      <!-- 主聊天区域 -->
      <div class="flex-1 min-w-0 flex flex-col relative h-full">
        <!-- 顶部导航栏 -->
        <div class="bg-white dark:bg-slate-900 px-5 py-4 border-b border-gray-200 dark:border-slate-600 flex justify-between items-center shadow-sm flex-shrink-0 relative z-10">
          <div class="flex items-center gap-3">
            <button v-if="isPrivateChat" @click="goBack" class="md:hidden bg-transparent border-none text-gray-500 dark:text-slate-400 text-lg cursor-pointer p-2 rounded transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200">
              <i class="fas fa-arrow-left"></i>
            </button>
            <button v-else @click="toggleRoomList" class="md:hidden bg-transparent border-none text-gray-500 dark:text-slate-400 text-lg cursor-pointer p-2 rounded transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200">
              <i class="fas fa-bars"></i>
            </button>
            <div class="flex items-center gap-3">
              <h1 
                class="text-2xl font-semibold text-gray-800 dark:text-slate-100 m-0"
                :class="{ 'cursor-pointer relative transition-all duration-200 hover:underline hover:decoration-blue-500 hover:decoration-2 hover:underline-offset-1': !isPrivateChat && isCreator }"
                @click="!isPrivateChat && isCreator ? showRoomNameDialog() : null"
              >
                {{ roomName }}
              </h1>
              <span v-if="!isPrivateChat" class="text-gray-500 dark:text-slate-400 text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">ID: {{ roomId }}</span>
              <span v-if="!isPrivateChat && roomInfo?.hasPassword" class="text-yellow-500 text-base">
                <i class="fas fa-lock"></i>
              </span>
            </div>
          </div>
          <div class="flex-1 flex justify-end">
            <!-- 用户信息已移动到左侧边栏 -->
          </div>
          <div class="flex items-center gap-3">
            <button v-if="!isPrivateChat" @click="toggleMemberList" class="md:hidden bg-transparent border-none text-gray-500 dark:text-slate-400 text-lg cursor-pointer p-2 rounded transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200">
              <i class="fas fa-user-friends"></i>
            </button>
            <button v-if="isPrivateChat" @click="toggleMemberList" class="md:hidden bg-transparent border-none text-gray-500 dark:text-slate-400 text-lg cursor-pointer p-2 rounded transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200">
              <i class="fas fa-cog"></i>
            </button>
          </div>
        </div>

        <!-- 聊天内容区域 -->
        <div class="flex-1 flex flex-col relative overflow-hidden min-h-0">
          <!-- 临时通知区域 -->
          <div v-if="temporaryNotifications.length > 0" class="absolute top-5 right-5 z-20 flex flex-col gap-2 max-w-xs">
            <div 
              v-for="notification in temporaryNotifications"
              :key="notification.id"
              :class="[
                'flex items-center gap-2 px-4 py-3 rounded-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-lg border-l-4 text-sm text-gray-800 dark:text-slate-200 animate-slide-in-right transition-all duration-300 hover:-translate-x-1 hover:shadow-xl',
                {
                  'border-l-green-500': notification.type === 'join',
                  'border-l-orange-500': notification.type === 'leave',
                  'border-l-blue-500': notification.type === 'info',
                  'border-l-yellow-500': notification.type === 'warning',
                  'border-l-red-500': notification.type === 'error'
                }
              ]"
            >
              <i :class="[
                getNotificationIcon(notification.type),
                {
                  'text-green-500': notification.type === 'join',
                  'text-orange-500': notification.type === 'leave',
                  'text-blue-500': notification.type === 'info',
                  'text-yellow-500': notification.type === 'warning',
                  'text-red-500': notification.type === 'error'
                }
              ]"></i>
              <span>{{ notification.message }}</span>
            </div>
          </div>
          
          <div class="flex-1 overflow-hidden min-h-0">
            <div class="h-full overflow-y-auto p-5 scroll-smooth flex flex-col-reverse" ref="messageList" @scroll="handleScroll">
              <div class="flex flex-col min-h-full justify-end">
                <!-- 加载更多指示器 -->
                <div v-if="messagesPagination.isLoading && messagesPagination.currentPage > 1" class="flex items-center justify-center gap-2 py-4 text-gray-600 dark:text-slate-400 text-sm mb-4">
                  <div class="flex items-center justify-center">
                    <i class="fas fa-spinner fa-spin text-blue-600 dark:text-blue-400 text-base"></i>
                  </div>
                  <span>加载更多消息...</span>
                </div>
                
                <!-- 没有更多消息提示 -->
                <div v-if="!messagesPagination.hasMore && messages.length > 0" class="flex items-center justify-center gap-2 py-3 text-gray-500 dark:text-slate-500 text-xs opacity-80">
                  <i class="fas fa-history text-gray-500 dark:text-slate-500"></i>
                  <span>已显示所有历史消息</span>
                </div>
                
                <div v-if="messages.length === 0 && !messagesPagination.isLoading" class="flex flex-col items-center justify-center flex-1 text-gray-600 dark:text-slate-400">
                  <i class="fas fa-comment-dots text-5xl mb-4 opacity-70 text-blue-500 dark:text-blue-400"></i>
                  <p>暂无消息，开始聊天吧！</p>
                </div>
              
              <TransitionGroup 
                name="message-delete" 
                tag="div" 
                class="relative"
              >
                <div 
                  v-for="message in processedMessages" 
                  :key="message.id"
                  :data-message-id="message.id"
                  :class="[
                    'p-1 rounded-lg transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                    { 
                      'mb-1': !message.isFirstInGroup,
                      'mb-2': message.isFirstInGroup,
                      'mb-4': message.isLastInGroup,
                      'opacity-50 scale-95 transition-all duration-300 relative': message.isDeleting
                    }
                  ]"
                  @contextmenu="message.type !== 'system' ? handleShowMessageContextMenu($event, message) : null"
                >
                <!-- 系统消息 -->
                <div v-if="message.type === 'system'" class="flex justify-center">
                  <div class="flex items-center gap-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 px-4 py-2.5 rounded-full text-sm max-w-4/5 shadow-lg border border-blue-200/20 dark:border-blue-700/20 relative overflow-hidden">
                    <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-300 via-purple-400 to-blue-300 animate-shimmer"></div>
                    <div class="text-blue-600 dark:text-blue-400 text-sm opacity-80">
                      <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="flex-1 font-medium text-center leading-tight">{{ message.text }}</div>
                    <div class="text-gray-500 dark:text-gray-400 text-xs font-normal opacity-70 ml-2 whitespace-nowrap">{{ formatTime(message.timestamp) }}</div>
                  </div>
                </div>
                
                <!-- 用户消息 -->
                <div v-else class="flex gap-3 items-start" :class="{ 'flex-row-reverse': message.isOwn }">
                  <!-- 头像区域 -->
                  <div class="flex-shrink-0 w-10 flex justify-center" :class="{ 'avatar-placeholder': !message.showAvatar }">
                    <img 
                      v-if="message.showAvatar"
                      :src="getAvatarUrl(message.userAvatar)" 
                      :alt="message.userName"
                      class="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600"
                      @contextmenu="handleShowUserContextMenu($event, {
                        uid: message.userUid,
                        nickname: message.userName,
                        avatarUrl: message.userAvatar,
                        isAdmin: message.isAdmin
                      }, 'message')"
                    >
                  </div>
                  
                  <!-- 消息内容 -->
                  <div class="max-w-[70%] px-4 py-3 rounded-xl bg-white dark:bg-slate-700 shadow-sm word-wrap break-words relative" :class="{ 
                    'py-2 mt-0.5': !message.isFirstInGroup,
                    'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700': message.isOwn
                  }">
                    <!-- 消息头部（用户名和时间） -->
                    <div v-if="message.showHeader" class="flex justify-between items-center text-xs gap-1 mb-1">
                      <span class="font-medium" :class="{ 'text-blue-600 dark:text-blue-400': message.isOwn }">
                        {{ message.userName }}
                        <i v-if="message.isAdmin" class="fas fa-shield-alt text-yellow-500 text-xs ml-1" title="管理员"></i>
                      </span>
                      <span class="text-gray-500 dark:text-slate-400 text-xs" :class="{ 'text-blue-600 dark:text-blue-400': message.isOwn }">{{ formatTime(message.timestamp) }}</span>
                    </div>
                    
                    <!-- 非文本消息的时间显示（连续消息中） -->
                    <div v-else-if="message.type !== 'user' && message.type !== 'system' && !message.showHeader" class="mb-1 text-right">
                      <span class="text-gray-500 dark:text-slate-400 text-xs opacity-80" :class="{ 'text-blue-600 dark:text-blue-400 opacity-80': message.isOwn }">{{ formatTime(message.timestamp) }}</span>
                    </div>
                    
                    <!-- 回复信息 -->
                    <div v-if="message.replyToMessage" class="mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md cursor-pointer transition-colors duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-start gap-2" @click="scrollToMessage(message.replyToMessage.id, true)">
                      <div class="w-0.5 bg-blue-500 rounded-full mt-1 flex-shrink-0 self-stretch"></div>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5 leading-tight">{{ message.replyToMessage.user.nickname }}</div>
                        <div class="text-xs text-gray-600 dark:text-slate-400 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                          <span v-if="message.replyToMessage.messageType === 'image'">
                            <i class="fas fa-image"></i> 图片
                          </span>
                          <span v-else-if="message.replyToMessage.messageType === 'bilibili'">
                            <i class="fab fa-bilibili"></i> B站视频 {{ message.replyToMessage.bilibiliId }}
                          </span>
                          <span v-else-if="message.replyToMessage.messageType === 'markdown'">
                            <i class="fab fa-markdown"></i> {{ message.replyToMessage.content || 'Markdown内容' }}
                          </span>
                          <span v-else-if="message.replyToMessage.messageType === 'file'">
                            <i class="fas fa-file"></i> {{ message.replyToMessage.fileName }}
                          </span>
                          <span v-else>{{ message.replyToMessage.content }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 消息文本和时间 -->
                    <div class="w-full">
                      <!-- 图片消息 -->
                      <div v-if="message.type === 'image'" class="my-1">
                        <img 
                          :src="getImageUrl(message.imageUrl)" 
                          :alt="message.text || '图片'"
                          class="max-h-96 h-auto rounded-lg cursor-pointer transition-all duration-300 shadow-md hover:scale-[1.02] hover:shadow-lg"
                          @click="openImagePreview(message.imageUrl, `${message.userName}发送的图片`)"
                          @error="handleImageError"
                        >
                        <div v-if="message.text" class="mt-2 text-sm leading-relaxed">{{ message.text }}</div>
                      </div>
                      <!-- B站视频消息 -->
                      <div v-else-if="message.type === 'bilibili'" class="my-2">
                        <BilibiliVideo :bvid="message.bilibiliId" />
                      </div>
                      <!-- 文件消息 -->
                      <div v-else-if="message.type === 'file'" class="max-w-md my-2">
                        <div class="flex items-center gap-1.5 text-xs mb-1.5 opacity-70 font-medium">
                          <i class="fas fa-file text-base"></i>
                          <span class="bg-gray-100 dark:bg-slate-600 px-1.5 py-0.5 rounded text-xs">文件</span>
                        </div>
                        <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-500 hover:shadow-md">
                          <div class="flex items-center gap-2.5 flex-1 min-w-0">
                            <div class="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 text-lg flex-shrink-0">
                              <i :class="getFileIcon(message.fileName)"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="font-semibold text-gray-800 dark:text-slate-200 text-sm mb-0.5 break-all leading-tight">{{ message.fileName }}</div>
                              <div class="text-xs text-gray-500 dark:text-slate-400 mb-0.5">{{ formatFileSize(message.fileSize) }}</div>
                              <div v-if="message.fileExpired" class="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                                <i class="fas fa-exclamation-triangle"></i>
                                文件已过期
                              </div>
                              <div v-else class="flex items-center gap-1 text-xs text-green-500 dark:text-green-400">
                                <i class="fas fa-clock"></i>
                                {{ formatFileExpiry(message.fileExpiry) }}
                              </div>
                            </div>
                          </div>
                          <button 
                            v-if="!message.fileExpired"
                            @click="downloadFile(message.fileId, message.fileName)"
                            class="w-9 h-9 bg-green-500 hover:bg-green-600 text-white border-none rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 flex-shrink-0 text-sm hover:scale-105"
                            title="下载文件"
                          >
                            <i class="fas fa-download"></i>
                          </button>
                        </div>
                      </div>
                      <!-- Markdown消息 -->
                      <div v-else-if="message.type === 'markdown'" class="max-w-2xl my-2">
                        <div class="leading-relaxed text-gray-800 dark:text-slate-200">{{ message.text }}</div>
                        <div class="flex items-center gap-1.5 text-xs mb-1.5 opacity-70 font-medium">
                          <i class="fab fa-markdown text-base"></i>
                          <span class="bg-gray-100 dark:bg-slate-600 px-1.5 py-0.5 rounded text-xs">Markdown</span>
                        </div>
                        <div 
                          class="leading-relaxed text-gray-800 dark:text-slate-200 text-sm"
                          v-html="renderMarkdown(message.markdownContent)"
                          @click="handleMarkdownImageClick"
                        ></div>
                      </div>
                      <!-- 文本消息 -->
                      <div v-else class="leading-relaxed text-gray-800 dark:text-slate-200 text-justify text-sm break-words whitespace-break-spaces flex-1">
                        {{ message.text }}
                        <span v-if="!message.showHeader && message.type === 'user'" class="text-gray-500 dark:text-slate-400 text-xs opacity-70 whitespace-nowrap float-right ml-2 leading-inherit">{{ formatTime(message.timestamp) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </TransitionGroup>
              </div> <!-- 关闭 messages-container -->
            </div>
          </div>

          <div class="p-5 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-600 flex-shrink-0 relative z-10">
            <!-- 隐藏的文件输入框 -->
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              @change="handleImageSelect"
              style="display: none"
            >
            
            <!-- 隐藏的通用文件输入框 -->
            <input
              ref="fileInput"
              type="file"
              @change="handleFileSelect"
              style="display: none"
              accept="*/*"
              title="选择文件（最大2MB）"
            >
            
            <!-- 新的消息输入组件 -->
            <MessageInput
              ref="messageInputComponent"
              v-model="newMessage"
              :canSendMessage="canSendMessage"
              :replyState="replyState"
              :maxLength="500"
              placeholder="输入消息..."
              @sendMessage="handleSendMessage"
              @cancelReply="cancelReply"
              @selectImage="selectImage"
              @showMessageTypeSelector="showMessageTypeSelector"
              @paste="handlePaste"
            />
            
            <div v-if="!canSendMessage && muteTimeRemaining > 0" class="mt-3 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg flex items-center gap-2 text-sm">
              <i class="fas fa-clock text-yellow-500 dark:text-yellow-400"></i>
              您已被禁言，还需等待 {{ formatMuteTime(muteTimeRemaining) }} 后才能发言
            </div>
            
            <div v-if="!authStore.isAuthenticated" class="mt-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg flex items-center gap-2 text-sm">
              <i class="fas fa-user-slash text-red-500 dark:text-red-400"></i>
              请先登录后才能发言
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 (桌面端) -->
      <div v-if="showMemberList" class="w-280 flex-shrink-0 border-l border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 h-full overflow-y-auto relative transition-transform duration-300" :class="{ 'translate-x-0': showMemberList }">
        <!-- 聊天室模式：显示成员列表 -->
        <RightSidebar
          v-if="!isPrivateChat"
          :show="showMemberList"
          :members="roomMembers"
          @toggle="toggleMemberList"
          @showUserContextMenu="handleShowUserContextMenu"
        />
        
        <!-- 私聊模式：显示私聊设置 -->
        <div v-else class="h-full flex flex-col">
          <div class="p-4 border-b border-gray-200 dark:border-slate-600 flex justify-between items-center">
            <h3 class="flex items-center gap-2">
              <i class="fas fa-cog"></i>
              私聊设置
            </h3>
            <div class="button-container">
              <button v-if="isMobile" @click="toggleMemberList" class="sidebar-toggle">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <PrivateChatConversationSettings :targetUid="targetUid" />
          </div>
        </div>
      </div>

      <!-- 移动端遮罩层 -->
      <div 
        v-if="(showRoomList || showMemberList) && isMobile" 
        class="fixed inset-0 bg-black/50 z-15"
        @click="closeMobileSidebars"
      ></div>

      <!-- 退出确认对话框 -->
      <div v-if="showLeaveConfirm" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50" @click="cancelLeave">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-11/12 max-h-80vh overflow-hidden" @click.stop>
          <div class="p-5 pb-0 text-center">
            <h3 class="text-gray-800 dark:text-slate-100 text-lg m-0">{{ isCreator ? '解散房间' : '退出房间' }}</h3>
          </div>
          <div class="p-5 text-center">
            <p v-if="isCreator" class="text-gray-600 dark:text-slate-300 leading-relaxed m-0">
              <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
              您是房主，退出房间将会解散整个房间，所有成员都将被移除。此操作不可撤销！
            </p>
            <p v-else class="text-gray-600 dark:text-slate-300 leading-relaxed m-0">
              确定要退出房间"{{ roomName }}"吗？
            </p>
          </div>
          <div class="p-5 pt-0 flex gap-3 justify-center">
            <button @click="cancelLeave" class="px-5 py-2.5 bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-gray-200 dark:hover:bg-slate-500 hover:text-gray-700 dark:hover:text-slate-200">取消</button>
            <button @click="confirmLeave" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg cursor-pointer text-sm font-medium transition-all duration-200" :class="{ 'bg-red-600 hover:bg-red-700': isCreator }">
              {{ isCreator ? '确认解散' : '确认退出' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右键菜单组件 -->
      <ContextMenu
          :visible="contextMenu.visible"
          :x="contextMenu.x"
          :y="contextMenu.y"
          :targetUser="contextMenuUser"
          :currentUserIsCreator="isCreator"
          @close="closeContextMenu"
          @setAdmin="setUserAdmin"
          @showMute="showMuteDialog"
          @unmute="unmuteUser"
          @showKick="showKickDialog"
        />

      <!-- 消息右键菜单组件 -->
      <MessageContextMenu
        :visible="messageContextMenu.visible"
        :x="messageContextMenu.x"
        :y="messageContextMenu.y"
        :targetMessage="messageContextMenu.targetMessage"
        :currentUser="authStore.user"
        :isAdmin="currentUserIsAdmin"
        :isCreator="isCreator"
        @close="closeMessageContextMenu"
        @reply="handleReplyMessage"
        @delete="handleDeleteMessage"
        @privateChat="startPrivateChat"
        @block="toggleBlockUser"
        :isBlocked="privateChatStore.isBlocked(messageContextMenu.targetMessage?.userUid)"
      />

      <!-- 禁言弹窗组件 -->
      <MuteDialog 
        :visible="muteDialog.visible"
        :targetUser="muteDialogUser"
        @cancel="cancelMute"
        @confirm="confirmMute"
      />

      <!-- 踢人确认弹窗组件 -->
      <KickDialog 
        :visible="kickDialog.visible"
        :targetUser="kickDialogUser"
        @cancel="cancelKick"
        @confirm="confirmKickUser"
      />

      <!-- 删除消息确认弹窗 -->
      <DeleteMessageDialog
        :visible="deleteMessageDialog.visible"
        :targetMessage="deleteMessageDialog.targetMessage"
        @confirm="confirmDeleteMessage"
        @cancel="cancelDeleteMessage"
      />

      <!-- 图片预览组件 -->
      <ImagePreview
        :visible="imagePreview.visible"
        :imageUrl="imagePreview.imageUrl"
        :imageTitle="imagePreview.title"
        @close="closeImagePreview"
      />

      <!-- 消息类型选择器 -->
      <MessageTypeSelector
        :visible="messageTypeDialog.visible"
        @close="closeMessageTypeSelector"
        @select="handleMessageTypeSelect"
      />

      <!-- B站视频输入对话框 -->
      <BilibiliInputDialog
        :visible="bilibiliDialog.visible"
        @cancel="closeBilibiliDialog"
        @submit="handleBilibiliSubmit"
      />

      <!-- Markdown输入对话框 -->
      <MarkdownInputDialog
        :visible="markdownDialog.visible"
        @cancel="closeMarkdownDialog"
        @submit="handleMarkdownSubmit"
      />

      <!-- 房间名称编辑弹窗 -->
      <RoomNameEditDialog
        :visible="roomNameDialog.visible"
        :current-name="roomName"
        @cancel="closeRoomNameDialog"
        @submit="handleRoomNameUpdate"
      />

      <!-- 上传进度对话框 -->
      <div v-if="uploadProgress.visible" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl min-w-80 max-w-11/12 overflow-hidden animate-upload-dialog-fade-in">
          <div class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-5 py-4 flex items-center gap-2.5 font-semibold">
            <i :class="uploadProgress.type === 'image' ? 'fas fa-image' : 'fas fa-file'" class="text-lg"></i>
            <span>{{ uploadProgress.type === 'image' ? '发送图片' : '发送文件' }}</span>
          </div>
          
          <div class="p-5">
            <div class="text-gray-800 dark:text-slate-100 font-medium mb-4 break-all leading-relaxed">
              {{ uploadProgress.fileName }}
            </div>
            
            <div class="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden mb-3">
              <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 relative" :style="{ width: uploadProgress.progress + '%' }">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-progress-shimmer"></div>
              </div>
            </div>
            
            <div class="text-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
              {{ uploadProgress.progress }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 图片压缩确认对话框 -->
      <ImageCompressionDialog
        :visible="compressionDialog.visible"
        :fileName="compressionDialog.fileName"
        :fileSize="compressionDialog.fileSize"
        @confirm="handleCompressionConfirm"
        @cancel="handleCompressionCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, useNotificationStore, useChatroomStore } from '@/stores'
import axios from 'axios'
import { io } from 'socket.io-client'
import { getWebSocketCorsConfig } from '@/config/cors.js'
import ContextMenu from '@/components/common/ContextMenu.vue'
import MessageContextMenu from '@/components/common/MessageContextMenu.vue'
import DeleteMessageDialog from '@/components/common/DeleteMessageDialog.vue'
import MuteDialog from '@/components/common/MuteDialog.vue'
import KickDialog from '@/components/common/KickDialog.vue'
import ImagePreview from '@/components/common/ImagePreview.vue'
import MessageTypeSelector from '@/components/common/MessageTypeSelector.vue'
import BilibiliInputDialog from '@/components/common/BilibiliInputDialog.vue'
import MarkdownInputDialog from '@/components/common/MarkdownInputDialog.vue'
import RoomNameEditDialog from '@/components/common/RoomNameEditDialog.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import ImageCompressionDialog from '@/components/common/ImageCompressionDialog.vue'
import BilibiliVideo from '@/components/common/BilibiliVideo.vue'
import LeftSidebar from '@/components/common/LeftSidebar.vue'
import RightSidebar from '@/components/common/RightSidebar.vue'
import MessageInput from '@/components/common/MessageInput.vue'
import { useContextMenu } from '@/composables/useContextMenu.js'
import { marked } from 'marked'
import { usePrivateChatStore } from '@/stores/privateChat'
import { useUserInfo } from '@/composables/useUserInfo'
import PrivateChatConversationSettings from '@/components/common/PrivateChatConversationSettings.vue'

// 定义组件名称（在 <script setup> 中可选）
defineOptions({
  name: 'ChatRoom'
})

// 定义 props
const props = defineProps({
  roomId: {
    type: String,
    default: null
  },
  targetUid: {
    type: String,
    default: null
  },
  isPrivateChat: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const chatroomStore = useChatroomStore()
const privateChatStore = usePrivateChatStore()
const { getUserInfo } = useUserInfo()
const roomId = computed(() => props.roomId || route.params.roomId)
const isPrivateChat = computed(() => props.isPrivateChat || false)
const targetUid = computed(() => props.targetUid || null)

// 私聊对象的用户信息
const targetUserInfo = ref(null)
const roomInfo = ref(null)
const newMessage = ref('')
const messageList = ref(null)
const messageInputComponent = ref(null)
const imageInput = ref(null)
const fileInput = ref(null)
const isLoading = ref(true)
const isJoining = ref(false)
const messages = reactive([])
const socket = ref(null)
const onlineUsers = ref([])
const temporaryNotifications = ref([])
const currentTime = ref(Date.now()) // 添加响应式时间变量

// 新增状态
const showRoomList = ref(true) // 桌面端默认显示
const showMemberList = ref(true) // 桌面端默认显示
const showLeaveConfirm = ref(false)
const isMobile = ref(false)
const joinedRooms = ref([])
const roomMembers = ref([])

// 删除消息确认弹窗状态
const deleteMessageDialog = ref({
  visible: false,
  targetMessage: null
})

// 回复状态
const replyState = ref({
  isReplying: false,
  targetMessage: null
})

// 使用右键菜单功能
const {
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
} = useContextMenu()
    
    // 计算属性
    const roomName = computed(() => {
      if (isPrivateChat.value) {
        const nickname = targetUserInfo.value?.nickname || targetUid.value
        return `与 ${nickname} 私聊`
      }
      return roomInfo.value?.name || '聊天室'
    })

// 右键菜单用户数据（需要包含头像URL和最新状态）
const contextMenuUser = computed(() => {
  if (!contextMenu.value.targetUser) return null
  
  // 从成员列表中找到最新的用户信息
  const memberInfo = roomMembers.value.find(m => m.uid === contextMenu.value.targetUser.uid)
  
  return {
    ...contextMenu.value.targetUser,
    ...memberInfo, // 合并最新的成员信息
    avatarUrl: getAvatarUrl(contextMenu.value.targetUser.avatarUrl || memberInfo?.avatarUrl)
  }
})

// 禁言弹窗用户数据（需要包含头像URL）
const muteDialogUser = computed(() => {
  if (!muteDialog.value.targetUser) return null
  return {
    ...muteDialog.value.targetUser,
    avatarUrl: getAvatarUrl(muteDialog.value.targetUser.avatarUrl)
  }
})

// 踢人弹窗用户数据（需要包含头像URL）
const kickDialogUser = computed(() => {
  if (!kickDialog.value.targetUser) return null
  return {
    ...kickDialog.value.targetUser,
    avatarUrl: getAvatarUrl(kickDialog.value.targetUser.avatarUrl)
  }
})
    
const userAvatarUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  if (!authStore.user?.avatarUrl) {
    return `${baseUrl}/avatars/default`
  }
  
  // 如果是完整URL，直接返回
  if (authStore.user.avatarUrl.startsWith('http') || authStore.user.avatarUrl.startsWith('data:')) {
    return authStore.user.avatarUrl
  }
  
  // 使用新的固定头像URL格式
  return `${baseUrl}${authStore.user.avatarUrl}`
})

const canSendMessage = computed(() => {
  if (!authStore.isAuthenticated) return false

// 检查用户的禁言状态（包括注册用户和匿名用户）
    if (authStore.user?.muteUntil) {
      const muteUntil = new Date(authStore.user.muteUntil)
      const now = new Date()
      return now >= muteUntil
    }

  return true
})

// 计算禁言剩余时间
const muteTimeRemaining = computed(() => {
if (!authStore.user?.muteUntil) return 0
  
  const muteUntil = new Date(authStore.user.muteUntil)
  const now = new Date(currentTime.value) // 使用响应式时间变量
  const remaining = muteUntil - now
  
  return Math.max(0, remaining)
})

// 格式化禁言剩余时间
const formatMuteTime = (milliseconds) => {
  if (milliseconds <= 0) return ''
  
  const totalSeconds = Math.ceil(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟${seconds}秒`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds}秒`
  } else {
    return `${seconds}秒`
  }
}

// 新增计算属性
const isCreator = computed(() => {
  return roomInfo.value?.creatorUid === authStore.user?.uid
})

const currentUserIsAdmin = computed(() => {
  const currentMember = roomMembers.value.find(member => member.uid === authStore.user?.uid)
  return currentMember?.isAdmin || false
})



// 处理连续消息的计算属性
const processedMessages = computed(() => {
  return messages.map((message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null
    
    // 系统消息不参与连续消息处理
    if (message.type === 'system') {
      return {
        ...message,
        isFirstInGroup: true,
        isLastInGroup: true,
        showAvatar: false,
        showHeader: false
      }
    }
    
    // 判断是否与前一条消息是同一用户的连续消息
    const isContinuous = prevMessage && 
      prevMessage.type !== 'system' &&
      prevMessage.userUid === message.userUid &&
      message.timestamp - prevMessage.timestamp < 300000 // 5分钟内算连续消息
    
    // 判断是否与后一条消息是同一用户的连续消息
    const isNextContinuous = nextMessage && 
      nextMessage.type !== 'system' &&
      nextMessage.userUid === message.userUid &&
      nextMessage.timestamp - message.timestamp < 300000 // 5分钟内算连续消息
    
    return {
      ...message,
      isFirstInGroup: !isContinuous,
      isLastInGroup: !isNextContinuous,
      showAvatar: !isContinuous,
      showHeader: !isContinuous || (message.type !== 'user' && message.type !== 'system')
    }
  })
})

// 验证聊天室是否存在
const validateChatroom = async () => {
  try {
    const response = await axios.get(`/api/chatrooms/${roomId.value}`)
    roomInfo.value = response.data.data
    return true
  } catch (error) {
    console.error('聊天室验证失败:', error)
    if (error.response?.status === 404) {
      notificationStore.error('聊天室不存在或已被关闭')
    } else {
      notificationStore.error('无法连接到聊天室')
    }
    return false
  }
}

// 消息分页状态
const messagesPagination = reactive({
  currentPage: 0,
  pageSize: 30,
  hasMore: true,
  isLoading: false
})

// 加载聊天室历史消息 - 重新设计为分页加载
const loadMessages = async (loadMore = false, scrollToMessageId = null) => {
  if (messagesPagination.isLoading || (!loadMore && messagesPagination.currentPage > 0)) {
    return
  }
  
  messagesPagination.isLoading = true
  
  try {
    const params = {
      limit: messagesPagination.pageSize,
      offset: messagesPagination.currentPage * messagesPagination.pageSize
    }
    
    let response
    if (isPrivateChat.value) {
      // 私聊模式：从私聊API获取消息
      // 直接使用 targetUid 作为参数，让后端处理会话查找
      try {
        response = await axios.get(`/api/private-chats/user/${targetUid.value}/messages`, { params })
      } catch (error) {
        // 如果没有现有会话，返回空消息列表
        if (error.response?.status === 404) {
          response = { data: { data: [] } }
        } else {
          throw error
        }
      }
    } else {
      // 聊天室模式：从聊天室API获取消息
      response = await axios.get(`/api/chatrooms/${roomId.value}/messages`, { params })
    }
    
    const messageData = response.data.data
    const messagesArray = Array.isArray(messageData) ? messageData : messageData.messages || []
    
    let processedMessages = messagesArray
    
    if (isPrivateChat.value) {
      // 私聊模式：直接处理消息
      processedMessages = messagesArray
    } else {
      // 聊天室模式：只过滤掉临时系统消息，保留持久系统消息
      processedMessages = messagesArray.filter(msg => 
        msg.messageType !== 'system' || 
        (msg.messageType === 'system' && msg.systemMessageType === 'persistent')
      )
    }
    
    // 检查是否有重复消息（防止重复加载）
    const existingIds = new Set(messages.map(m => m.id))
    const newMessages = processedMessages.filter(msg => {
      const messageId = isPrivateChat.value ? msg.messageId : msg.id
      return !existingIds.has(messageId)
    })
    
    const formattedMessages = newMessages.map(msg => {
      if (isPrivateChat.value) {
        // 私聊消息格式化
        const isOwn = msg.senderUid === authStore.user?.uid
        const displayName = isOwn 
          ? (authStore.user?.nickname || '我')
          : (targetUserInfo.value?.nickname || msg.senderUid)
        
        return {
          id: msg.messageId,
          type: msg.messageType === 'image' ? 'image' :
                msg.messageType === 'file' ? 'file' : 'user',
          userName: displayName,
          userUid: msg.senderUid,
          userAvatar: msg.senderUid === authStore.user?.uid ? authStore.user?.avatarUrl || '/avatars/default' : `/avatars/${msg.senderUid}`,
          text: msg.content,
          imageUrl: msg.imageUrl,
          fileId: msg.fileId,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          timestamp: msg.createdAt,
          isOwn: isOwn,
          isAdmin: false
        }
      } else {
        // 聊天室消息格式化
        return {
          id: msg.id,
          type: msg.messageType === 'system' ? 'system' : 
                msg.messageType === 'image' ? 'image' :
                msg.messageType === 'bilibili' ? 'bilibili' :
                msg.messageType === 'markdown' ? 'markdown' :
                msg.messageType === 'file' ? 'file' : 'user',
          userName: msg.user?.nickname || msg.nickname || '未知用户',
          userUid: msg.userUid || msg.sender_uid,
          userAvatar: msg.user?.avatarUrl || msg.avatar_url || '/avatars/default',
          text: msg.content,
          imageUrl: msg.imageUrl,
          bilibiliId: msg.bilibiliId,
          markdownContent: msg.markdownContent,
          fileId: msg.fileId,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          fileExpiry: msg.fileExpiry,
          fileExpired: msg.fileExpired,
          timestamp: msg.createdAt,
          isOwn: (msg.userUid || msg.sender_uid) === authStore.user?.uid,
          isAdmin: msg.user?.isAdmin || false,
          systemMessageType: msg.systemMessageType,
          visibilityScope: msg.visibilityScope,
          visibleToUsers: msg.visibleToUsers,
          replyToMessageId: msg.replyToMessageId,
          replyToMessage: msg.replyToMessage
        }
      }
    })
    
    if (loadMore) {
      // 加载更多时，将新消息插入到数组开头（保持时间顺序）
      // 后端已经按时间顺序返回（最早的在前面），所以直接插入
      messages.unshift(...formattedMessages)
    } else {
      // 首次加载，直接替换消息数组
      messages.splice(0, messages.length, ...formattedMessages)
    }
    
    // 更新分页状态
    messagesPagination.hasMore = formattedMessages.length === messagesPagination.pageSize
    messagesPagination.currentPage++
    
    // 首次加载时滚动到底部，加载更多时滚动到指定消息
    await nextTick()
    if (!loadMore) {
      scrollToBottom(false)
    } else if (scrollToMessageId) {
      // 滚动到指定消息（通常是加载前的第一条消息），不显示高亮效果
      scrollToMessage(scrollToMessageId, false)
    } else {
      // 加载更多后，保持滚动位置相对稳定
      maintainScrollPosition()
    }
    
  } catch (error) {
    console.error('加载消息失败:', error)
    notificationStore.error('加载聊天记录失败')
  } finally {
    messagesPagination.isLoading = false
  }
}

// 加载更多历史消息
const loadMoreMessages = async () => {
  if (!messagesPagination.hasMore || messagesPagination.isLoading) {
    return
  }
  
  // 记住当前第一条消息的ID，用于加载后定位
  const firstMessageId = messages.length > 0 ? messages[0].id : null
  
  await loadMessages(true, firstMessageId)
}

// 保持滚动位置（加载更多消息后使用）
const maintainScrollPosition = () => {
  if (messageList.value) {
    // 在加载更多历史消息后，我们希望用户保持在他们之前查看的位置
    // 由于我们使用了 flex-direction: column-reverse，滚动位置会自动保持合适的位置
    // 但为了确保稳定性，我们可以稍微调整一下
    const currentScrollTop = messageList.value.scrollTop
    
    // 如果用户在很靠近顶部的位置，给一个小的缓冲区
    if (currentScrollTop < 50) {
      messageList.value.scrollTop = 50
    }
  }
}



// 监听滚动事件，实现上拉加载更多
const handleScroll = () => {
  if (!messageList.value || messagesPagination.isLoading || !messagesPagination.hasMore) {
    return
  }
  
  const { scrollTop, scrollHeight, clientHeight } = messageList.value
  
  // 在 column-reverse 布局中：
  // - scrollTop = 0 时在底部（最新消息）
  // - scrollTop = 负数且接近 -(scrollHeight - clientHeight) 时在顶部（最旧消息）
  const maxNegativeScroll = -(scrollHeight - clientHeight)
  const distanceFromTop = Math.abs(scrollTop - maxNegativeScroll)
  
  // 当距离顶部小于100px时，加载更多历史消息
  if (distanceFromTop < 100) {
    loadMoreMessages()
  }
}

// 滚动到底部
const scrollToBottom = (smooth = true) => {
  if (messageList.value) {
    const scrollOptions = {
      top: messageList.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant'
    }
    messageList.value.scrollTo(scrollOptions)
  }
}

// 检查是否在底部附近
const isNearBottom = () => {
  if (!messageList.value) return true
  
  const { scrollTop } = messageList.value
  // 在 column-reverse 布局中，scrollTop 为 0 或接近 0 时表示在底部（最新消息处）
  return scrollTop < 50
}

// 选择图片
const selectImage = () => {
  if (imageInput.value) {
    imageInput.value.click()
  }
}

// 返回上一页（私聊模式）
const goBack = () => {
  router.go(-1)
}

// 处理图片选择
const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    sendImageMessage(file)
  }
  // 清空input的值，允许重复选择同一文件
  event.target.value = ''
}

// 处理粘贴事件
const handlePaste = (event) => {
  const items = event.clipboardData?.items
  if (!items) return
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.startsWith('image/')) {
      event.preventDefault()
      const file = item.getAsFile()
      if (file) {
        sendImageMessage(file)
      }
      break
    }
  }
}

// 图片压缩函数
const compressImage = async (file, maxSize = 1024 * 1024, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img
      const ratio = Math.min(1920 / width, 1080 / height) // 最大1920x1080
      
      if (ratio < 1) {
        width *= ratio
        height *= ratio
      }
      
      canvas.width = width
      canvas.height = height
      
      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为blob并检查大小
      canvas.toBlob((blob) => {
        if (blob.size <= maxSize) {
          resolve(blob)
        } else {
          // 如果还是太大，降低质量
          const newQuality = Math.max(0.1, quality - 0.1)
          if (newQuality >= 0.1) {
            canvas.toBlob((newBlob) => {
              resolve(newBlob)
            }, file.type, newQuality)
          } else {
            resolve(blob) // 已经是最低质量了
          }
        }
      }, file.type, quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// 上传进度状态
const uploadProgress = ref({
  visible: false,
  progress: 0,
  fileName: '',
  type: 'image' // 'image' or 'file'
})

// 显示上传进度
const showUploadProgress = (fileName, type = 'image') => {
  uploadProgress.value = {
    visible: true,
    progress: 0,
    fileName,
    type
  }
}

// 隐藏上传进度
const hideUploadProgress = () => {
  uploadProgress.value.visible = false
}

// 图片压缩确认对话框
const showImageCompressionDialog = (file) => {
  compressionDialog.value = {
    visible: true,
    fileName: file.name,
    fileSize: file.size,
    file: file,
    resolve: null
  }
}

// 处理压缩确认对话框事件
const handleCompressionConfirm = async () => {
  const file = compressionDialog.value.file
  compressionDialog.value.visible = false
  
  console.log('开始压缩和发送图片:', file?.name, file?.size)
  console.log('当前认证状态:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    canSendMessage: canSendMessage.value,
    roomId: roomId.value
  })
  
  if (!file) {
    console.error('没有找到要压缩的文件')
    return
  }
  
  // 检查是否可以发送消息
  if (!canSendMessage.value) {
    console.error('当前无法发送消息')
    console.error('详细状态:', {
      isAuthenticated: authStore.isAuthenticated,
      userMuteUntil: authStore.user?.muteUntil,
      currentTime: new Date().toISOString()
    })
    notificationStore.error('当前无法发送消息，请检查网络连接或权限')
    return
  }
  
  try {
    console.log('显示上传进度...')
    showUploadProgress(file.name, 'image')
    uploadProgress.value.progress = 30
    
    console.log('开始压缩图片...')
    const compressedBlob = await compressImage(file)
    let finalFile = new File([compressedBlob], file.name, { type: file.type })
    
    console.log('压缩完成，原始大小:', file.size, '压缩后大小:', finalFile.size)
    uploadProgress.value.progress = 60
    
    // 如果压缩后还是太大，继续尝试更高压缩
    const maxSize = 1024 * 1024
    if (finalFile.size > maxSize) {
      console.log('继续进行更高压缩...')
      const moreCompressed = await compressImage(file, maxSize, 0.3)
      finalFile = new File([moreCompressed], file.name, { type: file.type })
      console.log('二次压缩完成，大小:', finalFile.size)
    }
    
    if (finalFile.size > maxSize) {
      console.error('压缩后文件仍然过大:', finalFile.size)
      hideUploadProgress()
      notificationStore.error('图片压缩后仍然过大，请选择更小的图片')
      return
    }
    
    console.log('开始准备上传...')
    
    // 创建FormData
    const formData = new FormData()
    formData.append('image', finalFile)
    formData.append('roomId', roomId.value)
    formData.append('messageType', 'image')
    
    console.log('FormData准备完毕，文件名:', finalFile.name, '文件大小:', finalFile.size)
    
    // 如果是回复消息，添加回复信息
    if (replyState.value.isReplying && replyState.value.targetMessage) {
      formData.append('replyToMessageId', replyState.value.targetMessage.id)
      console.log('添加回复信息:', replyState.value.targetMessage.id)
    }
    
    // 验证FormData内容
    console.log('FormData内容检查:')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File(${value.name}, ${value.size})` : value)
    }
    
    uploadProgress.value.progress = 80
    
    console.log('开始上传图片到服务器...')
    console.log('请求URL:', `/api/chatrooms/${roomId.value}/messages/image`)
    console.log('请求基础URL:', axios.defaults.baseURL)
    console.log('完整请求URL:', `${axios.defaults.baseURL}/api/chatrooms/${roomId.value}/messages/image`)
    
    // 检查认证头
    console.log('认证头:', axios.defaults.headers.common['Authorization'])
    
    // 发送图片
    const response = await axios.post(`/api/chatrooms/${roomId.value}/messages/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          uploadProgress.value.progress = 80 + (progress * 0.2) // 80-100%
          console.log('上传进度:', uploadProgress.value.progress + '%')
        }
      }
    })
    
    console.log('图片上传成功:', response.data)
    uploadProgress.value.progress = 100
    
    // 图片发送成功，WebSocket会自动广播消息
    cancelReply() // 清除回复状态
    
    setTimeout(() => {
      hideUploadProgress()
    }, 500)
    
    // 等待WebSocket消息到达后滚动到底部
    setTimeout(() => {
      scrollToBottom(false)
    }, 100)
    
  } catch (error) {
    console.error('发送图片失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    hideUploadProgress()
    
    let errorMessage = '发送图片失败'
    if (error.response?.status === 413) {
      errorMessage = '图片太大，无法上传'
    } else if (error.response?.status === 403) {
      errorMessage = '没有权限发送图片'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    notificationStore.error(errorMessage)
  }
}

const handleCompressionCancel = () => {
  compressionDialog.value.visible = false
  if (compressionDialog.value.resolve) {
    compressionDialog.value.resolve(false)
  }
}

// 发送图片消息
const sendImageMessage = async (file, skipSizeCheck = false) => {
  if (!canSendMessage.value) return
  
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    notificationStore.error('只能发送图片文件')
    return
  }

  let finalFile = file
  
  // 检查文件大小（1MB = 1024 * 1024 bytes）
  const maxSize = 1024 * 1024
  if (file.size > maxSize && !skipSizeCheck) {
    // 显示压缩确认对话框
    showImageCompressionDialog(file)
    return // 对话框处理压缩和发送
  }
  
  try {
    if (!uploadProgress.value.visible) {
      showUploadProgress(finalFile.name, 'image')
    }
    
    // 创建FormData
    const formData = new FormData()
    formData.append('image', finalFile)
    
    // 如果是聊天室模式，添加roomId
    if (!isPrivateChat.value) {
      formData.append('roomId', roomId.value)
      formData.append('messageType', 'image')
    }
    
    // 如果是回复消息，添加回复信息
    if (replyState.value.isReplying && replyState.value.targetMessage) {
      formData.append('replyToMessageId', replyState.value.targetMessage.id)
    }
    
    uploadProgress.value.progress = 80
    
    let response
    
    if (isPrivateChat.value) {
      // 私聊模式：使用私聊图片API
      response = await axios.post(`/api/private-chats/${targetUid.value}/messages/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            uploadProgress.value.progress = 80 + (progress * 0.2) // 80-100%
          }
        }
      })
      
      // 私聊模式下手动添加消息到本地列表
      const msg = response.data.data
      messages.push({
        id: msg.messageId,
        type: 'user',
        userName: authStore.user?.nickname || '我',
        userUid: msg.senderUid,
        userAvatar: authStore.user?.avatarUrl || '/avatars/default',
        text: msg.content, // 图片URL
        messageType: 'image',
        timestamp: msg.createdAt,
        isOwn: true,
        isAdmin: false
      })
    } else {
      // 聊天室模式：使用聊天室图片API
      response = await axios.post(`/api/chatrooms/${roomId.value}/messages/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            uploadProgress.value.progress = 80 + (progress * 0.2) // 80-100%
          }
        }
      })
    }
    
    uploadProgress.value.progress = 100
    
    // 图片发送成功
    cancelReply() // 清除回复状态
    
    setTimeout(() => {
      hideUploadProgress()
    }, 500)
    
    // 滚动到底部
    await nextTick()
    setTimeout(() => {
      scrollToBottom(false)
    }, 100)

  } catch (error) {
    console.error('发送图片失败:', error)
    hideUploadProgress()
    
    let errorMessage = '发送图片失败'
    if (error.response?.status === 413) {
      errorMessage = '图片文件过大'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    notificationStore.error(errorMessage)
  }
}

// 处理来自MessageInput组件的发送消息事件
const handleSendMessage = async (messageText) => {
  if (!messageText.trim() || !canSendMessage.value) return
  
  // 设置消息内容
  newMessage.value = messageText
  
  // 调用现有的发送消息逻辑
  await sendMessage()
}

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim() || !canSendMessage.value) return
  
  if (isPrivateChat.value) {
    // 私聊模式：使用私聊API发送消息
    try {
      const messageData = {
        content: newMessage.value.trim(),
        messageType: 'text'
      }
      
      const response = await axios.post(`/api/private-chats/${targetUid.value}/messages`, messageData)
      const msg = response.data.data
      
      // 添加消息到本地消息列表
      messages.push({
        id: msg.messageId,
        type: 'user',
        userName: authStore.user?.nickname || '我',
        userUid: msg.senderUid,
        userAvatar: authStore.user?.avatarUrl || '/avatars/default',
        text: msg.content,
        timestamp: msg.createdAt,
        isOwn: true,
        isAdmin: false
      })
      
      newMessage.value = ''
      await nextTick()
      scrollToBottom(false)
      
    } catch (error) {
      console.error('发送私聊消息失败:', error)
      notificationStore.error('发送消息失败: ' + (error.response?.data?.message || error.message))
    }
    return
  }
  
  // 聊天室模式：原有逻辑
  // 准备消息数据
  const messageData = {
    roomId: roomId.value,
    content: newMessage.value.trim(),
    messageType: 'text'
  }
  
  // 如果是回复消息，添加回复信息
  if (replyState.value.isReplying && replyState.value.targetMessage) {
    messageData.replyToMessageId = replyState.value.targetMessage.id
  }
  
  if (socket.value && socket.value.connected) {
    // 使用WebSocket发送消息
    socket.value.emit('send-message', messageData)
    
    newMessage.value = ''
    cancelReply() // 清除回复状态
  } else {
    // 如果WebSocket未连接，使用HTTP API作为备选
    try {
      const httpData = {
        content: newMessage.value.trim(),
        messageType: 'text'
      }
      
      // 如果是回复消息，添加回复信息
      if (replyState.value.isReplying && replyState.value.targetMessage) {
        httpData.replyToMessageId = replyState.value.targetMessage.id
      }
      
      const response = await axios.post(`/api/chatrooms/${roomId.value}/messages`, httpData)
      
      const msg = response.data.data
      
      // 处理用户消息和持久系统消息
      if (msg.messageType !== 'system' || msg.systemMessageType === 'persistent') {
        messages.push({
          id: msg.id,
          type: msg.messageType === 'system' ? 'system' : 'user',
          userName: msg.user?.nickname || authStore.user?.nickname || '未知用户',
          userUid: msg.userUid || msg.sender_uid,
          userAvatar: msg.user?.avatarUrl || authStore.user?.avatarUrl || '/avatars/default',
          text: msg.content,
          timestamp: msg.createdAt,
          isOwn: true,
          isAdmin: msg.user?.isAdmin || false,
          systemMessageType: msg.systemMessageType,
          visibilityScope: msg.visibilityScope,
          visibleToUsers: msg.visibleToUsers,
          replyToMessageId: msg.replyToMessageId,
          replyToMessage: msg.replyToMessage
        })
      }
      
      newMessage.value = ''
      cancelReply() // 清除回复状态
      await nextTick()
      scrollToBottom(false) // 发送消息后立即滚动到底部，不使用平滑滚动
      
    } catch (error) {
      console.error('发送消息失败:', error)
      notificationStore.error('发送消息失败: ' + (error.response?.data?.message || error.message))
    }
  }
}

// 获取头像URL
const getAvatarUrl = (avatarPath) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  if (!avatarPath) {
    return `${baseUrl}/avatars/default`
  }
  
  // 如果是完整URL，直接返回
  if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
    return avatarPath
  }
  
  // 使用新的固定头像URL格式
  return `${baseUrl}${avatarPath}`
}

// 获取图片URL
const getImageUrl = (imagePath) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  
  if (!imagePath) {
    return ''
  }
  
  // 如果是完整URL，直接返回
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath
  }
  
  // 拼接完整URL
  return `${baseUrl}${imagePath}`
}

// 图片预览状态
const imagePreview = ref({
  visible: false,
  imageUrl: '',
  title: ''
})

// 扩展消息类型对话框状态
const messageTypeDialog = ref({
  visible: false
})

const bilibiliDialog = ref({
  visible: false
})

const markdownDialog = ref({
  visible: false
})

// 房间名称编辑弹窗状态
const roomNameDialog = ref({
  visible: false
})

// 图片压缩确认对话框状态
const compressionDialog = ref({
  visible: false,
  fileName: '',
  fileSize: 0,
  file: null,
  resolve: null
})

// 打开图片预览
const openImagePreview = (imageUrl, title = '') => {
  imagePreview.value = {
    visible: true,
    imageUrl: getImageUrl(imageUrl),
    title: title || '图片预览'
  }
}

// 关闭图片预览
const closeImagePreview = () => {
  imagePreview.value = {
    visible: false,
    imageUrl: '',
    title: ''
  }
}

// 显示消息类型选择器
const showMessageTypeSelector = () => {
  messageTypeDialog.value.visible = true
}

// 关闭消息类型选择器
const closeMessageTypeSelector = () => {
  messageTypeDialog.value.visible = false
}

// 处理消息类型选择
const handleMessageTypeSelect = (type) => {
  if (type === 'bilibili') {
    bilibiliDialog.value.visible = true
  } else if (type === 'markdown') {
    markdownDialog.value.visible = true
  } else if (type === 'file') {
    selectFile()
  }
}

// 选择文件
const selectFile = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    console.log('选择文件:', {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
    })
    sendFileMessage(file)
  }
  // 清空input的值，允许重复选择同一文件
  event.target.value = ''
}

// 检查文件是否为图片
const isImageFile = (file) => {
  return file.type && file.type.startsWith('image/')
}

// 发送文件消息
const sendFileMessage = async (file) => {
  console.log('开始发送文件消息:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    canSendMessage: canSendMessage.value,
    isImage: isImageFile(file)
  })
  
  if (!canSendMessage.value) {
    const errorMessage = '当前无法发送文件，请检查权限'
    console.log('无法发送消息，权限检查失败')
    notificationStore.error(errorMessage)
    return
  }
  
  // 如果是图片文件，使用图片发送方式
  if (isImageFile(file)) {
    console.log('检测到图片文件，使用图片发送方式')
    await sendImageMessage(file)
    return
  }
  
  // 检查文件大小（2MB = 2 * 1024 * 1024 bytes）
  const maxSize = 2 * 1024 * 1024
  console.log('检查文件大小:', {
    fileSize: file.size,
    maxSize: maxSize,
    sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
    maxSizeInMB: (maxSize / (1024 * 1024)).toFixed(2),
    isOverLimit: file.size > maxSize
  })
  
  if (file.size > maxSize) {
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2)
    const errorMessage = `文件大小超出限制：${fileSizeInMB}MB，最大允许2MB`
    console.error('文件大小超出限制:', fileSizeInMB + 'MB > 2MB')
    
    // 显示通知
    notificationStore.error(errorMessage)
    
    return
  }
  
  // 如果文件为空或无效
  if (!file || file.size === 0) {
    const errorMessage = '选择的文件无效或为空'
    console.error('文件无效或为空')
    notificationStore.error(errorMessage)
    return
  }
  
  try {
    console.log('开始上传文件...')
    showUploadProgress(file.name, 'file')
    
    // 第一步：上传文件到服务器
    const formData = new FormData()
    formData.append('file', file)
    formData.append('chatroomId', roomId.value)
    
    // 如果是回复消息，添加回复信息
    if (replyState.value.isReplying && replyState.value.targetMessage) {
      formData.append('replyToMessageId', replyState.value.targetMessage.id)
    }
    
    uploadProgress.value.progress = 20
    
    console.log('发送上传请求到服务器...')
    // 上传文件
    const uploadResponse = await axios.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          uploadProgress.value.progress = 20 + (progress * 0.6) // 20-80%
          console.log('上传进度:', uploadProgress.value.progress + '%')
        }
      }
    })
    
    console.log('文件上传响应:', uploadResponse.data)
    const { fileId, fileName, fileSize, expiryTime } = uploadResponse.data.data
    
    uploadProgress.value.progress = 90
    
    console.log('发送文件消息到聊天室...')
    // 第二步：发送文件消息
    const messageResponse = await axios.post(`/api/chatrooms/${roomId.value}/messages/file`, {
      fileId,
      fileName,
      fileSize,
      replyToMessageId: replyState.value.isReplying ? replyState.value.targetMessage.id : undefined
    })
    
    console.log('文件消息发送成功:', messageResponse.data)
    uploadProgress.value.progress = 100
    
    // 文件发送成功，WebSocket会自动广播消息
    cancelReply() // 清除回复状态
    
    setTimeout(() => {
      hideUploadProgress()
    }, 500)
    
    // 等待WebSocket消息到达后滚动到底部
    setTimeout(() => {
      scrollToBottom(false)
    }, 100)
    
  } catch (error) {
    console.error('发送文件失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      fileName: file.name,
      fileSize: file.size
    })
    hideUploadProgress()
    
    let errorMessage = '发送文件失败'
    if (error.response?.status === 413) {
      errorMessage = `文件过大：${(file.size / (1024 * 1024)).toFixed(2)}MB，请选择小于2MB的文件`
    } else if (error.response?.status === 403) {
      errorMessage = '没有权限上传文件'
    } else if (error.response?.status === 400 && error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    console.error('最终错误消息:', errorMessage)
    notificationStore.error(errorMessage)
  }
}

// 获取文件图标
const getFileIcon = (fileName) => {
  if (!fileName) return 'fas fa-file'
  
  const extension = fileName.split('.').pop()?.toLowerCase()
  const iconMap = {
    // 图片
    'jpg': 'fas fa-file-image',
    'jpeg': 'fas fa-file-image',
    'png': 'fas fa-file-image',
    'gif': 'fas fa-file-image',
    'bmp': 'fas fa-file-image',
    'webp': 'fas fa-file-image',
    'svg': 'fas fa-file-image',
    
    // 文档
    'pdf': 'fas fa-file-pdf',
    'doc': 'fas fa-file-word',
    'docx': 'fas fa-file-word',
    'txt': 'fas fa-file-alt',
    'rtf': 'fas fa-file-alt',
    
    // 表格
    'xls': 'fas fa-file-excel',
    'xlsx': 'fas fa-file-excel',
    'csv': 'fas fa-file-csv',
    
    // 演示文稿
    'ppt': 'fas fa-file-powerpoint',
    'pptx': 'fas fa-file-powerpoint',
    
    // 压缩文件
    'zip': 'fas fa-file-archive',
    'rar': 'fas fa-file-archive',
    '7z': 'fas fa-file-archive',
    'tar': 'fas fa-file-archive',
    'gz': 'fas fa-file-archive',
    
    // 音频
    'mp3': 'fas fa-file-audio',
    'wav': 'fas fa-file-audio',
    'flac': 'fas fa-file-audio',
    'aac': 'fas fa-file-audio',
    
    // 视频
    'mp4': 'fas fa-file-video',
    'avi': 'fas fa-file-video',
    'mkv': 'fas fa-file-video',
    'wmv': 'fas fa-file-video',
    'mov': 'fas fa-file-video',
    
    // 代码
    'js': 'fas fa-file-code',
    'html': 'fas fa-file-code',
    'css': 'fas fa-file-code',
    'php': 'fas fa-file-code',
    'py': 'fas fa-file-code',
    'java': 'fas fa-file-code',
    'cpp': 'fas fa-file-code',
    'c': 'fas fa-file-code',
    'vue': 'fas fa-file-code',
    'json': 'fas fa-file-code'
  }
  
  return iconMap[extension] || 'fas fa-file'
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// 格式化文件过期时间
const formatFileExpiry = (expiry) => {
  if (!expiry) return ''
  
  const expiryDate = new Date(expiry)
  const now = new Date()
  const diffMs = expiryDate - now
  
  if (diffMs <= 0) return '已过期'
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  
  if (diffHours > 0) {
    return `${diffHours}小时${diffMinutes % 60}分钟后过期`
  } else {
    return `${diffMinutes}分钟后过期`
  }
}

// 下载文件
const downloadFile = async (fileId, fileName) => {
  try {
    // 使用GET请求下载文件
    const response = await axios.get(`/api/files/download/${fileId}`, {
      responseType: 'blob'
    })
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    // 清理URL对象
    window.URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('下载文件失败:', error)
    if (error.response?.status === 404) {
      notificationStore.error('文件已过期或不存在')
    } else if (error.response?.status === 410) {
      notificationStore.error('文件已过期')
    } else {
      notificationStore.error('下载失败: ' + (error.response?.data?.message || error.message))
    }
  }
}

// B站视频对话框处理
const closeBilibiliDialog = () => {
  bilibiliDialog.value.visible = false
}

const handleBilibiliSubmit = async (data) => {
  try {
    const response = await axios.post(`/api/chatrooms/${roomId.value}/messages/bilibili`, {
      bilibiliId: data.bilibiliId,
      replyToMessageId: replyState.value.isReplying ? replyState.value.targetMessage.id : undefined
    })

    cancelReply() // 清除回复状态
    bilibiliDialog.value.visible = false
    
    // 等待WebSocket消息到达后滚动到底部
    setTimeout(() => {
      scrollToBottom(false)
    }, 100)

  } catch (error) {
    console.error('发送B站视频失败:', error)
    notificationStore.error('发送B站视频失败: ' + (error.response?.data?.message || error.message))
  }
}

// Markdown对话框处理
const closeMarkdownDialog = () => {
  markdownDialog.value.visible = false
}

const handleMarkdownSubmit = async (data) => {
  try {
    const response = await axios.post(`/api/chatrooms/${roomId.value}/messages/markdown`, {
      markdownContent: data.markdownContent,
      title: data.title,
      replyToMessageId: replyState.value.isReplying ? replyState.value.targetMessage.id : undefined
    })

    cancelReply() // 清除回复状态
    markdownDialog.value.visible = false
    
    // 等待WebSocket消息到达后滚动到底部
    setTimeout(() => {
      scrollToBottom(false)
    }, 100)

  } catch (error) {
    console.error('发送Markdown内容失败:', error)
    notificationStore.error('发送Markdown内容失败: ' + (error.response?.data?.message || error.message))
  }
}

// 房间名称编辑相关方法
const showRoomNameDialog = () => {
  if (!isCreator.value) {
    notificationStore.error('只有房间创建者可以修改房间名称')
    return
  }
  roomNameDialog.value.visible = true
}

const closeRoomNameDialog = () => {
  roomNameDialog.value.visible = false
}

const handleRoomNameUpdate = async (newName) => {
  try {
    await chatroomStore.updateRoomName(roomId.value, newName)
    
    // 更新本地房间信息
    if (roomInfo.value) {
      roomInfo.value.name = newName
    }
    
    notificationStore.success('房间名称修改成功')
    closeRoomNameDialog()
    
    // 通过WebSocket通知其他用户房间名称已更改
    if (socket.value && socket.value.connected) {
      socket.value.emit('room-name-updated', {
        roomId: roomId.value,
        newName: newName
      })
    }
    
  } catch (error) {
    console.error('修改房间名称失败:', error)
    notificationStore.error('修改房间名称失败: ' + (error.response?.data?.message || error.message))
  }
}

// 处理图片加载错误
const handleImageError = (event) => {
  // 避免无限循环，如果已经是默认图片则不再重试
  if (event.target.src.includes('avatars/default') || event.target.dataset.errorHandled) {
    event.target.style.display = 'none'
    return
  }
  
  event.target.dataset.errorHandled = 'true'
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  event.target.src = `${baseUrl}/avatars/default`
  event.target.alt = '图片加载失败'
}

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true,
  sanitize: false
})

// 处理markdown中的图片点击事件
const handleMarkdownImageClick = (event) => {
  const img = event.target
  if (img.tagName === 'IMG' && img.classList.contains('markdown-image')) {
    event.preventDefault()
    // 优先使用原始URL，如果没有则使用src
    const imageUrl = img.dataset.originalSrc || img.src
    const imageTitle = img.alt || img.title || '图片预览'
    
    console.log('点击markdown图片:', { imageUrl, imageTitle })
    openImagePreview(imageUrl, imageTitle)
  }
}

// 使用marked库渲染Markdown内容
const renderMarkdown = (content) => {
  if (!content) return ''
  
  try {
    // 配置marked渲染器
    const renderer = new marked.Renderer()
    
    // 自定义图片渲染
    renderer.image = function(href, title, text) {
      // 确保href是字符串
      const imageUrl = typeof href === 'string' ? href : (href?.href || href?.url || '')
      
      if (!imageUrl) {
        return `<span style="color: #dc3545; font-style: italic;">图片链接无效</span>`
      }
      
      // 安全地处理title和alt属性
      const safeTitle = title ? title.replace(/"/g, '&quot;') : ''
      const safeAlt = text ? text.replace(/"/g, '&quot;') : ''
      const titleAttr = safeTitle ? ` title="${safeTitle}"` : ''
      const altAttr = safeAlt ? ` alt="${safeAlt}"` : ''
      
      return `<img src="${imageUrl}" data-original-src="${imageUrl}"${titleAttr}${altAttr} class="markdown-image" style="max-width: 100%; height: auto; cursor: pointer; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">`
    }
    
    return marked(content, { renderer })
  } catch (error) {
    console.error('Markdown解析错误:', error)
    return '<p style="color: red;">Markdown解析错误</p>'
  }
}

// 添加临时通知
const addTemporaryNotification = (message, type = 'info') => {
  const notification = {
    id: Date.now() + Math.random(),
    message,
    type,
    timestamp: new Date()
  }
  
  temporaryNotifications.value.push(notification)
  
  // 3秒后自动移除
  setTimeout(() => {
    const index = temporaryNotifications.value.findIndex(n => n.id === notification.id)
    if (index > -1) {
      temporaryNotifications.value.splice(index, 1)
    }
  }, 3000)
  
  // 最多保留5条通知
  if (temporaryNotifications.value.length > 5) {
    temporaryNotifications.value.shift()
  }
}

// 获取通知图标
const getNotificationIcon = (type) => {
  const icons = {
    join: 'fas fa-user-plus',
    leave: 'fas fa-user-minus',
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle',
    error: 'fas fa-times-circle'
  }
  return icons[type] || icons.info
}

// 格式化时间
const formatTime = (timestamp) => {
  // 确保timestamp是数字类型
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  const date = new Date(time)
  
  // 检查是否是有效日期
  if (isNaN(date.getTime())) {
    return '时间错误'
  }
  
  const now = new Date()
  const diff = now - date
  
  // 如果是今天的消息，显示时间
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  // 如果是昨天或更早，显示日期和时间
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 连接WebSocket
const connectWebSocket = () => {
  if (!authStore.token) {
    console.error('无法连接WebSocket：缺少认证令牌')
    return
  }
  
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
  const corsConfig = getWebSocketCorsConfig()
  
  socket.value = io(socketUrl, {
    auth: {
      token: authStore.token
    },
    transports: ['websocket', 'polling'],
    // 应用CORS配置
    withCredentials: corsConfig.credentials,
    extraHeaders: {
      'Origin': window.location.origin
    }
  })
  
  // 连接成功
  socket.value.on('connect', () => {
    console.log('WebSocket连接成功')
    addTemporaryNotification('已连接到实时聊天', 'info')
    // 加入聊天室
    socket.value.emit('join-room', { roomId: roomId.value })
  })
  
  // 连接错误
  socket.value.on('connect_error', (error) => {
    console.error('WebSocket连接失败:', error)
    addTemporaryNotification('实时连接失败，消息可能延迟', 'error')
  })
  
  // 断开连接
  socket.value.on('disconnect', (reason) => {
    console.log('WebSocket连接断开:', reason)
    if (reason !== 'io client disconnect') {
      addTemporaryNotification('连接已断开，正在重连...', 'warning')
    }
  })
  
  // 重连成功
  socket.value.on('reconnect', () => {
    console.log('WebSocket重连成功')
    addTemporaryNotification('重连成功', 'info')
  })
  
  // 加入房间成功
  socket.value.on('room-joined', (data) => {
    console.log('成功加入房间:', data)
    onlineUsers.value = data.onlineUsers || []
    addTemporaryNotification(`已加入聊天室，当前在线 ${data.onlineUsers?.length || 0} 人`, 'info')
    
    // 重新加载成员列表
    loadRoomMembers()
  })

  // 房间名称更新
  socket.value.on('room-name-updated', (data) => {
    console.log('房间名称已更新:', data)
    
    // 更新本地房间信息
    if (roomInfo.value) {
      roomInfo.value.name = data.newName
    }
    
    // 显示通知
    if (data.updatedBy !== authStore.user?.uid) {
      addTemporaryNotification(`房间名称已更改为: ${data.newName}`, 'info')
    }
  })
  
  // 新消息
  socket.value.on('new-message', (messageData) => {
    console.log('收到新消息:', messageData)
    
    // 如果是临时系统消息，通过临时通知显示
    if (messageData.messageType === 'system' && messageData.systemMessageType === 'temporary') {
      addTemporaryNotification(messageData.content, 'info')
      return
    }
    
    // 处理用户消息和持久系统消息
    const newMessage = {
      id: messageData.id,
      type: messageData.messageType === 'system' ? 'system' : 
            messageData.messageType === 'image' ? 'image' :
            messageData.messageType === 'bilibili' ? 'bilibili' :
            messageData.messageType === 'markdown' ? 'markdown' :
            messageData.messageType === 'file' ? 'file' : 'user',
      userName: messageData.user?.nickname || messageData.userName || '未知用户',
      userUid: messageData.userUid || messageData.sender_uid,
      userAvatar: messageData.user?.avatarUrl || messageData.userAvatar || '/avatars/default',
      text: messageData.content,
      imageUrl: messageData.imageUrl,
      bilibiliId: messageData.bilibiliId,
      markdownContent: messageData.markdownContent,
      fileId: messageData.fileId,
      fileName: messageData.fileName,
      fileSize: messageData.fileSize,
      fileExpiry: messageData.fileExpiry,
      fileExpired: messageData.fileExpired,
      timestamp: messageData.createdAt,
      isOwn: messageData.userUid === authStore.user?.uid,
      isAdmin: messageData.user?.isAdmin || false,
      systemMessageType: messageData.systemMessageType,
      visibilityScope: messageData.visibilityScope,
      visibleToUsers: messageData.visibleToUsers,
      replyToMessageId: messageData.replyToMessageId,
      replyToMessage: messageData.replyToMessage
    }
    
    // 记录用户是否在底部附近
    const wasNearBottom = isNearBottom()
    
    messages.push(newMessage)
    
    nextTick(() => {
      // 只有在用户在底部附近或者是自己发送的消息时才自动滚动到底部
      if (wasNearBottom || newMessage.isOwn) {
        scrollToBottom()
      }
    })
  })
  
  // 用户加入/离开
  socket.value.on('user-joined', (data) => {
    console.log('用户加入:', data)
    onlineUsers.value = data.onlineUsers || []
    
    // 显示临时通知而不是聊天消息
    if (data.user && data.user.uid !== authStore.user?.uid) {
      addTemporaryNotification(`${data.user.nickname} 加入了聊天室`, 'join')
    }
    
    // 重新加载成员列表
    loadRoomMembers()
  })
  
  socket.value.on('user-left', (data) => {
    console.log('用户离开:', data)
    onlineUsers.value = data.onlineUsers || []
    
    // 显示临时通知而不是聊天消息
    if (data.user && data.user.uid !== authStore.user?.uid) {
      addTemporaryNotification(`${data.user.nickname} 离开了聊天室`, 'leave')
    }
    
    // 重新加载成员列表
    loadRoomMembers()
  })
  
  // 在线用户列表更新
  socket.value.on('online-users', (data) => {
    onlineUsers.value = data.users || []
  })
  
  // 聊天室被解散
  socket.value.on('room-dissolved', (data) => {
    console.log('聊天室被解散:', data)
    addTemporaryNotification(data.message, 'warning')
    
    // 3秒后自动跳转到首页
    setTimeout(() => {
      notificationStore.error('聊天室已被解散，正在返回首页...')
      router.push({ name: 'Home' })
    }, 3000)
  })

// 用户被踢出
socket.value.on('user-kicked', (data) => {
console.log('用户被踢出事件:', data)

if (data.kickedUid === authStore.user?.uid) {
  // 当前用户被踢出
  addTemporaryNotification('您已被移出聊天室', 'warning')
  setTimeout(() => {
    notificationStore.error('您已被移出聊天室')
    router.push({ name: 'RoomSelect' })
  }, 2000)
} else {
  // 其他用户被踢出，直接显示离开消息，避免重复
  const kickedUser = data.kickedUser || { nickname: '用户' }
  addTemporaryNotification(`${kickedUser.nickname} 离开了聊天室`, 'leave')
  
  // 更新在线用户列表
  onlineUsers.value = onlineUsers.value.filter(user => user.uid !== data.kickedUid)
  
  // 重新加载成员列表
  loadRoomMembers()
}
})

    // 用户被禁言/解除禁言
  socket.value.on('user-muted', (data) => {
    console.log('用户禁言状态变化:', data)
    
    if (data.targetUid === authStore.user?.uid) {
      // 当前用户被禁言或解除禁言
      if (data.isMuted) {
        authStore.user.muteUntil = data.muteUntil
        addTemporaryNotification(`您已被禁言，${data.duration}分钟后可以发言`, 'warning')
      } else {
        authStore.user.muteUntil = null
        addTemporaryNotification('您的禁言已被解除', 'info')
      }
    }
    
    // 更新成员列表中的禁言状态
    const member = roomMembers.value.find(m => m.uid === data.targetUid)
    if (member) {
      member.isMuted = data.isMuted
      member.muteUntil = data.isMuted ? data.muteUntil : null
    }
  })

  // 消息被删除
  socket.value.on('message-deleted', (data) => {
    console.log('消息被删除:', data)
    
    // 找到要删除的消息
    const messageIndex = messages.findIndex(msg => msg.id === data.messageId)
    if (messageIndex > -1) {
      const message = messages[messageIndex]
      
      // 先添加删除动画状态
      message.isDeleting = true
      
      // 延迟删除，让动画播放完成
      setTimeout(() => {
        const currentIndex = messages.findIndex(msg => msg.id === data.messageId)
        if (currentIndex > -1) {
          messages.splice(currentIndex, 1)
        }
      }, 300) // 动画持续时间
      
      // 如果删除的不是当前用户的消息，显示通知
      if (data.deletedBy !== authStore.user?.uid) {
        addTemporaryNotification('有消息被删除', 'info')
      }
    }
  })
}

// 断开WebSocket连接
const disconnectWebSocket = () => {
  if (socket.value) {
    socket.value.disconnect()
    socket.value = null
  }
}

// 离开房间
const leaveRoom = () => {
  disconnectWebSocket()
  router.push({ name: 'Home' })
}

// 初始化私聊
const initializePrivateChat = async () => {
  isLoading.value = true
  
  try {
    // 等待认证状态初始化完成
    if (!authStore.isInitialized) {
      await authStore.initialize()
    }
    
    // 检查用户是否已登录
    if (!authStore.isAuthenticated) {
      notificationStore.error('请先登录')
      router.push({ name: 'Home' })
      return
    }
    
    // 验证目标用户是否有效
    if (!targetUid.value) {
      notificationStore.error('无效的私聊对象')
      router.push({ name: 'Dashboard' })
      return
    }
    
    // 加载目标用户信息
    try {
      targetUserInfo.value = await getUserInfo(targetUid.value)
    } catch (error) {
      console.error('加载目标用户信息失败:', error)
    }
    
    // 加载私聊历史消息
    await loadMessages()
    
    // 私聊不需要连接WebSocket，使用轮询或其他方式获取新消息
    // 这里可以根据需要实现消息更新机制
    
  } catch (error) {
    console.error('初始化私聊失败:', error)
    notificationStore.error('初始化私聊失败')
    router.push({ name: 'Dashboard' })
  } finally {
    isLoading.value = false
  }
}

// 初始化聊天室
const initializeChatroom = async () => {
  isLoading.value = true
  
  try {
    // 等待认证状态初始化完成
    if (!authStore.isInitialized) {
      await authStore.initialize()
    }
    
    // 检查用户是否已登录
    if (!authStore.isAuthenticated) {
      notificationStore.error('请先登录')
      router.push({ name: 'Home' })
      return
    }
    
    // 验证聊天室是否存在
    const isValid = await validateChatroom()
    if (!isValid) {
      router.push({ name: 'RoomSelect' })
      return
    }
    
    // 加载历史消息
    await loadMessages()
    
    // 连接WebSocket
    connectWebSocket()
    
  } catch (error) {
    console.error('初始化聊天室失败:', error)
    notificationStore.error('初始化聊天室失败')
    router.push({ name: 'RoomSelect' })
  } finally {
    isLoading.value = false
  }
}

// 禁言倒计时定时器
const muteTimer = ref(null)

// 启动禁言倒计时
const startMuteTimer = () => {
  if (muteTimer.value) {
    clearInterval(muteTimer.value)
  }
  
if (muteTimeRemaining.value > 0) {
    muteTimer.value = setInterval(() => {
      // 更新当前时间，触发计算属性重新计算
      currentTime.value = Date.now()
      
      // 如果禁言时间结束则清除定时器
      if (muteTimeRemaining.value <= 0) {
        clearInterval(muteTimer.value)
        muteTimer.value = null
        addTemporaryNotification('禁言时间已结束，现在可以发言了！', 'info')
      }
    }, 1000)
  }
}

// 监听认证状态变化，重新启动倒计时
watch(
() => authStore.user?.muteUntil,
  () => {
    startMuteTimer()
  },
  { immediate: false }
)

// 监听在线用户变化，更新成员列表状态
watch(
  () => onlineUsers.value,
  (newOnlineUsers) => {
    if (roomMembers.value.length > 0) {
      roomMembers.value = roomMembers.value.map(member => ({
        ...member,
        status: member.uid === authStore.user?.uid ? 'online' : 
                newOnlineUsers.some(u => u.uid === member.uid) ? 'online' : 
                member.status === 'left' ? 'left' : 'offline'
      }))
    }
  },
  { deep: true }
)

// 生命周期 (已合并到后面的onMounted中)

onUnmounted(() => {
  disconnectWebSocket()
  if (muteTimer.value) {
    clearInterval(muteTimer.value)
  }
})

// 新增方法
// 检测移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    showRoomList.value = false
    showMemberList.value = false
  } else {
    showRoomList.value = true
    showMemberList.value = true
  }
}

// 切换房间列表显示
const toggleRoomList = () => {
  showRoomList.value = !showRoomList.value
}

// 切换成员列表显示
const toggleMemberList = () => {
  showMemberList.value = !showMemberList.value
}

// 关闭移动端侧边栏
const closeMobileSidebars = () => {
  if (isMobile.value) {
    showRoomList.value = false
    showMemberList.value = false
  }
}

// 返回首页
const goHome = () => {
  router.push({ name: 'Home' })
}

// 跳转到加入聊天页面
const goToRoomSelect = () => {
  router.push({ name: 'RoomSelect' })
}

// 切换房间
const switchRoom = (newRoomId) => {
  if (newRoomId !== roomId.value) {
    router.push({ name: 'ChatRoom', params: { roomId: newRoomId } })
  }
}

// 处理房间设置
const handleRoomSettings = (room) => {
  // 触发房间名称编辑对话框
  showRoomNameDialog()
}

// 处理用户设置
const handleUserProfile = () => {
  // 跳转到个人设置页面
  router.push({ name: 'Profile' })
}

// 处理当前房间设置
const handleCurrentRoomSettings = () => {
  // 触发房间名称编辑对话框
  showRoomNameDialog()
}

// 处理离开特定房间
const handleLeaveSpecificRoom = (room) => {
  if (room.roomId === roomId.value) {
    // 如果是当前房间，使用现有的确认对话框
    confirmLeaveRoom()
  } else {
    // 如果是其他房间，直接离开
    leaveSpecificRoom(room.roomId)
  }
}

// 离开特定房间
const leaveSpecificRoom = async (targetRoomId) => {
  try {
    await axios.post(`/api/chatrooms/${targetRoomId}/leave`)
    notificationStore.success('已退出房间')
    
    // 刷新房间列表
    await loadJoinedRooms()
  } catch (error) {
    console.error('退出房间失败:', error)
    notificationStore.error('退出失败: ' + (error.response?.data?.message || error.message))
  }
}

// 确认退出房间
const confirmLeaveRoom = () => {
  showLeaveConfirm.value = true
}

// 取消退出
const cancelLeave = () => {
  showLeaveConfirm.value = false
}

// 确认退出/解散
const confirmLeave = async () => {
  showLeaveConfirm.value = false
  
  try {
    if (isCreator.value) {
      // 房主解散房间
      await axios.delete(`/api/chatrooms/${roomId.value}`)
      notificationStore.success('房间已解散')
    } else {
      // 普通用户退出房间
      await axios.post(`/api/chatrooms/${roomId.value}/leave`)
      notificationStore.success('已退出房间')
    }
    
    // 断开WebSocket连接
    disconnectWebSocket()
    
    // 跳转到首页
    router.push({ name: 'Home' })
    
  } catch (error) {
    console.error('退出房间失败:', error)
    notificationStore.error('操作失败: ' + (error.response?.data?.message || error.message))
  }
}

// 加载已加入的房间列表
const loadJoinedRooms = async () => {
  try {
    if (authStore.isUser) {
      // 注册用户：获取创建的房间列表
      const response = await axios.get('/api/chatrooms/my/rooms')
      const userRooms = response.data.data || []
      
      joinedRooms.value = userRooms.map(room => ({
        roomId: room.roomId,
        name: room.name,
        connected: true,
        unreadCount: 0
      }))
    } else {
      // 匿名用户：只显示当前房间
      joinedRooms.value = [
        {
          roomId: roomId.value,
          name: roomName.value,
          connected: true,
          unreadCount: 0
        }
      ]
    }
    
    // 确保当前房间在列表中
    const currentRoomExists = joinedRooms.value.some(room => room.roomId === roomId.value)
    if (!currentRoomExists) {
      joinedRooms.value.unshift({
        roomId: roomId.value,
        name: roomName.value,
        connected: true,
        unreadCount: 0
      })
    }
  } catch (error) {
    console.error('加载房间列表失败:', error)
    // 备选方案：至少显示当前房间
    joinedRooms.value = [
      {
        roomId: roomId.value,
        name: roomName.value,
        connected: true,
        unreadCount: 0
      }
    ]
  }
}

// 加载房间成员列表
const loadRoomMembers = async () => {
  try {
    console.log('正在加载房间成员列表，房间ID:', roomId.value)
    const response = await axios.get(`/api/chatrooms/${roomId.value}/members`)
    const members = response.data.data || []
    console.log('获取到的成员列表:', members)
    
    // 更新成员状态，当前用户设为在线
    roomMembers.value = members.map(member => {
      let status = member.status || 'offline'
      
      // 当前用户设为在线
      if (member.uid === authStore.user?.uid) {
        status = 'online'
      }
      // 检查是否在WebSocket在线用户列表中
      else if (onlineUsers.value.some(u => u.uid === member.uid)) {
        status = 'online'
      }
  
  // 检查禁言状态
  let isMuted = false
  let muteUntil = null
  if (member.muteUntil) {
    const muteEndTime = new Date(member.muteUntil)
    const now = new Date()
    isMuted = now < muteEndTime
    muteUntil = isMuted ? member.muteUntil : null
  }
      
      return {
        ...member,
    status,
    isMuted,
    muteUntil
      }
    })
    
    // 如果当前用户不在成员列表中，添加当前用户
    const currentUserExists = roomMembers.value.some(member => member.uid === authStore.user?.uid)
    console.log('当前用户是否在成员列表中:', currentUserExists, '当前用户:', authStore.user?.uid)
    
    if (!currentUserExists && authStore.user) {
      console.log('添加当前用户到成员列表')
  
  // 检查当前用户的禁言状态
  let isMuted = false
  let muteUntil = null
  if (authStore.user.muteUntil) {
    const muteEndTime = new Date(authStore.user.muteUntil)
    const now = new Date()
    isMuted = now < muteEndTime
    muteUntil = isMuted ? authStore.user.muteUntil : null
  }
  
      roomMembers.value.unshift({
        uid: authStore.user.uid,
        nickname: authStore.user.nickname,
        avatarUrl: authStore.user.avatarUrl,
        type: authStore.user.type,
        status: 'online',
        isCreator: isCreator.value,
        isAdmin: false, // 需要从后端获取
    isMuted,
    muteUntil,
        joinTime: new Date().toISOString(),
        lastActiveTime: new Date().toISOString()
      })
    }
    
    console.log('最终成员列表:', roomMembers.value)
    
  } catch (error) {
    console.error('加载成员列表失败:', error)
    // 使用当前用户作为备选
    if (authStore.user) {
  // 检查当前用户的禁言状态
  let isMuted = false
  let muteUntil = null
  if (authStore.user.muteUntil) {
    const muteEndTime = new Date(authStore.user.muteUntil)
    const now = new Date()
    isMuted = now < muteEndTime
    muteUntil = isMuted ? authStore.user.muteUntil : null
  }
  
      roomMembers.value = [{
        uid: authStore.user.uid,
        nickname: authStore.user.nickname,
        avatarUrl: authStore.user.avatarUrl,
        type: authStore.user.type,
        status: 'online',
        isCreator: isCreator.value,
        isAdmin: false,
    isMuted,
    muteUntil,
        joinTime: new Date().toISOString(),
        lastActiveTime: new Date().toISOString()
      }]
    }
  }
}

// 监听窗口大小变化
const handleResize = () => {
  checkMobile()
}
    
// 用户管理函数需要适配新的事件格式
const handleShowUserContextMenu = (event, user, sourceType = 'member') => {
  // 只有创建者或管理员才能显示管理菜单
  if (!isCreator.value && !currentUserIsAdmin.value) return
  
  // 不能对自己使用右键菜单
  if (user.uid === authStore.user?.uid) return
  
  // 不能对创建者使用右键菜单
  if (user.isCreator) return
  
  // 管理员不能对其他管理员使用右键菜单（除非自己是创建者）
  if (!isCreator.value && user.isAdmin) return
  
  showUserContextMenu(event, user, sourceType)
}

// 处理显示消息右键菜单
const handleShowMessageContextMenu = (event, message) => {
  showMessageContextMenu(event, message)
}

// 处理回复消息
const handleReplyMessage = (message) => {
  closeMessageContextMenu()
  
  // 设置回复状态
  replyState.value = {
    isReplying: true,
    targetMessage: message
  }
  
  // 聚焦到输入框
  nextTick(() => {
    if (messageInputComponent.value) {
      messageInputComponent.value.focus()
    }
  })
}

// 取消回复
const cancelReply = () => {
  replyState.value = {
    isReplying: false,
    targetMessage: null
  }
}

// 滚动到指定消息
const scrollToMessage = (messageId, withHighlight = true) => {
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
  if (messageElement && messageList.value) {
    messageElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
    
    // 只在需要时添加高亮效果
    if (withHighlight) {
      messageElement.classList.add('message-highlight')
      setTimeout(() => {
        messageElement.classList.remove('message-highlight')
      }, 2000)
    }
  }
}

// 处理删除消息
const handleDeleteMessage = (message) => {
  closeMessageContextMenu()
  
  // 显示删除确认弹窗
  deleteMessageDialog.value = {
    visible: true,
    targetMessage: message
  }
}

// 确认删除消息
const confirmDeleteMessage = async () => {
  if (!deleteMessageDialog.value.targetMessage) return
  
  try {
    await axios.delete(`/api/chatrooms/${roomId.value}/messages/${deleteMessageDialog.value.targetMessage.id}`)
    
    // 从本地消息列表中移除
    const index = messages.findIndex(m => m.id === deleteMessageDialog.value.targetMessage.id)
    if (index > -1) {
      messages.splice(index, 1)
    }
    
    notificationStore.success('消息已删除')
    cancelDeleteMessage()
  } catch (error) {
    console.error('删除消息失败:', error)
    notificationStore.error('删除失败: ' + (error.response?.data?.message || error.message))
  }
}

// 取消删除消息
const cancelDeleteMessage = () => {
  deleteMessageDialog.value = {
    visible: false,
    targetMessage: null
  }
}

// 确认禁言
const confirmMute = async (duration) => {
  if (!muteDialog.value.targetUser) return
  
  try {
    await axios.post(`/api/chatrooms/${roomId.value}/mute`, {
      targetUid: muteDialog.value.targetUser.uid,
      duration: duration
    })
    
    notificationStore.success(`已禁言用户 ${muteDialog.value.targetUser.nickname}`)
    
    // 更新成员状态
    const member = roomMembers.value.find(m => m.uid === muteDialog.value.targetUser.uid)
    if (member) {
      member.isMuted = true
      member.muteUntil = new Date(Date.now() + duration * 1000)
    }
    
    cancelMute()
  } catch (error) {
    console.error('禁言用户失败:', error)
    notificationStore.error('禁言失败: ' + (error.response?.data?.message || error.message))
  }
}

// 取消禁言
const unmuteUser = async (user) => {
  closeContextMenu()
  
  try {
    await axios.post(`/api/chatrooms/${roomId.value}/unmute`, {
      targetUid: user.uid
    })
    
    notificationStore.success(`已取消禁言用户 ${user.nickname}`)
    
    // 更新成员状态
    const member = roomMembers.value.find(m => m.uid === user.uid)
    if (member) {
      member.isMuted = false
      member.muteUntil = null
    }
  } catch (error) {
    console.error('取消禁言失败:', error)
    notificationStore.error('取消禁言失败: ' + (error.response?.data?.message || error.message))
  }
}

// 设置/取消管理员
const setUserAdmin = async (user, isAdmin) => {
  closeContextMenu()
  
  try {
    await axios.post(`/api/chatrooms/${roomId.value}/admin`, {
      targetUid: user.uid,
      isAdmin
    })
    
    notificationStore.success(`已${isAdmin ? '设置' : '取消'}用户 ${user.nickname} 的管理员权限`)
    
    // 更新成员状态
    const member = roomMembers.value.find(m => m.uid === user.uid)
    if (member) {
      member.isAdmin = isAdmin
    }
  } catch (error) {
    console.error('设置管理员失败:', error)
    notificationStore.error('操作失败: ' + (error.response?.data?.message || error.message))
  }
}

// 确认踢出用户
const confirmKickUser = async () => {
  if (!kickDialog.value.targetUser) return
  
  try {
    await axios.post(`/api/chatrooms/${roomId.value}/kick`, {
      targetUid: kickDialog.value.targetUser.uid
    })
    
    notificationStore.success(`已移出用户 ${kickDialog.value.targetUser.nickname}`)
    
    // 从成员列表中移除（会通过WebSocket user-left事件自动更新）
    
    cancelKick()
  } catch (error) {
    console.error('踢出用户失败:', error)
    notificationStore.error('踢出失败: ' + (error.response?.data?.message || error.message))
  }
    }
    
    // 生命周期
    onMounted(async () => {
      window.addEventListener('resize', handleResize)
      checkMobile()
      
      if (isPrivateChat.value) {
        // 私聊模式初始化
        await initializePrivateChat()
      } else {
        // 聊天室模式初始化
        await initializeChatroom()
        await loadJoinedRooms()
        await loadRoomMembers()
      }
      
      startMuteTimer()
    })
    
    // 在组件卸载时移除事件监听
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      disconnectWebSocket()
      if (muteTimer.value) {
        clearInterval(muteTimer.value)
      }
    })
    
// 在 <script setup> 中，所有顶层定义的变量和函数都会自动暴露给模板

// function to start private chat
const startPrivateChat = (message) => {
  const otherUid = message.userUid
  sessionStorage.setItem('openChatUid', otherUid)
  sessionStorage.setItem('dashboard-active-tab', 'private')
  router.push({ name: 'Dashboard' })
  closeMessageContextMenu()
}

// toggle block user
const toggleBlockUser = async (message) => {
  const uid = message.userUid
  const blocked = privateChatStore.isBlocked(uid)
  try {
    if (blocked) {
      await privateChatStore.unblockUser(uid)
      notificationStore.success('已解除拉黑')
    } else {
      await privateChatStore.blockUser(uid)
      notificationStore.success('已拉黑该用户')
    }
  } catch (error) {
    notificationStore.error('操作失败')
  }
  closeMessageContextMenu()
}
</script>

<style scoped>
/* 动画样式 */
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes upload-dialog-fade-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes progress-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

.animate-upload-dialog-fade-in {
  animation: upload-dialog-fade-in 0.3s ease-out;
}

.animate-progress-shimmer {
  animation: progress-shimmer 1.5s infinite;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .right-sidebar-container {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    transform: translateX(100%);
  }

  .right-sidebar-container.sidebar-visible {
    transform: translateX(0);
  }
}

/* 移动端显示私聊设置关闭按钮 */
@media (max-width: 768px) {
  .private-chat-sidebar .sidebar-toggle {
    display: block;
  }
}

.w-280 {
  width: 280px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .w-280 {
    width: 280px;
  }

}

@media (max-width: 480px) {
  .w-280 {
    width: max(80%, 280px);
  }
}
</style> 