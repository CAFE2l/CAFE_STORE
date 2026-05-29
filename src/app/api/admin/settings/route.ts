import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SENSITIVE_KEYS = ['mercadoPagoPublicKey', 'mercadoPagoAccessToken'] as const;

type StoreSettingsShape = {
  [key: string]: unknown;
  mercadoPagoPublicKey?: string | null;
  mercadoPagoAccessToken?: string | null;
};

function maskSensitive(settings: StoreSettingsShape | null) {
  if (!settings) return null;
  const masked = { ...settings };
  for (const key of SENSITIVE_KEYS) {
    if (masked[key]) {
      masked[key] = '****';
    }
  }
  return masked;
}

function filterSensitiveBeforeSave(body: Record<string, unknown>) {
  const clean = { ...body };
  for (const key of SENSITIVE_KEYS) {
    if (clean[key] === '****') {
      delete clean[key];
    }
  }
  return clean;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  }

  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'singleton' },
  });

  return NextResponse.json({ success: true, data: maskSensitive(settings as StoreSettingsShape | null) });
}

const STRIP_KEYS: string[] = ['id', 'updatedAt', 'success', 'data'];

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const cleanBody = filterSensitiveBeforeSave(body);

  for (const key of STRIP_KEYS) {
    delete cleanBody[key];
  }

  const settings = await prisma.storeSettings.upsert({
    where: { id: 'singleton' },
    update: cleanBody,
    create: { id: 'singleton', ...cleanBody },
  });

  return NextResponse.json({ success: true, data: maskSensitive(settings as unknown as StoreSettingsShape) });
}
