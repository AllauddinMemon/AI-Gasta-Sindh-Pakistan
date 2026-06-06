/**
 * Database seed — creates an admin and a sample teacher with one claim.
 * Run from /server:  npm run prisma:seed
 *
 * seed.js lives in /database which has no node_modules, so we resolve
 * @prisma/client and bcryptjs from the sibling /server/node_modules.
 */
const path = require('path');
const { createRequire } = require('module');
const serverRequire = createRequire(path.join(__dirname, '..', 'server', 'package.json'));

const { PrismaClient } = serverRequire('@prisma/client');
const bcrypt = serverRequire('bcryptjs');

// Load DATABASE_URL etc. from the server's .env (node doesn't auto-load it)
serverRequire('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

const prisma = new PrismaClient();

async function main() {
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

  const adminPassword = await bcrypt.hash('Admin@12345', rounds);
  const teacherPassword = await bcrypt.hash('Teacher@12345', rounds);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gasta.gov' },
    update: {},
    create: {
      name: 'GASTA Administrator',
      email: 'admin@gasta.gov',
      phone: '+920000000000',
      cnic: '00000-0000000-0',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@gasta.gov' },
    update: {},
    create: {
      name: 'Ayesha Khan',
      email: 'teacher@gasta.gov',
      phone: '+923001234567',
      cnic: '42101-1234567-8',
      passwordHash: teacherPassword,
      role: 'TEACHER',
    },
  });

  const existing = await prisma.claim.findFirst({ where: { userId: teacher.id } });
  if (!existing) {
    await prisma.claim.create({
      data: {
        category: 'MEDICAL',
        title: 'Hospitalization reimbursement',
        hospitalName: 'City General Hospital',
        amount: 45000.0,
        incidentDate: new Date('2026-05-20'),
        notes: 'Discharge summary attached. 3-day admission for dengue.',
        status: 'PENDING',
        userId: teacher.id,
      },
    });
  }

  console.log('Seed complete:');
  console.log('  Admin   -> admin@gasta.gov / Admin@12345');
  console.log('  Teacher -> teacher@gasta.gov / Teacher@12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
