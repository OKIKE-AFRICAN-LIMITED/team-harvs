/**
 * Robust cross-browser & mobile file downloader.
 * Handles base64 data URLs, Supabase Storage cross-origin files, blob URLs, and external links.
 */
export async function downloadFile(url: string, suggestedFilename?: string): Promise<boolean> {
  if (!url || url.trim() === '' || url === '#') {
    alert('No download file or link has been uploaded for this resource yet.');
    return false;
  }

  const safeFilename = sanitizeFilename(suggestedFilename || 'studio-asset');

  // Case 1: Base64 Data URL (e.g. data:application/pdf;base64,...)
  // Mobile Chrome blocks top-frame navigation to data: URLs; converting to Blob is essential.
  if (url.startsWith('data:')) {
    try {
      const commaIndex = url.indexOf(',');
      if (commaIndex === -1) throw new Error('Invalid data URL');
      const header = url.substring(0, commaIndex);
      const base64Data = url.substring(commaIndex + 1);
      const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      
      triggerBrowserDownload(blobUrl, safeFilename);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return true;
    } catch (err) {
      console.error('Failed to parse base64 data URL for download:', err);
      // Fallback
    }
  }

  // Case 2: Blob URL
  if (url.startsWith('blob:')) {
    triggerBrowserDownload(url, safeFilename);
    return true;
  }

  // Case 3: Remote HTTP / HTTPS URL (including Supabase Storage)
  // Cross-origin URLs ignore the HTML5 <a download> attribute. Fetching the file as a Blob
  // transforms it into a local same-origin resource so the phone or desktop browser triggers
  // a genuine file download dialog with the designated filename.
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      triggerBrowserDownload(blobUrl, safeFilename);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return true;
    }
  } catch (fetchErr) {
    console.warn('Cross-origin direct blob fetch failed, falling back to direct tab/window:', fetchErr);
  }

  // Case 4: Final fallback for CORS-locked external cloud links (e.g. Google Drive, Dropbox)
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('download', safeFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Fallback download failed:', err);
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }
}

/**
 * Triggers anchor click for a blob/same-origin URL
 */
function triggerBrowserDownload(href: string, filename: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Ensures clean filename with appropriate extension
 */
function sanitizeFilename(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return clean.length > 0 ? clean : 'download';
}
