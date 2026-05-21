import { requireAdmin } from '@/lib/admin';
import { createSignedUpload } from '@/lib/cloudinary';

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as { folder?: string };

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return Response.json({ success: false, error: 'Cloudinary ainda nao configurado.' }, { status: 503 });
  }

  return Response.json({
    success: true,
    data: createSignedUpload(body.folder),
  });
}
