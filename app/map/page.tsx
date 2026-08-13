"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PROFILE_KEY = "lvzhuan_profile";

interface ParsedProfile {
  name: string;
  target: string;
  experiences: string[];
  strengths: string[];
  gaps: string[];
  keywords: string[];
}

function parseProfile(raw: string): ParsedProfile {
  const section = (heading: string) => {
    const re = new RegExp(`##\\s*${heading}[^\\n]*\\n([\\s\\S]*?)(?=\\n##|$)`);
    return raw.match(re)?.[1]?.trim() ?? "";
  };

  const listItems = (text: string) =>
    text
      .split("\n")
      .map((l) => l.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);

  const basicInfo = section("基本信息");
  const nameMatch = basicInfo.match(/姓名[：:]\s*(.+)/);
  const targetMatch = basicInfo.match(/目标岗位[：:]\s*(.+)/);
  const kwSection = section("关键词库");

  return {
    name: nameMatch?.[1]?.trim() ?? "",
    target: targetMatch?.[1]?.trim() ?? "Legaltech PM",
    experiences: [
      ...listItems(section("全部工作经历")),
      ...listItems(section("全部实习经历")),
      ...listItems(section("全部项目与其他经历")),
      ...listItems(section("核心经历")),
    ].filter((item) => item !== "未提供"),
    strengths: listItems(section("王牌能力（绿色）")),
    gaps: listItems(section("待补充区域（红色）")),
    keywords: kwSection
      .split(/[，,]/)
      .map((k) => k.trim())
      .filter(Boolean),
  };
}

export default function MapPage() {
  const [raw, setRaw] = useState<string | null>(null);

  useEffect(() => {
    setRaw(localStorage.getItem(PROFILE_KEY));
  }, []);

  if (raw === null) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f4f5f7" }}>
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400 text-sm">加载中…</div>
        </div>
      </div>
    );
  }

  if (!raw) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f4f5f7" }}>
        <Nav />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl"
            style={{ backgroundColor: "#1a2744" }}
          >
            ◎
          </div>
          <div>
            <p className="text-gray-800 font-semibold text-lg mb-2">还没有能力档案</p>
            <p className="text-gray-400 text-sm leading-6">
              完成对齐访谈后，能力地图会自动生成。
            </p>
          </div>
          <Link
            href="/interview"
            className="px-8 py-3 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: "#1a2744" }}
          >
            开始访谈 →
          </Link>
        </div>
      </div>
    );
  }

  const p = parseProfile(raw);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f4f5f7" }}>
      <Nav />

      <div className="max-w-4xl mx-auto w-full px-6 py-10 flex flex-col gap-6">
        {/* Header */}
        <div className="rounded-2xl p-8" style={{ backgroundColor: "#1a2744" }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="block h-px w-6 bg-blue-400" />
            <span className="text-blue-300 text-xs font-semibold tracking-widest uppercase">能力地图</span>
          </div>
          <h1
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {p.name || "你的"}能力档案
          </h1>
          <p className="text-blue-200 text-sm">目标方向：{p.target}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths — green */}
          <div className="rounded-2xl bg-white p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-none" />
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700">
                王牌能力
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {p.strengths.length ? (
                p.strengths.map((s, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-none" />
                    <span className="text-gray-700 text-sm leading-6">{s}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-sm">完成访谈后自动填入</li>
              )}
            </ul>
          </div>

          {/* Gaps — red */}
          <div className="rounded-2xl bg-white p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 flex-none" />
              <span className="text-xs font-semibold tracking-widest uppercase text-red-600">
                待补充区域
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {p.gaps.length ? (
                p.gaps.map((g, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-300 flex-none" />
                    <span className="text-gray-700 text-sm leading-6">{g}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-sm">完成访谈后自动填入</li>
              )}
            </ul>
          </div>
        </div>

        {/* Experiences */}
        {p.experiences.length > 0 && (
          <div className="rounded-2xl bg-white p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="block h-px w-6" style={{ backgroundColor: "#1a2744" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#1a2744" }}>
                核心经历
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {p.experiences.map((e, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span
                    className="mt-1 text-xs font-mono font-bold flex-none"
                    style={{ color: "#2d6cdf" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-gray-700 text-sm leading-6">{e}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Keywords */}
        {p.keywords.length > 0 && (
          <div className="rounded-2xl bg-white p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="block h-px w-6" style={{ backgroundColor: "#1a2744" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#1a2744" }}>
                关键词库
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.keywords.map((k, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: "#eef2fb",
                    color: "#2d6cdf",
                    borderBottom: "2px solid #c9d6ef",
                  }}
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-4">
          <Link
            href="/resume"
            className="flex-1 h-12 rounded-xl text-white text-sm font-semibold flex items-center justify-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1a2744" }}
          >
            用这份档案生成简历 →
          </Link>
          <Link
            href="/interview"
            className="h-12 px-6 rounded-xl border text-sm font-semibold flex items-center justify-center transition-colors hover:bg-gray-50"
            style={{ borderColor: "#1a2744", color: "#1a2744" }}
          >
            重新访谈
          </Link>
        </div>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <nav
      className="flex items-center justify-between px-10 py-5 flex-none"
      style={{ backgroundColor: "#1a2744" }}
    >
      <Link href="/" className="text-white text-sm font-semibold tracking-widest uppercase">
        ◎ 律转
      </Link>
      <span className="text-blue-300 text-sm">能力地图</span>
    </nav>
  );
}
