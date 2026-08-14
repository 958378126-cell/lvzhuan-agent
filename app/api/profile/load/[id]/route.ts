import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      return NextResponse.json({ error: "云端档案功能未配置" }, { status: 503 });
    }
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: "档案链接无效" }, { status: 400 });
    }
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });
    const profile = await redis.get<string>(`profile:${id}`);
    if (!profile) {
      return NextResponse.json({ error: "档案不存在或已过期" }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "档案读取失败，请稍后重试" }, { status: 502 });
  }
}
