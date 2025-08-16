// src/app/api/products/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { resolveUniqueSlugFromName } from "@/lib/slug";
import { bumpProductsCacheVersion } from "@/lib/redis"; // ⬅️ thêm import

export const runtime = "nodejs";
// 🔒 TẮT CACHE CHO ROUTE NÀY
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

/* ========================
   GET /api/products
   ?q=&page=1&pageSize=24&order=newest|price_asc|price_desc
======================== */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 24)));
  const order = (searchParams.get("order") || "newest") as
    | "newest"
    | "price_asc"
    | "price_desc";

  // ✅ SQLite không có mode: "insensitive"
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { slug: { contains: q } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    order === "price_asc"
      ? { price: Prisma.SortOrder.asc }
      : order === "price_desc"
      ? { price: Prisma.SortOrder.desc }
      : { createdAt: Prisma.SortOrder.desc };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,   // Int/Decimal đều ép number ở dưới
        image: true,   // nếu schema là imageUrl -> đổi thành imageUrl
        createdAt: true,
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  // 🔁 Ép Decimal -> number để tránh lỗi hydrate
  const serialized = items.map((p) => ({ ...p, price: Number(p.price) }));

  return NextResponse.json(
    {
      items: serialized,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    { headers: noStore }
  );
}

/* ========================
   POST /api/products
======================== */
// Chấp nhận nhiều biến thể ảnh & field tuỳ chọn
const ProductInput = z
  .object({
    name: z.string().min(2),
    price: z.coerce.number().int().nonnegative(),
    image: z.string().optional(),
    imageUrl: z.string().optional(),
    images: z.array(z.string()).optional(), // nếu FE gửi mảng URL
    description: z.string().optional().nullable(),
    categoryId: z.coerce.number().int().optional(),
    stock: z.coerce.number().int().nonnegative().default(0),
    isActive: z.coerce.boolean().default(true),
  })
  .strict();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ProductInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400, headers: noStore }
      );
    }

    const d = parsed.data;

    // Ảnh đại diện: ưu tiên image -> imageUrl -> images[0] -> placeholder
    const finalImage = d.image ?? d.imageUrl ?? d.images?.[0] ?? "/placeholder.png";

    // Kiểm tra categoryId có tồn tại thì mới connect (tránh 500)
    let connectCategory: Prisma.ProductCreateInput | {} = {};
    if (d.categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: d.categoryId },
        select: { id: true },
      });
      if (cat) connectCategory = { categoryRel: { connect: { id: cat.id } } };
      // nếu không có category -> bỏ qua, không lỗi
    }

    const baseData = {
      name: d.name,
      price: d.price,              // Int
      image: finalImage,           // DB đang dùng field "image"
      description: d.description ?? null,
      stock: d.stock ?? 0,
      isActive: d.isActive ?? true,
      ...connectCategory,
    } satisfies Omit<Prisma.ProductCreateInput, "slug">;

    // Retry nếu trùng slug
    while (true) {
      const slug = await resolveUniqueSlugFromName(d.name);
      try {
        const product = await prisma.product.create({
          data: { ...baseData, slug },
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            image: true,
            categoryId: true,
            isActive: true,
            createdAt: true,
          },
        });

        // ⬇️ Invalidate cache danh sách/badges sau khi tạo THÀNH CÔNG
        try {
          await bumpProductsCacheVersion();
        } catch (e) {
          console.warn("bump cache failed (ignored):", e);
        }

        return NextResponse.json(
          { ok: true, product },
          { status: 201, headers: noStore }
        );
      } catch (e: any) {
        // slug trùng -> thử lại
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          continue;
        }
        console.error("Create product failed:", e);
        return NextResponse.json(
          { error: "INTERNAL_ERROR", message: e?.message ?? "unknown" },
          { status: 500, headers: noStore }
        );
      }
    }
  } catch (err: any) {
    console.error("Create product failed:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: err?.message ?? "unknown" },
      { status: 500, headers: noStore }
    );
  }
}
