import { z } from "zod";

const shortText = (max: number) => z.string().trim().max(max);

export const analysisSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  summary: shortText(80),
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
