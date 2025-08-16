-- Các index phục vụ list + count theo tab
CREATE INDEX IF NOT EXISTS idx_product_isActive_stock
  ON "Product"(isActive, stock);

CREATE INDEX IF NOT EXISTS idx_product_isActive_updatedAt
  ON "Product"(isActive, updatedAt);

CREATE INDEX IF NOT EXISTS idx_product_categoryId_updatedAt
  ON "Product"(categoryId, updatedAt);

-- Duyệt theo thời gian chung (list mặc định)
CREATE INDEX IF NOT EXISTS idx_product_updatedAt
  ON "Product"(updatedAt);

-- (tuỳ chọn) nếu còn dùng contains fallback theo tên/slug ở quy mô nhỏ:
-- CREATE INDEX IF NOT EXISTS idx_product_name ON "Product"(name);
-- CREATE INDEX IF NOT EXISTS idx_product_slug ON "Product"(slug);

-- Cập nhật thống kê để planner chọn index tốt hơn
PRAGMA analysis_limit=400;
PRAGMA optimize;
