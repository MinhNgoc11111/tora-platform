import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  url.pathname = "/api/admin/alerts/low-stock";
  return NextResponse.rewrite(url); // hoặc: return NextResponse.redirect(url, 307);
}
