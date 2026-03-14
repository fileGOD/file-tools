/**
 * Apply a Gaussian blur to an image.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - Image file to blur
 * @param radius - Blur radius in pixels (default: 5)
 * @param onProgress - Optional progress callback
 * @returns Blurred image file
 *
 * @example
 * const blurred = await blurImage(photo, 10);
 */
export async function blurImage(
  file: File,
  radius = 5,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Blurring ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const isJpeg = file.type === "image/jpeg";
  const blob = await canvas.convertToBlob({ type: isJpeg ? "image/jpeg" : "image/png", quality: 0.92 });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-blurred.${isJpeg ? "jpg" : "png"}`, { type: blob.type });
}
