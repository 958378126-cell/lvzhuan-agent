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

## 当前 Agent 短板
- 无工具调用
- 无持久记忆（刷新即失）
- 无反馈循环（简历生成后流程断了）
