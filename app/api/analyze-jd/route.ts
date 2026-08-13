import { NextRequest, NextResponse } from "next/server";
import { requestValidatedJSON } from "@/lib/ai";
import { DEMO_ANALYSIS } from "@/lib/demo-data";
import { analysisSchema } from "@/lib/schemas";

const systemPrompt = `你是一名资深的法律转型职业顾问。分析目标 JD 与用户能力档案的匹配程度。
只使用档案和 JD 中存在的事实，不得杜撰。输出合法 JSON：
{"score":75,"summary":"15字左右总结","strengths":[{"point":"优势","detail":"证据"}],"gaps":[{"point":"缺口","detail":"证据"}],"suggestions":[{"action":"行动建议","priority":"high|medium|low"}],"keywords":["关键词"]}
strengths、gaps 各 3-5 条，suggestions 2-4 条，keywords 5-10 个。`;

export async function POST(req: NextRequest) {
  try {
    const { jd, profile, demo } = await req.json();
    if (demo) return NextResponse.json(DEMO_ANALYSIS);
    if (!jd?.trim() || !profile?.trim()) {
      return NextResponse.json({ error: "缺少 jd 或 profile" }, { status: 400 });
    }
    if (jd.length > 30_000 || profile.length > 40_000) {
      return NextResponse.json({ error: "输入内容过长，请精简后重试" }, { status: 413 });
    }

    const data = await requestValidatedJSON({
      schema: analysisSchema,
      maxTokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `能力档案：\n${profile}\n\n目标 JD：\n${jd}` },
      ],
    });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "分析失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
