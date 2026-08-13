# 律转 Agent

面向法律从业者转型 Legaltech / 产品岗位的求职工作流原型：简历读取、深度访谈、能力档案、JD 匹配、定制简历和投递邮件草稿。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

打开 <http://localhost:3000>。

统一 AI 配置：

- `AI_API_KEY`：必填；不配置时仍可使用页面上的离线演示。
- `AI_BASE_URL`：OpenAI 兼容接口地址，例如 `https://api.deepseek.com`。
- `AI_MODEL`：模型名称，例如 `deepseek-chat`。
- `AI_VISION_MODEL`：图片 OCR 使用的视觉模型，例如 `gpt-4o-mini`；图片识别需要当前 AI 服务商支持视觉输入。

JD 页面支持上传 PNG、JPG、WebP 截图进行 OCR。识别结果会回填到 JD 文本框，提交分析前可以手动校对；图片不会保存到 Redis。

跨设备档案分享依赖 Upstash Redis。未配置 Redis 时档案只保存在当前浏览器，访谈、JD 分析、简历生成等主流程不受影响。

## 路演离线模式

访谈、JD 分析和简历生成页都提供离线演示入口。离线模式使用内置脱敏示例，不依赖外部 AI 或 Redis，适合网络不稳定时演示完整流程。

## 验证

```bash
npm run build
npm audit
```
