/**
 * Rotate an image 90° clockwise.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - Image file to rotate
 * @param onProgress - Optional progress callback
 * @returns Rotated image file
 *
 * @example
 * const rotated = await rotateImage(photo);
 */
export async function rotateImage(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Rotating ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.height, bitmap.width);
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((90 * Math.PI) / 180);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  bitmap.close();
  const isJpeg = file.type === "image/jpeg";
  const blob = await canvas.convertToBlob({ type: isJpeg ? "image/jpeg" : "image/png", quality: 0.92 });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-rotated.${isJpeg ? "jpg" : "png"}`, { type: blob.type });
}
