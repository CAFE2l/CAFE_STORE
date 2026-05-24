#!/usr/bin/env node

// Usage:
//   node scripts/create-admin.js user@example.com
// or
//   ADMIN_EMAIL=user@example.com node scripts/create-admin.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  if (!email) {
    console.error('Usage: node scripts/create-admin.js user@example.com\nOr set ADMIN_EMAIL env var.');
    process.exit(1);
  }

  const name = process.env.ADMIN_NAME || 'Admin';

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN', name },
      create: { email, name, role: 'ADMIN' },
    });
    console.log(`User upserted: ${user.email} (role: ${user.role})`);
  } catch (err) {
    console.error('Failed to create/update admin user:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
