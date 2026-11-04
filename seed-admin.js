const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
(async () => {
  const prisma = new PrismaClient();
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured');
    }
    const hash = await bcrypt.hash(password, 12);
    const admin = await prisma.admin.upsert({
      where: { email },
      update: { passwordHash: hash, name: 'Admin' },
      create: { email, passwordHash: hash, name: 'Admin' }
    });
    console.log('admin=' + JSON.stringify({ id: admin.id, email: admin.email, name: admin.name }));
  } finally {
    await prisma.$disconnect();
  }
})();
