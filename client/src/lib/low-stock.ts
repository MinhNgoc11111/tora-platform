// src/lib/low-stock.ts
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

/** ====== Helpers chung ====== */
function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}
function brandName() {
  return process.env.EMAIL_BRAND_NAME || "Tora Platform";
}
function brandLogo() {
  // URL ảnh logo (PNG/SVG). Có thể để trống nếu chưa có
  // Ví dụ: https://your-cdn/logo.png
  return process.env.EMAIL_LOGO_URL || "";
}
function toRecipients(): string[] {
  return (process.env.ADMIN_ALERT_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** ====== Types ====== */
type Row = {
  id: number;
  name: string;
  sku: string | null;
  stock: number;
  slug: string | null;
};

export type LowStockResult = {
  threshold: number;
  low: Row[];
  out: Row[];
  total: number;
};

/** ====== Lấy dữ liệu low/out-of-stock ====== */
export async function getLowStockData(
  threshold = Number(process.env.LOW_STOCK_THRESHOLD || 5)
): Promise<LowStockResult> {
  const [low, out] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, stock: { gt: 0, lte: threshold } },
      select: { id: true, name: true, sku: true, stock: true, slug: true },
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
      take: 200,
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: 0 } },
      select: { id: true, name: true, sku: true, stock: true, slug: true },
      orderBy: [{ updatedAt: "desc" }],
      take: 200,
    }),
  ]);

  return {
    threshold,
    low,
    out,
    total: low.length + out.length,
  };
}

/** ====== Render HTML Email (đẹp & an toàn cho client email) ====== */
export function renderLowStockEmail(data: LowStockResult): {
  subject: string;
  html: string;
  text: string;
} {
  const base = getBaseUrl();
  const logo = brandLogo();
  const brand = brandName();

  const linkPublic = (r: Row) =>
    `${base}/product/${r.slug ?? r.id}`;
  const linkAdmin = (r: Row) =>
    `${base}/seller/edit/${r.id}`;

  const tableCss =
    "width:100%;border-collapse:collapse;border:1px solid #e5e7eb";
  const thCss =
    "text-align:left;background:#f9fafb;border-bottom:1px solid #e5e7eb;padding:10px;font-weight:600;font-size:14px";
  const tdCss =
    "border-top:1px solid #f1f5f9;padding:10px;font-size:13px;color:#111827";

  const makeRows = (rows: Row[]) =>
    rows
      .map(
        (r) => `
      <tr>
        <td style="${tdCss}">${r.id}</td>
        <td style="${tdCss}">
          <div style="font-weight:600">${r.name}</div>
          <div style="color:#6b7280">SKU: ${r.sku ?? "-"}</div>
          <div style="margin-top:4px">
            <a href="${linkAdmin(r)}" style="color:#2563eb;text-decoration:none">Quản trị</a>
            &nbsp;•&nbsp;
            <a href="${linkPublic(r)}" style="color:#2563eb;text-decoration:none">Xem sản phẩm</a>
          </div>
        </td>
        <td style="${tdCss};font-weight:700">${r.stock}</td>
      </tr>`
      )
      .join("");

  const outSection =
    data.out.length > 0
      ? `
      <h3 style="margin:18px 0 8px 0;font-size:16px">🔴 Hết hàng (${data.out.length})</h3>
      <table role="presentation" style="${tableCss}">
        <thead>
          <tr>
            <th style="${thCss};width:60px">ID</th>
            <th style="${thCss}">Sản phẩm</th>
            <th style="${thCss};width:80px">Tồn</th>
          </tr>
        </thead>
        <tbody>
          ${makeRows(data.out)}
        </tbody>
      </table>`
      : "";

  const lowSection =
    data.low.length > 0
      ? `
      <h3 style="margin:18px 0 8px 0;font-size:16px">🟠 Sắp hết (≤ ${data.threshold}) — ${data.low.length} sản phẩm</h3>
      <table role="presentation" style="${tableCss}">
        <thead>
          <tr>
            <th style="${thCss};width:60px">ID</th>
            <th style="${thCss}">Sản phẩm</th>
            <th style="${thCss};width:80px">Tồn</th>
          </tr>
        </thead>
        <tbody>
          ${makeRows(data.low)}
        </tbody>
      </table>`
      : "";

  const subject =
    data.total === 0
      ? `✅ ${brand} — Không có sản phẩm low-stock`
      : `⚠️ ${brand} — ${data.total} sản phẩm low/out of stock`;

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.55;color:#111827">
    <div style="max-width:720px;margin:0 auto;padding:20px">
      ${logo
      ? `<div style="margin-bottom:12px">
               <img src="${logo}" alt="${brand}" style="height:36px"/>
             </div>`
      : ""
    }
      <h2 style="margin:0 0 8px 0">${brand} — Báo cáo tồn kho</h2>
      <div style="color:#6b7280;margin-bottom:16px">
        Tổng sản phẩm cảnh báo: <strong>${data.total}</strong>
      </div>

      ${outSection}
      ${lowSection}

      ${data.total === 0
      ? `<div style="margin-top:16px;color:#16a34a">Hiện không có sản phẩm nào hết/sắp hết hàng 🎉</div>`
      : ""
    }

      <div style="margin-top:24px;color:#6b7280;font-size:12px">
        Email tự động từ hệ thống ${brand}. 
        <a href="${base}" style="color:#2563eb;text-decoration:none">${base.replace(
      /^https?:\/\//,
      ""
    )}</a>
      </div>
    </div>
  </div>`.trim();

  // Text fallback
  const textLines: string[] = [];
  if (data.out.length) {
    textLines.push(`HẾT HÀNG (${data.out.length}):`);
    data.out.forEach((r) =>
      textLines.push(`- [${r.id}] ${r.name} — tồn=${r.stock}`)
    );
  }
  if (data.low.length) {
    textLines.push(`SẮP HẾT (<=${data.threshold}) (${data.low.length}):`);
    data.low.forEach((r) =>
      textLines.push(`- [${r.id}] ${r.name} — tồn=${r.stock}`)
    );
  }
  if (!textLines.length) textLines.push("Không có sản phẩm cảnh báo.");

  const text = textLines.join("\n");

  return { subject, html, text };
}

/** ====== Gửi email cảnh báo ====== */
export async function sendLowStockAlert(opts?: { preview?: boolean }) {
  const preview = !!opts?.preview;
  const data = await getLowStockData();

  // không gửi mail nếu không có gì
  if (data.total === 0) {
    return { ok: true, skipped: true, ...data };
  }

  const recips = toRecipients();
  if (recips.length === 0) {
    return { ok: false, error: "NO_RECIPIENTS", ...data };
  }

  const { subject, html, text } = renderLowStockEmail(data);

  if (preview) {
    return { ok: true, preview: true, subject, html, text, ...data };
  }

  for (const to of recips) {
    await sendMail({ to, subject, html, text });
  }
  return { ok: true, sent: recips.length, ...data };
}
export const queryLowStock = getLowStockData;
export const sendLowStockEmail = (opts?: { preview?: boolean }) =>
  sendLowStockAlert(opts);
