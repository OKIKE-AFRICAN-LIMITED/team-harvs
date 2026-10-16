import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadResult {
  url: string;
  size: string;
  name: string;
  type: string;
  /** true when the file was stored in Supabase Storage (shared across devices) */
  storedInCloud?: boolean;
}

/**
 * Format raw bytes into human readable format (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Shrinks large photos (phone/camera shots are often 5–10 MB) to a web-friendly
 * JPEG before upload. Non-images, GIFs and SVGs are returned untouched.
 */
export async function compressImage(file: File, maxDimension = 2000, quality = 0.85): Promise<File> {
  if (!file.type.startsWith('image/') || /gif|svg/i.test(file.type)) return file;
  if (file.size < 400 * 1024) return file; // already small

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a local file to Supabase Storage.
 *
 * IMPORTANT: when Supabase is configured we NEVER silently fall back to embedding
 * the file as a base64 data URL in the database. Doing so previously stored
 * 6 MB text blobs in `hero_stream_items.image`, which made the table time out
 * (HTTP 500) and broke syncing for the whole dashboard. Instead we throw a clear
 * error so the UI can tell the user what is wrong.
 */
export async function uploadLocalFile(
  file: File,
  bucketName: 'lookbook' | 'assets' | 'deliverables' = 'assets'
): Promise<UploadResult> {
  const prepared = await compressImage(file);
  const size = formatFileSize(prepared.size);
  const name = file.name;
  const type = prepared.type || file.name.split('.').pop()?.toUpperCase() || 'FILE';

  if (isSupabaseConfigured) {
    const ext = prepared.name.split('.').pop() || 'bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `${bucketName}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, prepared, { cacheControl: '3600', upsert: true, contentType: prepared.type || undefined });

    if (error || !data) {
      const msg = error?.message || 'Unknown storage error';
      const hint = /bucket not found/i.test(msg)
        ? `The "${bucketName}" storage bucket doesn't exist yet. Run supabase/schema.sql in the Supabase SQL Editor.`
        : /row-level security|unauthorized|not allowed/i.test(msg)
          ? 'You need to be signed in as an admin to upload files.'
          : msg;
      throw new Error(`Upload failed: ${hint}`);
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return { url: publicUrlData.publicUrl, size, name, type, storedInCloud: true };
  }

  // Offline / demo mode only (no Supabase configured)
  const url = await readAsDataUrl(prepared);
  return { url, size, name, type, storedInCloud: false };
}
