// src/app/api/admin/alerts/low-stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendLowStockEmail, queryLowStock } from "@/lib/low-stock";
import { redisSafe } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const COOLDOWN_SEC = Number(process.env.LOW_STOCK_COOLDOWN_SEC || 300); // 5 phút
const THROTTLE_KEY = "alerts:lowstock:lastsent";

function json(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

function authorized(req: NextRequest) {
  // Cho phép:
  // - Header: Authorization: Bearer <CRON_SECRET>
  // - Hoặc query: ?secret=<CRON_SECRET>
  const secret = process.env.CRON_SECRET || "";
  if (!secret) return process.env.NODE_ENV !== "production"; // dev: ko đặt thì cho qua

  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ") && auth.slice(7) === secret) return true;

  const url = new URL(req.url);
  if (url.searchParams.get("secret") === secret) return true;

  return false;
}

// Type-guard: chỉ set throttle nếu thực sự có { sent: number > 0 }
function hasSent(x: unknown): x is { sent: number } {
  return !!x && typeof (x as any).sent === "number" && (x as any).sent > 0;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return json({ ok: false, error: "UNAUTHORIZED" }, 401);

  const url = new URL(req.url);
  const preview = url.searchParams.get("preview") === "1";
  const force = url.searchParams.get("force") === "1";

  // parse threshold an toàn (optional)
  const t = url.searchParams.get("threshold");
  const threshold = t && !Number.isNaN(Number(t)) ? Number(t) : undefined;

  try {
    // Preview: chỉ xem dữ liệu, KHÔNG gửi mail
    if (preview) {
      const data = await queryLowStock(threshold);
      return json({ ok: true, preview: true, ...data });
    }

    // Throttle chống spam (trừ khi force=1)
    if (!force) {
      const last = await redisSafe((r) => r.get<number>(THROTTLE_KEY), 0);
      const now = Math.floor(Date.now() / 1000);
      if (last && now - last < COOLDOWN_SEC) {
        const wait = COOLDOWN_SEC - (now - last);
        return json({ ok: false, throttled: true, wait });
      }
    }

    const res = await sendLowStockEmail();

    // Chỉ set cooldown khi đã gửi thực sự
    if (hasSent(res)) {
      await redisSafe(
        (r) => r.set(THROTTLE_KEY, Math.floor(Date.now() / 1000), { ex: COOLDOWN_SEC }),
        null
      );
    }

    return json(res);
  } catch (e: any) {
    console.error("low-stock cron error:", e);
    return json({ ok: false, error: e?.message || "UNKNOWN" }, 500);
  }
}
