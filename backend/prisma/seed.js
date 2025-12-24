const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email_tenantId: { email: 'super@admin.com', tenantId: null } },
    update: {},
    create: {
      email: 'super@admin.com',
      password,
      role: 'super_admin',
      tenantId: null
    }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
