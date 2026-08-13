import { z } from "zod";

const shortText = (max: number) => z.string().trim().max(max);

export const jdDecodeSchema = z.object({
  role: shortText(160),
  level: shortText(80),
  responsibilities: z.array(shortText(500)).min(1).max(12),
  mustHaves: z.array(shortText(500)).max(15),
  niceToHaves: z.array(shortText(500)).max(15),
  hiddenSignals: z.array(shortText(500)).max(12),
  assumptions: z.array(shortText(500)).max(8),
});

export const resumeTemplateSchema = z.enum(["classic", "pillar", "elegant", "swiss"]);

export const interviewPrepSchema = z.object({
  role: shortText(160),
  interviewThesis: shortText(600),
  questions: z.array(z.object({
    question: shortText(300),
    competency: shortText(160),
    whyThisRole: shortText(500),
    evidence: z.array(shortText(700)).max(4),
    preparation: shortText(800),
    star: z.object({
      situation: shortText(500),
      task: shortText(500),
      action: shortText(700),
      result: shortText(700),
    }),
  })).min(5).max(20),
  missingStories: z.array(shortText(500)).max(8),
});

export const interviewAnswerSchema = z.object({
  answer: shortText(1800),
  evidenceUsed: z.array(shortText(700)).max(5),
  followUps: z.array(shortText(300)).max(4),
});

export const analysisSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  scoreRange: shortText(40).default(""),
  summary: shortText(300),
  decision: z.object({
    recommendation: z.enum(["apply", "cautious", "skip"]),
    rationale: shortText(700),
  }).default({ recommendation: "cautious", rationale: "需要结合具体 JD 和事实进一步判断。" }),
  jdDecode: z.object({
    role: shortText(160),
    level: shortText(80),
    responsibilities: z.array(shortText(500)).max(12),
    mustHaves: z.array(shortText(500)).max(15),
    niceToHaves: z.array(shortText(500)).max(15),
    hiddenSignals: z.array(shortText(500)).max(12),
    assumptions: z.array(shortText(500)).max(8),
  }).default({ role: "未识别", level: "未识别", responsibilities: [], mustHaves: [], niceToHaves: [], hiddenSignals: [], assumptions: [] }),
  risks: z.array(z.object({ risk: shortText(160), concern: shortText(500), response: shortText(600) })).max(8).default([]),
  hiddenSignalScores: z.array(z.object({ signal: shortText(500), score: z.coerce.number().min(0).max(1) })).max(12).default([]),
  scoreAudit: z.object({
    formula: shortText(300),
    mustHave: z.object({ score: z.coerce.number().min(0).max(100), count: z.coerce.number().int().min(0) }),
    niceToHave: z.object({ score: z.coerce.number().min(0).max(100), count: z.coerce.number().int().min(0) }),
    hiddenSignals: z.object({ score: z.coerce.number().min(0).max(100), count: z.coerce.number().int().min(0) }),
    mustHaveGaps: z.coerce.number().int().min(0),
    hardGateMiss: z.boolean(),
  }).default({ formula: "", mustHave: { score: 0, count: 0 }, niceToHave: { score: 0, count: 0 }, hiddenSignals: { score: 0, count: 0 }, mustHaveGaps: 0, hardGateMiss: false }),
  strengths: z
    .array(z.object({ point: shortText(120), detail: shortText(600) }))
    .min(1)
    .max(8),
  gaps: z
    .array(z.object({ point: shortText(120), detail: shortText(600) }))
    .min(1)
    .max(8),
  suggestions: z
    .array(
      z.object({
        action: shortText(500),
        priority: z.enum(["high", "medium", "low"]),
      })
    )
    .min(1)
    .max(8),
  keywords: z.array(shortText(50)).min(1).max(20),
  verifiedFacts: z.array(
    z.object({
      category: z.enum(["education", "certification", "work", "internship", "project", "skill"]),
      item: shortText(300),
      evidence: shortText(600),
    })
  ).min(1).max(60),
  requirements: z.array(
    z.object({
      requirement: shortText(300),
      status: z.enum(["met", "partial", "gap"]),
      tier: z.enum(["must", "nice"]).default("must"),
      matchScore: z.coerce.number().min(0).max(1).default(0),
      evidence: shortText(700),
      action: shortText(700),
    })
  ).min(1).max(30),
  translations: z.array(
    z.object({
      source: shortText(700),
      translated: shortText(700),
      targetRequirement: shortText(300),
      matchType: z.enum(["direct", "transferable", "adjacent"]).default("transferable"),
    })
  ).max(15),
});

export const factInventorySchema = z.object({
  facts: z.array(
    z.object({
      category: z.enum(["education", "certification", "work", "internship", "project", "skill"]),
      item: shortText(500),
      evidence: shortText(1000),
    })
  ).min(1).max(100),
});

export const resumeSchema = z.object({
  name: shortText(80),
  title: shortText(120),
  phone: shortText(80),
  email: shortText(160),
  location: shortText(120),
  linkedin: shortText(300),
  summary: shortText(1200),
  experience: z
    .array(
      z.object({
        role: shortText(160),
        org: shortText(200),
        dates: shortText(100),
        location: shortText(100),
        bullets: z.array(shortText(800)).max(12),
        sourceEvidence: z.array(shortText(1000)).max(12).default([]),
      })
    )
    .max(15),
  education: z
    .array(
      z.object({
        degree: shortText(200),
        school: shortText(200),
        dates: shortText(100),
      })
    )
    .max(10),
  skills: z.array(shortText(100)).max(40),
  certifications: z.array(shortText(180)).max(30),
  achievements: z
    .array(
      z.object({
        icon: shortText(8),
        title: shortText(160),
        desc: shortText(500),
      })
    )
    .max(12),
  languages: z
    .array(
      z.object({
        name: shortText(80),
        level: shortText(80),
        dots: z.coerce.number().int().min(0).max(5),
      })
    )
    .max(10),
});

export const emailDraftSchema = z.object({
  email: shortText(200).refine(
    (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "邮箱格式不正确"
  ),
  subject: shortText(200),
  body: shortText(3000),
});

export const interviewResponseSchema = z.object({
  done: z.boolean(),
  reply: shortText(2000),
  profile: z.string().trim().max(40_000),
}).superRefine((value, context) => {
  if (value.done && value.profile.length < 50) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["profile"],
      message: "访谈结束时必须返回完整能力档案",
    });
  }
});

export type ResumeData = z.infer<typeof resumeSchema>;
export type AnalysisData = z.infer<typeof analysisSchema>;
