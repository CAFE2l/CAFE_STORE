import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { requireAdmin } from '@/lib/admin';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'categories');

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mimeType] ?? 'jpg';
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ success: false, error: 'Formulário inválido.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: 'Formato não suportado. Use JPG, PNG ou WEBP.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, error: 'Arquivo muito grande. Máximo 5 MB.' },
      { status: 400 },
    );
  }

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const ext = getExtension(file.type);
  const filename = `${randomUUID()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const url = `/uploads/categories/${filename}`;
  return NextResponse.json({ success: true, url });
}

export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  }

  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url || !url.startsWith('/uploads/categories/')) {
    return NextResponse.json({ success: false, error: 'URL inválida.' }, { status: 400 });
  }

  const filename = path.basename(url);
  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    const { unlink } = await import('fs/promises');
    if (existsSync(filepath)) await unlink(filepath);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao remover arquivo.' }, { status: 500 });
  }
}
