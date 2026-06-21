import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles: RoleName[] = ['Admin', 'Pilgrim', 'MawkibOwner'];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  const pilgrimRole = await prisma.role.findUnique({ where: { name: 'Pilgrim' } });

  if (!adminRole || !pilgrimRole) {
    throw new Error('Roles not found');
  }

  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { mobileNumber: '09120000000' },
    update: {},
    create: {
      fullName: 'مدیر سیستم',
      mobileNumber: '09120000000',
      passwordHash,
      province: 'تهران',
      city: 'تهران',
      roles: {
        create: [{ roleId: adminRole.id }],
      },
    },
  });

  console.log('Seed completed:', { adminId: admin.id });
  console.log('Admin login: 09120000000 / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
