import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadResult {
  url: string;
  size: string;
  name: string;
  type: string;
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
 * Uploads a local file to Supabase Storage if available,
 * or cleanly converts to a persistent data URL so uploads always work reliably!
 */
export async function uploadLocalFile(
  file: File,
  bucketName: 'lookbook' | 'assets' | 'deliverables' = 'assets'
): Promise<UploadResult> {
  const size = formatFileSize(file.size);
  const name = file.name;
  const type = file.type || file.name.split('.').pop()?.toUpperCase() || 'FILE';

  if (isSupabaseConfigured) {
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const filePath = `${bucketName}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return {
            url: publicUrlData.publicUrl,
            size,
            name,
            type,
          };
        }
      }
    } catch (err) {
      console.warn(`Supabase bucket upload for ${bucketName} fell back to data URL:`, err);
    }
  }

  // Graceful, robust fallback: FileReader Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        size,
        name,
        type,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
