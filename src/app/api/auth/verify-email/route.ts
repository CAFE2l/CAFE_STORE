import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailVerificationSchema } from '@/lib/validations';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = emailVerificationSchema.safeParse({
    email: url.searchParams.get('email'),
    token: url.searchParams.get('token'),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL('/login?verified=invalid', request.url));
  }

  const email = parsed.data.email.toLowerCase();
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token: parsed.data.token,
      },
    },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.redirect(new URL('/login?verified=expired', request.url));
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: parsed.data.token,
        },
      },
    }),
  ]);

  return NextResponse.redirect(new URL('/login?verified=1', request.url));
}
