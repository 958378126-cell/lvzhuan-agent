import { NextRequest, NextResponse } from "next/server";
import { requestValidatedJSON } from "@/lib/ai";
import { DEMO_PROFILE } from "@/lib/demo-data";
import { interviewResponseSchema } from "@/lib/schemas";
import { attachOriginalResume } from "@/lib/profile-facts";

export const maxDuration = 60;

interface Message {
  role: "assistant" | "user";
  text: string;
}

const SYSTEM = `你是一名专业的职业转型顾问，专门帮助法律背景人士（律师、法务、法学生）转型到 legaltech / PM / 产品运营等岗位。

你的任务是通过对话式访谈，先帮用户打开职业视野，再深度挖掘真实经历，把他们用法律语言描述的工作经历翻译成招聘方能看懂的能力。
用户上传的原始简历是不可丢失的事实底座：其中所有教育背景、资格证书、工作经历、实习经历、项目经历都必须完整保留。访谈用于补充和翻译事实，不能用 3-5 条摘要替代完整事实。教育、工作和实习的日期必须逐字读取原文的开始时间和结束时间（包括“至今”）；原文没有写完整起止时间就标记“未提供”，不得猜测年份、月份或结束时间。

访谈原则：
1. 一次只问一个问题，绝不连问。
2. 用户答得笼统时，追问具体场景：「当时是什么情况？」「你具体做了什么？」「结果怎样？」
3. 用户说「只是打杂」「没什么特别的」时，温和但坚定地追问——法律人最爱低估自己。
4. 第一轮读完简历后，必须先给出 3-5 个“可能适合的岗位方向”初步假设，可以包含法律行业外的岗位。每个方向说明：为什么推断、来自哪些已知证据、还要问什么才能验证。它们是探索假设，不是事实结论。
5. 后续按顺序推进：教育背景 → 工作经历 → 项目/案件亮点 → 跨部门协作 → 数据/结果 → 技能工具 → 职业目标；中途必须至少加入一轮“简历之外探索”：最近正在做什么、学习什么、关注什么、业余项目/社群/内容输出、曾经主动解决过什么有意思的问题。
6. 不要只围绕简历已有条目提问。用户提到学习、兴趣或新近活动时，追问它具体做了什么、为什么开始、产出或结果、是否愿意长期投入。
7. 大约 10-15 轮对话后，判断信息已足够，生成能力档案并结束。

每一轮都只输出合法 JSON：
未结束时：{"done":false,"reply":"本轮只问一个问题","profile":"","careerHypotheses":[{"role":"可能岗位","why":"推断理由","evidence":["事实证据"],"toValidate":"待验证问题"}]}
信息足够时：{"done":true,"reply":"告诉用户档案已生成，可以继续分析 JD 或生成简历","profile":"完整能力档案","careerHypotheses":[]}

完成时 profile 必须严格使用以下 Markdown 结构：
# 能力档案

## 基本信息
- 姓名：[从对话中提取，未提及则留空]
- 联系方式：[从对话中提取，未提及则留空]
- 目标岗位：[从对话推断]

## 教育背景
[列出所有学历，格式：学校 · 专业 · 学位 · 毕业年份，每条一行，未提及则留空]

## 资格证书与考试
[逐项完整列出原始简历和访谈中出现的全部证书、执照、考试成绩。包括但不限于法考、证券从业资格、基金从业资格、英语、PMP。不得筛选或遗漏。]

## 全部工作经历
[逐项完整保留所有工作经历的单位、职位、日期和事实，不得只选 3-5 条]

## 全部实习经历
[逐项完整保留所有实习经历的单位、岗位、日期和事实，无则写“未提供”]

## 全部项目与其他经历
[逐项完整保留项目、比赛、校园、志愿等经历，无则写“未提供”]

## 当前学习与探索（用户自述，待验证）
[记录用户最近正在学习、实践、关注或输出的内容；这是用户自述，不得当作已认证技能或工作经历]

## 职业方向假设（待验证）
[记录访谈过程中产生的可能岗位方向、推断依据和待验证问题；不得当作最终结论]

## 经历能力转译
[从上述完整事实中选取最有价值的经历，用 PM / Legaltech 语言重新描述；必须能追溯到原始事实]

## 王牌能力（绿色）
[3-5 条真实优势，每条一句话，要具体]

## 待补充区域（红色）
[2-3 条相对薄弱或需要补充的方向]

## 关键词库
[10-15 个与目标岗位相关的关键词，逗号分隔]

注意：初步岗位假设、兴趣和正在学习的内容必须单独标记为“待验证/用户自述”，不能伪装成教育、证书或工作事实。`;

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const { messages, resumeContext, demo }: { messages: Message[]; resumeContext?: string; demo?: boolean } = await req.json();
  if (demo) {
    return NextResponse.json({
      done: true,
      reply: "离线演示档案已生成，可以继续体验 JD 分析和简历生成。",
      profile: DEMO_PROFILE,
      careerHypotheses: [
        { role: "法律科技产品经理", why: "合同审核、流程优化和台账原型都能迁移到 Legaltech 产品场景。", evidence: ["合同审批流程优化", "合同台账原型"], toValidate: "是否愿意持续做需求分析、原型和产品迭代？" },
        { role: "Legal Operations / 法务数字化运营", why: "你同时理解法律规则、业务流程和跨部门协作。", evidence: ["协调采购、信息化与业务部门", "风险标签整理"], toValidate: "是否对流程治理、指标和系统落地更感兴趣？" },
        { role: "合规产品 / 风险策略岗位", why: "合同风险识别经验可以迁移到规则设计、风险分层和策略运营。", evidence: ["合同风险点沉淀", "12 类风险标签"], toValidate: "是否愿意补充数据分析和策略工具能力？" },
      ],
    });
  }
  if (!Array.isArray(messages) || messages.length > 40 || (resumeContext?.length ?? 0) > 50_000) {
    return NextResponse.json({ error: "访谈内容过长，请重新开始或精简简历" }, { status: 413 });
  }

  const system = resumeContext
    ? `${SYSTEM}\n\n---\n用户已上传简历，原文如下：\n\n${resumeContext}\n\n请基于这份简历开始访谈。先用一两句话确认你已读懂简历的大致背景（包括学历和工作经历），然后直接提出第一个针对性的深挖问题——聚焦于简历中描述模糊、最有潜力挖掘 PM 能力的那段经历。`
    : SYSTEM;

  const chatMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.text,
    }));

  try {
    console.info("interview.request", {
      requestId,
      messageCount: chatMessages.length,
      resumeLength: resumeContext?.length ?? 0,
    });
    const response = await requestValidatedJSON({
      schema: interviewResponseSchema,
      maxTokens: 2048,
      messages: [{ role: "system", content: system }, ...chatMessages],
    });
    const profile = response.profile ?? "";
    const careerHypotheses = response.careerHypotheses ?? [];
    console.info("interview.success", {
      requestId,
      elapsedMs: Date.now() - startedAt,
      done: response.done,
      replyLength: response.reply.length,
      hypothesisCount: careerHypotheses.length,
    });
    return NextResponse.json({
      ...response,
      careerHypotheses,
      profile: response.done
        ? attachOriginalResume(profile, resumeContext)
        : profile,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("interview.failure", {
      requestId,
      elapsedMs: Date.now() - startedAt,
      error: msg,
      stack: err instanceof Error ? err.stack : undefined,
    });

    let publicMessage = "AI 暂时没有完成本轮访谈，请重试一次。";
    if (/校验|JSON|parse/i.test(msg)) {
      publicMessage = "AI 本轮回答格式不完整，请重试一次；你的简历和回答仍已保留。";
    } else if (/timeout|timed out|aborted/i.test(msg)) {
      publicMessage = "AI 本轮响应超时，请重试一次；你的简历和回答仍已保留。";
    } else if (/401|authentication|api key/i.test(msg)) {
      publicMessage = "AI 服务认证失败，请检查部署环境中的 AI_API_KEY。";
    } else if (/429|rate limit|quota|balance/i.test(msg)) {
      publicMessage = "AI 服务当前限流或余额不足，请稍后重试。";
    }

    return NextResponse.json({ error: publicMessage, requestId }, { status: 502 });
  }
}
