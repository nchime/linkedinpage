export function safeFilename(name: string, ext: string): string {
  const safe = (name || 'resume').replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_');
  return `${safe}_resume.${ext}`;
}

export function contentDisposition(name: string, ext: string): string {
  const encoded = encodeURIComponent(name || 'resume');
  const ascii = (name || 'resume').replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_');
  return `attachment; filename="${ascii}_resume.${ext}"; filename*=UTF-8''${encoded}_resume.${ext}`;
}
