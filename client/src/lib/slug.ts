// src/lib/slug.ts
import "server-only";

import crypto from "crypto"; // ❗ Không dùng file này ở route/page runtime='edge'
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const RESERVED = new Set([
  "new", "edit", "create", "admin", "seller", "api", "cart", "checkout",
  "orders", "login", "signup", "signin", "verify", "settings"
]);

const DEFAULT_MAX_LEN = 80;

/** Chuẩn hoá ASCII */
export function slugifyBase(s: string) {
  return (s || "")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Hash ngắn làm fallback */
function shortHash(s: string, len = 6) {
  return crypto.createHash("md5").update(s).digest("hex").slice(0, len);
}

/** Gắn hậu tố nhưng giữ tổng độ dài */
function withSuffix(base: string, i: number, maxLen = DEFAULT_MAX_LEN) {
  const suffix = `-${i}`;
  const room = Math.max(1, maxLen - suffix.length);
  const head = base.length > room ? base.slice(0, room).replace(/-+$/, "") : base;
  return `${head}${suffix}`;
}

/** slugify an toàn */
export function slugifySafe(s: string, maxLen = DEFAULT_MAX_LEN) {
  let out = slugifyBase(s);
  if (out.length > maxLen) out = out.slice(0, maxLen).replace(/-+$/, "");
  if (!out) return "";
  if (RESERVED.has(out)) out = withSuffix(out, 2, maxLen);
  return out;
}

/** Tạo slug duy nhất khi CREATE */
export async function resolveUniqueSlugFromName(name: string, maxLen = DEFAULT_MAX_LEN) {
  let base = slugifySafe(name, maxLen);
  if (!base) base = `sp-${shortHash(name)}`;
  let candidate = base;
  let i = 2;
  while (await prisma.product.findFirst({ where: { slug: candidate }, select: { id: true } })) {
    candidate = withSuffix(base, i++, maxLen);
  }
  return candidate;
}

/** Tạo slug duy nhất khi UPDATE (nếu cho phép đổi slug) */
export async function resolveUniqueSlugFromNameForUpdate(
  name: string,
  productId: number,
  maxLen = DEFAULT_MAX_LEN
) {
  let base = slugifySafe(name, maxLen);
  if (!base) base = `sp-${productId}`;
  let candidate = base;
  let i = 2;
  while (
    await prisma.product.findFirst({
      where: { slug: candidate, NOT: { id: productId } },
      select: { id: true },
    })
  ) {
    candidate = withSuffix(base, i++, maxLen);
  }
  return candidate;
}

/**
 * Tạo sản phẩm an toàn trước race-condition:
 * - KHÔNG spread `data` tùy ý
 * - Map đúng các field theo schema của bạn
 * - Retry khi dính unique slug (P2002)
 *
 * Schema Product (trích):
 *   image String          // ⬅️ bắt buộc
 *   slug  String @unique
 *   sku   String? @unique
 *   stock Int    @default(0)
 *   isActive Boolean @default(true)
 *   categoryId Int?
 *   categoryRel Category? @relation(fields: [categoryId], references: [id])
 */
export async function createProductSafely(
  data: {
    name: string;
    price: number;
    image: string;                // ⬅️ REQUIRED theo schema
    description?: string | null;
    sku?: string | null;
    stock?: number;
    isActive?: boolean;
    categoryId?: number | null;   // nếu truyền, sẽ connect category
  },
  maxLen = DEFAULT_MAX_LEN
) {
  const base = slugifySafe(data.name, maxLen) || `sp-${shortHash(data.name)}`;
  let i = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const slug = i === 1 ? base : withSuffix(base, i++, maxLen);
    try {
      const createData: Prisma.ProductCreateInput = {
        name: data.name,
        price: data.price,
        image: data.image,                               // ⬅️ KHÔNG để null
        description: data.description ?? null,
        slug,
        ...(data.sku ? { sku: data.sku } : {}),
        stock: data.stock ?? 0,
        isActive: data.isActive ?? true,
        ...(data.categoryId
          ? { categoryRel: { connect: { id: data.categoryId } } }
          : {}),
      };

      return await prisma.product.create({
        data: createData,
        select: { id: true, name: true, slug: true },
      });
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        // slug hoặc sku trùng → thử suffix tiếp
        continue;
      }
      throw e;
    }
  }
}
