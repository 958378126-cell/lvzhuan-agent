import "server-only";

import { readFileSync } from "fs";
import { join } from "path";
import type { ResumeData } from "./schemas";

function escapeHTML(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safePhoto(photo?: string) {
  if (!photo) return "";
  const allowed = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
  if (!allowed.test(photo) || photo.length > 4_000_000) return "";
  return photo;
}

export function buildResumeHTML(data: ResumeData, photo?: string) {
  const templatePath = join(process.cwd(), "public", "template-pillar.html");
  const template = readFileSync(templatePath, "utf-8");

  const experienceHTML = data.experience
    .map(
      (entry) => `<div class="entry">
        <div class="role">${escapeHTML(entry.role)}</div>
        <div class="org">${escapeHTML(entry.org)}</div>
        <div class="meta"><span>${escapeHTML(entry.dates)}</span><span>${escapeHTML(entry.location)}</span></div>
        <ul>${entry.bullets.map((bullet) => `<li>${escapeHTML(bullet)}</li>`).join("")}</ul>
      </div>`
    )
    .join("");
  const educationHTML = data.education
    .map(
      (entry) => `<div class="entry"><div class="role">${escapeHTML(entry.degree)}</div><div class="org">${escapeHTML(entry.school)}</div><div class="meta"><span>${escapeHTML(entry.dates)}</span></div></div>`
    )
    .join("");
  const skillsHTML = data.skills.map((skill) => `<span>${escapeHTML(skill)}</span>`).join("");
  const certificationsHTML = data.certifications.length
    ? `<section><h2>证书 / 资质</h2><div class="pills">${data.certifications.map((item) => `<span>${escapeHTML(item)}</span>`).join("")}</div></section>`
    : "";
  const achievementsHTML = data.achievements
    .map((item) => `<div class="ach"><div class="badge">${escapeHTML(item.icon)}</div><div><div class="t">${escapeHTML(item.title)}</div><div class="d">${escapeHTML(item.desc)}</div></div></div>`)
    .join("");
  const languagesHTML = data.languages
    .map((item) => `<div class="lang"><div class="n"><b>${escapeHTML(item.name)}</b><small>${escapeHTML(item.level)}</small></div><div class="dots">${Array.from({ length: 5 }, (_, index) => `<i${index < item.dots ? ' class="on"' : ""}></i>`).join("")}</div></div>`)
    .join("");
  const validPhoto = safePhoto(photo);
  const photoHTML = validPhoto ? `<img class="head-photo" src="${validPhoto}" alt="photo" />` : "";
  const linkedinHTML = data.linkedin ? `<span>${escapeHTML(data.linkedin)}</span>` : "";

  const bodyContent = `<div class="page">
    <header class="head"><div class="head-info"><h1>${escapeHTML(data.name)}</h1><div class="title">${escapeHTML(data.title)}</div><div class="contact"><span>${escapeHTML(data.phone)}</span><span>${escapeHTML(data.email)}</span><span>${escapeHTML(data.location)}</span>${linkedinHTML}</div></div>${photoHTML}</header>
    <div class="cols"><div class="main"><section><h2>个人简介</h2><p class="summary">${escapeHTML(data.summary)}</p></section><section><h2>工作经历</h2>${experienceHTML}</section><section><h2>教育背景</h2>${educationHTML}</section></div>
    <aside class="aside"><section><h2>技能</h2><div class="pills">${skillsHTML}</div></section>${certificationsHTML}<section><h2>核心成就</h2>${achievementsHTML}</section><section><h2>语言</h2>${languagesHTML}</section></aside></div>
  </div>`;

  return template.replace(/<body>[\s\S]*<\/body>/, `<body>${bodyContent}</body>`);
}
