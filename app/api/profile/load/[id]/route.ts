import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profile = await redis.get<string>(`profile:${id}`);
  if (!profile) {
    return NextResponse.json({ error: "档案不存在或已过期" }, { status: 404 });
  }
  return NextResponse.json({ profile });
}
