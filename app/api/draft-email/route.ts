import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { jd, profile } = await req.json();
    if (!jd || !profile) {
      return NextResponse.json({ error: "缺少 jd 或 profile" }, { status: 400 });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });
    const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

    const prompt = `你是一名求职顾问。请根据以下信息完成两件事：

1. 从 JD 中提取投递邮箱（如果有）。如果没有邮箱，返回空字符串。
2. 起草一封求职邮件正文，语气专业、简洁、有针对性，不超过 200 字。邮件要体现候选人与该岗位的核心匹配点。

严格输出合法 JSON，格式如下：
{
  "email": "hr@example.com",
  "subject": "邮件主题",
  "body": "邮件正文"
}

---
【能力档案】
${profile}

---
【目标 JD】
${jd}`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw);

    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "生成失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
