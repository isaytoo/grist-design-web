import type { Editor } from 'grapesjs';

// Warn the user when an embedded image gets large, since base64 data URIs are
// inlined into the HTML (and the saved Grist cell), which bloats the document.
const WARN_BYTES = 1024 * 1024; // 1 MB

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Reads local image files, converts them to base64 data URIs and adds them to
 * the GrapesJS Asset Manager so they are fully self-contained (work in the ZIP
 * export and in Widget Builder without any external hosting).
 */
export async function addImagesAsBase64(
  files: FileList | File[],
  editor: Editor,
  onWarn?: (msg: string) => void,
): Promise<void> {
  const am = editor.AssetManager;
  const images = Array.from(files).filter(f => f.type.startsWith('image/'));
  for (const file of images) {
    if (file.size > WARN_BYTES && onWarn) {
      onWarn(`"${file.name}" : ${(file.size / 1024 / 1024).toFixed(1)} Mo intégré en base64 (fichier lourd).`);
    }
    try {
      const src = await readAsDataURL(file);
      am.add({ type: 'image', src, name: file.name });
    } catch {
      onWarn?.(`Impossible de lire "${file.name}".`);
    }
  }
}
