import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

function assertIranLocationsFile() {
  const filePath = join(__dirname, '..', 'data', 'iran-locations.json');

  if (!existsSync(filePath)) {
    throw new Error(
      'Missing backend/data/iran-locations.json — province/city lists depend on this file',
    );
  }

  const parsed = JSON.parse(readFileSync(filePath, 'utf-8')) as unknown;

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Invalid backend/data/iran-locations.json');
  }

  console.log(`Iran locations file OK (${parsed.length} provinces)`);
}

async function main() {
  assertIranLocationsFile();

  const roles: RoleName[] = ['Admin', 'Pilgrim', 'MawkibOwner', 'HonoraryServant'];

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
