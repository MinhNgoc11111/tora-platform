import { NextResponse } from "next/server";
import { sendLowStockAlert } from "@/lib/low-stock";

function isAuthorized(req: Request) {
  const expected = process.env.CRON_SECRET || "";
  const got = req.headers.get("x-cron-key") || "";
  return !!expected && got === expected;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const preview =
    url.searchParams.get("preview") === "1" ||
    url.searchParams.get("dry") === "1";

  try {
    const result = await sendLowStockAlert({ preview });
    return NextResponse.json({ ok: true, preview, result });
  } catch (e: any) {
    console.error("cron low-stock error:", e);
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
