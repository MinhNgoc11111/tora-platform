// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUniqueSlugFromName } from "@/lib/slug";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const runtime = "nodejs"; // Prisma cần Node runtime

// ✅ Nếu frontend gửi number/boolean dạng chuỗi thì vẫn parse được
const ProductInput = z.object({
  name: z.string().min(2),
  price: z.coerce.number().int().nonnegative(),
  imageUrl: z.string().url().optional().nullable(),   // ← Đổi thành `image` nếu schema của bạn là `image`
  description: z.string().optional().nullable(),
  categoryId: z.coerce.number().int().optional(),
  stock: z.coerce.number().int().nonnegative().default(0),
  isActive: z.coerce.boolean().default(true),
}).strict();

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = ProductInput.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      price,
      imageUrl,
      description,
      categoryId,
      stock,
      isActive,
    } = parsed.data;

    // Tạo slug duy nhất (lần 1)
    let slug = await resolveUniqueSlugFromName(name);

    // Tạo data cho Prisma (bỏ field undefined)
    const baseData: any = {
      name,
      price,
      description: description ?? null,
      imageUrl: imageUrl ?? null,    // ← Đổi thành `image: imageUrl ?? null` nếu cột DB là `image`
      stock,
      isActive,
      ...(categoryId ? { categoryId } : {}),
    };

    // ✅ Thử create; nếu slug bị trùng do race, retry với slug mới
    while (true) {
      try {
        const product = await prisma.product.create({
          data: { ...baseData, slug },
          select: { id: true, slug: true, name: true },
        });
        return NextResponse.json({ ok: true, product }, { status: 201 });
      } catch (e: unknown) {
        // Unique constraint failed → tạo slug khác và thử lại
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          slug = await resolveUniqueSlugFromName(name);
          continue;
        }
        // Lỗi khác → throw ra ngoài
        throw e;
      }
    }
  } catch (err) {
    console.error("Create product failed:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
