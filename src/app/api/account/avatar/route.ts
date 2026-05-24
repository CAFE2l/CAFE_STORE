import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const maxAvatarSize = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

function hasCloudinaryConfig() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

async function uploadToCloudinary(buffer: Buffer) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'cafe-store/avatars',
        format: 'webp',
        transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as { secure_url: string });
      },
    );
    stream.end(buffer);
  });

  return result.secure_url;
}

async function uploadToPublicFolder(buffer: Buffer, extension: string) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  await mkdir(uploadsDir, { recursive: true });

  const filename = `avatar-${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadsDir, filename), buffer);

  return `/uploads/avatars/${filename}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return NextResponse.json({ success: false, error: 'Envie uma imagem JPG, PNG, WEBP ou GIF.' }, { status: 400 });
  }

  if (file.size > maxAvatarSize) {
    return NextResponse.json({ success: false, error: 'A imagem deve ter no maximo 5MB.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    let imageUrl: string | null = null;

    if (hasCloudinaryConfig()) {
      imageUrl = await uploadToCloudinary(buffer).catch(() => null);
    }

    imageUrl ??= await uploadToPublicFolder(buffer, extension);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ success: true, url: imageUrl });
  } catch {
    return NextResponse.json({ success: false, error: 'Falha ao fazer upload.' }, { status: 500 });
  }
}
