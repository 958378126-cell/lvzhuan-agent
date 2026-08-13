import { NextRequest, NextResponse } from "next/server";
import { requestValidatedJSON } from "@/lib/ai";
import { interviewAnswerSchema, interviewPrepSchema } from "@/lib/schemas";

const systemPrompt = `你是资深招聘经理和行为面试教练。根据目标 JD、候选人能力档案和原始简历事实底座，生成岗位定制的面试准备材料。
规则：
1. 所有 evidence 必须来自候选人提供的真实事实；找不到证据就写“暂无事实证据”，不要杜撰。
2. 一次输出 8-12 道最值得准备的问题，覆盖岗位专业题、行为题、跨部门协作、冲突/压力、项目复盘和动机题。
3. 每道题说明为什么这个岗位会问、对应哪条 JD 要求或隐含信号。
4. STAR 中 situation/task/action/result 只允许填入已知事实；未知部分写“待用户补充：……”，不要替用户编答案或数字。
5. missingStories 列出 JD 要求但当前事实缺少的故事素材。
只返回合法 JSON：{"role":"岗位","interviewThesis":"面试主线","questions":[{"question":"题目","competency":"考察能力","whyThisRole":"为什么会问","evidence":["事实证据"],"preparation":"准备建议","star":{"situation":"","task":"","action":"","result":""}}],"missingStories":["缺失故事"]}`;

export async function POST(req: NextRequest) {
  try {
    const { jd, profile, resumeContext, demo } = await req.json();
    if (demo) {
      return NextResponse.json({
        role: "法律科技产品经理",
        interviewThesis: "把高校法务的合同场景经验讲成需求分析、流程设计和跨部门落地能力。",
        questions: [
          { question: "请讲一个你把复杂法律规则转成业务流程的例子。", competency: "抽象与需求分析", whyThisRole: "JD 要求负责合同管理产品需求调研和流程设计。", evidence: ["合同审核与合同台账原型经历"], preparation: "说明原始问题、你的拆解方法和落地结果。", star: { situation: "高校合同审批流程存在效率问题", task: "梳理风险点并设计可执行的台账/流程", action: "待用户补充：你具体做了哪些访谈、字段和取舍？", result: "合同平均流转时间由 7 天缩短至 4 天" } },
          { question: "你如何推动没有直接汇报关系的部门采用你的方案？", competency: "跨部门影响力", whyThisRole: "JD 强调协同法务、研发和业务团队推动落地。", evidence: ["协调采购、信息化和业务部门优化流程"], preparation: "准备不同利益相关方的目标、分歧和你的沟通动作。", star: { situation: "多个部门对合同审批关注点不同", task: "达成统一流程", action: "待用户补充：你如何说服和推进？", result: "待用户补充：采用范围或效率变化" } },
          { question: "讲一个项目结果不如预期、你如何迭代的例子。", competency: "复盘与迭代", whyThisRole: "JD 要求根据用户反馈持续优化产品。", evidence: ["合同台账原型和风险标签项目"], preparation: "准备一个真实的反馈、调整和前后差异。", star: { situation: "待用户补充：原型遇到的具体问题", task: "根据反馈调整方案", action: "待用户补充", result: "待用户补充" } },
          { question: "为什么你想从法律/法务转向 Legaltech 产品？", competency: "动机与方向", whyThisRole: "转型岗位会验证动机是否具体且持久。", evidence: ["目标岗位为法律科技产品经理"], preparation: "用真实场景说明你为什么想解决系统性问题，而不只是换行业。", star: { situation: "在合同审核中反复看到流程和信息问题", task: "寻找更可规模化的解决方式", action: "待用户补充", result: "形成产品化转型方向" } },
          { question: "你如何判断一个需求应该优先做？", competency: "优先级与产品判断", whyThisRole: "产品岗位需要在风险、价值和成本之间做取舍。", evidence: ["合同风险标签和审批流程梳理"], preparation: "准备一套你真实使用过的判断维度，不能只说用户价值。", star: { situation: "合同风险点和业务需求较多", task: "确定优先处理项", action: "待用户补充：判断标准", result: "待用户补充" } },
        ],
        missingStories: ["正式产品上线或用户规模扩大的完整案例", "数据分析工具和指标驱动决策案例"],
      });
    }
    if (typeof jd !== "string" || typeof profile !== "string" || !jd.trim() || !profile.trim()) {
      return NextResponse.json({ error: "缺少 jd 或 profile" }, { status: 400 });
    }
    if (jd.length > 30_000 || profile.length > 80_000 || (resumeContext?.length ?? 0) > 50_000) {
      return NextResponse.json({ error: "输入内容过长，请精简后重试" }, { status: 413 });
    }
    const data = await requestValidatedJSON({
      schema: interviewPrepSchema,
      maxTokens: 7000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `目标 JD：\n${jd}\n\n能力档案：\n${profile}\n\n原始简历事实底座（最高优先级）：\n${resumeContext ?? "未提供"}` },
      ],
    });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "面试准备生成失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
