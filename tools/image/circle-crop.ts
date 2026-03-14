/**
 * Crop an image into a circle (transparent outside).
 * Output is always PNG to preserve transparency. Runs in the browser.
 *
 * @param file - Image file to circle-crop
 * @param onProgress - Optional progress callback
 * @returns Circle-cropped PNG file
 *
 * @example
 * const avatar = await circleCrop(photo);
 */
export async function circleCrop(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Circle-cropping ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height);
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  const offsetX = (bitmap.width - size) / 2;
  const offsetY = (bitmap.height - size) / 2;
  ctx.drawImage(bitmap, offsetX, offsetY, size, size, 0, 0, size, size);
  bitmap.close();
  const blob = await canvas.convertToBlob({ type: "image/png" });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-circle.png`, { type: "image/png" });
}
