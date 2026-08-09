"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const PROFILE_KEY = "lvzhuan_profile";

export default function ProfileLoadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/profile/load/${id}`);
        if (!res.ok) {
          const data = await res.json();
          setErrorMsg(data.error ?? "加载失败");
          setStatus("error");
          return;
        }
        const { profile } = await res.json();
        localStorage.setItem(PROFILE_KEY, profile);
        setStatus("success");
        setTimeout(() => router.push("/map"), 1200);
      } catch {
        setErrorMsg("网络错误，请重试");
        setStatus("error");
      }
    }
    load();
  }, [id, router]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "#1a2744" }}
    >
      {status === "loading" && (
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 rounded-full border-2 border-blue-300 border-t-transparent animate-spin" />
          <p className="text-blue-200 text-base">正在加载你的能力档案…</p>
        </div>
      )}
      {status === "success" && (
        <div className="flex flex-col items-center gap-4">
          <span className="text-4xl">✓</span>
          <p className="text-white text-lg font-semibold">档案已恢复</p>
          <p className="text-blue-300 text-sm">正在跳转到能力地图…</p>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <span className="text-4xl">✕</span>
          <p className="text-white text-lg font-semibold">加载失败</p>
          <p className="text-blue-300 text-sm">{errorMsg}</p>
          <a
            href="/interview"
            className="mt-4 px-6 py-3 rounded bg-white text-[#1a2744] text-sm font-semibold"
          >
            重新开始访谈
          </a>
        </div>
      )}
    </main>
  );
}
