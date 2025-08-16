-- Xóa nếu từng tồn tại
DROP TRIGGER IF EXISTS product_ai;
DROP TRIGGER IF EXISTS product_au;
DROP TRIGGER IF EXISTS product_ad;
DROP TABLE IF EXISTS product_fts;

-- Virtual table FTS5, external content -> Product.id
CREATE VIRTUAL TABLE product_fts USING fts5(
  name,
  description,
  sku,
  tokenize='unicode61',
  content='Product',
  content_rowid='id'
);

-- Triggers đồng bộ
CREATE TRIGGER product_ai AFTER INSERT ON Product BEGIN
  INSERT INTO product_fts(rowid, name, description, sku)
  VALUES (new.id, COALESCE(new.name,''), COALESCE(new.description,''), COALESCE(new.sku,''));
END;

CREATE TRIGGER product_au AFTER UPDATE ON Product BEGIN
  DELETE FROM product_fts WHERE rowid = old.id;
  INSERT INTO product_fts(rowid, name, description, sku)
  VALUES (new.id, COALESCE(new.name,''), COALESCE(new.description,''), COALESCE(new.sku,''));
END;

CREATE TRIGGER product_ad AFTER DELETE ON Product BEGIN
  DELETE FROM product_fts WHERE rowid = old.id;
END;

-- Seed lại từ dữ liệu hiện có
INSERT INTO product_fts(rowid, name, description, sku)
SELECT id, COALESCE(name,''), COALESCE(description,''), COALESCE(sku,'')
FROM Product;
