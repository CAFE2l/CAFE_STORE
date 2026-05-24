import { z } from 'zod';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Email invalido.' }, { status: 400 });

  const { email, name } = parsed.data;

  try {
    // upsert user: if exists, set role to ADMIN; otherwise create admin user (no password)
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN', name: name ?? undefined },
      create: { email, name: name ?? 'Admin', role: 'ADMIN' },
    });

    try {
      revalidatePath('/admin/users');
    } catch (e) {
      // ignore if not in next runtime
    }

    return NextResponse.json({ success: true, data: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Failed to promote user to admin:', err);
    return NextResponse.json({ success: false, error: 'Falha ao promover usuario.' }, { status: 500 });
  }
}
