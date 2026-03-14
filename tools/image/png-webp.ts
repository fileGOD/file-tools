/**
 * Convert between PNG and WebP formats (auto-detects direction).
 * PNG input → WebP output, WebP input → PNG output.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - PNG or WebP image file
 * @param onProgress - Optional progress callback
 * @returns Converted image file
 *
 * @example
 * const converted = await pngWebp(myPng); // → WebP
 */
export async function pngWebp(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Converting ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  const targetFormat = file.type === "image/png" ? "image/webp" : "image/png";
  ctx.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: targetFormat, quality: 0.92 });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const ext = targetFormat === "image/png" ? ".png" : ".webp";
  onProgress(100, "Done");
  return new File([blob], `${baseName}${ext}`, { type: targetFormat });
}
