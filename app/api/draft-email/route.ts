import { NextRequest, NextResponse } from "next/server";
import { requestValidatedJSON } from "@/lib/ai";
import { DEMO_EMAIL } from "@/lib/demo-data";
import { emailDraftSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const { jd, profile, demo } = await req.json();
    if (demo) return NextResponse.json(DEMO_EMAIL);
    if (!jd?.trim() || !profile?.trim()) {
      return NextResponse.json({ error: "缺少 jd 或 profile" }, { status: 400 });
    }

    const data = await requestValidatedJSON({
      schema: emailDraftSchema,
      maxTokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "你是求职顾问。提取 JD 中真实存在的投递邮箱，没有则为空字符串；根据档案起草专业、简洁、有针对性的邮件。只输出 JSON：{\"email\":\"\",\"subject\":\"\",\"body\":\"\"}。",
        },
        { role: "user", content: `能力档案：\n${profile}\n\n目标 JD：\n${jd}` },
      ],
    });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
