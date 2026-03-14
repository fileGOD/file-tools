/**
 * Convert an image between JPEG, PNG, and WebP formats.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - Image file to convert
 * @param targetFormat - Target MIME type: "image/jpeg", "image/png", or "image/webp"
 * @param quality - Output quality 0-1 for lossy formats (default: 0.92)
 * @param onProgress - Optional progress callback
 * @returns Converted image file
 *
 * @example
 * const webp = await convertImage(jpegFile, "image/webp");
 */
export type ImageFormat = "image/jpeg" | "image/png" | "image/webp";

const FORMAT_EXT: Record<ImageFormat, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  quality = 0.92,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Converting ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  if (targetFormat !== "image/png") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, bitmap.width, bitmap.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: targetFormat, quality });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}${FORMAT_EXT[targetFormat]}`, { type: targetFormat });
}
