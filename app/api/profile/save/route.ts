import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  const { profile } = await req.json();
  if (!profile?.trim()) {
    return NextResponse.json({ error: "缺少 profile" }, { status: 400 });
  }
  const id = crypto.randomUUID();
  await redis.set(`profile:${id}`, profile, { ex: 60 * 60 * 24 * 90 }); // 90天
  return NextResponse.json({ id });
}
