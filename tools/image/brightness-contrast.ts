/**
 * Adjust brightness and contrast of an image.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - Image file to adjust
 * @param brightness - Brightness adjustment -100 to 100 (default: 0)
 * @param contrast - Contrast adjustment -100 to 100 (default: 0)
 * @param onProgress - Optional progress callback
 * @returns Adjusted image file
 *
 * @example
 * const adjusted = await adjustBrightnessContrast(photo, 20, -10);
 */
export async function adjustBrightnessContrast(
  file: File,
  brightness = 0,
  contrast = 0,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Adjusting ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  const b = 1 + brightness / 100;
  const c = 1 + contrast / 100;
  ctx.filter = `brightness(${b}) contrast(${c})`;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const isJpeg = file.type === "image/jpeg";
  const blob = await canvas.convertToBlob({ type: isJpeg ? "image/jpeg" : "image/png", quality: 0.92 });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-adjusted.${isJpeg ? "jpg" : "png"}`, { type: blob.type });
}
