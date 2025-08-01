<template>
  <div class="privacy-page">
    <div class="container">
      <div class="privacy-header">
        <button class="btn btn-outline-primary mb-3" @click="goBack">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
        <h1 class="text-center mb-4">ChatFlow 隐私政策</h1>
        <p class="text-muted text-center">最后更新：2025年6月25日</p>
      </div>

      <div class="privacy-content">
        <div class="section">
          <h2>1. 引言</h2>
          <p>ChatFlow 开发者（以下简称"我们"）重视您的隐私保护。本隐私政策说明我们如何收集、使用、存储和保护您在使用 ChatFlow 服务时的个人信息。</p>
          <p>使用我们的服务即表示您同意本隐私政策的条款。如果您不同意本政策，请不要使用我们的服务。</p>
        </div>

        <div class="section">
          <h2>2. 信息收集</h2>
          <h3>2.1 注册用户信息</h3>
          <p>当您注册 ChatFlow 账户时，我们会收集：</p>
          <ul>
            <li>昵称（必需）</li>
            <li>邮箱地址（可选，用于账户恢复）</li>
            <li>密码（加密存储）</li>
            <li>头像图片（可选）</li>
            <li>账户创建时间</li>
          </ul>

          <h3>2.2 匿名用户信息</h3>
          <p>匿名用户使用时，我们会收集：</p>
          <ul>
            <li>临时生成的用户标识符</li>
            <li>加入聊天室的时间</li>
            <li>最后活跃时间</li>
          </ul>

          <h3>2.3 使用信息</h3>
          <p>在您使用服务过程中，我们会自动收集：</p>
          <ul>
            <li>聊天消息内容</li>
            <li>消息发送时间</li>
            <li>参与的聊天室信息</li>
            <li>在线状态和活跃时间</li>
            <li>IP地址和设备信息（用于安全保护）</li>
          </ul>
        </div>

        <div class="section">
          <h2>3. 信息使用</h2>
          <p>我们使用收集的信息用于：</p>
          <ul>
            <li>提供和维护 ChatFlow 服务</li>
            <li>处理您的账户注册和身份验证</li>
            <li>存储和传输您的聊天消息</li>
            <li>改进服务质量和用户体验</li>
            <li>防止欺诈和维护服务安全</li>
            <li>遵守法律法规要求</li>
          </ul>
        </div>

        <div class="section">
          <h2>4. 信息存储</h2>
          <h3>4.1 存储期限</h3>
          <ul>
            <li><strong>注册用户数据：</strong>在您主动删除账户前一直保存</li>
            <li><strong>匿名用户数据：</strong>24小时后自动删除</li>
            <li><strong>聊天消息：</strong>默认保存30天，过期自动清理</li>
            <li><strong>已删除消息：</strong>立即从用户界面移除，并从数据库彻底删除</li>
          </ul>

          <h3>4.2 存储安全</h3>
          <p>我们采用以下措施保护您的数据：</p>
          <ul>
            <li>密码使用 bcrypt 加密算法加密存储</li>
            <li>数据库访问受到严格的权限控制</li>
            <li>定期进行安全审计和漏洞修复</li>
            <li>使用 HTTPS 加密传输数据</li>
          </ul>
        </div>

        <div class="section">
          <h2>5. 信息共享</h2>
          <p>我们不会出售、交易或转让您的个人信息给第三方，除非：</p>
          <ul>
            <li>获得您的明确同意</li>
            <li>为提供服务所必需（如云存储服务提供商）</li>
            <li>遵守法律法规或政府要求</li>
            <li>保护我们的权利、财产或安全</li>
            <li>防止或调查可能的违法行为</li>
            <li>其它特殊原因</li>
          </ul>
        </div>

        <div class="section">
          <h2>6. 用户权利</h2>
          <p>您对自己的个人信息享有以下权利：</p>
          <ul>
            <li><strong>访问权：</strong>查看我们持有的关于您的个人信息</li>
            <li><strong>更正权：</strong>更新或修正不准确的个人信息</li>
            <li><strong>删除权：</strong>要求删除您的个人信息</li>
            <li><strong>导出权：</strong>获取您的个人信息副本</li>
            <li><strong>限制处理权：</strong>在特定情况下限制我们处理您的信息</li>
          </ul>
          <p>如需行使这些权利，请通过本政策末尾的联系方式与我们联系。</p>
        </div>

        <div class="section">
          <h2>7. Cookie 和追踪技术</h2>
          <p>我们使用以下技术来改善用户体验：</p>
          <ul>
            <li><strong>本地存储：</strong>用于保存登录状态和用户偏好</li>
            <li><strong>会话存储：</strong>用于临时存储会话数据</li>
            <li><strong>WebSocket：</strong>用于实时消息传输</li>
          </ul>
          <p>您可以通过浏览器设置管理或禁用这些技术，但可能会影响服务的正常使用。</p>
        </div>

        <div class="section">
          <h2>8. 第三方服务</h2>
          <p>ChatFlow 可能包含指向第三方网站的链接。我们不对这些第三方网站的隐私做法负责。我们建议您查看这些网站的隐私政策。</p>
          <p>我们使用的第三方服务包括：</p>
          <ul>
            <li>字体服务（Google Fonts）</li>
            <li>图标库（Font Awesome）</li>
            <li>前端框架（Vue.js + Tailwind CSS）</li>
          </ul>
        </div>

        <div class="section">
          <h2>9. 儿童隐私</h2>
          <p>ChatFlow 不会故意收集13岁以下儿童的个人信息。如果我们发现收集了儿童的个人信息，我们会立即删除该信息。如果您认为我们可能收集了儿童的信息，请联系我们。</p>
        </div>

        <div class="section">
          <h2>10. 数据安全</h2>
          <p>我们采用适当的技术和组织措施保护您的个人信息，包括：</p>
          <ul>
            <li>数据加密传输和存储</li>
            <li>访问控制和身份验证</li>
            <li>定期安全评估和更新</li>
            <li>员工隐私培训</li>
            <li>事件响应计划</li>
          </ul>
          <p>但请注意，没有任何互联网传输或电子存储方法是100%安全的。</p>
        </div>

        <div class="section">
          <h2>11. 跨境数据传输</h2>
          <p>您的信息可能会被传输到您所在国家/地区以外的地方进行处理。我们会确保此类传输符合适用的数据保护法律，并采取适当措施保护您的信息。</p>
        </div>

        <div class="section">
          <h2>12. 政策更新</h2>
          <p>我们可能会不时更新本隐私政策。重大变更将通过以下方式通知您：</p>
          <ul>
            <li>在 ChatFlow 上发布通知</li>
            <li>通过邮箱发送通知（如果您提供了邮箱）</li>
            <li>在登录时显示更新提示</li>
          </ul>
          <p>继续使用服务即表示您接受更新后的隐私政策。</p>
        </div>

        <div class="section">
          <h2>13. 联系我们</h2>
          <p>如果您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：</p>
          <ul>
            <li>邮箱：1377820366@qq.com</li>
            <li>项目地址：https://github.com/LoosePrince/</li>
            <li>问题反馈：在项目 GitHub 页面提交 Issue</li>
          </ul>
          <p>我们会在收到您的询问后30天内回复。</p>
        </div>
      </div>

      <div class="privacy-footer text-center mt-5">
        <p class="text-muted">感谢您信任 ChatFlow！</p>
        <button class="btn btn-primary" @click="goBack">
          <i class="fas fa-shield-alt"></i> 我已了解隐私政策
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: linear-gradient(rgba(26, 26, 46, 0.3), rgba(22, 33, 62, 0.4)),
              url('/bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 2rem 0;
  position: relative;
  overflow: hidden;
}

