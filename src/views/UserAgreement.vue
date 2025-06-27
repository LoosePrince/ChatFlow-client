<template>
  <div class="agreement-page">
    <div class="container">
      <div class="agreement-header">
        <button class="btn btn-outline-primary mb-3" @click="goBack">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
        <h1 class="text-center mb-4">ChatFlow 用户协议</h1>
        <p class="text-muted text-center">最后更新：2025年6月25日</p>
      </div>

      <div class="agreement-content">
        <div class="section">
          <h2>1. 协议接受</h2>
          <p>欢迎使用 ChatFlow！本用户协议（以下简称"协议"）是您与 ChatFlow 开发者之间关于使用 ChatFlow 服务的法律协议。通过访问或使用我们的服务，您表示同意受本协议的约束。</p>
        </div>

        <div class="section">
          <h2>2. 服务描述</h2>
          <p>ChatFlow 是一个现代化的实时聊天应用，提供以下功能：</p>
          <ul>
            <li>实时消息传输和多房间聊天</li>
            <li>匿名用户和注册用户模式</li>
            <li>用户头像上传和个人资料管理</li>
            <li>聊天室创建和管理功能</li>
            <li>管理员权限和内容管理</li>
          </ul>
        </div>

        <div class="section">
          <h2>3. 用户账户</h2>
          <h3>3.1 注册用户</h3>
          <p>注册用户享有完整的服务功能，包括创建聊天室、上传头像、查看历史消息等。您需要提供真实有效的信息进行注册。</p>
          
          <h3>3.2 匿名用户</h3>
          <p>匿名用户可以快速体验 ChatFlow 的基本功能，但存在以下限制：</p>
          <ul>
            <li>加入后10分钟内无法发言</li>
            <li>无法查看历史消息</li>
            <li>24小时后账户自动失效</li>
            <li>无法创建聊天室</li>
          </ul>
        </div>

        <div class="section">
          <h2>4. 用户行为规范</h2>
          <p>使用 ChatFlow 服务时，您同意遵守以下行为规范：</p>
          <ul>
            <li>不发布违法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽或其他不当内容</li>
            <li>不冒充他人或虚假陈述与他人的关系</li>
            <li>不上传包含病毒、木马或其他有害代码的文件</li>
            <li>不进行垃圾信息发送、广告推广或其他商业行为</li>
            <li>不干扰或破坏服务的正常运行</li>
            <li>尊重其他用户的权利和隐私</li>
          </ul>
        </div>

        <div class="section">
          <h2>5. 内容和知识产权</h2>
          <h3>5.1 用户内容</h3>
          <p>您对自己发布的内容负责，并保证拥有相应的权利。您发布内容即表示授予 ChatFlow 使用、存储、传输该内容的权利。</p>
          
          <h3>5.2 平台内容</h3>
          <p>ChatFlow 的设计、文本、图形、界面等受知识产权法保护，未经授权不得复制、修改或分发。</p>
        </div>

        <div class="section">
          <h2>6. 隐私保护</h2>
          <p>我们重视您的隐私保护。关于我们如何收集、使用和保护您的个人信息，请参阅我们的《隐私政策》。</p>
        </div>

        <div class="section">
          <h2>7. 服务变更和终止</h2>
          <h3>7.1 服务变更</h3>
          <p>我们保留随时修改、暂停或终止服务的权利，恕不另行通知。</p>
          
          <h3>7.2 账户终止</h3>
          <p>如您违反本协议，我们有权暂停或终止您的账户，并删除相关内容。</p>
        </div>

        <div class="section">
          <h2>8. 免责声明</h2>
          <p>ChatFlow 按"现状"提供服务，不对服务的连续性、稳定性、安全性等作出保证。在法律允许的最大范围内，我们不承担因使用服务而产生的损失责任。</p>
        </div>

        <div class="section">
          <h2>9. 争议解决</h2>
          <p>因本协议产生的争议，双方应友好协商解决。协商不成的，可向有管辖权的人民法院提起诉讼。</p>
        </div>

        <div class="section">
          <h2>10. 协议修改</h2>
          <p>我们可能会不时修改本协议。修改后的协议将在 ChatFlow 上发布，继续使用服务即表示您接受修改后的协议。</p>
        </div>

        <div class="section">
          <h2>11. 联系我们</h2>
          <p>如对本协议有任何疑问，请通过以下方式联系我们：</p>
          <ul>
            <li>邮箱：1377820366@qq.com</li>
            <li>项目地址：https://github.com/LoosePrince/</li>
            <li>问题反馈：在项目 GitHub 页面提交 Issue</li>
          </ul>
          <p>我们会在收到您的询问后30天内回复。</p>
        </div>
      </div>

      <div class="agreement-footer text-center mt-5">
        <p class="text-muted">感谢您使用 ChatFlow！</p>
        <button class="btn btn-primary" @click="goBack">
          <i class="fas fa-check"></i> 我已阅读并同意
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
.agreement-page {
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
.dark .agreement-page {
  background: linear-gradient(rgba(26, 26, 46, 0.5), rgba(22, 33, 62, 0.6)),
              url('/bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 背景装饰 */
.agreement-page::before {
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

.agreement-header {
  text-align: center;
  margin-bottom: 3rem;
}

.agreement-header h1 {
  color: white;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.agreement-header p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0;
}

/* 暗色模式下的标题 */
.dark .agreement-header h1 {
  color: white;
}

.dark .agreement-header p {
  color: rgba(255, 255, 255, 0.8);
}

.agreement-content {
  line-height: 1.8;
  color: #2c3e50;
}

/* 暗色模式下的内容文字 */
.dark .agreement-content {
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

.agreement-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  margin-top: 2rem;
  padding: 2rem;
}

/* 暗色模式下的页脚 */
.dark .agreement-footer {
  border-top: 1px solid rgba(75, 85, 99, 0.3);
  background: rgba(31, 41, 55, 0.2);
}

.agreement-footer .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

/* 暗色模式下的页脚文字 */
.dark .agreement-footer .text-muted {
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
  .agreement-page {
    background: #f8fafc;
    background-attachment: scroll;
    padding: 0;
  }

  .dark .agreement-page {
    background: #1f2937;
    background-attachment: scroll;
  }

  /* 移除背景装饰 */
  .agreement-page::before {
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

  .agreement-header {
    background: white;
    margin: 0 -1rem 1rem -1rem;
    padding: 2rem 1rem 1.5rem 1rem;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 0;
  }

  .dark .agreement-header {
    background: #374151;
    border-bottom: 1px solid #4b5563;
  }

  .agreement-header h1 {
    color: #1f2937;
    font-size: 1.75rem;
    text-shadow: none;
    margin-bottom: 0.5rem;
  }

  .dark .agreement-header h1 {
    color: #f9fafb;
  }

  .agreement-header p {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .dark .agreement-header p {
    color: #9ca3af;
  }

  .agreement-content {
    color: #1f2937;
  }

  .dark .agreement-content {
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

  .agreement-footer {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1rem -1rem 0 -1rem;
    border-top: 1px solid #e5e7eb;
  }

  .dark .agreement-footer {
    background: #374151;
    border: 1px solid #4b5563;
    border-top: 1px solid #4b5563;
  }

  .agreement-footer .text-muted {
    color: #6b7280 !important;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .dark .agreement-footer .text-muted {
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