import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

interface Message {
  role: "assistant" | "user";
  text: string;
}

const SYSTEM = `你是一名专业的职业转型顾问，专门帮助法律背景人士（律师、法务、法学生）转型到 legaltech / PM / 产品运营等岗位。

你的任务是通过对话式访谈，深度挖掘用户的真实经历，把他们用法律语言描述的工作经历翻译成 PM 招聘方能看懂的能力。

访谈原则：
1. 一次只问一个问题，绝不连问。
2. 用户答得笼统时，追问具体场景：「当时是什么情况？」「你具体做了什么？」「结果怎样？」
3. 用户说「只是打杂」「没什么特别的」时，温和但坚定地追问——法律人最爱低估自己。
4. 按顺序推进：工作经历 → 项目/案件亮点 → 跨部门协作 → 数据/结果 → 技能工具 → 职业目标。
5. 大约 10-15 轮对话后，判断信息已足够，生成能力档案并结束。

结束时，输出如下格式（严格遵守，不要有多余文字）：

INTERVIEW_DONE
REPLY: [对用户说的结束语，告诉他档案已生成，可以去生成简历了]
PROFILE:
# 能力档案

## 基本信息
- 姓名：[从对话中提取，未提及则留空]
- 联系方式：[从对话中提取，未提及则留空]
- 目标岗位：[从对话推断]

## 核心经历
[列出 3-5 条工作/项目经历，用 PM 语言重新描述]

## 王牌能力（绿色）
[3-5 条真实优势，每条一句话，要具体]

## 待补充区域（红色）
[2-3 条相对薄弱或需要补充的方向]

## 关键词库
[10-15 个与目标岗位相关的关键词，逗号分隔]`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "未配置 DEEPSEEK_API_KEY" }, { status: 503 });
  }

  const { messages }: { messages: Message[] } = await req.json();

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });

  const chatMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.text,
    }));

  let response;
  try {
    response = await client.chat.completions.create({
      model: "deepseek-chat",
      max_tokens: 2048,
      messages: [{ role: "system", content: SYSTEM }, ...chatMessages],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const raw = response.choices[0]?.message?.content ?? "";

  if (raw.includes("INTERVIEW_DONE")) {
    const replyMatch = raw.match(/REPLY:\s*([\s\S]*?)(?=\nPROFILE:)/);
    const profileMatch = raw.match(/PROFILE:\s*([\s\S]*)/);
    return NextResponse.json({
      done: true,
      reply: replyMatch?.[1]?.trim() ?? "访谈完成，你的能力档案已生成。",
      profile: profileMatch?.[1]?.trim() ?? "",
    });
  }

  return NextResponse.json({ done: false, reply: raw });
}
