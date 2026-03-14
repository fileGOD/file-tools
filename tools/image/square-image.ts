/**
 * Pad an image to a perfect square with a background color.
 * Centers the original image on a square canvas. Runs in the browser.
 *
 * @param file - Image file to make square
 * @param bgColor - Background color for padding (default: "#FFFFFF")
 * @param onProgress - Optional progress callback
 * @returns Square PNG image file
 *
 * @example
 * const square = await squareImage(photo, "#000000");
 */
export async function squareImage(
  file: File,
  bgColor = "#FFFFFF",
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Making square ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const size = Math.max(bitmap.width, bitmap.height);
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);
  const offsetX = (size - bitmap.width) / 2;
  const offsetY = (size - bitmap.height) / 2;
  ctx.drawImage(bitmap, offsetX, offsetY);
  bitmap.close();
  const blob = await canvas.convertToBlob({ type: "image/png" });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-square.png`, { type: "image/png" });
}
