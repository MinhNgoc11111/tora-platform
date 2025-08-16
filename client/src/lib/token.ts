import { createHash, randomBytes } from "crypto";

export const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 phút

export function newToken() {
  return randomBytes(32).toString("hex"); // 64 hex
}

export function hashToken(t: string) {
  return createHash("sha256").update(t).digest("hex"); // 64 hex
}