/* 暗色模式支持 */
.dark .privacy-page {
  background: linear-gradient(rgba(26, 26, 46, 0.5), rgba(22, 33, 62, 0.6)),
              url('/bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 背景装饰 */
.privacy-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

/* 暗色模式下的容器 */
.dark .container {
  background: rgba(31, 41, 55, 0.4);
  border: 1px solid rgba(75, 85, 99, 0.4);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.privacy-header {
  text-align: center;
  margin-bottom: 3rem;
}

.privacy-header h1 {
  color: white;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.privacy-header p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0;
}

/* 暗色模式下的标题 */
.dark .privacy-header h1 {
  color: white;
}

.dark .privacy-header p {
  color: rgba(255, 255, 255, 0.8);
}

.privacy-content {
  line-height: 1.8;
  color: #2c3e50;
}

/* 暗色模式下的内容文字 */
.dark .privacy-content {
  color: rgba(255, 255, 255, 0.9);
}

.section {
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.section:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.dark .section {
  background: rgba(31, 41, 55, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.dark .section:hover {
  background: rgba(31, 41, 55, 0.4);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.section h2 {
  color: #667eea;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section h2::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 2px;
}

/* 暗色模式下的章节标题 */
.dark .section h2 {
  color: #60a5fa;
}

.dark .section h2::before {
  background: linear-gradient(45deg, #60a5fa, #a855f7);
}

.section h3 {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
  position: relative;
  padding-left: 1rem;
}

.section h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: #667eea;
  border-radius: 2px;
}

/* 暗色模式下的子标题 */
.dark .section h3 {
  color: white;
}

.dark .section h3::before {
  background: #60a5fa;
}

.section p {
  margin-bottom: 1rem;
  text-align: justify;
}

.section ul {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.section li {
  margin-bottom: 0.5rem;
}

.section strong {
  color: #667eea;
  font-weight: 700;
}

/* 暗色模式下的强调文字 */
.dark .section strong {
  color: #60a5fa;
}

.section ul {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 10px;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
}

.dark .section ul {
  background: rgba(96, 165, 250, 0.1);
  border-left: 4px solid #60a5fa;
}

.section li {
  position: relative;
  padding-left: 1.5rem;
}

.section li::before {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: #667eea;
  font-weight: bold;
  font-size: 1.2em;
}

.dark .section li::before {
  color: #60a5fa;
}

.privacy-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  margin-top: 2rem;
  padding: 2rem;
}

/* 暗色模式下的页脚 */
.dark .privacy-footer {
  border-top: 1px solid rgba(75, 85, 99, 0.3);
  background: rgba(31, 41, 55, 0.2);
}

.privacy-footer .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

/* 暗色模式下的页脚文字 */
.dark .privacy-footer .text-muted {
  color: rgba(255, 255, 255, 0.7) !important;
}

.btn {
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.btn-outline-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-outline-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(45deg, #5a67d8, #6b46c1);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

/* 暗色模式下的按钮 */
.dark .btn-outline-primary {
  background: rgba(31, 41, 55, 0.4);
  color: #60a5fa;
  border: 2px solid rgba(96, 165, 250, 0.3);
}

.dark .btn-outline-primary:hover {
  background: rgba(31, 41, 55, 0.6);
  border-color: rgba(96, 165, 250, 0.5);
  color: white;
}

.dark .btn-primary {
  background: linear-gradient(45deg, #60a5fa, #a855f7);
}

.dark .btn-primary:hover {
  background: linear-gradient(45deg, #3b82f6, #9333ea);
  box-shadow: 0 10px 30px rgba(96, 165, 250, 0.4);
}

/* 手机端响应式设计 */
@media (max-width: 768px) {
  /* 移动端背景简化 */
  .privacy-page {
    background: #f8fafc;
    background-attachment: scroll;
    padding: 0;
  }

  .dark .privacy-page {
    background: #1f2937;
    background-attachment: scroll;
  }

  /* 移除背景装饰 */
  .privacy-page::before {
    display: none;
  }

  .container {
    margin: 0;
    padding: 1rem;
    background: transparent;
    backdrop-filter: none;
    border: none;
    border-radius: 0;
    box-shadow: none;
    max-width: 100%;
    min-height: 100vh;
  }

  .dark .container {
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .privacy-header {
    background: white;
    margin: 0 -1rem 1rem -1rem;
    padding: 2rem 1rem 1.5rem 1rem;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 0;
  }

  .dark .privacy-header {
    background: #374151;
    border-bottom: 1px solid #4b5563;
  }

  .privacy-header h1 {
    color: #1f2937;
    font-size: 1.75rem;
    text-shadow: none;
    margin-bottom: 0.5rem;
  }

  .dark .privacy-header h1 {
    color: #f9fafb;
  }

  .privacy-header p {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .dark .privacy-header p {
    color: #9ca3af;
  }

  .privacy-content {
    color: #1f2937;
  }

  .dark .privacy-content {
    color: #f9fafb;
  }

  .section {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    backdrop-filter: none;
  }

  .section:hover {
    transform: none;
    box-shadow: none;
  }

  .dark .section {
    background: #374151;
    border: 1px solid #4b5563;
  }

  .dark .section:hover {
    background: #374151;
    box-shadow: none;
  }

  .section h2 {
    font-size: 1.25rem;
    color: #667eea;
  }

  .dark .section h2 {
    color: #60a5fa;
  }

  .section h2::before {
    width: 3px;
    height: 18px;
  }

  .section h3 {
    font-size: 1.1rem;
    margin: 1rem 0 0.75rem 0;
    color: #1f2937;
  }

  .dark .section h3 {
    color: #f9fafb;
  }

  .section p {
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 0.75rem;
  }

  .section ul {
    background: #f8fafc;
    border-radius: 8px;
    padding: 1rem;
    border-left: 3px solid #667eea;
    margin-bottom: 1rem;
  }

  .dark .section ul {
    background: #1f2937;
    border-left: 3px solid #60a5fa;
  }

  .section li {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    padding-left: 1rem;
  }

  .privacy-footer {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1rem -1rem 0 -1rem;
    border-top: 1px solid #e5e7eb;
  }

  .dark .privacy-footer {
    background: #374151;
    border: 1px solid #4b5563;
    border-top: 1px solid #4b5563;
  }

  .privacy-footer .text-muted {
    color: #6b7280 !important;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .dark .privacy-footer .text-muted {
    color: #9ca3af !important;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    width: 100%;
    justify-content: center;
  }

  .btn-outline-primary {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .btn-outline-primary:hover {
    background: #667eea;
    color: white;
    transform: none;
  }

  .btn-primary {
    background: #667eea;
    border: 2px solid #667eea;
  }

  .btn-primary:hover {
    background: #5a67d8;
    border-color: #5a67d8;
    transform: none;
    box-shadow: none;
  }

  .dark .btn-outline-primary {
    background: #374151;
    color: #60a5fa;
    border: 2px solid #60a5fa;
  }

  .dark .btn-outline-primary:hover {
    background: #60a5fa;
    color: #1f2937;
  }

  .dark .btn-primary {
    background: #60a5fa;
    border: 2px solid #60a5fa;
    color: #1f2937;
  }

  .dark .btn-primary:hover {
    background: #3b82f6;
    border-color: #3b82f6;
  }
}
</style> 