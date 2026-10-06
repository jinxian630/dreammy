import { NextResponse, type NextRequest } from 'next/server';
import {
  ORDER_SCREENSHOTS_BUCKET,
  SERVICE_IMAGES_BUCKET,
  supabaseAdmin,
} from '@/lib/supabase/server';
import { HttpError, requireRole } from '@/lib/auth/session';
import { MUTATE_ROLES } from '@/lib/auth/roles';

const ALLOWED = new Set([SERVICE_IMAGES_BUCKET, ORDER_SCREENSHOTS_BUCKET]);

/** Create the bucket (public) on first use so no manual dashboard step is needed. */
async function ensureBucket(bucket: string) {
  const sb = supabaseAdmin();
  const { data } = await sb.storage.getBucket(bucket);
  if (!data) {
    await sb.storage.createBucket(bucket, { public: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(MUTATE_ROLES);
    const form = await req.formData();
    const file = form.get('file');
    const bucket = (form.get('bucket') as string) || SERVICE_IMAGES_BUCKET;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!ALLOWED.has(bucket)) {
      return NextResponse.json({ error: 'Unknown bucket' }, { status: 400 });
    }

    await ensureBucket(bucket);

    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const sb = supabaseAdmin();
    const { error } = await sb.storage.from(bucket).upload(path, bytes, {
      contentType: file.type || 'image/png',
      upsert: false,
    });
    if (error) throw new Error(error.message);

    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'Upload failed';
    if (status >= 500) console.error('[admin api] upload', message);
    return NextResponse.json({ error: message }, { status });
  }
}
