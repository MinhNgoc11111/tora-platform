import { NextResponse } from "next/server";
import { getLowStockData, renderLowStockEmail } from "@/lib/low-stock";

function isDev() {
  return process.env.NODE_ENV !== "production";
}

export async function GET(req: Request) {
  // Prod thì yêu cầu header bảo mật; Dev thì cho phép truy cập trực tiếp
  if (!isDev()) {
    const key = req.headers.get("x-cron-key") || "";
    if (!key || key !== (process.env.CRON_SECRET || "")) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(req.url);
  const threshold = Number(
    url.searchParams.get("threshold") ??
      process.env.LOW_STOCK_THRESHOLD ??
      5
  );

  const data = await getLowStockData(threshold);
  const email = renderLowStockEmail(data);

  return NextResponse.json({
    ok: true,
    threshold,
    counts: { out: data.out.length, low: data.low.length, total: data.total },
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
}
