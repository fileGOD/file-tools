/**
 * Convert between JPEG and WebP formats (auto-detects direction).
 * JPG input → WebP output, WebP input → JPG output.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - JPEG or WebP image file
 * @param onProgress - Optional progress callback
 * @returns Converted image file
 *
 * @example
 * const converted = await jpgWebp(myJpeg); // → WebP
 */
export async function jpgWebp(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Converting ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  const targetFormat = file.type === "image/jpeg" ? "image/webp" : "image/jpeg";
  if (targetFormat === "image/jpeg") { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, bitmap.width, bitmap.height); }
  ctx.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: targetFormat, quality: 0.92 });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const ext = targetFormat === "image/jpeg" ? ".jpg" : ".webp";
  onProgress(100, "Done");
  return new File([blob], `${baseName}${ext}`, { type: targetFormat });
}
