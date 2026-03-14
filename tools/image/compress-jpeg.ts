/**
 * Compress a JPEG image by re-encoding at a lower quality.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - JPEG image file to compress
 * @param quality - Compression quality 0-1 (default: 0.7)
 * @param onProgress - Optional progress callback
 * @returns Compressed JPEG file
 *
 * @example
 * const compressed = await compressJpeg(input, 0.75);
 * console.log(`Reduced from ${input.size} to ${compressed.size} bytes`);
 */
export async function compressJpeg(
  file: File,
  quality = 0.7,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Compressing ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
