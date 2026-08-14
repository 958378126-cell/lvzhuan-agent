import { NextRequest, NextResponse } from "next/server";
import { requestValidatedJSON } from "@/lib/ai";
import { DEMO_RESUME } from "@/lib/demo-data";
import { buildResumeHTML } from "@/lib/resume-html";
import { resumeSchema } from "@/lib/schemas";
import { attachResumeEvidence, buildDateEvidence, guardResumeDates } from "@/lib/date-guard";
import { LEGAL_CAPABILITY_PROMPT } from "@/lib/legal-capability-taxonomy";

const systemPrompt = `你是一名专业简历顾问，帮助法律背景人士转型 legaltech / PM。
${LEGAL_CAPABILITY_PROMPT}
只使用档案中真实存在的信息，绝不杜撰。“原始简历事实底座”是最高优先级事实来源。教育经历只能放 education，工作和实习放 experience。必须保留原始事实底座里的全部证书，以及全部与目标岗位相关的工作和实习经历；不能因为能力总结未提及就删除。日期是硬事实：教育、工作和实习必须读取原始简历中明确写出的开始时间和结束时间（包括“至今”）；不要只写一个年份，不要补猜月份或结束时间。原文没有明确起止时间就用“—”。用 JD 语言翻译真实经历，每条 bullet 使用动作和真实结果，不能创造数字。证书不得遗漏。
输出字段：name,title,phone,email,location,linkedin,summary,experience[{role,org,dates,location,bullets,sourceEvidence}],education[{degree,school,dates}],skills,certifications,achievements[{icon,title,desc}],languages[{name,level,dots}]。sourceEvidence 是支持该段经历的原始简历证据，只用于审计，不写进简历正文；找不到就留空。只返回合法 JSON。`;

export async function POST(req: NextRequest) {
  try {
    const { jd, profile, resumeContext, instruction, previousResume, photo, templateId = "pillar", renderOnly, resumeData, demo } = await req.json();
    if (renderOnly && resumeData) {
      const data = resumeSchema.parse(resumeData);
      return NextResponse.json({ html: buildResumeHTML(data, photo, templateId), resumeData: data, templateId });
    }
    if (demo) {
      const data = resumeSchema.parse(DEMO_RESUME);
      return NextResponse.json({ html: buildResumeHTML(data, undefined, templateId), resumeData: data });
    }
    if (!jd?.trim() || !profile?.trim()) {
      return NextResponse.json({ error: "缺少 jd 或 profile" }, { status: 400 });
    }
    if (jd.length > 30_000 || profile.length > 40_000) {
      return NextResponse.json({ error: "输入内容过长，请精简后重试" }, { status: 413 });
    }

    // 用户在能力档案中手动修正的时间也必须参与校验；不能因为存在一份
    // 旧的 resumeContext，就让旧日期覆盖用户刚确认过的教育/实习时间。
    const dateSource = [profile, resumeContext]
      .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
      .join("\n\n");
    const source = [resumeContext, profile].filter((value): value is string => typeof value === "string" && Boolean(value.trim())).join("\n\n");
    const dateEvidence = buildDateEvidence(dateSource);
    const facts = `能力档案（用户已确认的内容优先）：\n${profile}\n\n原始简历全文：\n${resumeContext ?? ""}\n\n合并日期证据（只能使用这些时间，必须保留开始—结束）：\n${dateEvidence || "未提供明确日期"}`;
    const userPrompt = instruction && previousResume
      ? `${facts}\n\n目标 JD：\n${jd}\n\n当前简历 JSON：\n${JSON.stringify(previousResume)}\n\n修改指令：${instruction}\n\n保留未涉及部分，输出完整简历 JSON。`
      : `${facts}\n\n目标 JD：\n${jd}\n\n生成简历 JSON。`;
    const generatedData = await requestValidatedJSON({
      schema: resumeSchema,
      maxTokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const normalizedData = resumeSchema.parse(generatedData);
    const data = attachResumeEvidence(guardResumeDates(normalizedData, dateSource), dateSource);
    return NextResponse.json({ html: buildResumeHTML(data, photo, templateId), resumeData: data, templateId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
