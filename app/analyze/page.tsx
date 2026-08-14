"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_JD, DEMO_PROFILE } from "@/lib/demo-data";

const PROFILE_KEY = "lvzhuan_profile";
const JD_KEY = "lvzhuan_jd";
const RESUME_CTX_KEY = "lvzhuan_resume_context";

interface Strength { point: string; detail: string }
interface Gap { point: string; detail: string }
interface Suggestion { action: string; priority: "high" | "medium" | "low" }
interface VerifiedFact { category: string; item: string; evidence: string }
interface Requirement { requirement: string; status: "met" | "partial" | "gap"; tier: "must" | "nice"; matchScore: number; evidence: string; action: string }
interface Translation { source: string; translated: string; targetRequirement: string; matchType: "direct" | "transferable" | "adjacent" }
interface JDDecode { role: string; level: string; responsibilities: string[]; mustHaves: string[]; niceToHaves: string[]; hiddenSignals: string[]; assumptions: string[] }
interface Risk { risk: string; concern: string; response: string }
interface ScoreAudit { formula: string; mustHave: { score: number; count: number }; niceToHave: { score: number; count: number }; hiddenSignals: { score: number; count: number }; mustHaveGaps: number; hardGateMiss: boolean }

interface AnalysisResult {
  score: number;
  scoreRange: string;
  summary: string;
  decision: { recommendation: "apply" | "cautious" | "skip"; rationale: string };
  jdDecode: JDDecode;
  risks: Risk[];
  scoreAudit: ScoreAudit;
  strengths: Strength[];
  gaps: Gap[];
  suggestions: Suggestion[];
  keywords: string[];
  verifiedFacts: VerifiedFact[];
  requirements: Requirement[];
  translations: Translation[];
}

const priorityLabel = { high: "优先", medium: "建议", low: "可选" };
const priorityColor = { high: "#e53e3e", medium: "#d97706", low: "#6b7280" };
const decisionLabel = { apply: "值得投", cautious: "谨慎投", skip: "不建议投" };
const decisionColor = { apply: "#16a34a", cautious: "#d97706", skip: "#e53e3e" };

interface EmailDraft {
  email: string;
  subject: string;
  body: string;
}

