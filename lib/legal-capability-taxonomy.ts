/**
 * 法律人的能力本体：把法律岗位语言映射为招聘方可识别的通用能力。
 * 这是“法律经历 → 可迁移价值”的稳定规则层，不依赖某一次模型输出。
 */
export const LEGAL_CAPABILITY_TAXONOMY = [
  { id: "legal-research", label: "法律研究与信息检索", signals: ["法规检索", "案例研究", "法律意见", "研究报告"], transferable: ["结构化分析", "信息筛选", "知识整理"] },
  { id: "contract-risk", label: "合同审核与风险识别", signals: ["合同审核", "条款审查", "风险提示", "谈判支持"], transferable: ["质量控制", "风险管理", "决策支持"] },
  { id: "compliance-governance", label: "合规管理与制度建设", signals: ["合规", "制度", "内控", "审计整改"], transferable: ["流程设计", "治理体系", "标准化运营"] },
  { id: "case-strategy", label: "案件分析与复杂问题拆解", signals: ["诉讼", "争议解决", "证据", "案件策略"], transferable: ["问题拆解", "策略判断", "项目风险控制"] },
  { id: "cross-functional", label: "跨部门沟通与利益协调", signals: ["业务沟通", "协调", "谈判", "多方协作"], transferable: ["需求理解", "项目推进", "客户沟通"] },
  { id: "legal-writing", label: "专业表达与决策材料", signals: ["法律文书", "法律意见书", "汇报材料", "报告"], transferable: ["产品文档", "商业写作", "复杂信息转译"] },
  { id: "knowledge-engineering", label: "法律知识结构化与数字化", signals: ["知识库", "法律科技", "AI", "文档结构化", "流程数字化"], transferable: ["知识工程", "产品设计", "数据与流程意识"] },
  { id: "delivery-management", label: "多项目交付与客户服务", signals: ["项目", "客户", "交付", "并行任务"], transferable: ["项目管理", "优先级管理", "结果导向"] },
] as const;

export const LEGAL_CAPABILITY_PROMPT = `
法律人能力标签与职业价值翻译规则（必须使用）：
${JSON.stringify(LEGAL_CAPABILITY_TAXONOMY)}
先识别原始经历对应的法律能力标签，再判断它能否迁移到目标 JD。每条转译必须区分：
- direct：原经历直接做过目标工作；
- transferable：原经历没有相同岗位名称，但底层能力可迁移；
- adjacent：只有邻近证据，不能写成已经具备。
法律术语不能直接等同于通用能力，必须保留“原始事实 → 法律能力 → 可迁移能力 → JD要求”的证据链。禁止把“参与/协助/了解”升级成“负责/主导/精通”，禁止创造项目、数字或工具经验。
`;
