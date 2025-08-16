import { Redis } from "@upstash/redis";

export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    : null;

/** Helper an toàn: nếu Redis chưa cấu hình / lỗi -> trả fallback */
export async function redisSafe<T>(
  fn: (r: Redis) => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    if (!redis) return fallback;
    return await fn(redis);
  } catch {
    return fallback;
  }
}
// ---- Cache helpers cho seller products ----
export const PRODUCTS_CACHE_VERSION_KEY = "cache:products:v"; // dùng để invalidation theo version

export async function getProductsCacheVersion() {
  if (!redis) return 1;
  return (await redis.get<number>(PRODUCTS_CACHE_VERSION_KEY)) ?? 1;
}

export async function bumpProductsCacheVersion() {
  if (!redis) return;
  await redis.incr(PRODUCTS_CACHE_VERSION_KEY);
}

// key ổn định, tránh dài quá
function stable(q?: string | null) {
  const s = q?.trim() ?? "";
  return Buffer.from(s).toString("base64url").slice(0, 32);
}

export async function makeProductsCacheKey(opts: {
  q?: string | null;
  tab: string;
  page: number;
  perPage: number;
  categoryId?: number | null;
}) {
  const v = await getProductsCacheVersion();
  const qPart = stable(opts.q);
  const cat = opts.categoryId ?? "all";
  return `cache:products:${v}:${opts.tab}:${opts.page}:${opts.perPage}:${cat}:${qPart}`;
}
