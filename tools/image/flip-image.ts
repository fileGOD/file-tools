/**
 * Flip an image horizontally or vertically.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - Image file to flip
 * @param direction - "horizontal" or "vertical" (default: "horizontal")
 * @param onProgress - Optional progress callback
 * @returns Flipped image file
 *
 * @example
 * const flipped = await flipImage(photo, "vertical");
 */
export async function flipImage(
  file: File,
  direction: "horizontal" | "vertical" = "horizontal",
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Flipping ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  if (direction === "horizontal") { ctx.scale(-1, 1); ctx.translate(-bitmap.width, 0); }
  else { ctx.scale(1, -1); ctx.translate(0, -bitmap.height); }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const isJpeg = file.type === "image/jpeg";
  const blob = await canvas.convertToBlob({ type: isJpeg ? "image/jpeg" : "image/png", quality: 0.92 });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-flipped.${isJpeg ? "jpg" : "png"}`, { type: blob.type });
}
