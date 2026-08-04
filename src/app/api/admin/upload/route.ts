import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/admin';
import { NextResponse } from 'next/server';

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function uploadToCloudinary(buffer: Buffer, filename: string, folder: string) {
  configureCloudinary();

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename.replace(/\.[^.]+$/, ''),
        resource_type: 'image',
        overwrite: false,
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

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ success: false, error: 'Cloudinary ainda nao configurado. Cole uma URL externa.' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder') === 'products' ? 'cafe-store/products' : 'cafe-store/banners';

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    return NextResponse.json({ success: false, error: 'Envie uma imagem valida.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToCloudinary(buffer, `${Date.now()}-${file.name}`, folder);

  return NextResponse.json({ success: true, data: { url }, url });
}
