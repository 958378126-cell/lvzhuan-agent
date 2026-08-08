"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "assistant" | "user";
  text: string;
}

const OPENING: Message = {
  role: "assistant",
  text: "你好。我们从一个简单的问题开始——\n\n你最近一份工作（或实习）的正式头衔是什么？在哪家机构？",
};

const PROFILE_KEY = "lvzhuan_profile";
const MESSAGES_KEY = "lvzhuan_interview_messages";

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [OPENING];
    try {
      const saved = localStorage.getItem(MESSAGES_KEY);
      return saved ? JSON.parse(saved) : [OPENING];
    } catch {
      return [OPENING];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

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
        body: JSON.stringify({ messages: updated }),
      });

      if (res.status === 503) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: "⚠️ 还没有配置 API key。在 `.env.local` 里填入 `ANTHROPIC_API_KEY` 并重启服务，访谈就可以开始了。",
          },
        ]);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.done) {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: data.reply },
        ]);
        localStorage.setItem(PROFILE_KEY, data.profile ?? "");
        setDone(true);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "网络出错了，请重试一下。" },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
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
    setMessages([OPENING]);
    setDone(false);
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f4f5f7" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-10 py-5 flex-none"
        style={{ backgroundColor: "#1a2744" }}
      >
        <Link href="/" className="text-white text-sm font-semibold tracking-widest uppercase">
          ◎ 律转
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-blue-300 text-sm">对齐访谈</span>
          <button
            onClick={restart}
            className="text-blue-400 text-xs hover:text-white transition-colors"
          >
            重新开始
          </button>
        </div>
      </nav>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-5">
          {/* Intro card */}
          <div
            className="rounded-2xl p-6 mb-2"
            style={{ backgroundColor: "#1a2744" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="block h-px w-5 bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-widest uppercase">对齐访谈</span>
            </div>
            <p className="text-blue-100 text-sm leading-7">
              我会一个问题一个问题地问你。你答得笼统，我会追问到具体的场景和结果。
              访谈结束后自动生成你的能力档案，用来匹配任意 JD 生成定制简历。
            </p>
          </div>

          {/* Messages */}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-none mr-3 mt-1"
                  style={{ backgroundColor: "#1a2744" }}
                >
                  ◎
                </div>
              )}
              <div
                className={`max-w-lg rounded-2xl px-5 py-4 text-sm leading-7 whitespace-pre-wrap ${
                  m.role === "user"
                    ? "text-white rounded-br-sm"
                    : "text-gray-800 rounded-bl-sm"
                }`}
                style={{
                  backgroundColor: m.role === "user" ? "#1a2744" : "#ffffff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex justify-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-none mr-3 mt-1"
                style={{ backgroundColor: "#1a2744" }}
              >
                ◎
              </div>
              <div
                className="rounded-2xl rounded-bl-sm px-5 py-4"
                style={{ backgroundColor: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              >
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}

          {/* Done state */}
          {done && (
            <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: "#1a2744" }}>
              <p className="text-white font-semibold mb-2">能力档案已生成</p>
              <p className="text-blue-200 text-sm mb-5">档案已保存到本地，现在可以去生成定制简历了。</p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/resume"
                  className="px-6 py-2.5 rounded-lg bg-white text-[#1a2744] text-sm font-semibold hover:bg-blue-50 transition-colors"
                >
                  生成简历 →
                </Link>
                <Link
                  href="/map"
                  className="px-6 py-2.5 rounded-lg border border-blue-400 text-blue-300 text-sm font-semibold hover:bg-blue-900/30 transition-colors"
                >
                  查看能力地图
                </Link>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      {!done && (
        <div
          className="flex-none border-t px-4 py-4"
          style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
        >
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
