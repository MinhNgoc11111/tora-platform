// src/app/api/seller/products/search/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redisSafe, makeProductsCacheKey } from "@/lib/redis";

const LOW_STOCK_THRESHOLD = 5 as const;

// Stopwords rất chung -> coi như không nhập gì (không lọc text)
const STOPWORDS_VI = new Set([
  "san",
  "pham",
  "san pham",
  "hang",
  "sp",
  "product",
  "item",
  "sản",
  "phẩm",
  "sản phẩm",
  "hàng",
]);

/** Fallback contains() (khi không dùng FTS)
 *  LƯU Ý: SQLite không hỗ trợ mode: "insensitive" như Postgres
 */
function buildBaseWhere(q?: string | null, categoryId?: number | null) {
  const where: any = {};
  if (categoryId) where.categoryId = categoryId;
  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { slug: { contains: q } },
    ];
  }
  return where;
}

/** Bỏ dấu + chuẩn hoá cho FTS */
function normalizeNoDiacritics(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
function sanitizeFtsInput(raw: string) {
  const clean = normalizeNoDiacritics(raw);
  const tokens = clean
    .split(" ")
    .filter(Boolean)
    .map((t) => t.replace(/[^a-z0-9_-]/g, "") + "*");
  return tokens.join(" ");
}

/** Lấy id khớp FTS (thử nhiều tên bảng) */
async function ftsMatchIdsOrThrow(q: string): Promise<number[]> {
  const fts = sanitizeFtsInput(q);
  if (!fts) return [];
  const candidates = ["products_fts", "product_fts"];
  for (const tbl of candidates) {
    try {
      const sql = `SELECT rowid AS id FROM ${tbl} WHERE ${tbl} MATCH '${fts}' LIMIT 5000`;
      const rows = await prisma.$queryRawUnsafe<{ id: number }[]>(sql);
      if (Array.isArray(rows)) {
        return rows.map((r) => Number(r.id)).filter((n) => Number.isFinite(n));
      }
    } catch {
      // thử bảng tiếp theo
    }
  }
  throw new Error("FTS_UNAVAILABLE");
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const qRaw = (url.searchParams.get("q") || "").trim();
    const categoryId = url.searchParams.get("categoryId");
    const categoryIdNum = categoryId ? Number(categoryId) : null;

    const tab = (url.searchParams.get("statusTab") ?? "all") as
      | "all"
      | "inStock"
      | "lowStock"
      | "outOfStock"
      | "inactive";

    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const perPage = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("perPage") || "20"))
    );

    // ---- Stopword bypass ----
    const qNorm = normalizeNoDiacritics(qRaw); // "sản phẩm" -> "san pham"
    const isStop = !!qNorm && STOPWORDS_VI.has(qNorm);
    // effectiveQ: chuỗi thật dùng để lọc text; NULL nếu stopword
    let effectiveQ: string | null = isStop ? null : qRaw || null;

    // ---- FTS5 (chỉ khi có effectiveQ) ----
    let matchedIds: number[] | null = null;
    let useFts = !!effectiveQ;

    if (useFts) {
      try {
        matchedIds = await ftsMatchIdsOrThrow(effectiveQ!);
        if (matchedIds.length === 0) {
          // ❗ Không ép fallback contains với chuỗi không match
          // → coi như KHÔNG search text
          useFts = false;
          effectiveQ = null;
          matchedIds = null;
        }
      } catch {
        // FTS không sẵn sàng → fallback contains(effectiveQ)
        useFts = false;
        matchedIds = null;
      }
    }

    // Base where:
    // - Dùng FTS: không truyền q (lọc theo id IN)
    // - Không dùng FTS: truyền effectiveQ (có thể null -> không lọc)
    const base = buildBaseWhere(useFts ? null : effectiveQ, categoryIdNum);
    if (useFts && matchedIds) {
      (base as any).id = { in: matchedIds };
    }

    // ---- Redis cache: key gồm version + tab + trang + effectiveQ + category ----
    const cacheKey = await makeProductsCacheKey({
      q: effectiveQ,
      tab,
      page,
      perPage,
      categoryId: categoryIdNum ?? null,
    });

    // Read-through cache
    const cached = await redisSafe((r) => r.get<any>(cacheKey), null);
    if (cached) {
      return NextResponse.json(cached, { headers: { "x-cache": "HIT" } });
    }

    const tabWhere: any = (() => {
      switch (tab) {
        case "inStock":
          return { ...base, isActive: true, stock: { gt: 0 } };
        case "lowStock":
          return {
            ...base,
            isActive: true,
            stock: { gt: 0, lte: LOW_STOCK_THRESHOLD },
          };
        case "outOfStock":
          return { ...base, isActive: true, stock: { lte: 0 } };
        case "inactive":
          return { ...base, isActive: false };
        default:
          return base;
      }
    })();

    const [items, cAll, cIn, cLow, cOut, cInact] = await prisma.$transaction([
      prisma.product.findMany({
        where: tabWhere,
        orderBy: { updatedAt: "desc" }, // có thể mở rộng theo 'order' query param nếu cần
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          stock: true,
          isActive: true,
          image: true,
          updatedAt: true,
          categoryRel: { select: { id: true, name: true } },
        },
      }),
      prisma.product.count({ where: base }),
      prisma.product.count({
        where: { ...base, isActive: true, stock: { gt: 0 } },
      }),
      prisma.product.count({
        where: {
          ...base,
          isActive: true,
          stock: { gt: 0, lte: LOW_STOCK_THRESHOLD },
        },
      }),
      prisma.product.count({
        where: { ...base, isActive: true, stock: { lte: 0 } },
      }),
      prisma.product.count({ where: { ...base, isActive: false } }),
    ]);

    const totalForTab =
      tab === "inStock"
        ? cIn
        : tab === "lowStock"
        ? cLow
        : tab === "outOfStock"
        ? cOut
        : tab === "inactive"
        ? cInact
        : cAll;

    const payload = {
      items,
      page: {
        page,
        perPage,
        total: totalForTab,
        totalPages: Math.ceil(totalForTab / perPage),
      },
      counts: {
        all: cAll,
        inStock: cIn,
        lowStock: cLow,
        outOfStock: cOut,
        inactive: cInact,
      },
      meta: { lowStockThreshold: LOW_STOCK_THRESHOLD },
    };

    // Set cache (TTL 60s — tuỳ chỉnh)
    await redisSafe((r) => r.set(cacheKey, payload, { ex: 60 }), null);

    return NextResponse.json(payload, { headers: { "x-cache": "MISS" } });
  } catch (e) {
    console.error("seller/products/search error:", e);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
