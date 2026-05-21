import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';

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
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return Response.json(
      {
        success: false,
        error: 'Este e-mail ja esta cadastrado.',
      },
      { status: 409 },
    );
  }

  const password = await hash(parsedBody.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsedBody.data.name,
      email,
      password,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return Response.json(
    {
      success: true,
      data: user,
    },
    { status: 201 },
  );
}
