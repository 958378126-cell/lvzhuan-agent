import type { ResumeData } from "./schemas";

export const DEMO_RESUME_TEXT = `张明，广州，法律职业资格 A 证。2021 年至今在某高校法务部门工作，负责采购、软件系统和校企合作合同审核，累计处理 300 余份合同；曾协调采购、信息化和业务部门梳理合同审批需求，将平均流转时间从 7 天缩短到 4 天。2023 年牵头搭建合同台账原型，整理 12 类风险标签并推动团队使用。目标岗位为法律科技产品经理。`;

export const DEMO_PROFILE = `# 能力档案

## 基本信息
- 姓名：张明
- 联系方式：13800000000 · demo@example.com
- 目标岗位：法律科技产品经理

## 教育背景
- 华南某大学 · 法学 · 本科 · 2021

## 资格证书与考试
- 法律职业资格证 A 证

## 全部工作经历
- 负责高校采购、软件系统及校企合作合同审核，累计处理 300 余份合同
- 协调采购、信息化及业务部门梳理审批需求，将平均流转时间由 7 天缩短至 4 天

## 全部实习经历
- 未提供

## 全部项目与其他经历
- 牵头搭建合同台账原型，整理 12 类风险标签并推动团队落地使用

## 经历能力转译
- 将合同审核与审批优化转译为需求分析、流程设计和跨部门项目推进能力

## 王牌能力（绿色）
- 能把复杂法律规则拆解为清晰的业务流程和产品需求
- 具备跨部门需求澄清、风险排序与项目推动经验
- 对合同管理和法律科技真实使用场景有一线理解

## 待补充区域（红色）
- 缺少正式互联网产品上线经历
- 数据分析工具和原型工具仍需补强

## 关键词库
需求分析，流程设计，跨部门协作，合同管理，风险标签，Legaltech，产品原型，项目推动`;

export const DEMO_JD = `法律科技产品经理
职责：负责合同管理产品的需求调研、流程设计、原型输出和项目推进；协同法务、研发及业务团队推动产品落地；根据用户反馈持续优化产品。
要求：3 年以上法律或产品相关经验，理解合同管理场景，具备跨部门协作和数据分析能力。熟悉 AI 产品者优先。
投递邮箱：jobs@example.com`;

export const DEMO_ANALYSIS = {
  score: 82,
  summary: "场景经验突出，产品方法待补强",
  strengths: [
    { point: "合同管理场景高度匹配", detail: "具备 300 余份合同的一线处理经验，理解真实用户与风险节点。" },
    { point: "跨部门推动经验", detail: "曾协调采购、信息化与业务部门，并形成可量化的流程效率提升。" },
    { point: "具备产品化实践", detail: "合同台账和风险标签工作可转译为需求梳理、信息架构与产品原型经验。" },
  ],
  gaps: [
    { point: "正式产品上线经验不足", detail: "JD 期待完整产品周期经验，目前档案中主要是内部原型和流程优化。" },
    { point: "数据分析工具未体现", detail: "尚未展示 SQL、BI 或体系化指标设计能力。" },
    { point: "AI 产品经验需要举证", detail: "JD 将 AI 产品经验列为加分项，当前档案中证据不足。" },
  ],
  suggestions: [
    { action: "在简历首屏突出合同台账原型及 7 天到 4 天的效率提升。", priority: "high" as const },
    { action: "补充原型工具、数据分析工具及实际使用成果。", priority: "high" as const },
    { action: "准备一个从用户访谈到迭代验证的完整项目案例。", priority: "medium" as const },
  ],
  keywords: ["合同管理", "需求调研", "流程设计", "跨部门协作", "产品原型", "项目推进", "Legaltech"],
  verifiedFacts: [
    { category: "education" as const, item: "华南某大学法学本科", evidence: "能力档案教育背景" },
    { category: "certification" as const, item: "法律职业资格证 A 证", evidence: "原始简历资格证书" },
    { category: "work" as const, item: "高校法务，累计处理 300 余份合同", evidence: "原始简历工作经历" },
    { category: "project" as const, item: "合同台账原型与 12 类风险标签", evidence: "原始简历项目事实" },
  ],
  requirements: [
    { requirement: "理解合同管理场景", status: "met" as const, evidence: "300 余份合同审核及台账建设经验", action: "在简历首屏明确量化呈现" },
    { requirement: "跨部门项目推进", status: "met" as const, evidence: "协调采购、信息化与业务部门优化流程", action: "用 7 天缩短至 4 天证明结果" },
    { requirement: "正式产品上线经验", status: "gap" as const, evidence: "目前只有内部原型证据", action: "补充一次完整产品验证或上线案例" },
  ],
  translations: [
    { source: "协调多部门优化合同审批", translated: "跨法务、采购与业务团队梳理需求并推动流程落地", targetRequirement: "跨部门项目推进", matchType: "transferable" as const },
  ],
};

export const DEMO_RESUME: ResumeData = {
  name: "张明",
  title: "法律科技产品经理",
  phone: "138 0000 0000",
  email: "demo@example.com",
  location: "广州",
  linkedin: "",
  summary: "具备高校法务与合同管理一线经验，擅长将复杂法律规则转化为业务流程和产品需求。曾通过跨部门流程优化将合同平均流转时间由 7 天缩短至 4 天。",
  experience: [
    {
      role: "法务专员 / 合同数字化项目负责人",
      org: "某高校",
      dates: "2021 — 至今",
      location: "广州",
      bullets: [
        "负责采购、软件系统及校企合作合同审核，累计处理 300 余份合同，沉淀高频风险与业务需求。",
        "协调采购、信息化及业务部门重构审批流程，将合同平均流转时间由 7 天缩短至 4 天。",
        "牵头搭建合同台账原型，设计 12 类风险标签并推动团队日常使用。",
      ],
      sourceEvidence: ["2021 年至今在某高校法务部门工作，负责采购、软件系统和校企合作合同审核。"],
    },
  ],
  education: [{ degree: "法学学士", school: "华南某大学", dates: "2017 — 2021" }],
  skills: ["需求分析", "流程设计", "跨部门协作", "合同管理", "产品原型"],
  certifications: ["法律职业资格证 A 证"],
  achievements: [
    { icon: "★", title: "流程提效 43%", desc: "合同平均流转时间由 7 天缩短至 4 天" },
    { icon: "◎", title: "300+ 合同", desc: "覆盖采购、软件系统与校企合作场景" },
  ],
  languages: [
    { name: "普通话", level: "母语", dots: 5 },
    { name: "English", level: "工作沟通", dots: 3 },
  ],
};

export const DEMO_EMAIL = {
  email: "jobs@example.com",
  subject: "应聘法律科技产品经理｜张明",
  body: "您好，我希望应聘法律科技产品经理岗位。我具备合同管理一线经验，累计处理 300 余份合同，并曾协调多部门优化审批流程，将平均流转时间由 7 天缩短至 4 天；同时牵头搭建合同台账原型及风险标签体系。附件为个人简历，期待进一步沟通，谢谢。",
};