export default function AnalyzePage() {
  const [jd, setJd] = useState("");
  const [profile, setProfile] = useState("");
  const [resumeContext, setResumeContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const [draftLoading, setDraftLoading] = useState(false);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [showDraft, setShowDraft] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  useEffect(() => {
    setProfile(localStorage.getItem(PROFILE_KEY) ?? "");
    setJd(localStorage.getItem(JD_KEY) ?? "");
    setResumeContext(localStorage.getItem(RESUME_CTX_KEY) ?? "");
  }, []);

  async function draftEmail() {
    setDraftLoading(true);
    setDraft(null);
    setShowDraft(true);
    try {
      const res = await fetch("/api/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, profile, resumeContext, analysis: result, demo: demoMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成失败");
      setDraft(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "生成投递邮件失败，请重试");
      setShowDraft(false);
    } finally {
      setDraftLoading(false);
    }
  }

  function sendEmail() {
    if (!draft?.email.trim()) {
      setError("请先填写收件人邮箱；如果 JD 没有公开邮箱，可以手动填入招聘方邮箱");
      return;
    }
    const mailto = `mailto:${encodeURIComponent(draft.email)}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    window.location.href = mailto;
  }

  async function copyDraft() {
    if (!draft) return;
    const text = `收件人：${draft.email}\n主题：${draft.subject}\n\n${draft.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedDraft(true);
      window.setTimeout(() => setCopiedDraft(false), 1800);
    } catch {
      setError("复制失败，请手动选中邮件内容复制");
    }
  }

  async function analyze() {
    if (!jd.trim() || !profile.trim()) {
      setError("请填写能力档案和目标 JD");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      localStorage.setItem(PROFILE_KEY, profile);
      localStorage.setItem(JD_KEY, jd);
      if (resumeContext.trim()) localStorage.setItem(RESUME_CTX_KEY, resumeContext);
      const res = await fetch("/api/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, profile, resumeContext, demo: demoMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "分析失败");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "分析失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function recognizeJDImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("图片不能超过 8MB，请先压缩后再上传");
      return;
    }
    setError("");
    setOcrLoading(true);
    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("图片读取失败"));
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/ocr-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "图片识别失败");
      setJd(data.text);
      setDemoMode(false);
      localStorage.setItem(JD_KEY, data.text);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "图片识别失败，请重试");
    } finally {
      setOcrLoading(false);
    }
  }

  function loadDemo() {
    setProfile(DEMO_PROFILE);
    setJd(DEMO_JD);
    setResumeContext("");
    setDemoMode(true);
    setResult(null);
    setError("");
    localStorage.setItem(PROFILE_KEY, DEMO_PROFILE);
    localStorage.setItem(JD_KEY, DEMO_JD);
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f4f5f7" }}>
      <nav
        className="flex items-center justify-between px-10 py-5"
        style={{ backgroundColor: "#1a2744" }}
      >
        <Link href="/" className="text-white text-sm font-semibold tracking-widest uppercase">
          ◎ 律转
        </Link>
        <span className="text-blue-300 text-sm">JD 匹配分析</span>
      </nav>

      <div className="flex flex-1 flex-col lg:flex-row gap-6 p-4 sm:p-8 max-w-7xl mx-auto w-full min-w-0">
        {/* Left: inputs */}
        <div className="flex flex-col gap-6 w-full lg:w-96 flex-none min-w-0">
          <button
            onClick={loadDemo}
            className="w-full h-11 rounded-xl border text-sm font-semibold bg-white"
            style={{ borderColor: "#2563eb", color: "#2563eb" }}
          >
            加载离线演示数据
          </button>
          {demoMode && <p className="text-xs text-blue-600 -mt-4">离线演示已启用，不调用外部 AI 服务。</p>}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="block h-px w-6" style={{ backgroundColor: "#1a2744" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#1a2744" }}>
                AI 能力总结
              </span>
            </div>
            <textarea
              className="w-full rounded-xl border border-gray-200 p-3 text-sm leading-6 resize-none focus:outline-none focus:border-blue-400 transition-colors"
              rows={9}
              placeholder="粘贴你的能力档案…"
              value={profile}
              onChange={(e) => { setProfile(e.target.value); setDemoMode(false); }}
            />
          </div>

          <details className="rounded-2xl bg-white p-6 shadow-sm" open={!resumeContext.trim()}>
            <summary className="cursor-pointer text-xs font-semibold tracking-widest uppercase" style={{ color: "#1a2744" }}>
              原始简历事实底座 {resumeContext.trim() ? "✓" : "（建议补充）"}
            </summary>
            <p className="text-xs text-gray-400 my-3 leading-5">
              粘贴原始简历全文，确保证书、教育及所有工作/实习经历不会被能力总结遗漏。
            </p>
            <textarea
              className="w-full rounded-xl border border-gray-200 p-3 text-sm leading-6 resize-y focus:outline-none focus:border-blue-400"
              rows={8}
              placeholder="粘贴原始简历全文，证券从业资格证等硬背景会以这里为准…"
              value={resumeContext}
              onChange={(event) => { setResumeContext(event.target.value); setDemoMode(false); }}
            />
          </details>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="block h-px w-6" style={{ backgroundColor: "#1a2744" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#1a2744" }}>
                目标 JD
              </span>
            </div>
            <textarea
              className="w-full rounded-xl border border-gray-200 p-3 text-sm leading-6 resize-none focus:outline-none focus:border-blue-400 transition-colors"
              rows={9}
              placeholder="粘贴 JD 全文…"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-400 leading-5">无法复制文字？上传 JD 截图，Agent 会先 OCR，识别后仍可手动修改。</p>
              <label className="flex-none cursor-pointer rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                {ocrLoading ? "识别中…" : "上传图片识别"}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={ocrLoading} onChange={recognizeJDImage} />
              </label>
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm leading-6">
              <span className="font-semibold">分析未完成：</span>{error}
            </div>
          )}

          <button
            onClick={analyze}
            disabled={loading}
            className="w-full h-12 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#1a2744" }}
          >
            {loading ? "分析中…" : "分析匹配度 →"}
          </button>

          {result && (
            <Link
              href="/resume"
              className="w-full h-12 rounded-xl border text-sm font-semibold flex items-center justify-center transition-colors"
              style={{ borderColor: "#1a2744", color: "#1a2744" }}
            >
              去生成定制简历 →
            </Link>
          )}

          {result && (
            <Link
              href="/interview-prep"
              className="w-full h-12 rounded-xl border text-sm font-semibold flex items-center justify-center transition-colors"
              style={{ borderColor: "#2563eb", color: "#2563eb" }}
            >
              准备岗位面试 →
            </Link>
          )}

          {result && (
            <button
              onClick={draftEmail}
              disabled={draftLoading}
              className="w-full h-12 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ backgroundColor: "#2563eb" }}
            >
              {draftLoading ? "生成投递邮件中…" : "生成投递邮件 →"}
            </button>
          )}
        </div>

        {/* Right: result */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {result ? (
            <>
              {/* Score */}
              <div className="rounded-2xl bg-white p-6 shadow-sm flex items-center gap-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-none"
                  style={{
                    backgroundColor:
                      result.score >= 75 ? "#16a34a" : result.score >= 50 ? "#d97706" : "#e53e3e",
                  }}
                >
                  {result.score}
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest">匹配度 {result.scoreRange ? `· ${result.scoreRange}` : ""}</div>
                  <div className="text-lg font-bold" style={{ color: "#1a2744" }}>
                    {result.summary}
                  </div>
                </div>
                <div className="ml-auto text-center rounded-xl px-4 py-3" style={{ backgroundColor: `${decisionColor[result.decision.recommendation]}15` }}>
                  <div className="text-xs text-gray-400 mb-1">投递建议</div>
                  <div className="text-base font-bold" style={{ color: decisionColor[result.decision.recommendation] }}>{decisionLabel[result.decision.recommendation]}</div>
                  <div className="text-xs text-gray-500 mt-1 max-w-xs">{result.decision.rationale}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#1a2744" }}>JD 解码 · 招聘经理真正想招什么</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">岗位 / 级别：</span>{result.jdDecode.role} · {result.jdDecode.level}</div>
                  <div><span className="text-gray-400">职责：</span>{result.jdDecode.responsibilities.join("；")}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="rounded-xl bg-red-50 p-4"><div className="text-xs font-semibold text-red-700 mb-2">Must Have</div><div className="text-xs text-gray-700 leading-5">{result.jdDecode.mustHaves.join("；") || "未识别"}</div></div>
                  <div className="rounded-xl bg-amber-50 p-4"><div className="text-xs font-semibold text-amber-700 mb-2">Nice to Have</div><div className="text-xs text-gray-700 leading-5">{result.jdDecode.niceToHaves.join("；") || "未识别"}</div></div>
                  <div className="rounded-xl bg-blue-50 p-4"><div className="text-xs font-semibold text-blue-700 mb-2">Hidden Signals</div><div className="text-xs text-gray-700 leading-5">{result.jdDecode.hiddenSignals.join("；") || "未识别"}</div></div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#1a2744" }}>匹配分审计 · 程序计算</div>
                <p className="text-xs text-gray-500 leading-5">{result.scoreAudit.formula}</p>
                <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                  <div className="rounded-lg bg-red-50 p-2"><div className="text-xs text-gray-500">Must Have</div><div className="font-bold text-red-700">{result.scoreAudit.mustHave.score}%</div><div className="text-xs text-gray-400">{result.scoreAudit.mustHave.count} 条</div></div>
                  <div className="rounded-lg bg-amber-50 p-2"><div className="text-xs text-gray-500">Nice to Have</div><div className="font-bold text-amber-700">{result.scoreAudit.niceToHave.score}%</div><div className="text-xs text-gray-400">{result.scoreAudit.niceToHave.count} 条</div></div>
                  <div className="rounded-lg bg-blue-50 p-2"><div className="text-xs text-gray-500">Hidden Signals</div><div className="font-bold text-blue-700">{result.scoreAudit.hiddenSignals.score}%</div><div className="text-xs text-gray-400">{result.scoreAudit.hiddenSignals.count} 条</div></div>
                </div>
              </div>

              {/* Keywords */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#1a2744" }}>
                  JD 关键词
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((k) => (
                    <span
                      key={k}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "#e8f0fe", color: "#1a2744" }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified hard facts */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#1a2744" }}>
                  硬背景核对 · 以原始简历为准
                </div>
                <div className="flex flex-col gap-3">
                  {result.verifiedFacts.map((fact, index) => (
                    <div key={`${fact.category}-${index}`} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="text-sm font-semibold text-gray-800">{fact.item}</div>
                      <div className="text-xs text-gray-400 mt-1">{fact.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirement audit */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#1a2744" }}>
                  JD 要求逐项核对
                </div>
                <div className="flex flex-col gap-4">
                  {result.requirements.map((item, index) => {
                    const label = item.status === "met" ? "已满足" : item.status === "partial" ? "部分满足" : "真实缺口";
                    const color = item.status === "met" ? "#16a34a" : item.status === "partial" ? "#d97706" : "#e53e3e";
                    return (
                      <div key={index} className="rounded-xl border border-gray-100 p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-semibold px-2 py-1 rounded flex-none" style={{ backgroundColor: `${color}18`, color }}>{label}</span>
                          <div>
                        <div className="flex items-center gap-2"><div className="text-sm font-semibold text-gray-800">{item.requirement}</div><span className="text-xs text-gray-400">{item.tier === "must" ? "Must" : "Nice"} · {Math.round(item.matchScore * 100)}%</span></div>
                            <div className="text-xs text-gray-500 mt-1 leading-5">依据：{item.evidence}</div>
                            <div className="text-xs text-gray-700 mt-1 leading-5">下一步：{item.action}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {result.translations.length > 0 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#2563eb" }}>
                    经历 → JD 能力转译
                  </div>
                  <div className="flex flex-col gap-4">
                    {result.translations.map((item, index) => (
                      <div key={index} className="rounded-xl bg-blue-50 p-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-xs text-gray-500">原事实：{item.source}</div>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: item.matchType === "direct" ? "#dcfce7" : item.matchType === "transferable" ? "#dbeafe" : "#fef3c7", color: item.matchType === "direct" ? "#15803d" : item.matchType === "transferable" ? "#1d4ed8" : "#b45309" }}>
                            {item.matchType === "direct" ? "直接匹配" : item.matchType === "transferable" ? "可迁移能力" : "邻近能力"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-800 mt-2 leading-6">建议表达：{item.translated}</div>
                        <div className="text-xs text-blue-600 mt-2">对应：{item.targetRequirement}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.risks.length > 0 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#d97706" }}>招聘经理可能担心的风险</div>
                  <div className="flex flex-col gap-3">
                    {result.risks.map((item, index) => <div key={index} className="rounded-xl border border-amber-100 bg-amber-50 p-4"><div className="text-sm font-semibold text-gray-800">{item.risk}</div><div className="text-xs text-gray-600 mt-1">担心：{item.concern}</div><div className="text-xs text-blue-700 mt-1">回应方向：{item.response}</div></div>)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Strengths */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#16a34a" }}>
                    ✓ 匹配优势
                  </div>
                  <div className="flex flex-col gap-3">
                    {result.strengths.map((s, i) => (
                      <div key={i}>
                        <div className="text-sm font-semibold text-gray-800">{s.point}</div>
                        <div className="text-xs text-gray-400 mt-0.5 leading-5">{s.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaps */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#e53e3e" }}>
                    ✗ 能力缺口
                  </div>
                  <div className="flex flex-col gap-3">
                    {result.gaps.map((g, i) => (
                      <div key={i}>
                        <div className="text-sm font-semibold text-gray-800">{g.point}</div>
                        <div className="text-xs text-gray-400 mt-0.5 leading-5">{g.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#1a2744" }}>
                  → 行动建议
                </div>
                <div className="flex flex-col gap-3">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded flex-none mt-0.5"
                        style={{
                          backgroundColor: priorityColor[s.priority] + "20",
                          color: priorityColor[s.priority],
                        }}
                      >
                        {priorityLabel[s.priority]}
                      </span>
                      <span className="text-sm text-gray-700 leading-6">{s.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email draft */}
              {showDraft && (
                <div className="rounded-2xl bg-white p-6 shadow-sm border-2" style={{ borderColor: "#2563eb" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#2563eb" }}>
                      投递邮件草稿
                    </div>
                    <button onClick={() => setShowDraft(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                  </div>
                  {draftLoading ? (
                    <p className="text-sm text-gray-400">Agent 正在起草邮件…</p>
                  ) : draft ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">收件人</div>
                        <input
                          value={draft.email}
                          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                          placeholder="JD 未提供邮箱，请手动填写"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">主题</div>
                        <input
                          value={draft.subject}
                          onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">正文</div>
                        <textarea
                          value={draft.body}
                          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                          rows={9}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-700 outline-none focus:border-blue-400"
                        />
                      </div>
                      <div className="rounded-xl bg-blue-50 p-4 text-xs leading-6 text-blue-800">
                        <div className="font-semibold">建议投递步骤</div>
                        <div>1. 先到“生成定制简历”下载 PDF；2. 检查并修改这封邮件；3. 打开邮件客户端后，手动添加 PDF 附件并确认发送。</div>
                        <div className="mt-1 text-blue-600">浏览器不会在未经确认的情况下自动发送邮件，也不能通过 mailto 自动添加附件。</div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Link
                          href="/resume"
                          className="flex h-11 items-center justify-center rounded-xl border border-[#1a2744] text-sm font-semibold text-[#1a2744]"
                        >
                          去下载 PDF 简历
                        </Link>
                        <button
                          onClick={copyDraft}
                          className="h-11 rounded-xl border border-blue-300 text-sm font-semibold text-blue-600"
                        >
                          {copiedDraft ? "已复制" : "复制邮件内容"}
                        </button>
                        <button
                          onClick={sendEmail}
                          disabled={!draft.email.trim()}
                          className="h-11 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                          style={{ backgroundColor: "#2563eb" }}
                        >
                          打开邮箱确认 →
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          ) : (
            <div
              className="flex-1 rounded-2xl flex flex-col items-center justify-center text-center p-12"
              style={{ backgroundColor: "#1a2744" }}
            >
              <span className="text-blue-300 text-4xl mb-6">◎</span>
              <p className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                分析 JD 匹配度
              </p>
              <p className="text-blue-200 text-sm leading-7 max-w-xs">
                粘入你的档案和目标 JD，Agent 会对比两者，
                告诉你哪里打、哪里补、用什么关键词包装自己。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
