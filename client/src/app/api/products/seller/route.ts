// src/app/api/products/seller/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type OrderKey = "newest" | "price_asc" | "price_desc" | "name_asc";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") ?? "").trim();
    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize") ?? 24) || 24)
    );
    const order = (searchParams.get("order") as OrderKey) || "newest";
    const active = searchParams.get("active"); // "1" | "0"
    const oos = searchParams.get("oos");       // "1" -> stock <= 0

    const where: Prisma.ProductWhereInput = {
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
              { slug: { contains: q } },
            ],
          }
        : {}),
      ...(active === "1" ? { isActive: true } : active === "0" ? { isActive: false } : {}),
      ...(oos === "1" ? { stock: { lte: 0 } } : {}), // ✅ filter hết hàng chính xác ở DB
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      order === "price_asc"
        ? { price: Prisma.SortOrder.asc }
        : order === "price_desc"
        ? { price: Prisma.SortOrder.desc }
        : order === "name_asc"
        ? { name: Prisma.SortOrder.asc }
        : { createdAt: Prisma.SortOrder.desc };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          stock: true,
          isActive: true,
          image: true,
          categoryId: true,
          createdAt: true,
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    // Ép Decimal -> number (nếu dùng Decimal)
    const serialized = items.map((p) => ({ ...p, price: Number(p.price) }));

    return NextResponse.json(
      {
        items: serialized,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách sản phẩm (seller):", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Lỗi khi lấy danh sách sản phẩm" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  }
}
