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
  const [resumeData, setResumeData] = useState<unknown>(null);
  const [instruction, setInstruction] = useState("");
  const [error, setError] = useState("");

  const [exporting, setExporting] = useState(false);

  async function exportDocx() {
    if (!html) return;
    setExporting(true);
    try {
      const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, name: "律转简历" }),
      });
      if (!res.ok) throw new Error("导出失败");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "律转简历.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "导出失败，请重试");
    } finally {
      setExporting(false);
    }
  }

  async function generate(withInstruction = false) {
    if (!jd.trim() || !profile.trim()) {
      setError("请填写能力档案和目标 JD");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = { jd, profile };
      if (withInstruction && instruction.trim() && resumeData) {
        body.instruction = instruction.trim();
        body.previousResume = resumeData;
      }
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成失败");
      setHtml(data.html);
      setResumeData(data.resumeData);
      setInstruction("");
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
            <p className="text-xs text-gray-400 mb-3 leading-5">
              把你看中的那条岗位描述完整贴进来。
            </p>
            <textarea
              className="w-full rounded-xl border border-gray-200 p-3 text-sm leading-6 resize-none focus:outline-none focus:border-blue-400 transition-colors"
              rows={9}
              placeholder="粘贴 JD 全文…"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm px-1">{error}</p>}

          <button
            onClick={() => generate(false)}
            disabled={loading}
            className="w-full h-12 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#1a2744" }}
          >
            {loading && !resumeData ? "生成中…" : "生成定制简历 →"}
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
                <button
                  onClick={exportDocx}
                  disabled={exporting}
                  className="text-sm font-semibold px-5 py-2 rounded-lg border transition-colors disabled:opacity-50"
                  style={{ borderColor: "#1a2744", color: "#1a2744" }}
                >
                  {exporting ? "导出中…" : "导出 Word"}
                </button>
              </div>

              <div className="flex-1 rounded-2xl overflow-hidden shadow-sm bg-white">
                <iframe
                  srcDoc={html}
                  className="w-full h-full min-h-[700px]"
                  title="简历预览"
                />
              </div>

              {/* Iterative edit */}
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="block h-px w-6" style={{ backgroundColor: "#1a2744" }} />
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#1a2744" }}>
                    按要求修改
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-5">
                  告诉 Agent 怎么调整这份简历，它会在原稿基础上修改，不会重新生成。
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="例：突出法律科技经验 / 针对字节 PM 岗改一版 / 把 summary 改得更有冲劲"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && generate(true)}
                  />
                  <button
                    onClick={() => generate(true)}
                    disabled={loading || !instruction.trim()}
                    className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-40"
                    style={{ backgroundColor: "#1a2744" }}
                  >
                    {loading ? "修改中…" : "修改 →"}
                  </button>
                </div>
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
                生成后可以用自然语言继续调整。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
