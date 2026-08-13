import { NextRequest, NextResponse } from "next/server";
import { requestValidatedJSON } from "@/lib/ai";
import { DEMO_PROFILE } from "@/lib/demo-data";
import { interviewResponseSchema } from "@/lib/schemas";
import { attachOriginalResume } from "@/lib/profile-facts";

interface Message {
  role: "assistant" | "user";
  text: string;
}

const SYSTEM = `你是一名专业的职业转型顾问，专门帮助法律背景人士（律师、法务、法学生）转型到 legaltech / PM / 产品运营等岗位。

你的任务是通过对话式访谈，深度挖掘用户的真实经历，把他们用法律语言描述的工作经历翻译成 PM 招聘方能看懂的能力。
用户上传的原始简历是不可丢失的事实底座：其中所有教育背景、资格证书、工作经历、实习经历、项目经历都必须完整保留。访谈用于补充和翻译事实，不能用 3-5 条摘要替代完整事实。

访谈原则：
1. 一次只问一个问题，绝不连问。
2. 用户答得笼统时，追问具体场景：「当时是什么情况？」「你具体做了什么？」「结果怎样？」
3. 用户说「只是打杂」「没什么特别的」时，温和但坚定地追问——法律人最爱低估自己。
4. 按顺序推进：教育背景（学校/专业/学位） → 工作经历 → 项目/案件亮点 → 跨部门协作 → 数据/结果 → 技能工具 → 职业目标。
5. 大约 10-15 轮对话后，判断信息已足够，生成能力档案并结束。

每一轮都只输出合法 JSON：
未结束时：{"done":false,"reply":"本轮只问一个问题","profile":""}
信息足够时：{"done":true,"reply":"告诉用户档案已生成，可以继续分析 JD 或生成简历","profile":"完整能力档案"}

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

## 经历能力转译
[从上述完整事实中选取最有价值的经历，用 PM / Legaltech 语言重新描述；必须能追溯到原始事实]

## 王牌能力（绿色）
[3-5 条真实优势，每条一句话，要具体]

## 待补充区域（红色）
[2-3 条相对薄弱或需要补充的方向]

## 关键词库
[10-15 个与目标岗位相关的关键词，逗号分隔]`;

export async function POST(req: NextRequest) {
  const { messages, resumeContext, demo }: { messages: Message[]; resumeContext?: string; demo?: boolean } = await req.json();
  if (demo) {
    return NextResponse.json({
      done: true,
      reply: "离线演示档案已生成，可以继续体验 JD 分析和简历生成。",
      profile: DEMO_PROFILE,
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
    const response = await requestValidatedJSON({
      schema: interviewResponseSchema,
      maxTokens: 2048,
      messages: [{ role: "system", content: system }, ...chatMessages],
    });
    return NextResponse.json({
      ...response,
      profile: response.done
        ? attachOriginalResume(response.profile, resumeContext)
        : response.profile,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
