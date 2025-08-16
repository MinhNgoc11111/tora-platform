export const BRAND = {
  name: "Tora",
  color: "#ef4444", // đỏ-cam
  logo: process.env.BRAND_LOGO_URL || "https://via.placeholder.com/120x36?text=Tora",
  site: process.env.APP_PUBLIC_URL || "https://example.com",
  company: process.env.COMPANY_NAME || "Tora Platform",
  address: process.env.COMPANY_ADDRESS || "Tokyo, Japan",
  support: process.env.SUPPORT_EMAIL || "support@example.com",
};

export function baseLayout(opts: { title: string; body: string }) {
  const { title, body } = opts;
  return `
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05)">
          <tr>
            <td style="background:${BRAND.color};padding:16px 20px;">
              <a href="${BRAND.site}" style="text-decoration:none;display:inline-block">
                <img src="${BRAND.logo}" alt="${BRAND.name}" height="36" style="display:block;border:0;outline:0">
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 20px 12px 20px;">
              <h1 style="margin:0 0 8px 0;font-size:18px;color:#111827">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 20px 24px 20px;font-size:14px;line-height:1.6;color:#111827">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px 20px;font-size:12px;color:#6b7280">
              <div>${BRAND.company} • ${BRAND.address}</div>
              <div>Hỗ trợ: <a href="mailto:${BRAND.support}" style="color:#6b7280">${BRAND.support}</a></div>
              <div>© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</div>
            </td>
          </tr>
        </table>
        <div style="font-size:12px;color:#9ca3af;margin-top:12px">
          Bạn nhận email này vì có thiết lập thông báo trong hệ thống ${BRAND.name}.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function productTable(rows: Array<{
  name: string; sku?: string|null; stock: number; minStock?: number; url?: string;
}>) {
  const header = `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
    <thead>
      <tr>
        <th align="left" style="border-bottom:1px solid #e5e7eb;padding:8px">Sản phẩm</th>
        <th align="left" style="border-bottom:1px solid #e5e7eb;padding:8px">SKU</th>
        <th align="right" style="border-bottom:1px solid #e5e7eb;padding:8px">Tồn</th>
        <th align="right" style="border-bottom:1px solid #e5e7eb;padding:8px">Ngưỡng</th>
      </tr>
    </thead>
    <tbody>
  `;
  const body = rows.map(r => `
    <tr>
      <td style="border-bottom:1px solid #f3f4f6;padding:8px">
        ${r.url ? `<a href="${r.url}" style="color:#111827;text-decoration:underline">${escapeHtml(r.name)}</a>` : escapeHtml(r.name)}
      </td>
      <td style="border-bottom:1px solid #f3f4f6;padding:8px;color:#6b7280">${escapeHtml(r.sku || "-")}</td>
      <td align="right" style="border-bottom:1px solid #f3f4f6;padding:8px">${r.stock}</td>
      <td align="right" style="border-bottom:1px solid #f3f4f6;padding:8px">${r.minStock ?? "-"}</td>
    </tr>
  `).join("");
  const footer = `
    </tbody>
  </table>`;
  return header + body + footer;
}

export function escapeHtml(s?: string|null) {
  return (s ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}
