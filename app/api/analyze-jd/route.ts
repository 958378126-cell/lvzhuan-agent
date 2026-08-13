import { NextRequest, NextResponse } from "next/server";
import { requestValidatedJSON } from "@/lib/ai";
import { DEMO_ANALYSIS } from "@/lib/demo-data";
import { analysisSchema, jdDecodeSchema } from "@/lib/schemas";
import { buildFactInventory } from "@/lib/fact-inventory";
import { calculateDeterministicScore } from "@/lib/match-score";

const decodePrompt = `你是资深招聘经理，先把 JD 从招聘话术解码为可验证的招聘需求。不要分析候选人，不要编公司信息。识别岗位、级别、职责、Must Have、Nice to Have、Hidden Signals，以及你对含糊表述的假设。中文输出，只返回合法 JSON：{"role":"岗位","level":"级别","responsibilities":["职责"],"mustHaves":["硬要求"],"niceToHaves":["加分项"],"hiddenSignals":["隐含信号"],"assumptions":["假设"]}`;

const systemPrompt = `你是一名严谨的法律转型职业顾问。你将收到一份已经解码的 JD、个人档案和完整事实清单。

必须按以下顺序工作：
1. 先做事实盘点：完整识别教育、全部资格证书、全部工作/实习/项目经历和技能。原始简历事实底座的优先级最高。
2. 再逐项拆解 JD 要求，并用事实盘点结果核对：
   - met：事实明确证明已经满足；
   - partial：有可迁移经验，但证据或程度不足；
   - gap：事实中确实不存在。
3. 只有 partial 和 gap 才能提出补足行动。不得把用户已经拥有的证书或经历写成缺口。
4. 对已有但表述偏法律化的经历，给出忠于原事实的 JD 语言转译；禁止创造数字、职责和成果。
5. 匹配分必须根据逐项核对结果给出，不得凭感觉。按 Must Have 60%、Nice to Have 20%、Hidden Signals 20% 估算，并输出区间；任一关键 Must Have 未满足时压低上限。
6. 分开写 Gap（简历缺什么）和 Risk（招聘经理可能担心什么），每个 Risk 给出用户可用的回应方向。
7. 给出 apply=值得投、cautious=谨慎投、skip=不建议投的建议，但不得把它写成绝对结论。

只输出合法 JSON：
{
  "score":75,"scoreRange":"70-80%",
  "decision":{"recommendation":"apply|cautious|skip","rationale":"理由"},
  "jdDecode":{"role":"岗位","level":"级别","responsibilities":["职责"],"mustHaves":["硬要求"],"niceToHaves":["加分项"],"hiddenSignals":["隐含信号"],"assumptions":["假设"]},
  "risks":[{"risk":"风险维度","concern":"招聘经理可能担心什么","response":"如何回应"}],
  "hiddenSignalScores":[{"signal":"隐含信号","score":0.5}],
  "summary":"总结",
  "strengths":[{"point":"优势","detail":"来自事实底座的证据"}],
  "gaps":[{"point":"真实缺口或部分满足项","detail":"JD要求、当前事实和差距"}],
  "suggestions":[{"action":"可执行补足方案","priority":"high|medium|low"}],
  "keywords":["关键词"],
  "verifiedFacts":[{"category":"education|certification|work|internship|project|skill","item":"完整事实项","evidence":"原档案证据"}],
  "requirements":[{"requirement":"JD要求","status":"met|partial|gap","tier":"must|nice","matchScore":0.5,"evidence":"核对证据","action":"已满足则说明如何呈现；否则说明如何补足"}],
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
    const decoded = await requestValidatedJSON({
      schema: jdDecodeSchema,
      maxTokens: 3000,
      messages: [
        { role: "system", content: decodePrompt },
        { role: "user", content: jd },
      ],
    });
    const data = await requestValidatedJSON({
      schema: analysisSchema,
      maxTokens: 6000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `JD 解码结果（先解码再匹配，不要退回原始 JD 话术）：\n${JSON.stringify(decoded)}\n\n已经完成的硬事实清单（不得否认或遗漏）：\n${JSON.stringify(facts)}\n\nAI 能力档案：\n${profile}\n\n独立提供的原始简历全文（最高优先级；可能为空）：\n${resumeContext ?? ""}\n\n目标 JD：\n${jd}` },
      ],
    });
    const finalDecode = data.jdDecode?.responsibilities?.length ? data.jdDecode : decoded;
    const scored = calculateDeterministicScore(analysisSchema.parse(data), finalDecode);
    return NextResponse.json({ ...data, ...scored, jdDecode: finalDecode, verifiedFacts: facts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "分析失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
