"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_JD, DEMO_PROFILE } from "@/lib/demo-data";

const PROFILE_KEY = "lvzhuan_profile";
const JD_KEY = "lvzhuan_jd";
const RESUME_CTX_KEY = "lvzhuan_resume_context";

interface PrepQuestion { question: string; competency: string; whyThisRole: string; evidence: string[]; preparation: string; star: { situation: string; task: string; action: string; result: string } }
interface PrepData { role: string; interviewThesis: string; questions: PrepQuestion[]; missingStories: string[] }
interface AnswerData { answer: string; evidenceUsed: string[]; followUps: string[] }

export default function InterviewPrepPage() {
  const [jd, setJd] = useState("");
  const [profile, setProfile] = useState("");
  const [resumeContext, setResumeContext] = useState("");
  const [data, setData] = useState<PrepData | null>(null);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<number, AnswerData>>({});
  const [answerInputs, setAnswerInputs] = useState<Record<number, string>>({});
  const [answerLoading, setAnswerLoading] = useState<number | null>(null);

  useEffect(() => { setJd(localStorage.getItem(JD_KEY) ?? ""); setProfile(localStorage.getItem(PROFILE_KEY) ?? ""); setResumeContext(localStorage.getItem(RESUME_CTX_KEY) ?? ""); }, []);

  async function prepare() {
    if (!jd.trim() || !profile.trim()) { setError("请先完成访谈并准备一份目标 JD"); return; }
    setError(""); setLoading(true); setData(null);
    try {
      const res = await fetch("/api/interview-prep", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jd, profile, resumeContext, demo }) });
      const result = await res.json(); if (!res.ok) throw new Error(result.error ?? "生成失败"); setData(result); setAnswers({});
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "面试准备失败，请重试"); } finally { setLoading(false); }
  }

  function loadDemo() { setJd(DEMO_JD); setProfile(DEMO_PROFILE); setResumeContext(""); setDemo(true); setData(null); setError(""); }

  async function generateAnswer(item: PrepQuestion, index: number) {
    setAnswerLoading(index);
    try {
      const res = await fetch("/api/interview-answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: item.question, competency: item.competency, star: item.star, evidence: item.evidence, profile, userMessage: answerInputs[index] ?? "", demo }) });
      const result = await res.json(); if (!res.ok) throw new Error(result.error ?? "回答生成失败");
      setAnswers((current) => ({ ...current, [index]: result }));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "回答生成失败，请重试"); } finally { setAnswerLoading(null); }
  }

  return <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f4f5f7" }}>
    <nav className="flex items-center justify-between px-10 py-5" style={{ backgroundColor: "#1a2744" }}><Link href="/" className="text-white text-sm font-semibold tracking-widest uppercase">◎ 律转</Link><span className="text-blue-300 text-sm">面试准备</span></nav>
    <main className="max-w-5xl mx-auto w-full p-4 sm:p-8 flex flex-col gap-5">
      <div className="flex gap-3 flex-wrap"><button onClick={loadDemo} className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-600">加载离线演示数据</button><Link href="/analyze" className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700">回到 JD 分析</Link><Link href="/resume" className="rounded-xl bg-[#1a2744] px-4 py-2 text-sm font-semibold text-white">去生成简历</Link></div>
      <section className="rounded-2xl bg-white p-6 shadow-sm"><div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#1a2744" }}>JD 驱动面试准备</div><p className="text-sm text-gray-500 leading-6">基于同一份目标 JD 和原始事实底座，预测问题并填好 STAR 框架。未知部分会标记为“待用户补充”，不会替你编答案。</p><button onClick={prepare} disabled={loading} className="mt-4 h-11 rounded-xl px-6 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "#2563eb" }}>{loading ? "生成中…" : "生成岗位面试准备"}</button>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}</section>
      {data && <><section className="rounded-2xl bg-[#1a2744] p-6 text-white"><div className="text-xs tracking-widest text-blue-300 uppercase">{data.role}</div><h1 className="mt-2 text-2xl font-bold">面试主线</h1><p className="mt-3 text-sm leading-7 text-blue-100">{data.interviewThesis}</p></section>
        {data.missingStories.length > 0 && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><div className="text-xs font-semibold tracking-widest uppercase text-amber-700">需要补故事的区域</div><ul className="mt-3 list-disc pl-5 text-sm leading-7 text-gray-700">{data.missingStories.map((item, i) => <li key={i}>{item}</li>)}</ul></section>}
        <div className="flex flex-col gap-4">{data.questions.map((item, i) => <details key={i} className="rounded-2xl bg-white p-6 shadow-sm" open={i === 0}><summary className="cursor-pointer"><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{i + 1}</span><span className="text-base font-semibold text-gray-800">{item.question}</span><span className="ml-2 text-xs text-blue-600">{item.competency}</span></summary><div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm"><div><div className="rounded-xl bg-blue-50 p-4"><div className="text-xs font-semibold text-blue-700">为什么这个岗位会问</div><p className="mt-2 leading-6 text-gray-700">{item.whyThisRole}</p><div className="mt-3 text-xs font-semibold text-blue-700">事实证据</div><p className="mt-2 leading-6 text-gray-700">{item.evidence.join("；") || "暂无事实证据"}</p></div><div className="mt-4 rounded-xl bg-gray-50 p-4"><div className="text-xs font-semibold text-gray-600">准备建议</div><p className="mt-2 leading-6 text-gray-700">{item.preparation}</p></div></div><div className="rounded-xl border border-blue-100 bg-white p-4 shadow-inner"><div className="flex items-center justify-between"><div className="text-xs font-semibold tracking-widest uppercase text-blue-700">AI 简要回答</div>{answers[i] && <span className="text-xs text-emerald-600">已基于事实生成</span>}</div>{answers[i] ? <><p className="mt-3 text-sm leading-7 text-gray-700">{answers[i].answer}</p><div className="mt-3 text-xs text-gray-400">使用证据：{answers[i].evidenceUsed.join("；")}</div></> : <p className="mt-3 text-xs leading-5 text-gray-400">点击下方按钮，先生成一版 30–60 秒口语回答。</p>}<textarea value={answerInputs[i] ?? ""} onChange={(e) => setAnswerInputs((current) => ({ ...current, [i]: e.target.value }))} rows={2} className="mt-3 w-full rounded-lg border border-gray-200 p-2 text-xs" placeholder="追问或修改：例如‘更突出跨部门协作’…" /><button onClick={() => generateAnswer(item, i)} disabled={answerLoading === i} className="mt-2 rounded-lg bg-[#1a2744] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{answerLoading === i ? "生成中…" : answers[i] ? "按我的要求再改一版" : "生成简要回答"}</button>{answers[i]?.followUps.length ? <div className="mt-3 text-xs text-gray-500">建议追问：{answers[i].followUps.join("；")}</div> : null}</div></div><div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">{(["situation", "task", "action", "result"] as const).map((key) => <div key={key} className="rounded-xl border border-gray-100 p-3"><div className="text-xs font-semibold uppercase text-gray-400">{key === "situation" ? "S 情境" : key === "task" ? "T 任务" : key === "action" ? "A 行动" : "R 结果"}</div><p className="mt-2 text-sm leading-6 text-gray-700">{item.star[key]}</p></div>)}</div></details>)}</div></>}
    </main>
  </div>;
}
