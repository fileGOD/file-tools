/**
 * Add a repeating diagonal text watermark to an image.
 * Runs entirely in the browser — no server upload.
 *
 * @param file - Image file to watermark
 * @param text - Watermark text (default: "WATERMARK")
 * @param opacity - Watermark opacity 0-1 (default: 0.3)
 * @param onProgress - Optional progress callback
 * @returns Watermarked image file
 *
 * @example
 * const watermarked = await addWatermark(photo, "CONFIDENTIAL", 0.2);
 */
export async function addWatermark(
  file: File,
  text = "WATERMARK",
  opacity = 0.3,
  onProgress: (progress: number, statusText: string) => void = () => {}
): Promise<File> {
  onProgress(10, `Watermarking ${file.name}...`);
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#FFFFFF";
  const fontSize = Math.max(canvas.width, canvas.height) / 15;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 4);
  const step = fontSize * 3;
  for (let y = -canvas.height; y < canvas.height * 2; y += step) {
    for (let x = -canvas.width; x < canvas.width * 2; x += step) {
      ctx.fillText(text, x - canvas.width / 2, y - canvas.height / 2);
    }
  }
  ctx.restore();

  const isJpeg = file.type === "image/jpeg";
  const blob = await canvas.convertToBlob({ type: isJpeg ? "image/jpeg" : "image/png", quality: 0.92 });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  onProgress(100, "Done");
  return new File([blob], `${baseName}-watermarked.${isJpeg ? "jpg" : "png"}`, { type: blob.type });
}
