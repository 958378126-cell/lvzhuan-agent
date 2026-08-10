# 求职转型 AI Agent — CLAUDE.md

## 项目概述
为法律背景（律师/法务/法学生）转型 LegalTech/PM/产品运营岗位的求职 AI Agent。
黑客松参赛项目（Eazo Personal Agent 挑战赛）。

## 技术栈
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- DeepSeek API（OpenAI 兼容，`deepseek-chat` 模型）
- 状态：localStorage（无数据库）

## 环境变量
- `DEEPSEEK_API_KEY` — 在 `.env.local` 配置，Vercel 部署时在后台填

## 项目结构
```
app/
  page.tsx              # 首页，三个入口卡片
  interview/page.tsx    # 对齐访谈（多轮聊天收集用户档案）
  map/page.tsx          # 能力地图（王牌区/缺口区可视化）
  resume/page.tsx       # 简历生成页
  api/
    interview/route.ts        # 访谈对话 API
    generate-resume/route.ts  # 简历生成 API
```

## 数据流
用户档案存在 `localStorage` 的 `userProfile` key，JSON 格式，从访谈页写入，能力地图和简历页读取。

## 待开发功能
1. **JD 分析工具** — 用户粘贴 JD，Agent 自动对比档案，输出匹配度+差距+建议
2. **迭代简历** — 生成后支持自然语言修改（"针对字节PM岗改一版"），基于上下文更新而非重走流程

## 当前 Agent 的记忆能力与短板

### 已实现的记忆能力

- 访谈过程中，前端会保存对话消息，刷新页面后可恢复当前访谈。
- 访谈完成后，能力档案会保存到浏览器 localStorage。
- 如果配置了 Upstash Redis，系统会额外保存一份 90 天有效的能力档案快照，并生成可跨设备访问的分享链接。
- 能力档案会被用于能力地图、JD 匹配、定制简历和投递邮件生成。

### 尚未实现的长期记忆

- 尚未保存完整访谈过程和用户在访谈中的原始证据。
- 尚未记录用户的 JD 分析历史、简历版本、投递记录和面试反馈。
- 尚未支持用户偏好、目标岗位和职业方向的持续更新。
- Redis 中保存的是一次性的档案快照，不是可持续演化的个人记忆。
- 当前主要依赖 localStorage 和手动传入 profile，尚未实现统一的 userId、memory store 和记忆检索机制。
- 尚未实现记忆的冲突处理、用户确认、删除和隐私控制。

## 下一步记忆系统

1. 为每位用户建立稳定的 userId。
2. 将用户记忆拆分为结构化字段：经历、能力、证据、偏好、目标、反馈。
3. 为每条记忆增加来源、时间、置信度和用户确认状态。
4. 每次访谈、JD 分析、简历修改和投递反馈后更新记忆。
5. 后续任务自动检索相关记忆，而不是依赖用户手动粘贴 profile。
6. 增加记忆查看、编辑、删除和导出功能。
