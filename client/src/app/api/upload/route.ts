import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "NO_FILE" }, { status: 400, headers: noStore });

    // Giới hạn ~5MB
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413, headers: noStore });
    }

    // Chỉ chấp nhận ảnh
    if (!/^image\//.test(file.type)) {
      return NextResponse.json({ error: "INVALID_TYPE" }, { status: 415, headers: noStore });
    }

    const ext = path.extname(file.name) || ".png";
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`; // URL công khai
    return NextResponse.json({ url }, { status: 201, headers: noStore });
  } catch (e) {
    console.error("UPLOAD ERROR:", e);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500, headers: noStore });
  }
}
