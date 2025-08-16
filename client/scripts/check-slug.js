// In kết quả: số slug rỗng và các slug trùng
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const nulls = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*) AS c FROM "Product" WHERE slug IS NULL OR slug = \'\''
  );
  console.log('NULL/Empty:', nulls[0]?.c);

  const dupes = await prisma.$queryRawUnsafe(`
    SELECT slug, COUNT(*) c
    FROM "Product"
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING c > 1
  `);
  console.log('Duplicates:');
  console.table(dupes);

  await prisma.$disconnect();
})();
