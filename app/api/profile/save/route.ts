import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();
    if (!profile?.trim()) {
      return NextResponse.json({ error: "缺少 profile" }, { status: 400 });
    }
    if (profile.length > 40_000) {
      return NextResponse.json({ error: "档案内容过长" }, { status: 413 });
    }
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      return NextResponse.json(
        { error: "云端档案未配置；档案仍已安全保存在本浏览器" },
        { status: 503 }
      );
    }
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });
    const id = crypto.randomUUID();
    await redis.set(`profile:${id}`, profile, { ex: 60 * 60 * 24 * 90 });
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "云端档案保存失败；本地档案不受影响" }, { status: 502 });
  }
}
