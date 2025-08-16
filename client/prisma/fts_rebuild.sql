PRAGMA foreign_keys=OFF;

-- Xoá trigger FTS cũ nếu có
DROP TRIGGER IF EXISTS product_ai;
DROP TRIGGER IF EXISTS product_ad;
DROP TRIGGER IF EXISTS product_au;

-- Xoá bảng FTS cũ và tạo lại với unicode61 + remove_diacritics=2
DROP TABLE IF EXISTS products_fts;
CREATE VIRTUAL TABLE products_fts USING fts5(
  name, slug, sku, description,
  content='Product', content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);

-- Nạp dữ liệu từ Product
INSERT INTO products_fts(rowid, name, slug, sku, description)
SELECT id, COALESCE(name,''), COALESCE(slug,''), COALESCE(sku,''), COALESCE(description,'')
FROM "Product";

-- Trigger đồng bộ FTS
CREATE TRIGGER product_ai AFTER INSERT ON "Product" BEGIN
  INSERT INTO products_fts(rowid, name, slug, sku, description)
  VALUES (new.id, COALESCE(new.name,''), COALESCE(new.slug,''), COALESCE(new.sku,''), COALESCE(new.description,''));
END;

CREATE TRIGGER product_ad AFTER DELETE ON "Product" BEGIN
  DELETE FROM products_fts WHERE rowid = old.id;
END;

CREATE TRIGGER product_au AFTER UPDATE ON "Product" BEGIN
  UPDATE products_fts
  SET name = COALESCE(new.name,''),
      slug = COALESCE(new.slug,''),
      sku  = COALESCE(new.sku,''),
      description = COALESCE(new.description,'')
  WHERE rowid = new.id;
END;

PRAGMA foreign_keys=ON;
