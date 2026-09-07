/**
 * Descarga de archivos que funciona en dos entornos:
 * - En el visor de Artifact de claude.ai: usa la capacidad `downloads`
 *   (`claude.use("downloads").save`), porque el visor bloquea las descargas
 *   directas por enlace o blob.
 * - En un navegador normal (app local o desplegada): descarga por Blob.
 *
 * Requiere declarar `capabilities: {downloads: true}` al publicar el Artifact.
 */
type DatoDescarga = string | Blob | ArrayBuffer | ArrayBufferView;
type DownloadsNS = { save: (r: { filename: string; data: DatoDescarga }) => Promise<{ status: string }> };

interface ClaudeRuntime {
  use?: (name: string) => Promise<unknown>;
}

export async function descargarArchivo(
  filename: string,
  contenido: DatoDescarga,
  mime = 'text/csv;charset=utf-8;',
): Promise<{ ok: boolean; motivo?: string }> {
  const claude = (window as unknown as { claude?: ClaudeRuntime }).claude;

  // Entorno Artifact: la descarga directa está bloqueada; usar la capacidad.
  if (claude && typeof claude.use === 'function') {
    let downloads: DownloadsNS | null = null;
    try {
      downloads = (await claude.use('downloads')) as DownloadsNS | null;
    } catch {
      downloads = null;
    }
    if (downloads && typeof downloads.save === 'function') {
      try {
        await downloads.save({ filename, data: contenido });
        return { ok: true };
      } catch (e) {
        const code = (e as { code?: string })?.code;
        return { ok: false, motivo: code ?? 'error' }; // p. ej. "declined": el usuario canceló
      }
    }
    return { ok: false, motivo: 'sin_capacidad_descargas' };
  }

  // Navegador normal: descarga por Blob.
  const blob = contenido instanceof Blob ? contenido : new Blob([contenido as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { ok: true };
}
