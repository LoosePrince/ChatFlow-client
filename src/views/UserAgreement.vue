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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

/* 暗色模式支持 */
.dark .agreement-page {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* 暗色模式下的容器 */
.dark .container {
  background: #1e293b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.agreement-header h1 {
  color: #2c3e50;
  font-weight: 600;
}

/* 暗色模式下的标题 */
.dark .agreement-header h1 {
  color: #f1f5f9;
}

.agreement-content {
  line-height: 1.6;
  color: #34495e;
}

/* 暗色模式下的内容文字 */
.dark .agreement-content {
  color: #cbd5e1;
}

.section {
  margin-bottom: 2rem;
}

.section h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

/* 暗色模式下的章节标题 */
.dark .section h2 {
  color: #f1f5f9;
  border-bottom: 2px solid #3b82f6;
}

.section h3 {
  color: #34495e;
  font-size: 1.2rem;
  font-weight: 500;
  margin: 1rem 0 0.5rem 0;
}

/* 暗色模式下的子标题 */
.dark .section h3 {
  color: #e2e8f0;
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
  color: #2c3e50;
  font-weight: 600;
}

/* 暗色模式下的强调文字 */
.dark .section strong {
  color: #f1f5f9;
}

.agreement-footer {
  border-top: 1px solid #e9ecef;
  padding-top: 2rem;
}

/* 暗色模式下的页脚 */
.dark .agreement-footer {
  border-top: 1px solid #475569;
}

/* 暗色模式下的页脚文字 */
.dark .agreement-footer .text-muted {
  color: #94a3b8 !important;
}

.btn {
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 暗色模式下的按钮 */
.dark .btn-outline-primary {
  color: #60a5fa;
  border-color: #60a5fa;
}

.dark .btn-outline-primary:hover {
  background-color: #60a5fa;
  border-color: #60a5fa;
  color: #1e293b;
}

.dark .btn-primary {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.dark .btn-primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* 暗色模式下的辅助文字 */
.dark .text-muted {
  color: #94a3b8 !important;
}

@media (max-width: 768px) {
  .container {
    margin: 0 1rem;
    padding: 1.5rem;
  }
  
  .section h2 {
    font-size: 1.3rem;
  }
  
  .section h3 {
    font-size: 1.1rem;
  }
}
</style> 