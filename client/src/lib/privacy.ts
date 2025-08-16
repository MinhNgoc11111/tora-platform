export function maskEmail(email: string, visible = 5, mask = "****") {
  if (!email || !email.includes("@")) return "";
  const [localRaw, domain] = email.split("@");
  const local = localRaw || "";
  const v = Math.max(0, Math.min(visible, local.length));
  // Nếu local quá ngắn, vẫn thêm mask để tránh lộ độ dài
  const maskedLocal = `${local.slice(0, v)}${mask}`;
  return `${maskedLocal}@${domain}`;
}
