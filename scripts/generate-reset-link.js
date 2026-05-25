#!/usr/bin/env node

// Usage:
//   node scripts/generate-reset-link.js you@example.com
// or
//   RESET_EMAIL=you@example.com node scripts/generate-reset-link.js
//
// This script creates a one-hour password reset token in the verificationToken
// table and prints the reset URL so you can open it locally (useful when email
// sending isn't configured).

const { randomBytes } = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || process.env.RESET_EMAIL;
  if (!email) {
    console.error('Usage: node scripts/generate-reset-link.js user@example.com');
    process.exit(1);
  }

  const emailLower = String(email).toLowerCase();
  const identifier = `password-reset:${emailLower}`;
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  try {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token,
        expires,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl.replace(/\/+$/, '')}/reset-password?email=${encodeURIComponent(emailLower)}&token=${token}`;

    console.log('Password reset link (valid for 1 hour):');
    console.log(resetUrl);
  } catch (err) {
    console.error('Failed to generate reset link:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
