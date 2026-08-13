import "server-only";

import { requestValidatedJSON } from "./ai";
import { factInventorySchema } from "./schemas";

type Fact = {
  category: "education" | "certification" | "work" | "internship" | "project" | "skill";
  item: string;
  evidence: string;
};

const CERTIFICATE_PATTERN = /(证券从业|基金从业|法律职业资格|律师执业|注册会计师|\bCPA\b|\bCFA\b|\bPMP\b|英语[四六]级|大学英语[四六]级|\bCET[- ]?[46]\b|从业资格|资格证书?|执业证书?)/i;

function certificateHints(source: string) {
  return source
    .split(/[\n。；;]/)
    .map((item) => item.replace(/^[-*•\s]+/, "").trim())
    .filter((item) => item.length > 1 && CERTIFICATE_PATTERN.test(item))
    .map((item) => item.slice(0, 500));
}

function normalize(value: string) {
  return value.replace(/[\s·•，,。；;：:（）()\-_/]/g, "").toLowerCase();
}

export async function buildFactInventory(profile: string, resumeContext?: string) {
  const source = resumeContext?.trim() || profile;
  const inventory = await requestValidatedJSON({
    schema: factInventorySchema,
    maxTokens: 5000,
    messages: [
      {
        role: "system",
        content: `你是简历事实审计员。完整提取输入中的所有硬事实，不做 JD 匹配，不评价，不改写，不合并不同经历。
必须逐项覆盖：全部教育、全部资格证书/执照/考试成绩、全部工作经历、全部实习、全部项目以及明确技能。
尤其不能遗漏证券从业资格、基金从业资格、法律职业资格、律师证、英语四六级、PMP 等证书。
每项保留原文证据。只输出 JSON：{"facts":[{"category":"education|certification|work|internship|project|skill","item":"事实项","evidence":"原文证据"}]}`,
      },
      { role: "user", content: source },
    ],
  });

  const facts: Fact[] = [...inventory.facts];
  for (const hint of certificateHints(source)) {
    const normalizedHint = normalize(hint);
    const exists = facts.some(
      (fact) => fact.category === "certification" &&
        (normalize(fact.item).includes(normalizedHint) || normalizedHint.includes(normalize(fact.item)))
    );
    if (!exists) facts.push({ category: "certification", item: hint, evidence: hint });
  }

  return facts;
}
