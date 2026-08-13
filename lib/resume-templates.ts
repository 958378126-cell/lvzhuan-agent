export const RESUME_TEMPLATES = [
  { id: "classic", name: "Classic ATS", description: "单栏、稳妥、适合海投和机器筛选", ats: "高" },
  { id: "pillar", name: "Pillar 信息卡", description: "蓝色信息卡、技能胶囊，适合产品 / Legaltech", ats: "中" },
  { id: "elegant", name: "Elegant 衬线", description: "编辑感衬线排版，适合咨询、法律和内容岗位", ats: "中" },
  { id: "swiss", name: "Swiss 栅格", description: "高对比网格和红色强调，适合创意与互联网岗位", ats: "中" },
] as const;

export type ResumeTemplateId = (typeof RESUME_TEMPLATES)[number]["id"];
