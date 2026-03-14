/**
 * Convert between JPEG and PNG formats (auto-detects direction).
 * JPG input → PNG output, PNG input → JPG output.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - JPEG or PNG image file
 * @param onProgress - Optional progress callback
 * @returns Converted image file
 *
 * @example
 * const converted = await jpgPng(myJpeg); // → PNG
 */
export async function jpgPng(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Converting ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  const targetFormat = file.type === "image/jpeg" ? "image/png" : "image/jpeg";
  if (targetFormat === "image/jpeg") { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, bitmap.width, bitmap.height); }
  ctx.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: targetFormat, quality: 0.92 });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const ext = targetFormat === "image/jpeg" ? ".jpg" : ".png";
  onProgress(100, "Done");
  return new File([blob], `${baseName}${ext}`, { type: targetFormat });
}
