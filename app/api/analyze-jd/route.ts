import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `你是一名资深的法律转型职业顾问。你的任务是帮助用户分析目标 JD 与他们当前能力档案的匹配程度。

严格输出合法 JSON，不要有任何解释文字，格式如下：
{
  "score": 75,
  "summary": "一句话总结整体匹配情况（15字以内）",
  "strengths": [
    { "point": "匹配优势描述", "detail": "具体说明为什么这是优势" }
  ],
  "gaps": [
    { "point": "能力缺口描述", "detail": "JD要求什么、你目前差在哪" }
  ],
  "suggestions": [
    { "action": "具体补充建议", "priority": "high|medium|low" }
  ],
  "keywords": ["JD关键词1", "JD关键词2", "JD关键词3"]
}

strengths 和 gaps 各 3-5 条，suggestions 2-4 条，keywords 5-10 个。`;

export async function POST(req: NextRequest) {
  const { jd, profile } = await req.json();

  if (!jd?.trim() || !profile?.trim()) {
    return NextResponse.json({ error: "缺少 jd 或 profile" }, { status: 400 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "未配置 DEEPSEEK_API_KEY" }, { status: 500 });
  }

  const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });

  let message;
  try {
    message = await client.chat.completions.create({
      model: "deepseek-chat",
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `能力档案：\n${profile}\n\n目标 JD：\n${jd}\n\n请分析匹配度并输出 JSON。`,
        },
      ],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const raw = message.choices[0]?.message?.content ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "模型返回格式有误，请重试" }, { status: 500 });
  }

  try {
    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "JSON 解析失败，请重试" }, { status: 500 });
  }
}
