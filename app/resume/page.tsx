"use client";

import { useState } from "react";
import Link from "next/link";

const PROFILE_KEY = "lvzhuan_profile";

export default function ResumePage() {
  const [jd, setJd] = useState("");
  const [profile, setProfile] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(PROFILE_KEY) ?? "" : ""
  );
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    if (!jd.trim() || !profile.trim()) {
      setError("请填写能力档案和目标 JD");
      return;
    }
    setError("");
    setLoading(true);
    setHtml("");
    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成失败");
      setHtml(data.html);
      localStorage.setItem(PROFILE_KEY, profile);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function printResume() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f4f5f7" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-10 py-5"
        style={{ backgroundColor: "#1a2744" }}
      >
        <Link href="/" className="text-white text-sm font-semibold tracking-widest uppercase">
          ◎ 律转
        </Link>
        <span className="text-blue-300 text-sm">简历生成</span>
      </nav>

      <div className="flex flex-1 gap-6 p-8 max-w-7xl mx-auto w-full">
        {/* Left: inputs */}
        <div className="flex flex-col gap-6 w-96 flex-none">
          {/* Profile */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="block h-px w-6" style={{ backgroundColor: "#1a2744" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#1a2744" }}>
                能力档案
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-5">
              粘贴你的能力档案（访谈生成的内容）。首次填写后会自动保存。
            </p>
            <textarea
              className="w-full rounded-xl border border-gray-200 p-3 text-sm leading-6 resize-none focus:outline-none focus:border-blue-400 transition-colors"
              rows={10}
              placeholder="粘贴你的能力档案…"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            />
          </div>

          {/* JD */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="block h-px w-6" style={{ backgroundColor: "#1a2744" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#1a2744" }}>
                目标 JD
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-5">
              把你看中的那条岗位描述完整贴进来。
            </p>
            <textarea
              className="w-full rounded-xl border border-gray-200 p-3 text-sm leading-6 resize-none focus:outline-none focus:border-blue-400 transition-colors"
              rows={10}
              placeholder="粘贴 JD 全文…"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm px-1">{error}</p>
          )}

          <button
            onClick={generate}
            disabled={loading}
            className="w-full h-12 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#1a2744" }}
          >
            {loading ? "生成中…" : "生成定制简历 →"}
          </button>
        </div>

        {/* Right: preview */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {html ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="block h-px w-6" style={{ backgroundColor: "#1a2744" }} />
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#1a2744" }}>
                    简历预览
                  </span>
                </div>
                <button
                  onClick={printResume}
                  className="text-sm font-semibold px-5 py-2 rounded-lg border transition-colors"
                  style={{ borderColor: "#1a2744", color: "#1a2744" }}
                >
                  打印 / 存为 PDF
                </button>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden shadow-sm bg-white">
                <iframe
                  srcDoc={html}
                  className="w-full h-full min-h-[800px]"
                  title="简历预览"
                />
              </div>
            </>
          ) : (
            <div
              className="flex-1 rounded-2xl flex flex-col items-center justify-center text-center p-12"
              style={{ backgroundColor: "#1a2744" }}
            >
              <span className="text-blue-300 text-4xl mb-6">◎</span>
              <p
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                填入档案和 JD
              </p>
              <p className="text-blue-200 text-sm leading-7 max-w-xs">
                Agent 会从你的档案里挑出与这条 JD 最匹配的经历，
                用招聘方听得懂的语言重新包装，生成一份可直接投递的简历。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
