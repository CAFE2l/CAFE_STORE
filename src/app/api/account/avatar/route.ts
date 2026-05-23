import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
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

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: result.secure_url },
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch {
    return NextResponse.json({ success: false, error: 'Falha ao fazer upload.' }, { status: 500 });
  }
}
