import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { requireAdmin } from '@/lib/admin';

export const runtime = 'nodejs';

const maxImageSize = 8 * 1024 * 1024;
const maxVideoSize = 30 * 1024 * 1024;
const maxFiles = 4;

const imageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

const videoTypes = new Map([
  ['video/mp4', 'mp4'],
  ['video/webm', 'webm'],
  ['video/quicktime', 'mov'],
]);

function hasCloudinaryConfig() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function uploadToCloudinary(buffer: Buffer, type: string) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const resourceType = videoTypes.has(type) ? 'video' : 'image';

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'cafe-store/media',
        resource_type: resourceType,
        format: resourceType === 'video' ? undefined : 'webp',
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error('Upload invalido.'));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

async function uploadToPublicFolder(buffer: Buffer, extension: string) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'media');
  await mkdir(uploadsDir, { recursive: true });

  const filename = `media-${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadsDir, filename), buffer);

  return `/uploads/media/${filename}`;
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  }

  const formData = await request.formData();
  const files = formData.getAll('files').filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }

  if (files.length > maxFiles) {
    return NextResponse.json({ success: false, error: 'Envie no maximo 4 arquivos.' }, { status: 400 });
  }

  const urls: string[] = [];

  for (const file of files) {
    const imageExtension = imageTypes.get(file.type);
    const videoExtension = videoTypes.get(file.type);

    if (!imageExtension && !videoExtension) {
      return NextResponse.json(
        { success: false, error: 'Envie apenas imagens (JPG, PNG, WEBP, GIF) ou videos (MP4, WEBM, MOV).' },
        { status: 400 },
      );
    }

    const sizeLimit = videoExtension ? maxVideoSize : maxImageSize;
    if (file.size > sizeLimit) {
      return NextResponse.json(
        { success: false, error: videoExtension ? 'Videos devem ter no maximo 30MB.' : 'Imagens devem ter no maximo 8MB.' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      let url: string | null = null;
      if (hasCloudinaryConfig()) {
        url = await uploadToCloudinary(buffer, file.type).catch(() => null);
      }
      url ??= await uploadToPublicFolder(buffer, imageExtension ?? videoExtension!);
      urls.push(url);
    } catch {
      return NextResponse.json({ success: false, error: 'Falha ao enviar arquivo.' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, urls });
}
