// src/app/api/products/id/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { bumpProductsCacheVersion } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

const json = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: noStoreHeaders });

/** GET /api/products/id/:id */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return json({ error: "INVALID_ID" }, 400);

  const p = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,        // Int
      description: true,
      image: true,        // DB dùng field "image"
      category: true,
      categoryId: true,
      stock: true,
      isActive: true,
      createdAt: true,
      // updatedAt: true, // mở nếu schema có @updatedAt
    },
  });

  return p ? json(p) : json({ error: "NOT_FOUND" }, 404);
}

/** PUT /api/products/id/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return json({ error: "INVALID_ID" }, 400);

  const body = await req.json().catch(() => ({}));

  // chỉ set price khi có gửi lên
  const hasPrice = body?.price !== undefined && body?.price !== null && !Number.isNaN(Number(body.price));
  const priceInt = hasPrice ? Math.trunc(Number(body.price)) : undefined;

  const data: Prisma.ProductUpdateInput = {
    name: body?.name ?? undefined,
    price: priceInt, // undefined nếu không gửi -> không đụng tới cột price
    description: body?.description ?? (body?.description === null ? null : undefined),
    category: body?.category ?? (body?.category === null ? null : undefined),
    image: body?.imageUrl ?? (body?.image === null ? null : body?.image ?? undefined),
    stock: typeof body?.stock === "number" ? body.stock : undefined,
    isActive: typeof body?.isActive === "boolean" ? body.isActive : undefined,
    // updatedAt: new Date(), // nếu schema chưa có @updatedAt thì mở dòng này
  };

  const product = await prisma.product.update({
    where: { id },
    data,
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      description: true,
      image: true,
      category: true,
      categoryId: true,
      stock: true,
      isActive: true,
      createdAt: true,
      // updatedAt: true,
    },
  });

  // ✅ invalidate cache danh sách/badges sau khi UPDATE thành công
  try {
    await bumpProductsCacheVersion();
  } catch (e) {
    console.warn("bump cache failed (ignored):", e);
  }

  return json({ message: "Updated", product });
}

/** DELETE /api/products/id/:id */
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return json({ error: "INVALID_ID" }, 400);

  await prisma.product.delete({ where: { id } });

  // ✅ invalidate cache sau khi DELETE thành công
  try {
    await bumpProductsCacheVersion();
  } catch (e) {
    console.warn("bump cache failed (ignored):", e);
  }

  return json({ message: "Deleted" });
}
