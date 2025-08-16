SELECT slug, COUNT(*) AS c
FROM "Product"
WHERE slug IS NOT NULL
GROUP BY slug
HAVING c > 1;
