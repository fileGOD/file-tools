/**
 * Strip all metadata from an image by re-encoding through Canvas.
 * Removes EXIF, GPS, camera info, etc. Runs in the browser.
 *
 * @param file - Image file to clean
 * @param onProgress - Optional progress callback
 * @returns Clean image file with no metadata
 *
 * @example
 * const clean = await stripMetadata(photo);
 */
export async function stripMetadata(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Stripping metadata from ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const isJpeg = file.type === "image/jpeg";
  const blob = await canvas.convertToBlob({ type: isJpeg ? "image/jpeg" : "image/png", quality: 0.92 });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-clean.${isJpeg ? "jpg" : "png"}`, { type: blob.type });
}
