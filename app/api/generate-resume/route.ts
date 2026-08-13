import { NextRequest, NextResponse } from "next/server";
import { requestValidatedJSON } from "@/lib/ai";
import { DEMO_RESUME } from "@/lib/demo-data";
import { buildResumeHTML } from "@/lib/resume-html";
import { resumeSchema } from "@/lib/schemas";

const systemPrompt = `你是一名专业简历顾问，帮助法律背景人士转型 legaltech / PM。
只使用档案中真实存在的信息，绝不杜撰。教育经历只能放 education，工作/实习才放 experience。档案无明确日期则用“—”。用 JD 语言翻译真实经历，每条 bullet 使用动作和真实结果，不能创造数字。证书不得遗漏。
输出字段：name,title,phone,email,location,linkedin,summary,experience[{role,org,dates,location,bullets}],education[{degree,school,dates}],skills,certifications,achievements[{icon,title,desc}],languages[{name,level,dots}]。只返回合法 JSON。`;

export async function POST(req: NextRequest) {
  try {
    const { jd, profile, instruction, previousResume, photo, demo } = await req.json();
    if (demo) {
      const data = resumeSchema.parse(DEMO_RESUME);
      return NextResponse.json({ html: buildResumeHTML(data), resumeData: data });
    }
    if (!jd?.trim() || !profile?.trim()) {
      return NextResponse.json({ error: "缺少 jd 或 profile" }, { status: 400 });
    }
    if (jd.length > 30_000 || profile.length > 40_000) {
      return NextResponse.json({ error: "输入内容过长，请精简后重试" }, { status: 413 });
    }

    const userPrompt = instruction && previousResume
      ? `能力档案：\n${profile}\n\n目标 JD：\n${jd}\n\n当前简历 JSON：\n${JSON.stringify(previousResume)}\n\n修改指令：${instruction}\n\n保留未涉及部分，输出完整简历 JSON。`
      : `能力档案：\n${profile}\n\n目标 JD：\n${jd}\n\n生成简历 JSON。`;
    const data = await requestValidatedJSON({
      schema: resumeSchema,
      maxTokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    return NextResponse.json({ html: buildResumeHTML(data, photo), resumeData: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
