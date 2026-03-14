/**
 * Convert an SVG file to a PNG image.
 * Runs in the browser using the DOM Image element.
 *
 * @param file - SVG file to convert
 * @param scale - Render scale factor (default: 2 for retina)
 * @param onProgress - Optional progress callback
 * @returns PNG image file
 *
 * @example
 * const png = await svgToPng(mySvg, 3);
 */
export async function svgToPng(
  file: File,
  scale = 2,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Converting ${file.name}...`);
  const svgText = await file.text();
  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load SVG"));
    image.src = url;
  });
  URL.revokeObjectURL(url);

  const width = (img.naturalWidth || 300) * scale;
  const height = (img.naturalHeight || 150) * scale;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to export PNG"))), "image/png");
  });

  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}.png`, { type: "image/png" });
}
