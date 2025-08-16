import { baseLayout, productTable, BRAND, escapeHtml } from "./base";

export function LowStockAlertEmail(input: {
  products: Array<{ id: number|string; name: string; sku?: string|null; stock: number; minStock?: number }>;
}): { subject: string; html: string; text: string } {
  const rows = input.products.map(p => ({
    name: p.name,
    sku: p.sku ?? null,
    stock: p.stock,
    minStock: p.minStock ?? undefined,
    url: `${BRAND.site}/seller/products/${p.id}`
  }));

  const title = "⚠️ Cảnh báo sắp hết hàng";
  const body = `
    <p>Xin chào,</p>
    <p>Các sản phẩm dưới đây đã <strong>chạm ngưỡng tồn thấp</strong>. Hãy kiểm tra và nhập thêm hàng.</p>
    ${productTable(rows)}
    <p style="margin-top:16px">• Trang quản trị: <a href="${BRAND.site}/admin" style="color:${BRAND.color};text-decoration:underline">${escapeHtml(BRAND.site)}/admin</a></p>
  `;
  const html = baseLayout({ title, body });
  const text =
    `${title}\n\n` +
    rows.map(r => `- ${r.name} (SKU: ${r.sku || "-"}) • Tồn: ${r.stock} • Ngưỡng: ${r.minStock ?? "-"}`).join("\n") +
    `\n\nAdmin: ${BRAND.site}/admin`;

  return { subject: "Tora • Low stock alert", html, text };
}
