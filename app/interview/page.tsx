"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DEMO_RESUME_TEXT } from "@/lib/demo-data";

interface Message {
  role: "assistant" | "user";
  text: string;
  careerHypotheses?: CareerHypothesis[];
}

interface CareerHypothesis { role: string; why: string; evidence: string[]; toValidate: string }

const PROFILE_KEY = "lvzhuan_profile";
const MESSAGES_KEY = "lvzhuan_interview_messages";
const RESUME_CTX_KEY = "lvzhuan_resume_context";

type Step = "upload" | "chat";
type IntakeMode = "file" | "text";

export default function InterviewPage() {
  const [step, setStep] = useState<Step>("upload");
  const [intakeMode, setIntakeMode] = useState<IntakeMode>("file");
  const [resumeText, setResumeText] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [cloudSaving, setCloudSaving] = useState(false);
  const [cloudError, setCloudError] = useState("");
  const [copying, setCopying] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCtx = localStorage.getItem(RESUME_CTX_KEY);
    const savedMsgs = localStorage.getItem(MESSAGES_KEY);
    if (savedCtx && savedMsgs) {
      try {
        const msgs = JSON.parse(savedMsgs) as Message[];
        if (msgs.length > 0) {
          setResumeText(savedCtx);
          setMessages(msgs);
          setStep("chat");
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  async function parseFile(file: File) {
    setUploading(true);
    setUploadError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/parse-resume", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "解析失败");
      await startInterview(data.text);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "上传失败，请重试");
      setUploading(false);
    }
  }

  async function startInterview(text: string) {
    setUploading(true);
    setUploadError("");
    try {
      localStorage.setItem(RESUME_CTX_KEY, text);
      setResumeText(text);
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [], resumeContext: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "启动失败");
      const opening: Message = { role: "assistant", text: data.reply, careerHypotheses: data.careerHypotheses };
      setMessages([opening]);
      setStep("chat");
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "启动访谈失败，请重试");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const updated: Message[] = [...messages, { role: "user", text }];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, resumeContext: resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "访谈失败");
      if (data.done) {
        setMessages((m) => [...m, { role: "assistant", text: data.reply, careerHypotheses: data.careerHypotheses }]);
        localStorage.setItem(PROFILE_KEY, data.profile ?? "");
        setDone(true);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: data.reply, careerHypotheses: data.careerHypotheses }]);
      }
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : "访谈暂时失败，请重试一下。";
      setMessages((m) => [...m, { role: "assistant", text: message }]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  async function createCloudLink() {
    const profile = localStorage.getItem(PROFILE_KEY) ?? "";
    if (!profile || cloudSaving) return;
    setCloudSaving(true);
    setCloudError("");
    try {
      const res = await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "链接生成失败");
      setProfileId(data.id);
    } catch (error) {
      setCloudError(error instanceof Error ? error.message : "链接生成失败");
    } finally {
      setCloudSaving(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function restart() {
    localStorage.removeItem(MESSAGES_KEY);
    localStorage.removeItem(RESUME_CTX_KEY);
    setMessages([]);
    setResumeText("");
    setPasteText("");
    setDone(false);
    setProfileId(null);
    setCloudError("");
    setIntakeMode("file");
    setStep("upload");
  }

  async function startDemo() {
    setUploading(true);
    setUploadError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [], resumeContext: DEMO_RESUME_TEXT, demo: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "演示档案生成失败");
      localStorage.setItem(PROFILE_KEY, data.profile);
      setResumeText(DEMO_RESUME_TEXT);
      setMessages([{ role: "assistant", text: data.reply, careerHypotheses: data.careerHypotheses }]);
      setDone(true);
      setStep("chat");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "演示启动失败");
    } finally {
      setUploading(false);
    }
  }

  if (step === "upload") {
    return (
      <div className="studio-workspace interview-upload">
        <div className="workspace-masthead compact">
          <div><span className="folio">01 / 访谈</span><h1>从一份原稿开始。</h1></div>
          <p>上传简历，或直接粘贴。</p>
        </div>

        <div className="intake-stage">
          <div className="intake-shell">
            <div className="intake-modes" role="tablist" aria-label="选择简历输入方式">
              <button type="button" role="tab" aria-selected={intakeMode === "file"} className={intakeMode === "file" ? "is-active" : ""} onClick={() => setIntakeMode("file")}>上传文件</button>
              <button type="button" role="tab" aria-selected={intakeMode === "text"} className={intakeMode === "text" ? "is-active" : ""} onClick={() => setIntakeMode("text")}>粘贴文字</button>
            </div>

            {intakeMode === "file" ? (
              <div
                className={`intake-drop ${dragging ? "is-dragging" : ""}`}
                role="button"
                tabIndex={0}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
              >
                <span className="intake-index">01</span>
                <div>
                  <p>把简历放在这里。</p>
                  <span>{uploading ? "正在读取…" : "选择 Word 文件 ↗"}</span>
                </div>
                <small>.DOCX · 最大 5MB</small>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }}
                />
              </div>
            ) : (
              <div className="intake-text">
                <span className="intake-index">01</span>
              <textarea
                  rows={8}
                  placeholder="把简历原文粘贴到这里…"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
                <button
                  type="button"
                  onClick={() => pasteText.trim().length > 50 && startInterview(pasteText.trim())}
                  disabled={uploading || pasteText.trim().length < 50}
                  className="intake-primary"
                >
                  {uploading ? "正在读取…" : "开始访谈 ↗"}
                </button>
              </div>
            )}

            {uploadError && <p className="text-red-500 text-sm px-1">{uploadError}</p>}

            <button
              type="button"
              onClick={startDemo}
              disabled={uploading}
              className="intake-demo"
            >
              没有简历？使用示例档案
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-workspace interview-room">
      <div className="workspace-subbar">
        <span><b>01</b> 对齐访谈 · 正在从叙述中提取证据</span>
        <button onClick={restart}>重新开始</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
          <div className="agent-note rounded-2xl p-6 mb-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="block h-px w-5 bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-widest uppercase">对齐访谈</span>
            </div>
            <p className="text-sm leading-7">已读取底稿。接下来只追问场景、行动和结果；含糊的地方会标成待确认。</p>
          </div>

          {messages.map((m, i) => (
            <div key={i} className="flex flex-col">
              <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-none mr-3 mt-1" style={{ backgroundColor: "#1a2744" }}>◎</div>
                )}
                <div
                  className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-7 whitespace-pre-wrap ${m.role === "user" ? "text-white rounded-br-sm" : "text-gray-800 rounded-bl-sm"}`}
                  style={{ backgroundColor: m.role === "user" ? "#1a2744" : "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  {m.text}
                </div>
              </div>
              {m.careerHypotheses && m.careerHypotheses.length > 0 && (
                <div className="ml-10 mt-3 w-[calc(100%-2.5rem)] rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="text-xs font-semibold tracking-widest uppercase text-blue-700">初步职业方向 · 待验证假设</div>
                  <p className="mt-1 text-xs leading-5 text-blue-600">这些不是最终结论，Agent 会通过后续问题验证；也可以告诉它你完全不感兴趣。</p>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {m.careerHypotheses.map((item, index) => (
                      <div key={`${item.role}-${index}`} className="rounded-xl bg-white p-3">
                        <div className="text-sm font-semibold text-gray-800">{index + 1}. {item.role}</div>
                        <div className="mt-1 text-xs leading-5 text-gray-600">为什么：{item.why}</div>
                        <div className="mt-1 text-xs leading-5 text-gray-500">证据：{item.evidence.join("；")}</div>
                        <div className="mt-1 text-xs leading-5 text-blue-600">待验证：{item.toValidate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-none mr-3 mt-1" style={{ backgroundColor: "#1a2744" }}>◎</div>
              <div className="rounded-2xl rounded-bl-sm px-5 py-4" style={{ backgroundColor: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}

          {done && (
            <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: "#1a2744" }}>
              <p className="text-white font-semibold mb-2">能力档案已生成</p>
              <p className="text-blue-200 text-sm mb-4">档案已保存到本地，现在可以去分析 JD 或生成定制简历了。</p>

              {!profileId && (
                <div className="mb-5">
                  <button
                    onClick={createCloudLink}
                    disabled={cloudSaving}
                    className="px-4 py-2 rounded-lg border border-blue-400 text-blue-200 text-xs font-semibold disabled:opacity-40"
                  >
                    {cloudSaving ? "生成中…" : "生成跨设备档案链接（保存 90 天）"}
                  </button>
                  <p className="text-blue-400 text-xs mt-2">仅在你主动点击后上传；获得链接的人可以查看这份档案。</p>
                  {cloudError && <p className="text-amber-300 text-xs mt-2">{cloudError}</p>}
                </div>
              )}

              {profileId && (
                <div className="mb-5 rounded-xl p-4" style={{ backgroundColor: "#0f1a35" }}>
                  <p className="text-blue-300 text-xs mb-2">你的专属档案链接（任何设备打开都能恢复档案）</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-left text-xs text-blue-100 bg-blue-900/40 rounded-lg px-3 py-2 truncate">
                      {typeof window !== "undefined" ? `${window.location.origin}/profile/${profileId}` : `/profile/${profileId}`}
                    </code>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/profile/${profileId}`;
                        navigator.clipboard.writeText(url).then(() => {
                          setCopying(true);
                          setTimeout(() => setCopying(false), 2000);
                        });
                      }}
                      className="flex-none px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                      style={{ backgroundColor: copying ? "#22c55e" : "#3b82f6", color: "white" }}
                    >
                      {copying ? "已复制" : "复制"}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/analyze" className="px-6 py-2.5 rounded-lg bg-white text-[#1a2744] text-sm font-semibold hover:bg-blue-50 transition-colors">分析 JD →</Link>
                <Link href="/resume" className="px-6 py-2.5 rounded-lg border border-blue-400 text-blue-300 text-sm font-semibold hover:bg-blue-900/30 transition-colors">生成简历</Link>
                <Link href="/map" className="px-6 py-2.5 rounded-lg border border-blue-400 text-blue-300 text-sm font-semibold hover:bg-blue-900/30 transition-colors">能力地图</Link>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {!done && (
        <div className="flex-none border-t px-4 py-4" style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}>
          <div className="max-w-2xl mx-auto flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 resize-none focus:outline-none focus:border-blue-400 transition-colors"
              rows={2}
              placeholder="输入你的回答，Enter 发送，Shift+Enter 换行"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="h-11 px-5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-40 flex-none"
              style={{ backgroundColor: "#1a2744" }}
            >
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
