import { toPng } from 'html-to-image';

export async function generateShareImage(element: HTMLElement): Promise<string> {
  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: false
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate card image:', err);
    throw err;
  }
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function shareOrDownload(dataUrl: string, filename: string, title: string, text: string): Promise<boolean> {
  if (navigator.share && navigator.canShare) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text,
          files: [file]
        });
        return true;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed, downloading instead:', err);
      } else {
        return false;
      }
    }
  }

  // Fallback: download directly
  downloadDataUrl(dataUrl, filename);
  return true;
}
