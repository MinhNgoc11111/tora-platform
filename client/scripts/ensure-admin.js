/* scripts/ensure-admin.cjs */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function ensureAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || "toraplatform@gmail.com";
  const plain = process.env.SEED_ADMIN_PASSWORD || "Admin123!"; // ⚠️ đổi sau khi đăng nhập
  const role  = process.env.SEED_ADMIN_ROLE || "ADMIN";
  const forceReset = process.env.SEED_FORCE_RESET === "1"; // đặt "1" nếu muốn ép đặt lại password

  // hash nếu cần
  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash =
    forceReset || !existing?.password
      ? await bcrypt.hash(plain, 10)
      : existing.password;

  const createData = { email, name: "Tora Admin", role, password: passwordHash };
  const updateData = { role };
  if (forceReset) updateData.password = passwordHash;

  // Thử phiên bản có emailVerified (nếu model có cột này)
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { ...updateData, emailVerified: new Date() },
      create: { ...createData, emailVerified: new Date() },
    });
    console.log("✅ Admin ensured:", { id: user.id, email: user.email, role: user.role });
    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log("🔐 Mật khẩu tạm:", plain);
    }
    return;
  } catch (e) {
    // Nếu model không có cột emailVerified, retry không set trường này
    console.warn("ℹ️ Retry without emailVerified:", e?.code || e?.message || e);
    const user = await prisma.user.upsert({
      where: { email },
      update: updateData,
      create: createData,
    });
    console.log("✅ Admin ensured (no emailVerified):", { id: user.id, email: user.email, role: user.role });
    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log("🔐 Mật khẩu tạm:", plain);
    }
  }
}

ensureAdmin()
  .catch((e) => {
    console.error("❌ Seed admin failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
