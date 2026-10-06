/**
 * Client-side helper: upload an image File to Supabase Storage (via the
 * server-only `/api/admin/upload` route) and return its public URL. The URL is
 * then stored in a service `imageKey` or an order screenshot column.
 */
export type UploadBucket = 'service-images' | 'order-screenshots';

export async function uploadImage(file: File, bucket: UploadBucket): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('bucket', bucket);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Upload failed (${res.status})`);
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}
