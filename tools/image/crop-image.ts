/**
 * Crop an image to a centered square.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - Image file to crop
 * @param onProgress - Optional progress callback
 * @returns Cropped image file
 *
 * @example
 * const cropped = await cropImage(photo);
 */
export async function cropImage(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Cropping ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height);
  const x = Math.max(0, (bitmap.width - size) / 2);
  const y = Math.max(0, (bitmap.height - size) / 2);
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, x, y, size, size, 0, 0, size, size);
  bitmap.close();
  const isJpeg = file.type === "image/jpeg";
  const blob = await canvas.convertToBlob({ type: isJpeg ? "image/jpeg" : "image/png", quality: 0.92 });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-cropped.${isJpeg ? "jpg" : "png"}`, { type: blob.type });
}
