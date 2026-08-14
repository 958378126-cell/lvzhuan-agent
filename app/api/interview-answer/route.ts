import { NextRequest, NextResponse } from "next/server";
import { requestValidatedJSON } from "@/lib/ai";
import { interviewAnswerSchema } from "@/lib/schemas";

const systemPrompt = `你是候选人的面试回答教练。用户会给出一道面试题、已有 STAR 素材和追问。请生成一版 30-60 秒、自然口语化的中文回答。
只能使用候选人提供的事实，不能新增公司、职责、数字、日期或结果；未知部分必须写“这里需要你补充真实细节”。回答要有清晰的情境、任务、行动、结果，重点突出“我做了什么”。同时列出使用了哪些证据和建议继续追问的问题。只返回 JSON：{"answer":"回答","evidenceUsed":["证据"],"followUps":["追问"]}`;

export async function POST(req: NextRequest) {
  try {
    const { question, competency, star, evidence, profile, userMessage, demo } = await req.json();
    if (demo) return NextResponse.json({ answer: "我曾参与高校合同审批流程优化。面对不同部门规则不一致的问题，我先梳理高频风险点和审批节点，再协调采购、信息化及业务部门确认需求，之后搭建合同台账原型并整理风险标签。最终合同平均流转时间由 7 天缩短至 4 天。这个经历让我积累了把复杂法律规则转成流程和产品需求的能力。", evidenceUsed: ["协调采购、信息化及业务部门优化流程", "合同平均流转时间由 7 天缩短至 4 天"], followUps: ["你在其中具体做了哪些取舍？", "哪些用户反馈促成了迭代？"] });
    if (typeof question !== "string" || !question.trim() || typeof profile !== "string" || !profile.trim()) return NextResponse.json({ error: "缺少题目或能力档案" }, { status: 400 });
    const data = await requestValidatedJSON({
      schema: interviewAnswerSchema,
      maxTokens: 2600,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `面试题：${question}\n考察能力：${competency ?? ""}\n已有 STAR：${JSON.stringify(star ?? {})}\n事实证据：${JSON.stringify(evidence ?? [])}\n能力档案：${profile}\n用户追问或修改要求：${userMessage ?? "请先生成简要回答"}` },
      ],
    });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "回答生成失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
