/**
 * Invert all colors in an image.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - Image file to invert
 * @param onProgress - Optional progress callback
 * @returns Color-inverted image file
 *
 * @example
 * const inverted = await invertColors(photo);
 */
export async function invertColors(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Inverting ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.filter = "invert(1)";
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const isJpeg = file.type === "image/jpeg";
  const blob = await canvas.convertToBlob({ type: isJpeg ? "image/jpeg" : "image/png", quality: 0.92 });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-inverted.${isJpeg ? "jpg" : "png"}`, { type: blob.type });
}
