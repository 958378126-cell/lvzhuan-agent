import { NextRequest, NextResponse } from "next/server";
import { requestValidatedJSON } from "@/lib/ai";
import { DEMO_EMAIL } from "@/lib/demo-data";
import { emailDraftSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const { jd, profile, resumeContext, analysis, demo } = await req.json();
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
            "你是求职顾问。提取 JD 中真实存在的投递邮箱，没有则为空字符串；根据用户事实和岗位匹配结果，起草一封专业、简洁、有针对性的中文求职邮件。正文必须突出 2-3 个与当前 JD 最相关的真实优势，不得虚构公司、项目、数字、证书或经历；如果没有证据就不要写。邮件应包含称呼、应聘岗位、匹配优势、附件说明和礼貌结尾。只输出 JSON：{\"email\":\"\",\"subject\":\"\",\"body\":\"\"}。",
        },
        { role: "user", content: `能力档案：\n${profile}\n\n原始简历事实：\n${resumeContext ?? ""}\n\n目标 JD：\n${jd}\n\n本次 JD 匹配结果（优先参考其中的证据和可迁移能力）：\n${JSON.stringify(analysis ?? {}, null, 2)}` },
      ],
    });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
