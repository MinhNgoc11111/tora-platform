import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'ngoctnut1994@gmail.com';
  const plainPassword = '12345678';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Ngọc Minh',
      email,
      password: hashedPassword,
    },
  });

  console.log('✅ Tạo user thành công:', user);
}

main().finally(() => prisma.$disconnect());
