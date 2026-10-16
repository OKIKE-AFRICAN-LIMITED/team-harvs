import { supabase, isSupabaseConfigured } from './supabase';
import { uploadLocalFile } from './fileUpload';

/**
 * One-time repair for media that was previously embedded directly in database rows
 * as base64 `data:` URLs (multi-MB text blobs). Those rows make queries time out,
 * which stops the public site and dashboard from loading the data.
 *
 * For each affected row we: download the embedded data → compress → upload to
 * Supabase Storage → replace the column with the short public URL.
 * Rows are fetched ONE AT A TIME so the oversized table can still be read.
 */

interface RepairTarget {
  table: string;
  column: string;
  bucket: 'lookbook' | 'assets' | 'deliverables';
}

const TARGETS: RepairTarget[] = [
  { table: 'hero_stream_items', column: 'image', bucket: 'lookbook' },
  { table: 'lookbook_works', column: 'image', bucket: 'lookbook' },
  { table: 'creative_assets', column: 'download_url', bucket: 'assets' },
  { table: 'member_submissions', column: 'pdf_url', bucket: 'deliverables' },
];

export interface RepairProgress {
  checked: number;
  fixed: number;
  failed: number;
  message: string;
}

async function dataUrlToFile(dataUrl: string, baseName: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  const ext = (blob.type.split('/')[1] || 'bin').replace('jpeg', 'jpg').split('+')[0];
  return new File([blob], `${baseName}.${ext}`, { type: blob.type });
}

export async function repairEmbeddedMedia(onProgress?: (p: RepairProgress) => void): Promise<RepairProgress> {
  const progress: RepairProgress = { checked: 0, fixed: 0, failed: 0, message: 'Starting…' };
  const report = (message: string) => {
    progress.message = message;
    onProgress?.({ ...progress });
  };

  if (!isSupabaseConfigured) {
    report('Supabase is not configured.');
    return progress;
  }

  for (const target of TARGETS) {
    const { data: rows, error } = await supabase.from(target.table).select('id');
    if (error || !rows) continue;

    for (const row of rows as { id: string }[]) {
      progress.checked += 1;
      report(`Checking ${target.table.replace(/_/g, ' ')} (${progress.checked})…`);

      const { data: single, error: rowErr } = await supabase
        .from(target.table)
        .select(target.column)
        .eq('id', row.id)
        .maybeSingle();

      const value: string | undefined = (single as any)?.[target.column];
      if (rowErr || !value || !value.startsWith('data:')) continue;

      try {
        report(`Moving image for "${row.id}" to storage…`);
        const file = await dataUrlToFile(value, `${target.table}-${row.id}`);
        const uploaded = await uploadLocalFile(file, target.bucket);

        const update: Record<string, string> = { [target.column]: uploaded.url };
        if (target.table === 'member_submissions') update.link = uploaded.url;

        const { error: updErr } = await supabase.from(target.table).update(update).eq('id', row.id);
        if (updErr) throw new Error(updErr.message);
        progress.fixed += 1;
      } catch (err: any) {
        console.warn(`Repair failed for ${target.table}/${row.id}:`, err);
        progress.failed += 1;
        progress.message = err?.message || 'Repair failed';
      }
    }
  }

  report(
    progress.failed > 0
      ? `Fixed ${progress.fixed}, ${progress.failed} could not be fixed. ${progress.message}`
      : progress.fixed > 0
        ? `Done! ${progress.fixed} image(s) moved to storage.`
        : 'Everything looks healthy — nothing needed fixing.'
  );
  return progress;
}
