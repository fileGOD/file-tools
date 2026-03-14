/**
 * Re-encode a PNG image through the browser's Canvas API.
 * Strips metadata and may reduce file size. Runs in the browser.
 *
 * @param file - PNG image file to compress
 * @param onProgress - Optional progress callback
 * @returns Re-encoded PNG file
 *
 * @example
 * const compressed = await compressPng(input);
 */
export async function compressPng(
  file: File,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Compressing ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: "image/png" });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}.png`, { type: "image/png" });
}
