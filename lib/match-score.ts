import type { AnalysisData } from "./schemas";

type DecodedJD = AnalysisData["jdDecode"];

function tokens(value: string) {
  return value.toLowerCase().match(/[\u4e00-\u9fff]|[a-z0-9+#.]+/g) ?? [];
}

function overlaps(a: string, b: string) {
  const left = new Set(tokens(a));
  const right = new Set(tokens(b));
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  return intersection / Math.min(left.size, right.size);
}

function isNice(requirement: string, decoded: DecodedJD) {
  return decoded.niceToHaves.some((item) => overlaps(requirement, item) >= 0.45);
}

function isHardGate(requirement: string) {
  return /(必须|须有|硬性|资格证|执照|学历|本科|硕士|博士|年以上|年经验|certificate|license|required|years?)/i.test(requirement);
}

function rounded(value: number) {
  return Math.round(value * 100);
}

export function calculateDeterministicScore(data: AnalysisData, decoded: DecodedJD) {
  const requirements = data.requirements.map((item) => {
    const tier = item.tier === "must" && isNice(item.requirement, decoded) ? "nice" : item.tier;
    const matchScore = item.status === "met" ? 1 : item.status === "partial" ? 0.5 : 0;
    return { ...item, tier, matchScore };
  });
  const must = requirements.filter((item) => item.tier === "must");
  const nice = requirements.filter((item) => item.tier === "nice");
  const mustScore = must.length ? must.reduce((sum, item) => sum + item.matchScore, 0) / must.length : 0.5;
  const niceScore = nice.length ? nice.reduce((sum, item) => sum + item.matchScore, 0) / nice.length : 0.5;
  const hidden = decoded.hiddenSignals.map((signal) => {
    const match = data.hiddenSignalScores.find((item) => overlaps(signal, item.signal) >= 0.4);
    return match?.score ?? 0.5;
  });
  const hiddenScore = hidden.length ? hidden.reduce((sum, score) => sum + score, 0) / hidden.length : 0.5;

  const availableWeight = (must.length ? 0.6 : 0) + (nice.length ? 0.2 : 0) + (decoded.hiddenSignals.length ? 0.2 : 0);
  const weighted = ((must.length ? mustScore * 0.6 : 0) + (nice.length ? niceScore * 0.2 : 0) + (decoded.hiddenSignals.length ? hiddenScore * 0.2 : 0)) / (availableWeight || 1);
  const mustGaps = must.filter((item) => item.matchScore === 0);
  const hardGateMiss = mustGaps.some((item) => isHardGate(item.requirement));
  let score = rounded(weighted);
  if (mustGaps.length >= 2) score = Math.min(score, 55);
  else if (mustGaps.length === 1) score = Math.min(score, 75);
  if (hardGateMiss) score = Math.min(score, 35);

  const lower = Math.max(0, score - 6);
  const upper = Math.min(100, score + 6);
  const recommendation = hardGateMiss || score < 45 ? "skip" : mustGaps.length === 0 && score >= 72 ? "apply" : "cautious";
  const rationale = hardGateMiss
    ? "存在未满足的硬性门槛，除非有内推或特殊通道，否则建议谨慎评估。"
    : recommendation === "apply"
      ? "关键要求基本命中，建议投递并用证据审计结果优化简历。"
      : "存在部分要求或证据强度不足，建议补强后再投或带着明确假设投递。";

  return {
    requirements,
    score,
    scoreRange: `${lower}-${upper}%`,
    decision: { recommendation, rationale },
    scoreAudit: {
      formula: "Must Have 60% + Nice to Have 20% + Hidden Signals 20%（按实际存在的类别归一化）",
      mustHave: { score: rounded(mustScore), count: must.length },
      niceToHave: { score: rounded(niceScore), count: nice.length },
      hiddenSignals: { score: rounded(hiddenScore), count: decoded.hiddenSignals.length },
      mustHaveGaps: mustGaps.length,
      hardGateMiss,
    },
  };
}
