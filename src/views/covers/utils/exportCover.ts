/**
 * Export a cover SVG element to various formats.
 */

export function exportSvg(svgElement: SVGSVGElement, filename: string): void {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `${filename}.svg`);
}

export async function exportPng(
  svgElement: SVGSVGElement,
  filename: string,
  scale = 2,
): Promise<void> {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  const viewBox = svgElement.getAttribute('viewBox');
  if (!viewBox) throw new Error('SVG must have a viewBox');
  const parts = viewBox.split(/\s+/).map(Number);
  if (parts.length < 4 || parts.some(isNaN)) throw new Error('Invalid viewBox');
  const [, , vw, vh] = parts;

  const width = vw * scale;
  const height = vh * scale;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    // Timeout to prevent hanging if image never loads
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load timed out'));
    }, 15000);

    img.onload = () => {
      clearTimeout(timeout);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Failed to create PNG blob')); return; }
        downloadBlob(blob, `${filename}.png`);
        resolve();
      }, 'image/png');
    };
    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG for PNG export'));
    };
    img.src = url;
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  try {
    a.click();
  } finally {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
