/**
 * Resize an image to specified dimensions.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - Image file to resize
 * @param width - Target width in pixels
 * @param height - Target height in pixels
 * @param maintainAspectRatio - Keep proportions (default: true)
 * @param onProgress - Optional progress callback
 * @returns Resized image file
 *
 * @example
 * const resized = await resizeImage(photo, 800, 600);
 */
export async function resizeImage(
  file: File,
  width: number,
  height: number,
  maintainAspectRatio = true,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Resizing ${file.name}...`);
  const bitmap = await createImageBitmap(file);

  let targetW = width;
  let targetH = height;

  if (maintainAspectRatio) {
    const ratio = bitmap.width / bitmap.height;
    if (targetW && !targetH) targetH = Math.round(targetW / ratio);
    else if (targetH && !targetW) targetW = Math.round(targetH * ratio);
    else {
      const scale = Math.min(targetW / bitmap.width, targetH / bitmap.height);
      targetW = Math.round(bitmap.width * scale);
      targetH = Math.round(bitmap.height * scale);
    }
  }

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await canvas.convertToBlob({ type: mimeType, quality: 0.92 });
  onProgress(100, "Done");
  return new File([blob], file.name, { type: mimeType });
}
