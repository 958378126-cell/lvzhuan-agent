import { NextRequest, NextResponse } from "next/server";
import { requestValidatedJSON } from "@/lib/ai";
import { DEMO_ANALYSIS } from "@/lib/demo-data";
import { analysisSchema } from "@/lib/schemas";
import { buildFactInventory } from "@/lib/fact-inventory";

const systemPrompt = `你是一名严谨的法律转型职业顾问。你将收到一份个人档案（其中可能包含“原始简历事实底座”）和目标 JD。

必须按以下顺序工作：
1. 先做事实盘点：完整识别教育、全部资格证书、全部工作/实习/项目经历和技能。原始简历事实底座的优先级最高。
2. 再逐项拆解 JD 要求，并用事实盘点结果核对：
   - met：事实明确证明已经满足；
   - partial：有可迁移经验，但证据或程度不足；
   - gap：事实中确实不存在。
3. 只有 partial 和 gap 才能提出补足行动。不得把用户已经拥有的证书或经历写成缺口。
4. 对已有但表述偏法律化的经历，给出忠于原事实的 JD 语言转译；禁止创造数字、职责和成果。
5. 匹配分必须根据逐项核对结果给出，不得凭感觉。

只输出合法 JSON：
{
  "score":75,
  "summary":"总结",
  "strengths":[{"point":"优势","detail":"来自事实底座的证据"}],
  "gaps":[{"point":"真实缺口或部分满足项","detail":"JD要求、当前事实和差距"}],
  "suggestions":[{"action":"可执行补足方案","priority":"high|medium|low"}],
  "keywords":["关键词"],
  "verifiedFacts":[{"category":"education|certification|work|internship|project|skill","item":"完整事实项","evidence":"原档案证据"}],
  "requirements":[{"requirement":"JD要求","status":"met|partial|gap","evidence":"核对证据","action":"已满足则说明如何呈现；否则说明如何补足"}],
  "translations":[{"source":"原始经历事实","translated":"忠于事实的JD语言表达","targetRequirement":"对应JD要求","matchType":"direct|transferable|adjacent"}]
}
verifiedFacts 必须优先完整覆盖档案里出现的全部证书，以及所有教育、工作、实习事实；不得只挑与 JD 匹配的事实。
每条 translations 必须标注 matchType：direct=原经历直接满足 JD，transferable=原经历可迁移满足，adjacent=只有邻近证据、不能当作已满足。`;

export async function POST(req: NextRequest) {
  try {
    const { jd, profile, resumeContext, demo } = await req.json();
    if (demo) return NextResponse.json(DEMO_ANALYSIS);
    if (!jd?.trim() || !profile?.trim()) {
      return NextResponse.json({ error: "缺少 jd 或 profile" }, { status: 400 });
    }
    if (jd.length > 30_000 || profile.length > 80_000 || (resumeContext?.length ?? 0) > 50_000) {
      return NextResponse.json({ error: "输入内容过长，请精简后重试" }, { status: 413 });
    }

    const facts = await buildFactInventory(profile, resumeContext);
    const data = await requestValidatedJSON({
      schema: analysisSchema,
      maxTokens: 6000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `已经完成的硬事实清单（不得否认或遗漏）：\n${JSON.stringify(facts)}\n\nAI 能力档案：\n${profile}\n\n独立提供的原始简历全文（最高优先级；可能为空）：\n${resumeContext ?? ""}\n\n目标 JD：\n${jd}` },
      ],
    });
    return NextResponse.json({ ...data, verifiedFacts: facts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "分析失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
