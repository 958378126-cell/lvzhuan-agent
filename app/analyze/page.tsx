"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_JD, DEMO_PROFILE } from "@/lib/demo-data";

const PROFILE_KEY = "lvzhuan_profile";
const JD_KEY = "lvzhuan_jd";

interface Strength { point: string; detail: string }
interface Gap { point: string; detail: string }
interface Suggestion { action: string; priority: "high" | "medium" | "low" }

interface AnalysisResult {
  score: number;
  summary: string;
  strengths: Strength[];
  gaps: Gap[];
  suggestions: Suggestion[];
  keywords: string[];
}

const priorityLabel = { high: "优先", medium: "建议", low: "可选" };
const priorityColor = { high: "#e53e3e", medium: "#d97706", low: "#6b7280" };

interface EmailDraft {
  email: string;
  subject: string;
  body: string;
}

export default function AnalyzePage() {
  const [jd, setJd] = useState("");
  const [profile, setProfile] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const [draftLoading, setDraftLoading] = useState(false);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [showDraft, setShowDraft] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    setProfile(localStorage.getItem(PROFILE_KEY) ?? "");
    setJd(localStorage.getItem(JD_KEY) ?? "");
  }, []);

  async function draftEmail() {
    setDraftLoading(true);
    setDraft(null);
    setShowDraft(true);
    try {
      const res = await fetch("/api/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, profile, demo: demoMode }),
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
    if (!draft) return;
    const mailto = `mailto:${encodeURIComponent(draft.email)}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    window.open(mailto, "_blank");
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
      const res = await fetch("/api/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, profile, demo: demoMode }),
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

  function loadDemo() {
    setProfile(DEMO_PROFILE);
    setJd(DEMO_JD);
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
                能力档案
              </span>
            </div>
            <textarea
              className="w-full rounded-xl border border-gray-200 p-3 text-sm leading-6 resize-none focus:outline-none focus:border-blue-400 transition-colors"
              rows={9}
              placeholder="粘贴你的能力档案…"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            />
          </div>

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
                  <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest">匹配度</div>
                  <div className="text-lg font-bold" style={{ color: "#1a2744" }}>
                    {result.summary}
                  </div>
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
                        <div className="text-sm font-medium text-gray-800">
                          {draft.email || <span className="text-amber-500">JD 中未找到投递邮箱，请手动填写</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">主题</div>
                        <div className="text-sm font-medium text-gray-800">{draft.subject}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">正文</div>
                        <div className="text-sm text-gray-700 leading-7 whitespace-pre-wrap bg-gray-50 rounded-xl p-4">{draft.body}</div>
                      </div>
                      <p className="text-xs text-gray-400">确认内容无误后点击发送，将通过你的默认邮件客户端投递。</p>
                      <button
                        onClick={sendEmail}
                        disabled={!draft.email}
                        className="w-full h-11 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                        style={{ backgroundColor: "#2563eb" }}
                      >
                        在默认邮件客户端中打开 →
                      </button>
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
