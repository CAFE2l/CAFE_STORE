import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getBaseUrl, sendVerificationEmail, sendWelcomeEmail } from '@/lib/email';
import { registerSchema } from '@/lib/validations';

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      {
        success: false,
        error: parsedBody.error.issues[0]?.message ?? 'Dados invalidos.',
      },
      { status: 400 },
    );
  }

  const email = parsedBody.data.email.toLowerCase();
  const cpf = onlyDigits(parsedBody.data.cpf);
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { cpf }],
    },
    select: {
      id: true,
      email: true,
      cpf: true,
    },
  });

  if (existingUser) {
    return Response.json(
      {
        success: false,
        error: existingUser.email === email ? 'Este e-mail ja esta cadastrado.' : 'Este CPF ja esta cadastrado.',
      },
      { status: 409 },
    );
  }

  const password = await hash(parsedBody.data.password, 12);
  const verificationToken = randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const verificationUrl = `${getBaseUrl()}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
  const user = await prisma.user.create({
    data: {
      name: parsedBody.data.name,
      email,
      cpf,
      phone: parsedBody.data.phone,
      password,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: verificationToken,
      expires: verificationExpires,
    },
  });

  await Promise.allSettled([
    sendWelcomeEmail(email, user.name),
    sendVerificationEmail(email, verificationUrl),
  ]);

  return Response.json(
    {
      success: true,
      data: {
        ...user,
        devVerificationUrl: process.env.RESEND_API_KEY ? undefined : verificationUrl,
      },
    },
    { status: 201 },
  );
}
