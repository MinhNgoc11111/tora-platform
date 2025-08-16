// scripts/backfill-product-slug.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function slugify(input: string) {
  // Bỏ dấu, chuẩn hoá, thay đ/Đ -> d
  return (input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function backfillEmpty(used: Set<string>) {
  // ⚠️ slug là string bắt buộc → KHÔNG lọc null. Chỉ backfill các bản có slug rỗng.
  const rows = await prisma.product.findMany({
    where: { slug: "" },
    select: { id: true, name: true },
    orderBy: { id: "asc" as const },
  });

  let count = 0;
  for (const r of rows) {
    let base = slugify(r.name);
    if (!base) base = `sp-${r.id}`;
    let candidate = base;
    let i = 2;
    while (used.has(candidate)) candidate = `${base}-${i++}`;

    await prisma.product.update({
      where: { id: r.id },
      data: { slug: candidate },
    });

    used.add(candidate);
    count++;
    console.log(`BF  ${r.id} -> ${candidate}`);
  }
  return count;
}

async function dedupeExisting(used: Set<string>) {
  // Lấy tất cả sản phẩm (slug là string, có thể rỗng) theo id
  const rows = await prisma.product.findMany({
    select: { id: true, slug: true, name: true },
    orderBy: { id: "asc" as const },
  });

  used.clear();
  let changed = 0;

  for (const r of rows) {
    // Làm sạch theo quy tắc mới; nếu slug đang rỗng thì dùng name (hoặc sp-id)
    let candidate = r.slug ? slugify(r.slug) : "";
    if (!candidate) candidate = slugify(r.name) || `sp-${r.id}`;

    if (used.has(candidate)) {
      const base = candidate;
      let i = 2;
      while (used.has(candidate)) candidate = `${base}-${i++}`;
      await prisma.product.update({ where: { id: r.id }, data: { slug: candidate } });
      changed++;
      console.log(`FIX ${r.id}: duplicate -> ${candidate}`);
    } else if (candidate !== r.slug) {
      await prisma.product.update({ where: { id: r.id }, data: { slug: candidate } });
      changed++;
      console.log(`NORM ${r.id}: "${r.slug}" -> "${candidate}"`);
    }

    used.add(candidate);
  }
  return changed;
}

async function main() {
  console.time("backfill-slug");

  // Build tập slug đã dùng (bỏ chuỗi rỗng)
  const existing = await prisma.product.findMany({
    where: { NOT: { slug: "" } },
    select: { slug: true },
  });
  const used = new Set(existing.map((x) => x.slug));

  const filled = await backfillEmpty(used);
  const fixed = await dedupeExisting(used);

  console.log(`\nSummary: backfilled=${filled}, changed=${fixed}`);
  console.timeEnd("backfill-slug");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
