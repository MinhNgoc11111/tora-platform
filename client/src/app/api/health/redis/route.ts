import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";


export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json(
        { ok: false, error: "REDIS_NOT_CONFIGURED" },
        { status: 500 }
      );
    }
    const key = "health:ping";
    const now = Date.now();
    await redis.set(key, now, { ex: 30 });
    const val = await redis.get<number>(key);
    return NextResponse.json({ ok: true, wrote: now, read: val });
  } catch (e) {
    console.error("redis health error:", e);
    return NextResponse.json({ ok: false, error: "REDIS_ERROR" }, { status: 500 });
  }
}
