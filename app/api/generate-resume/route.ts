import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { join } from "path";

interface Experience {
  role: string;
  org: string;
  dates: string;
  location: string;
  bullets: string[];
}

interface ResumeData {
  name: string;
  title: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: Experience[];
  education: { degree: string; school: string; dates: string }[];
  skills: string[];
  achievements: { icon: string; title: string; desc: string }[];
  languages: { name: string; level: string; dots: number }[];
}

function buildResumeHTML(data: ResumeData): string {
  const templatePath = join(process.cwd(), "public", "template-pillar.html");
  const template = readFileSync(templatePath, "utf-8");

  const experienceHTML = data.experience
    .map(
      (e) => `
      <div class="entry">
        <div class="role">${e.role}</div>
        <div class="org">${e.org}</div>
        <div class="meta"><span>${e.dates}</span><span>${e.location}</span></div>
        <ul>${e.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      </div>`
    )
    .join("");

  const educationHTML = data.education
    .map(
      (e) => `
      <div class="entry">
        <div class="role">${e.degree}</div>
        <div class="org">${e.school}</div>
        <div class="meta"><span>${e.dates}</span></div>
      </div>`
    )
    .join("");

  const skillsHTML = data.skills.map((s) => `<span>${s}</span>`).join("");

  const achievementsHTML = data.achievements
    .map(
      (a) => `
      <div class="ach">
        <div class="badge">${a.icon}</div>
        <div><div class="t">${a.title}</div><div class="d">${a.desc}</div></div>
      </div>`
    )
    .join("");

  const languagesHTML = data.languages
    .map(
      (l) => `
      <div class="lang">
        <div class="n"><b>${l.name}</b><small>${l.level}</small></div>
        <div class="dots">${Array.from({ length: 5 }, (_, i) =>
          `<i${i < l.dots ? ' class="on"' : ""}></i>`
        ).join("")}</div>
      </div>`
    )
    .join("");

  const bodyContent = `
<div class="page">
  <header class="head">
    <h1>${data.name}</h1>
    <div class="title">${data.title}</div>
    <div class="contact">
      <span>${data.phone}</span>
      <span><a href="mailto:${data.email}">${data.email}</a></span>
      <span>${data.location}</span>
      <span><a href="#">${data.linkedin}</a></span>
    </div>
  </header>
  <div class="cols">
    <div class="main">
      <section><h2>个人简介</h2><p class="summary">${data.summary}</p></section>
      <section><h2>工作经历</h2>${experienceHTML}</section>
      <section><h2>教育背景</h2>${educationHTML}</section>
    </div>
    <aside class="aside">
      <section><h2>技能</h2><div class="pills">${skillsHTML}</div></section>
      <section><h2>核心成就</h2>${achievementsHTML}</section>
      <section><h2>语言</h2>${languagesHTML}</section>
    </aside>
  </div>
</div>`;

  return template.replace(/<body>[\s\S]*<\/body>/, `<body>${bodyContent}</body>`);
}

const systemPrompt = `你是一名专业的简历撰写顾问，擅长帮助法律背景人士转型 legaltech / PM 岗位。
你的任务是根据用户的能力档案和目标 JD，生成一份结构化的简历数据（JSON 格式）。
如果提供了"修改指令"和"当前简历"，则在当前简历基础上按指令调整，保留未涉及的部分不变。

严格规则：
1. 只使用用户档案中真实存在的经历和能力，绝不杜撰。
2. 用 JD 的语言和关键词"翻译"用户的法律经历，让 PM 招聘方看得懂。
3. 每条 bullet 要有具体动作 + 结果，避免空洞描述。
4. summary 直接点明转型方向和核心优势，不超过 3 句话。

只输出合法 JSON，不要有任何解释文字，格式如下：
{
  "name": "姓名",
  "title": "目标职位",
  "phone": "电话",
  "email": "邮箱",
  "location": "城市",
  "linkedin": "LinkedIn 或留空",
  "summary": "个人简介",
  "experience": [
    {
      "role": "职位名称",
      "org": "公司/机构",
      "dates": "2020 — 2024",
      "location": "城市",
      "bullets": ["成就1", "成就2", "成就3"]
    }
  ],
  "education": [
    { "degree": "学位 · 专业", "school": "学校", "dates": "2015 — 2018" }
  ],
  "skills": ["技能1", "技能2"],
  "achievements": [
    { "icon": "★", "title": "成就标题", "desc": "一句话描述" }
  ],
  "languages": [
    { "name": "普通话", "level": "母语", "dots": 5 },
    { "name": "English", "level": "专业", "dots": 4 }
  ]
}`;

export async function POST(req: NextRequest) {
  const { jd, profile, instruction, previousResume } = await req.json();

  if (!jd?.trim() || !profile?.trim()) {
    return NextResponse.json({ error: "缺少 jd 或 profile" }, { status: 400 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "未配置 DEEPSEEK_API_KEY" }, { status: 500 });
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });

  let message;
  try {
    message = await client.chat.completions.create({
      model: "deepseek-chat",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: instruction && previousResume
            ? `能力档案：\n${profile}\n\n目标 JD：\n${jd}\n\n当前简历 JSON：\n${JSON.stringify(previousResume)}\n\n修改指令：${instruction}\n\n请按指令调整并输出完整简历 JSON。`
            : `能力档案：\n${profile}\n\n目标 JD：\n${jd}\n\n请生成简历 JSON。`,
        },
      ],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const raw = message.choices[0]?.message?.content ?? "";

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "模型返回格式有误，请重试" }, { status: 500 });
  }

  let data: ResumeData;
  try {
    data = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "JSON 解析失败，请重试" }, { status: 500 });
  }

  const html = buildResumeHTML(data);
  return NextResponse.json({ html, resumeData: data });
}
