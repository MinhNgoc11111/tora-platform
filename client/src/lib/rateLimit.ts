// Đơn giản: giới hạn theo key (ip+email). 1 lần / 60s, tối đa 5 lần / 24h
type Bucket = { hits: number[]; dayCount: number; dayResetAt: number };
const store = new Map<string, Bucket>();

export function getClientIp(req: Request) {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export function rateLimit(
  key: string,
  { windowMs = 60_000, maxPerWindow = 1, dailyCap = 5 }: { windowMs?: number; maxPerWindow?: number; dailyCap?: number } = {}
) {
  const now = Date.now();
  const b = store.get(key) ?? { hits: [], dayCount: 0, dayResetAt: now + 86_400_000 };
  // reset day
  if (now >= b.dayResetAt) {
    b.dayCount = 0;
    b.dayResetAt = now + 86_400_000;
    b.hits = [];
  }
  // filter window
  b.hits = b.hits.filter(ts => now - ts < windowMs);

  if (b.hits.length >= maxPerWindow) {
    const retryAfter = windowMs - (now - b.hits[0]);
    store.set(key, b);
    return { ok: false, retryAfter };
  }
  if (b.dayCount >= dailyCap) {
    const retryAfter = b.dayResetAt - now;
    store.set(key, b);
    return { ok: false, retryAfter };
  }

  b.hits.push(now);
  b.dayCount += 1;
  store.set(key, b);
  return { ok: true as const };
}
